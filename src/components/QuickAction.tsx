import React from 'react'
import { Plus, ListTodo, Megaphone, CalendarPlus, FolderPlus, StickyNote } from 'lucide-react'
import { Sheet } from './common'

export type CreateKind = 'task' | 'announcement' | 'event' | 'resource' | 'note'

const options: { key: CreateKind; label: string; icon: React.ElementType }[] = [
  { key: 'task', label: 'Task', icon: ListTodo },
  { key: 'announcement', label: 'Announcement', icon: Megaphone },
  { key: 'event', label: 'Event', icon: CalendarPlus },
  { key: 'resource', label: 'Resource', icon: FolderPlus },
  { key: 'note', label: 'Note', icon: StickyNote },
]

export function QuickActionButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Create new"
      className="fixed z-40 h-14 w-14 rounded-full bg-primary-500 text-white shadow-floating flex items-center justify-center active:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
      style={{
        right: 'max(20px, calc((100vw - 448px) / 2 + 20px))',
        bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <Plus size={24} />
    </button>
  )
}

export function QuickActionSheet({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (kind: CreateKind) => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Create New">
      <div className="grid grid-cols-1 gap-1.5 pb-1">
        {options.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl active:bg-ink-50 text-left"
          >
            <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <Icon size={18} />
            </div>
            <span className="text-sm font-medium text-ink-900">{label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}
