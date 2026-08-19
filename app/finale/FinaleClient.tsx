'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { getClassLabel } from '@/types'

interface ProfileRow   { id: string; name: string; class_year: string }
interface StampRow     { user_a: string; user_b: string; created_at: string }
interface AchRow       { user_id: string; key: string }
interface FeedItem     { a: string; b: string; at: string; id: string }

interface Props {
  profiles: ProfileRow[]
  stamps: StampRow[]
  achievements: AchRow[]
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    if (value === prev.current) return
    const diff = value - prev.current
    const steps = Math.min(diff, 30)
    const step = diff / steps
    let cur = prev.current
    let i = 0
    const id = setInterval(() => {
      cur += step
      i++
      setDisplay(Math.round(cur))
      if (i >= steps) { setDisplay(value); clearInterval(id) }
    }, 40)
    prev.current = value
    return () => clearInterval(id)
  }, [value])

  return <>{display}</>
}

export default function FinaleClient({ profiles, stamps: initialStamps, achievements: initialAchievements }: Props) {
  const [stamps, setStamps] = useState<StampRow[]>(initialStamps)
  const [achievements, setAchievements] = useState<AchRow[]>(initialAchievements)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [pulse, setPulse] = useState(false)

  const profileMap = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles])

  useEffect(() => {
    const supabase = createClient()
    const ch = supabase.channel('finale-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stamps' }, p => {
        const s = p.new as StampRow
        setStamps(prev => [s, ...prev])
        setPulse(true)
        setTimeout(() => setPulse(false), 800)
        const a = profileMap.get(s.user_a)?.name ?? '?'
        const b = profileMap.get(s.user_b)?.name ?? '?'
        setFeed(prev => [
          { a, b, at: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), id: s.created_at + s.user_a },
          ...prev.slice(0, 6),
        ])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'achievements' },
        p => setAchievements(prev => [...prev, p.new as AchRow]))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [profileMap])

  // Seed feed from initial stamps
  useEffect(() => {
    const items = initialStamps.slice(0, 6).map(s => ({
      a: profileMap.get(s.user_a)?.name ?? '?',
      b: profileMap.get(s.user_b)?.name ?? '?',
      at: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: s.created_at + s.user_a,
    }))
    setFeed(items)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const connectorCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const s of stamps) {
      c[s.user_a] = (c[s.user_a] ?? 0) + 1
      c[s.user_b] = (c[s.user_b] ?? 0) + 1
    }
    return c
  }, [stamps])

  const topConnector = useMemo(() => {
    const sorted = profiles
      .map(p => ({ ...p, count: connectorCounts[p.id] ?? 0 }))
      .sort((a, b) => b.count - a.count)
    return sorted[0]?.count > 0 ? sorted[0] : null
  }, [profiles, connectorCounts])

  const topCohort = useMemo(() => {
    const c: Record<string, number> = {}
    for (const s of stamps) {
      const ya = profileMap.get(s.user_a)?.class_year
      const yb = profileMap.get(s.user_b)?.class_year
      if (ya && ya !== 'CEO' && ya !== 'CFO') c[ya] = (c[ya] ?? 0) + 1
      if (yb && yb !== 'CEO' && yb !== 'CFO') c[yb] = (c[yb] ?? 0) + 1
    }
    const top = Object.entries(c).sort(([, a], [, b]) => b - a)[0]
    return top ? { year: top[0], count: top[1] } : null
  }, [stamps, profileMap])

  const achievementBreakdown = useMemo(() => {
    const c: Record<string, number> = {}
    for (const a of achievements) c[a.key] = (c[a.key] ?? 0) + 1
    return ACHIEVEMENTS.map(a => ({ ...a, count: c[a.key] ?? 0 })).filter(a => a.count > 0)
  }, [achievements])

  return (
    <div className="min-h-dvh bg-slate-950 text-white flex flex-col overflow-hidden select-none">

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-6 pb-2">
        <div>
          <p className="text-sm font-semibold tracking-widest text-cyan-400 uppercase">FA PN Alumni Event</p>
          <p className="text-xs text-slate-500">Erlangen · 21 September 2025</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{profiles.length} participants</p>
        </div>
      </div>

      {/* Hero counter */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className={`transition-transform duration-200 ${pulse ? 'scale-110' : 'scale-100'}`}>
          <p className="text-center font-black tabular-nums leading-none"
             style={{ fontSize: 'clamp(5rem, 20vw, 14rem)' }}>
            <AnimatedCounter value={stamps.length} />
          </p>
        </div>
        <p className="text-slate-400 text-lg tracking-wide mt-2">connections made tonight</p>

        {/* Highlights row */}
        {(topConnector || topCohort) && (
          <div className="flex gap-8 mt-8 flex-wrap justify-center">
            {topConnector && (
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest">Most connected</p>
                <p className="text-xl font-bold text-amber-400 mt-1">{topConnector.name}</p>
                <p className="text-sm text-slate-400">{topConnector.count} stamps · {getClassLabel(topConnector.class_year)}</p>
              </div>
            )}
            {topCohort && (
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest">Most active cohort</p>
                <p className="text-xl font-bold text-cyan-400 mt-1">{getClassLabel(topCohort.year)}</p>
                <p className="text-sm text-slate-400">{topCohort.count} connections</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-2 gap-4 px-8 pb-8">

        {/* Achievements */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Badges unlocked</p>
          {achievementBreakdown.length > 0 ? (
            <div className="space-y-2">
              {achievementBreakdown.map(a => (
                <div key={a.key} className="flex items-center gap-3">
                  <span className="text-xl">{a.emoji}</span>
                  <span className="text-sm flex-1">{a.title}</span>
                  <span className="text-sm font-bold text-emerald-400">{a.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">Achievements being unlocked…</p>
          )}
        </div>

        {/* Live feed */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Live connections</p>
          {feed.length > 0 ? (
            <div className="space-y-2">
              {feed.map(f => (
                <div key={f.id} className="text-sm flex items-center justify-between">
                  <span className="text-slate-300 truncate">
                    🤝 <span className="font-medium">{f.a}</span> × <span className="font-medium">{f.b}</span>
                  </span>
                  <span className="text-slate-600 text-xs ml-2 shrink-0">{f.at}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">Waiting for first connection…</p>
          )}
        </div>
      </div>
    </div>
  )
}
