export type Locale = 'id' | 'en'

export type Scope2Accounting = 'location' | 'market'

export type FacilityStatus = 'on_track' | 'watch' | 'risk'

export type Facility = {
  id: string
  name: string
  region: string
  energyMwh: number
  waterKl: number
  wasteT: number
  intensity: number
  status: FacilityStatus
}

export type DataQuality = 'high' | 'medium' | 'estimated'

export type EmissionLine = {
  id: string
  scope: 1 | 2 | 3
  /** GHG Protocol Scope 3 category 1–15 when scope === 3 */
  scope3Category?: number
  description: string
  facilityId: string | null
  amountTco2e: number
  period: string
  dataQuality: DataQuality
}

export type DisclosureTask = {
  id: string
  label: string
  done: boolean
}

export type DisclosureStatus = 'audit_ready' | 'in_progress' | 'gap'

export type DisclosureItem = {
  id: string
  label: string
  status: DisclosureStatus
  tasks: DisclosureTask[]
}

export type ReductionTarget = {
  baselineYear: number
  baselineTco2e: number
  targetYear: number
  reductionPercentVsBaseline: number
}

export type ActivityEntry = {
  id: string
  at: string
  action: string
  detail: string
}

export type AppSettings = {
  organizationName: string
  reportingYear: number
  facilityFilter: 'all' | string
  locale: Locale
  scope2Accounting: Scope2Accounting
  fiscalYearStartMonth: number
}

export type DashboardState = {
  settings: AppSettings
  facilities: Facility[]
  emissionLines: EmissionLine[]
  disclosureItems: DisclosureItem[]
  reductionTarget: ReductionTarget
  activityLog: ActivityEntry[]
}

export const SCOPE3_CATEGORIES: { cat: number; nameId: string; nameEn: string }[] =
  [
    { cat: 1, nameId: 'Barang & jasa yang dibeli', nameEn: 'Purchased goods and services' },
    { cat: 2, nameId: 'Aset modal', nameEn: 'Capital goods' },
    {
      cat: 3,
      nameId: 'Aktivitas bahan bakar & energi (tidak masuk S1/S2)',
      nameEn: 'Fuel- and energy-related (not in S1/S2)',
    },
    { cat: 4, nameId: 'Transportasi & distribusi hulu', nameEn: 'Upstream transportation' },
    { cat: 5, nameId: 'Limbah operasi', nameEn: 'Waste from operations' },
    { cat: 6, nameId: 'Perjalanan bisnis', nameEn: 'Business travel' },
    { cat: 7, nameId: 'Penduduk komuter', nameEn: 'Employee commuting' },
    { cat: 8, nameId: 'Aset sewa hulu', nameEn: 'Upstream leased assets' },
    { cat: 9, nameId: 'Transportasi & distribusi hilir', nameEn: 'Downstream transportation' },
    { cat: 10, nameId: 'Pemrosesan produk terjual', nameEn: 'Processing of sold products' },
    { cat: 11, nameId: 'Penggunaan produk terjual', nameEn: 'Use of sold products' },
    {
      cat: 12,
      nameId: 'Akhir masa pakai produk terjual',
      nameEn: 'End-of-life of sold products',
    },
    { cat: 13, nameId: 'Aset sewa hilir', nameEn: 'Downstream leased assets' },
    { cat: 14, nameId: 'Waralaba', nameEn: 'Franchises' },
    { cat: 15, nameId: 'Investasi', nameEn: 'Investments' },
  ]
