'use client'

import { useEffect, useState } from 'react'
import { ACHIEVEMENT_MAP, type AchievementKey } from '@/lib/achievements'

interface Props {
  newKeys: AchievementKey[]
  onDone: () => void
}

export default function AchievementToast({ newKeys, onDone }: Props) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      if (current < newKeys.length - 1) {
        setCurrent(c => c + 1)
      } else {
        onDone()
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [current, visible, newKeys.length, onDone])

  if (!newKeys.length || !visible) return null

  const achievement = ACHIEVEMENT_MAP[newKeys[current]]

  return (
    <div className="fixed top-6 inset-x-4 z-50 flex justify-center pointer-events-none">
      <div className="bg-yellow-400 text-slate-900 rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-4 max-w-sm w-full pointer-events-auto animate-in slide-in-from-top-4 duration-300">
        <span className="text-4xl shrink-0">{achievement.emoji}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-60">Achievement unlocked!</p>
          <p className="font-bold text-base leading-tight">{achievement.title}</p>
          <p className="text-xs opacity-70 mt-0.5">{achievement.description}</p>
        </div>
        {newKeys.length > 1 && (
          <span className="ml-auto text-xs font-semibold opacity-50 shrink-0">
            {current + 1}/{newKeys.length}
          </span>
        )}
      </div>
    </div>
  )
}
