import React from 'react'
import { Users, ShieldCheck, Settings, LogOut, Lock } from 'lucide-react'
import type { AppState } from '../state/store'
import { Card } from '../components/common'
import { APP_NAME, SCHOOL_NAME, demoUsers } from '../data/mockData'

export default function SystemAdminHome({ state, onLogout }: { state: AppState; onLogout: () => void }) {
  const { currentUser } = state

  return (
    <div className="min-h-screen bg-[#F7F8F6] pb-10">
      <div className="px-5 pt-6 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-lg text-ink-900">{APP_NAME} — System Administration</p>
            <p className="text-xs text-ink-400 mt-0.5">{SCHOOL_NAME} · {currentUser?.name}</p>
          </div>
          <button onClick={onLogout} aria-label="Log out" className="h-9 w-9 rounded-full bg-white border border-ink-100 flex items-center justify-center text-ink-500 active:bg-ink-50 shrink-0">
            <LogOut size={15} />
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-ink-400 mb-2">Accounts (read-only preview)</p>
          <Card className="divide-y divide-ink-100">
            {demoUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-ink-100 text-ink-600 text-xs font-semibold flex items-center justify-center shrink-0">
                  {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-800 truncate">{u.name}</p>
                  <p className="text-xs text-ink-400 truncate">{u.email}</p>
                </div>
                <span className="text-xs font-medium text-ink-500 bg-ink-100 rounded-full px-2.5 py-1 shrink-0">{u.role.replace('_', ' ')}</span>
              </div>
            ))}
          </Card>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-ink-400 mb-2">Coming next in TASKLY</p>
          <div className="flex flex-col gap-2.5">
            <ComingSoon icon={<Users size={17} />} title="Account Management" desc="Create, activate, deactivate accounts" />
            <ComingSoon icon={<ShieldCheck size={17} />} title="Role & Permission Assignment" desc="Change a user's role, review the permission matrix" />
            <ComingSoon icon={<Settings size={17} />} title="System Settings" desc="School data, quarters, system-wide configuration" />
          </div>
        </div>

        <p className="text-[11px] text-ink-300 mt-6 text-center">
          System Administration is scoped for a later phase — this screen is a placeholder so the role and its login exist end-to-end.
        </p>
      </div>
    </div>
  )
}

function ComingSoon({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/60 border border-dashed border-ink-200 rounded-2xl px-4 py-3.5 opacity-70">
      <div className="h-9 w-9 rounded-xl bg-ink-100 text-ink-500 flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-700">{title}</p>
        <p className="text-xs text-ink-400 mt-0.5">{desc}</p>
      </div>
      <Lock size={13} className="text-ink-300 shrink-0" />
    </div>
  )
}
