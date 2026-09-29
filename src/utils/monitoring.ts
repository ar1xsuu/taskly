import type { AppState } from '../state/store'
import type { ClassSection, ClassSession, TeacherDirectoryEntry, TeacherTaskSummary } from '../types'
import { teacherDirectory, otherTeacherClasses, otherTeacherClassIds, otherTeacherTasks } from '../data/mockData'

export function findClass(state: AppState, classId: string): ClassSection | undefined {
  return state.classes.find((c) => c.id === classId) ?? otherTeacherClasses.find((c) => c.id === classId)
}

export function findTeacher(teacherId: string): TeacherDirectoryEntry | undefined {
  return teacherDirectory.find((t) => t.id === teacherId)
}

export function teacherClasses(state: AppState, teacher: TeacherDirectoryEntry): ClassSection[] {
  if (teacher.isLiveAccount) return state.classes
  return (otherTeacherClassIds[teacher.id] ?? [])
    .map((id) => otherTeacherClasses.find((c) => c.id === id))
    .filter((c): c is ClassSection => !!c)
}

// Task summaries only — never the full task objects, and never notes.
export function teacherTaskSummaries(state: AppState, teacher: TeacherDirectoryEntry): TeacherTaskSummary[] {
  if (teacher.isLiveAccount) {
    return state.tasks.map((t) => ({
      title: t.title,
      status: t.status === 'Ongoing' && isDueTomorrow(t.deadline) ? 'Due Tomorrow' : t.status,
    }))
  }
  return otherTeacherTasks[teacher.id] ?? []
}

function isDueTomorrow(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.getFullYear() === y && tomorrow.getMonth() === m - 1 && tomorrow.getDate() === d
}

export function taskCounts(tasks: TeacherTaskSummary[]) {
  const completed = tasks.filter((t) => t.status === 'Completed').length
  const overdue = tasks.filter((t) => t.status === 'Overdue').length
  const active = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Archived').length
  return { active, completed, overdue }
}

export function sessionsFor(state: AppState, teacherId: string): ClassSession[] {
  return state.classSessions.filter((cs) => cs.teacherId === teacherId)
}

export interface MonitoringAlert {
  id: string
  title: string
  detail: string
  kind: 'attendance' | 'verification'
  sessionId: string
}

// Alerts are derived, never stored: a session that isn't "Started" is
// surfaced as something to look at, not as a conclusion about the teacher.
export function buildAlerts(state: AppState): MonitoringAlert[] {
  const alerts: MonitoringAlert[] = []
  for (const cs of state.classSessions) {
    const teacher = findTeacher(cs.teacherId)
    const cls = findClass(state, cs.classId)
    if (!teacher || !cls) continue
    if (cs.status === 'Not Recorded') {
      alerts.push({
        id: `al-${cs.id}`,
        title: 'Class attendance not recorded',
        detail: `${cls.name} · ${cs.time} · ${teacher.name}`,
        kind: 'attendance',
        sessionId: cs.id,
      })
    } else if (cs.status === 'Needs Verification') {
      alerts.push({
        id: `al-${cs.id}`,
        title: 'Teacher requires verification',
        detail: `${cls.name} · ${cs.time} · ${teacher.name}`,
        kind: 'verification',
        sessionId: cs.id,
      })
    }
  }
  return alerts
}

// "8:00 AM" -> minutes since midnight. Sorting these as plain strings puts
// "10:00 AM" before "8:00 AM", so every schedule list compares this instead.
export function timeToMinutes(time: string): number {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return 0
  let h = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') h += 12
  return h * 60 + Number(m[2])
}

export function byTime(a: ClassSession, b: ClassSession): number {
  return timeToMinutes(a.time) - timeToMinutes(b.time)
}
