// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  
  // Get the pathname
  const { pathname } = req.nextUrl
  
  // Always allow NextAuth API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }
  
  // Public paths that don't require authentication
  const publicPaths = ['/', '/auth/signin', '/signin', '/auth/error']
  const isPublicPath = publicPaths.some(path => 
    pathname === path || (path !== '/' && pathname.startsWith(path))
  )
  
  // Check if the path needs protection
  if (!session) {
    // If unauthenticated and trying to access a protected route
    if (!isPublicPath) {
      // Create the callback URL
      const callbackUrl = encodeURIComponent(pathname)
      // Redirect to sign-in page with the callback URL
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
    }
  } else {
    // If user is already signed in
    if (pathname === '/auth/signin' || pathname === '/signin') {
      // Redirect to home page
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  
  return NextResponse.next()
}

// Update the matcher to explicitly exclude NextAuth API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|api/auth).*)',
  ],
}