import { Megaphone, Pin } from 'lucide-react'
import type { AppState } from '../state/store'
import type { AnnouncementAudience, AnnouncementPriority } from '../types'
import { BackHeader, Card, EmptyState, PinnedBadge } from '../components/common'

const audienceLabel: Record<AnnouncementAudience, string> = {
  all: 'All SHS Teachers',
  grade11: 'Grade 11',
  grade12: 'Grade 12',
}

const priorityStyle: Record<AnnouncementPriority, string> = {
  Normal: 'bg-ink-100 text-ink-600',
  Important: 'bg-amber-500/10 text-amber-600',
  Urgent: 'bg-coral-500/10 text-coral-600',
}

export default function Announcements({ state, onBack }: { state: AppState; onBack: () => void }) {
  const { announcementsList } = state
  const sorted = [...announcementsList].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return (
    <div className="pb-8">
      <BackHeader title="Announcements" onBack={onBack} />
      <div className="px-5 pt-4">
        <p className="text-xs text-ink-400 mb-4 flex items-center gap-1.5">
          <Pin size={12} /> Posted by the SHS Head — view only.
        </p>
        {sorted.length === 0 ? (
          <EmptyState icon={<Megaphone size={26} />} title="No new announcements" subtitle="You're all caught up." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {sorted.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-medium text-sm text-ink-900">{a.title}</p>
                  {a.pinned && <PinnedBadge />}
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyle[a.priority]}`}>{a.priority}</span>
                </div>
                <p className="text-sm text-ink-600 leading-relaxed">{a.content}</p>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-2.5 py-1">{audienceLabel[a.audience]}</span>
                  <span className="text-xs text-ink-400">{a.createdBy} · {a.postedAt}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
