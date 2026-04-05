import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { useDashboardState } from "../context/DashboardStateContext";

function Stat({
  label,
  value,
  sub,
  yoy,
}: {
  label: string
  value: string
  sub?: string
  yoy?: { text: string; color: string } | null
}) {
  return (
    <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--color-fg)]">
            {value}
          </p>
        </div>
        {yoy ? (
          <span className={`text-[10px] font-bold ${yoy.color}`}>
            {yoy.text}
          </span>
        ) : null}
      </div>
      {sub ? (
        <p className="mt-1 text-xs text-[var(--color-muted)]">{sub}</p>
      ) : null}
    </div>
  )
}

export function OverviewPage() {
  const { state, scopeTotals, yoySummary, monthlySeries, disclosureWithProgress } =
    useDashboardState();
  const { settings, reductionTarget } = state;
  const loc = settings.locale === "en" ? "en-US" : "id-ID";

  const total = scopeTotals.scope1 + scopeTotals.scope2 + scopeTotals.scope3;

  const yoyLabel = useMemo(() => {
    if (yoySummary.percent === null) return null
    const sign = yoySummary.percent > 0 ? '+' : ''
    const color = yoySummary.percent > 0 ? 'text-rose-400' : 'text-emerald-400'
    return {
      text: `${sign}${yoySummary.percent}% vs ${settings.reportingYear - 1}`,
      color
    }
  }, [yoySummary, settings.reportingYear])

  const avgDisclosure = useMemo(() => {
    if (disclosureWithProgress.length === 0) return 0;
    return Math.round(
      disclosureWithProgress.reduce((a, i) => a + i.progress, 0) /
        disclosureWithProgress.length,
    );
  }, [disclosureWithProgress]);

  const reductionVsBaseline = useMemo(() => {
    if (reductionTarget.baselineTco2e <= 0) return null;
    const raw =
      ((reductionTarget.baselineTco2e - total) /
        reductionTarget.baselineTco2e) *
      100;
    return Math.round(raw * 10) / 10;
  }, [reductionTarget.baselineTco2e, total]);

  const isEmptyPeriod = total === 0;

  const copy = {
    title:
      settings.locale === "en"
        ? "Sustainability operations overview"
        : "Ringkasan operasi keberlanjutan",
    subtitle:
      settings.locale === "en"
        ? "Track carbon intensity, emissions trends, and reporting readiness in one console — aligned with GHG Protocol and CSRD-style disclosure practice."
        : "Pantau intensitas karbon, tren emisi, dan kesiapan pelaporan dalam satu konsol — selaras GHG Protocol dan praktik pengungkapan bergaya CSRD.",
    chart:
      settings.locale === "en"
        ? "tCO₂e — filtered by reporting year and facility"
        : "tCO₂e — difilter tahun pelaporan dan fasilitas",
    empty:
      settings.locale === "en"
        ? "No emission lines for this year/filter. Add data under Emissions or change the year in the top bar."
        : "Belum ada baris emisi untuk tahun/filter ini. Tambah data di Emisi atau ubah tahun di bilah atas.",
    targetTitle:
      settings.locale === "en" ? "Pathway vs baseline" : "Jalur vs garis dasar",
    targetSub:
      settings.locale === "en"
        ? `Baseline ${reductionTarget.baselineYear} · Target ${reductionTarget.targetYear} (−${reductionTarget.reductionPercentVsBaseline}% vs baseline)`
        : `Garis dasar ${reductionTarget.baselineYear} · Target ${reductionTarget.targetYear} (−${reductionTarget.reductionPercentVsBaseline}% vs baseline)`,
    disclosure:
      settings.locale === "en"
        ? "Disclosure readiness (avg.)"
        : "Kesiapan pengungkapan (rata-rata)",
  };

  const pieData = useMemo(
    () => [
      { name: "Scope 1", value: scopeTotals.scope1, color: "#f472b6" },
      { name: "Scope 2", value: scopeTotals.scope2, color: "#60a5fa" },
      { name: "Scope 3", value: scopeTotals.scope3, color: "#a78bfa" },
    ],
    [scopeTotals],
  );

  return (
    <main className="flex-1 overflow-auto p-6 lg:p-8">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)]">
          {copy.title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted)]">
          {copy.subtitle}
        </p>
        {settings.scope2Accounting === "market" ? (
          <p className="mt-2 text-xs text-amber-400/90">
            {settings.locale === "en"
              ? "Scope 2 accounting: market-based (document certificates/PPA in disclosures)."
              : "Scope 2: basis pasar — dokumentasikan sertifikat/PPA di modul pengungkapan."}
          </p>
        ) : null}
      </header>

      {isEmptyPeriod ? (
        <div
          className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          role="status"
        >
          {copy.empty}
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label={
            settings.locale === "en"
              ? "Total emissions (tCO₂e)"
              : "Total emisi (tCO₂e)"
          }
          value={total.toLocaleString(loc)}
          sub={
            settings.locale === "en"
              ? "Scopes 1–3 (filtered)"
              : "Scope 1–3 (terfilter)"
          }
          yoy={yoyLabel}
        />
        <Stat
          label="Scope 1"
          value={scopeTotals.scope1.toLocaleString(loc)}
          sub={
            settings.locale === "en"
              ? "tCO₂e — direct sources"
              : "tCO₂e — sumber langsung"
          }
        />
        <Stat
          label="Scope 2"
          value={scopeTotals.scope2.toLocaleString(loc)}
          sub={
            settings.locale === "en"
              ? "tCO₂e — purchased energy"
              : "tCO₂e — energi dibeli"
          }
        />
        <Stat
          label="Scope 3"
          value={scopeTotals.scope3.toLocaleString(loc)}
          sub={
            settings.locale === "en"
              ? "tCO₂e — value chain"
              : "tCO₂e — rantai nilai"
          }
        />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {copy.disclosure}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-accent)]">
            {avgDisclosure}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface-border)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)]/80"
              style={{ width: `${avgDisclosure}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {copy.targetTitle}
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {copy.targetSub}
          </p>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--color-fg)]">
            {reductionVsBaseline === null
              ? "—"
              : `${reductionVsBaseline > 0 ? "+" : ""}${reductionVsBaseline}%`}
            <span className="ml-2 text-sm font-normal text-[var(--color-muted)]">
              {settings.locale === "en"
                ? "vs baseline inventory"
                : "vs inventaris garis dasar"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5 lg:col-span-2 lg:p-6">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en'
              ? 'Monthly emissions trend'
              : 'Tren emisi per bulan'}
          </h3>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{copy.chart}</p>
          <div className="mt-6 h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlySeries}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f472b6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#252a35"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#8b92a3', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8b92a3', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#161a22',
                    border: '1px solid #252a35',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#e8eaef' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area
                  type="monotone"
                  dataKey="scope1"
                  name="Scope 1"
                  stroke="#f472b6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#g1)"
                />
                <Area
                  type="monotone"
                  dataKey="scope2"
                  name="Scope 2"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#g2)"
                />
                <Area
                  type="monotone"
                  dataKey="scope3"
                  name="Scope 3"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#g3)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5 lg:p-6">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en'
              ? 'Scope distribution'
              : 'Distribusi scope'}
          </h3>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en'
              ? 'Breakdown of total emissions'
              : 'Rincian total emisi'}
          </p>
          <div className="mt-6 h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#161a22',
                    border: '1px solid #252a35',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#e8eaef' }}
                  formatter={(v: number) => [v.toLocaleString(loc), 'tCO₂e']}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </main>
  );
}
