import React from 'react'
import { X, Pin } from 'lucide-react'
import type { Priority, SubmissionStatus, EventType, TaskStatus } from '../types'

export function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const interactive = !!onClick
  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick?.()
            }
          : undefined
      }
      className={`bg-white rounded-2xl border border-ink-100 shadow-soft ${
        interactive ? 'active:scale-[0.98] transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display font-semibold text-[15px] text-ink-800">{title}</h2>
      {action}
    </div>
  )
}

const priorityStyles: Record<Priority, { dot: string; text: string; bg: string }> = {
  Urgent: { dot: 'bg-coral-600', text: 'text-coral-600', bg: 'bg-coral-500/10' },
  High: { dot: 'bg-coral-500', text: 'text-coral-500', bg: 'bg-coral-500/10' },
  Normal: { dot: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' },
  Low: { dot: 'bg-primary-500', text: 'text-primary-600', bg: 'bg-primary-50' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const s = priorityStyles[priority]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {priority}
    </span>
  )
}

const submissionStyles: Record<SubmissionStatus, string> = {
  Submitted: 'bg-primary-50 text-primary-700',
  Pending: 'bg-ink-100 text-ink-600',
  Late: 'bg-amber-500/10 text-amber-600',
  Missing: 'bg-coral-500/10 text-coral-600',
  'Resubmission Required': 'bg-violet-500/10 text-violet-600',
}

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${submissionStyles[status]}`}>
      {status}
    </span>
  )
}

const taskStatusStyles: Record<TaskStatus, string> = {
  Upcoming: 'bg-violet-500/10 text-violet-600',
  Ongoing: 'bg-sky-500/10 text-sky-600',
  Completed: 'bg-primary-50 text-primary-700',
  Overdue: 'bg-coral-500/10 text-coral-600',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${taskStatusStyles[status]}`}>{status}</span>
}

export function PinnedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-600">
      <Pin size={11} /> Pinned
    </span>
  )
}

export function Tag({ label }: { label: string }) {
  return <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium bg-ink-100 text-ink-600">{label}</span>
}

export const eventTypeMeta: Record<EventType, { color: string; dot: string }> = {
  Deadline: { color: 'text-coral-500', dot: 'bg-coral-500' },
  'School Event': { color: 'text-sky-500', dot: 'bg-sky-500' },
  Meeting: { color: 'text-primary-600', dot: 'bg-primary-500' },
  'Personal Task': { color: 'text-violet-500', dot: 'bg-violet-500' },
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full rounded-full bg-ink-100 overflow-hidden ${className}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full rounded-full bg-primary-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="mb-3 text-ink-300" aria-hidden="true">{icon}</div>
      <p className="font-display font-medium text-ink-700">{title}</p>
      {subtitle && <p className="text-sm text-ink-400 mt-1">{subtitle}</p>}
    </div>
  )
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] animate-toast" role="status" aria-live="polite">
      <div className="bg-ink-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-floating whitespace-nowrap">
        {message}
      </div>
    </div>
  )
}

export function BackHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink-100">
      <div className="flex items-center justify-between px-4 h-14">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="flex items-center justify-center h-9 w-9 -ml-2 rounded-full active:bg-ink-100 text-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="font-display font-semibold text-[15px] text-ink-900 absolute left-1/2 -translate-x-1/2">{title}</h1>
        <div className="min-w-[36px] flex justify-end">{right}</div>
      </div>
    </div>
  )
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-floating max-h-[88vh] flex flex-col animate-sheet">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-ink-100">
          <h2 className="font-display font-semibold text-base text-ink-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 flex items-center justify-center rounded-full active:bg-ink-100 text-ink-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 no-scrollbar">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-medium text-ink-500 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-ink-400 mt-1">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-xl border border-ink-200 bg-ink-50/50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500'

export function PrimaryButton({ children, onClick, className = '', type = 'button', disabled }: { children: React.ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit'; disabled?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl bg-primary-500 text-white font-medium text-sm py-3 active:bg-primary-600 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, className = '', type = 'button' }: { children: React.ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full rounded-xl border border-ink-200 text-ink-700 font-medium text-sm py-3 active:bg-ink-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 ${className}`}
    >
      {children}
    </button>
  )
}

export function SegmentedControl<T extends string>({ options, value, onChange }: { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="flex bg-ink-100 rounded-xl p-1 gap-1">
      {options.map((opt) => {
        const active = opt.key === value
        return (
          <button
            key={opt.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.key)}
            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 ${
              active ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
