import { useState, useCallback } from 'react'

interface Props {
  onFile: (file: File) => void
}

export function DropZone({ onFile }: Props) {
  const [dragging, setDragging] = useState(false)

  const accept = useCallback((file: File) => {
    if (file.type === 'application/pdf') onFile(file)
  }, [onFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) accept(file)
  }, [accept])

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`min-h-screen flex flex-col items-center justify-center transition-colors ${
        dragging ? 'bg-blue-50' : 'bg-gray-50'
      }`}
    >
      <div className="flex-1 flex items-center justify-center w-full px-4">
        <div className={`p-14 border-2 border-dashed rounded-2xl text-center transition-colors ${
          dragging ? 'border-blue-400 bg-white' : 'border-gray-300 bg-white'
        }`}>
          <div className="text-7xl mb-5 select-none">📄</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">PDF Studio</h1>
          <p className="text-gray-500 mb-8 text-base">Split, reorder, and export PDF pages — all in your browser</p>
          <label className="inline-block cursor-pointer bg-blue-600 text-white px-7 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            Choose PDF
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) accept(f) }}
            />
          </label>
          <p className="text-sm text-gray-400 mt-4">or drag and drop here</p>
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Your file never leaves your device — everything runs locally in your browser, nothing is uploaded or tracked.</span>
          </div>
        </div>
      </div>

      <footer className="w-full py-4 text-center text-xs text-gray-400">
        PDF Studio™ &copy; {new Date().getFullYear()} — All rights reserved.
      </footer>
    </div>
  )
}
