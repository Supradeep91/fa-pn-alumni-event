import { createClient } from '@/lib/supabase-server'
import FinaleClient from './FinaleClient'

export default async function FinalePage() {
  const supabase = await createClient()

  const [profilesRes, stampsRes, achievementsRes] = await Promise.all([
    supabase.from('profiles').select('id, name, class_year'),
    supabase.from('stamps').select('user_a, user_b, created_at').order('created_at', { ascending: false }),
    supabase.from('achievements').select('user_id, key'),
  ])

  return (
    <FinaleClient
      profiles={profilesRes.data ?? []}
      stamps={stampsRes.data ?? []}
      achievements={achievementsRes.data ?? []}
    />
  )
}
