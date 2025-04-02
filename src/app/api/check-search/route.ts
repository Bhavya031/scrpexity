// src/app/api/check-search/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    // Extract the search ID from the URL search parameters
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!searchId) {
      return NextResponse.json({ error: "Search ID is required" }, { status: 400 });
    }

    // Use provided user ID or fall back to default
    const user_id = userId || "172af0e5-ea8b-4f32-877c-dc9f37bd2300";

    // Query the database for the search with the given ID belonging to this user
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .eq("searchId", searchId)
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error fetching search:", error);
      
      // Check if the error is because the search wasn't found
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Search not found for this user" }, { status: 404 });
      }
      
      return NextResponse.json({ error: "Failed to fetch search data" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Search not found" }, { status: 404 });
    }

    // Return the search data
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to check search:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}