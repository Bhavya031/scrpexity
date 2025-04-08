// lib/auth.ts
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import type { DefaultSession, NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabase } from "@/lib/supabase";
import { v5 as uuidv5 } from 'uuid'; // Using UUID v5 for deterministic generation

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
    } & DefaultSession["user"]
  }
}

// Function to convert Google's sub to UUID
function googleSubToUUID(sub: string): string {
  // Use a namespace (DNS namespace in this case) and the sub to generate a consistent UUID
  const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS namespace
  return uuidv5(sub, NAMESPACE);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Convert Google sub to UUID
        const userId = googleSubToUUID(token.sub);
        session.user.id = userId;
        
        // Check if user exists in Supabase
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        if (error || !data) {
          console.log(`User with ID ${userId} doesn't exist, creating new record`);
          
          // Insert new user if they don't exist
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              full_name: session.user.name || '',
              email: session.user.email || '',
              created_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating user:', insertError);
          }
        }
      }
      return session;
    }
  }
}

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions)
}