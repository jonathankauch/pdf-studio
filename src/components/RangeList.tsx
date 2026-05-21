import type { Range } from '../types'
import { RangeItem } from './RangeItem'
import { RANGE_COLORS } from './ThumbnailGrid'
import { splitPdf, downloadPdf } from '../lib/splitPdf'

interface Props {
  ranges: Range[]
  pageOrder: number[]
  sourceBytes: ArrayBuffer | null
  fileName: string
  totalPages: number
  selectedPages: Set<number>
  onRangesChange: (ranges: Range[]) => void
  onAddFromSelection: () => void
}

function parsePageInput(raw: string, max: number): number[] {
  const pages: number[] = []
  for (const part of raw.split(',').map(s => s.trim()).filter(Boolean)) {
    const match = part.match(/^(\d+)\s*[-–]\s*(\d+)$/)
    if (match) {
      const lo = Math.min(Number(match[1]), Number(match[2]))
      const hi = Math.max(Number(match[1]), Number(match[2]))
      for (let i = lo; i <= hi; i++) if (i >= 1 && i <= max) pages.push(i - 1)
    } else {
      const n = parseInt(part)
      if (!isNaN(n) && n >= 1 && n <= max) pages.push(n - 1)
    }
  }
  return [...new Set(pages)].sort((a, b) => a - b)
}

export function RangeList({
  ranges, pageOrder, sourceBytes, fileName, totalPages,
  selectedPages, onRangesChange, onAddFromSelection,
}: Props) {

  function addRange() {
    onRangesChange([...ranges, {
      id: crypto.randomUUID(),
      name: `Part ${ranges.length + 1}`,
      pages: [],
    }])
  }

  function removeRange(id: string) {
    onRangesChange(ranges.filter(r => r.id !== id))
  }

  function updateName(id: string, name: string) {
    onRangesChange(ranges.map(r => r.id === id ? { ...r, name } : r))
  }

  function updatePages(id: string, raw: string) {
    onRangesChange(ranges.map(r => r.id === id ? { ...r, pages: parsePageInput(raw, totalPages) } : r))
  }

  async function download(range: Range) {
    if (!sourceBytes) return
    const orderedIndices = pageOrder.filter(i => range.pages.includes(i))
    const bytes = await splitPdf(sourceBytes, orderedIndices)
    const base = fileName.replace(/\.pdf$/i, '')
    downloadPdf(bytes, `${base} — ${range.name}.pdf`)
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
      <div className="flex items-center justify-between flex-shrink-0 px-1">
        <span className="text-sm font-semibold" style={{ color: '#1d1d1f' }}>Output ranges</span>
        <span className="text-xs" style={{ color: '#adadb8' }}>{ranges.length} range{ranges.length !== 1 ? 's' : ''}</span>
      </div>

      {selectedPages.size > 0 && (
        <button
          onClick={onAddFromSelection}
          className="flex-shrink-0 text-sm py-2 rounded-full font-medium transition-all active:scale-95"
          style={{
            border: '1.5px solid #0071e3',
            color: '#0071e3',
            background: 'transparent',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,113,227,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          + New range from {selectedPages.size} selected
        </button>
      )}

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
        {ranges.map((range, i) => (
          <RangeItem
            key={range.id}
            range={range}
            color={RANGE_COLORS[i % RANGE_COLORS.length]}
            totalPages={totalPages}
            onRemove={() => removeRange(range.id)}
            onDownload={() => download(range)}
            onNameChange={name => updateName(range.id, name)}
            onPagesInput={raw => updatePages(range.id, raw)}
          />
        ))}
        {ranges.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3" style={{ opacity: 0.25 }}>✂️</div>
            <p className="text-sm" style={{ color: '#adadb8' }}>No ranges yet.</p>
            <p className="text-xs mt-1" style={{ color: '#d2d2d7' }}>Select pages or add one below.</p>
          </div>
        )}
      </div>

      <button
        onClick={addRange}
        className="flex-shrink-0 w-full py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
        style={{
          border: '1.5px dashed #d2d2d7',
          color: '#86868b',
          background: 'transparent',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0071e3'; e.currentTarget.style.color = '#0071e3' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#d2d2d7'; e.currentTarget.style.color = '#86868b' }}
      >
        + Add range
      </button>
    </div>
  )
}
