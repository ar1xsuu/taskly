import type { AppState } from '../state/store'
import { Card, SectionHeading, CheckInBadge, EmptyState } from '../components/common'
import { teacherDirectory } from '../data/mockData'
import { byTime, buildAlerts, findClass, findTeacher, taskCounts, teacherTaskSummaries } from '../utils/monitoring'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

export default function AdminHome({
  state,
  onOpenTeachers,
  onOpenClasses,
  onOpenReports,
  onOpenNotifications,
}: {
  state: AppState
  onOpenTeachers: () => void
  onOpenClasses: () => void
  onOpenReports: () => void
  onOpenNotifications: () => void
}) {
  const active = teacherDirectory.filter((t) => t.status === 'Active').length
  const attention = teacherDirectory.filter((t) => t.status === 'Needs Attention').length
  const noStatus = teacherDirectory.filter((t) => t.status === 'No Status').length

  const alerts = buildAlerts(state)
  const sessions = [...state.classSessions].sort(byTime)

  const allTasks = teacherDirectory.flatMap((t) => teacherTaskSummaries(state, t))
  const totals = taskCounts(allTasks)

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="font-display text-xl font-bold text-ink-900">What is happening with our SHS teachers right now?</h1>
        <p className="text-sm text-ink-500 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <section>
        <SectionHeading title="Teacher Overview" action={<button onClick={onOpenTeachers} className="text-xs font-medium text-primary-600">View directory</button>} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="SHS Teachers" value={teacherDirectory.length} />
          <Stat label="Active" value={active} />
          <Stat label="Needs Attention" value={attention} />
          <Stat label="No Status" value={noStatus} />
        </div>
      </section>

      <div className="grid gap-7 lg:grid-cols-2">
        <section>
          <SectionHeading title="Today's Classes" action={<button onClick={onOpenClasses} className="text-xs font-medium text-primary-600">Class monitoring</button>} />
          {sessions.length === 0 ? (
            <EmptyState icon={<span className="text-2xl">🗓️</span>} title="No classes scheduled today" />
          ) : (
            <Card className="divide-y divide-ink-100">
              {sessions.map((cs) => (
                <div key={cs.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-16 shrink-0 text-xs font-medium text-ink-500">{cs.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900 truncate">{findClass(state, cs.classId)?.name}</p>
                    <p className="text-xs text-ink-400 truncate">{findTeacher(cs.teacherId)?.name}</p>
                  </div>
                  <CheckInBadge status={cs.status} />
                </div>
              ))}
            </Card>
          )}
        </section>

        <section>
          <SectionHeading title="Monitoring Alerts" action={<button onClick={onOpenNotifications} className="text-xs font-medium text-primary-600">All alerts</button>} />
          {alerts.length === 0 ? (
            <Card className="p-6 text-center">
              <CheckCircle2 size={22} className="mx-auto text-primary-500 mb-2" />
              <p className="text-sm font-medium text-ink-800">Everything looks good</p>
              <p className="text-xs text-ink-400 mt-1">No teacher monitoring items require attention.</p>
            </Card>
          ) : (
            <Card className="divide-y divide-ink-100">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900">{a.title}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{a.detail}</p>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </section>
      </div>

      <section>
        <SectionHeading title="Task Overview" action={<button onClick={onOpenReports} className="text-xs font-medium text-primary-600">Reports</button>} />
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Active tasks" value={totals.active} />
          <Stat label="Completed" value={totals.completed} />
          <Stat label="Overdue" value={totals.overdue} />
        </div>
        <p className="text-xs text-ink-400 mt-2">Summary counts only — open a teacher's profile for their task list.</p>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500 mt-0.5">{label}</p>
    </Card>
  )
}
