import { type FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useDashboardActions, useDashboardState } from '../context/DashboardStateContext'

export function TargetsPage() {
  const { state, scopeTotals } = useDashboardState()
  const { setReductionTarget } = useDashboardActions()
  const { settings, reductionTarget } = state
  const loc = settings.locale === 'en' ? 'en-US' : 'id-ID'

  const [baselineYear, setBaselineYear] = useState(
    String(reductionTarget.baselineYear),
  )
  const [baselineT, setBaselineT] = useState(
    String(reductionTarget.baselineTco2e),
  )
  const [targetYear, setTargetYear] = useState(
    String(reductionTarget.targetYear),
  )
  const [reductionPct, setReductionPct] = useState(
    String(reductionTarget.reductionPercentVsBaseline),
  )

  useEffect(() => {
    setBaselineYear(String(reductionTarget.baselineYear))
    setBaselineT(String(reductionTarget.baselineTco2e))
    setTargetYear(String(reductionTarget.targetYear))
    setReductionPct(String(reductionTarget.reductionPercentVsBaseline))
  }, [reductionTarget])

  const currentTotal =
    scopeTotals.scope1 + scopeTotals.scope2 + scopeTotals.scope3

  const targetAbsolute = useMemo(() => {
    const b = reductionTarget.baselineTco2e
    if (b <= 0) return 0
    return b * (1 - reductionTarget.reductionPercentVsBaseline / 100)
  }, [reductionTarget])

  const chartData = useMemo(
    () => [
      {
        name:
          settings.locale === 'en'
            ? `Baseline ${reductionTarget.baselineYear}`
            : `Garis dasar ${reductionTarget.baselineYear}`,
        t: reductionTarget.baselineTco2e,
      },
      {
        name:
          settings.locale === 'en'
            ? `Current (${settings.reportingYear})`
            : `Saat ini (${settings.reportingYear})`,
        t: currentTotal,
      },
      {
        name:
          settings.locale === 'en'
            ? `Target ${reductionTarget.targetYear}`
            : `Target ${reductionTarget.targetYear}`,
        t: targetAbsolute,
      },
    ],
    [
      currentTotal,
      reductionTarget,
      settings.locale,
      settings.reportingYear,
      targetAbsolute,
    ],
  )

  const onSave = (e: FormEvent) => {
    e.preventDefault()
    setReductionTarget({
      baselineYear: Number(baselineYear) || reductionTarget.baselineYear,
      baselineTco2e: Number(baselineT.replace(',', '.')) || 0,
      targetYear: Number(targetYear) || reductionTarget.targetYear,
      reductionPercentVsBaseline:
        Number(reductionPct.replace(',', '.')) || 0,
    })
  }

  const title =
    settings.locale === 'en'
      ? 'Targets & reduction pathway'
      : 'Target & jalur reduksi'
  const subtitle =
    settings.locale === 'en'
      ? 'Science-based style framing: baseline inventory, current filtered total, and linear target envelope. Connect to SBTi criteria in your governance process.'
      : 'Bingkai bergaya berbasis sains: inventaris garis dasar, total terfilter saat ini, dan amplop target. Sambungkan ke kriteria SBTi dalam tata kelola Anda.'

  return (
    <main className="flex-1 overflow-auto p-6 lg:p-8">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)]">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted)]">
          {subtitle}
        </p>
      </header>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <form
          className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5"
          onSubmit={onSave}
        >
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en'
              ? 'Target parameters'
              : 'Parameter target'}
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
              {settings.locale === 'en' ? 'Baseline year' : 'Tahun garis dasar'}
              <input
                className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
                value={baselineYear}
                onChange={(e) => setBaselineYear(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
              {settings.locale === 'en'
                ? 'Baseline tCO₂e (1+2+3)'
                : 'Garis dasar tCO₂e (1+2+3)'}
              <input
                className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
                value={baselineT}
                onChange={(e) => setBaselineT(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
              {settings.locale === 'en' ? 'Target year' : 'Tahun target'}
              <input
                className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
              {settings.locale === 'en'
                ? 'Reduction vs baseline (%)'
                : 'Reduksi vs garis dasar (%)'}
              <input
                className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
                value={reductionPct}
                onChange={(e) => setReductionPct(e.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-surface)] hover:opacity-90"
          >
            {settings.locale === 'en' ? 'Save targets' : 'Simpan target'}
          </button>
        </form>

        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en' ? 'Key figures' : 'Angka kunci'}
          </h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-muted)]">
                {settings.locale === 'en'
                  ? 'Target inventory (absolute)'
                  : 'Inventaris target (absolut)'}
              </dt>
              <dd className="tabular-nums font-medium text-[var(--color-fg)]">
                {targetAbsolute.toLocaleString(loc, { maximumFractionDigits: 0 })}{' '}
                tCO₂e
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-muted)]">
                {settings.locale === 'en'
                  ? 'Current (filtered view)'
                  : 'Saat ini (tampilan terfilter)'}
              </dt>
              <dd className="tabular-nums font-medium text-[var(--color-fg)]">
                {currentTotal.toLocaleString(loc, { maximumFractionDigits: 0 })}{' '}
                tCO₂e
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5 lg:p-6">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">
          {settings.locale === 'en'
            ? 'Baseline · current · target envelope'
            : 'Garis dasar · saat ini · amplop target'}
        </h3>
        <div className="mt-6 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#252a35"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8b92a3', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={70}
              />
              <YAxis
                tick={{ fill: '#8b92a3', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) =>
                  typeof v === 'number'
                    ? `${v.toLocaleString(loc)} tCO₂e`
                    : String(v)
                }
                contentStyle={{
                  background: '#161a22',
                  border: '1px solid #252a35',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="t"
                name="tCO₂e"
                fill="var(--color-accent)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  )
}
