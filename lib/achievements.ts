import { createClient } from '@/lib/supabase-client'

export type AchievementKey =
  | 'perfect_stranger'
  | 'wanderer'
  | 'time_traveller'
  | 'leadership_unlock'
  | 'mentored'
  | 'full_house'

export interface AchievementDef {
  key: AchievementKey
  title: string
  description: string
  emoji: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: 'perfect_stranger',
    title: 'Perfect Stranger',
    description: 'Make your very first connection',
    emoji: '🤝',
  },
  {
    key: 'wanderer',
    title: 'Wanderer',
    description: 'Collect stamps from 3 different cohort years',
    emoji: '🗺️',
  },
  {
    key: 'time_traveller',
    title: 'Time Traveller',
    description: 'Collect stamps from 5 different cohort years',
    emoji: '⏳',
  },
  {
    key: 'leadership_unlock',
    title: 'Leadership Unlock',
    description: 'Connect with the CEO or CFO',
    emoji: '🔑',
  },
  {
    key: 'mentored',
    title: 'Mentored',
    description: 'Connect with a Coach',
    emoji: '🎓',
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

// Run after every stamp confirmation.
// Returns keys of newly unlocked achievements.
export async function checkAndUnlockAchievements(
  userId: string
): Promise<AchievementKey[]> {
  const supabase = createClient()

  const [stampsRes, existingRes, allProfilesRes, myProfileRes] = await Promise.all([
    supabase
      .from('stamps')
      .select('user_a, user_b, partner_a:profiles!stamps_user_a_fkey(class_year), partner_b:profiles!stamps_user_b_fkey(class_year)')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`),
    supabase
      .from('achievements')
      .select('key')
      .eq('user_id', userId),
    supabase
      .from('profiles')
      .select('class_year'),
    supabase
      .from('profiles')
      .select('class_year')
      .eq('id', userId)
      .single(),
  ])

  const unlocked = new Set((existingRes.data ?? []).map(a => a.key as AchievementKey))

  // Build partner class set
  const partnerClasses = new Set<string>()
  for (const s of stampsRes.data ?? []) {
    const isA = s.user_a === userId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partnerClass = (isA ? (s as any).partner_b : (s as any).partner_a)?.class_year as string
    if (partnerClass) partnerClasses.add(partnerClass)
  }

  const totalStamps = (stampsRes.data ?? []).length
  const hasLeadership = partnerClasses.has('CEO') || partnerClasses.has('CFO')
  const hasCoach = partnerClasses.has('Coach')

  // All cohort years present at the event (excludes CEO/CFO/Coach for Full House check)
  const presentCohorts = new Set(
    (allProfilesRes.data ?? [])
      .map(p => p.class_year as string)
      .filter(y => y !== 'CEO' && y !== 'CFO' && y !== 'Coach')
  )

  // User's own class year — don't require self-stamping for Full House
  const myClassYear = myProfileRes.data?.class_year as string | undefined

  // Count distinct regular cohort years in partner set (excludes special roles)
  const partnerCohortYears = new Set(
    [...partnerClasses].filter(y => y !== 'CEO' && y !== 'CFO' && y !== 'Coach')
  )

  const toUnlock: AchievementKey[] = []

  if (!unlocked.has('perfect_stranger') && totalStamps >= 1)
    toUnlock.push('perfect_stranger')

  if (!unlocked.has('wanderer') && partnerCohortYears.size >= 3)
    toUnlock.push('wanderer')

  if (!unlocked.has('time_traveller') && partnerCohortYears.size >= 5)
    toUnlock.push('time_traveller')

  if (!unlocked.has('leadership_unlock') && hasLeadership)
    toUnlock.push('leadership_unlock')

  if (!unlocked.has('mentored') && hasCoach)
    toUnlock.push('mentored')

  // Full House: stamp from every cohort year at the event (excl. own) + CEO & CFO
  // Require at least 5 distinct cohorts present to prevent trivial test unlocks
  if (!unlocked.has('full_house') && presentCohorts.size >= 5 && hasLeadership) {
    const requiredCohorts = [...presentCohorts].filter(c => c !== myClassYear)
    const hasAll = requiredCohorts.every(c => partnerClasses.has(c))
    if (hasAll) toUnlock.push('full_house')
  }

  if (toUnlock.length > 0) {
    await supabase.from('achievements').insert(
      toUnlock.map(key => ({ user_id: userId, key }))
    )
  }

  return toUnlock
}
