export type Priority = 'Urgent' | 'High' | 'Normal' | 'Low'
export type TaskStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Overdue'
export type SubmissionStatus = 'Submitted' | 'Pending' | 'Late' | 'Missing' | 'Resubmission Required'
export type EventType = 'Deadline' | 'School Event' | 'Meeting' | 'Personal Task'
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'
export type RecurrenceRule = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Custom'

export interface ClassSection {
  id: string
  name: string // e.g. "12 - STEM A"
  subject: string
  studentCount: number
}

export interface Student {
  id: string
  name: string
  classId: string
}

export interface Submission {
  studentId: string
  status: SubmissionStatus
  submittedAt?: string
  note?: string
}

export interface TaskItem {
  id: string
  title: string
  description: string
  classId: string
  subject: string
  deadline: string // ISO date
  priority: Priority
  status: TaskStatus
  attachments: string[]
  submissions?: Submission[]
  totalStudents?: number
  quarter: Quarter
  createdAt: string
  recurrence: RecurrenceRule
  archived?: boolean
}

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  classId: string | 'all'
  postedAt: string
  scheduledFor?: string
  pinned?: boolean
  quarter: Quarter
  archived?: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  date: string // ISO date
  type: EventType
  quarter: Quarter
  linkedTaskId?: string
  archived?: boolean
}

export interface ResourceFile {
  id: string
  name: string
  folder: string
  uploadedAt: string
  size: string
  tags: string[]
  quarter: Quarter
  archived?: boolean
}

export interface NoteItem {
  id: string
  title: string
  content: string
  category?: string
  createdAt: string
}

export interface NotificationItem {
  id: string
  message: string
  read: boolean
  createdAt: string
  kind: 'submission' | 'deadline' | 'meeting' | 'alert'
  linkedTaskId?: string
}

export interface TemplateItem {
  id: string
  kind: 'task' | 'announcement'
  name: string
  title: string
  body: string
  priority?: Priority
}

export type PageKey =
  | 'home'
  | 'search'
  | 'work'
  | 'taskDetail'
  | 'submissions'
  | 'classes'
  | 'classDetail'
  | 'calendar'
  | 'more'
  | 'announcements'
  | 'resources'
  | 'notes'
  | 'reports'
  | 'notifications'
  | 'archive'
  | 'templates'

export type WorkTab = 'tasks' | 'submissions'
export type ClassTab = 'overview' | 'students' | 'tasks' | 'activity'
