export type Priority = 'Urgent' | 'High' | 'Normal' | 'Low'
export type TaskStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Overdue'
export type SubmissionStatus = 'Submitted' | 'Pending' | 'Late' | 'Missing' | 'Resubmission Required'
export type EventType = 'Deadline' | 'School Event' | 'Meeting' | 'Personal Task'
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'
export type RecurrenceRule = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Custom'

// --- Roles & auth (mock/demo — see state/store.ts for the caveats) ---
export type Role = 'TEACHER' | 'SHS_HEAD' | 'SYSTEM_ADMIN'

export interface AppUser {
  id: string
  name: string
  email: string
  role: Role
  department?: string
}

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

export type AnnouncementAudience = 'all' | 'grade11' | 'grade12'
export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent'

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  audience: AnnouncementAudience
  priority: AnnouncementPriority
  createdBy: string
  postedAt: string
  scheduledFor?: string
  expiresAt?: string
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

// --- SHS Head monitoring (Phase 2) ---
// A teacher's status is a simple administrative label, not something a
// teacher sets themselves — see pages/AdminTeachers.tsx.
export type TeacherStatus = 'Active' | 'Needs Attention' | 'No Status'

export interface TeacherDirectoryEntry {
  id: string
  name: string
  department: string
  status: TeacherStatus
  // True only for the one demo Teacher account — its classes/tasks/sessions
  // are pulled live from app state instead of a separate static mock, so
  // logging in as that teacher and as the SHS Head shows the same reality.
  isLiveAccount?: boolean
}

export interface TeacherTaskSummary {
  title: string
  status: string
}

// See section 27 of the brief: never infer "absent" from silence. These
// three states are deliberately neutral about *why* nothing was recorded.
export type CheckInStatus = 'Started' | 'Not Recorded' | 'Needs Verification'

export interface ClassSession {
  id: string
  classId: string
  teacherId: string
  time: string
  checkInTime?: string
  status: CheckInStatus
}

export type PageKey =
  | 'login'
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
  | 'adminHome'
  | 'adminTeachers'
  | 'adminTeacherProfile'
  | 'adminClasses'
  | 'adminReports'
  | 'adminAnnouncements'
  | 'adminNotifications'
  | 'systemAdminHome'

export type WorkTab = 'tasks' | 'submissions'
export type ClassTab = 'overview' | 'students' | 'tasks' | 'activity'
