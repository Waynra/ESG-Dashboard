import { useMemo } from 'react'
import { useDashboardState } from '../context/DashboardStateContext'
import { csrdPillars } from '../data/csrdReference'
import { downloadCsv } from '../lib/csv'
import { runEsrsReadinessChecks } from '../lib/esrsChecks'

export function CSRDPage() {
  const { state, scopeTotals } = useDashboardState()
  const { settings, facilities } = state

  const checks = useMemo(
    () =>
      runEsrsReadinessChecks(
        state.emissionLines,
        facilities,
        settings.reportingYear,
        settings.facilityFilter,
      ),
    [
      state.emissionLines,
      facilities,
      settings.reportingYear,
      settings.facilityFilter,
    ],
  )

  const passCount = checks.filter((c) => c.ok).length

  const exportAlignment = () => {
    const rows = csrdPillars.map((p) => ({
      id: p.id,
      topic: p.code,
      alignmentPercent: p.alignment,
      notes: settings.locale === 'en' ? p.notesEn : p.notesId,
    }))
    downloadCsv(`csrd-esrs-environment-${settings.reportingYear}.csv`, rows)
  }

  const exportChecks = () => {
    const rows = checks.map((c) => ({
      id: c.id,
      pass: c.ok,
      detail: settings.locale === 'en' ? c.labelEn : c.labelId,
    }))
    downloadCsv(`esrs-readiness-checks-${settings.reportingYear}.csv`, rows)
  }

  const title =
    settings.locale === 'en' ? 'CSRD / ESRS alignment' : 'Selaras CSRD'
  const intro =
    settings.locale === 'en'
      ? 'Environmental ESRS topics (illustrative scores) plus automated readiness checks against your current inventory filters.'
      : 'Topik lingkungan ESRS (skor ilustratif) plus pemeriksaan kesiapan otomatis terhadap filter inventaris saat ini.'

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

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-surface)] hover:opacity-90"
          onClick={exportAlignment}
        >
          {settings.locale === 'en'
            ? 'Export ESRS E topics (CSV)'
            : 'Ekspor topik ESRS E (CSV)'}
        </button>
        <button
          type="button"
          className="rounded-lg border border-[var(--color-surface-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-fg)] hover:bg-white/5"
          onClick={exportChecks}
        >
          {settings.locale === 'en'
            ? 'Export readiness checks (CSV)'
            : 'Ekspor hasil pemeriksaan (CSV)'}
        </button>
      </div>

      <section className="mb-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">
          {settings.locale === 'en'
            ? 'ESRS data readiness (rules engine)'
            : 'Kesiapan data ESRS (mesin aturan)'}
        </h3>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          {settings.locale === 'en'
            ? `Pass ${passCount}/${checks.length} — inventory totals (filtered): S1 ${scopeTotals.scope1.toFixed(0)} · S2 ${scopeTotals.scope2.toFixed(0)} · S3 ${scopeTotals.scope3.toFixed(0)} tCO₂e`
            : `Lulus ${passCount}/${checks.length} — total inventaris (terfilter): S1 ${scopeTotals.scope1.toFixed(0)} · S2 ${scopeTotals.scope2.toFixed(0)} · S3 ${scopeTotals.scope3.toFixed(0)} tCO₂e`}
        </p>
        <ul className="mt-4 space-y-3">
          {checks.map((c) => (
            <li
              key={c.id}
              className="flex gap-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-3"
            >
              <span
                className="mt-0.5 size-2.5 shrink-0 rounded-full"
                style={{
                  background: c.ok ? 'var(--color-accent)' : '#f87171',
                }}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-fg)]">
                  {settings.locale === 'en' ? c.labelEn : c.labelId}
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {settings.locale === 'en' ? c.hintEn : c.hintId}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ul className="space-y-4">
        {csrdPillars.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">
                  {p.code}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {settings.locale === 'en' ? p.notesEn : p.notesId}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 sm:min-w-[120px]">
                <span className="text-2xl font-semibold tabular-nums text-[var(--color-accent)]">
                  {p.alignment}%
                </span>
                <div className="h-2 w-full min-w-[120px] overflow-hidden rounded-full bg-[var(--color-surface-border)] sm:w-28">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]/90"
                    style={{ width: `${p.alignment}%` }}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs leading-relaxed text-[var(--color-muted)]">
        {settings.locale === 'en'
          ? 'CSRD/ESRS is EU law; this module structures data for general sustainability reporting and gap analysis. Replace illustrative alignment scores with your assurance workflow.'
          : 'CSRD/ESRS adalah regulasi UE; modul ini menyusun data untuk pelaporan keberlanjutan umum dan analisis celah. Ganti skor ilustratif dengan proses assurance Anda.'}
      </p>
    </main>
  )
}
