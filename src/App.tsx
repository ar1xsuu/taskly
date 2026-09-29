import { useState } from 'react'
import type { PageKey, Role } from './types'
import { useAppState } from './state/store'
import { canAccess, homePageFor } from './utils/permissions'
import BottomNav from './components/BottomNav'
import TopBar from './components/TopBar'
import { Toast, Sheet, Card } from './components/common'
import { QuickActionButton, QuickActionSheet, type CreateKind } from './components/QuickAction'
import { AddTaskSheet, AddEventSheet, UploadResourceSheet, AddNoteSheet } from './components/CreateSheets'
import Login from './pages/Login'
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
import AdminHome from './pages/AdminHome'
import AdminShell from './components/AdminShell'
import AdminTeachers from './pages/AdminTeachers'
import AdminTeacherProfile from './pages/AdminTeacherProfile'
import AdminClasses from './pages/AdminClasses'
import AdminReports from './pages/AdminReports'
import AdminNotifications from './pages/AdminNotifications'
import { buildAlerts } from './utils/monitoring'
import AdminAnnouncements from './pages/AdminAnnouncements'
import SystemAdminHome from './pages/SystemAdminHome'
import { SCHOOL_NAME, SCHOOL_YEAR } from './data/mockData'

const TOP_LEVEL: PageKey[] = ['home', 'work', 'classes', 'calendar', 'more']

export default function App() {
  const state = useAppState()
  const [page, setPage] = useState<PageKey>('home')
  // Only the setter is used — back-navigation always pops from setHistory's
  // updater function, so the array itself never needs to be read directly.
  const [, setHistory] = useState<PageKey[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeClassId, setActiveClassId] = useState<string | null>(null)
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  // Global quick-action ("+") state — a single consistent entry point for
  // creating a task/event/resource/note from anywhere in the Teacher app.
  const [showQuickAction, setShowQuickAction] = useState(false)
  const [createMode, setCreateMode] = useState<CreateKind | null>(null)

  if (!state.currentUser) {
    return <Login state={state} />
  }

  const currentUser = state.currentUser
  const role: Role = currentUser.role

  function handleLogout() {
    state.logout()
    setPage('home')
    setHistory([])
    setActiveTaskId(null)
    setActiveClassId(null)
  }

  function navigate(next: PageKey) {
    // Application-level route guard — see utils/permissions.ts for exactly
    // what this does and doesn't protect against.
    if (!canAccess(role, next)) {
      state.showToast("You don't have access to that.")
      return
    }
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
        setPage(homePageFor(role))
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

  // --- SHS Head shell: a deliberately different, monitoring-oriented layout
  // rather than the Teacher app's bottom-nav productivity shell. ---
  if (role === 'SHS_HEAD') {
    const adminPage: PageKey = canAccess(role, page) ? page : 'adminHome'
    return (
      <AdminShell
        page={adminPage}
        userName={currentUser.name}
        alertCount={buildAlerts(state).length}
        onNavigate={navigate}
        onLogout={handleLogout}
        toast={<Toast message={state.toast} />}
      >
        {adminPage === 'adminHome' && (
          <AdminHome
            state={state}
            onOpenTeachers={() => navigate('adminTeachers')}
            onOpenClasses={() => navigate('adminClasses')}
            onOpenReports={() => navigate('adminReports')}
            onOpenNotifications={() => navigate('adminNotifications')}
          />
        )}
        {adminPage === 'adminTeachers' && (
          <AdminTeachers
            state={state}
            onOpenTeacher={(id) => {
              setActiveTeacherId(id)
              navigate('adminTeacherProfile')
            }}
          />
        )}
        {adminPage === 'adminTeacherProfile' && activeTeacherId && (
          <AdminTeacherProfile state={state} teacherId={activeTeacherId} onBack={() => navigate('adminTeachers')} />
        )}
        {adminPage === 'adminClasses' && <AdminClasses state={state} />}
        {adminPage === 'adminReports' && <AdminReports state={state} />}
        {adminPage === 'adminAnnouncements' && <AdminAnnouncements state={state} />}
        {adminPage === 'adminNotifications' && <AdminNotifications state={state} onOpenClasses={() => navigate('adminClasses')} />}
      </AdminShell>
    )
  }

  // --- System Admin shell: single placeholder screen for now (see
  // pages/SystemAdminHome.tsx for what's scoped to a later phase). ---
  if (role === 'SYSTEM_ADMIN') {
    return <SystemAdminHome state={state} onLogout={handleLogout} />
  }

  // --- Teacher shell: the original five-tab productivity app. ---
  const effectivePage = canAccess(role, page) ? page : 'home'
  const showChrome = TOP_LEVEL.includes(effectivePage) || effectivePage === 'search'
  const showFab = TOP_LEVEL.includes(effectivePage)

  return (
    <div className="min-h-screen bg-[#F7F8F6] font-body">
      <div className="max-w-md mx-auto min-h-screen bg-[#F7F8F6] relative">
        {showChrome && effectivePage !== 'search' && (
          <TopBar
            unreadCount={state.unreadCount}
            onOpenNotifications={() => navigate('notifications')}
            onOpenProfile={() => setShowProfile(true)}
          />
        )}

        <main className="pb-24">
          {effectivePage === 'home' && (
            <Home
              state={state}
              onOpenTask={openTask}
              onOpenSearch={() => navigate('search')}
              onSeeWork={() => navigate('work')}
              onSeeCalendar={() => navigate('calendar')}
              onOpenAnnouncements={() => navigate('announcements')}
              onQuickCreate={handleQuickCreate}
            />
          )}
          {effectivePage === 'search' && (
            <SearchPage
              state={state}
              onBack={goBack}
              onOpenTask={openTask}
              onOpenClass={openClass}
              onOpenAnnouncements={() => navigate('announcements')}
              onOpenResources={() => navigate('resources')}
              onOpenCalendar={() => navigate('calendar')}
              onOpenNotes={() => navigate('notes')}
            />
          )}
          {effectivePage === 'work' && (
            <Work state={state} onOpenTask={openTask} onOpenSubmissions={openSubmissions} onOpenAnnouncements={() => navigate('announcements')} />
          )}
          {effectivePage === 'taskDetail' && activeTaskId && (
            <TaskDetail state={state} taskId={activeTaskId} onBack={goBack} onViewSubmissions={openSubmissions} onDeleted={goBack} />
          )}
          {effectivePage === 'submissions' && activeTaskId && <Submissions state={state} taskId={activeTaskId} onBack={goBack} />}
          {effectivePage === 'classes' && <Classes state={state} onOpenClass={openClass} />}
          {effectivePage === 'classDetail' && activeClassId && <ClassDetail state={state} classId={activeClassId} onBack={goBack} onOpenTask={openTask} onDeleted={goBack} />}
          {effectivePage === 'calendar' && <CalendarPage state={state} onOpenTask={openTask} />}
          {effectivePage === 'more' && <More state={state} onNavigate={navigate} unreadCount={state.unreadCount} onLogout={handleLogout} />}
          {effectivePage === 'announcements' && <Announcements state={state} onBack={goBack} />}
          {effectivePage === 'resources' && <Resources state={state} onBack={goBack} />}
          {effectivePage === 'notes' && <Notes state={state} onBack={goBack} />}
          {effectivePage === 'reports' && <Reports state={state} onBack={goBack} />}
          {effectivePage === 'notifications' && <Notifications state={state} onBack={goBack} onOpenTask={openTask} />}
          {effectivePage === 'archive' && <Archive state={state} onBack={goBack} onOpenTask={openTask} />}
          {effectivePage === 'templates' && <Templates state={state} onBack={goBack} />}
        </main>

        {showFab && <QuickActionButton onOpen={() => setShowQuickAction(true)} />}
        <BottomNav active={effectivePage} onNavigate={navigate} />
        <Toast message={state.toast} />

        <QuickActionSheet open={showQuickAction} onClose={() => setShowQuickAction(false)} onSelect={handleQuickCreate} />

        <AddTaskSheet open={createMode === 'task'} onClose={() => setCreateMode(null)} state={state} onCreated={openTask} />
        <AddEventSheet open={createMode === 'event'} onClose={() => setCreateMode(null)} state={state} />
        <UploadResourceSheet open={createMode === 'resource'} onClose={() => setCreateMode(null)} state={state} />
        <AddNoteSheet open={createMode === 'note'} onClose={() => setCreateMode(null)} state={state} />

        <Sheet open={showProfile} onClose={() => setShowProfile(false)} title="Profile">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-full bg-primary-500 text-white font-display font-semibold flex items-center justify-center text-lg">
              {currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="font-medium text-ink-900">{currentUser.name}</p>
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
          <button
            onClick={() => {
              setShowProfile(false)
              handleLogout()
            }}
            className="w-full text-center text-sm font-medium text-coral-600 mt-4 py-2"
          >
            Log out
          </button>
        </Sheet>
      </div>
    </div>
  )
}
