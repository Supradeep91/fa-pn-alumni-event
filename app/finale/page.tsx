import { createClient } from '@/lib/supabase-server'
import FinaleClient from './FinaleClient'
import { type AchievementKey } from '@/lib/achievements'

export default async function FinalePage() {
  const supabase = await createClient()

  const [profilesRes, stampsRes, achievementsRes] = await Promise.all([
    supabase.from('profiles').select('id, class_year'),
    supabase.from('stamps').select('user_a, user_b'),
    supabase.from('achievements').select('user_id, key, created_at'),
  ])

  const profiles = profilesRes.data ?? []
  const stamps = stampsRes.data ?? []
  const achievements = achievementsRes.data ?? []

  // Class champion (most connections)
  const profileMap = new Map(profiles.map(p => [p.id, p.class_year]))
  const connectionsByClass: Record<string, Set<string>> = {}
  for (const stamp of stamps) {
    const classA = profileMap.get(stamp.user_a)
    const classB = profileMap.get(stamp.user_b)
    if (classA) {
      if (!connectionsByClass[classA]) connectionsByClass[classA] = new Set()
      connectionsByClass[classA].add(stamp.user_b)
    }
    if (classB) {
      if (!connectionsByClass[classB]) connectionsByClass[classB] = new Set()
      connectionsByClass[classB].add(stamp.user_a)
    }
  }
  const leaderboard = Object.entries(connectionsByClass)
    .map(([class_year, partners]) => ({ class_year, count: partners.size }))
    .sort((a, b) => b.count - a.count)

  // Achievement first winners per key
  const firstWinners: Partial<Record<AchievementKey, string>> = {}
  const profileNamesRes = await supabase.from('profiles').select('id, name')
  const profileNames = new Map((profileNamesRes.data ?? []).map(p => [p.id, p.name]))

  const byKey: Record<string, typeof achievements[0][]> = {}
  for (const a of achievements) {
    if (!byKey[a.key]) byKey[a.key] = []
    byKey[a.key].push(a)
  }
  for (const [key, list] of Object.entries(byKey)) {
    const earliest = list.sort((a, b) => a.created_at.localeCompare(b.created_at))[0]
    firstWinners[key as AchievementKey] = profileNames.get(earliest.user_id) ?? '?'
  }

  // Winner counts per key
  const winnerCounts: Partial<Record<AchievementKey, number>> = {}
  for (const [key, list] of Object.entries(byKey)) {
    winnerCounts[key as AchievementKey] = list.length
  }

  return (
    <FinaleClient
      initialStampCount={stamps.length}
      initialLeaderboard={leaderboard}
      initialFirstWinners={firstWinners}
      initialWinnerCounts={winnerCounts}
    />
  )
}
