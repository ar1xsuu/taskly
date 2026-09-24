const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function parseISO(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function isToday(dateStr: string) {
  return sameDay(parseISO(dateStr), new Date())
}

export function isTomorrow(dateStr: string) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return sameDay(parseISO(dateStr), tomorrow)
}

export function format(dateStr: string, token: 'MMM' | 'D' | 'full' | 'weekday'): string {
  const d = parseISO(dateStr)
  if (token === 'MMM') return MONTHS_SHORT[d.getMonth()]
  if (token === 'D') return String(d.getDate())
  if (token === 'weekday') return d.toLocaleDateString('en-US', { weekday: 'short' })
  return `${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function toISODate(y: number, m: number, d: number) {
  const mm = String(m + 1).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

export function relativeDueLabel(dateStr: string): string {
  if (isToday(dateStr)) return 'Due Today'
  if (isTomorrow(dateStr)) return 'Due Tomorrow'
  return `Due ${format(dateStr, 'full')}`
}
