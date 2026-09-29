import { AlertTriangle, UserCheck, CheckCircle2 } from 'lucide-react'
import type { AppState } from '../state/store'
import { Card } from '../components/common'
import { buildAlerts } from '../utils/monitoring'

export default function AdminNotifications({ state, onOpenClasses }: { state: AppState; onOpenClasses: () => void }) {
  const alerts = buildAlerts(state)
  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-900 mb-1">Alerts</h1>
      <p className="text-sm text-ink-500 mb-4">Generated from today's class check-ins. They clear when a check-in is recorded or verified.</p>

      {alerts.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 size={26} className="mx-auto text-primary-500 mb-2" />
          <p className="font-medium text-ink-800">Everything looks good</p>
          <p className="text-sm text-ink-400 mt-1">No teacher monitoring items require attention.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-ink-100">
          {alerts.map((a) => (
            <button key={a.id} onClick={onOpenClasses} className="w-full flex items-start gap-3 px-4 py-3.5 text-left active:bg-ink-50">
              <div className="h-9 w-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                {a.kind === 'verification' ? <UserCheck size={16} /> : <AlertTriangle size={16} />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900">{a.title}</p>
                <p className="text-xs text-ink-400 mt-0.5">{a.detail}</p>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  )
}
