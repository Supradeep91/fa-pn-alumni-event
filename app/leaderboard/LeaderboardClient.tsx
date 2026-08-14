'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import BottomNav from '@/components/BottomNav'
import { CLASS_COLORS, CLASS_LABELS, type ClassYear } from '@/types'

interface Entry {
  class_year: string
  connection_count: number
}

interface Props {
  initialEntries: Entry[]
  totalStamps: number
  currentUserId: string
}

export default function LeaderboardClient({ initialEntries, totalStamps, currentUserId }: Props) {
  const [entries, setEntries] = useState(initialEntries)
  const [total, setTotal] = useState(totalStamps)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-stamps')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stamps' }, () => {
        router.refresh()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, router])

  const medals = ['🥇', '🥈', '🥉']
  const maxCount = entries[0]?.connection_count ?? 1

  return (
    <div className="min-h-dvh bg-slate-950 pb-20">
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-xl font-bold">Class Rankings</h1>
        <p className="text-sm text-slate-400 mt-1">
          {total} stamp{total !== 1 ? 's' : ''} collected across the network
        </p>
      </div>

      <div className="px-4 space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-4xl mb-3">🏁</p>
            <p>No connections yet. Be the first!</p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const year = entry.class_year as ClassYear
            const barWidth = Math.max(8, (entry.connection_count / maxCount) * 100)
            return (
              <div key={entry.class_year} className="bg-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-7 text-center">{medals[i] ?? `${i + 1}`}</span>
                    <span className="font-semibold">{CLASS_LABELS[year] ?? entry.class_year}</span>
                  </div>
                  <span className="text-slate-300 font-mono text-sm font-bold">
                    {entry.connection_count}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${CLASS_COLORS[year] ?? 'bg-slate-500'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      <BottomNav active="leaderboard" />
    </div>
  )
}
