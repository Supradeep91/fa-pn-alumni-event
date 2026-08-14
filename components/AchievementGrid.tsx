import { ACHIEVEMENTS, type AchievementKey } from '@/lib/achievements'

interface Props {
  unlockedKeys: AchievementKey[]
}

export default function AchievementGrid({ unlockedKeys }: Props) {
  const unlocked = new Set(unlockedKeys)

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Achievements — {unlocked.size}/{ACHIEVEMENTS.length}
      </h2>
      <div className="space-y-2">
        {ACHIEVEMENTS.map(a => {
          const done = unlocked.has(a.key)
          return (
            <div
              key={a.key}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 transition ${
                done ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-slate-800 opacity-50'
              }`}
            >
              <span className={`text-2xl ${done ? '' : 'grayscale'}`}>{a.emoji}</span>
              <div>
                <p className={`text-sm font-semibold ${done ? 'text-white' : 'text-slate-400'}`}>
                  {a.title}
                </p>
                <p className="text-xs text-slate-500">{a.description}</p>
              </div>
              {done && (
                <span className="ml-auto text-yellow-400 text-sm shrink-0">✓</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
