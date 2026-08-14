'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import QRDisplay from '@/components/QRDisplay'
import StampGrid from '@/components/StampGrid'
import ConversationQuestions from '@/components/ConversationQuestions'
import BottomNav from '@/components/BottomNav'
import { CLASS_LABELS, CLASS_COLORS, type ClassYear, type Profile } from '@/types'

interface Partner {
  id: string
  name: string
  class_year: ClassYear
}

interface Props {
  profile: Profile
  initialPartners: Partner[]
}

export default function PassportClient({ profile, initialPartners }: Props) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners)
  const [activeTab, setActiveTab] = useState<'qr' | 'stamps' | 'questions'>('qr')
  const [incomingRequest, setIncomingRequest] = useState<{ id: string; name: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Real-time: listen for incoming stamp requests
  useEffect(() => {
    const channel = supabase
      .channel('incoming-stamps')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pending_stamps',
          filter: `target_id=eq.${profile.id}`,
        },
        async (payload) => {
          const initiatorId = payload.new.initiator_id
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', initiatorId)
            .single()
          if (data) {
            setIncomingRequest({ id: payload.new.id, name: data.name })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile.id, supabase])

  // Real-time: listen for new confirmed stamps
  useEffect(() => {
    const channel = supabase
      .channel('confirmed-stamps')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stamps',
          filter: `user_a=eq.${profile.id}`,
        },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stamps',
          filter: `user_b=eq.${profile.id}`,
        },
        () => router.refresh()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile.id, supabase, router])

  const collectedYears = partners.map(p => p.class_year)

  return (
    <div className="min-h-dvh bg-slate-950 pb-20">
      {/* Header */}
      <div className={`px-4 pt-12 pb-6 text-center ${CLASS_COLORS[profile.class_year]}`}>
        <p className="text-xs uppercase tracking-widest opacity-75 mb-1">FA PN Passport</p>
        <h1 className="text-2xl font-bold">{profile.name}</h1>
        <p className="text-sm opacity-80 mt-0.5">{CLASS_LABELS[profile.class_year]}</p>
        <p className="text-xs opacity-60 mt-2">
          {partners.length} connection{partners.length !== 1 ? 's' : ''} made
        </p>
      </div>

      {/* Incoming stamp banner */}
      {incomingRequest && (
        <div
          className="mx-4 mt-4 p-4 bg-yellow-500 text-slate-900 rounded-2xl flex items-center justify-between cursor-pointer active:opacity-80"
          onClick={() => {
            setIncomingRequest(null)
            router.push(`/confirm/${incomingRequest.id}`)
          }}
        >
          <div>
            <p className="font-semibold text-sm">Stamp request!</p>
            <p className="text-xs">{incomingRequest.name} wants to connect</p>
          </div>
          <span className="text-2xl">👋</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mx-4 mt-4 bg-slate-800 rounded-xl p-1">
        {(['qr', 'stamps', 'questions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition capitalize ${
              activeTab === tab ? 'bg-slate-600 text-white' : 'text-slate-400'
            }`}
          >
            {tab === 'qr' ? 'My QR' : tab === 'stamps' ? 'Stamps' : 'Questions'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 mt-6">
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center space-y-4">
            <QRDisplay value={profile.id} />
            <p className="text-sm text-slate-400 text-center">
              Show this to others so they can scan and stamp your passport
            </p>
          </div>
        )}
        {activeTab === 'stamps' && (
          <div className="space-y-6">
            <StampGrid collectedYears={collectedYears} />
            {partners.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Connections
                </h3>
                {partners.map(p => (
                  <div key={p.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3">
                    <div className={`w-2 h-2 rounded-full ${CLASS_COLORS[p.class_year]}`} />
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="ml-auto text-xs text-slate-500">{CLASS_LABELS[p.class_year]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'questions' && <ConversationQuestions />}
      </div>

      <BottomNav active="passport" />
    </div>
  )
}
