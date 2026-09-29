import React, { useState } from 'react'
import { Upload, X, Plus } from 'lucide-react'
import type { AppState } from '../state/store'
import type { Priority, EventType, RecurrenceRule } from '../types'
import { Sheet, Field, inputClass, PrimaryButton } from './common'

const RESOURCE_FOLDERS = ['ICT', 'Practical Research', 'Media and Information Literacy', 'Empowerment Technologies', 'General Resources']

export function AddTaskSheet({
  open,
  onClose,
  state,
  onCreated,
  defaultDeadline,
  editingTaskId,
  initialTemplateId,
}: {
  open: boolean
  onClose: () => void
  state: AppState
  onCreated?: (id: string) => void
  defaultDeadline?: string
  editingTaskId?: string
  initialTemplateId?: string
}) {
  const { classes, templates, resourcesList } = state
  const editingTask = editingTaskId ? state.tasks.find((t) => t.id === editingTaskId) : undefined
  const taskTemplates = templates.filter((t) => t.kind === 'task')
  const initialTemplate = initialTemplateId ? taskTemplates.find((t) => t.id === initialTemplateId) : undefined
  const [title, setTitle] = useState(editingTask?.title ?? initialTemplate?.title ?? '')
  const [description, setDescription] = useState(editingTask?.description ?? initialTemplate?.body ?? '')
  const [classId, setClassId] = useState(editingTask?.classId ?? classes[0]?.id ?? '')
  const [deadline, setDeadline] = useState(editingTask?.deadline ?? defaultDeadline ?? '')
  const [priority, setPriority] = useState<Priority>(editingTask?.priority ?? initialTemplate?.priority ?? 'Normal')
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(editingTask?.recurrence ?? 'None')
  const [attachments, setAttachments] = useState<string[]>(editingTask?.attachments ?? [])
  const [newAttachment, setNewAttachment] = useState('')
  const [trackSubmissions, setTrackSubmissions] = useState(!!editingTask?.submissions)

  const selectedClass = classes.find((c) => c.id === classId)

  function applyTemplate(id: string) {
    const t = taskTemplates.find((tpl) => tpl.id === id)
    if (!t) return
    setTitle(t.title)
    setDescription(t.body)
    if (t.priority) setPriority(t.priority)
  }

  function addAttachment(name: string) {
    const trimmed = name.trim()
    if (!trimmed || attachments.includes(trimmed)) return
    setAttachments((prev) => [...prev, trimmed])
  }

  function removeAttachment(name: string) {
    setAttachments((prev) => prev.filter((a) => a !== name))
  }

  function reset() {
    setTitle('')
    setDescription('')
    setDeadline(defaultDeadline ?? '')
    setPriority('Normal')
    setRecurrence('None')
    setAttachments([])
    setNewAttachment('')
    setTrackSubmissions(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !deadline || !selectedClass) return
    if (editingTaskId) {
      state.updateTask(editingTaskId, {
        title: title.trim(),
        description: description.trim() || 'No additional instructions.',
        classId,
        subject: selectedClass.subject,
        deadline,
        priority,
        attachments,
        recurrence,
      })
      if (trackSubmissions !== !!editingTask?.submissions) {
        state.setSubmissionTracking(editingTaskId, trackSubmissions)
      }
      onClose()
      onCreated?.(editingTaskId)
      return
    }
    const task = state.addTask(
      {
        title: title.trim(),
        description: description.trim() || 'No additional instructions.',
        classId,
        subject: selectedClass.subject,
        deadline,
        priority,
        attachments,
        recurrence,
      },
      trackSubmissions,
    )
    reset()
    onClose()
    onCreated?.(task.id)
  }

  return (
    <Sheet open={open} onClose={onClose} title={editingTaskId ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit}>
        {!editingTaskId && taskTemplates.length > 0 && (
          <Field label="Start from a template (optional)">
            <select className={inputClass} defaultValue="" onChange={(e) => e.target.value && applyTemplate(e.target.value)}>
              <option value="">Blank task</option>
              {taskTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Task title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Check Chapter 3 drafts" required />
        </Field>
        <Field label="Description">
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions for this task" />
        </Field>
        <Field label="Class / Section">
          <select className={inputClass} value={classId} onChange={(e) => setClassId(e.target.value)}>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.subject}</option>
            ))}
          </select>
        </Field>
        <Field label="Deadline" hint="This will automatically appear on your Calendar.">
          <input type="date" className={inputClass} value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
        </Field>
        <Field label="Priority">
          <div className="grid grid-cols-4 gap-1.5">
            {(['Urgent', 'High', 'Normal', 'Low'] as Priority[]).map((p) => (
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
        <Field label="Repeat">
          <select className={inputClass} value={recurrence} onChange={(e) => setRecurrence(e.target.value as RecurrenceRule)}>
            <option value="None">Does not repeat</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Custom">Custom</option>
          </select>
        </Field>

        <Field label="Attachments (optional)">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {attachments.map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 text-ink-700 text-xs font-medium pl-2.5 pr-1.5 py-1">
                  {a}
                  <button type="button" onClick={() => removeAttachment(a)} aria-label={`Remove ${a}`} className="h-4 w-4 flex items-center justify-center rounded-full active:bg-ink-200">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {resourcesList.length > 0 && (
            <select
              className={`${inputClass} mb-2`}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) addAttachment(e.target.value)
                e.target.value = ''
              }}
            >
              <option value="">Attach from Resource Library...</option>
              {resourcesList.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-2">
            <input
              className={inputClass}
              value={newAttachment}
              onChange={(e) => setNewAttachment(e.target.value)}
              placeholder="Or type a file name to attach"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addAttachment(newAttachment)
                  setNewAttachment('')
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                addAttachment(newAttachment)
                setNewAttachment('')
              }}
              aria-label="Add attachment"
              className="h-10 w-10 shrink-0 rounded-xl bg-ink-100 text-ink-600 flex items-center justify-center active:bg-ink-200"
            >
              <Plus size={16} />
            </button>
          </div>
        </Field>

        <Field label="Submissions" hint="Generates a Pending entry for every student in this class, ready to track in Work → Submissions.">
          <label className="flex items-center gap-2.5 rounded-xl border border-ink-200 px-3.5 py-2.5">
            <input
              type="checkbox"
              checked={trackSubmissions}
              onChange={(e) => setTrackSubmissions(e.target.checked)}
              className="h-4 w-4 rounded accent-primary-500"
            />
            <span className="text-sm text-ink-700">Track student submissions for this task</span>
          </label>
        </Field>

        <PrimaryButton type="submit" className="mt-2">{editingTaskId ? 'Save Changes' : 'Create Task'}</PrimaryButton>
      </form>
    </Sheet>
  )
}

export function AddClassSheet({
  open,
  onClose,
  state,
  editingClassId,
}: {
  open: boolean
  onClose: () => void
  state: AppState
  editingClassId?: string
}) {
  const editingClass = editingClassId ? state.classes.find((c) => c.id === editingClassId) : undefined
  const [name, setName] = useState(editingClass?.name ?? '')
  const [subject, setSubject] = useState(editingClass?.subject ?? '')

  function reset() {
    setName('')
    setSubject('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !subject.trim()) return
    if (editingClassId) {
      state.updateClass(editingClassId, { name: name.trim(), subject: subject.trim() })
      onClose()
      return
    }
    state.addClass({ name: name.trim(), subject: subject.trim() })
    reset()
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editingClassId ? 'Edit Class' : 'Add Class'}>
      <form onSubmit={handleSubmit}>
        <Field label="Class / Section name" hint="e.g. 12 - STEM A">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 12 - STEM B" required />
        </Field>
        <Field label="Subject">
          <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Practical Research 2" required />
        </Field>
        {!editingClassId && (
          <p className="text-xs text-ink-400 -mt-2 mb-4">You can add students to this class afterward from Classes → Students.</p>
        )}
        <PrimaryButton type="submit" className="mt-2">{editingClassId ? 'Save Changes' : 'Add Class'}</PrimaryButton>
      </form>
    </Sheet>
  )
}

export function AddEventSheet({ open, onClose, state, defaultDate }: { open: boolean; onClose: () => void; state: AppState; defaultDate?: string }) {
  const { addEvent } = state
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate ?? '')
  const [type, setType] = useState<EventType>('Meeting')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date) return
    addEvent({ title: title.trim(), date, type })
    setTitle('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add Event">
      <form onSubmit={handleSubmit}>
        <Field label="Event title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Parent-Teacher Conference" required />
        </Field>
        <Field label="Date">
          <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <Field label="Type">
          <div className="grid grid-cols-2 gap-2">
            {(['School Event', 'Meeting', 'Personal Task', 'Deadline'] as EventType[]).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={`py-2 rounded-xl text-xs font-medium border ${type === t ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-ink-600 border-ink-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
        <PrimaryButton type="submit" className="mt-2">Add Event</PrimaryButton>
      </form>
    </Sheet>
  )
}

export function UploadResourceSheet({ open, onClose, state }: { open: boolean; onClose: () => void; state: AppState }) {
  const { addResource } = state
  const [name, setName] = useState('')
  const [folder, setFolder] = useState(RESOURCE_FOLDERS[0])
  const [tags, setTags] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addResource({ name: name.trim(), folder, size: '—', tags: tags.split(',').map((t) => t.trim()).filter(Boolean) })
    setName('')
    setTags('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Upload Resource">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-ink-200 rounded-xl py-6 mb-4 text-ink-400">
          <Upload size={22} className="mb-2" />
          <p className="text-xs">Tap to choose a file (mock)</p>
        </div>
        <Field label="File name">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Week4_Handout.pdf" required />
        </Field>
        <Field label="Folder">
          <select className={inputClass} value={folder} onChange={(e) => setFolder(e.target.value)}>
            {RESOURCE_FOLDERS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Tags (comma-separated, optional)">
          <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. ICT, Quarter 2, Activity" />
        </Field>
        <PrimaryButton type="submit" className="mt-2">Upload</PrimaryButton>
      </form>
    </Sheet>
  )
}

export function AddStudentSheet({
  open,
  onClose,
  state,
  classId,
}: {
  open: boolean
  onClose: () => void
  state: AppState
  classId: string
}) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    state.addStudent(classId, name.trim())
    setName('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add Student">
      <form onSubmit={handleSubmit}>
        <Field label="Student name" hint="Use a fictional name — no real student information.">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Juan Dela Cruz" required />
        </Field>
        <PrimaryButton type="submit" className="mt-2">Add Student</PrimaryButton>
      </form>
    </Sheet>
  )
}

export function AddNoteSheet({ open, onClose, state }: { open: boolean; onClose: () => void; state: AppState }) {
  const { addNote } = state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    addNote({ title: title.trim(), content: content.trim(), category: category.trim() || undefined })
    setTitle('')
    setContent('')
    setCategory('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="New Note">
      <form onSubmit={handleSubmit}>
        <Field label="Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Reminder for consultation" required />
        </Field>
        <Field label="Content">
          <textarea className={inputClass} rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note..." required />
        </Field>
        <Field label="Category (optional)">
          <input className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Practical Research 2" />
        </Field>
        <PrimaryButton type="submit" className="mt-2">Save Note</PrimaryButton>
      </form>
    </Sheet>
  )
}
