import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { AppState } from '../state/store'
import { Card, SegmentedControl, CheckInBadge, EmptyState } from '../components/common'
import { TeacherStatusBadge } from './AdminTeachers'
import { findClass, findTeacher, sessionsFor, taskCounts, teacherClasses, teacherTaskSummaries } from '../utils/monitoring'

type ProfileTab = 'overview' | 'classes' | 'tasks' | 'checkins' | 'activity'

const taskStatusMark: Record<string, string> = { Completed: '✓', Overdue: '!', 'Due Tomorrow': '◷' }

// What an SHS Head is authorized to see: classes, task titles/status, check-ins.
// Deliberately absent: private notes (they are never part of this data path).
export default function AdminTeacherProfile({ state, teacherId, onBack }: { state: AppState; teacherId: string; onBack: () => void }) {
  const [tab, setTab] = useState<ProfileTab>('overview')
  const teacher = findTeacher(teacherId)
  if (!teacher) return null

  const classes = teacherClasses(state, teacher)
  const tasks = teacherTaskSummaries(state, teacher)
  const counts = taskCounts(tasks)
  const sessions = sessionsFor(state, teacher.id)
  const started = sessions.filter((s) => s.status === 'Started').length

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-ink-500 mb-4 active:text-ink-800">
        <ArrowLeft size={15} /> Teachers
      </button>

      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">{teacher.name}</h1>
          <p className="text-sm text-ink-500 mt-0.5">Department: {teacher.department}</p>
        </div>
        <TeacherStatusBadge status={teacher.status} />
      </div>

      <SegmentedControl<ProfileTab>
        options={[
          { key: 'overview', label: 'Overview' },
          { key: 'classes', label: 'Classes' },
          { key: 'tasks', label: 'Tasks' },
          { key: 'checkins', label: 'Check-ins' },
          { key: 'activity', label: 'Activity' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-5">
        {tab === 'overview' && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <Metric label="Today's classes" value={sessions.length} />
              <Metric label="Active tasks" value={counts.active} />
              <Metric label="Class check-ins" value={started} />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-400 mb-2">Assigned classes</p>
              {classes.length === 0 ? (
                <EmptyState icon={<span className="text-2xl">📚</span>} title="No classes assigned yet" />
              ) : (
                <Card className="divide-y divide-ink-100">
                  {classes.map((c) => (
                    <div key={c.id} className="px-4 py-3">
                      <p className="text-sm font-medium text-ink-900">{c.name}</p>
                      <p className="text-xs text-ink-400">{c.subject} · {c.studentCount} students</p>
                    </div>
                  ))}
                </Card>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-ink-400 mb-2">Today's check-ins</p>
              <CheckInList state={state} teacherId={teacher.id} />
            </div>
          </div>
        )}

        {tab === 'classes' &&
          (classes.length === 0 ? (
            <EmptyState icon={<span className="text-2xl">📚</span>} title="No classes assigned yet" />
          ) : (
            <Card className="divide-y divide-ink-100">
              {classes.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{c.name}</p>
                    <p className="text-xs text-ink-400">{c.subject}</p>
                  </div>
                  <span className="text-xs text-ink-500">{c.studentCount} students</span>
                </div>
              ))}
            </Card>
          ))}

        {tab === 'tasks' && (
          <div>
            <p className="text-sm text-ink-500 mb-3">Active tasks: {counts.active}</p>
            {tasks.length === 0 ? (
              <EmptyState icon={<span className="text-2xl">📋</span>} title="No tasks yet" subtitle="This teacher hasn't created any tasks." />
            ) : (
              <Card className="divide-y divide-ink-100">
                {tasks.map((t, i) => (
                  <div key={`${t.title}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm text-ink-800 truncate">{t.title}</span>
                    <span className="text-xs font-medium text-ink-600 bg-ink-100 rounded-full px-2.5 py-1 shrink-0">
                      {taskStatusMark[t.status] ? `${taskStatusMark[t.status]} ` : ''}{t.status}
                    </span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {tab === 'checkins' && <CheckInList state={state} teacherId={teacher.id} />}

        {tab === 'activity' && (
          <Card className="divide-y divide-ink-100">
            {sessions.map((s) => (
              <div key={s.id} className="px-4 py-3 text-sm text-ink-700">
                {s.status === 'Started' ? `Started class at ${s.checkInTime}` : `Scheduled class at ${s.time} — ${s.status.toLowerCase()}`}
              </div>
            ))}
            {tasks.slice(0, 4).map((t, i) => (
              <div key={`t-${i}`} className="px-4 py-3 text-sm text-ink-700">Task “{t.title}” — {t.status}</div>
            ))}
            {sessions.length === 0 && tasks.length === 0 && <div className="px-4 py-6 text-sm text-ink-400 text-center">No recent activity.</div>}
          </Card>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500 mt-0.5">{label}</p>
    </Card>
  )
}

function CheckInList({ state, teacherId }: { state: AppState; teacherId: string }) {
  const sessions = sessionsFor(state, teacherId)
  if (sessions.length === 0) return <EmptyState icon={<span className="text-2xl">🗓️</span>} title="No classes scheduled today" />
  return (
    <Card className="divide-y divide-ink-100">
      {sessions.map((s) => (
        <div key={s.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-900">{findClass(state, s.classId)?.name}</p>
            <p className="text-xs text-ink-400">
              Scheduled {s.time}{s.checkInTime ? ` · checked in ${s.checkInTime}` : ''}
            </p>
          </div>
          <CheckInBadge status={s.status} />
        </div>
      ))}
    </Card>
  )
}
