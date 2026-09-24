import { useMemo, useState } from 'react'
import { Search, Plus, Folder, FileText } from 'lucide-react'
import type { AppState } from '../state/store'
import { BackHeader, Card, EmptyState, Tag } from '../components/common'
import { UploadResourceSheet } from '../components/CreateSheets'

const FOLDERS = ['ICT', 'Practical Research', 'Media and Information Literacy', 'Empowerment Technologies', 'General Resources']

export default function Resources({ state, onBack }: { state: AppState; onBack: () => void }) {
  const { resourcesList } = state
  const [query, setQuery] = useState('')
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const filtered = useMemo(() => {
    let list = resourcesList
    if (activeFolder) list = list.filter((r) => r.folder === activeFolder)
    if (query) {
      const q = query.toLowerCase()
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q)))
    }
    return list
  }, [resourcesList, activeFolder, query])

  const recent = [...resourcesList].slice(0, 3)

  return (
    <div className="pb-8">
      <BackHeader
        title="Resources"
        onBack={onBack}
        right={
          <button onClick={() => setShowUpload(true)} aria-label="Upload resource" className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
            <Plus size={16} />
          </button>
        }
      />
      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 bg-white border border-ink-100 rounded-xl px-3 h-10 mb-5">
          <Search size={16} className="text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files or tags..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
          />
        </div>

        {!query && !activeFolder && (
          <>
            <p className="text-xs font-medium text-ink-400 mb-2">Folders</p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {FOLDERS.map((f) => {
                const count = resourcesList.filter((r) => r.folder === f).length
                return (
                  <Card key={f} className="p-3.5" onClick={() => setActiveFolder(f)}>
                    <Folder size={18} className="text-primary-600 mb-2" />
                    <p className="text-xs font-medium text-ink-900 leading-snug">{f}</p>
                    <p className="text-[11px] text-ink-400 mt-0.5">{count} files</p>
                  </Card>
                )
              })}
            </div>

            <p className="text-xs font-medium text-ink-400 mb-2">Recent Files</p>
            <Card className="divide-y divide-ink-100 mb-2">
              {recent.map((r) => (
                <FileRow key={r.id} name={r.name} meta={`${r.folder} · ${r.uploadedAt}`} tags={r.tags} />
              ))}
            </Card>
          </>
        )}

        {(query || activeFolder) && (
          <>
            {activeFolder && !query && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-ink-400">{activeFolder}</p>
                <button onClick={() => setActiveFolder(null)} className="text-xs font-medium text-primary-600">All folders</button>
              </div>
            )}
            {filtered.length === 0 ? (
              <EmptyState icon={<Search size={26} />} title="No files found" />
            ) : (
              <Card className="divide-y divide-ink-100">
                {filtered.map((r) => (
                  <FileRow key={r.id} name={r.name} meta={`${r.folder} · ${r.uploadedAt} · ${r.size}`} tags={r.tags} />
                ))}
              </Card>
            )}
          </>
        )}
      </div>

      <UploadResourceSheet open={showUpload} onClose={() => setShowUpload(false)} state={state} />
    </div>
  )
}

function FileRow({ name, meta, tags }: { name: string; meta: string; tags: string[] }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 mt-0.5">
        <FileText size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink-800 truncate">{name}</p>
        <p className="text-xs text-ink-400 mt-0.5 truncate">{meta}</p>
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
