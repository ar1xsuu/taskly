import React, { useState } from 'react'
import { FolderOpen, StickyNote, BarChart3, Bell, Archive, ChevronRight, LayoutTemplate, Settings, RotateCcw, HelpCircle, LogOut, Sparkles, Gamepad2, Lock } from 'lucide-react'
import type { PageKey } from '../types'
import type { AppState } from '../state/store'
import { Card, Sheet, SecondaryButton } from '../components/common'
import { SCHOOL_NAME, SCHOOL_YEAR, APP_NAME } from '../data/mockData'

const items: { key: PageKey; label: string; desc: string; icon: React.ElementType }[] = [
  { key: 'resources', label: 'Resources', desc: 'Files organized by subject and tags', icon: FolderOpen },
  { key: 'notes', label: 'Notes', desc: 'Private notes — only visible to you', icon: StickyNote },
  { key: 'templates', label: 'Templates', desc: 'Reusable task starting points', icon: LayoutTemplate },
  { key: 'reports', label: 'Reports', desc: 'Task and submission summaries', icon: BarChart3 },
  { key: 'notifications', label: 'Notifications', desc: 'Recent activity and alerts', icon: Bell },
  { key: 'archive', label: 'Archive', desc: 'Past quarters and school years', icon: Archive },
]

export default function More({ state, onNavigate, unreadCount, onLogout }: { state: AppState; onNavigate: (p: PageKey) => void; unreadCount: number; onLogout: () => void }) {
  const [showSettings, setShowSettings] = useState(false)
  const { currentUser } = state

  return (
    <div className="pb-6">
      <div className="px-5 pt-4 pb-5 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink-900">More</h1>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          className="h-9 w-9 rounded-full bg-white border border-ink-100 flex items-center justify-center text-ink-600 active:bg-ink-50"
        >
          <Settings size={16} />
        </button>
      </div>

      <div className="px-5 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary-500 text-white font-display font-semibold flex items-center justify-center text-base shrink-0">
            {currentUser?.name.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? 'T'}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-ink-900 truncate">{currentUser?.name}</p>
            <p className="text-xs text-ink-400 truncate">{SCHOOL_NAME}{currentUser?.department ? ` · ${currentUser.department}` : ''}</p>
          </div>
        </Card>
      </div>

      <div className="px-5 flex flex-col gap-2.5">
        {items.map(({ key, label, desc, icon: Icon }) => (
          <Card key={key} className="p-4" onClick={() => onNavigate(key)}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink-900">{label}</p>
                  {key === 'notifications' && unreadCount > 0 && (
                    <span className="h-4 min-w-[16px] px-1 rounded-full bg-coral-500 text-white text-[10px] font-semibold flex items-center justify-center" aria-hidden="true">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-400 mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={18} className="text-ink-300 shrink-0" />
            </div>
          </Card>
        ))}
      </div>

      <div className="px-5 mt-6">
        <p className="text-xs font-medium text-ink-400 mb-2">Coming soon</p>
        <div className="flex flex-col gap-2.5">
          <ComingSoon icon={<Sparkles size={17} />} title="AI Teaching Assistant" desc="Ask AI, generate quizzes and questions, brainstorm activities" />
          <ComingSoon icon={<Gamepad2 size={17} />} title="Classroom Tools" desc="Spin the wheel, random picker, timer, and more" />
        </div>
      </div>

      <div className="px-5 mt-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-ink-200 text-ink-600 text-sm font-medium py-3 active:bg-ink-50"
        >
          <LogOut size={15} /> Log out
        </button>
      </div>

      <p className="text-center text-[11px] text-ink-300 mt-6">{APP_NAME} prototype · School Year {SCHOOL_YEAR}</p>

      <Sheet open={showSettings} onClose={() => setShowSettings(false)} title="Settings">
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-ink-500">School Year</span>
              <span className="text-sm font-medium text-ink-900">{SCHOOL_YEAR}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-ink-100 mt-1 pt-2.5">
              <span className="text-sm text-ink-500">Role</span>
              <span className="text-sm font-medium text-ink-900">Senior High School Teacher</span>
            </div>
          </Card>

          <div>
            <p className="text-xs font-medium text-ink-400 mb-2 flex items-center gap-1.5"><HelpCircle size={13} /> About this prototype</p>
            <Card className="p-4">
              <p className="text-xs text-ink-500 leading-relaxed">
                {APP_NAME} runs entirely on demo data stored on this device — nothing is sent to a server, and no student
                personal information is used. Data resets to the original demo set below.
              </p>
            </Card>
          </div>

          <SecondaryButton
            onClick={() => {
              state.resetDemoData()
              setShowSettings(false)
            }}
          >
            <span className="inline-flex items-center gap-2">
              <RotateCcw size={15} /> Reset Demo Data
            </span>
          </SecondaryButton>
        </div>
      </Sheet>
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
