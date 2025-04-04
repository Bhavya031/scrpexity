import { supabase } from "@/lib/supabase";

interface Search {
  id: string
  query: string
  created_at: Date
}

const searches: Record<string, Search> = {}

export async function createSearch(searchId: string, query: string): Promise<Search> {
  const search = {
    id: searchId,
    query,
    created_at: new Date(),
  }

  searches[searchId] = search
  return search
}

export async function getSearchById(searchId: string, userId: string) {
  try {
    // Check if either parameter is undefined before querying
    if (!searchId || !userId) {
      console.log("Missing required parameters:", { searchId, userId });
      return null;
    }

    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .eq("searchId", searchId)
      .eq("user_id", userId)
      .single();
    
    if (error) {
      // For "not found" errors, return null without raising alarm
      if (error.code === "PGRST116") {
        console.log("Search not found, this is expected for new searches");
        return null;
      }
      
      // For other errors, log with more detail
      console.error("Unexpected database error:", error.message, error.details);
      return null;
    }
    return data;
  } catch (err) {
    // This catches more serious errors like network issues
    console.error("Exception in getSearchById:", err);
    return null;
  }
}

export async function getAllSearches(): Promise<Search[]> {
  return Object.values(searches).sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
}

