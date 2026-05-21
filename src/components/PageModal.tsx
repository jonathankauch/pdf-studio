import { useEffect, useState, useCallback } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { renderPage } from '../lib/renderPage'

interface Props {
  doc: PDFDocumentProxy
  pageOrder: number[]   // display order → original indices
  displayIndex: number  // position in pageOrder the user opened
  onClose: () => void
}

export function PageModal({ doc, pageOrder, displayIndex, onClose }: Props) {
  const [current, setCurrent] = useState(displayIndex)
  const [imgSrc, setImgSrc] = useState<string>('')
  const [rendering, setRendering] = useState(false)

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(pageOrder.length - 1, idx))
    setCurrent(clamped)
  }, [pageOrder.length])

  // Render high-res whenever current changes
  useEffect(() => {
    let cancelled = false
    setRendering(true)
    setImgSrc('')
    renderPage(doc, pageOrder[current], 900).then(src => {
      if (!cancelled) { setImgSrc(src); setRendering(false) }
    })
    return () => { cancelled = true }
  }, [doc, pageOrder, current])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, goTo, onClose])

  const hasPrev = current > 0
  const hasNext = current < pageOrder.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      {/* Card */}
      <div
        className="relative flex flex-col items-center"
        style={{ maxHeight: '92vh', maxWidth: '86vw' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span className="text-xs">ESC</span>
        </button>

        {/* Page */}
        <div
          className="rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            background: '#fff',
            boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
            minWidth: 240,
            minHeight: 320,
          }}
        >
          {rendering && (
            <div className="w-64 h-80 flex items-center justify-center" style={{ background: '#f5f5f7' }}>
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {imgSrc && (
            <img
              src={imgSrc}
              alt={`Page ${current + 1}`}
              style={{ display: 'block', maxHeight: '82vh', maxWidth: '82vw', objectFit: 'contain' }}
              draggable={false}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={() => goTo(current - 1)}
            disabled={!hasPrev}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90"
            style={{
              background: hasPrev ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
              color: hasPrev ? '#fff' : 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <span className="text-sm font-medium text-white/80 tabular-nums">
            {current + 1} <span style={{ color: 'rgba(255,255,255,0.4)' }}>/ {pageOrder.length}</span>
          </span>

          <button
            onClick={() => goTo(current + 1)}
            disabled={!hasNext}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90"
            style={{
              background: hasNext ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
              color: hasNext ? '#fff' : 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
