'use client'

import { useState } from 'react'
import { AGENDA } from '@/lib/agenda-data'
import BottomNav from '@/components/BottomNav'

const STATUS_BADGE: Record<string, string> = {
  fixed: 'bg-purple-600 text-white',
  wip: 'bg-yellow-500 text-slate-900',
  '50/50': 'bg-orange-500 text-white',
}

const STATUS_LABEL: Record<string, string> = {
  fixed: 'Fixed',
  wip: 'WIP',
  '50/50': '50/50',
}

export default function AgendaPage() {
  const [activeDay, setActiveDay] = useState(0)
  const day = AGENDA[activeDay]

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
        {AGENDA.map((d, i) => (
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
        {day.sessions.map((session, i) => (
          <div
            key={i}
            className={`rounded-2xl px-4 py-3 ${
              session.isAlumniEvent
                ? 'bg-cyan-900/40 border border-cyan-700'
                : 'bg-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-3 items-start flex-1 min-w-0">
                <span className="text-xs text-slate-400 font-mono shrink-0 pt-0.5 w-10">
                  {session.time}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-snug ${
                    session.isAlumniEvent ? 'text-cyan-300' : 'text-white'
                  }`}>
                    {session.title}
                  </p>
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
              {session.status && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[session.status]}`}>
                  {STATUS_LABEL[session.status]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="agenda" />
    </div>
  )
}
