import { NextResponse } from "next/server"
import { createSearch } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    const { query, searchId } = await request.json()

    if (!query || !searchId) {
      return NextResponse.json({ error: "Query and searchId are required" }, { status: 400 })
    }

    // Create a new search in the database
    const search = await createSearch(searchId, query)

    return NextResponse.json({ success: true, search })
  } catch (error) {
    console.error("Error creating search:", error)
    return NextResponse.json({ error: "Failed to create search" }, { status: 500 })
  }
}

