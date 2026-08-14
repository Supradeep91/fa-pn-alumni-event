const YEAR_RANGE = Array.from({ length: 26 }, (_, i) => String(i).padStart(2, '0')) as string[]

export const SPECIAL_ROLES = ['CEO', 'CFO', 'Coach'] as const
export type SpecialRole = typeof SPECIAL_ROLES[number]

export type ClassYear = string  // 'FA PN YY' years e.g. '00'–'25', or 'CEO'/'CFO'/'Coach'

export const CLASS_YEARS: ClassYear[] = [...YEAR_RANGE, ...SPECIAL_ROLES]

export function isSpecialRole(year: ClassYear): year is SpecialRole {
  return SPECIAL_ROLES.includes(year as SpecialRole)
}

export function getClassLabel(year: ClassYear): string {
  if (isSpecialRole(year)) return year
  return `FA PN '${year}`
}

const COLOR_CYCLE = [
  'bg-violet-600',
  'bg-blue-600',
  'bg-cyan-600',
  'bg-teal-600',
  'bg-emerald-600',
  'bg-green-600',
  'bg-lime-600',
  'bg-yellow-500',
  'bg-amber-500',
  'bg-orange-500',
]

export function getClassColor(year: ClassYear): string {
  if (year === 'CEO') return 'bg-red-600'
  if (year === 'CFO') return 'bg-orange-600'
  if (year === 'Coach') return 'bg-pink-600'
  const idx = parseInt(year, 10) % COLOR_CYCLE.length
  return COLOR_CYCLE[idx]
}

// Legacy named exports kept for existing component compatibility
export const CLASS_LABELS: Record<string, string> = Object.fromEntries(
  CLASS_YEARS.map(y => [y, getClassLabel(y)])
)
export const CLASS_COLORS: Record<string, string> = Object.fromEntries(
  CLASS_YEARS.map(y => [y, getClassColor(y)])
)

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
