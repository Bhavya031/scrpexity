"src/app/search/[id]/page.tsx"
import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { SearchHeader } from "@/components/search-header"
import { SearchResults } from "@/components/search-results"
import { getSearchById } from "@/lib/storage"
import { auth } from "@/lib/auth"
interface SearchPageProps {
  params: {
    id: string
  }
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { id } = await params
  const session = await auth();
  if(!session){
    redirect("/")
  }
  const userId = session.user.id;
  // Get the search from the database
  


  return (
    <main className="flex min-h-screen flex-col">
      <SearchHeader pageid={id} />
      <div className="flex-1 container max-w-4xl mx-auto px-4 py-6">
        <Suspense fallback={<SearchLoadingSkeleton />}>
          <SearchResults searchId={id} />
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

