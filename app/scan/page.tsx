'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import BottomNav from '@/components/BottomNav'

export default function ScanPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'found' | 'error' | 'self'>('idle')
  const [message, setMessage] = useState('')
  const scannerRef = useRef<HTMLDivElement>(null)
  const scannerInstanceRef = useRef<unknown>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let scanner: { stop: () => Promise<void> } | null = null

    async function startScanner() {
      const { Html5QrcodeScanner } = await import('html5-qrcode')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        false
      ) as unknown as { stop: () => Promise<void> }

      scannerInstanceRef.current = scanner

      ;(scanner as unknown as { render: (success: (text: string) => void, error: unknown) => void }).render(
        async (decodedText: string) => {
          await scanner?.stop()

          const { data: { user } } = await supabase.auth.getUser()
          if (!user) { router.push('/login'); return }

          if (decodedText === user.id) {
            setStatus('self')
            setMessage('That\'s your own QR code!')
            return
          }

          // Check the target user exists
          const { data: targetProfile } = await supabase
            .from('profiles')
            .select('id, name, class_year')
            .eq('id', decodedText)
            .single()

          if (!targetProfile) {
            setStatus('error')
            setMessage('Could not find that person. Try scanning again.')
            return
          }

          // Check if already stamped
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

          // Create pending stamp
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
    }

    if (scannerRef.current) startScanner()

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {})
      }
    }
  }, [supabase, router])

  return (
    <div className="min-h-dvh bg-slate-950 pb-20">
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-xl font-bold">Scan a passport</h1>
        <p className="text-sm text-slate-400 mt-1">Point your camera at someone else&apos;s QR code</p>
      </div>

      <div className="px-4">
        {status === 'idle' || status === 'scanning' ? (
          <div
            id="qr-reader"
            ref={scannerRef}
            className="rounded-2xl overflow-hidden"
          />
        ) : status === 'self' ? (
          <div className="text-center space-y-4 py-12">
            <div className="text-5xl">🙈</div>
            <p className="text-slate-300">{message}</p>
            <button
              onClick={() => { setStatus('idle'); window.location.reload() }}
              className="px-6 py-2.5 bg-slate-700 rounded-xl text-sm font-medium"
            >
              Scan someone else
            </button>
          </div>
        ) : status === 'error' ? (
          <div className="text-center space-y-4 py-12">
            <div className="text-5xl">⚠️</div>
            <p className="text-slate-300">{message}</p>
            <button
              onClick={() => { setStatus('idle'); window.location.reload() }}
              className="px-6 py-2.5 bg-slate-700 rounded-xl text-sm font-medium"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4 py-12">
            <div className="text-5xl">⏳</div>
            <p className="text-slate-300">Creating stamp request…</p>
          </div>
        )}
      </div>

      <BottomNav active="scan" />
    </div>
  )
}
