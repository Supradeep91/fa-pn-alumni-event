'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { CLASS_LABELS, CLASS_COLORS, type ClassYear } from '@/types'

interface PartnerProfile {
  id: string
  name: string
  class_year: ClassYear
}

export default function ConfirmPage() {
  const { pendingId } = useParams<{ pendingId: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [myId, setMyId] = useState<string | null>(null)
  const [role, setRole] = useState<'initiator' | 'target' | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'confirming' | 'done' | 'error' | 'expired'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setMyId(user.id)

      const { data: pending } = await supabase
        .from('pending_stamps')
        .select('*')
        .eq('id', pendingId)
        .single()

      if (!pending) { setStatus('error'); setErrorMsg('Stamp request not found.'); return }

      if (new Date(pending.expires_at) < new Date()) {
        setStatus('expired'); return
      }

      if (pending.status !== 'pending') {
        if (pending.status === 'confirmed') { setStatus('done'); return }
        setStatus('error'); setErrorMsg('This request is no longer valid.'); return
      }

      const isInitiator = pending.initiator_id === user.id
      const isTarget = pending.target_id === user.id
      if (!isInitiator && !isTarget) {
        setStatus('error'); setErrorMsg('This stamp request is not for you.'); return
      }

      setRole(isInitiator ? 'initiator' : 'target')
      const partnerId = isInitiator ? pending.target_id : pending.initiator_id

      const { data: partnerProfile } = await supabase
        .from('profiles')
        .select('id, name, class_year')
        .eq('id', partnerId)
        .single()

      setPartner(partnerProfile)
      setStatus('ready')
    }

    load()
  }, [pendingId, supabase, router])

  async function handleConfirm() {
    if (!myId || !partner) return
    setStatus('confirming')

    // Mark pending stamp as confirmed
    const { error: updateError } = await supabase
      .from('pending_stamps')
      .update({ status: 'confirmed' })
      .eq('id', pendingId)

    if (updateError) {
      setStatus('error')
      setErrorMsg(updateError.message)
      return
    }

    // Write canonical stamp (user_a = smaller UUID)
    const uid1 = myId < partner.id ? myId : partner.id
    const uid2 = myId < partner.id ? partner.id : myId

    const { error: stampError } = await supabase
      .from('stamps')
      .insert({ user_a: uid1, user_b: uid2 })

    if (stampError && !stampError.message.includes('duplicate')) {
      setStatus('error')
      setErrorMsg(stampError.message)
      return
    }

    setStatus('done')
  }

  async function handleReject() {
    await supabase
      .from('pending_stamps')
      .update({ status: 'rejected' })
      .eq('id', pendingId)
    router.push('/passport')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-dvh bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="min-h-dvh bg-slate-950 flex flex-col items-center justify-center px-6 text-center space-y-4">
        <div className="text-5xl">⏱️</div>
        <h2 className="text-lg font-bold">Request expired</h2>
        <p className="text-sm text-slate-400">This stamp request expired. Scan again!</p>
        <button onClick={() => router.push('/scan')} className="px-6 py-2.5 bg-cyan-600 rounded-xl font-medium">
          Scan again
        </button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-dvh bg-slate-950 flex flex-col items-center justify-center px-6 text-center space-y-4">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="text-sm text-slate-400">{errorMsg}</p>
        <button onClick={() => router.push('/passport')} className="px-6 py-2.5 bg-slate-700 rounded-xl font-medium">
          Back to passport
        </button>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="min-h-dvh bg-slate-950 flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <div>
          <h2 className="text-2xl font-bold">Stamp collected!</h2>
          {partner && (
            <p className="text-slate-400 mt-1">
              You connected with <span className="text-white font-medium">{partner.name}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => router.push('/passport')}
          className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-semibold transition"
        >
          View passport
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-slate-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {partner && (
          <>
            <div className="text-center space-y-3">
              <div className={`w-20 h-20 rounded-full ${CLASS_COLORS[partner.class_year]} flex items-center justify-center text-3xl font-bold mx-auto`}>
                {partner.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold">{partner.name}</h2>
                <p className="text-sm text-slate-400">{CLASS_LABELS[partner.class_year]}</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-5 text-center space-y-2">
              <p className="text-sm text-slate-400">
                {role === 'initiator'
                  ? 'Waiting for them to confirm the connection…'
                  : `${partner.name} scanned your QR code. Confirm the connection?`}
              </p>
              {role === 'initiator' && (
                <p className="text-xs text-slate-500">Ask them to open their app and tap Confirm</p>
              )}
            </div>

            {role === 'target' && (
              <div className="space-y-3">
                <button
                  onClick={handleConfirm}
                  disabled={status === 'confirming'}
                  className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {status === 'confirming' ? 'Confirming…' : '✓ Confirm connection'}
                </button>
                <button
                  onClick={handleReject}
                  className="w-full py-3 text-slate-500 text-sm"
                >
                  Not now
                </button>
              </div>
            )}

            {role === 'initiator' && (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <button
                  onClick={() => router.push('/passport')}
                  className="w-full py-3 text-slate-500 text-sm"
                >
                  Go back (they can confirm later)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
