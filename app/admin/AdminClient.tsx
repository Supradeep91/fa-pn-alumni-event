'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { getClassLabel, getClassColor } from '@/types'

interface ProfileRow { id: string; email: string; name: string; class_year: string; created_at: string }
interface StampRow   { user_a: string; user_b: string; created_at: string }
interface AchRow     { user_id: string; key: string; created_at: string }

interface Props {
  profiles: ProfileRow[]
  stamps: StampRow[]
  achievements: AchRow[]
}

export default function AdminClient({ profiles, stamps: initialStamps, achievements: initialAchievements }: Props) {
  const [stamps, setStamps] = useState<StampRow[]>(initialStamps)
  const [achievements, setAchievements] = useState<AchRow[]>(initialAchievements)
  const [tab, setTab] = useState<'overview' | 'attendees'>('overview')

  useEffect(() => {
    const supabase = createClient()
    const ch = supabase.channel('admin-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stamps' },
        p => setStamps(prev => [...prev, p.new as StampRow]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'achievements' },
        p => setAchievements(prev => [...prev, p.new as AchRow]))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const profileMap = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles])

  const connectorCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const s of stamps) {
      c[s.user_a] = (c[s.user_a] ?? 0) + 1
      c[s.user_b] = (c[s.user_b] ?? 0) + 1
    }
    return c
  }, [stamps])

  const topConnectors = useMemo(() =>
    profiles
      .map(p => ({ ...p, count: connectorCounts[p.id] ?? 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    [profiles, connectorCounts])

  const timeline = useMemo(() => {
    const h: Record<number, number> = {}
    for (const s of stamps) {
      const hr = new Date(s.created_at).getHours()
      h[hr] = (h[hr] ?? 0) + 1
    }
    const entries = Object.entries(h).sort(([a], [b]) => +a - +b)
    const max = Math.max(...entries.map(([, v]) => v), 1)
    return entries.map(([hr, count]) => ({ hr: +hr, count, pct: Math.round((count / max) * 100) }))
  }, [stamps])

  const cohortActivity = useMemo(() => {
    const c: Record<string, number> = {}
    for (const s of stamps) {
      const ya = profileMap.get(s.user_a)?.class_year
      const yb = profileMap.get(s.user_b)?.class_year
      if (ya) c[ya] = (c[ya] ?? 0) + 1
      if (yb) c[yb] = (c[yb] ?? 0) + 1
    }
    const max = Math.max(...Object.values(c), 1)
    return Object.entries(c)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([year, count]) => ({ year, count, pct: Math.round((count / max) * 100) }))
  }, [stamps, profileMap])

  const achievementBreakdown = useMemo(() => {
    const c: Record<string, string[]> = {}
    for (const a of achievements) {
      if (!c[a.key]) c[a.key] = []
      c[a.key].push(a.user_id)
    }
    return ACHIEVEMENTS.map(a => ({
      ...a,
      count: c[a.key]?.length ?? 0,
      names: (c[a.key] ?? []).map(id => profileMap.get(id)?.name ?? '?').slice(0, 3),
    }))
  }, [achievements, profileMap])

  const recentStamps = useMemo(() =>
    [...stamps].reverse().slice(0, 10).map(s => ({
      a: profileMap.get(s.user_a)?.name ?? '?',
      b: profileMap.get(s.user_b)?.name ?? '?',
      at: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })),
    [stamps, profileMap])

  const attendees = useMemo(() =>
    profiles.map(p => ({ ...p, count: connectorCounts[p.id] ?? 0 }))
      .sort((a, b) => b.count - a.count),
    [profiles, connectorCounts])

  return (
    <div className="min-h-dvh bg-slate-950 text-white pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/passport" className="text-slate-400 hover:text-white transition text-sm">← Passport</a>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin Panel</h1>
            <p className="text-[11px] text-slate-500">FA PN Connect · 21.09</p>
          </div>
        </div>
        <a
          href="/finale"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold transition"
        >
          🎬 Launch Finale
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Registered', value: profiles.length, color: 'text-cyan-400' },
            { label: 'Connections', value: stamps.length, color: 'text-emerald-400' },
            { label: 'Badges earned', value: achievements.length, color: 'text-violet-400' },
            { label: 'Top connector', value: topConnectors[0]?.count ?? 0, sub: topConnectors[0]?.name, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 rounded-2xl p-4">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              {s.sub && <p className="text-[11px] text-slate-500 truncate">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex bg-slate-800 rounded-xl p-1">
          {(['overview', 'attendees'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition ${tab === t ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>
              {t === 'overview' ? '📊 Overview' : `👥 Attendees (${profiles.length})`}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">

            {/* Timeline */}
            {timeline.length > 0 && (
              <section className="bg-slate-800 rounded-2xl p-4">
                <h2 className="text-sm font-semibold text-slate-300 mb-3">Stamp activity by hour</h2>
                <div className="flex items-end gap-1 h-20">
                  {timeline.map(({ hr, count, pct }) => (
                    <div key={hr} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] text-slate-500">{count}</span>
                      <div
                        className="w-full bg-cyan-500 rounded-t"
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                      <span className="text-[9px] text-slate-500">{hr}h</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Top connectors */}
            <section className="bg-slate-800 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Top connectors</h2>
              <div className="space-y-2">
                {topConnectors.filter(c => c.count > 0).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs w-4">{i + 1}</span>
                    <div className={`w-7 h-7 rounded-full ${getClassColor(c.class_year)} flex items-center justify-center text-xs font-bold`}>
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-[11px] text-slate-500">{getClassLabel(c.class_year)}</p>
                    </div>
                    <span className="text-sm font-bold text-cyan-400">{c.count}</span>
                  </div>
                ))}
                {topConnectors.every(c => c.count === 0) && (
                  <p className="text-sm text-slate-500">No connections yet</p>
                )}
              </div>
            </section>

            {/* Cohort activity */}
            {cohortActivity.length > 0 && (
              <section className="bg-slate-800 rounded-2xl p-4">
                <h2 className="text-sm font-semibold text-slate-300 mb-3">Most active cohorts</h2>
                <div className="space-y-2">
                  {cohortActivity.map(({ year, count, pct }) => (
                    <div key={year} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-10">{getClassLabel(year)}</span>
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Achievement breakdown */}
            <section className="bg-slate-800 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Achievements unlocked</h2>
              <div className="space-y-3">
                {achievementBreakdown.map(a => (
                  <div key={a.key} className="flex items-start gap-3">
                    <span className="text-2xl">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-[11px] text-slate-500">{a.names.join(', ')}{a.count > 3 ? ` +${a.count - 3} more` : ''}</p>
                    </div>
                    <span className={`text-sm font-bold ${a.count > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>{a.count}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent activity */}
            {recentStamps.length > 0 && (
              <section className="bg-slate-800 rounded-2xl p-4">
                <h2 className="text-sm font-semibold text-slate-300 mb-3">Recent connections</h2>
                <div className="space-y-2">
                  {recentStamps.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">🤝 <span className="font-medium">{s.a}</span> × <span className="font-medium">{s.b}</span></span>
                      <span className="text-slate-500 text-xs">{s.at}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {tab === 'attendees' && (
          <section className="bg-slate-800 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-700">
              {attendees.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-slate-600 text-xs w-5">{i + 1}</span>
                  <div className={`w-8 h-8 rounded-full ${getClassColor(a.class_year)} flex items-center justify-center text-sm font-bold shrink-0`}>
                    {a.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-[11px] text-slate-500">{getClassLabel(a.class_year)} · {a.email}</p>
                  </div>
                  <span className={`text-sm font-bold ${a.count > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                    {a.count}
                  </span>
                </div>
              ))}
              {attendees.length === 0 && (
                <p className="px-4 py-8 text-center text-slate-500 text-sm">No attendees yet</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
