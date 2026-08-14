import { createClient } from '@/lib/supabase-client'

export type AchievementKey =
  | 'time_traveller'
  | 'leadership_unlock'
  | 'perfect_stranger'
  | 'future_match'
  | 'full_house'

export interface AchievementDef {
  key: AchievementKey
  title: string
  description: string
  emoji: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: 'time_traveller',
    title: 'Time Traveller',
    description: 'Collect stamps from 5+ different cohort years',
    emoji: '⏳',
  },
  {
    key: 'leadership_unlock',
    title: 'Leadership Unlock',
    description: 'Connect with the CEO or CFO',
    emoji: '🔑',
  },
  {
    key: 'perfect_stranger',
    title: 'Perfect Stranger',
    description: 'Make your very first connection',
    emoji: '🤝',
  },
  {
    key: 'future_match',
    title: 'Future Match',
    description: 'Flag someone as a future connection',
    emoji: '🚀',
  },
  {
    key: 'full_house',
    title: 'Full House',
    description: 'Collect stamps from every cohort at the event + CEO & CFO',
    emoji: '🏆',
  },
]

export const ACHIEVEMENT_MAP = Object.fromEntries(
  ACHIEVEMENTS.map(a => [a.key, a])
) as Record<AchievementKey, AchievementDef>

// Run after every stamp confirmation or future match flag.
// Returns keys of newly unlocked achievements.
export async function checkAndUnlockAchievements(
  userId: string
): Promise<AchievementKey[]> {
  const supabase = createClient()

  // Fetch current stamps for this user
  const { data: stamps } = await supabase
    .from('stamps')
    .select('user_a, user_b, partner_a:profiles!stamps_user_a_fkey(class_year), partner_b:profiles!stamps_user_b_fkey(class_year)')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)

  // Fetch already unlocked achievements
  const { data: existing } = await supabase
    .from('achievements')
    .select('key')
    .eq('user_id', userId)

  const unlocked = new Set((existing ?? []).map(a => a.key as AchievementKey))

  // Fetch future matches
  const { data: futureMatches } = await supabase
    .from('future_matches')
    .select('id')
    .eq('flagger_id', userId)

  // Build partner class years
  const partnerClasses = new Set<string>()
  let hasLeadership = false

  for (const s of stamps ?? []) {
    const isA = s.user_a === userId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partnerClass = (isA ? (s as any).partner_b : (s as any).partner_a)?.class_year as string
    if (partnerClass) {
      partnerClasses.add(partnerClass)
      if (partnerClass === 'CEO' || partnerClass === 'CFO') hasLeadership = true
    }
  }

  const totalStamps = (stamps ?? []).length
  const hasFutureMatch = (futureMatches ?? []).length > 0

  // Fetch all present class years from profiles (for Full House)
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('class_year')
  const presentClasses = new Set((allProfiles ?? []).map(p => p.class_year))

  // Evaluate which achievements should now be unlocked
  const toUnlock: AchievementKey[] = []

  if (!unlocked.has('perfect_stranger') && totalStamps >= 1)
    toUnlock.push('perfect_stranger')

  if (!unlocked.has('time_traveller') && partnerClasses.size >= 5)
    toUnlock.push('time_traveller')

  if (!unlocked.has('leadership_unlock') && hasLeadership)
    toUnlock.push('leadership_unlock')

  if (!unlocked.has('future_match') && hasFutureMatch)
    toUnlock.push('future_match')

  if (!unlocked.has('full_house') && presentClasses.size > 0) {
    const hasAll = [...presentClasses].every(c => c === userId || partnerClasses.has(c))
    if (hasAll && partnerClasses.size >= presentClasses.size - 1)
      toUnlock.push('full_house')
  }

  // Insert newly unlocked achievements
  if (toUnlock.length > 0) {
    await supabase.from('achievements').insert(
      toUnlock.map(key => ({ user_id: userId, key }))
    )
  }

  return toUnlock
}
