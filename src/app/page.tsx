import { HomeSearch } from "@/components/home-search"
import { Logo } from "@/components/logo"
import { auth } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()
  
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar session={session} />
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80 z-0" />
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-orange/10 rounded-full blur-3xl" />

        <div className="w-full max-w-3xl mx-auto flex flex-col items-center z-10">
          <div className="mb-12 flex flex-col items-center">
            <h1 className="text-5xl font-bold text-center text-gradient p-6">Scrpexity</h1>
            <p className="text-muted-foreground text-center mt-3 max-w-md">
              AI-powered search engine that explores the web and delivers comprehensive answers
            </p>
          </div>
          
          {session ? (
            <HomeSearch />
          ) : (
            <div className="w-full space-y-6">
              <div className="relative w-full">
                {/* Disabled search box for unauthenticated users */}
                <div className="relative w-full">
                  <HomeSearch />
                </div>
                {/* Overlay for unauthenticated users */}
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                  <div className="text-center p-4 bg-background border rounded-lg shadow-lg">
                    <h3 className="font-semibold mb-2">Login to start chatting</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sign in to access all features</p>
                    <Link href="/auth/signin">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <FeatureCard
              icon="Search"
              title="Intelligent Search"
              description="Scrpexity searches the web like a human would, finding the most relevant information."
              color="pink"
            />
            <FeatureCard
              icon="Link"
              title="Source Verification"
              description="Every piece of information is linked back to its original source for verification."
              color="orange"
            />
            <FeatureCard
              icon="Sparkles"
              title="AI Synthesis"
              description="Complex information is synthesized into clear, concise answers you can understand."
              color="pink"
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string
  title: string
  description: string
  color: "pink" | "orange"
}) {
  const getColorClass = () => {
    switch (color) {
      case "pink":
        return "bg-brand-pink/10 text-brand-pink"
      case "orange":
        return "bg-brand-orange/10 text-brand-orange"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
      <div className="flex items-center gap-2 mb-3">
        {icon === "Search" && (
          <div className={`h-8 w-8 rounded-full ${getColorClass()} flex items-center justify-center`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
        )}
        {icon === "Link" && (
          <div className={`h-8 w-8 rounded-full ${getColorClass()} flex items-center justify-center`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
        )}
        {icon === "Sparkles" && (
          <div className={`h-8 w-8 rounded-full ${getColorClass()} flex items-center justify-center`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
            </svg>
          </div>
        )}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}