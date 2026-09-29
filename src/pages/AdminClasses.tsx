import { useMemo, useState } from 'react'
import type { AppState } from '../state/store'
import type { CheckInStatus } from '../types'
import { Card, CheckInBadge, EmptyState } from '../components/common'
import { teacherDirectory } from '../data/mockData'
import { byTime, findClass, findTeacher } from '../utils/monitoring'

export default function AdminClasses({ state }: { state: AppState }) {
  const [teacher, setTeacher] = useState('All')
  const [time, setTime] = useState('All')
  const [status, setStatus] = useState<'All' | CheckInStatus>('All')

  const times = ['All', ...Array.from(new Set(state.classSessions.map((s) => s.time)))]

  const rows = useMemo(
    () =>
      state.classSessions
        .filter((s) => teacher === 'All' || s.teacherId === teacher)
        .filter((s) => time === 'All' || s.time === time)
        .filter((s) => status === 'All' || s.status === status)
        .sort(byTime),
    [state.classSessions, teacher, time, status],
  )

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-900">Class Monitoring</h1>
      <p className="text-sm text-ink-500 mt-1 mb-4">
        Today · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Showing today only in this prototype.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <select aria-label="Teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)} className="h-10 rounded-xl border border-ink-100 bg-white px-3 text-sm text-ink-700">
          <option value="All">All teachers</option>
          {teacherDirectory.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select aria-label="Time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 rounded-xl border border-ink-100 bg-white px-3 text-sm text-ink-700">
          {times.map((t) => <option key={t} value={t}>{t === 'All' ? 'All times' : t}</option>)}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as 'All' | CheckInStatus)} className="h-10 rounded-xl border border-ink-100 bg-white px-3 text-sm text-ink-700">
          <option value="All">All statuses</option>
          <option value="Started">Class Started</option>
          <option value="Not Recorded">Attendance Not Recorded</option>
          <option value="Needs Verification">Requires Verification</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<span className="text-2xl">🗓️</span>} title="No classes match" subtitle="Try clearing a filter." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[560px]">
            <thead>
              <tr className="text-xs text-ink-400 border-b border-ink-100">
                <th className="font-medium px-4 py-3">Time</th>
                <th className="font-medium px-4 py-3">Teacher</th>
                <th className="font-medium px-4 py-3">Class</th>
                <th className="font-medium px-4 py-3">Status</th>
                <th className="font-medium px-4 py-3"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-ink-600 whitespace-nowrap">{s.time}</td>
                  <td className="px-4 py-3 text-ink-900">{findTeacher(s.teacherId)?.name}</td>
                  <td className="px-4 py-3 text-ink-800">{findClass(state, s.classId)?.name}</td>
                  <td className="px-4 py-3"><CheckInBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {s.status === 'Needs Verification' && (
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => state.resolveVerification(s.id, 'Started')} className="text-xs font-medium text-primary-700 bg-primary-50 rounded-full px-2.5 py-1">Confirm held</button>
                        <button onClick={() => state.resolveVerification(s.id, 'Not Recorded')} className="text-xs font-medium text-ink-600 bg-ink-100 rounded-full px-2.5 py-1">Mark not recorded</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <p className="text-xs text-ink-400 mt-3">
        “Attendance Not Recorded” means no check-in was logged — it does not mean the teacher was absent.
      </p>
    </div>
  )
}
