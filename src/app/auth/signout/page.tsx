'use client'

import { signOut } from "next-auth/react"
import { useEffect } from "react"

export default function SignOut() {
  useEffect(() => {
    // Automatically sign out when the page loads
    signOut({ callbackUrl: '/' })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Signing out...</h1>
      <p>You are being signed out.</p>
    </div>
  )
}