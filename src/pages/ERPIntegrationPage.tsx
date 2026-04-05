import { useState } from 'react'
import { erpConnector } from '../lib/erpConnector'
import { useDashboardActions, useDashboardState } from '../context/DashboardStateContext'

export function ERPIntegrationPage() {
  const { state } = useDashboardState()
  const { addFacility, addEmissionLine } = useDashboardActions()
  const { settings } = state

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSyncFacilities = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const erpFacilities = await erpConnector.fetchFacilities()
      erpFacilities.forEach(f => {
        if (!state.facilities.some(existing => existing.id === f.id)) {
          addFacility(f)
        }
      })
      setSuccess(settings.locale === 'en' ? 'Facilities synced from ERP!' : 'Fasilitas disinkronkan dari ERP!')
    } catch (err) {
      setError(settings.locale === 'en' ? 'ERP Connection failed. Is the server running?' : 'Koneksi ERP gagal. Apakah server sudah berjalan?')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncEmissions = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const erpEmissions = await erpConnector.fetchEnergyAsEmissions(settings.reportingYear)
      erpEmissions.forEach(line => {
        // Prevent duplicate imports based on description
        if (!state.emissionLines.some(existing => existing.description === line.description && existing.period === line.period)) {
          addEmissionLine(line)
        }
      })
      setSuccess(settings.locale === 'en' ? 'Energy logs imported as emissions!' : 'Log energi diimpor sebagai emisi!')
    } catch (err) {
      setError(settings.locale === 'en' ? 'ERP Connection failed.' : 'Koneksi ERP gagal.')
    } finally {
      setLoading(false)
    }
  }

  const title = settings.locale === 'en' ? 'ERP & External API' : 'ERP & API Eksternal'
  const intro = settings.locale === 'en' 
    ? 'Connect your sustainability console to external ERP systems (SAP, Oracle, NetSuite) to automate data ingestion.'
    : 'Hubungkan konsol keberlanjutan Anda ke sistem ERP eksternal (SAP, Oracle, NetSuite) untuk otomatisasi data.'

  return (
    <main className="flex-1 overflow-auto p-6 lg:p-8">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)]">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted)]">
          {intro}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-fg)]">
              {settings.locale === 'en' ? 'ERP Master Data' : 'Data Master ERP'}
            </h3>
          </div>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            {settings.locale === 'en' 
              ? 'Import facility names, locations, and asset IDs directly from your corporate ERP to ensure alignment with financial reporting.'
              : 'Impor nama fasilitas, lokasi, dan ID aset langsung dari ERP perusahaan untuk memastikan keselarasan dengan pelaporan keuangan.'}
          </p>
          <button
            onClick={handleSyncFacilities}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[var(--color-accent-dim)] px-4 py-2 text-sm font-semibold text-[var(--color-accent)] hover:opacity-80 disabled:opacity-50"
          >
            {loading ? '...' : (settings.locale === 'en' ? 'Sync Facilities' : 'Sinkronkan Fasilitas')}
          </button>
        </section>

        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-fg)]">
              {settings.locale === 'en' ? 'Energy & Resource API' : 'API Energi & Sumber Daya'}
            </h3>
          </div>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            {settings.locale === 'en' 
              ? 'Automate Scope 1 and Scope 2 emissions by fetching meter readings and fuel consumption logs from utility APIs.'
              : 'Otomatisasi emisi Scope 1 dan Scope 2 dengan mengambil pembacaan meter dan log konsumsi bahan bakar dari API utilitas.'}
          </p>
          <button
            onClick={handleSyncEmissions}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-surface)] hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '...' : (settings.locale === 'en' ? 'Import Energy Logs' : 'Impor Log Energi')}
          </button>
        </section>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-400">
          {success}
        </div>
      )}

      <section className="mt-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-6">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">
          {settings.locale === 'en' ? 'API Endpoint Status' : 'Status Endpoint API'}
        </h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-surface-border)] pb-2 text-xs">
            <span className="text-[var(--color-muted)]">ERP Gateway</span>
            <span className="font-mono text-[var(--color-fg)]">http://localhost:4000/api/erp</span>
          </div>
          <div className="flex items-center justify-between border-b border-[var(--color-surface-border)] pb-2 text-xs">
            <span className="text-[var(--color-muted)]">SAP/S4 Connector</span>
            <span className="text-rose-400">Not Configured</span>
          </div>
        </div>
      </section>
    </main>
  )
}
