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
      className="min-h-screen flex flex-col"
      style={{ background: '#f5f5f7', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}
    >
      {/* Nav bar */}
      <nav className="flex items-center justify-center py-5">
        <span className="text-base font-semibold tracking-tight" style={{ color: '#1d1d1f' }}>PDF Studio</span>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div
          className={`w-full max-w-lg rounded-3xl p-12 text-center transition-all duration-200 ${
            dragging ? 'scale-[1.01]' : ''
          }`}
          style={{
            background: '#ffffff',
            boxShadow: dragging
              ? '0 8px 40px rgba(0,113,227,0.18), 0 2px 8px rgba(0,0,0,0.06)'
              : '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            border: dragging ? '1.5px solid rgba(0,113,227,0.4)' : '1.5px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl mx-auto mb-7" style={{ background: 'linear-gradient(145deg, #0071e3, #40a0ff)' }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="13" y2="17"/>
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}>
            PDF Studio
          </h1>
          <p className="text-base mb-8" style={{ color: '#86868b' }}>
            Split, reorder, and export PDF pages.<br />All in your browser.
          </p>

          <label
            className="inline-block cursor-pointer px-8 py-3 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
            style={{ background: '#0071e3', color: '#fff', boxShadow: '0 2px 8px rgba(0,113,227,0.35)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0077ed')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0071e3')}
          >
            Choose PDF
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) accept(f) }}
            />
          </label>
          <p className="text-sm mt-4" style={{ color: '#adadb8' }}>or drag and drop here</p>

          {/* Privacy */}
          <div className="mt-8 pt-6 flex items-center justify-center gap-2 text-xs" style={{ borderTop: '1px solid #f0f0f0', color: '#adadb8' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Your file never leaves your device — nothing is uploaded or tracked.</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-5 text-center text-xs" style={{ color: '#adadb8' }}>
        PDF Studio™ &copy; {new Date().getFullYear()} Jonathan Kauch — All rights reserved.
      </footer>
    </div>
  )
}
