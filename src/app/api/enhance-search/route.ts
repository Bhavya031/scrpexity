import { NextResponse } from "next/server"
import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai"

// Ensure this environment variable is defined
const apiKey = process.env.GEMINI_API_KEY

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined, returning original query")
      return NextResponse.json({ enhancedQuery: query })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: `<ROLE>
You are an expert Search Query Optimization Specialist tasked with generating precise, high-impact search queries that extract the most relevant and valuable information from search engines. Your primary goal is to craft search terms that cut through noise and directly target the most meaningful results.
</ROLE>
<TASK_SCOPE>
Responsibilities:

Create highly targeted search queries with maximum precision
Capture the full intent of the user's information need
Develop strategies to extract the most relevant search results
Optimize query construction for different types of information
Minimize irrelevant or noisy search outcomes
</TASK_SCOPE>

<INSTRUCTION_FORMAT>
Output Structure:

SEARCH TERM: Primary query capturing core search intent
OPTIONAL MODIFIER: Contextual filter (when critically beneficial)
STRATEGIC CONSIDERATIONS: Specific approach to query refinement
</INSTRUCTION_FORMAT>

<CONSTRAINTS>
Critical Guidelines:
1. Prioritize clarity and directness in search terms
2. Use site tags or filters only when they demonstrably improve results
3. Avoid over-complication of search queries
4. Adapt query strategy to specific information domains
5. Minimize unnecessary modifiers that reduce search breadth
</CONSTRAINTS>
<EXAMPLES>
Effective Query Generation:
Technical Research Example:
SEARCH TERM: "machine learning neural network optimization techniques"
OPTIONAL MODIFIER: site:*.edu (if academic sources are crucial)
Specialized Topic Example:
SEARCH TERM: "rare manuscript preservation conservation methods"
STRATEGIC APPROACH: Use precise terminology to narrow results
Broad Information Gathering:
SEARCH TERM: "sustainable urban infrastructure design principles"
STRATEGIC CONSIDERATIONS: Balance specificity with comprehensive coverage
</EXAMPLES>
<OUTPUT_REQUIREMENTS>
Query Generation Must:

Deliver a single, focused search term
Capture maximum relevant information
Use precise, domain-specific language
Maintain flexibility in search approach
Ensure high potential for valuable results
Consider strategic use of site tags or filters only when absolutely necessary
Prioritize clean, direct search queries
</OUTPUT_REQUIREMENTS>`,
    })

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
    }

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    })

    const result = await chatSession.sendMessage(query)
    const responseText = result.response.text()

    try {
      // Try to parse the JSON response
      const jsonResponse = JSON.parse(responseText)
      return NextResponse.json({
        enhancedQuery: jsonResponse["Search Term"] || query,
        fullResponse: jsonResponse,
      })
    } catch (e) {
      // If parsing fails, return the raw text
      return NextResponse.json({
        enhancedQuery: responseText.includes("SEARCH TERM:")
          ? responseText.split("SEARCH TERM:")[1].split("\n")[0].trim()
          : query,
        fullResponse: responseText,
      })
    }
  } catch (error) {
    console.error("Error enhancing search:", error)
    return NextResponse.json({ error: "Failed to enhance search" }, { status: 500 })
  }
}

