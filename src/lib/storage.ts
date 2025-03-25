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
  return searches[id] || null
}

export async function getAllSearches(): Promise<Search[]> {
  return Object.values(searches).sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
}

