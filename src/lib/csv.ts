function escapeCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const keys = Object.keys(rows[0])
  const header = keys.map(escapeCell).join(',')
  const body = rows.map((row) =>
    keys.map((k) => escapeCell(row[k])).join(','),
  )
  return [header, ...body].join('\r\n')
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const csv = '\uFEFF' + toCsv(rows)
  downloadTextFile(filename, csv, 'text/csv;charset=utf-8')
}
