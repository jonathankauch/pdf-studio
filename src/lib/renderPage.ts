import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export async function loadDocument(data: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
  return pdfjsLib.getDocument({ data }).promise
}

export async function renderPage(
  doc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number,
  targetWidth = 150
): Promise<string> {
  const page = await doc.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale: 1 })
  const scale = targetWidth / viewport.width
  const scaled = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(scaled.width)
  canvas.height = Math.ceil(scaled.height)
  const ctx = canvas.getContext('2d')!

  await page.render({ canvasContext: ctx, viewport: scaled, canvas }).promise
  page.cleanup()
  return canvas.toDataURL('image/jpeg', 0.85)
}
