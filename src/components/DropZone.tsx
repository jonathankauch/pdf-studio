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
      className={`min-h-screen flex items-center justify-center transition-colors ${
        dragging ? 'bg-blue-50' : 'bg-gray-50'
      }`}
    >
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
      </div>
    </div>
  )
}
