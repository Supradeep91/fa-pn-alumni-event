'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import BottomNav from '@/components/BottomNav'

export default function ScanPage() {
  const [status, setStatus] = useState<'starting' | 'scanning' | 'found' | 'error' | 'self'>('starting')
  const [message, setMessage] = useState('')
  const readerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let stopped = false

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
            if (!user) { router.push('/login'); return }

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

            router.push(`/confirm/${pending.id}`)
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
  }, [supabase, router])

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

      <BottomNav active="scan" />
    </div>
  )
}
