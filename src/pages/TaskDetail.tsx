import React, { useState } from 'react'
import { FileText, CheckCircle2, Circle, MoreVertical, Repeat, Pencil, Archive, Trash2 } from 'lucide-react'
import type { AppState } from '../state/store'
import { BackHeader, Card, PriorityBadge, TaskStatusBadge, ProgressBar, PrimaryButton, Sheet } from '../components/common'
import { AddTaskSheet } from '../components/CreateSheets'
import { format } from '../utils/date'

export default function TaskDetail({
  state,
  taskId,
  onBack,
  onViewSubmissions,
  onDeleted,
}: {
  state: AppState
  taskId: string
  onBack: () => void
  onViewSubmissions: (taskId: string) => void
  onDeleted: () => void
}) {
  const { tasks, classes, toggleTaskComplete, archiveTask, deleteTask } = state
  const [showMenu, setShowMenu] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const task = tasks.find((t) => t.id === taskId)
  if (!task) return null
  const cls = classes.find((c) => c.id === task.classId)
  const submitted = task.submissions?.filter((s) => s.status === 'Submitted').length ?? 0
  const total = task.totalStudents ?? task.submissions?.length ?? 0

  return (
    <div className="pb-8">
      <BackHeader
        title="Task Details"
        onBack={onBack}
        right={
          <button onClick={() => setShowMenu(true)} aria-label="Task options" className="h-8 w-8 flex items-center justify-center rounded-full active:bg-ink-100 text-ink-600">
            <MoreVertical size={18} />
          </button>
        }
      />
      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-lg font-bold text-ink-900 leading-snug">{task.title}</h1>
          <button onClick={() => toggleTaskComplete(task.id)} aria-label={task.status === 'Completed' ? 'Mark as not completed' : 'Mark as completed'} className="shrink-0 mt-0.5 text-ink-300">
            {task.status === 'Completed' ? <CheckCircle2 size={24} className="text-primary-500" /> : <Circle size={24} />}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <PriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
          {task.recurrence !== 'None' && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-ink-100 text-ink-600">
              <Repeat size={12} /> {task.recurrence}
            </span>
          )}
        </div>

        <Card className="p-4 mt-5">
          <p className="text-xs font-medium text-ink-400 mb-3">Information</p>
          <InfoRow label="Class" value={cls?.name ?? '—'} />
          <InfoRow label="Subject" value={task.subject} />
          <InfoRow label="Deadline" value={format(task.deadline, 'full')} />
          <InfoRow label="Priority" value={task.priority} />
          <InfoRow label="Status" value={task.status} last />
        </Card>

        <div className="mt-5">
          <p className="text-xs font-medium text-ink-400 mb-2">Description</p>
          <Card className="p-4">
            <p className="text-sm text-ink-700 leading-relaxed">{task.description}</p>
          </Card>
        </div>

        {task.attachments.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium text-ink-400 mb-2">Attached Resources</p>
            <Card className="divide-y divide-ink-100">
              {task.attachments.map((f) => (
                <div key={f} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <FileText size={16} />
                  </div>
                  <span className="text-sm text-ink-700 truncate">{f}</span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {task.submissions && (
          <div className="mt-5">
            <p className="text-xs font-medium text-ink-400 mb-2">Submission Progress</p>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-ink-900">{submitted} / {total} Submitted</span>
                <span className="text-xs text-ink-400">{Math.round((submitted / total) * 100)}%</span>
              </div>
              <ProgressBar value={(submitted / total) * 100} />
            </Card>
            <PrimaryButton className="mt-3" onClick={() => onViewSubmissions(task.id)}>
              View Submissions
            </PrimaryButton>
          </div>
        )}
      </div>

      <Sheet open={showMenu} onClose={() => setShowMenu(false)} title="Task Options">
        <div className="flex flex-col gap-1">
          <MenuAction icon={<Pencil size={17} />} label="Edit Task" onClick={() => { setShowMenu(false); setShowEdit(true) }} />
          <MenuAction icon={<Archive size={17} />} label="Archive Task" onClick={() => { setShowMenu(false); archiveTask(task.id); onDeleted() }} />
          <MenuAction icon={<Trash2 size={17} />} label="Delete Task" tone="danger" onClick={() => { setShowMenu(false); setConfirmDelete(true) }} />
        </div>
      </Sheet>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this task?">
        <p className="text-sm text-ink-600 mb-4">This can't be undone. The task and its submission records will be permanently removed.</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              deleteTask(task.id)
              setConfirmDelete(false)
              onDeleted()
            }}
            className="w-full rounded-xl bg-coral-500 text-white font-medium text-sm py-3"
          >
            Delete Task
          </button>
          <button onClick={() => setConfirmDelete(false)} className="w-full rounded-xl border border-ink-200 text-ink-700 font-medium text-sm py-3">
            Cancel
          </button>
        </div>
      </Sheet>

      <AddTaskSheet open={showEdit} onClose={() => setShowEdit(false)} state={state} editingTaskId={task.id} />
    </div>
  )
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${last ? '' : 'border-b border-ink-100'}`}>
      <span className="text-sm text-ink-500">{label}</span>
      <span className="text-sm font-medium text-ink-900">{value}</span>
    </div>
  )
}

function MenuAction({ icon, label, onClick, tone }: { icon: React.ReactNode; label: string; onClick: () => void; tone?: 'danger' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl active:bg-ink-50 text-left ${tone === 'danger' ? 'text-coral-600' : 'text-ink-900'}`}
    >
      <span className={tone === 'danger' ? 'text-coral-500' : 'text-ink-500'}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
