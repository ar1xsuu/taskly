import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, ArrowUpDown, Paperclip, CheckCircle2, Circle, Megaphone, Repeat, ChevronRight } from 'lucide-react'
import type { AppState } from '../state/store'
import type { TaskStatus, WorkTab } from '../types'
import { Card, PriorityBadge, TaskStatusBadge, EmptyState, Sheet, SegmentedControl, ProgressBar } from '../components/common'
import { format, relativeDueLabel } from '../utils/date'
import { priorityOrder } from '../data/mockData'

type FilterKey = 'All' | TaskStatus
type SortKey = 'deadline' | 'priority'

export default function Work({
  state,
  onOpenTask,
  onOpenSubmissions,
  onOpenAnnouncements,
}: {
  state: AppState
  onOpenTask: (id: string) => void
  onOpenSubmissions: (taskId: string) => void
  onOpenAnnouncements: () => void
}) {
  const { tasks, classes, toggleTaskComplete } = state
  const [tab, setTab] = useState<WorkTab>('tasks')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('All')
  const [sort, setSort] = useState<SortKey>('deadline')
  const [showSort, setShowSort] = useState(false)

  const filtered = useMemo(() => {
    let list = tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    if (filter !== 'All') list = list.filter((t) => t.status === filter)
    list = [...list].sort((a, b) => {
      if (sort === 'deadline') return a.deadline.localeCompare(b.deadline)
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    return list
  }, [tasks, query, filter, sort])

  const tasksWithSubmissions = useMemo(() => tasks.filter((t) => t.submissions && t.submissions.length > 0), [tasks])

  function classLabel(classId: string) {
    return classes.find((cl) => cl.id === classId)?.name ?? ''
  }

  return (
    <div className="pb-6">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink-900">Work</h1>
        <button
          onClick={onOpenAnnouncements}
          className="flex items-center gap-1.5 rounded-full bg-white border border-ink-100 text-xs font-medium text-ink-600 pl-2.5 pr-3 py-2 active:bg-ink-50"
        >
          <Megaphone size={14} className="text-primary-600" /> Announcements
        </button>
      </div>

      <div className="px-5 mb-4">
        <SegmentedControl
          options={[
            { key: 'tasks', label: 'Tasks' },
            { key: 'submissions', label: 'Submissions' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'tasks' ? (
        <>
          <div className="px-5 flex items-center gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-white border border-ink-100 rounded-xl px-3 h-10">
              <Search size={16} className="text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
              />
            </div>
            <button onClick={() => setShowSort(true)} aria-label="Sort tasks" className="h-10 w-10 rounded-xl bg-white border border-ink-100 flex items-center justify-center text-ink-600">
              <ArrowUpDown size={16} />
            </button>
          </div>

          <div className="px-5 flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
            {(['All', 'Upcoming', 'Ongoing', 'Completed', 'Overdue'] as FilterKey[]).map((f) => (
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

          <div className="px-5">
            {filtered.length === 0 ? (
              <EmptyState icon={<SlidersHorizontal size={28} />} title="No tasks found" subtitle="Try adjusting your search or filters." />
            ) : (
              <div className="flex flex-col gap-2.5">
                {filtered.map((t) => (
                  <Card key={t.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskComplete(t.id)}
                        aria-label={t.status === 'Completed' ? 'Mark as not completed' : 'Mark as completed'}
                        className="mt-0.5 text-ink-300 active:text-primary-500"
                      >
                        {t.status === 'Completed' ? <CheckCircle2 size={20} className="text-primary-500" /> : <Circle size={20} />}
                      </button>
                      <div className="flex-1 min-w-0" onClick={() => onOpenTask(t.id)}>
                        <p className="font-medium text-sm text-ink-900 leading-snug">{t.title}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{classLabel(t.classId)} • {t.subject}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <PriorityBadge priority={t.priority} />
                          <TaskStatusBadge status={t.status} />
                          {t.recurrence !== 'None' && (
                            <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                              <Repeat size={12} /> {t.recurrence}
                            </span>
                          )}
                          {t.attachments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                              <Paperclip size={12} /> {t.attachments.length}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-400 mt-1.5">{relativeDueLabel(t.deadline)} · {format(t.deadline, 'full')}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Sheet open={showSort} onClose={() => setShowSort(false)} title="Sort tasks">
            <div className="flex flex-col gap-2">
              {(
                [
                  ['deadline', 'By deadline (soonest first)'],
                  ['priority', 'By priority (highest first)'],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSort(key)
                    setShowSort(false)
                  }}
                  className={`text-left px-4 py-3 rounded-xl text-sm ${sort === key ? 'bg-primary-50 text-primary-700 font-medium' : 'bg-ink-50 text-ink-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Sheet>
        </>
      ) : (
        <div className="px-5">
          {tasksWithSubmissions.length === 0 ? (
            <EmptyState icon={<SlidersHorizontal size={28} />} title="No submissions to monitor" subtitle="Tasks with tracked submissions will appear here." />
          ) : (
            <div className="flex flex-col gap-2.5">
              {tasksWithSubmissions.map((t) => {
                const submitted = t.submissions!.filter((s) => s.status === 'Submitted').length
                const total = t.totalStudents ?? t.submissions!.length
                const missing = t.submissions!.filter((s) => s.status === 'Missing').length
                return (
                  <Card key={t.id} className="p-4" onClick={() => onOpenSubmissions(t.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-ink-900">{t.title}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{classLabel(t.classId)}</p>
                      </div>
                      <ChevronRight size={16} className="text-ink-300 shrink-0 mt-1" />
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-ink-700">{submitted} / {total} Submitted</span>
                        {missing > 0 && <span className="text-xs text-coral-600 font-medium">{missing} missing</span>}
                      </div>
                      <ProgressBar value={(submitted / total) * 100} />
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
