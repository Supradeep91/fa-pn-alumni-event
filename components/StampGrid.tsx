import { CLASS_YEARS, CLASS_LABELS, CLASS_COLORS, type ClassYear } from '@/types'

interface Props {
  collectedYears: ClassYear[]
}

export default function StampGrid({ collectedYears }: Props) {
  const collected = new Set(collectedYears)

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Stamps collected — {collected.size}/{CLASS_YEARS.length}
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {CLASS_YEARS.map(year => {
          const stamped = collected.has(year)
          return (
            <div
              key={year}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition ${
                stamped
                  ? `${CLASS_COLORS[year]} text-white shadow-md`
                  : 'bg-slate-800 text-slate-600 border border-slate-700'
              }`}
            >
              {stamped ? '✓' : ''}
              <span className={stamped ? 'text-white/80 text-[10px]' : 'text-slate-600 text-[10px]'}>
                {CLASS_LABELS[year]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
