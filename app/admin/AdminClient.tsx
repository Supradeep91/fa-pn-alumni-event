'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { CLASS_LABELS, CLASS_COLORS } from '@/types'
import { ACHIEVEMENTS, type AchievementKey } from '@/lib/achievements'

interface Attendee {
  id: string
  name: string
  class_year: string
  stamps: number
  badges: number
}

interface LeaderboardEntry {
  class_year: string
  count: number
}

interface Props {
  initialAttendeeCount: number
  initialStampCount: number
  initialAchievementCount: number
  initialLeaderboard: LeaderboardEntry[]
  initialWinners: Record<AchievementKey, string[]>
  initialAttendees: Attendee[]
}

export default function AdminClient({
  initialAttendeeCount,
  initialStampCount,
  initialAchievementCount,
  initialLeaderboard,
  initialWinners,
  initialAttendees,
}: Props) {
  const [attendeeCount] = useState(initialAttendeeCount)
  const [stampCount, setStampCount] = useState(initialStampCount)
  const [achievementCount, setAchievementCount] = useState(initialAchievementCount)
  const [activeTab, setActiveTab] = useState<'overview' | 'attendees'>('overview')
  const [sort, setSort] = useState<'stamps' | 'badges' | 'name'>('stamps')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('admin-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stamps' }, () => {
        setStampCount(c => c + 1)
        router.refresh()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'achievements' }, () => {
        setAchievementCount(c => c + 1)
        router.refresh()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, router])

  const sortedAttendees = [...initialAttendees].sort((a, b) => {
    if (sort === 'stamps') return b.stamps - a.stamps
    if (sort === 'badges') return b.badges - a.badges
    return a.name.localeCompare(b.name)
  })

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-dvh bg-slate-950 text-white">
      {/* Header */}
      <div className="px-4 pt-10 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">Admin Panel</p>
            <h1 className="text-xl font-bold">FA PN Event</h1>
          </div>
          <button
            onClick={() => window.open('/finale', '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold rounded-xl text-sm transition"
          >
            🎬 Launch Finale
          </button>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Attendees', value: attendeeCount, emoji: '👥' },
            { label: 'Stamps', value: stampCount, emoji: '🔖' },
            { label: 'Badges', value: achievementCount, emoji: '🏅' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-xl">{s.emoji}</div>
              <div className="text-2xl font-bold mt-0.5">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mt-4 bg-slate-800 rounded-xl p-1">
        {([['overview', 'Overview'], ['attendees', 'Attendees']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === id ? 'bg-slate-600 text-white' : 'text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 pb-10 space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Class Leaderboard */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Class Leaderboard</h2>
              <div className="space-y-2">
                {initialLeaderboard.length === 0 ? (
                  <p className="text-slate-500 text-sm">No stamps yet.</p>
                ) : (
                  initialLeaderboard.map((entry, i) => (
                    <div key={entry.class_year} className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-lg w-7 text-center">{medals[i] ?? `${i + 1}`}</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${CLASS_COLORS[entry.class_year] ?? 'bg-slate-500'}`} />
                      <span className="flex-1 font-medium">{CLASS_LABELS[entry.class_year] ?? entry.class_year}</span>
                      <span className="font-mono text-sm font-bold text-slate-300">{entry.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Achievement Winners */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Achievement Winners</h2>
              <div className="space-y-2">
                {ACHIEVEMENTS.map(a => {
                  const winners = initialWinners[a.key] ?? []
                  return (
                    <div key={a.key} className="bg-slate-800 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{a.emoji}</span>
                        <span className="font-medium text-sm">{a.title}</span>
                        <span className="ml-auto text-xs text-slate-400">{winners.length} unlocked</span>
                      </div>
                      {winners.length > 0 ? (
                        <p className="text-xs text-slate-400 truncate">{winners.join(', ')}</p>
                      ) : (
                        <p className="text-xs text-slate-600">No one yet</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'attendees' && (
          <div>
            {/* Sort buttons */}
            <div className="flex gap-2 mb-3">
              {(['stamps', 'badges', 'name'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${
                    sort === s ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {sortedAttendees.map(a => (
                <div key={a.id} className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${CLASS_COLORS[a.class_year] ?? 'bg-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{a.name}</span>
                    <span className="ml-2 text-xs text-slate-500">{CLASS_LABELS[a.class_year] ?? a.class_year}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                    <span>🔖 {a.stamps}</span>
                    <span>🏅 {a.badges}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
