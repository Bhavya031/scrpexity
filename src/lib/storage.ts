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

export async function getSearchById(id: string): Promise<Search | null> {
  try {
    // Default user ID - you might want to pass this as a parameter instead
    const user_id = "172af0e5-ea8b-4f32-877c-dc9f37bd2300";
    
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .eq("searchId", id)
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error fetching search:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching search:", error);
    return null;
  }
}

export async function getAllSearches(): Promise<Search[]> {
  return Object.values(searches).sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
}

