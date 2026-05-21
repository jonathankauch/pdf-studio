import { PDFDocument } from 'pdf-lib'

export async function splitPdf(
  sourceBytes: ArrayBuffer,
  pageIndices: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(sourceBytes)
  const outDoc = await PDFDocument.create()
  const pages = await outDoc.copyPages(srcDoc, pageIndices)
  for (const page of pages) outDoc.addPage(page)
  return outDoc.save()
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
