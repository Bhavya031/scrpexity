// components/api-key-setup.tsx
"use client"; // Add this line at the top to mark as a Client Component

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation" // Change from 'next/router' to 'next/navigation'
import { Session } from "next-auth"

export function ApiKeySetup({ session }: { session: Session }) {
  const [apiKey, setApiKey] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/setup-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          serviceName: "openai", // or whatever service you're using
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to save API key")
      }
      // Refresh the page to update session
      router.refresh() // Use refresh instead of reload in App Router
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up Your API Key</CardTitle>
        <CardDescription>
          Please provide your API key to use Scrpexity. This key is encrypted and stored securely.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium">
                OpenAI API Key
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your API key is encrypted and only used to process your requests.
              </p>
            </div>
            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save API Key"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}