import React, { useState } from 'react'
import { Users, ChevronRight, ClipboardList, ClipboardCheck, Megaphone, Search, Plus, MoreVertical, Pencil, Trash2, UserPlus, X } from 'lucide-react'
import type { AppState } from '../state/store'
import type { ClassTab } from '../types'
import { Card, BackHeader, SegmentedControl, PriorityBadge, TaskStatusBadge, EmptyState, PinnedBadge, Sheet } from '../components/common'
import { AddClassSheet, AddStudentSheet } from '../components/CreateSheets'
import { classGradeLevel } from '../utils/permissions'

export function Classes({ state, onOpenClass }: { state: AppState; onOpenClass: (id: string) => void }) {
  const { classes, tasks } = state
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="pb-6">
      <div className="px-5 pt-4 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Classes</h1>
          <p className="text-sm text-ink-500 mt-1">{classes.length} sections this quarter</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          aria-label="Add class"
          className="h-9 w-9 rounded-full bg-primary-500 text-white flex items-center justify-center active:bg-primary-600 shrink-0"
        >
          <Plus size={18} />
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="px-5">
          <EmptyState icon={<Users size={26} />} title="No classes yet" subtitle="Add a class to start creating tasks for it." />
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-2.5">
          {classes.map((c) => {
            const activeTasks = tasks.filter((t) => t.classId === c.id && t.status !== 'Completed').length
            const pending = tasks
              .filter((t) => t.classId === c.id)
              .reduce((sum, t) => sum + (t.submissions?.filter((s) => s.status !== 'Submitted').length ?? 0), 0)
            return (
              <Card key={c.id} className="p-4" onClick={() => onOpenClass(c.id)}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm text-ink-900">{c.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{c.subject}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-ink-400 flex-wrap">
                      <Users size={13} />
                      <span>{c.studentCount} students</span>
                      <span className="mx-0.5">·</span>
                      <span>{activeTasks} active tasks</span>
                      {pending > 0 && (
                        <>
                          <span className="mx-0.5">·</span>
                          <span className="text-coral-600 font-medium">{pending} pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-ink-300 shrink-0" />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <AddClassSheet open={showAdd} onClose={() => setShowAdd(false)} state={state} />
    </div>
  )
}

export function ClassDetail({
  state,
  classId,
  onBack,
  onOpenTask,
  onDeleted,
}: {
  state: AppState
  classId: string
  onBack: () => void
  onOpenTask: (id: string) => void
  onDeleted: () => void
}) {
  const { classes, tasks, announcementsList, students, removeStudent, deleteClass } = state
  const [tab, setTab] = useState<ClassTab>('overview')
  const [studentQuery, setStudentQuery] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cls = classes.find((c) => c.id === classId)
  if (!cls) return null

  const classTasks = tasks.filter((t) => t.classId === classId)
  const activeTasks = classTasks.filter((t) => t.status !== 'Completed')
  const pendingSubmissions = classTasks.reduce((sum, t) => sum + (t.submissions?.filter((s) => s.status !== 'Submitted').length ?? 0), 0)
  const classAnnouncements = announcementsList.filter((a) => {
    if (a.audience === 'all') return true
    const grade = classGradeLevel(cls.name)
    return (a.audience === 'grade11' && grade === '11') || (a.audience === 'grade12' && grade === '12')
  })
  const roster = students.filter((s) => s.classId === classId)
  const filteredRoster = roster.filter((s) => s.name.toLowerCase().includes(studentQuery.toLowerCase()))
  const canDelete = classTasks.length === 0

  return (
    <div className="pb-8">
      <BackHeader
        title={cls.name}
        onBack={onBack}
        right={
          <button onClick={() => setShowMenu(true)} aria-label="Class options" className="h-8 w-8 flex items-center justify-center rounded-full active:bg-ink-100 text-ink-600">
            <MoreVertical size={18} />
          </button>
        }
      />
      <div className="px-5 pt-5">
        <p className="text-sm text-ink-500">{cls.subject}</p>

        <div className="grid grid-cols-3 gap-2.5 mt-4 mb-5">
          <Stat icon={<Users size={15} />} label="Students" value={cls.studentCount} />
          <Stat icon={<ClipboardList size={15} />} label="Active Tasks" value={activeTasks.length} />
          <Stat icon={<ClipboardCheck size={15} />} label="Pending" value={pendingSubmissions} />
        </div>

        <SegmentedControl
          options={[
            { key: 'overview', label: 'Overview' },
            { key: 'students', label: 'Students' },
            { key: 'tasks', label: 'Tasks' },
            { key: 'activity', label: 'Activity' },
          ]}
          value={tab}
          onChange={setTab}
        />

        <div className="mt-5">
          {tab === 'overview' && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-medium text-ink-400 mb-2 flex items-center gap-1.5"><Megaphone size={13} /> Recent Announcements</p>
                {classAnnouncements.length === 0 ? (
                  <Card className="p-4"><p className="text-sm text-ink-400">No announcements yet.</p></Card>
                ) : (
                  <Card className="divide-y divide-ink-100">
                    {classAnnouncements.slice(0, 3).map((a) => (
                      <div key={a.id} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-ink-900">{a.title}</p>
                          {a.pinned && <PinnedBadge />}
                        </div>
                        <p className="text-xs text-ink-400 mt-0.5">{a.postedAt}</p>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-ink-400 mb-2">Active Tasks</p>
                {activeTasks.length === 0 ? (
                  <EmptyState icon={<ClipboardList size={24} />} title="No active tasks for this class." />
                ) : (
                  <Card className="divide-y divide-ink-100">
                    {activeTasks.slice(0, 4).map((t) => (
                      <button key={t.id} onClick={() => onOpenTask(t.id)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                        <span className="text-sm text-ink-800 truncate pr-2">{t.title}</span>
                        <TaskStatusBadge status={t.status} />
                      </button>
                    ))}
                  </Card>
                )}
              </div>
            </div>
          )}

          {tab === 'students' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 flex items-center gap-2 bg-white border border-ink-100 rounded-xl px-3 h-10">
                  <Search size={16} className="text-ink-400" />
                  <input
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    placeholder="Search students..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
                  />
                </div>
                <button
                  onClick={() => setShowAddStudent(true)}
                  aria-label="Add student"
                  className="h-10 w-10 shrink-0 rounded-xl bg-primary-500 text-white flex items-center justify-center active:bg-primary-600"
                >
                  <UserPlus size={16} />
                </button>
              </div>
              {filteredRoster.length === 0 ? (
                <EmptyState icon={<Users size={24} />} title="No students found" />
              ) : (
                <Card className="divide-y divide-ink-100">
                  {filteredRoster.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="h-8 w-8 rounded-full bg-ink-100 text-ink-600 text-xs font-semibold flex items-center justify-center shrink-0">
                        {s.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="text-sm text-ink-800 truncate flex-1">{s.name}</span>
                      <button
                        onClick={() => removeStudent(s.id)}
                        aria-label={`Remove ${s.name}`}
                        className="h-7 w-7 flex items-center justify-center rounded-full text-ink-300 active:bg-ink-100 active:text-coral-600 shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}

          {tab === 'tasks' && (
            <div>
              {classTasks.length === 0 ? (
                <EmptyState icon={<ClipboardList size={24} />} title="No tasks for this class yet." />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {classTasks.map((t) => (
                    <Card key={t.id} className="p-4" onClick={() => onOpenTask(t.id)}>
                      <p className="font-medium text-sm text-ink-900">{t.title}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <PriorityBadge priority={t.priority} />
                        <TaskStatusBadge status={t.status} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div>
              {classTasks.length === 0 && classAnnouncements.length === 0 ? (
                <EmptyState icon={<ClipboardList size={24} />} title="No recent activity." />
              ) : (
                <Card className="divide-y divide-ink-100">
                  {[...classTasks.map((t) => ({ label: t.title, meta: t.status as string, key: `t-${t.id}` })), ...classAnnouncements.map((a) => ({ label: a.title, meta: 'Announcement', key: `a-${a.id}` }))]
                    .slice(0, 8)
                    .map((item) => (
                      <div key={item.key} className="px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-ink-700 truncate pr-2">{item.label}</span>
                        <span className="text-xs text-ink-400 shrink-0">{item.meta}</span>
                      </div>
                    ))}
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      <Sheet open={showMenu} onClose={() => setShowMenu(false)} title="Class Options">
        <div className="flex flex-col gap-1">
          <button onClick={() => { setShowMenu(false); setShowEdit(true) }} className="flex items-center gap-3 px-3.5 py-3 rounded-xl active:bg-ink-50 text-left text-ink-900">
            <Pencil size={17} className="text-ink-500" />
            <span className="text-sm font-medium">Edit Class</span>
          </button>
          <button
            onClick={() => { setShowMenu(false); setConfirmDelete(true) }}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl active:bg-ink-50 text-left text-coral-600"
          >
            <Trash2 size={17} className="text-coral-500" />
            <span className="text-sm font-medium">Delete Class</span>
          </button>
        </div>
      </Sheet>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title={canDelete ? 'Delete this class?' : "Can't delete this class"}>
        {canDelete ? (
          <>
            <p className="text-sm text-ink-600 mb-4">This removes {cls.name} and its {roster.length} students. This can't be undone.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  deleteClass(classId)
                  setConfirmDelete(false)
                  onDeleted()
                }}
                className="w-full rounded-xl bg-coral-500 text-white font-medium text-sm py-3"
              >
                Delete Class
              </button>
              <button onClick={() => setConfirmDelete(false)} className="w-full rounded-xl border border-ink-200 text-ink-700 font-medium text-sm py-3">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-ink-600 mb-4">
              {cls.name} still has {classTasks.length} task{classTasks.length === 1 ? '' : 's'} assigned to it. Delete or reassign those tasks first.
            </p>
            <button onClick={() => setConfirmDelete(false)} className="w-full rounded-xl border border-ink-200 text-ink-700 font-medium text-sm py-3">
              Okay
            </button>
          </>
        )}
      </Sheet>

      <AddClassSheet open={showEdit} onClose={() => setShowEdit(false)} state={state} editingClassId={classId} />
      <AddStudentSheet open={showAddStudent} onClose={() => setShowAddStudent(false)} state={state} classId={classId} />
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-3.5 flex flex-col items-center text-center">
      <div className="text-primary-600 mb-1.5">{icon}</div>
      <p className="font-display font-bold text-ink-900">{value}</p>
      <p className="text-[11px] text-ink-500 mt-0.5">{label}</p>
    </Card>
  )
}
