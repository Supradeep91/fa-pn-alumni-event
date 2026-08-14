import Link from 'next/link'

type Tab = 'passport' | 'scan' | 'leaderboard' | 'agenda'

const NAV_ITEMS: { id: Tab; label: string; icon: string; href: string }[] = [
  { id: 'passport', label: 'Passport', icon: '🛂', href: '/passport' },
  { id: 'scan', label: 'Scan', icon: '📷', href: '/scan' },
  { id: 'leaderboard', label: 'Rankings', icon: '🏆', href: '/leaderboard' },
  { id: 'agenda', label: 'Agenda', icon: '📅', href: '/agenda' },
]

interface Props {
  active: Tab
}

export default function BottomNav({ active }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 safe-bottom">
      <div className="flex">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition ${
              active === item.id ? 'text-cyan-400' : 'text-slate-500'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
