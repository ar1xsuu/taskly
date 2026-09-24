import { useMemo, useState } from 'react'
import { FileBarChart } from 'lucide-react'
import type { AppState } from '../state/store'
import { BackHeader, Card, PrimaryButton } from '../components/common'

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WORKLOAD = [4, 6, 3, 7, 5, 2, 1] // mock task-activity counts per weekday

export default function Reports({ state, onBack }: { state: AppState; onBack: () => void }) {
  const { tasks } = state
  const [generated, setGenerated] = useState(false)

  const taskStats = useMemo(() => {
    const created = tasks.length
    const completed = tasks.filter((t) => t.status === 'Completed').length
    const ongoing = tasks.filter((t) => t.status === 'Ongoing').length
    const overdue = tasks.filter((t) => t.status === 'Overdue').length
    return { created, completed, ongoing, overdue }
  }, [tasks])

  const submissionStats = useMemo(() => {
    const all = tasks.flatMap((t) => t.submissions ?? [])
    const total = all.length
    const submitted = all.filter((s) => s.status === 'Submitted').length
    const pending = all.filter((s) => s.status === 'Pending').length
    const late = all.filter((s) => s.status === 'Late').length
    return { total, submitted, pending, late }
  }, [tasks])

  const maxWorkload = Math.max(...WORKLOAD)

  return (
    <div className="pb-8">
      <BackHeader title="Reports" onBack={onBack} />
      <div className="px-5 pt-4">
        <p className="text-xs font-medium text-ink-400 mb-2">Task Report</p>
        <Card className="p-4 mb-5 grid grid-cols-4 gap-2 text-center">
          <ReportStat label="Created" value={taskStats.created} />
          <ReportStat label="Completed" value={taskStats.completed} tone="primary" />
          <ReportStat label="Ongoing" value={taskStats.ongoing} tone="sky" />
          <ReportStat label="Overdue" value={taskStats.overdue} tone="coral" />
        </Card>

        <p className="text-xs font-medium text-ink-400 mb-2">Submission Report</p>
        <Card className="p-4 mb-5 grid grid-cols-4 gap-2 text-center">
          <ReportStat label="Total" value={submissionStats.total} />
          <ReportStat label="Submitted" value={submissionStats.submitted} tone="primary" />
          <ReportStat label="Pending" value={submissionStats.pending} tone="sky" />
          <ReportStat label="Late" value={submissionStats.late} tone="amber" />
        </Card>

        <p className="text-xs font-medium text-ink-400 mb-2">Workload Overview</p>
        <Card className="p-4 mb-5">
          <div className="flex items-end justify-between gap-2 h-28">
            {WORKLOAD.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-lg bg-primary-500/80"
                  style={{ height: `${(v / maxWorkload) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-ink-400">{WEEK_LABELS[i]}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-400 mt-3 text-center">Task activity this week</p>
        </Card>

        <PrimaryButton onClick={() => setGenerated(true)}>Generate Report</PrimaryButton>

        {generated && (
          <Card className="p-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileBarChart size={16} className="text-primary-600" />
              <p className="text-sm font-medium text-ink-900">Report preview ready</p>
            </div>
            <p className="text-xs text-ink-500 leading-relaxed">
              Weekly summary compiled for Talugtug National High School, SY 2026–2027, Quarter 2. Includes task
              completion rate ({taskStats.created ? Math.round((taskStats.completed / taskStats.created) * 100) : 0}%)
              and submission rate ({submissionStats.total ? Math.round((submissionStats.submitted / submissionStats.total) * 100) : 0}%)
              across all four sections.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

function ReportStat({ label, value, tone }: { label: string; value: number; tone?: 'primary' | 'sky' | 'coral' | 'amber' }) {
  const toneClass = tone
    ? { primary: 'text-primary-600', sky: 'text-sky-500', coral: 'text-coral-500', amber: 'text-amber-500' }[tone]
    : 'text-ink-900'
  return (
    <div>
      <p className={`font-display font-bold text-lg ${toneClass}`}>{value}</p>
      <p className="text-[10px] text-ink-400 mt-0.5">{label}</p>
    </div>
  )
}
