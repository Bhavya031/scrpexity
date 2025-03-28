import { NextResponse } from "next/server";
import { GenerationConfig, GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import { ScrapybaraClient } from 'scrapybara';
import { bashTool, computerTool, editTool } from 'scrapybara/tools';
import { anthropic } from 'scrapybara/anthropic';
import { chromium } from 'playwright';
import { BROWSER_SYSTEM_PROMPT } from 'scrapybara/prompts';
import * as fs from 'fs';
import { z } from 'zod';

const apiKey = process.env.GEMINI_API_KEY;
const SCRAPYBARA_API_KEY = process.env.SCRAPYBARA_API_KEY;

const ScrapeSchema = z.object({
    link: z.string().optional(),
    content: z.array(z.string())
});

type Scrape = z.infer<typeof ScrapeSchema>;

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        if (!apiKey || !SCRAPYBARA_API_KEY) {
            return NextResponse.json({ enhancedQuery: query });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model: GenerativeModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite",
            systemInstruction: `<ROLE>
You are an expert Search Query Optimization Specialist tasked with generating precise, high-impact search queries that extract the most relevant and valuable information from search engines. Your primary goal is to craft search terms that cut through noise and directly target the most meaningful results.correct grammer if needed.
</ROLE>`,
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
                    "Search Term": {
                        type: "string",
                    },
                },
                required: ["Search Term"],
            },
        };
        const chatSession = model.startChat({
            generationConfig: generationConfig as GenerationConfig,
            history: [],
        });

        const result = await chatSession.sendMessage(query);
        const responseText = result.response.text();

        let optimizedQuery: { "Search Term": string };

        try {
            optimizedQuery = JSON.parse(responseText);
        } catch (e) {
            const extractedQuery = responseText.includes("SEARCH TERM:")
                ? responseText.split("SEARCH TERM:")[1].split("\n")[0].trim()
                : query;
            optimizedQuery = { "Search Term": extractedQuery };
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                controller.enqueue(encoder.encode(JSON.stringify({ step: 1, enhancedQuery: optimizedQuery["Search Term"] }) + '\n'));

                const client = new ScrapybaraClient({ apiKey: SCRAPYBARA_API_KEY });
                const instance = await client.startUbuntu({ timeoutHours: 1 });
                const streamUrlResponse = await instance.getStreamUrl();
                const streamUrl = streamUrlResponse.streamUrl;
                console.log(`Stream URL: ${streamUrl}`);

                const browserStartResponse = await instance.browser.start();
                const cdpUrl = browserStartResponse.cdpUrl;
                const browser = await chromium.connectOverCDP(cdpUrl);
                const context = await browser.newContext({ viewport: { width: 1030, height: 700 } });
                const page = await context.newPage();
                const anthropicModel = anthropic();

                await page.goto("https://duckduckgo.com/");
                await client.act({
                    model: anthropicModel,
                    tools: [bashTool(instance), computerTool(instance), editTool(instance)],
                    system: BROWSER_SYSTEM_PROMPT,
                    prompt: `I've loaded DuckDuckGo for you. All you have to do is enter this query: ${optimizedQuery["Search Term"]}, then press Enter. Don't search from Chrome's address bar, which takes you to Google's search results. Use DuckDuckGo's search bar instead. After that result is loaded stop and do nothing.`,
                    onStep: (step) => { console.log(step.text); },
                });
                controller.enqueue(encoder.encode(JSON.stringify({ step: 2, message: "step 2 done" }) + '\n'));

                let successCount = 0;
                const lastLink: (string | null)[] = [null];
                const allResults: Scrape[] = [];

                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        console.log("all links:", JSON.stringify(lastLink))
                        await client.act({
                            model: anthropicModel,
                            tools: [bashTool(instance), computerTool(instance), editTool(instance)],
                            system: BROWSER_SYSTEM_PROMPT,
                            prompt: `Search result is already loaded. First, analyze the link to make sure it aligns with our search result—avoid links that are about the topic but have a very different context or are just index pages (like news channels listing articles on one case); only after confirming this, open the non-ad, not yet opened link in a new tab using Control + Click, then go to that tab by clicking on it, and stop—your job is done. If there is already a page loaded (before you click any link), close the current page and return to the main page to open another not yet opened link; avoid reopening the last link ${JSON.stringify(lastLink)} (if it says none, it means no links have been clicked yet, so scroll if you have to). If you see a link at the bottom of the page that is hidden behind the bottom taskbar or a black transparent overlay, scroll up a little to bring it into view, then continue with your task.`,
                            onStep: (step) => { console.log(step.text); },
                        });
                        const scrapResult = await client.act({
                            model: anthropicModel,
                            tools: [bashTool(instance), computerTool(instance), editTool(instance)],
                            system: BROWSER_SYSTEM_PROMPT,
                            prompt: `page is already loaded Scrape the entire page content: Get all details from the page. don't Scroll to the end of the page, limit scrolling to avoid excessive content, use pagedw(page down) key to scroll faster don't use mouse. When browsing a webpage, do not continue indefinitely. Your goal is to extract a maximum of **3 valuable content sections** from the page, relevant to the query: "${optimizedQuery["Search Term"]}". - A **"valuable content section"** is a clearly written portion of the page (such as a paragraph, answer block, or summary) that contains useful information directly related to the search query. - You may scroll the page **up to 5 times total** to look for these sections. - Once **3 valuable sections** are found, stop immediately — even if fewer than 5 scrolls have occurred. - If **after 5 scrolls** you have not found 3 valuable sections, stop and return only what you have (even if it's 0, 1, or 2). - Do **not** capture ads, navigation menus, unrelated links, user comments, or repetitive content Only keep sections that provide **direct, factual, or insightful information** useful for answering the query. If it is a PDF, then zoom out a little bit to get the content. Also, if it is a PDF, use arrow keys or page down to go to the next page. Don't use mouse scroll. Keep the original content format, prioritizing unique content. Exclude general information that doesn't add value. this is the only page you are going to scrape no need to go back stop with one page Please structure your output with only these fields: - link: the URL of the current page - content: an array of text content from the page`,
                            schema: ScrapeSchema,
                            onStep: (step) => { console.log(step.text); },
                        });

                        const scrap = scrapResult.output;
                        console.log("Scraped data received");

                        if (scrap) {
                            allResults.push(scrap);

                            if (scrap.link) {
                                lastLink.push(scrap.link);
                                console.log("Current page link:", scrap.link);
                                controller.enqueue(encoder.encode(JSON.stringify({ step: 3, link: scrap.link }) + '\n'));
                            }

                            if (scrap.content) {
                                console.log(`Total content blocks: ${scrap.content.length}`);
                                controller.enqueue(encoder.encode(JSON.stringify({ step: 3, contentBlocks: scrap.content.length }) + '\n'));
                            }
                        }
                        await client.act({
                            model: anthropicModel,
                            tools: [bashTool(instance), computerTool(instance), editTool(instance)],
                            system: BROWSER_SYSTEM_PROMPT,
                            prompt: `go back to search page by closing this tab not the whole window which will be duckduckgo search result which can be seen in left side of our current tab use control + w to close current tab`,
                            onStep: (step) => { console.log(step.text); },
                        });

                        successCount += 1;
                        if (successCount === 3) {
                            break;
                        }
                    } catch (e) {
                        console.log(`Attempt ${attempt + 1} failed: ${e}`);
                        controller.enqueue(encoder.encode(JSON.stringify({ step: 3, error: `Attempt ${attempt + 1} failed: ${e}` }) + '\n'));
                    }
                }

                console.log(`Total scraped pages: ${allResults.length}`);

                try {
                    const summaryModel = genAI.getGenerativeModel({
                        model: "gemini-2.0-flash-lite",
                        systemInstruction: `You are a multi-agent assistant. Your task is to summarize the content collected from multiple web links based on a user's query. Follow these strict rules: 1. Use only the content provided to generate your answer. 2. Do not hallucinate or add external information. 3. Format your output using markdown-style sections and bullet points when appropriate. 4. At the end of any sentence or paragraph where information is drawn from a source, cite the source in the format [1], [2], etc. 5. At the end of the answer, include a "Citations" section mapping the numbered citations to their full URLs. 6. If multiple sources are used in one point, list them like [1][3][4]. 7. The final answer should be informative, well-structured, and human-readable. Input: - \`query\`: The user’s original question. - \`content\`: A list of web pages, each with \`link\` and \`content\`. Expected format: - Proper markdown headings and subheadings - Bullet points for clarity - Inline citation markers like [1], [2], etc. - A “Citations” section at the bottom mapping numbers to URLs`,
                    });
                    const summaryChat = summaryModel.startChat({
                        generationConfig: { temperature: 1, topP: 0.95, topK: 40, maxOutputTokens: 8192, responseMimeType: "text/plain" },
                        history: [],
                    });
                    const inputToGemini = JSON.stringify({ query: optimizedQuery["Search Term"], content: allResults });
                    console.log("summrizer input:", inputToGemini)
                    const summaryResult = await summaryChat.sendMessage(inputToGemini);
                    const summaryText = summaryResult.response.text();
                    controller.enqueue(encoder.encode(JSON.stringify({ step: 4, summary: summaryText }) + '\n'));
                    fs.writeFileSync("summary.json", summaryText);
                    console.log("Summarized answer written to summary.md");
                } catch (err) {
                    console.error("Error generating summary with Gemini:", err);
                    controller.enqueue(encoder.encode(JSON.stringify({ step: 4, error: `Error generating summary with Gemini: ${err}` }) + '\n'));
                }

                try {
                    console.log("Search completed. Keeping browser open for 5 seconds to view results...");
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } catch (e) {
                    console.log("Early termination requested...");
                } finally {
                    fs.writeFileSync("output.json", JSON.stringify(allResults, null, 2));
                    await browser.close();
                    await instance.stop();
                    console.log("Instance stopped.");
                    controller.enqueue(encoder.encode(JSON.stringify({ step: 5, message: "Instance stopped and results saved." }) + '\n'));
                    controller.close();
                }
            },
        });

        return new NextResponse(stream);
    } catch (error) {
        console.error("Error enhancing search:", error);
        return NextResponse.json({ error: "Failed to enhance search" }, { status: 500 });
    }
}