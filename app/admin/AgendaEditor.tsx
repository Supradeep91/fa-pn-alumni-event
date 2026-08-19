'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface AgendaSession {
  id: string
  day: string
  sort_order: number
  time: string
  title: string
  speaker: string | null
  location: string | null
  duration: string | null
  status: string | null
  is_alumni_event: boolean
  is_highlighted: boolean
}

function parseDurationMins(duration: string): number | null {
  const minMatch = duration.match(/^(\d+)\s*min$/)
  if (minMatch) return parseInt(minMatch[1])
  const hrMatch = duration.match(/^(\d+(?:\.\d+)?)\s*h$/)
  if (hrMatch) return Math.round(parseFloat(hrMatch[1]) * 60)
  return null
}

function addMins(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const DAYS = [
  { key: 'day1', label: 'Day 1 — Mo 21.09' },
  { key: 'day2', label: 'Day 2 — Di 22.09' },
]

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-0.5 bg-slate-600 rounded-lg px-2 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
    </div>
  )
}

export default function AgendaEditor() {
  const [sessions, setSessions] = useState<AgendaSession[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<AgendaSession>>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('agenda_sessions')
      .select('*')
      .order('sort_order')
      .order('time')
    setSessions(data ?? [])
    setLoading(false)
  }

  function startEdit(s: AgendaSession) {
    setEditingId(s.id)
    setForm({ ...s })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({})
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)

    const current = sessions.find(s => s.id === editingId)

    await supabase.from('agenda_sessions').update({
      time: form.time,
      title: form.title,
      speaker: form.speaker || null,
      location: form.location || null,
      duration: form.duration || null,
      status: form.status || null,
      is_alumni_event: form.is_alumni_event ?? false,
    }).eq('id', editingId)

    // Auto-shift the immediate next session if duration is parseable
    if (current && form.time && form.duration) {
      const mins = parseDurationMins(form.duration)
      if (mins !== null) {
        const endTime = addMins(form.time, mins)
        const next = sessions
          .filter(s => s.day === current.day && s.sort_order > current.sort_order)
          .sort((a, b) => a.sort_order - b.sort_order)[0]
        if (next && next.time !== endTime) {
          await supabase.from('agenda_sessions').update({ time: endTime }).eq('id', next.id)
        }
      }
    }

    await load()
    cancelEdit()
    setSaving(false)
  }

  async function deleteSession(id: string) {
    if (!confirm('Delete this session?')) return
    await supabase.from('agenda_sessions').delete().eq('id', id)
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  async function toggleHighlight(id: string, current: boolean) {
    if (current) {
      await supabase.from('agenda_sessions').update({ is_highlighted: false }).eq('id', id)
      setSessions(prev => prev.map(s => s.id === id ? { ...s, is_highlighted: false } : s))
    } else {
      await supabase.from('agenda_sessions').update({ is_highlighted: false }).neq('id', 'none')
      await supabase.from('agenda_sessions').update({ is_highlighted: true }).eq('id', id)
      setSessions(prev => prev.map(s => ({ ...s, is_highlighted: s.id === id })))
    }
  }

  async function addSession(day: string) {
    const daySessions = sessions.filter(s => s.day === day)
    const maxOrder = daySessions.length > 0 ? Math.max(...daySessions.map(s => s.sort_order)) : 0
    const { data } = await supabase
      .from('agenda_sessions')
      .insert({ day, time: '00:00', title: 'New session', sort_order: maxOrder + 10 })
      .select()
      .single()
    if (data) {
      const row = data as AgendaSession
      setSessions(prev => [...prev, row])
      startEdit(row)
    }
  }

  if (loading) return <p className="text-slate-500 text-sm py-4">Loading agenda…</p>

  return (
    <div className="space-y-6">
      {DAYS.map(({ key, label }) => {
        const daySessions = sessions
          .filter(s => s.day === key)
          .sort((a, b) => a.sort_order - b.sort_order || a.time.localeCompare(b.time))

        return (
          <div key={key} className="bg-slate-800 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-300">{label}</h2>

            <div className="space-y-1.5">
              {daySessions.map(session =>
                editingId === session.id ? (
                  <div key={session.id} className="bg-slate-700 rounded-xl p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Time" value={form.time ?? ''} onChange={v => setForm(f => ({ ...f, time: v }))} placeholder="09:00" />
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wide">Status</label>
                        <select
                          value={form.status ?? ''}
                          onChange={e => setForm(f => ({ ...f, status: e.target.value || null }))}
                          className="w-full mt-0.5 bg-slate-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="">—</option>
                          <option value="fixed">Fixed</option>
                          <option value="wip">WIP</option>
                          <option value="50/50">50/50</option>
                        </select>
                      </div>
                    </div>
                    <Field label="Title" value={form.title ?? ''} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Session title" />
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Speaker" value={form.speaker ?? ''} onChange={v => setForm(f => ({ ...f, speaker: v }))} placeholder="Name" />
                      <Field label="Location" value={form.location ?? ''} onChange={v => setForm(f => ({ ...f, location: v }))} placeholder="Room" />
                    </div>
                    <Field label="Duration" value={form.duration ?? ''} onChange={v => setForm(f => ({ ...f, duration: v }))} placeholder="30 min" />
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_alumni_event ?? false}
                        onChange={e => setForm(f => ({ ...f, is_alumni_event: e.target.checked }))}
                        className="rounded accent-cyan-500"
                      />
                      Alumni event highlight
                    </label>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={saveEdit}
                        disabled={saving || !form.title?.trim()}
                        className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900 rounded-lg text-sm transition text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={session.id} className="flex items-center gap-3 bg-slate-700/50 rounded-xl px-3 py-2.5">
                    <span className="text-xs text-slate-400 font-mono w-10 shrink-0">{session.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.title}
                      </p>
                      {(session.speaker || session.location) && (
                        <p className="text-xs text-slate-500 truncate">
                          {[session.speaker, session.location].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    {session.status && (
                      <span className="text-[10px] text-slate-500 shrink-0">{session.status}</span>
                    )}
                    <button
                      onClick={() => toggleHighlight(session.id, session.is_highlighted)}
                      title={session.is_highlighted ? 'Remove highlight' : 'Highlight as current'}
                      className={`shrink-0 p-1 text-sm transition ${session.is_highlighted ? 'opacity-100' : 'opacity-30 hover:opacity-70'}`}
                    >
                      📍
                    </button>
                    <button
                      onClick={() => startEdit(session)}
                      className="text-slate-500 hover:text-white transition shrink-0 p-1 text-sm"
                      title="Edit"
                    >
                      ✏️
                    </button>
                  </div>
                )
              )}
            </div>

            <button
              onClick={() => addSession(key)}
              className="w-full py-2 rounded-xl border border-dashed border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-400 text-sm transition"
            >
              + Add session
            </button>
          </div>
        )
      })}
    </div>
  )
}
