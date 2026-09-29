import { useMemo, useState } from 'react'
import { Search, ChevronRight, Users } from 'lucide-react'
import type { AppState } from '../state/store'
import type { TeacherStatus } from '../types'
import { Card, EmptyState } from '../components/common'
import { teacherDirectory } from '../data/mockData'
import { sessionsFor, taskCounts, teacherClasses, teacherTaskSummaries } from '../utils/monitoring'

const statusStyle: Record<TeacherStatus, { cls: string; mark: string }> = {
  Active: { cls: 'bg-primary-50 text-primary-700', mark: '●' },
  'Needs Attention': { cls: 'bg-amber-500/10 text-amber-600', mark: '▲' },
  'No Status': { cls: 'bg-ink-100 text-ink-600', mark: '○' },
}

export function TeacherStatusBadge({ status }: { status: TeacherStatus }) {
  const s = statusStyle[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${s.cls}`}>
      <span aria-hidden="true" className="text-[9px]">{s.mark}</span>
      {status}
    </span>
  )
}

type SortKey = 'name' | 'status'

export default function AdminTeachers({ state, onOpenTeacher }: { state: AppState; onOpenTeacher: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All')
  const [status, setStatus] = useState<'All' | TeacherStatus>('All')
  const [sort, setSort] = useState<SortKey>('name')

  const departments = ['All', ...Array.from(new Set(teacherDirectory.map((t) => t.department)))]

  const rows = useMemo(() => {
    const order: Record<TeacherStatus, number> = { 'Needs Attention': 0, 'No Status': 1, Active: 2 }
    return teacherDirectory
      .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
      .filter((t) => department === 'All' || t.department === department)
      .filter((t) => status === 'All' || t.status === status)
      .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : order[a.status] - order[b.status]))
  }, [query, department, status, sort])

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-900 mb-4">Teachers</h1>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-ink-100 rounded-xl px-3 h-10">
          <Search size={16} className="text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teachers..."
            aria-label="Search teachers"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
          />
        </div>
        <select aria-label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="h-10 rounded-xl border border-ink-100 bg-white px-3 text-sm text-ink-700">
          {departments.map((d) => <option key={d} value={d}>{d === 'All' ? 'All departments' : d}</option>)}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as 'All' | TeacherStatus)} className="h-10 rounded-xl border border-ink-100 bg-white px-3 text-sm text-ink-700">
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Needs Attention">Needs Attention</option>
          <option value="No Status">No Status</option>
        </select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 rounded-xl border border-ink-100 bg-white px-3 text-sm text-ink-700">
          <option value="name">Sort: Name</option>
          <option value="status">Sort: Needs attention first</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Users size={26} />} title="No teachers match" subtitle="Try clearing a filter." />
      ) : (
        <Card className="divide-y divide-ink-100">
          {rows.map((t) => {
            const classes = teacherClasses(state, t)
            const counts = taskCounts(teacherTaskSummaries(state, t))
            const todays = sessionsFor(state, t.id).length
            return (
              <button key={t.id} onClick={() => onOpenTeacher(t.id)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-ink-50">
                <div className="h-9 w-9 rounded-full bg-ink-100 text-ink-600 text-xs font-semibold flex items-center justify-center shrink-0">
                  {t.name.replace(/^Ma'am\s*/, '').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900 truncate">{t.name}</p>
                  <p className="text-xs text-ink-400 truncate">
                    {t.department} · {classes.length} class{classes.length === 1 ? '' : 'es'} · {todays} today · {counts.active} active tasks
                  </p>
                </div>
                <TeacherStatusBadge status={t.status} />
                <ChevronRight size={16} className="text-ink-300 shrink-0" />
              </button>
            )
          })}
        </Card>
      )}
    </div>
  )
}
