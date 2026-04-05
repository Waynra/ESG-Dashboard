import type { Locale } from '../types/esg'

const nav = {
  id: {
    overview: 'Ringkasan',
    emissions: 'Emisi (Scope 1–3)',
    facilities: 'Fasilitas & KPI',
    disclosure: 'Kesiapan pengungkapan',
    csrd: 'Selaras CSRD',
    targets: 'Target & jalur reduksi',
    audit: 'Log aktivitas',
    settings: 'Pengaturan',
  },
  en: {
    overview: 'Overview',
    emissions: 'Emissions (Scopes 1–3)',
    facilities: 'Facilities & KPIs',
    disclosure: 'Disclosure readiness',
    csrd: 'CSRD alignment',
    targets: 'Targets & reduction pathway',
    audit: 'Activity log',
    settings: 'Settings',
  },
} as const

const top = {
  id: {
    year: 'Tahun pelaporan',
    facility: 'Fasilitas',
    allSites: 'Semua lokasi',
    export: 'Ekspor',
    exportEmissions: 'Inventaris emisi (CSV)',
    exportFacilities: 'Daftar fasilitas (CSV)',
    exportDisclosure: 'Checklist pengungkapan (CSV)',
    org: 'Organisasi',
  },
  en: {
    year: 'Reporting year',
    facility: 'Facility',
    allSites: 'All sites',
    export: 'Export',
    exportEmissions: 'Emissions inventory (CSV)',
    exportFacilities: 'Facilities list (CSV)',
    exportDisclosure: 'Disclosure checklist (CSV)',
    org: 'Organization',
  },
} as const

export function navLabels(locale: Locale) {
  return locale === 'en' ? nav.en : nav.id
}

export function topBarLabels(locale: Locale) {
  return locale === 'en' ? top.en : top.id
}
