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
    const match = part.match(/^(\d+)\s*-\s*(\d+)$/)
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
    const pages = parsePageInput(raw, totalPages)
    onRangesChange(ranges.map(r => r.id === id ? { ...r, pages } : r))
  }

  async function download(range: Range) {
    if (!sourceBytes) return
    // Preserve display order: filter pageOrder to only pages in this range
    const orderedIndices = pageOrder.filter(i => range.pages.includes(i))
    const bytes = await splitPdf(sourceBytes, orderedIndices)
    const base = fileName.replace(/\.pdf$/i, '')
    downloadPdf(bytes, `${base} — ${range.name}.pdf`)
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold text-gray-800 text-sm">Output ranges</h2>
        <span className="text-xs text-gray-400">{ranges.length} range{ranges.length !== 1 ? 's' : ''}</span>
      </div>

      {selectedPages.size > 0 && (
        <button
          onClick={onAddFromSelection}
          className="flex-shrink-0 text-sm border-2 border-blue-400 text-blue-600 rounded-xl py-2 hover:bg-blue-50 transition-colors font-medium"
        >
          + New range from {selectedPages.size} selected
        </button>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
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
          <div className="text-center py-10 text-gray-400">
            <div className="text-3xl mb-2">✂️</div>
            <p className="text-sm">No ranges yet.</p>
            <p className="text-xs mt-1">Select pages or add one below.</p>
          </div>
        )}
      </div>

      <button
        onClick={addRange}
        className="flex-shrink-0 w-full border-2 border-dashed border-gray-300 text-gray-500 rounded-xl py-3 text-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Add range
      </button>
    </div>
  )
}
