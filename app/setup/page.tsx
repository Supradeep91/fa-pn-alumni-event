'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { SPECIAL_ROLES, getClassLabel, getClassColor, type ClassYear } from '@/types'

const YEAR_OPTIONS = Array.from({ length: 27 }, (_, i) =>
  String(26 - i).padStart(2, '0')
)

export default function SetupPage() {
  const [name, setName] = useState('')
  const [classYear, setClassYear] = useState<ClassYear | null>(null)
  const [linkedin, setLinkedin] = useState('')
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
      linkedin_url: linkedin.trim() || null,
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

          {/* Cohort picker */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Your FA PN cohort</label>

            {/* Scrollable year list */}
            <div className="rounded-xl border border-slate-700 overflow-hidden divide-y divide-slate-800 max-h-52 overflow-y-auto">
              {YEAR_OPTIONS.map(year => {
                const selected = classYear === year
                const color = getClassColor(year)
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setClassYear(year)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                      selected ? 'bg-slate-700' : 'bg-slate-800/60 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full shrink-0 ${selected ? color : 'bg-slate-600'}`} />
                    <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-slate-300'}`}>
                      20{year}
                    </span>
                    {selected && <span className="ml-auto text-cyan-400 text-sm">✓</span>}
                  </button>
                )
              })}
            </div>

            {/* Special roles */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SPECIAL_ROLES.map(role => {
                const selected = classYear === role
                const color = getClassColor(role)
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setClassYear(role)}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition border-2 ${
                      selected
                        ? `${color} border-transparent text-white`
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {role}
                  </button>
                )
              })}
            </div>
          </div>

          {/* LinkedIn — optional */}
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              LinkedIn <span className="text-slate-600 text-xs">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
                linkedin.com/in/
              </span>
              <input
                type="text"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/?/, ''))}
                placeholder="your-handle"
                className="w-full pl-36 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
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
