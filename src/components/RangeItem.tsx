import { useState } from 'react'
import type { Range } from '../types'

interface Props {
  range: Range
  color: string
  totalPages: number
  onRemove: () => void
  onDownload: () => Promise<void>
  onNameChange: (name: string) => void
  onPagesInput: (raw: string) => void
}

function toRangeString(pages: number[]): string {
  if (pages.length === 0) return ''
  const sorted = [...pages].sort((a, b) => a - b)
  const parts: string[] = []
  let start = sorted[0]
  let end = sorted[0]
  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      parts.push(start === end ? String(start + 1) : `${start + 1}-${end + 1}`)
      if (i < sorted.length) { start = sorted[i]; end = sorted[i] }
    }
  }
  return parts.join(', ')
}

export function RangeItem({ range, color, totalPages, onRemove, onDownload, onNameChange, onPagesInput }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [inputVal, setInputVal] = useState(() => toRangeString(range.pages))

  // Keep input in sync when pages change externally (e.g. from selection)
  const externalStr = toRangeString(range.pages)
  const [lastExternal, setLastExternal] = useState(externalStr)
  if (externalStr !== lastExternal) {
    setLastExternal(externalStr)
    setInputVal(externalStr)
  }

  async function handleDownload() {
    setDownloading(true)
    try { await onDownload() } finally { setDownloading(false) }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow" style={{ background: color }} />
        <input
          className="flex-1 font-medium text-sm text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none py-0.5"
          value={range.name}
          onChange={e => onNameChange(e.target.value)}
        />
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 w-5 h-5 flex items-center justify-center rounded transition-colors"
          aria-label="Remove range"
        >
          ×
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">Pages (e.g. 1-3, 5, 7-9)</label>
        <input
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder={`1-${totalPages}`}
          value={inputVal}
          onChange={e => {
            setInputVal(e.target.value)
            onPagesInput(e.target.value)
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{range.pages.length} page{range.pages.length !== 1 ? 's' : ''}</span>
      </div>

      <button
        onClick={handleDownload}
        disabled={range.pages.length === 0 || downloading}
        className="w-full bg-blue-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
      >
        {downloading ? 'Generating…' : 'Download PDF'}
      </button>
    </div>
  )
}
