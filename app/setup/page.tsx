'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { SPECIAL_ROLES, getClassLabel, getClassColor, type ClassYear } from '@/types'

const YEAR_OPTIONS = Array.from({ length: 26 }, (_, i) => String(i).padStart(2, '0')).reverse()

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

  function YearButton({ year }: { year: ClassYear }) {
    const selected = classYear === year
    const color = getClassColor(year)
    return (
      <button
        type="button"
        onClick={() => setClassYear(year)}
        className={`py-2 px-3 rounded-xl text-xs font-semibold transition border-2 truncate ${
          selected
            ? `${color} border-transparent text-white shadow-md`
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
        }`}
      >
        {getClassLabel(year)}
      </button>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-slate-950">
      <div className="w-full max-w-sm space-y-7">
        <div className="text-center space-y-1">
          <div className="text-4xl">🛂</div>
          <h1 className="text-xl font-bold">Set up your passport</h1>
          <p className="text-sm text-slate-400">This takes 10 seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
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

          {/* Class year selector */}
          <div>
            <label className="block text-sm text-slate-400 mb-3">
              Your FA PN cohort
              {classYear && (
                <span className="ml-2 text-white font-semibold">{getClassLabel(classYear)}</span>
              )}
            </label>

            {/* Year grid — scrollable */}
            <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-700 p-3 space-y-2 scrollbar-thin">
              <div className="grid grid-cols-4 gap-1.5">
                {YEAR_OPTIONS.map(year => (
                  <YearButton key={year} year={year} />
                ))}
              </div>
            </div>

            {/* Special roles */}
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {SPECIAL_ROLES.map(role => (
                <YearButton key={role} year={role} />
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
