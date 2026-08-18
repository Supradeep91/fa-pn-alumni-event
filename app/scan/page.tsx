'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const NAV_ITEMS = [
  { label: 'Passport', icon: '🛂', href: '/passport' },
  { label: 'Scan',    icon: '📷', href: '/scan' },
  { label: 'Rankings', icon: '🏆', href: '/leaderboard' },
  { label: 'Agenda',  icon: '📅', href: '/agenda' },
]

export default function ScanPage() {
  const [status, setStatus] = useState<'starting' | 'scanning' | 'found' | 'error' | 'self'>('starting')
  const [message, setMessage] = useState('')
  const readerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const supabaseRef = useRef(createClient())

  async function stopAndGo(href: string) {
    await instanceRef.current?.stop().catch(() => {})
    window.location.href = href
  }

  useEffect(() => {
    let stopped = false
    const supabase = supabaseRef.current

    async function startScanner() {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (stopped || !readerRef.current) return

      const qr = new Html5Qrcode('qr-reader')
      instanceRef.current = qr as unknown as { stop: () => Promise<void> }

      try {
        await (qr as unknown as {
          start: (
            camera: { facingMode: string },
            config: object,
            onSuccess: (text: string) => void,
            onError: () => void
          ) => Promise<void>
        }).start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText: string) => {
            if (stopped) return
            stopped = true
            await qr.stop().catch(() => {})

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { window.location.href = '/login'; return }

            if (decodedText === user.id) {
              setStatus('self')
              setMessage("That's your own QR code!")
              return
            }

            const { data: targetProfile } = await supabase
              .from('profiles')
              .select('id, name')
              .eq('id', decodedText)
              .single()

            if (!targetProfile) {
              setStatus('error')
              setMessage('Could not find that person. Try scanning again.')
              return
            }

            const uid1 = user.id < decodedText ? user.id : decodedText
            const uid2 = user.id < decodedText ? decodedText : user.id
            const { data: existing } = await supabase
              .from('stamps')
              .select('id')
              .eq('user_a', uid1)
              .eq('user_b', uid2)
              .single()

            if (existing) {
              setStatus('error')
              setMessage(`You already have a stamp from ${targetProfile.name}!`)
              return
            }

            setStatus('found')

            const { data: pending, error } = await supabase
              .from('pending_stamps')
              .insert({ initiator_id: user.id, target_id: decodedText })
              .select('id')
              .single()

            if (error || !pending) {
              setStatus('error')
              setMessage('Something went wrong. Please try again.')
              return
            }

            // Full page navigation — more reliable than client-side router on mobile PWA
            window.location.href = `/confirm/${pending.id}`
          },
          () => {}
        )
        if (!stopped) setStatus('scanning')
      } catch {
        setStatus('error')
        setMessage('Camera access denied. Please allow camera permission and try again.')
      }
    }

    startScanner()

    return () => {
      stopped = true
      instanceRef.current?.stop().catch(() => {})
    }
  }, [])

  function retry() {
    window.location.reload()
  }

  return (
    <div className="min-h-dvh bg-slate-950 pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Scan a passport</h1>
        <p className="text-sm text-slate-400 mt-1">Point your camera at someone else&apos;s QR code</p>
      </div>

      <div className="px-4">
        {(status === 'starting' || status === 'scanning') && (
          <div className="space-y-3">
            <div
              id="qr-reader"
              ref={readerRef}
              className="rounded-2xl overflow-hidden bg-slate-900"
            />
            {status === 'starting' && (
              <p className="text-center text-sm text-slate-500">Starting camera…</p>
            )}
          </div>
        )}

        {status === 'found' && (
          <div className="text-center space-y-4 py-12">
            <div className="text-5xl">⏳</div>
            <p className="text-slate-300">Creating stamp request…</p>
          </div>
        )}

        {status === 'self' && (
          <div className="text-center space-y-4 py-12">
            <div className="text-5xl">🙈</div>
            <p className="text-slate-300">{message}</p>
            <button onClick={retry} className="px-6 py-2.5 bg-slate-700 rounded-xl text-sm font-medium">
              Scan someone else
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4 py-12">
            <div className="text-5xl">⚠️</div>
            <p className="text-slate-300">{message}</p>
            <button onClick={retry} className="px-6 py-2.5 bg-slate-700 rounded-xl text-sm font-medium">
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Inline nav: stops camera before navigating to prevent race crash */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 safe-bottom">
        <div className="flex">
          {NAV_ITEMS.map(item => (
            <button
              key={item.href}
              onClick={() => stopAndGo(item.href)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition ${
                item.href === '/scan' ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
