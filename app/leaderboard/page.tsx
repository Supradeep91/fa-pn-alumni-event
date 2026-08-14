import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LeaderboardClient from './LeaderboardClient'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Count distinct connections per class
  const { data: profiles } = await supabase.from('profiles').select('id, class_year')
  const { data: stamps } = await supabase.from('stamps').select('user_a, user_b')

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p.class_year]))

  // Count unique partners per class
  const connectionsByClass: Record<string, Set<string>> = {}
  for (const stamp of stamps ?? []) {
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

  const entries = Object.entries(connectionsByClass)
    .map(([class_year, partners]) => ({ class_year, connection_count: partners.size }))
    .sort((a, b) => b.connection_count - a.connection_count)

  const totalStamps = (stamps ?? []).length

  return <LeaderboardClient initialEntries={entries} totalStamps={totalStamps} currentUserId={user.id} />
}
