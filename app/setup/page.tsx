'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { SPECIAL_ROLES, getClassColor, type ClassYear } from '@/types'

const YEAR_OPTIONS = Array.from({ length: 27 }, (_, i) => String(26 - i).padStart(2, '0'))

type Step = 'name' | 'cohort' | 'linkedin' | 'done'

const STEPS: Step[] = ['name', 'cohort', 'linkedin', 'done']

function ProgressDots({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current)
  return (
    <div className="flex gap-1.5 justify-center">
      {STEPS.slice(0, -1).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all ${i <= idx ? 'bg-cyan-500 w-4' : 'bg-slate-700 w-1.5'}`} />
      ))}
    </div>
  )
}

export default function SetupPage() {
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [classYear, setClassYear] = useState<ClassYear | null>(null)
  const [linkedin, setLinkedin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function saveAndFinish(linkedinVal: string) {
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const payload: Record<string, unknown> = {
      id: user.id, email: user.email, name: name.trim(), class_year: classYear,
    }
    if (linkedinVal.trim()) payload.linkedin_url = linkedinVal.trim()

    const { error } = await supabase.from('profiles').insert(payload)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setStep('done')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-950 px-6">

      {/* Step: name */}
      {step === 'name' && (
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div className="space-y-3">
            <ProgressDots current="name" />
            <div className="text-center space-y-1">
              <div className="text-4xl">🛂</div>
              <h1 className="text-2xl font-bold">Welcome to FA PN Connect</h1>
              <p className="text-sm text-slate-400">Scan QR codes to collect stamps, earn badges, and reconnect with your cohort.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Your name</label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setStep('cohort') }}
                placeholder="First name is fine"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
            <button
              onClick={() => setStep('cohort')}
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold transition disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step: cohort */}
      {step === 'cohort' && (
        <div className="flex-1 flex flex-col justify-center space-y-6 py-8">
          <div className="space-y-3">
            <ProgressDots current="cohort" />
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold">Which cohort are you from?</h2>
              <p className="text-xs text-slate-500">Connect with 5+ cohorts tonight to earn the ⏳ Time Traveller badge</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="rounded-xl border border-slate-700 overflow-hidden divide-y divide-slate-800 max-h-52 overflow-y-auto">
              {YEAR_OPTIONS.map(year => {
                const selected = classYear === year
                return (
                  <button key={year} type="button" onClick={() => setClassYear(year)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${selected ? 'bg-slate-700' : 'bg-slate-800/60 hover:bg-slate-800'}`}>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${selected ? getClassColor(year) : 'bg-slate-600'}`} />
                    <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-slate-300'}`}>20{year}</span>
                    {selected && <span className="ml-auto text-cyan-400 text-sm">✓</span>}
                  </button>
                )
              })}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SPECIAL_ROLES.map(role => {
                const selected = classYear === role
                return (
                  <button key={role} type="button" onClick={() => setClassYear(role)}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition border-2 ${selected ? `${getClassColor(role)} border-transparent text-white` : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    {role}
                  </button>
                )
              })}
            </div>
          </div>
          <button
            onClick={() => setStep('linkedin')}
            disabled={!classYear}
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold transition disabled:opacity-40"
          >
            Continue →
          </button>
          <button onClick={() => setStep('name')} className="text-xs text-slate-600 underline text-center">Back</button>
        </div>
      )}

      {/* Step: linkedin */}
      {step === 'linkedin' && (
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div className="space-y-3">
            <ProgressDots current="linkedin" />
            <div className="text-center space-y-1">
              <div className="text-3xl">💼</div>
              <h2 className="text-xl font-bold">Add your LinkedIn</h2>
              <p className="text-sm text-slate-400">People you connect with tonight can find you after the event</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">linkedin.com/in/</span>
              <input
                type="text"
                autoFocus
                value={linkedin}
                onChange={e => setLinkedin(e.target.value.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/?/, ''))}
                placeholder="your-handle"
                className="w-full pl-36 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={() => saveAndFinish(linkedin)}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Setting up…' : 'Finish setup →'}
            </button>
            <button
              onClick={() => saveAndFinish('')}
              disabled={loading}
              className="w-full text-xs text-slate-500 underline"
            >
              Skip for now
            </button>
          </div>
          <button onClick={() => setStep('cohort')} className="text-xs text-slate-600 underline text-center">Back</button>
        </div>
      )}

      {/* Step: done */}
      {step === 'done' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-3">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold">Your passport is ready!</h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Show your QR code to connect with someone, or scan theirs. Every connection counts.
            </p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-5 space-y-2 w-full max-w-xs">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Tonight's mission</p>
            <div className="space-y-1 text-sm text-left text-slate-300">
              <p>🤝 Make your first connection</p>
              <p>⏳ Collect stamps from 5+ cohorts</p>
              <p>🔑 Find the CEO or CFO</p>
              <p>🏆 Aim for Full House</p>
            </div>
          </div>
          <button
            onClick={() => router.replace('/passport')}
            className="w-full max-w-xs py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-lg transition"
          >
            Go to my passport →
          </button>
        </div>
      )}
    </div>
  )
}
