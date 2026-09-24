import type { AppState } from '../state/store'

export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  category: 'Tasks' | 'Classes' | 'Students' | 'Announcements' | 'Resources' | 'Calendar' | 'Notes'
}

export interface SearchResults {
  Tasks: SearchResult[]
  Classes: SearchResult[]
  Students: SearchResult[]
  Announcements: SearchResult[]
  Resources: SearchResult[]
  Calendar: SearchResult[]
  Notes: SearchResult[]
}

export function searchAll(state: AppState, query: string): SearchResults {
  const q = query.trim().toLowerCase()
  const empty: SearchResults = { Tasks: [], Classes: [], Students: [], Announcements: [], Resources: [], Calendar: [], Notes: [] }
  if (!q) return empty

  const classLabel = (id: string) => state.classes.find((c) => c.id === id)?.name ?? ''

  empty.Tasks = [...state.tasks, ...state.archivedTasks]
    .filter((t) => t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q))
    .map((t) => ({
      id: t.id,
      title: t.title,
      subtitle: `${classLabel(t.classId)} · ${t.subject}${t.archived ? ' · Archived' : ''}`,
      category: 'Tasks',
    }))

  empty.Classes = state.classes
    .filter((c) => c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q))
    .map((c) => ({ id: c.id, title: c.name, subtitle: c.subject, category: 'Classes' }))

  empty.Students = state.students
    .filter((s) => s.name.toLowerCase().includes(q))
    .slice(0, 8)
    .map((s) => ({ id: s.id, title: s.name, subtitle: classLabel(s.classId), category: 'Students' }))

  empty.Announcements = state.announcementsList
    .filter((a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q))
    .map((a) => ({ id: a.id, title: a.title, subtitle: a.classId === 'all' ? 'All Classes' : classLabel(a.classId), category: 'Announcements' }))

  empty.Resources = state.resourcesList
    .filter((r) => r.name.toLowerCase().includes(q) || r.folder.toLowerCase().includes(q) || r.tags.some((tg) => tg.toLowerCase().includes(q)))
    .map((r) => ({ id: r.id, title: r.name, subtitle: r.folder, category: 'Resources' }))

  empty.Calendar = state.calendarEvents
    .filter((e) => e.title.toLowerCase().includes(q))
    .map((e) => ({ id: e.id, title: e.title, subtitle: e.date, category: 'Calendar' }))

  empty.Notes = state.notesList
    .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
    .map((n) => ({ id: n.id, title: n.title, subtitle: n.category, category: 'Notes' }))

  return empty
}

export function totalResults(r: SearchResults) {
  return r.Tasks.length + r.Classes.length + r.Students.length + r.Announcements.length + r.Resources.length + r.Calendar.length + r.Notes.length
}
