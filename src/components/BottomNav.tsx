import React from 'react'
import { Home, ClipboardList, Users, Calendar, Menu } from 'lucide-react'
import type { PageKey } from '../types'

const items: { key: PageKey; label: string; icon: React.ElementType }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'work', label: 'Work', icon: ClipboardList },
  { key: 'classes', label: 'Classes', icon: Users },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'more', label: 'More', icon: Menu },
]

// Every page in the app maps onto one of the five tabs so the right icon
// stays highlighted no matter how deep the person has navigated.
const groupMap: Record<PageKey, PageKey> = {
  home: 'home',
  search: 'home',
  work: 'work',
  taskDetail: 'work',
  submissions: 'work',
  announcements: 'work',
  classes: 'classes',
  classDetail: 'classes',
  calendar: 'calendar',
  more: 'more',
  resources: 'more',
  notes: 'more',
  reports: 'more',
  notifications: 'more',
  archive: 'more',
  templates: 'more',
}

export default function BottomNav({ active, onNavigate }: { active: PageKey; onNavigate: (p: PageKey) => void }) {
  const activeGroup = groupMap[active] ?? 'home'
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink-100 max-w-md mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Primary"
    >
      <div className="flex items-stretch justify-between px-1">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = activeGroup === key
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[52px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-inset"
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} className={isActive ? 'text-primary-600' : 'text-ink-400'} />
              <span className={`text-[11px] ${isActive ? 'text-primary-600 font-medium' : 'text-ink-400'}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
