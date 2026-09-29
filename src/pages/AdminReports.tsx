import { useState } from 'react'
import type { AppState } from '../state/store'
import { Card, SegmentedControl, CheckInBadge, SectionHeading } from '../components/common'
import { teacherDirectory } from '../data/mockData'
import { byTime, findClass, findTeacher, sessionsFor, taskCounts, teacherTaskSummaries } from '../utils/monitoring'

type ReportTab = 'activity' | 'classes' | 'tasks'

export default function AdminReports({ state }: { state: AppState }) {
  const [tab, setTab] = useState<ReportTab>('activity')

  const perTeacher = teacherDirectory.map((t) => {
    const sessions = sessionsFor(state, t.id)
    const counts = taskCounts(teacherTaskSummaries(state, t))
    return {
      teacher: t,
      scheduled: sessions.length,
      recorded: sessions.filter((s) => s.status === 'Started').length,
      unrecorded: sessions.filter((s) => s.status !== 'Started').length,
      ...counts,
    }
  })
  const totals = perTeacher.reduce(
    (a, r) => ({ active: a.active + r.active, completed: a.completed + r.completed, overdue: a.overdue + r.overdue }),
    { active: 0, completed: 0, overdue: 0 },
  )

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-900 mb-1">Reports</h1>
      <p className="text-sm text-ink-500 mb-4">Snapshot for today, Quarter 2. Date-range filtering arrives with a real database.</p>

      <SegmentedControl<ReportTab>
        options={[
          { key: 'activity', label: 'Teacher Activity' },
          { key: 'classes', label: 'Class Monitoring' },
          { key: 'tasks', label: 'Task Overview' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-5">
        {tab === 'activity' && (
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[560px]">
              <thead>
                <tr className="text-xs text-ink-400 border-b border-ink-100">
                  <th className="font-medium px-4 py-3">Teacher</th>
                  <th className="font-medium px-4 py-3 text-right">Scheduled</th>
                  <th className="font-medium px-4 py-3 text-right">Recorded</th>
                  <th className="font-medium px-4 py-3 text-right">Unrecorded</th>
                  <th className="font-medium px-4 py-3 text-right">Active tasks</th>
                  <th className="font-medium px-4 py-3 text-right">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {perTeacher.map((r) => (
                  <tr key={r.teacher.id}>
                    <td className="px-4 py-3 text-ink-900">{r.teacher.name}</td>
                    <td className="px-4 py-3 text-right text-ink-700">{r.scheduled}</td>
                    <td className="px-4 py-3 text-right text-ink-700">{r.recorded}</td>
                    <td className="px-4 py-3 text-right text-ink-700">{r.unrecorded}</td>
                    <td className="px-4 py-3 text-right text-ink-700">{r.active}</td>
                    <td className="px-4 py-3 text-right text-ink-700">{r.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'classes' && (
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[560px]">
              <thead>
                <tr className="text-xs text-ink-400 border-b border-ink-100">
                  <th className="font-medium px-4 py-3">Date</th>
                  <th className="font-medium px-4 py-3">Time</th>
                  <th className="font-medium px-4 py-3">Class</th>
                  <th className="font-medium px-4 py-3">Teacher</th>
                  <th className="font-medium px-4 py-3">Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {[...state.classSessions].sort(byTime).map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-ink-600 whitespace-nowrap">Today</td>
                    <td className="px-4 py-3 text-ink-600 whitespace-nowrap">{s.time}</td>
                    <td className="px-4 py-3 text-ink-800">{findClass(state, s.classId)?.name}</td>
                    <td className="px-4 py-3 text-ink-900">{findTeacher(s.teacherId)?.name}</td>
                    <td className="px-4 py-3"><CheckInBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'tasks' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4"><p className="font-display text-2xl font-bold text-ink-900">{totals.active}</p><p className="text-xs text-ink-500">Active tasks</p></Card>
              <Card className="p-4"><p className="font-display text-2xl font-bold text-ink-900">{totals.completed}</p><p className="text-xs text-ink-500">Completed</p></Card>
              <Card className="p-4"><p className="font-display text-2xl font-bold text-ink-900">{totals.overdue}</p><p className="text-xs text-ink-500">Overdue</p></Card>
            </div>
            <div>
              <SectionHeading title="Tasks by teacher" />
              <Card className="divide-y divide-ink-100">
                {perTeacher.map((r) => (
                  <div key={r.teacher.id} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-ink-900">{r.teacher.name}</span>
                    <span className="text-xs text-ink-500">{r.active} active · {r.completed} completed · {r.overdue} overdue</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
