import type { PageKey, Role } from '../types'

/**
 * CAVEAT: TASKLY is a client-side prototype with no router and no backend —
 * "pages" are just React state, not real URLs. So this guard stops a logged-in
 * user from reaching a page through the app's own navigation (nav taps, deep
 * links from search/notifications, etc.), which is what "manually entering a
 * URL" maps to in an app with no URL bar to type into. It does NOT, and
 * cannot, replace server-side authorization — the mock data for every role is
 * still sitting in the same browser bundle. Real enforcement (a teacher
 * genuinely cannot fetch another teacher's data) requires a real backend with
 * its own permission checks, which is out of scope until TASKLY has one.
 */

// Pages that exist only inside the SHS Head admin shell.
const SHS_HEAD_PAGES: PageKey[] = [
  'adminHome',
  'adminTeachers',
  'adminTeacherProfile',
  'adminClasses',
  'adminReports',
  'adminAnnouncements',
  'adminNotifications',
]

// Pages that exist only inside the System Admin shell.
const SYSTEM_ADMIN_PAGES: PageKey[] = ['systemAdminHome']

// Everything else is the Teacher app's own page set.
export function canAccess(role: Role, page: PageKey): boolean {
  if (page === 'login') return true
  if (SHS_HEAD_PAGES.includes(page)) return role === 'SHS_HEAD' || role === 'SYSTEM_ADMIN'
  if (SYSTEM_ADMIN_PAGES.includes(page)) return role === 'SYSTEM_ADMIN'
  // Teacher pages — SHS Heads and System Admins don't use this app shell at
  // all post-login, so only Teachers reach these in normal navigation.
  return role === 'TEACHER'
}

export function homePageFor(role: Role): PageKey {
  if (role === 'SHS_HEAD') return 'adminHome'
  if (role === 'SYSTEM_ADMIN') return 'systemAdminHome'
  return 'home'
}

// Derives "11" or "12" from a class name like "12 - STEM A". Used to match
// classes against an announcement's grade-level audience without needing a
// separate gradeLevel field on every class record.
export function classGradeLevel(className: string): '11' | '12' | null {
  const match = className.match(/^(11|12)\b/)
  return match ? (match[1] as '11' | '12') : null
}
