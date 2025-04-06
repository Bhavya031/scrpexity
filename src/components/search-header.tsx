//src/components/search-header.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight, Home } from "lucide-react"
import { generateRandomString } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { quary } from "@/lib/clientCache"

interface SearchHeaderProps {
  pageid: string
}

export function SearchHeader({ pageid }: SearchHeaderProps) {

  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [checkCompleted, setCheckCompleted] = useState(false);
  useEffect(() => {
    const queryFromStorage = quary(pageid);
    console.log("local data is here")
    setSearchQuery(queryFromStorage || pageid); // Fallback to searchId if storage value is null
    setCheckCompleted(true);
  }, [pageid]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)

    try {
      // Generate a random string for the URL
      const searchId = generateRandomString(10)

      const quarys = quary(pageid)
      // Redirect to the search results page
      router.push(`/search/${searchId}`)
    } catch (error) {
      console.error("Error creating search:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            {/* <Logo className="w-8 h-8" /> */}
          </Link>

          <form onSubmit={handleSubmit} className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 pr-10 py-2 h-10 text-sm bg-background border-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full minimal-gradient"
                disabled={isLoading || !searchQuery.trim()}
              >
                <ArrowRight className="h-3 w-3 text-white" />
              </Button>
            </div>
          </form>

          <Link href="/">
            <Button variant="ghost" size="icon">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

