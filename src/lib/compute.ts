import type { DisclosureItem, EmissionLine, Facility } from '../types/esg'

export type ScopeTotals = { scope1: number; scope2: number; scope3: number }

export type MonthPoint = {
  month: string
  scope1: number
  scope2: number
  scope3: number
}

const MONTH_KEYS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
] as const

const MONTH_SHORT_ID: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'Mei',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Agu',
  '09': 'Sep',
  '10': 'Okt',
  '11': 'Nov',
  '12': 'Des',
}

const MONTH_SHORT_EN: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
}

export function filterEmissionLines(
  lines: EmissionLine[],
  reportingYear: number,
  facilityFilter: 'all' | string,
): EmissionLine[] {
  return lines.filter((l) => {
    const y = Number(l.period.slice(0, 4))
    if (y !== reportingYear) return false
    if (facilityFilter === 'all') return true
    return l.facilityId === facilityFilter
  })
}

export function computeScopeTotals(lines: EmissionLine[]): ScopeTotals {
  return lines.reduce(
    (acc, l) => {
      if (l.scope === 1) acc.scope1 += l.amountTco2e
      else if (l.scope === 2) acc.scope2 += l.amountTco2e
      else acc.scope3 += l.amountTco2e
      return acc
    },
    { scope1: 0, scope2: 0, scope3: 0 },
  )
}

export function computeYoY(
  current: number,
  previous: number,
): { diff: number; percent: number | null } {
  if (previous <= 0) return { diff: 0, percent: null }
  const diff = current - previous
  const percent = Math.round((diff / previous) * 100 * 10) / 10
  return { diff, percent }
}

export function computeMonthlySeries(
  lines: EmissionLine[],
  reportingYear: number,
  facilityFilter: 'all' | string,
  locale: 'id' | 'en',
): MonthPoint[] {
  const filtered = filterEmissionLines(lines, reportingYear, facilityFilter)
  const byMonth = new Map<string, ScopeTotals>()
  for (const m of MONTH_KEYS) {
    byMonth.set(m, { scope1: 0, scope2: 0, scope3: 0 })
  }
  for (const l of filtered) {
    const [, mm] = l.period.split('-')
    if (!mm || !byMonth.has(mm)) continue
    const bucket = byMonth.get(mm)!
    if (l.scope === 1) bucket.scope1 += l.amountTco2e
    else if (l.scope === 2) bucket.scope2 += l.amountTco2e
    else bucket.scope3 += l.amountTco2e
  }
  const labels = locale === 'id' ? MONTH_SHORT_ID : MONTH_SHORT_EN
  return MONTH_KEYS.map((mm) => {
    const t = byMonth.get(mm)!
    return {
      month: labels[mm] ?? mm,
      scope1: t.scope1,
      scope2: t.scope2,
      scope3: t.scope3,
    }
  })
}

export function scope3ByCategory(lines: EmissionLine[]): Map<number, number> {
  const map = new Map<number, number>()
  for (const l of lines) {
    if (l.scope !== 3) continue
    const c = l.scope3Category ?? 0
    if (c < 1 || c > 15) continue
    map.set(c, (map.get(c) ?? 0) + l.amountTco2e)
  }
  return map
}

export function facilityNameById(facilities: Facility[]): Map<string, string> {
  return new Map(facilities.map((f) => [f.id, f.name]))
}

export function computeFacilityDistribution(
  lines: EmissionLine[],
  facilities: Facility[],
  locale: 'id' | 'en',
): { name: string; value: number }[] {
  const map = new Map<string, number>()
  const names = facilityNameById(facilities)
  const orgLabel = locale === 'en' ? 'Organization-level' : 'Tingkat organisasi'

  for (const l of lines) {
    const fid = l.facilityId ?? 'org'
    const name = fid === 'org' ? orgLabel : names.get(fid) ?? fid
    map.set(name, (map.get(name) ?? 0) + l.amountTco2e)
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function disclosureProgressPercent(item: {
  tasks: { done: boolean }[]
}): number {
  if (item.tasks.length === 0) return 0
  const done = item.tasks.filter((t) => t.done).length
  return Math.round((100 * done) / item.tasks.length)
}

export function disclosureDerivedStatus(
  progress: number,
): 'audit_ready' | 'in_progress' | 'gap' {
  if (progress >= 90) return 'audit_ready'
  if (progress >= 50) return 'in_progress'
  return 'gap'
}

export function withDerivedDisclosureStatus(
  items: DisclosureItem[],
): DisclosureItem[] {
  return items.map((item) => {
    const progress = disclosureProgressPercent(item)
    return { ...item, status: disclosureDerivedStatus(progress) }
  })
}
