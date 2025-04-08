// lib/auth.ts
import type {
    GetServerSidePropsContext,
    NextApiRequest,
    NextApiResponse,
  } from "next"
  import type { NextAuthOptions } from "next-auth"
  import { getServerSession } from "next-auth"
  import GoogleProvider from "next-auth/providers/google"
  
  // Your NextAuth.js configuration
  export const authOptions: NextAuthOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        // Optional: If you need refresh tokens
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      }),
    ],
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout', // Optional: Create a custom sign out page
        error: '/auth/error', // Optional: Create a custom error page
      },
    // Add any additional configuration options as needed
    // For example:
    // pages: {
    //   signIn: '/auth/signin',
    //   signOut: '/auth/signout',
    //   error: '/auth/error',
    // },
    // callbacks: {
    //   async signIn({ account, profile }) {
    //     // Optional: Restrict sign-in to specific domains
    //     // return profile.email_verified && profile.email.endsWith("@yourdomain.com")
    //     return true
    //   },
    // }
  }
  
  // Helper function to use getServerSession without passing authOptions every time
  export function auth(
    ...args:
      | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
      | [NextApiRequest, NextApiResponse]
      | []
  ) {
    return getServerSession(...args, authOptions)
  }