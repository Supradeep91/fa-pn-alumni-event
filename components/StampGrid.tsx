import { getClassLabel, getClassColor, type ClassYear } from '@/types'

interface Props {
  collectedYears: ClassYear[]
}

export default function StampGrid({ collectedYears }: Props) {
  if (collectedYears.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 space-y-2">
        <p className="text-3xl">🌍</p>
        <p className="text-sm">No stamps yet — go meet someone!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Stamps collected — {collectedYears.length}
      </h2>
      <div className="flex flex-wrap gap-2">
        {collectedYears.map((year, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${getClassColor(year)}`}
          >
            <span>✓</span>
            <span>{getClassLabel(year)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
