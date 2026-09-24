import React, { useState } from 'react'
import { ChevronDown, ChevronUp, ListTodo, Megaphone, FolderOpen, CalendarClock } from 'lucide-react'
import type { AppState } from '../state/store'
import { BackHeader, Card, EmptyState } from '../components/common'

const QUARTERS: { key: string; label: string }[] = [
  { key: 'Q1', label: 'Quarter 1' },
  { key: 'Q2', label: 'Quarter 2' },
  { key: 'Q3', label: 'Quarter 3' },
  { key: 'Q4', label: 'Quarter 4' },
]

export default function Archive({ state, onBack, onOpenTask }: { state: AppState; onBack: () => void; onOpenTask: (id: string) => void }) {
  const { tasks, archivedTasks, announcementsList, resourcesList, eventsList } = state
  const [open, setOpen] = useState<string>('Q1')

  return (
    <div className="pb-8">
      <BackHeader title="Archive" onBack={onBack} />
      <div className="px-5 pt-4">
        <p className="text-xs text-ink-400 mb-4">School Year 2026–2027</p>

        {archivedTasks.length > 0 && (
          <div className="mb-5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-ink-400 mb-2">
              <ListTodo size={13} /> Archived Tasks ({archivedTasks.length})
            </p>
            <Card className="divide-y divide-ink-100">
              {archivedTasks.map((t) => (
                <button key={t.id} onClick={() => onOpenTask(t.id)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                  <span className="text-sm text-ink-700 truncate pr-2">{t.title}</span>
                  <span className="text-xs text-ink-400 shrink-0">Archived</span>
                </button>
              ))}
            </Card>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {QUARTERS.map((q) => {
            const isOpen = open === q.key
            const qTasks = tasks.filter((t) => t.quarter === q.key)
            const qAnnouncements = announcementsList.filter((a) => a.quarter === q.key)
            const qResources = resourcesList.filter((r) => r.quarter === q.key)
            const qEvents = eventsList.filter((e) => e.quarter === q.key)
            const total = qTasks.length + qAnnouncements.length + qResources.length + qEvents.length

            return (
              <Card key={q.key} className="overflow-hidden">
                <button onClick={() => setOpen(isOpen ? '' : q.key)} className="w-full flex items-center justify-between px-4 py-3.5">
                  <div className="text-left">
                    <p className="font-display font-semibold text-sm text-ink-900">{q.label}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{total} items</p>
                  </div>
                  {isOpen ? <ChevronUp size={18} className="text-ink-400" /> : <ChevronDown size={18} className="text-ink-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-ink-100 pt-3">
                    {total === 0 ? (
                      <EmptyState icon={<span className="text-xl">📦</span>} title="Nothing here yet" />
                    ) : (
                      <div className="flex flex-col gap-3">
                        <ArchiveGroup icon={<ListTodo size={14} />} label="Tasks" items={qTasks.map((t) => t.title)} />
                        <ArchiveGroup icon={<Megaphone size={14} />} label="Announcements" items={qAnnouncements.map((a) => a.title)} />
                        <ArchiveGroup icon={<FolderOpen size={14} />} label="Resources" items={qResources.map((r) => r.name)} />
                        <ArchiveGroup icon={<CalendarClock size={14} />} label="Events" items={qEvents.map((e) => e.title)} />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ArchiveGroup({ icon, label, items }: { icon: React.ReactNode; label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">{icon} {label} ({items.length})</p>
      <ul className="pl-1">
        {items.slice(0, 4).map((i, idx) => (
          <li key={idx} className="text-xs text-ink-600 py-0.5 truncate">· {i}</li>
        ))}
      </ul>
    </div>
  )
}
