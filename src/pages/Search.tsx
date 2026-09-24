import React, { useMemo, useState } from 'react'
import { Search as SearchIcon, ListTodo, Users, GraduationCap, Megaphone, FolderOpen, Calendar as CalendarIcon, StickyNote } from 'lucide-react'
import type { AppState } from '../state/store'
import { BackHeader, Card, EmptyState } from '../components/common'
import { searchAll, totalResults, type SearchResult } from '../utils/search'

const categoryIcon: Record<SearchResult['category'], React.ElementType> = {
  Tasks: ListTodo,
  Classes: Users,
  Students: GraduationCap,
  Announcements: Megaphone,
  Resources: FolderOpen,
  Calendar: CalendarIcon,
  Notes: StickyNote,
}

export default function SearchPage({
  state,
  onBack,
  onOpenTask,
  onOpenClass,
}: {
  state: AppState
  onBack: () => void
  onOpenTask: (id: string) => void
  onOpenClass: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchAll(state, query), [state, query])
  const count = totalResults(results)

  function handleSelect(r: SearchResult) {
    if (r.category === 'Tasks') onOpenTask(r.id)
    else if (r.category === 'Classes') onOpenClass(r.id)
    else if (r.category === 'Students') {
      const student = state.students.find((s) => s.id === r.id)
      if (student) onOpenClass(student.classId)
    }
    // Announcements / Resources / Calendar / Notes are informational —
    // surfaced by the search but opened from their home section for now.
  }

  return (
    <div className="pb-8">
      <BackHeader title="Search" onBack={onBack} />
      <div className="px-5 pt-4">
        <div className="flex items-center gap-2.5 bg-white border border-ink-100 rounded-xl px-3.5 h-11 mb-5">
          <SearchIcon size={17} className="text-ink-400" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, classes, students, files..."
            aria-label="Search TASKLY"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
          />
        </div>

        {!query && (
          <EmptyState icon={<SearchIcon size={26} />} title="Search across TASKLY" subtitle="Tasks, classes, students, announcements, resources, events, and notes." />
        )}

        {query && count === 0 && (
          <EmptyState icon={<SearchIcon size={26} />} title="No results found" subtitle={`Nothing matches "${query}".`} />
        )}

        {query && count > 0 && (
          <div className="flex flex-col gap-5">
            {(Object.keys(results) as (keyof typeof results)[]).map((cat) => {
              const list = results[cat]
              if (list.length === 0) return null
              const Icon = categoryIcon[cat]
              return (
                <div key={cat}>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-ink-400 mb-2 uppercase tracking-wide">
                    <Icon size={13} /> {cat}
                  </p>
                  <Card className="divide-y divide-ink-100">
                    {list.map((r) => (
                      <button key={r.id} onClick={() => handleSelect(r)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink-900 truncate">{r.title}</p>
                          {r.subtitle && <p className="text-xs text-ink-400 truncate mt-0.5">{r.subtitle}</p>}
                        </div>
                      </button>
                    ))}
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
