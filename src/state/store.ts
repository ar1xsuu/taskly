import { useMemo, useState } from 'react'
import {
  tasks as initialTasks,
  announcements as initialAnnouncements,
  events as initialEvents,
  resources as initialResources,
  notes as initialNotes,
  notifications as initialNotifications,
  templates,
  classes,
  students,
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
 */
export function useAppState() {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementItem[]>(initialAnnouncements)
  const [eventsList, setEventsList] = useState<CalendarEvent[]>(initialEvents)
  const [resourcesList, setResourcesList] = useState<ResourceFile[]>(initialResources)
  const [notesList, setNotesList] = useState<NoteItem[]>(initialNotes)
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(initialNotifications)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400)
  }

  // Tasks are always exposed with their live-derived status applied, and
  // archived tasks are hidden from every normal view.
  const liveTasks = useMemo(() => tasks.map(withLiveStatus).filter((t) => !t.archived), [tasks])
  const archivedTasks = useMemo(() => tasks.map(withLiveStatus).filter((t) => t.archived), [tasks])

  function addTask(input: Omit<TaskItem, 'id' | 'status' | 'createdAt' | 'quarter' | 'archived'>) {
    const cls = classes.find((c) => c.id === input.classId)
    const task: TaskItem = {
      ...input,
      id: nextId('t'),
      status: 'Ongoing',
      createdAt: new Date().toISOString().slice(0, 10),
      quarter: 'Q2',
      totalStudents: cls?.studentCount,
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

  function addAnnouncement(input: Omit<AnnouncementItem, 'id' | 'postedAt' | 'quarter' | 'archived'>) {
    const item: AnnouncementItem = {
      ...input,
      id: nextId('a'),
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

  function resetDemoData() {
    setTasks(initialTasks)
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
    addAnnouncement,
    updateAnnouncement,
    togglePinAnnouncement,
    addEvent,
    addResource,
    addNote,
    deleteNote,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
  }
}

export type AppState = ReturnType<typeof useAppState>
export type { RecurrenceRule }
