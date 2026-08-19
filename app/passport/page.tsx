import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PassportClient from './PassportClient'
import { type AchievementKey } from '@/lib/achievements'

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

  const [stampsRes, achievementsRes, futureMatchesRes, adminRes] = await Promise.all([
    supabase
      .from('stamps')
      .select('*, partner_a:profiles!stamps_user_a_fkey(id,name,class_year,linkedin_url), partner_b:profiles!stamps_user_b_fkey(id,name,class_year,linkedin_url)')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    supabase
      .from('achievements')
      .select('key')
      .eq('user_id', user.id),
    supabase
      .from('future_matches')
      .select('flagged_id')
      .eq('flagger_id', user.id),
    supabase
      .from('admin_emails')
      .select('email')
      .eq('email', user.email!.toLowerCase())
      .single(),
  ])

  const partners = (stampsRes.data ?? []).map(s => {
    const isA = s.user_a === user.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return isA ? (s as any).partner_b : (s as any).partner_a
  })

  const achievements = (achievementsRes.data ?? []).map(a => a.key as AchievementKey)
  const futureMatches = (futureMatchesRes.data ?? []).map(f => f.flagged_id as string)
  const isAdmin = !!adminRes.data

  return (
    <PassportClient
      profile={profile}
      initialPartners={partners}
      initialAchievements={achievements}
      initialFutureMatches={futureMatches}
      isAdmin={isAdmin}
    />
  )
}
