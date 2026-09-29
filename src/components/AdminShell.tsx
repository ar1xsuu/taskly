import type { ReactNode } from 'react'
import { Bell, LogOut } from 'lucide-react'
import type { PageKey } from '../types'
import { APP_NAME, SCHOOL_NAME } from '../data/mockData'

const tabs: { key: PageKey; label: string }[] = [
  { key: 'adminHome', label: 'Overview' },
  { key: 'adminTeachers', label: 'Teachers' },
  { key: 'adminClasses', label: 'Classes' },
  { key: 'adminReports', label: 'Reports' },
  { key: 'adminAnnouncements', label: 'Announcements' },
]

// adminTeacherProfile sits under the Teachers tab.
const activeTabFor = (page: PageKey): PageKey => (page === 'adminTeacherProfile' ? 'adminTeachers' : page === 'adminNotifications' ? 'adminHome' : page)

export default function AdminShell({
  page,
  userName,
  alertCount,
  onNavigate,
  onLogout,
  children,
  toast,
}: {
  page: PageKey
  userName: string
  alertCount: number
  onNavigate: (p: PageKey) => void
  onLogout: () => void
  children: ReactNode
  toast: ReactNode
}) {
  const active = activeTabFor(page)
  return (
    <div className="min-h-screen bg-[#F7F8F6]">
      <header className="sticky top-0 z-30 bg-white border-b border-ink-100">
        <div className="max-w-5xl mx-auto px-5 pt-4 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-display font-bold text-[15px] text-ink-900">{APP_NAME} <span className="font-medium text-ink-400">· SHS Monitoring</span></p>
            <p className="text-xs text-ink-400 truncate">{SCHOOL_NAME} · {userName}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('adminNotifications')}
              aria-label={alertCount > 0 ? `Alerts, ${alertCount} need attention` : 'Alerts'}
              className="relative h-9 w-9 rounded-full bg-white border border-ink-100 flex items-center justify-center text-ink-600 active:bg-ink-50"
            >
              <Bell size={16} />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-coral-500 text-white text-[10px] font-semibold flex items-center justify-center" aria-hidden="true">
                  {alertCount}
                </span>
              )}
            </button>
            <button onClick={onLogout} aria-label="Log out" className="h-9 w-9 rounded-full bg-white border border-ink-100 flex items-center justify-center text-ink-500 active:bg-ink-50">
              <LogOut size={15} />
            </button>
          </div>
        </div>
        <nav aria-label="SHS Head sections" className="max-w-5xl mx-auto px-3 mt-2 flex overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onNavigate(t.key)}
              aria-current={active === t.key ? 'page' : undefined}
              className={`shrink-0 px-3.5 py-2.5 text-sm border-b-2 ${
                active === t.key ? 'border-primary-500 text-primary-700 font-medium' : 'border-transparent text-ink-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-5 pb-12">{children}</main>
      {toast}
    </div>
  )
}
