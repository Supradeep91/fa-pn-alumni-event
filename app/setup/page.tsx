'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { CLASS_YEARS, CLASS_LABELS, CLASS_COLORS, type ClassYear } from '@/types'

export default function SetupPage() {
  const [name, setName] = useState('')
  const [classYear, setClassYear] = useState<ClassYear | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!classYear) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      name: name.trim(),
      class_year: classYear,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/passport')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-slate-950">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <div className="text-4xl">🛂</div>
          <h1 className="text-xl font-bold">Set up your passport</h1>
          <p className="text-sm text-slate-400">This takes 10 seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Your name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="First name is fine"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-3">Your class year</label>
            <div className="grid grid-cols-4 gap-2">
              {CLASS_YEARS.map(year => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setClassYear(year)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition border-2 ${
                    classYear === year
                      ? `${CLASS_COLORS[year]} border-transparent text-white`
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {CLASS_LABELS[year]}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim() || !classYear}
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating passport…' : 'Get my passport →'}
          </button>
        </form>
      </div>
    </div>
  )
}
