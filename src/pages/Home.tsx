import React from 'react'
import { Search, ClipboardCheck, ChevronRight, ListTodo, Megaphone, CalendarPlus } from 'lucide-react'
import type { AppState } from '../state/store'
import { Card, SectionHeading, PriorityBadge, PinnedBadge, eventTypeMeta, EmptyState } from '../components/common'
import type { CreateKind } from '../components/QuickAction'
import { format, relativeDueLabel } from '../utils/date'
import { TEACHER_NAME } from '../data/mockData'

export default function Home({
  state,
  onOpenTask,
  onOpenSearch,
  onSeeWork,
  onSeeCalendar,
  onQuickCreate,
}: {
  state: AppState
  onOpenTask: (id: string) => void
  onOpenSearch: () => void
  onSeeWork: () => void
  onSeeCalendar: () => void
  onQuickCreate: (kind: CreateKind) => void
}) {
  const { tasks, classes, announcementsList, eventsList } = state

  // My Day: what actually needs attention today — overdue first, then
  // urgent/high priority items due soon.
  const myDay = [...tasks]
    .filter((t) => t.status === 'Overdue' || t.status === 'Ongoing')
    .sort((a, b) => {
      const rank = (t: typeof a) => (t.status === 'Overdue' ? 0 : 1)
      if (rank(a) !== rank(b)) return rank(a) - rank(b)
      return a.deadline.localeCompare(b.deadline)
    })
    .slice(0, 4)

  const pendingSubmissionTasks = tasks
    .filter((t) => t.submissions && t.submissions.some((s) => s.status !== 'Submitted'))
    .map((t) => ({ task: t, pending: t.submissions!.filter((s) => s.status !== 'Submitted').length }))
    .sort((a, b) => b.pending - a.pending)
    .slice(0, 3)

  const upcomingEvents = eventsList.filter((e) => !isPast(e.date)).slice(0, 3)
  const recentAnnouncements = [...announcementsList].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).slice(0, 2)

  function classLabel(classId: string) {
    const c = classes.find((cl) => cl.id === classId)
    return c ? `${c.name} • ${c.subject}` : ''
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="pb-6">
      <div className="px-5 pt-3 pb-4">
        <h1 className="font-display text-xl font-bold text-ink-900">Good morning, {TEACHER_NAME.replace('Ma\'am ', '')}! 👋</h1>
        <p className="text-sm text-ink-500 mt-1">{today}</p>
      </div>

      <div className="px-5 mb-5">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2.5 bg-white border border-ink-100 rounded-xl px-3.5 h-11 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
        >
          <Search size={17} className="text-ink-400" />
          <span className="text-sm text-ink-400">Search tasks, classes, students, files...</span>
        </button>
      </div>

      <div className="px-5 mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <QuickChip icon={<ListTodo size={14} />} label="Add Task" onClick={() => onQuickCreate('task')} />
        <QuickChip icon={<Megaphone size={14} />} label="Announcement" onClick={() => onQuickCreate('announcement')} />
        <QuickChip icon={<CalendarPlus size={14} />} label="Add Event" onClick={() => onQuickCreate('event')} />
      </div>

      <div className="px-5 mb-7">
        <SectionHeading title="My Day" action={<button onClick={onSeeWork} className="text-xs font-medium text-primary-600">See all</button>} />
        {myDay.length === 0 ? (
          <Card className="p-5 text-center">
            <p className="text-sm text-ink-500">Nothing urgent right now 🎉</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {myDay.map((t) => (
              <Card key={t.id} className="p-4" onClick={() => onOpenTask(t.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-ink-900 leading-snug">{t.title}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{classLabel(t.classId)}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <PriorityBadge priority={t.priority} />
                      <span className={`text-xs ${t.status === 'Overdue' ? 'text-coral-600 font-medium' : 'text-ink-400'}`}>
                        {t.status === 'Overdue' ? 'Overdue' : relativeDueLabel(t.deadline)}
                      </span>
                      {t.submissions && (
                        <span className="text-xs text-ink-400">
                          {t.submissions.filter((s) => s.status !== 'Submitted').length} to check
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-ink-300 shrink-0 mt-1" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 mb-7">
        <SectionHeading title="Pending Submissions" />
        {pendingSubmissionTasks.length === 0 ? (
          <Card className="p-5 text-center">
            <p className="text-sm text-ink-500">No pending submissions.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-ink-100">
            {pendingSubmissionTasks.map(({ task, pending }) => (
              <button key={task.id} onClick={() => onOpenTask(task.id)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <div className="h-9 w-9 rounded-lg bg-coral-500/10 text-coral-600 flex items-center justify-center shrink-0">
                  <ClipboardCheck size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900 truncate">{task.title}</p>
                  <p className="text-xs text-ink-400 mt-0.5 truncate">{classLabel(task.classId)}</p>
                </div>
                <span className="text-xs font-semibold text-coral-600 shrink-0">{pending} pending</span>
              </button>
            ))}
          </Card>
        )}
      </div>

      <div className="px-5 mb-7">
        <SectionHeading title="Upcoming" action={<button onClick={onSeeCalendar} className="text-xs font-medium text-primary-600">Calendar</button>} />
        {upcomingEvents.length === 0 ? (
          <EmptyState icon={<span className="text-2xl">🗓️</span>} title="No upcoming events." />
        ) : (
          <Card className="divide-y divide-ink-100">
            {upcomingEvents.map((e) => {
              const meta = eventTypeMeta[e.type]
              return (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-ink-50 shrink-0">
                    <span className="text-[10px] font-medium text-ink-400 uppercase">{format(e.date, 'MMM')}</span>
                    <span className="text-sm font-semibold text-ink-800 -mt-0.5">{format(e.date, 'D')}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900 truncate">{e.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
                      <span className={`text-xs ${meta.color}`}>{e.type}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </Card>
        )}
      </div>

      <div className="px-5">
        <SectionHeading title="Recent Activity" />
        {recentAnnouncements.length === 0 ? (
          <EmptyState icon={<Megaphone size={26} />} title="No recent announcements." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentAnnouncements.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-medium text-sm text-ink-900">{a.title}</p>
                  {a.pinned && <PinnedBadge />}
                </div>
                <p className="text-sm text-ink-600 leading-relaxed line-clamp-2">{a.content}</p>
                <p className="text-xs text-ink-400 mt-2">Posted {a.postedAt}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QuickChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex items-center gap-1.5 bg-white border border-ink-100 rounded-full pl-3 pr-3.5 py-2 text-xs font-medium text-ink-700 active:bg-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
    >
      <span className="text-primary-600">{icon}</span>
      {label}
    </button>
  )
}

function isPast(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}
