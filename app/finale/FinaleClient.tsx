'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { CLASS_LABELS, CLASS_COLORS } from '@/types'
import { ACHIEVEMENTS, type AchievementKey } from '@/lib/achievements'

interface LeaderboardEntry {
  class_year: string
  count: number
}

interface Props {
  initialStampCount: number
  initialLeaderboard: LeaderboardEntry[]
  initialFirstWinners: Partial<Record<AchievementKey, string>>
  initialWinnerCounts: Partial<Record<AchievementKey, number>>
}

export default function FinaleClient({
  initialStampCount,
  initialLeaderboard,
  initialFirstWinners,
  initialWinnerCounts,
}: Props) {
  const [stampCount, setStampCount] = useState(initialStampCount)
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('finale-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stamps' }, () => {
        setStampCount(c => c + 1)
        router.refresh()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, router])

  const champion = leaderboard[0]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-10 py-6 border-b border-slate-800">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-400">FA PN Alumni Event · 21.09.2025</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">Connection Challenge</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400 uppercase tracking-widest">Total stamps</p>
          <p className="text-5xl font-black tabular-nums">{stampCount}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-0 divide-x divide-slate-800">
        {/* Left: Class Champion */}
        <div className="col-span-2 flex flex-col items-center justify-center px-10 py-8 space-y-4">
          <p className="text-sm uppercase tracking-widest text-slate-400">Class Champion 🏆</p>
          {champion ? (
            <>
              <div
                className={`w-32 h-32 rounded-3xl ${CLASS_COLORS[champion.class_year] ?? 'bg-slate-700'} flex items-center justify-center`}
              >
                <span className="text-4xl font-extrabold">
                  {CLASS_LABELS[champion.class_year] ?? champion.class_year}
                </span>
              </div>
              <div className="text-center">
                <p className="text-6xl font-black tabular-nums">{champion.count}</p>
                <p className="text-slate-400 text-lg">connections</p>
              </div>

              {/* Runner-ups */}
              {leaderboard.length > 1 && (
                <div className="w-full space-y-2 mt-2">
                  {leaderboard.slice(1, 4).map((e, i) => (
                    <div key={e.class_year} className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-2">
                      <span className="text-base">{['🥈', '🥉', '4️⃣'][i]}</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${CLASS_COLORS[e.class_year] ?? 'bg-slate-500'}`} />
                      <span className="flex-1 font-semibold">{CLASS_LABELS[e.class_year] ?? e.class_year}</span>
                      <span className="font-mono text-sm font-bold text-slate-300">{e.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <p className="text-6xl mb-4">🏁</p>
              <p className="text-2xl font-bold text-slate-400">Game on!</p>
              <p className="text-slate-500">First stamp wins the lead</p>
            </div>
          )}
        </div>

        {/* Right: Achievement Winners */}
        <div className="col-span-3 px-10 py-8">
          <p className="text-sm uppercase tracking-widest text-slate-400 mb-6">Achievement Winners</p>
          <div className="grid grid-cols-1 gap-4">
            {ACHIEVEMENTS.map(a => {
              const firstName = initialFirstWinners[a.key]
              const count = initialWinnerCounts[a.key] ?? 0
              const unlocked = count > 0
              return (
                <div
                  key={a.key}
                  className={`rounded-2xl px-6 py-4 flex items-center gap-5 transition ${
                    unlocked ? 'bg-slate-800' : 'bg-slate-900 opacity-50'
                  }`}
                >
                  <span className="text-4xl">{a.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg">{a.title}</p>
                    <p className="text-slate-400 text-sm">{a.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {unlocked ? (
                      <>
                        <p className="font-semibold text-yellow-400">{firstName}</p>
                        {count > 1 && (
                          <p className="text-xs text-slate-400">+{count - 1} more</p>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-600 text-sm">Locked</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 py-4 border-t border-slate-800 flex items-center justify-between">
        <p className="text-xs text-slate-600">FA PN Alumni · Real-time leaderboard</p>
        <p className="text-xs text-slate-600">Updates live ·{' '}
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </p>
      </div>
    </div>
  )
}
