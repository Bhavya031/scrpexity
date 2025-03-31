"src/app/search/[id]/page.tsx"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { SearchHeader } from "@/components/search-header"
import { SearchResults } from "@/components/search-results"
import { getSearchById } from "@/lib/storage"

interface SearchPageProps {
  params: {
    id: string
  }
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { id } = await params

  // Get the search from the database
  const search = await getSearchById(id)

  if (!search) {
    notFound()
  }

  return (
    <main className="flex min-h-screen flex-col">
      <SearchHeader query={search.query} />
      <div className="flex-1 container max-w-4xl mx-auto px-4 py-6">
        <Suspense fallback={<SearchLoadingSkeleton />}>
          <SearchResults searchId={id} query={search.query} />
        </Suspense>
      </div>
    </main>
  )
}

function SearchLoadingSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      <div className="h-6 w-full max-w-md bg-muted rounded animate-pulse"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
        <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
        <div className="h-4 w-4/6 bg-muted rounded animate-pulse"></div>
      </div>
    </div>
  )
}

