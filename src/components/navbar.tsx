"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserCircle, Menu, X, LogOut, Settings } from "lucide-react"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { Session } from "next-auth"

interface NavbarProps {
  session: Session | null
}

export function Navbar({ session }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
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
            {session ? (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleProfile}
                  className="gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                    ) : (
                      <span>{session.user?.name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <span className="hidden sm:inline">{session.user?.name || "User"}</span>
                </Button>

                {/* Profile dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background rounded-md shadow-lg border overflow-hidden z-10">
                    <div className="p-3 border-b">
                      <p className="font-semibold">{session.user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email || "user@example.com"}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md">
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-muted rounded-md w-full text-left"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline" size="sm" className="gap-2">
                  <UserCircle className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 flex flex-col items-start gap-4">
            {session ? (
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b w-full">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                    ) : (
                      <span>{session.user?.name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{session.user?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground">{session.user?.email || "user@example.com"}</span>
                  </div>
                </div>
                <Link href="/settings" className="flex items-center gap-2 py-2 px-2 hover:bg-muted rounded-md w-full">
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 py-2 px-2 text-red-500 hover:bg-muted rounded-md w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" className="w-full">
                <Button variant="outline" size="sm" className="gap-2 w-full">
                  <UserCircle className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}