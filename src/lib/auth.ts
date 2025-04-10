// lib/auth.ts
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import type { DefaultSession, NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabase } from "@/lib/supabase"
import { v5 as uuidv5 } from 'uuid' // Using UUID v5 for deterministic generation
import CryptoJS from 'crypto-js' // Import for encryption

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      hasApiKey?: boolean; // Add this field to track API key status
      apiKey?: string | null; 
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
    // In the session callback of auth.ts
async session({ session, token }) {
  if (session.user && token.sub) {
    // Convert Google sub to UUID
    const userId = googleSubToUUID(token.sub);
    session.user.id = userId;
    
    // Check if user exists in Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, encrypted_api_key')
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
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
      
      // New user has no API key
      session.user.hasApiKey = false;
    } else {
      // Set hasApiKey based on whether the encrypted_api_key exists
      session.user.hasApiKey = Boolean(userData.encrypted_api_key);
      if (userData.encrypted_api_key) {
        session.user.apiKey = decryptApiKey(userData.encrypted_api_key);
      } else {
        session.user.apiKey = null; // Explicitly set to null when no API key exists
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

// Add utility functions for API key management
export const encryptApiKey = (apiKey: string): string => {
  const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET as string;
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_SECRET).toString();
};

export const decryptApiKey = (encryptedApiKey: string): string => {
  const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET as string;
  const bytes = CryptoJS.AES.decrypt(encryptedApiKey, ENCRYPTION_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};