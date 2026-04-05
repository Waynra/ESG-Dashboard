import type { EmissionLine, Facility } from '../types/esg'
import { computeScopeTotals, filterEmissionLines } from './compute'

export type EsrsCheck = {
  id: string
  ok: boolean
  labelId: string
  labelEn: string
  hintId: string
  hintEn: string
}

export function runEsrsReadinessChecks(
  lines: EmissionLine[],
  facilities: Facility[],
  reportingYear: number,
  facilityFilter: 'all' | string,
): EsrsCheck[] {
  const filtered = filterEmissionLines(lines, reportingYear, facilityFilter)
  const totals = computeScopeTotals(filtered)
  const hasS3Detail = filtered.some(
    (l) => l.scope === 3 && l.scope3Category && l.scope3Category >= 1,
  )
  const hasDataQuality = filtered.some((l) => l.dataQuality === 'high')
  const facilityCount = facilities.length

  return [
    {
      id: 'inv-boundary',
      ok: filtered.length > 0,
      labelId: 'Inventaris emisi untuk periode pelaporan',
      labelEn: 'Emissions inventory for reporting period',
      hintId: 'Tambahkan baris emisi atau sesuaikan tahun/fasilitas filter.',
      hintEn: 'Add emission lines or adjust year/facility filter.',
    },
    {
      id: 'scope1',
      ok: totals.scope1 > 0,
      labelId: 'Scope 1 terisi (sumber langsung)',
      labelEn: 'Scope 1 populated (direct sources)',
      hintId: 'Catat pembakaran, flota, atau proses industri.',
      hintEn: 'Record combustion, fleet, or industrial process emissions.',
    },
    {
      id: 'scope2',
      ok: totals.scope2 > 0,
      labelId: 'Scope 2 terisi (energi dibeli)',
      labelEn: 'Scope 2 populated (purchased energy)',
      hintId: 'Impor data listrik/uap atau kontrak atribut energi.',
      hintEn: 'Import electricity/steam data or energy attribute contracts.',
    },
    {
      id: 'scope3-cat',
      ok: hasS3Detail,
      labelId: 'Scope 3 memetakan kategori GHG Protocol',
      labelEn: 'Scope 3 maps to GHG Protocol categories',
      hintId: 'Untuk setiap pos Scope 3, pilih kategori 1–15.',
      hintEn: 'For each Scope 3 line, assign category 1–15.',
    },
    {
      id: 'facilities',
      ok: facilityCount >= 1,
      labelId: 'Minimal satu fasilitas terdaftar',
      labelEn: 'At least one facility registered',
      hintId: 'Tambahkan lokasi operasi untuk pelacakan KPI.',
      hintEn: 'Add operating sites for KPI tracking.',
    },
    {
      id: 'quality',
      ok: hasDataQuality,
      labelId: 'Ada data berkualitas “tinggi” (jejak audit)',
      labelEn: 'Some data flagged as high quality (audit trail)',
      hintId: 'Tandai pos utama sebagai high setelah verifikasi.',
      hintEn: 'Mark key lines as high after verification.',
    },
  ]
}
