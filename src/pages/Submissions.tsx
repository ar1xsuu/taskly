import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { AppState } from '../state/store'
import type { SubmissionStatus } from '../types'
import { BackHeader, Card, StatusBadge, ProgressBar, EmptyState, Sheet } from '../components/common'

type FilterKey = 'All' | SubmissionStatus

export default function Submissions({ state, taskId, onBack }: { state: AppState; taskId: string; onBack: () => void }) {
  const { tasks, students, setSubmissionStatus } = state
  const task = tasks.find((t) => t.id === taskId)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('All')
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null)

  if (!task || !task.submissions) return null

  const submitted = task.submissions.filter((s) => s.status === 'Submitted').length
  const total = task.totalStudents ?? task.submissions.length

  const rows = useMemo(() => {
    let list = task.submissions!.map((s) => ({
      ...s,
      student: students.find((st) => st.id === s.studentId)!,
    }))
    if (filter !== 'All') list = list.filter((r) => r.status === filter)
    if (query) list = list.filter((r) => r.student.name.toLowerCase().includes(query.toLowerCase()))
    return list.sort((a, b) => a.student.name.localeCompare(b.student.name))
  }, [task.submissions, students, filter, query])

  const activeRow = activeStudentId ? rows.find((r) => r.studentId === activeStudentId) ?? task.submissions.map((s) => ({ ...s, student: students.find((st) => st.id === s.studentId)! })).find((r) => r.studentId === activeStudentId) : null

  return (
    <div className="pb-8">
      <BackHeader title="Submissions" onBack={onBack} />
      <div className="px-5 pt-4">
        <h1 className="font-display text-lg font-bold text-ink-900">{task.title}</h1>
        <Card className="p-4 mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-ink-900">{submitted} / {total} Submitted</span>
            <span className="text-xs text-ink-400">{Math.round((submitted / total) * 100)}%</span>
          </div>
          <ProgressBar value={(submitted / total) * 100} />
        </Card>

        <div className="flex items-center gap-2 bg-white border border-ink-100 rounded-xl px-3 h-10 mt-4">
          <Search size={16} className="text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
          />
        </div>

        <div className="flex items-center gap-2 mt-3 mb-4 overflow-x-auto no-scrollbar">
          {(['All', 'Submitted', 'Pending', 'Late', 'Missing', 'Resubmission Required'] as FilterKey[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border ${
                filter === f ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-ink-600 border-ink-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={<Search size={26} />} title="No students found" subtitle="Try a different search or filter." />
        ) : (
          <Card className="divide-y divide-ink-100">
            {rows.map((r) => (
              <button key={r.studentId} onClick={() => setActiveStudentId(r.studentId)} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-ink-100 text-ink-600 text-xs font-semibold flex items-center justify-center shrink-0">
                    {r.student.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className="text-sm text-ink-800 truncate">{r.student.name}</span>
                </div>
                <StatusBadge status={r.status} />
              </button>
            ))}
          </Card>
        )}
      </div>

      <Sheet open={!!activeRow} onClose={() => setActiveStudentId(null)} title="Submission Details">
        {activeRow && (
          <div>
            <p className="font-medium text-ink-900">{activeRow.student.name}</p>
            <p className="text-xs text-ink-400 mt-0.5">{task.title}</p>
            <div className="mt-4"><StatusBadge status={activeRow.status} /></div>
            {activeRow.submittedAt && (
              <p className="text-sm text-ink-500 mt-3">Submitted: {activeRow.submittedAt}</p>
            )}
            {activeRow.note && (
              <p className="text-sm text-violet-600 mt-2 bg-violet-500/10 rounded-lg px-3 py-2">{activeRow.note}</p>
            )}
            <p className="text-xs font-medium text-ink-400 mt-5 mb-2">Update status</p>
            <div className="grid grid-cols-2 gap-2">
              {(['Submitted', 'Pending', 'Late', 'Missing', 'Resubmission Required'] as SubmissionStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSubmissionStatus(task.id, activeRow.studentId, s)
                    setActiveStudentId(null)
                  }}
                  className={`rounded-xl border border-ink-200 py-2.5 text-sm font-medium text-ink-700 active:bg-ink-50 ${s === 'Resubmission Required' ? 'col-span-2' : ''}`}
                >
                  Mark {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
