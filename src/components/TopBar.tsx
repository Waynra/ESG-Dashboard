import { useMemo, useRef, useState } from 'react'
import { downloadCsv } from '../lib/csv'
import { useDashboardState } from '../context/DashboardStateContext'
import { topBarLabels } from '../strings/ui'

export function TopBar() {
  const { state, dispatch, disclosureWithProgress } = useDashboardState()
  const { settings } = state
  const t = topBarLabels(settings.locale)
  const [exportOpen, setExportOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const years = useMemo(() => {
    const y = settings.reportingYear
    return [y - 1, y, y + 1, y + 2]
  }, [settings.reportingYear])

  const exportEmissions = () => {
    const rows = state.emissionLines.map((l) => ({
      id: l.id,
      period: l.period,
      scope: l.scope,
      scope3Category: l.scope3Category ?? '',
      description: l.description,
      facilityId: l.facilityId ?? '',
      amountTco2e: l.amountTco2e,
      dataQuality: l.dataQuality,
    }))
    downloadCsv(
      `emissions-inventory-${settings.reportingYear}.csv`,
      rows as unknown as Record<string, unknown>[],
    )
    setExportOpen(false)
  }

  const exportFacilities = () => {
    const rows = state.facilities.map((f) => ({ ...f }))
    downloadCsv(
      `facilities-${settings.reportingYear}.csv`,
      rows as unknown as Record<string, unknown>[],
    )
    setExportOpen(false)
  }

  const exportDisclosure = () => {
    const rows = disclosureWithProgress.map((item) => ({
      id: item.id,
      label: item.label,
      progressPercent: item.progress,
      status: item.status,
      tasksTotal: item.tasks.length,
      tasksDone: item.tasks.filter((x) => x.done).length,
    }))
    downloadCsv(
      `disclosure-readiness-${settings.reportingYear}.csv`,
      rows as unknown as Record<string, unknown>[],
    )
    setExportOpen(false)
  }

  const openExport = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setExportOpen(true)
  }

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setExportOpen(false), 160)
  }

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface)]/95 px-6 py-3 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
          <span className="whitespace-nowrap">{t.year}</span>
          <select
            className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-sm text-[var(--color-fg)]"
            value={settings.reportingYear}
            onChange={(e) =>
              dispatch({
                type: 'patchSettings',
                patch: { reportingYear: Number(e.target.value) },
              })
            }
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
          <span className="whitespace-nowrap">{t.facility}</span>
          <select
            className="max-w-[200px] rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-sm text-[var(--color-fg)]"
            value={settings.facilityFilter}
            onChange={(e) =>
              dispatch({
                type: 'patchSettings',
                patch: {
                  facilityFilter: e.target.value as 'all' | string,
                },
              })
            }
          >
            <option value="all">{t.allSites}</option>
            {state.facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div
          className="relative"
          onMouseEnter={openExport}
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            className="rounded-lg border border-[var(--color-surface-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-fg)] hover:bg-white/5"
            aria-expanded={exportOpen}
            onClick={() => setExportOpen((o) => !o)}
          >
            {t.export}
          </button>
          {exportOpen ? (
            <div className="absolute right-0 mt-1 min-w-[220px] rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] py-1 shadow-lg">
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-[var(--color-fg)] hover:bg-white/5"
                onClick={exportEmissions}
              >
                {t.exportEmissions}
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-[var(--color-fg)] hover:bg-white/5"
                onClick={exportFacilities}
              >
                {t.exportFacilities}
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-[var(--color-fg)] hover:bg-white/5"
                onClick={exportDisclosure}
              >
                {t.exportDisclosure}
              </button>
            </div>
          ) : null}
        </div>
        <span className="hidden text-xs text-[var(--color-muted)] sm:inline">
          {t.org}:{' '}
          <strong className="text-[var(--color-fg)]">
            {settings.organizationName}
          </strong>
        </span>
      </div>
    </header>
  )
}
