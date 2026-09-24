import React from 'react'
import { ClipboardCheck, CalendarClock, Users2, AlertTriangle, CheckCheck } from 'lucide-react'
import type { AppState } from '../state/store'
import type { NotificationItem } from '../types'
import { BackHeader, Card, EmptyState } from '../components/common'

const kindMeta: Record<NotificationItem['kind'], { icon: React.ElementType; tone: string }> = {
  submission: { icon: ClipboardCheck, tone: 'text-primary-600 bg-primary-50' },
  deadline: { icon: CalendarClock, tone: 'text-coral-500 bg-coral-500/10' },
  meeting: { icon: Users2, tone: 'text-sky-500 bg-sky-500/10' },
  alert: { icon: AlertTriangle, tone: 'text-amber-500 bg-amber-500/10' },
}

export default function Notifications({ state, onBack, onOpenTask }: { state: AppState; onBack: () => void; onOpenTask: (id: string) => void }) {
  const { notificationsList, markNotificationRead, markAllNotificationsRead } = state

  function handleTap(n: NotificationItem) {
    markNotificationRead(n.id)
    if (n.linkedTaskId) onOpenTask(n.linkedTaskId)
  }

  return (
    <div className="pb-8">
      <BackHeader
        title="Notifications"
        onBack={onBack}
        right={
          <button onClick={markAllNotificationsRead} aria-label="Mark all as read" className="text-primary-600">
            <CheckCheck size={18} />
          </button>
        }
      />
      <div className="px-5 pt-4">
        {notificationsList.length === 0 ? (
          <EmptyState icon={<ClipboardCheck size={26} />} title="You're all caught up 🎉" />
        ) : (
          <Card className="divide-y divide-ink-100">
            {notificationsList.map((n) => {
              const meta = kindMeta[n.kind]
              const Icon = meta.icon
              return (
                <button
                  key={n.id}
                  onClick={() => handleTap(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left ${!n.read ? 'bg-primary-50/40' : ''}`}
                >
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${meta.tone}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${n.read ? 'text-ink-600' : 'text-ink-900 font-medium'}`}>{n.message}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{n.createdAt}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary-500 mt-1.5 shrink-0" aria-hidden="true" />}
                </button>
              )
            })}
          </Card>
        )}
      </div>
    </div>
  )
}
