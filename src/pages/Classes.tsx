import React, { useState } from 'react'
import { Users, ChevronRight, ClipboardList, ClipboardCheck, Megaphone, Search } from 'lucide-react'
import type { AppState } from '../state/store'
import type { ClassTab } from '../types'
import { Card, BackHeader, SegmentedControl, PriorityBadge, TaskStatusBadge, EmptyState, PinnedBadge } from '../components/common'

export function Classes({ state, onOpenClass }: { state: AppState; onOpenClass: (id: string) => void }) {
  const { classes, tasks } = state
  return (
    <div className="pb-6">
      <div className="px-5 pt-4 pb-4">
        <h1 className="font-display text-xl font-bold text-ink-900">Classes</h1>
        <p className="text-sm text-ink-500 mt-1">{classes.length} sections this quarter</p>
      </div>
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
    </div>
  )
}

export function ClassDetail({
  state,
  classId,
  onBack,
  onOpenTask,
}: {
  state: AppState
  classId: string
  onBack: () => void
  onOpenTask: (id: string) => void
}) {
  const { classes, tasks, announcementsList, students } = state
  const [tab, setTab] = useState<ClassTab>('overview')
  const [studentQuery, setStudentQuery] = useState('')
  const cls = classes.find((c) => c.id === classId)
  if (!cls) return null

  const classTasks = tasks.filter((t) => t.classId === classId)
  const activeTasks = classTasks.filter((t) => t.status !== 'Completed')
  const pendingSubmissions = classTasks.reduce((sum, t) => sum + (t.submissions?.filter((s) => s.status !== 'Submitted').length ?? 0), 0)
  const classAnnouncements = announcementsList.filter((a) => a.classId === classId || a.classId === 'all')
  const roster = students.filter((s) => s.classId === classId)
  const filteredRoster = roster.filter((s) => s.name.toLowerCase().includes(studentQuery.toLowerCase()))

  return (
    <div className="pb-8">
      <BackHeader title={cls.name} onBack={onBack} />
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
              <div className="flex items-center gap-2 bg-white border border-ink-100 rounded-xl px-3 h-10 mb-3">
                <Search size={16} className="text-ink-400" />
                <input
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Search students..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
                />
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
                      <span className="text-sm text-ink-800 truncate">{s.name}</span>
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
