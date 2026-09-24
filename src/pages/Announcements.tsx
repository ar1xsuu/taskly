import { useState } from 'react'
import { Plus, Megaphone, Pin, Pencil } from 'lucide-react'
import type { AppState } from '../state/store'
import { BackHeader, Card, EmptyState, PinnedBadge } from '../components/common'
import { AddAnnouncementSheet } from '../components/CreateSheets'

export default function Announcements({ state, onBack }: { state: AppState; onBack: () => void }) {
  const { announcementsList, classes, togglePinAnnouncement } = state
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  function classLabel(classId: string) {
    if (classId === 'all') return 'All Classes'
    return classes.find((c) => c.id === classId)?.name ?? ''
  }

  const sorted = [...announcementsList].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return (
    <div className="pb-8">
      <BackHeader
        title="Announcements"
        onBack={onBack}
        right={
          <button onClick={() => setShowAdd(true)} aria-label="New announcement" className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
            <Plus size={16} />
          </button>
        }
      />
      <div className="px-5 pt-4">
        {sorted.length === 0 ? (
          <EmptyState icon={<Megaphone size={26} />} title="No announcements yet" subtitle="Post an update for your classes." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {sorted.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-ink-900">{a.title}</p>
                    {a.pinned && <PinnedBadge />}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => togglePinAnnouncement(a.id)} aria-label={a.pinned ? 'Unpin' : 'Pin'} className="h-7 w-7 flex items-center justify-center rounded-full text-ink-400 active:bg-ink-100">
                      <Pin size={14} className={a.pinned ? 'text-amber-500' : ''} />
                    </button>
                    <button onClick={() => setEditingId(a.id)} aria-label="Edit announcement" className="h-7 w-7 flex items-center justify-center rounded-full text-ink-400 active:bg-ink-100">
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">{a.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-2.5 py-1">{classLabel(a.classId)}</span>
                  <span className="text-xs text-ink-400">Posted {a.postedAt}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddAnnouncementSheet open={showAdd} onClose={() => setShowAdd(false)} state={state} />
      <AddAnnouncementSheet open={!!editingId} onClose={() => setEditingId(null)} state={state} editingAnnouncementId={editingId ?? undefined} />
    </div>
  )
}
