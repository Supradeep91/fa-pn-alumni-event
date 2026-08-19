import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) redirect('/passport')

  const [profilesRes, stampsRes, achievementsRes] = await Promise.all([
    supabase.from('profiles').select('id, email, name, class_year, created_at').order('created_at'),
    supabase.from('stamps').select('user_a, user_b, created_at').order('created_at'),
    supabase.from('achievements').select('user_id, key, created_at').order('created_at'),
  ])

  return (
    <AdminClient
      profiles={profilesRes.data ?? []}
      stamps={stampsRes.data ?? []}
      achievements={achievementsRes.data ?? []}
    />
  )
}
