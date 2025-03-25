"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight, Sparkles } from "lucide-react"
import { generateRandomString } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function HomeSearch() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAdvanced, setIsAdvanced] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)

    try {
      // Generate a random string for the URL
      const searchId = generateRandomString(10)

      // Store the query in the database
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, searchId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create search")
      }

      // Redirect to the search results page
      router.push(`/search/${searchId}`)
    } catch (error) {
      console.error("Error creating search:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="absolute -inset-0.5 minimal-gradient rounded-lg blur opacity-30"></div>
        <form onSubmit={handleSubmit} className="relative bg-card rounded-lg shadow-lg p-1">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="What do you want to know?"
              className="pl-12 pr-20 py-7 text-base md:text-lg bg-transparent border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="absolute right-2 minimal-gradient hover:opacity-90 text-white rounded-md py-2 px-4 flex items-center gap-2"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? "Searching..." : "Search"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-center mt-4 gap-2">
        <Switch id="advanced-mode" checked={isAdvanced} onCheckedChange={setIsAdvanced} />
        <Label htmlFor="advanced-mode" className="text-sm text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Advanced Mode
        </Label>
      </div>
    </div>
  )
}

