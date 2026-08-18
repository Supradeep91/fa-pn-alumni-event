'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for error in URL (expired / invalid link)
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
    const errorCode = params.get('error_code') || hashParams.get('error_code')

    if (errorCode === 'otp_expired' || params.get('error') || hashParams.get('error')) {
      setError('This sign-in link has expired. Please request a new one.')
      return
    }

    // Listen for successful sign-in
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()
        router.replace(profile ? '/passport' : '/setup')
      }
    })

    // Fallback: if nothing happens in 8s, send back to login
    const timeout = setTimeout(() => {
      router.replace('/login')
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router, supabase])

  if (error) {
    return (
      <div className="min-h-dvh bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">⏱️</div>
          <h2 className="text-lg font-bold">Link expired</h2>
          <p className="text-sm text-slate-400">{error}</p>
          <button
            onClick={() => router.replace('/login')}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-medium transition"
          >
            Request a new link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
