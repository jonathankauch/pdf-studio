import { useState, useCallback, useEffect } from 'react'
import { DropZone } from './components/DropZone'
import { ThumbnailGrid } from './components/ThumbnailGrid'
import { RangeList } from './components/RangeList'
import { PageModal } from './components/PageModal'
import { usePdfDocument } from './hooks/usePdfDocument'
import type { Range } from './types'

const APPLE_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif'

export default function App() {
  const { doc, sourceBytes, pageCount, thumbnails, loading, fileName, loadFile } = usePdfDocument()
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [ranges, setRanges] = useState<Range[]>([])
  const [lastSelected, setLastSelected] = useState<number | null>(null)
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)

  useEffect(() => {
    if (pageCount > 0) {
      setPageOrder(Array.from({ length: pageCount }, (_, i) => i))
      setSelectedPages(new Set())
      setRanges([])
      setLastSelected(null)
    }
  }, [pageCount])

  const handleFile = useCallback(async (file: File) => {
    await loadFile(file)
  }, [loadFile])

  function handleSelect(origIdx: number, e: React.MouseEvent) {
    if (e.shiftKey && lastSelected !== null) {
      const fromPos = pageOrder.indexOf(lastSelected)
      const toPos = pageOrder.indexOf(origIdx)
      const [lo, hi] = [Math.min(fromPos, toPos), Math.max(fromPos, toPos)]
      setSelectedPages(prev => {
        const next = new Set(prev)
        pageOrder.slice(lo, hi + 1).forEach(i => next.add(i))
        return next
      })
    } else if (e.metaKey || e.ctrlKey) {
      setSelectedPages(prev => {
        const next = new Set(prev)
        if (next.has(origIdx)) next.delete(origIdx)
        else next.add(origIdx)
        return next
      })
    } else {
      setSelectedPages(prev =>
        prev.size === 1 && prev.has(origIdx) ? new Set() : new Set([origIdx])
      )
    }
    setLastSelected(origIdx)
  }

  function addRangeFromSelection() {
    const pages = [...selectedPages].sort((a, b) => a - b)
    setRanges(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: `Part ${prev.length + 1}`, pages },
    ])
    setSelectedPages(new Set())
  }

  if (!doc && !loading) {
    return <DropZone onFile={handleFile} />
  }

  const effectiveOrder = pageOrder.length === pageCount
    ? pageOrder
    : Array.from({ length: pageCount }, (_, i) => i)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f5f5f7', fontFamily: APPLE_FONT }}>
      {/* Page grid */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <header
          className="flex items-center gap-3 px-5 flex-shrink-0"
          style={{
            height: 52,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors"
            style={{ color: '#86868b' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            title="Back to home"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span className="font-semibold text-sm" style={{ color: '#1d1d1f' }}>PDF Studio</span>
          </button>

          <div className="w-px h-4 mx-1" style={{ background: '#d2d2d7' }} />

          <span className="relative group text-sm truncate max-w-xs" style={{ color: '#86868b' }}>
            {fileName}
            <span
              className="pointer-events-none absolute left-0 top-full mt-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
              style={{ background: 'rgba(30,30,32,0.88)', color: '#fff', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
            >
              {fileName}
            </span>
          </span>

          {loading && (
            <span className="text-xs animate-pulse" style={{ color: '#0071e3' }}>Rendering…</span>
          )}

          <div className="flex-1" />

          <span className="text-xs" style={{ color: '#adadb8' }}>
            {pageCount} page{pageCount !== 1 ? 's' : ''}
            {selectedPages.size > 0 && (
              <span style={{ color: '#0071e3' }}> · {selectedPages.size} selected</span>
            )}
          </span>

          <span className="hidden lg:block text-xs" style={{ color: '#86868b' }}>
            Click · ⇧ range · ⌘ add · Drag to reorder
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <ThumbnailGrid
            pageOrder={effectiveOrder}
            thumbnails={thumbnails}
            selectedPages={selectedPages}
            ranges={ranges}
            onReorder={setPageOrder}
            onSelect={handleSelect}
            onZoom={setZoomIndex}
          />
        </div>
      </div>

      {/* Sidebar */}
      {zoomIndex !== null && doc && (
        <PageModal
          doc={doc}
          pageOrder={effectiveOrder}
          displayIndex={zoomIndex}
          onClose={() => setZoomIndex(null)}
        />
      )}

      <div
        className="flex-shrink-0 flex flex-col p-4"
        style={{
          width: '17rem',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderLeft: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <RangeList
          ranges={ranges}
          pageOrder={effectiveOrder}
          sourceBytes={sourceBytes}
          fileName={fileName}
          totalPages={pageCount}
          selectedPages={selectedPages}
          onRangesChange={setRanges}
          onAddFromSelection={addRangeFromSelection}
        />
      </div>
    </div>
  )
}
