// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// The correct way to export handlers in App Router
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }