import { useMemo, useState } from 'react'
import {
  tasks as initialTasks,
  announcements as initialAnnouncements,
  events as initialEvents,
  resources as initialResources,
  notes as initialNotes,
  notifications as initialNotifications,
  templates,
  classes as initialClasses,
  students as initialStudents,
  demoUsers,
  initialClassSessions,
} from '../data/mockData'
import type {
  TaskItem,
  AnnouncementItem,
  CalendarEvent,
  ResourceFile,
  NoteItem,
  NotificationItem,
  SubmissionStatus,
  RecurrenceRule,
  ClassSection,
  Student,
  Submission,
  AppUser,
  Role,
  ClassSession,
} from '../types'
import { withLiveStatus } from '../utils/taskStatus'

let idCounter = 1000
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}${idCounter}`
}

/**
 * Everything in this file is the "local" data layer. It is intentionally the
 * only place that touches raw task/announcement/etc. arrays — every page
 * reads through the functions below. That seam is what makes two future
 * upgrades possible without touching UI code:
 *  1. Swapping useState for a local persisted store (offline-first)
 *  2. Swapping these mock mutations for real Supabase calls (online sync)
 *
 * currentUser below is a MOCK session — picking a demo account just sets this
 * in memory. There is no real authentication, no password check, and no
 * server session. See utils/permissions.ts for what this can and can't
 * actually guarantee.
 */
export function useAppState() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)
  const [classes, setClasses] = useState<ClassSection[]>(initialClasses)
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementItem[]>(initialAnnouncements)
  const [eventsList, setEventsList] = useState<CalendarEvent[]>(initialEvents)
  const [resourcesList, setResourcesList] = useState<ResourceFile[]>(initialResources)
  const [notesList, setNotesList] = useState<NoteItem[]>(initialNotes)
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(initialNotifications)
  const [classSessions, setClassSessions] = useState<ClassSession[]>(initialClassSessions)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400)
  }

  function loginAs(role: Role) {
    const user = demoUsers.find((u) => u.role === role)
    if (!user) return
    setCurrentUser(user)
  }

  function logout() {
    setCurrentUser(null)
  }

  // Tasks are always exposed with their live-derived status applied, and
  // archived tasks are hidden from every normal view.
  const liveTasks = useMemo(() => tasks.map(withLiveStatus).filter((t) => !t.archived), [tasks])
  const archivedTasks = useMemo(() => tasks.map(withLiveStatus).filter((t) => t.archived), [tasks])

  function addTask(
    input: Omit<TaskItem, 'id' | 'status' | 'createdAt' | 'quarter' | 'archived' | 'submissions' | 'totalStudents'>,
    trackSubmissions = false,
  ) {
    const cls = classes.find((c) => c.id === input.classId)
    const roster = students.filter((s) => s.classId === input.classId)
    const submissions: Submission[] | undefined = trackSubmissions
      ? roster.map((s): Submission => ({ studentId: s.id, status: 'Pending' }))
      : undefined
    const task: TaskItem = {
      ...input,
      id: nextId('t'),
      status: 'Ongoing',
      createdAt: new Date().toISOString().slice(0, 10),
      quarter: 'Q2',
      totalStudents: cls?.studentCount,
      submissions,
    }
    setTasks((prev) => [task, ...prev])
    showToast('Task created successfully.')
    return task
  }

  function updateTask(id: string, patch: Partial<TaskItem>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    showToast('Task updated.')
  }

  function toggleTaskComplete(id: string) {
    const current = tasks.find((t) => t.id === id)
    if (!current) return
    const nowComplete = current.status !== 'Completed'
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nowComplete ? 'Completed' : withLiveStatus(t).status } : t)))
    showToast(nowComplete ? 'Task marked as completed.' : 'Task marked as ongoing.')
  }

  function archiveTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, archived: true } : t)))
    showToast('Task archived.')
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    showToast('Task deleted.')
  }

  function setSubmissionStatus(taskId: string, studentId: string, status: SubmissionStatus) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.submissions) return t
        const submissions = t.submissions.map((s) =>
          s.studentId === studentId ? { ...s, status, submittedAt: status === 'Submitted' ? 'Just now' : s.submittedAt } : s,
        )
        return { ...t, submissions }
      }),
    )
    showToast('Submission status updated.')
  }

  function setSubmissionTracking(taskId: string, enabled: boolean) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        if (enabled) {
          if (t.submissions) return t
          const roster = students.filter((s) => s.classId === t.classId)
          const cls = classes.find((c) => c.id === t.classId)
          return {
            ...t,
            submissions: roster.map((s): Submission => ({ studentId: s.id, status: 'Pending' })),
            totalStudents: cls?.studentCount,
          }
        }
        return { ...t, submissions: undefined }
      }),
    )
    showToast(enabled ? 'Now tracking submissions for this task.' : 'Submission tracking turned off.')
  }

  function addClass(input: Omit<ClassSection, 'id' | 'studentCount'>) {
    const cls: ClassSection = { ...input, id: nextId('c'), studentCount: 0 }
    setClasses((prev) => [...prev, cls])
    showToast('Class added successfully.')
    return cls
  }

  function updateClass(id: string, patch: Partial<Omit<ClassSection, 'id' | 'studentCount'>>) {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    showToast('Class updated.')
  }

  function deleteClass(id: string) {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setStudents((prev) => prev.filter((s) => s.classId !== id))
    showToast('Class deleted.')
  }

  function addStudent(classId: string, name: string) {
    const student: Student = { id: nextId('s'), name, classId }
    setStudents((prev) => [...prev, student])
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, studentCount: c.studentCount + 1 } : c)))
    showToast('Student added.')
    return student
  }

  function removeStudent(studentId: string) {
    const student = students.find((s) => s.id === studentId)
    if (!student) return
    setStudents((prev) => prev.filter((s) => s.id !== studentId))
    setClasses((prev) => prev.map((c) => (c.id === student.classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c)))
    // Clean up this student's submission records so counts everywhere stay accurate.
    setTasks((prev) =>
      prev.map((t) => (t.submissions ? { ...t, submissions: t.submissions.filter((sub) => sub.studentId !== studentId) } : t)),
    )
    showToast('Student removed.')
  }

  function updateStudentName(studentId: string, name: string) {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, name } : s)))
    showToast('Student updated.')
  }

  function addAnnouncement(input: Omit<AnnouncementItem, 'id' | 'postedAt' | 'quarter' | 'archived' | 'createdBy'>) {
    if (currentUser?.role !== 'SHS_HEAD' && currentUser?.role !== 'SYSTEM_ADMIN') {
      showToast('Only the SHS Head can post announcements.')
      return undefined
    }
    const item: AnnouncementItem = {
      ...input,
      id: nextId('a'),
      createdBy: currentUser.name,
      postedAt: input.scheduledFor ? `Scheduled for ${input.scheduledFor}` : 'Just now',
      quarter: 'Q2',
    }
    setAnnouncementsList((prev) => [item, ...prev])
    showToast(input.scheduledFor ? 'Announcement scheduled.' : 'Announcement published.')
    return item
  }

  function updateAnnouncement(id: string, patch: Partial<AnnouncementItem>) {
    setAnnouncementsList((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
    showToast('Announcement updated.')
  }

  function deleteAnnouncement(id: string) {
    setAnnouncementsList((prev) => prev.filter((a) => a.id !== id))
    showToast('Announcement deleted.')
  }

  function togglePinAnnouncement(id: string) {
    setAnnouncementsList((prev) => prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)))
  }

  function addEvent(input: Omit<CalendarEvent, 'id' | 'quarter' | 'archived'>) {
    const item: CalendarEvent = { ...input, id: nextId('e'), quarter: 'Q2' }
    setEventsList((prev) => [...prev, item].sort((a, b) => a.date.localeCompare(b.date)))
    showToast('Event added to calendar.')
    return item
  }

  function addResource(input: Omit<ResourceFile, 'id' | 'uploadedAt' | 'quarter' | 'archived'>) {
    const item: ResourceFile = {
      ...input,
      id: nextId('r'),
      uploadedAt: 'Just now',
      quarter: 'Q2',
    }
    setResourcesList((prev) => [item, ...prev])
    showToast('Resource uploaded.')
    return item
  }

  function addNote(input: Omit<NoteItem, 'id' | 'createdAt'>) {
    const item: NoteItem = { ...input, id: nextId('n'), createdAt: 'Just now' }
    setNotesList((prev) => [item, ...prev])
    showToast('Note saved.')
    return item
  }

  function deleteNote(id: string) {
    setNotesList((prev) => prev.filter((n) => n.id !== id))
    showToast('Note deleted.')
  }

  function markNotificationRead(id: string) {
    setNotificationsList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  function markAllNotificationsRead() {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })))
    showToast('All notifications marked as read.')
  }

  // Class check-in. Only the signed-in teacher can start their own class, and
  // starting it records a check-in time — it never *infers* anything about
  // classes that weren't started (see CheckInStatus in types.ts).
  function startClass(sessionId: string) {
    if (currentUser?.role !== 'TEACHER') return
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    setClassSessions((prev) =>
      prev.map((cs) =>
        cs.id === sessionId && cs.teacherId === currentUser.id ? { ...cs, status: 'Started', checkInTime: now } : cs,
      ),
    )
    showToast(`Class started at ${now}.`)
  }

  function resolveVerification(sessionId: string, status: 'Started' | 'Not Recorded') {
    if (currentUser?.role !== 'SHS_HEAD' && currentUser?.role !== 'SYSTEM_ADMIN') return
    setClassSessions((prev) => prev.map((cs) => (cs.id === sessionId ? { ...cs, status } : cs)))
    showToast('Session status updated.')
  }

  function resetDemoData() {
    setClassSessions(initialClassSessions)
    setTasks(initialTasks)
    setClasses(initialClasses)
    setStudents(initialStudents)
    setAnnouncementsList(initialAnnouncements)
    setEventsList(initialEvents)
    setResourcesList(initialResources)
    setNotesList(initialNotes)
    setNotificationsList(initialNotifications)
    showToast('Demo data has been reset.')
  }

  const unreadCount = useMemo(() => notificationsList.filter((n) => !n.read).length, [notificationsList])

  // Calendar events are the union of manually-added events and every
  // non-archived, non-completed task's deadline — this is what keeps
  // "create a task with a deadline" automatically show up on the calendar.
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const fromTasks: CalendarEvent[] = liveTasks
      .filter((t) => t.status !== 'Completed')
      .map((t) => ({
        id: `task-${t.id}`,
        title: t.title,
        date: t.deadline,
        type: 'Deadline',
        quarter: t.quarter,
        linkedTaskId: t.id,
      }))
    return [...eventsList, ...fromTasks].sort((a, b) => a.date.localeCompare(b.date))
  }, [eventsList, liveTasks])

  return {
    currentUser,
    loginAs,
    logout,
    tasks: liveTasks,
    archivedTasks,
    classes,
    students,
    templates,
    announcementsList,
    eventsList,
    calendarEvents,
    resourcesList,
    notesList,
    notificationsList,
    unreadCount,
    toast,
    showToast,
    addTask,
    updateTask,
    toggleTaskComplete,
    archiveTask,
    deleteTask,
    setSubmissionStatus,
    setSubmissionTracking,
    addClass,
    updateClass,
    deleteClass,
    addStudent,
    removeStudent,
    updateStudentName,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePinAnnouncement,
    addEvent,
    addResource,
    addNote,
    deleteNote,
    markNotificationRead,
    markAllNotificationsRead,
    classSessions,
    startClass,
    resolveVerification,
    resetDemoData,
  }
}

export type AppState = ReturnType<typeof useAppState>
export type { RecurrenceRule }
