export interface Session {
  time: string
  title: string
  speaker?: string
  location?: string
  duration?: string
  status?: 'fixed' | 'wip' | '50/50'
  isAlumniEvent?: boolean
  isHighlighted?: boolean
}

export interface AgendaDay {
  label: string
  date: string
  room?: string
  sessions: Session[]
}

export const AGENDA: AgendaDay[] = [
  {
    label: 'Day 1',
    date: 'Mo 21.09',
    room: 'MR-DE ERL S SP 1./G.2/4 Sydney',
    sessions: [
      { time: '09:00', title: 'Welcome and Opening', duration: '15 min', status: 'fixed' },
      { time: '09:30', title: 'Newbie Session', duration: '45 min', status: 'fixed' },
      { time: '10:00', title: 'Networking / Group Work', status: 'wip' },
      { time: '11:00', title: 'Learning: Benedikt × Secret Sauce for your career', status: 'fixed' },
      { time: '12:00', title: 'Cantine Lunch', speaker: 'Voucher provided by Oliver Brauburger' },
      { time: '13:00', title: 'Business Update', speaker: 'Norbert / Markus', duration: '30 min', status: 'fixed' },
      { time: '14:00', title: 'Get to know the Nordics (virtual)', speaker: 'Anja Elmer', duration: '60 min', status: 'fixed' },
      { time: '14:30', title: 'Führung (2–3 Gruppen) + Physical AI with Carsten', duration: '1.5–2h', status: 'wip' },
      { time: '17:00', title: 'Hotel Check-in', location: 'NH Hotel' },
      {
        time: '18:00',
        title: 'Alumni Event — FA PN Connection Challenge',
        location: 'Design Office Terrace',
        isAlumniEvent: true,
      },
      { time: '24:00', title: 'End of Day 1' },
    ],
  },
  {
    label: 'Day 2',
    date: 'Di 22.09',
    room: 'Directly F80 start',
    sessions: [
      { time: '08:30', title: 'Arrival & Check-in', duration: '30 min' },
      { time: '09:00', title: 'Guido selling SDA', location: 'F80', duration: '60 min', status: 'fixed' },
      { time: '10:00', title: 'Alternativ: Christian K — PDP Follow Up', status: '50/50' },
      { time: '11:00', title: 'Team-building Activity — Scavenger Hunt (Schnitzeljagd)', location: '@ Campus' },
      { time: '12:00', title: 'Lunch', speaker: 'Voucher provided by Oliver Brauburger', duration: '90 min', status: 'fixed' },
      { time: '13:00', title: 'Insights to SDA & Physical AI', speaker: 'Matthias L.', status: 'fixed' },
      { time: '14:00', title: 'Insights to SDA', speaker: 'Arno Z.', status: 'fixed' },
      { time: '15:00', title: 'Quiz', duration: '30 min', status: 'fixed' },
      { time: '15:30', title: 'Speaker Update, Election Feedback & Farewell', speaker: 'David, Nils, Claudio', duration: '30 min', status: 'fixed' },
    ],
  },
]
