import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'
import AdminClient from './AdminClient'
import { type AchievementKey } from '@/lib/achievements'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!isAdmin(user.email)) redirect('/passport')

  const [profilesRes, stampsRes, achievementsRes] = await Promise.all([
    supabase.from('profiles').select('id, name, class_year, created_at'),
    supabase.from('stamps').select('id, user_a, user_b, created_at'),
    supabase.from('achievements').select('user_id, key, created_at'),
  ])

  const profiles = profilesRes.data ?? []
  const stamps = stampsRes.data ?? []
  const achievements = achievementsRes.data ?? []

  // Stamp count per user
  const stampCounts: Record<string, number> = {}
  for (const s of stamps) {
    stampCounts[s.user_a] = (stampCounts[s.user_a] ?? 0) + 1
    stampCounts[s.user_b] = (stampCounts[s.user_b] ?? 0) + 1
  }

  // Badge count per user
  const badgeCounts: Record<string, number> = {}
  for (const a of achievements) {
    badgeCounts[a.user_id] = (badgeCounts[a.user_id] ?? 0) + 1
  }

  // Achievement winners per key
  const winnerMap: Record<string, string[]> = {}
  const profileNames = new Map(profiles.map(p => [p.id, p.name]))
  for (const a of achievements) {
    if (!winnerMap[a.key]) winnerMap[a.key] = []
    winnerMap[a.key].push(profileNames.get(a.user_id) ?? '?')
  }

  // Class leaderboard
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

  const attendees = profiles.map(p => ({
    id: p.id,
    name: p.name,
    class_year: p.class_year,
    stamps: stampCounts[p.id] ?? 0,
    badges: badgeCounts[p.id] ?? 0,
  }))

  return (
    <AdminClient
      initialAttendeeCount={profiles.length}
      initialStampCount={stamps.length}
      initialAchievementCount={achievements.length}
      initialLeaderboard={leaderboard}
      initialWinners={winnerMap as Record<AchievementKey, string[]>}
      initialAttendees={attendees}
    />
  )
}
