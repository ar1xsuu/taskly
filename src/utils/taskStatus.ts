import type { TaskItem, TaskStatus } from '../types'
import { parseISO } from './date'

/**
 * Derives the live status of a task from its deadline, unless it has been
 * manually completed. This keeps Home / Work / Calendar / Notifications all
 * agreeing on whether something is overdue without needing a background job.
 */
export function deriveTaskStatus(task: TaskItem): TaskStatus {
  if (task.status === 'Completed') return 'Completed'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = parseISO(task.deadline)
  const diffDays = Math.round((deadline.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return 'Overdue'
  if (diffDays <= 3) return 'Ongoing'
  return 'Upcoming'
}

export function withLiveStatus(task: TaskItem): TaskItem {
  return { ...task, status: deriveTaskStatus(task) }
}
