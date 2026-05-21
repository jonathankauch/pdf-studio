import { useState, useCallback, useEffect } from 'react'
import { DropZone } from './components/DropZone'
import { ThumbnailGrid } from './components/ThumbnailGrid'
import { RangeList } from './components/RangeList'
import { usePdfDocument } from './hooks/usePdfDocument'
import type { Range } from './types'

export default function App() {
  const { doc, sourceBytes, pageCount, thumbnails, loading, fileName, loadFile } = usePdfDocument()
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [ranges, setRanges] = useState<Range[]>([])
  const [lastSelected, setLastSelected] = useState<number | null>(null)

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
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 flex-shrink-0 bg-white">
          <button
            onClick={() => window.location.reload()}
            className="text-gray-400 hover:text-gray-700 text-lg transition-colors"
            title="Open new PDF"
          >
            ←
          </button>
          <span className="font-semibold text-gray-900 text-sm">PDF Studio</span>
          <span className="text-sm text-gray-500 truncate max-w-xs">{fileName}</span>
          {loading && (
            <span className="text-xs text-blue-500 animate-pulse">Rendering pages…</span>
          )}
          <div className="flex-1" />
          <span className="text-xs text-gray-400">
            {pageCount} page{pageCount !== 1 ? 's' : ''}
            {selectedPages.size > 0 && (
              <span className="ml-2 text-blue-500">{selectedPages.size} selected</span>
            )}
          </span>
          <span className="hidden lg:block text-xs text-gray-300">
            Click · Shift+Click for range · ⌘+Click to add · Drag to reorder
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <ThumbnailGrid
            pageOrder={effectiveOrder}
            thumbnails={thumbnails}
            selectedPages={selectedPages}
            ranges={ranges}
            onReorder={setPageOrder}
            onSelect={handleSelect}
          />
        </div>
      </div>

      <div className="flex-shrink-0 border-l border-gray-200 p-4 flex flex-col bg-gray-50" style={{ width: '17rem' }}>
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
