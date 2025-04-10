'use client'

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="px-4 py-2 rounded-lg bg-card hover:bg-muted text-foreground transition-colors"
    >
      Sign Out
    </button>
  )
}