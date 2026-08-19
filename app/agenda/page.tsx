import { createClient } from '@/lib/supabase-server'
import AgendaClient from './AgendaClient'
import { AGENDA, type AgendaDay, type Session } from '@/lib/agenda-data'

interface DBSession {
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
  is_section_break: boolean
}

const DAY_META: Record<string, { label: string; date: string; room: string }> = {
  day1: { label: 'Day 1', date: 'Mo 21.09', room: 'MR-DE ERL S SP 1./G.2/4 Sydney' },
  day2: { label: 'Day 2', date: 'Di 22.09', room: 'Directly F80 start' },
}

function dbToAgenda(rows: DBSession[]): AgendaDay[] {
  return Object.entries(DAY_META).map(([key, meta]) => ({
    ...meta,
    sessions: rows
      .filter(r => r.day === key)
      .sort((a, b) => a.sort_order - b.sort_order || a.time.localeCompare(b.time))
      .map(r => ({
        time: r.time,
        title: r.title,
        ...(r.speaker ? { speaker: r.speaker } : {}),
        ...(r.location ? { location: r.location } : {}),
        ...(r.duration ? { duration: r.duration } : {}),
        ...(r.status ? { status: r.status as Session['status'] } : {}),
        ...(r.is_alumni_event ? { isAlumniEvent: true } : {}),
        ...(r.is_highlighted ? { isHighlighted: true } : {}),
        ...(r.is_section_break ? { isSectionBreak: true } : {}),
      })),
  }))
}

export default async function AgendaPage() {
  let agenda: AgendaDay[] = AGENDA

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('agenda_sessions')
      .select('*')
      .order('sort_order')

    if (data && data.length > 0) {
      agenda = dbToAgenda(data as DBSession[])
    }
  } catch {
    // fall back to static data
  }

  return <AgendaClient agenda={agenda} />
}
