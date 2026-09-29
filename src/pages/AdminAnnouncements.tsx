import React, { useState } from 'react'
import { Plus, Megaphone, Pin, Pencil, Trash2 } from 'lucide-react'
import type { AppState } from '../state/store'
import type { AnnouncementAudience, AnnouncementPriority } from '../types'
import { Card, EmptyState, PinnedBadge, Sheet, Field, inputClass, PrimaryButton } from '../components/common'

const audienceLabel: Record<AnnouncementAudience, string> = {
  all: 'All SHS Teachers',
  grade11: 'Grade 11 Teachers',
  grade12: 'Grade 12 Teachers',
}

const priorityStyle: Record<AnnouncementPriority, string> = {
  Normal: 'bg-ink-100 text-ink-600',
  Important: 'bg-amber-500/10 text-amber-600',
  Urgent: 'bg-coral-500/10 text-coral-600',
}

export default function AdminAnnouncements({ state }: { state: AppState }) {
  const { announcementsList, togglePinAnnouncement, deleteAnnouncement } = state
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const sorted = [...announcementsList].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Announcements</h1>
          <p className="text-sm text-ink-500 mt-0.5">Official SHS notices. Teachers can read these but not post.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-full bg-primary-500 text-white text-xs font-medium pl-2.5 pr-3 py-2 active:bg-primary-600 shrink-0"
        >
          <Plus size={14} /> New
        </button>
      </div>

      <div className="max-w-2xl">
        {sorted.length === 0 ? (
          <EmptyState icon={<Megaphone size={26} />} title="No announcements yet" subtitle="Post something and every SHS teacher will see it." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {sorted.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-ink-900">{a.title}</p>
                    {a.pinned && <PinnedBadge />}
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyle[a.priority]}`}>{a.priority}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => togglePinAnnouncement(a.id)} aria-label={a.pinned ? 'Unpin' : 'Pin'} className="h-7 w-7 flex items-center justify-center rounded-full text-ink-400 active:bg-ink-100">
                      <Pin size={14} className={a.pinned ? 'text-amber-500' : ''} />
                    </button>
                    <button onClick={() => setEditingId(a.id)} aria-label="Edit announcement" className="h-7 w-7 flex items-center justify-center rounded-full text-ink-400 active:bg-ink-100">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmDeleteId(a.id)} aria-label="Delete announcement" className="h-7 w-7 flex items-center justify-center rounded-full text-ink-400 active:bg-ink-100 active:text-coral-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">{a.content}</p>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-2.5 py-1">{audienceLabel[a.audience]}</span>
                  <span className="text-xs text-ink-400">
                    {a.createdBy} · {a.postedAt}
                    {a.expiresAt && ` · expires ${a.expiresAt}`}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AnnouncementForm open={showAdd} onClose={() => setShowAdd(false)} state={state} />
      <AnnouncementForm open={!!editingId} onClose={() => setEditingId(null)} state={state} editingId={editingId ?? undefined} />

      <Sheet open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Delete this announcement?">
        <p className="text-sm text-ink-600 mb-4">This can't be undone — teachers will no longer see it.</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              if (confirmDeleteId) deleteAnnouncement(confirmDeleteId)
              setConfirmDeleteId(null)
            }}
            className="w-full rounded-xl bg-coral-500 text-white font-medium text-sm py-3"
          >
            Delete
          </button>
          <button onClick={() => setConfirmDeleteId(null)} className="w-full rounded-xl border border-ink-200 text-ink-700 font-medium text-sm py-3">
            Cancel
          </button>
        </div>
      </Sheet>
    </div>
  )
}

function AnnouncementForm({ open, onClose, state, editingId }: { open: boolean; onClose: () => void; state: AppState; editingId?: string }) {
  const editing = editingId ? state.announcementsList.find((a) => a.id === editingId) : undefined
  const announcementTemplates = state.templates.filter((t) => t.kind === 'announcement')
  const [title, setTitle] = useState(editing?.title ?? '')
  const [content, setContent] = useState(editing?.content ?? '')
  const [audience, setAudience] = useState<AnnouncementAudience>(editing?.audience ?? 'all')
  const [priority, setPriority] = useState<AnnouncementPriority>(editing?.priority ?? 'Normal')
  const [scheduledFor, setScheduledFor] = useState(editing?.scheduledFor ?? '')
  const [expiresAt, setExpiresAt] = useState(editing?.expiresAt ?? '')
  const [pinned, setPinned] = useState(editing?.pinned ?? false)

  function applyTemplate(id: string) {
    const t = announcementTemplates.find((tpl) => tpl.id === id)
    if (!t) return
    setTitle(t.title)
    setContent(t.body)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    if (editingId) {
      state.updateAnnouncement(editingId, {
        title: title.trim(),
        content: content.trim(),
        audience,
        priority,
        scheduledFor: scheduledFor || undefined,
        expiresAt: expiresAt || undefined,
        pinned,
      })
      onClose()
      return
    }
    state.addAnnouncement({
      title: title.trim(),
      content: content.trim(),
      audience,
      priority,
      scheduledFor: scheduledFor || undefined,
      expiresAt: expiresAt || undefined,
      pinned,
    })
    setTitle('')
    setContent('')
    setScheduledFor('')
    setExpiresAt('')
    setPinned(false)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editingId ? 'Edit Announcement' : 'New Announcement'}>
      <form onSubmit={handleSubmit}>
        {!editingId && announcementTemplates.length > 0 && (
          <Field label="Start from a template (optional)">
            <select className={inputClass} defaultValue="" onChange={(e) => e.target.value && applyTemplate(e.target.value)}>
              <option value="">Blank announcement</option>
              {announcementTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Faculty meeting today at 3:00 PM" required />
        </Field>
        <Field label="Message">
          <textarea className={inputClass} rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write the announcement..." required />
        </Field>
        <Field label="Audience">
          <select className={inputClass} value={audience} onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}>
            <option value="all">All SHS Teachers</option>
            <option value="grade11">Grade 11 Teachers</option>
            <option value="grade12">Grade 12 Teachers</option>
          </select>
        </Field>
        <Field label="Priority">
          <div className="grid grid-cols-3 gap-1.5">
            {(['Normal', 'Important', 'Urgent'] as AnnouncementPriority[]).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={`py-2 rounded-xl text-xs font-medium border ${priority === p ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-ink-600 border-ink-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Schedule for later (optional)">
          <input type="datetime-local" className={inputClass} value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
        </Field>
        <Field label="Expires on (optional)">
          <input type="date" className={inputClass} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </Field>
        <Field label="Pin to top of teacher dashboards">
          <label className="flex items-center gap-2.5 rounded-xl border border-ink-200 px-3.5 py-2.5">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="h-4 w-4 rounded accent-primary-500" />
            <span className="text-sm text-ink-700">Pin this announcement</span>
          </label>
        </Field>
        <PrimaryButton type="submit" className="mt-2">
          {editingId ? 'Save Changes' : scheduledFor ? 'Schedule Announcement' : 'Publish Announcement'}
        </PrimaryButton>
      </form>
    </Sheet>
  )
}
