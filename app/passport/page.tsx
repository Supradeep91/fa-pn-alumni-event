import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PassportClient from './PassportClient'

export default async function PassportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/setup')

  // Get all stamps involving this user
  const { data: stamps } = await supabase
    .from('stamps')
    .select('*, partner_a:profiles!stamps_user_a_fkey(id,name,class_year,linkedin_url), partner_b:profiles!stamps_user_b_fkey(id,name,class_year,linkedin_url)')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)

  const partners = (stamps ?? []).map(s => {
    const isA = s.user_a === user.id
    return isA ? s.partner_b : s.partner_a
  })

  return <PassportClient profile={profile} initialPartners={partners} />
}
