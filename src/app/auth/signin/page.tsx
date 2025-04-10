'use client'
import { useEffect, useState, Suspense } from "react"
import { getProviders, signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

// Create a separate component that uses useSearchParams
function SignInContent() {
  const [providers, setProviders] = useState<any>(null)
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'
  
  useEffect(() => {
    // Redirect if already signed in
    if (session) {
      router.push(callbackUrl)
      return
    }
    
    const fetchProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    fetchProviders()
  }, [session, router, callbackUrl])
  
  if (!providers) return <div>Loading...</div>
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Sign in to your account</h1>
      <div className="flex flex-col space-y-4">
        {Object.values(providers).map((provider: any) => (
          <div key={provider.name}>
            <button
              onClick={() => signIn(provider.id, { callbackUrl })}
              className="px-4 py-2 border flex gap-2 bg-white border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
            >
              <img 
                src={provider.name === 'Google' ? '/google-icon.png' : '/default-icon.png'} 
                alt={provider.name} 
                className="w-6 h-6" 
              />
              <span>Sign in with {provider.name}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}