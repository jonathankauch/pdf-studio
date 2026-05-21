import { useState, useCallback, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { loadDocument, renderPage } from '../lib/renderPage'

interface PdfState {
  doc: PDFDocumentProxy | null
  sourceBytes: ArrayBuffer | null
  pageCount: number
  thumbnails: string[]
  loading: boolean
  fileName: string
}

const INITIAL: PdfState = {
  doc: null,
  sourceBytes: null,
  pageCount: 0,
  thumbnails: [],
  loading: false,
  fileName: '',
}

export function usePdfDocument() {
  const [state, setState] = useState<PdfState>(INITIAL)
  const loadGenRef = useRef(0)

  const loadFile = useCallback(async (file: File) => {
    const gen = ++loadGenRef.current
    setState({ ...INITIAL, loading: true, fileName: file.name })

    const bytes = await file.arrayBuffer()
    // Keep a copy before pdfjs transfers the buffer to its worker
    const bytesCopy = bytes.slice(0)
    const doc = await loadDocument(bytes)
    const count = doc.numPages

    if (gen !== loadGenRef.current) return

    setState(s => ({ ...s, doc, sourceBytes: bytesCopy, pageCount: count }))

    // Render thumbnails one by one and stream updates
    const thumbs: string[] = new Array(count).fill('')
    for (let i = 0; i < count; i++) {
      if (gen !== loadGenRef.current) return
      thumbs[i] = await renderPage(doc, i)
      const snapshot = [...thumbs]
      setState(s => ({ ...s, thumbnails: snapshot, loading: i < count - 1 }))
    }

    setState(s => ({ ...s, loading: false }))
  }, [])

  return { ...state, loadFile }
}
