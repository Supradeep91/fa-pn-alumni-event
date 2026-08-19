'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

function isIosNotSafari() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIos = /iPhone|iPad|iPod/.test(ua)
  const isSafari = /Safari/.test(ua) && !/CriOS|EdgA|OPiOS|FxiOS/.test(ua)
  return isIos && !isSafari
}

type Step = 'email' | 'confirm' | 'code'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [wrongBrowser, setWrongBrowser] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { setWrongBrowser(isIosNotSafari()) }, [])

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStep('confirm')
  }

  async function handleSend() {
    setLoading(true)
    setError('')

    const { data: allowed, error: checkErr } = await supabase.rpc('check_email_allowed', { check_email: email })
    if (checkErr || !allowed) {
      setError("Your email isn't on the guest list for this event.")
      setStep('confirm')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (error) {
      if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('over_email')) {
        setError('Too many login attempts. Please wait a few minutes and try again.')
      } else {
        setError(error.message)
      }
      setStep('confirm')
    } else {
      setStep('code')
    }
    setLoading(false)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'email',
    })

    if (error) {
      setError('Invalid or expired code. Please try again.')
      setLoading(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user?.id ?? '').single()
      router.replace(profile ? '/passport' : '/setup')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-slate-950">
      {wrongBrowser && (
        <div className="w-full max-w-sm mb-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-sm space-y-1">
          <p className="font-semibold text-amber-400">Open in Safari for best experience</p>
          <p className="text-amber-300/80 text-xs">
            Copy this URL and paste it into Safari to log in and install the app on your home screen.
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="mt-1 px-3 py-1.5 bg-amber-500 text-slate-900 rounded-lg text-xs font-semibold"
          >
            Copy URL
          </button>
        </div>
      )}

      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="text-5xl">🛂</div>
          <h1 className="text-2xl font-bold tracking-tight">FA PN Connect</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Play · Connect · Leave a Legacy</p>
        </div>

        {/* Step 1: Enter email */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-slate-400 mb-1.5">Your email address</label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@siemens.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={!email.trim()}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 font-semibold transition disabled:opacity-50"
            >
              Continue →
            </button>
          </form>
        )}

        {/* Step 2: Confirm email is correct, then send code */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-800 p-5 space-y-3">
              <p className="text-sm text-slate-400">We'll send a sign-in code to:</p>
              <p className="text-white font-semibold break-all">{email}</p>
              <button
                onClick={() => { setStep('email'); setError('') }}
                className="text-xs text-cyan-400 underline"
              >
                Change email
              </button>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send code'}
            </button>
          </div>
        )}

        {/* Step 3: Enter code */}
        {step === 'code' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="rounded-2xl bg-slate-800 p-5 text-center space-y-1">
              <div className="text-3xl">📬</div>
              <p className="font-medium">Check your email</p>
              <p className="text-sm text-slate-400">
                Code sent to <span className="text-white font-medium">{email}</span>
              </p>
            </div>
            <div>
              <label htmlFor="otp" className="block text-sm text-slate-400 mb-1.5">Enter the code from your email</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={8}
                required
                autoFocus
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-center text-2xl tracking-widest placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('confirm'); setOtp(''); setError('') }}
              className="w-full text-xs text-slate-500 underline"
            >
              Didn't receive a code?
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
