import { withDerivedDisclosureStatus } from '../lib/compute'
import type {
  ActivityEntry,
  DashboardState,
  DisclosureItem,
  EmissionLine,
  Facility,
  ReductionTarget,
} from '../types/esg'

const FACILITY_WEIGHTS: { id: string; w: number }[] = [
  { id: 'jkt', w: 0.45 },
  { id: 'bdg', w: 0.2 },
  { id: 'sby', w: 0.15 },
  { id: 'dps', w: 0.2 },
]

const MONTHS = ['01', '02', '03', '04', '05', '06'] as const

const MONTHLY: Record<
  string,
  { s1: number; s2: number; s3: number }
> = {
  '01': { s1: 420, s2: 890, s3: 12400 },
  '02': { s1: 405, s2: 870, s3: 12100 },
  '03': { s1: 398, s2: 910, s3: 11850 },
  '04': { s1: 412, s2: 885, s3: 11920 },
  '05': { s1: 380, s2: 860, s3: 11600 },
  '06': { s1: 395, s2: 875, s3: 11780 },
}

function splitTotal(total: number): number[] {
  const raw = FACILITY_WEIGHTS.map((f) => Math.round(total * f.w))
  let diff = total - raw.reduce((a, b) => a + b, 0)
  raw[raw.length - 1] += diff
  return raw
}

function makeEmissionSeed(year: number): EmissionLine[] {
  const lines: EmissionLine[] = []
  let seq = 0
  const nextId = () => `seed-${++seq}`

  for (const mm of MONTHS) {
    const row = MONTHLY[mm]
    const s1 = splitTotal(row.s1)
    const s2 = splitTotal(row.s2)
    const s3 = splitTotal(row.s3)
    const period = `${year}-${mm}`
    FACILITY_WEIGHTS.forEach((f, i) => {
      if (s1[i] > 0) {
        lines.push({
          id: nextId(),
          scope: 1,
          description: 'Bahan bakar & proses langsung (agregat lokasi)',
          facilityId: f.id,
          amountTco2e: s1[i],
          period,
          dataQuality: 'medium',
        })
      }
      if (s2[i] > 0) {
        lines.push({
          id: nextId(),
          scope: 2,
          description: 'Listrik & uap dibeli (basis lokasi)',
          facilityId: f.id,
          amountTco2e: s2[i],
          period,
          dataQuality: 'medium',
        })
      }
      if (s3[i] > 0) {
        lines.push({
          id: nextId(),
          scope: 3,
          scope3Category: i === 0 ? 1 : i === 1 ? 4 : i === 2 ? 6 : 9,
          description:
            i === 0
              ? 'Pembelian barang & jasa (perkiraan)'
              : i === 1
                ? 'Transportasi hulu'
                : i === 2
                  ? 'Perjalanan & komuter'
                  : 'Penggunaan produk hilir (perkiraan)',
          facilityId: f.id,
          amountTco2e: s3[i],
          period,
          dataQuality: 'estimated',
        })
      }
    })
  }

  return lines
}

export const seedFacilities: Facility[] = [
  {
    id: 'jkt',
    name: 'Pabrik Jakarta',
    region: 'Jawa',
    energyMwh: 12.4,
    waterKl: 890,
    wasteT: 42,
    intensity: 0.38,
    status: 'on_track',
  },
  {
    id: 'bdg',
    name: 'Gudang Bandung',
    region: 'Jawa',
    energyMwh: 4.1,
    waterKl: 210,
    wasteT: 11,
    intensity: 0.22,
    status: 'watch',
  },
  {
    id: 'sby',
    name: 'Kantor Surabaya',
    region: 'Jawa',
    energyMwh: 2.8,
    waterKl: 156,
    wasteT: 8,
    intensity: 0.19,
    status: 'on_track',
  },
  {
    id: 'dps',
    name: 'Resort Bali',
    region: 'Bali',
    energyMwh: 6.2,
    waterKl: 1200,
    wasteT: 28,
    intensity: 0.51,
    status: 'risk',
  },
]

export const seedDisclosureItems: DisclosureItem[] = [
  {
    id: 'ghg',
    label: 'Inventaris GHG terverifikasi (Scope 1–3)',
    status: 'audit_ready',
    tasks: [
      { id: 't1', label: 'Metodologi & batas organisasi terdokumentasi', done: true },
      { id: 't2', label: 'Faktor emisi & sumber referensi dicatat', done: true },
      { id: 't3', label: 'Kualitas data dinilai per pos', done: true },
      { id: 't4', label: 'Review independen / assurance (opsional)', done: false },
    ],
  },
  {
    id: 'energy',
    label: 'Data energi per fasilitas & sertifikat REC/PPA',
    status: 'in_progress',
    tasks: [
      { id: 't1', label: 'Rekonsiliasi tagihan listrik per lokasi', done: true },
      { id: 't2', label: 'Pembagian Scope 2 lokasi vs pasar', done: true },
      { id: 't3', label: 'Bukti atribut energi hijau', done: false },
      { id: 't4', label: 'Target intensitas energi', done: false },
    ],
  },
  {
    id: 'supply',
    label: 'Kuesioner rantai pasok (Scope 3 kategori utama)',
    status: 'in_progress',
    tasks: [
      { id: 't1', label: 'Pemetaan pemasok prioritas', done: true },
      { id: 't2', label: 'Pengiriman kuesioner & tindak lanjut', done: false },
      { id: 't3', label: 'Substitusi data sekunder di mana perlu', done: false },
    ],
  },
  {
    id: 'governance',
    label: 'Kebijakan tata kelola & due diligence lingkungan',
    status: 'audit_ready',
    tasks: [
      { id: 't1', label: 'Kebijakan lingkungan disetujui direksi', done: true },
      { id: 't2', label: 'RACI pelaporan keberlanjutan', done: true },
      { id: 't3', label: 'Penilaian risiko lingkungan terintegrasi', done: true },
    ],
  },
  {
    id: 'targets',
    label: 'Target ilmiah (SBTi) & rencana transisi',
    status: 'gap',
    tasks: [
      { id: 't1', label: 'Garis dasar emisi disepakati', done: true },
      { id: 't2', label: 'Target suhu disetujui', done: false },
      { id: 't3', label: 'Milestone tahunan & CAPEX', done: false },
    ],
  },
]

export const seedReductionTarget: ReductionTarget = {
  baselineYear: 2019,
  baselineTco2e: 98000,
  targetYear: 2030,
  reductionPercentVsBaseline: 42,
}

const seedLog: ActivityEntry[] = [
  {
    id: 'log-1',
    at: new Date().toISOString(),
    action: 'system.init',
    detail: 'Dataset demo dimuat — siap untuk integrasi API/ERP.',
  },
]

export function createSeedState(year = 2024): DashboardState {
  return {
    settings: {
      organizationName: 'PT Contoh Berkelanjutan',
      reportingYear: year,
      facilityFilter: 'all',
      locale: 'id',
      scope2Accounting: 'location',
      fiscalYearStartMonth: 1,
    },
    facilities: seedFacilities.map((f) => ({ ...f })),
    emissionLines: makeEmissionSeed(year),
    disclosureItems: withDerivedDisclosureStatus(
      seedDisclosureItems.map((d) => ({
        ...d,
        tasks: d.tasks.map((t) => ({ ...t })),
      })),
    ),
    reductionTarget: { ...seedReductionTarget },
    activityLog: seedLog.map((l) => ({ ...l })),
  }
}

export const STORAGE_KEY = 'esg-pulse-dashboard-v2'
