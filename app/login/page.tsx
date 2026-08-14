'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-slate-950">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Title */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🛂</div>
          <h1 className="text-2xl font-bold tracking-tight">FA PN</h1>
          <p className="text-sm text-slate-400">Connection Challenge</p>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Play · Connect · Leave a Legacy</p>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-slate-800 p-6 text-center space-y-3">
            <div className="text-3xl">📬</div>
            <p className="font-medium">Check your email</p>
            <p className="text-sm text-slate-400">
              We sent a magic link to <span className="text-white font-medium">{email}</span>
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-xs text-slate-500 underline mt-2"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-slate-400 mb-1.5">
                Your email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@siemens.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
