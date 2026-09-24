import { useState } from 'react'
import { Plus, StickyNote, Trash2 } from 'lucide-react'
import type { AppState } from '../state/store'
import { BackHeader, Card, EmptyState } from '../components/common'
import { AddNoteSheet } from '../components/CreateSheets'

export default function Notes({ state, onBack }: { state: AppState; onBack: () => void }) {
  const { notesList, deleteNote } = state
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="pb-8">
      <BackHeader
        title="Notes"
        onBack={onBack}
        right={
          <button onClick={() => setShowAdd(true)} className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
            <Plus size={16} />
          </button>
        }
      />
      <div className="px-5 pt-4">
        {notesList.length === 0 ? (
          <EmptyState icon={<StickyNote size={26} />} title="No notes yet" subtitle="Jot down a private reminder for yourself." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {notesList.map((n) => (
              <Card key={n.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm text-ink-900">{n.title}</p>
                  <button onClick={() => deleteNote(n.id)} className="text-ink-300 active:text-coral-500 shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">{n.content}</p>
                <div className="flex items-center gap-2 mt-3">
                  {n.category && <span className="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-2.5 py-1">{n.category}</span>}
                  <span className="text-xs text-ink-400">{n.createdAt}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddNoteSheet open={showAdd} onClose={() => setShowAdd(false)} state={state} />
    </div>
  )
}
