"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserCircle, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-bold text-xl text-gradient">Scrpexity</span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleMenu}
              className="p-1"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="outline" size="sm" className="gap-2">
                <UserCircle className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 flex flex-col items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="outline" size="sm" className="gap-2 w-full">
                <UserCircle className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}