export type ClassYear = '20' | '21' | '22' | '23' | '24' | '25' | 'CEO' | 'CFO'

export const CLASS_YEARS: ClassYear[] = ['20', '21', '22', '23', '24', '25', 'CEO', 'CFO']

export const CLASS_LABELS: Record<ClassYear, string> = {
  '20': 'Class \'20',
  '21': 'Class \'21',
  '22': 'Class \'22',
  '23': 'Class \'23',
  '24': 'Class \'24',
  '25': 'Class \'25',
  'CEO': 'CEO',
  'CFO': 'CFO',
}

export const CLASS_COLORS: Record<ClassYear, string> = {
  '20': 'bg-purple-500',
  '21': 'bg-blue-500',
  '22': 'bg-cyan-500',
  '23': 'bg-teal-500',
  '24': 'bg-green-500',
  '25': 'bg-yellow-500',
  'CEO': 'bg-red-500',
  'CFO': 'bg-orange-500',
}

export interface Profile {
  id: string
  email: string
  name: string
  class_year: ClassYear
  created_at: string
}

export interface Stamp {
  id: string
  user_a: string
  user_b: string
  created_at: string
}

export interface PendingStamp {
  id: string
  initiator_id: string
  target_id: string
  status: 'pending' | 'confirmed' | 'rejected' | 'expired'
  created_at: string
  expires_at: string
}

export interface StampWithProfile extends Stamp {
  partner: Profile
}

export interface LeaderboardEntry {
  class_year: ClassYear
  connection_count: number
}
