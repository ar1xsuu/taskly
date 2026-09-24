import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, ArrowUpRight } from 'lucide-react'
import type { AppState } from '../state/store'
import { Card, EmptyState, eventTypeMeta } from '../components/common'
import { AddEventSheet } from '../components/CreateSheets'
import { toISODate, format } from '../utils/date'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function CalendarPage({ state, onOpenTask }: { state: AppState; onOpenTask: (id: string) => void }) {
  const { calendarEvents } = state
  const [cursor, setCursor] = useState(new Date(2026, 8, 1)) // September 2026
  const [selectedDate, setSelectedDate] = useState(toISODate(2026, 8, 22))
  const [showAdd, setShowAdd] = useState(false)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof calendarEvents> = {}
    for (const e of calendarEvents) {
      map[e.date] = map[e.date] ? [...map[e.date], e] : [e]
    }
    return map
  }, [calendarEvents])

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const selectedEvents = eventsByDate[selectedDate] ?? []

  return (
    <div className="pb-8">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink-900">Calendar</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-full bg-primary-500 text-white text-xs font-medium pl-2.5 pr-3 py-2">
          <Plus size={14} /> Add Event
        </button>
      </div>

      <div className="px-5">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month" className="h-8 w-8 flex items-center justify-center rounded-full active:bg-ink-100 text-ink-500">
              <ChevronLeft size={18} />
            </button>
            <p className="font-display font-semibold text-sm text-ink-900">
              {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month" className="h-8 w-8 flex items-center justify-center rounded-full active:bg-ink-100 text-ink-500">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="text-center text-[11px] font-medium text-ink-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />
              const dateStr = toISODate(year, month, day)
              const dayEvents = eventsByDate[dateStr] ?? []
              const isSelected = dateStr === selectedDate
              return (
                <button key={i} onClick={() => setSelectedDate(dateStr)} className="flex flex-col items-center justify-center py-1.5">
                  <span
                    className={`h-7 w-7 flex items-center justify-center rounded-full text-xs ${
                      isSelected ? 'bg-primary-500 text-white font-semibold' : 'text-ink-700'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="flex items-center gap-0.5 h-1.5 mt-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span key={e.id} className={`h-1 w-1 rounded-full ${eventTypeMeta[e.type].dot}`} aria-hidden="true" />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        <div className="flex items-center gap-3 mt-3 flex-wrap px-1">
          {(Object.keys(eventTypeMeta) as (keyof typeof eventTypeMeta)[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 text-[11px] text-ink-500">
              <span className={`h-1.5 w-1.5 rounded-full ${eventTypeMeta[k].dot}`} aria-hidden="true" />
              {k}
            </span>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-ink-400 mb-2">{format(selectedDate, 'full')}</p>
          {selectedEvents.length === 0 ? (
            <EmptyState icon={<span className="text-2xl">🗓️</span>} title="No events on this day" />
          ) : (
            <Card className="divide-y divide-ink-100">
              {selectedEvents.map((e) => {
                const meta = eventTypeMeta[e.type]
                const clickable = !!e.linkedTaskId
                return (
                  <button
                    key={e.id}
                    onClick={() => e.linkedTaskId && onOpenTask(e.linkedTaskId)}
                    disabled={!clickable}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left disabled:cursor-default"
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${meta.dot}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink-900 truncate">{e.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs ${meta.color}`}>{e.type}</span>
                        {clickable && <span className="text-xs text-ink-300">· linked task</span>}
                      </div>
                    </div>
                    {clickable && <ArrowUpRight size={15} className="text-ink-300 shrink-0" />}
                  </button>
                )
              })}
            </Card>
          )}
        </div>
      </div>

      <AddEventSheet open={showAdd} onClose={() => setShowAdd(false)} state={state} defaultDate={selectedDate} />
    </div>
  )
}
