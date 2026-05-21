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
  let start = sorted[0], end = sorted[0]
  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      parts.push(start === end ? String(start + 1) : `${start + 1}–${end + 1}`)
      if (i < sorted.length) { start = sorted[i]; end = sorted[i] }
    }
  }
  return parts.join(', ')
}

export function RangeItem({ range, color, totalPages, onRemove, onDownload, onNameChange, onPagesInput }: Props) {
  const [downloading, setDownloading] = useState(false)
  const externalStr = toRangeString(range.pages)
  const [inputVal, setInputVal] = useState(externalStr)
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
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Name row */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <input
          className="flex-1 text-sm font-medium bg-transparent outline-none"
          style={{
            color: '#1d1d1f',
            borderBottom: '1px solid transparent',
          }}
          value={range.name}
          onChange={e => onNameChange(e.target.value)}
          onFocus={e => (e.currentTarget.style.borderBottomColor = '#0071e3')}
          onBlur={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
        />
        <button
          onClick={onRemove}
          className="flex items-center justify-center w-5 h-5 rounded-full transition-colors text-sm"
          style={{ color: '#adadb8' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff0f0'; e.currentTarget.style.color = '#ff3b30' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#adadb8' }}
        >
          ×
        </button>
      </div>

      {/* Pages input */}
      <div>
        <label className="block text-xs mb-1" style={{ color: '#adadb8' }}>Pages (e.g. 1–3, 5, 7–9)</label>
        <input
          className="w-full text-sm rounded-lg px-3 py-1.5 outline-none transition-all"
          style={{
            background: '#f5f5f7',
            border: '1px solid rgba(0,0,0,0.07)',
            color: '#1d1d1f',
          }}
          placeholder={`1–${totalPages}`}
          value={inputVal}
          onChange={e => { setInputVal(e.target.value); onPagesInput(e.target.value) }}
          onFocus={e => (e.currentTarget.style.border = '1px solid #0071e3')}
          onBlur={e => (e.currentTarget.style.border = '1px solid rgba(0,0,0,0.07)')}
        />
      </div>

      <p className="text-xs" style={{ color: '#adadb8' }}>
        {range.pages.length} page{range.pages.length !== 1 ? 's' : ''}
      </p>

      <button
        onClick={handleDownload}
        disabled={range.pages.length === 0 || downloading}
        className="w-full py-2 rounded-full text-sm font-medium transition-all active:scale-95"
        style={{
          background: range.pages.length === 0 || downloading ? '#f5f5f7' : '#0071e3',
          color: range.pages.length === 0 || downloading ? '#adadb8' : '#fff',
          cursor: range.pages.length === 0 || downloading ? 'not-allowed' : 'pointer',
          boxShadow: range.pages.length > 0 && !downloading ? '0 2px 8px rgba(0,113,227,0.3)' : 'none',
        }}
      >
        {downloading ? 'Generating…' : 'Download PDF'}
      </button>
    </div>
  )
}
