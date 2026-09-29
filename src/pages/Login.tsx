import React, { useState } from 'react'
import { GraduationCap, ShieldCheck, Wrench, ArrowRight } from 'lucide-react'
import type { AppState } from '../state/store'
import type { Role } from '../types'
import { APP_NAME, SCHOOL_NAME, demoUsers } from '../data/mockData'
import { inputClass, PrimaryButton } from '../components/common'

const roleMeta: Record<Role, { label: string; blurb: string; icon: React.ElementType }> = {
  TEACHER: { label: 'Demo Teacher', blurb: 'Tasks, classes, calendar, resources', icon: GraduationCap },
  SHS_HEAD: { label: 'Demo SHS Head', blurb: 'Teacher monitoring, reports, announcements', icon: ShieldCheck },
  SYSTEM_ADMIN: { label: 'Demo System Admin', blurb: 'Accounts, roles, system settings', icon: Wrench },
}

export default function Login({ state }: { state: AppState }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const match = demoUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (match) {
      state.loginAs(match.role)
    } else {
      state.showToast("That email isn't one of the demo accounts below.")
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col justify-center px-6 py-10">
      <div className="max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-3xl" aria-hidden="true">✅</span>
          <h1 className="font-display text-2xl font-bold text-ink-900 mt-2">{APP_NAME}</h1>
          <p className="text-sm text-ink-500 mt-1">{SCHOOL_NAME}</p>
        </div>

        <div className="bg-white rounded-2xl border border-ink-100 shadow-soft p-5 mb-6">
          <p className="text-xs font-medium text-ink-400 mb-3">Sign in</p>
          <form onSubmit={handleManualSubmit}>
            <input
              className={`${inputClass} mb-2.5`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@taskly.demo"
              aria-label="Email"
            />
            <input
              className={`${inputClass} mb-3`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              aria-label="Password"
            />
            <PrimaryButton type="submit">
              <span className="inline-flex items-center justify-center gap-1.5">
                Sign in <ArrowRight size={14} />
              </span>
            </PrimaryButton>
          </form>
          <p className="text-[11px] text-ink-400 mt-3 text-center">
            This is a prototype — no real authentication is connected. Use one of the demo accounts below, or type a demo email above.
          </p>
        </div>

        <p className="text-xs font-medium text-ink-400 mb-2.5 text-center">Or continue as a demo account</p>
        <div className="flex flex-col gap-2.5">
          {demoUsers.map((u) => {
            const meta = roleMeta[u.role]
            const Icon = meta.icon
            return (
              <button
                key={u.id}
                onClick={() => state.loginAs(u.role)}
                className="w-full flex items-center gap-3 bg-white border border-ink-100 rounded-2xl px-4 py-3.5 text-left active:bg-ink-50 shadow-soft"
              >
                <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900">{meta.label}</p>
                  <p className="text-xs text-ink-400 truncate">{meta.blurb}</p>
                </div>
                <span className="text-[11px] text-ink-300 shrink-0">{u.email}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
