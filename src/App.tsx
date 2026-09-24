import { useState } from 'react'
import type { PageKey } from './types'
import { useAppState } from './state/store'
import BottomNav from './components/BottomNav'
import TopBar from './components/TopBar'
import { Toast, Sheet, Card } from './components/common'
import { QuickActionButton, QuickActionSheet, type CreateKind } from './components/QuickAction'
import { AddTaskSheet, AddAnnouncementSheet, AddEventSheet, UploadResourceSheet, AddNoteSheet } from './components/CreateSheets'
import Home from './pages/Home'
import SearchPage from './pages/Search'
import Work from './pages/Work'
import TaskDetail from './pages/TaskDetail'
import Submissions from './pages/Submissions'
import { Classes, ClassDetail } from './pages/Classes'
import CalendarPage from './pages/Calendar'
import More from './pages/More'
import Announcements from './pages/Announcements'
import Resources from './pages/Resources'
import Notes from './pages/Notes'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import Archive from './pages/Archive'
import Templates from './pages/Templates'
import { TEACHER_NAME, SCHOOL_NAME, SCHOOL_YEAR } from './data/mockData'

const TOP_LEVEL: PageKey[] = ['home', 'work', 'classes', 'calendar', 'more']

export default function App() {
  const state = useAppState()
  const [page, setPage] = useState<PageKey>('home')
  // Only the setter is used — back-navigation always pops from setHistory's
  // updater function, so the array itself never needs to be read directly.
  const [, setHistory] = useState<PageKey[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeClassId, setActiveClassId] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  // Global quick-action ("+") state — a single consistent entry point for
  // creating a task/announcement/event/resource/note from anywhere.
  const [showQuickAction, setShowQuickAction] = useState(false)
  const [createMode, setCreateMode] = useState<CreateKind | null>(null)

  function navigate(next: PageKey) {
    if (TOP_LEVEL.includes(next)) {
      setHistory([])
    } else {
      setHistory((prev) => [...prev, page])
    }
    setPage(next)
  }

  function goBack() {
    setHistory((prev) => {
      if (prev.length === 0) {
        setPage('home')
        return prev
      }
      const copy = [...prev]
      const last = copy.pop() as PageKey
      setPage(last)
      return copy
    })
  }

  function openTask(id: string) {
    setActiveTaskId(id)
    navigate('taskDetail')
  }

  function openClass(id: string) {
    setActiveClassId(id)
    navigate('classDetail')
  }

  function openSubmissions(taskId: string) {
    setActiveTaskId(taskId)
    navigate('submissions')
  }

  function handleQuickCreate(kind: CreateKind) {
    setShowQuickAction(false)
    setCreateMode(kind)
  }

  const showChrome = TOP_LEVEL.includes(page) || page === 'search'
  const showFab = TOP_LEVEL.includes(page)

  return (
    <div className="min-h-screen bg-[#F7F8F6] font-body">
      <div className="max-w-md mx-auto min-h-screen bg-[#F7F8F6] relative">
        {showChrome && page !== 'search' && (
          <TopBar
            unreadCount={state.unreadCount}
            onOpenNotifications={() => navigate('notifications')}
            onOpenProfile={() => setShowProfile(true)}
          />
        )}

        <main className="pb-24">
          {page === 'home' && (
            <Home
              state={state}
              onOpenTask={openTask}
              onOpenSearch={() => navigate('search')}
              onSeeWork={() => navigate('work')}
              onSeeCalendar={() => navigate('calendar')}
              onQuickCreate={handleQuickCreate}
            />
          )}
          {page === 'search' && <SearchPage state={state} onBack={goBack} onOpenTask={openTask} onOpenClass={openClass} />}
          {page === 'work' && (
            <Work state={state} onOpenTask={openTask} onOpenSubmissions={openSubmissions} onOpenAnnouncements={() => navigate('announcements')} />
          )}
          {page === 'taskDetail' && activeTaskId && (
            <TaskDetail state={state} taskId={activeTaskId} onBack={goBack} onViewSubmissions={openSubmissions} onDeleted={goBack} />
          )}
          {page === 'submissions' && activeTaskId && <Submissions state={state} taskId={activeTaskId} onBack={goBack} />}
          {page === 'classes' && <Classes state={state} onOpenClass={openClass} />}
          {page === 'classDetail' && activeClassId && <ClassDetail state={state} classId={activeClassId} onBack={goBack} onOpenTask={openTask} />}
          {page === 'calendar' && <CalendarPage state={state} onOpenTask={openTask} />}
          {page === 'more' && <More state={state} onNavigate={navigate} unreadCount={state.unreadCount} />}
          {page === 'announcements' && <Announcements state={state} onBack={goBack} />}
          {page === 'resources' && <Resources state={state} onBack={goBack} />}
          {page === 'notes' && <Notes state={state} onBack={goBack} />}
          {page === 'reports' && <Reports state={state} onBack={goBack} />}
          {page === 'notifications' && <Notifications state={state} onBack={goBack} onOpenTask={openTask} />}
          {page === 'archive' && <Archive state={state} onBack={goBack} onOpenTask={openTask} />}
          {page === 'templates' && <Templates state={state} onBack={goBack} />}
        </main>

        {showFab && <QuickActionButton onOpen={() => setShowQuickAction(true)} />}
        <BottomNav active={page} onNavigate={navigate} />
        <Toast message={state.toast} />

        <QuickActionSheet open={showQuickAction} onClose={() => setShowQuickAction(false)} onSelect={handleQuickCreate} />

        <AddTaskSheet open={createMode === 'task'} onClose={() => setCreateMode(null)} state={state} onCreated={openTask} />
        <AddAnnouncementSheet open={createMode === 'announcement'} onClose={() => setCreateMode(null)} state={state} />
        <AddEventSheet open={createMode === 'event'} onClose={() => setCreateMode(null)} state={state} />
        <UploadResourceSheet open={createMode === 'resource'} onClose={() => setCreateMode(null)} state={state} />
        <AddNoteSheet open={createMode === 'note'} onClose={() => setCreateMode(null)} state={state} />

        <Sheet open={showProfile} onClose={() => setShowProfile(false)} title="Profile">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-full bg-primary-500 text-white font-display font-semibold flex items-center justify-center text-lg">
              R
            </div>
            <div>
              <p className="font-medium text-ink-900">{TEACHER_NAME}</p>
              <p className="text-xs text-ink-400">{SCHOOL_NAME}</p>
            </div>
          </div>
          <Card className="p-4">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-ink-500">School Year</span>
              <span className="text-sm font-medium text-ink-900">{SCHOOL_YEAR}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-t border-ink-100 mt-1 pt-2.5">
              <span className="text-sm text-ink-500">Role</span>
              <span className="text-sm font-medium text-ink-900">Senior High School Teacher</span>
            </div>
          </Card>
        </Sheet>
      </div>
    </div>
  )
}
