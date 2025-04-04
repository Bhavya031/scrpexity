import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ScrapybaraClient } from "scrapybara";
import { bashTool, computerTool, editTool } from "scrapybara/tools";
import { anthropic, UBUNTU_SYSTEM_PROMPT } from "scrapybara/anthropic";
import { chromium } from "playwright";
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const ScrapeSchema = z.object({
  link: z.string().optional(),
  content: z.array(z.string()),
});

type Scrape = z.infer<typeof ScrapeSchema>;

export async function POST(request: Request) {
  const encoder = new TextEncoder();

  try {
    const { query, searchId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Using the default user ID you provided
    const user_id = "172af0e5-ea8b-4f32-877c-dc9f37bd2300";

    const stream = new ReadableStream({
      async start(controller) {
        const SCRAPYBARA_API_KEY = process.env.SCRAPYBARA_API_KEY || "";
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

        const client = new ScrapybaraClient({ apiKey: SCRAPYBARA_API_KEY });
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-lite",
          systemInstruction: `You are an expert Search Query Optimization Specialist tasked with generating precise, high-impact search queries. correct grammer if you have to.`,
        });

        const generationConfig = {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              "Search Term": { type: "string" },
            },
            required: ["Search Term"],
          } as any,
        };
        const chatSession: ChatSession = model.startChat({
          generationConfig,
          history: [],
        });

        // Step 1: Enhance query with Gemini
        const geminiQueryResult = await chatSession.sendMessage(query);
        const responseText = geminiQueryResult.response.text()
        const optimizedQuery = JSON.parse(responseText);
        const enhancedQuery = optimizedQuery["Search Term"];
        console.log("enhanced query:", enhancedQuery)
        
        // Use upsert with conflict handling on both user_id and query
        await supabase.from("searches").upsert([
          {
            searchId,
            user_id,
            query,
            enhanced_query: enhancedQuery,
          }
        ], { onConflict: "user_id,query" });
        
        controller.enqueue(encoder.encode(JSON.stringify({ step: 1, enhancedQuery }) + '\n'));
        const instance = await client.startUbuntu({ timeoutHours: 1 });
        const streamUrlResponse = await instance.getStreamUrl();
        const streamUrl = streamUrlResponse.streamUrl;
        // Step 2: Search with Scrapybara
        controller.enqueue(encoder.encode(JSON.stringify({ step: 2, message: "Searching initiated" }) + '\n'));


        const { cdpUrl } = await instance.browser.start();
        const browser = await chromium.connectOverCDP(cdpUrl);
        const context = await browser.newContext({ viewport: { width: 1030, height: 700 } });
        const page = await context.newPage();
        const anthro = anthropic({name: "claude-3-7-sonnet-20250219"});

        await page.goto("https://duckduckgo.com/");
        await client.act({
          model: anthro,
          tools: [bashTool(instance), computerTool(instance), editTool(instance)],
          system: UBUNTU_SYSTEM_PROMPT,
          prompt: `DuckDuckGo is already loaded. All you have to do is enter this query: ${enhancedQuery}, then press Enter. Don't search from Chrome's address bar, which takes you to Google's search results. Use DuckDuckGo's search bar instead. After that result is loaded stop and do nothing`,
          onStep: (step) => console.log(step.text),
        });
        console.log("step 2 done");
        const lastLink: (string | null)[] = [null];
        const allResults: Scrape[] = [];

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await client.act({
              model: anthro,
              tools: [bashTool(instance), computerTool(instance), editTool(instance)],
              system: UBUNTU_SYSTEM_PROMPT,
              prompt: `Search result is already loaded. First, analyze the link to make sure it aligns with our search result—avoid links that are about the topic but have a very different context or are just index pages (like news channels listing articles on one case); only after confirming this, open the non-ad, not yet opened link in a new tab using Control + Click, then go to that tab by clicking on it, and stop—your job is done. If there is already a page loaded (before you click any link), close the current page and return to the main page to open another not yet opened link; avoid reopening the last link ${JSON.stringify(lastLink)} (if it says none, it means no links have been clicked yet, so scroll if you have to). If you see a link at the bottom of the page that is hidden behind the bottom taskbar or a black transparent overlay, scroll up a little to bring it into view, then continue with your task`,
              onStep: (step) => console.log(step.text),
            });
            console.log("step 3.1 done") 
            const result = await client.act({
              model: anthro,
              tools: [bashTool(instance), computerTool(instance), editTool(instance)],
              system: UBUNTU_SYSTEM_PROMPT,
              prompt: `page is already loaded
          
          Scrape the entire page content:
          Get all details from the page.
          don't Scroll to the end of the page, limit scrolling to avoid excessive content, use pagedw(page down) key to scroll faster don't use mouse.
          When browsing a webpage, do not continue indefinitely. Your goal is to extract a maximum of **3 valuable content sections** from the page, relevant to the query: "${enhancedQuery}".

          - A **"valuable content section"** is a clearly written portion of the page (such as a paragraph, answer block, or summary) that contains useful information directly related to the search query.
          - You may scroll the page **up to 5 times total** to look for these sections.
          - Once **3 valuable sections** are found, stop immediately — even if fewer than 5 scrolls have occurred.
          - If **after 5 scrolls** you have not found 3 valuable sections, stop and return only what you have (even if it's 0, 1, or 2).
          - Do **not** capture ads, navigation menus, unrelated links, user comments, or repetitive content.

          Only keep sections that provide **direct, factual, or insightful information** useful for answering the query.
          If it is a PDF, then zoom out a little bit to get the content.
          Also, if it is a PDF, use arrow keys or page down to go to the next page. Don't use mouse scroll.
          Keep the original content format, prioritizing unique content. Exclude general information that doesn't add value.
          this is the only page you are going to scrape no need to go back stop with one page 
          
          Please structure your output with only these fields:
          - link: the URL of the current page
          - content: an array of text content from the page
 `,
              schema: ScrapeSchema,
              onStep: (step) => console.log(step.text),
            });
            console.log("step 3.2 done")
            const scrap = result.output;
            if (scrap) {
              allResults.push(scrap);
              if (scrap.link) lastLink.push(scrap.link);
              console.log(JSON.stringify(lastLink))
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    step: 3,
                    link: scrap.link ?? "",
                    contentBlocks: scrap.content.length,
                  }) + "\n"
                )
              );
            }
            console.log("step 3.3 done")
            await client.act({
              model: anthro,
              tools: [bashTool(instance), computerTool(instance), editTool(instance)],
              system: UBUNTU_SYSTEM_PROMPT,
              prompt: `go back to search page by closing this tab not the whole window which will be duckduckgo search result which can be seen in left side of our current tab use control + w to close current tab`,
              onStep: (step) => console.log(step.text),
            });

            if (allResults.length >= 3) break;
          } catch (err) {
            console.error(`Attempt ${attempt + 1} failed`, err);
          }
        }
        
        // Update with proper user_id
        await supabase.from("searches").update({
          sources: allResults,
        }).eq("query", query).eq("user_id", user_id);
        
        // Step 4: Summarize using Gemini
        controller.enqueue(encoder.encode(JSON.stringify({ step: 4, loading: true }) + "\n"));

        const summarizer = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-lite",
          systemInstruction: `Summarize multiple web links  with proper citations.
Create clean HTML markup with Tailwind CSS classes for a [TOPIC] information card that I can paste directly into my React component. Do not include any React component structure, imports, or export statements - I only need the HTML portion.

Format the content with these citation requirements:
1. Add superscript citation numbers after sentences requiring references
2. Format citations as: <a href="[URL]" className="text-[#ee4399] no-underline hover:underline"><sup>[NUMBER]</sup></a>
3. Use exactly the color #ee4399 for all citation links
4. Include a "References" section at the bottom with numbered entries
5. Each reference should include the number, source title, and URL

Apply these Tailwind CSS styling requirements:
- Use mb-6 for paragraph spacing
- Use font-bold for headings and key terms
- Format bulleted lists appropriately
- Design for a black background with white text (bg-black text-white)

Please provide ONLY the HTML markup - no React component wrapper, no imports, no exports. Just the HTML content I can paste directly into my existing component's return statement.

Example of desired citation format:
"Quantum computing harnesses quantum mechanical phenomena <a href="https://example.com" className="text-[#ee4399] no-underline hover:underline"><sup>1</sup></a>."

Example of desired reference format:
<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">References</h2>
  <ol className="list-decimal pl-5">
    <li><a href="https://example.com" className="text-[#ee4399] no-underline hover:underline">Title of Reference</a></li>
  </ol>
</div>`,
        });

        const sumChat = summarizer.startChat({
          generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
          },
          history: [],
        });

        const finalInput = JSON.stringify({ query: enhancedQuery, content: allResults });
        const finalResult = await sumChat.sendMessage(finalInput);
        const summaryText = finalResult.response.text();
        console.log("step 4 done")
        
        // Update with proper user_id
        await supabase.from("searches").update({
          summary: summaryText,
          completed_at: new Date(),
          completed: true,
        }).eq("query", query).eq("user_id", user_id);        
        controller.enqueue(encoder.encode(JSON.stringify({ step: 4, summary: summaryText, loading: false }) + '\n'));

        // Cleanup
        await browser.close();
        await instance.stop();
        controller.close();
      },
    });

    return new NextResponse(stream);
  } catch (err) {
    console.error("Failed API:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}