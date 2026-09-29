import { useState } from 'react'
import { ListTodo } from 'lucide-react'
import type { AppState } from '../state/store'
import { BackHeader, Card, EmptyState, PriorityBadge } from '../components/common'
import { AddTaskSheet } from '../components/CreateSheets'

export default function Templates({ state, onBack }: { state: AppState; onBack: () => void }) {
  const { templates } = state
  const [activeTaskTemplate, setActiveTaskTemplate] = useState<string | null>(null)

  const list = templates.filter((t) => t.kind === 'task')

  return (
    <div className="pb-8">
      <BackHeader title="Task Templates" onBack={onBack} />
      <div className="px-5 pt-4">
        <p className="text-sm text-ink-500 mb-4">Reusable starting points so you're not retyping the same instructions every week.</p>

        {list.length === 0 ? (
          <EmptyState icon={<ListTodo size={26} />} title="No templates yet" />
        ) : (
          <div className="flex flex-col gap-2.5">
            {list.map((t) => (
              <Card key={t.id} className="p-4" onClick={() => setActiveTaskTemplate(t.id)}>
                <p className="font-medium text-sm text-ink-900">{t.name}</p>
                <p className="text-xs text-ink-400 mt-1 line-clamp-2">{t.body}</p>
                {t.priority && (
                  <div className="mt-2">
                    <PriorityBadge priority={t.priority} />
                  </div>
                )}
                <p className="text-xs font-medium text-primary-600 mt-2.5">Choose template →</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddTaskSheet
        open={!!activeTaskTemplate}
        onClose={() => setActiveTaskTemplate(null)}
        state={state}
        initialTemplateId={activeTaskTemplate ?? undefined}
      />
    </div>
  )
}
