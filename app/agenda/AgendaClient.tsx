'use client'

import { useEffect, useMemo, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import { type AgendaDay } from '@/lib/agenda-data'

interface Props {
  agenda: AgendaDay[]
}

function timeToMins(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return isNaN(h) ? Infinity : h * 60 + m
}

export default function AgendaClient({ agenda }: Props) {
  const [activeDay, setActiveDay] = useState(0)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const day = agenda[activeDay]

  const hasManualHighlight = useMemo(
    () => day.sessions.some(s => s.isHighlighted),
    [day]
  )

  const autoActiveIdx = useMemo(() => {
    if (!now || hasManualHighlight) return -1
    const currentMins = now.getHours() * 60 + now.getMinutes()
    let active = -1
    day.sessions.forEach((s, i) => {
      if (timeToMins(s.time) <= currentMins) active = i
    })
    return active
  }, [now, day, hasManualHighlight])

  return (
    <div className="min-h-dvh bg-slate-950 pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Event Agenda</h1>
        {day.room && (
          <p className="text-xs text-slate-500 mt-1">📍 {day.room}</p>
        )}
      </div>

      {/* Day tabs */}
      <div className="flex mx-4 bg-slate-800 rounded-xl p-1 mb-4">
        {agenda.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              activeDay === i ? 'bg-slate-600 text-white' : 'text-slate-400'
            }`}
          >
            <span>{d.label}</span>
            <span className="block text-xs font-normal opacity-70">{d.date}</span>
          </button>
        ))}
      </div>

      {/* Sessions */}
      <div className="px-4 space-y-2">
        {day.sessions.map((session, i) => {
          const isNow = session.isHighlighted || i === autoActiveIdx

          return (
            <div
              key={i}
              className={`rounded-2xl px-4 py-3 transition-all ${
                isNow
                  ? 'bg-cyan-900/50 border-2 border-cyan-500 shadow-[0_0_16px_rgba(6,182,212,0.25)]'
                  : session.isAlumniEvent
                  ? 'bg-cyan-900/40 border border-cyan-700'
                  : 'bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-3 items-start flex-1 min-w-0">
                  <span className="text-xs text-slate-400 font-mono shrink-0 pt-0.5 w-10">
                    {session.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium leading-snug ${
                        isNow ? 'text-cyan-200' : session.isAlumniEvent ? 'text-cyan-300' : 'text-white'
                      }`}>
                        {session.title}
                      </p>
                      {isNow && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
                          Now
                        </span>
                      )}
                    </div>
                    {session.speaker && (
                      <p className="text-xs text-slate-400 mt-0.5">{session.speaker}</p>
                    )}
                    {session.location && (
                      <p className="text-xs text-slate-500 mt-0.5">📍 {session.location}</p>
                    )}
                    {session.duration && (
                      <p className="text-xs text-slate-500 mt-0.5">⏱ {session.duration}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav active="agenda" />
    </div>
  )
}
