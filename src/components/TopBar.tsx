import { Bell } from 'lucide-react'
import { APP_NAME } from '../data/mockData'

export default function TopBar({
  unreadCount,
  onOpenNotifications,
  onOpenProfile,
}: {
  unreadCount: number
  onOpenNotifications: () => void
  onOpenProfile: () => void
}) {
  return (
    <div className="sticky top-0 z-30 bg-[#F7F8F6]/95 backdrop-blur">
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">✅</span>
          <span className="font-display font-bold text-[15px] tracking-tight text-ink-900">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNotifications}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            className="relative h-9 w-9 flex items-center justify-center rounded-full bg-white border border-ink-100 active:bg-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
          >
            <Bell size={17} className="text-ink-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-coral-500 text-white text-[10px] font-semibold flex items-center justify-center" aria-hidden="true">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenProfile}
            aria-label="Profile"
            className="h-9 w-9 rounded-full bg-primary-500 text-white text-sm font-semibold flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
          >
            R
          </button>
        </div>
      </div>
    </div>
  )
}
