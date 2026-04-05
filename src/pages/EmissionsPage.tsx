import { type FormEvent, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useDashboardActions, useDashboardState } from '../context/DashboardStateContext'
import { SCOPE3_CATEGORIES, type DataQuality, type EmissionLine } from '../types/esg'

const scopeCards = {
  id: [
    {
      title: 'Scope 1',
      desc: 'Emisi langsung dari sumber yang dimiliki atau dikendalikan organisasi (bahan bakar stasioner & mobile, proses industri, fugitif).',
      hint: 'Integrasi: meter bahan bakar, data flota, faktur gas.',
    },
    {
      title: 'Scope 2',
      desc: 'Emisi tidak langsung dari energi listrik, uap, pemanas, dan pendingin yang dibeli.',
      hint: 'Integrasi: tagihan listrik, faktor grid lokasi atau berbasis pasar.',
    },
    {
      title: 'Scope 3',
      desc: 'Emisi tidak langsung lain di rantai nilai (15 kategori GHG Protocol).',
      hint: 'Integrasi: ERP, logistik, survei pemasok, database faktor.',
    },
  ],
  en: [
    {
      title: 'Scope 1',
      desc: 'Direct emissions from owned or controlled sources (stationary & mobile combustion, industrial processes, fugitives).',
      hint: 'Integrations: fuel meters, fleet telematics, gas invoices.',
    },
    {
      title: 'Scope 2',
      desc: 'Indirect emissions from purchased electricity, steam, heating, and cooling.',
      hint: 'Integrations: utility bills, location- or market-based factors.',
    },
    {
      title: 'Scope 3',
      desc: 'Other indirect value-chain emissions (GHG Protocol’s 15 categories).',
      hint: 'Integrations: ERP, logistics, supplier surveys, factor databases.',
    },
  ],
} as const

export function EmissionsPage() {
  const { state, filteredLines, scopeTotals, monthlySeries, scope3Map, facilityDistribution } =
    useDashboardState()
  const { addEmissionLine, deleteEmissionLine } = useDashboardActions()
  const { settings } = state
  const loc = settings.locale === 'en' ? 'en-US' : 'id-ID'
  const cards = settings.locale === 'en' ? scopeCards.en : scopeCards.id

  const [scope, setScope] = useState<1 | 2 | 3>(1)
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState(
    `${settings.reportingYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  )
  const [facilityId, setFacilityId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [scope3Category, setScope3Category] = useState('1')
  const [dataQuality, setDataQuality] = useState<DataQuality>('medium')

  const pieData = useMemo(
    () => [
      { name: 'Scope 1', value: scopeTotals.scope1, color: '#f472b6' },
      { name: 'Scope 2', value: scopeTotals.scope2, color: '#60a5fa' },
      { name: 'Scope 3', value: scopeTotals.scope3, color: '#a78bfa' },
    ],
    [scopeTotals],
  )

  const scope3Breakdown = useMemo(() => {
    return SCOPE3_CATEGORIES.map((c) => ({
      name: settings.locale === 'en' ? c.nameEn : c.nameId,
      cat: c.cat,
      value: scope3Map.get(c.cat) ?? 0,
    })).filter((r) => r.value > 0)
  }, [scope3Map, settings.locale])

  const qualitySummary = useMemo(() => {
    const counts = { high: 0, medium: 0, estimated: 0 }
    filteredLines.forEach(l => {
      counts[l.dataQuality]++
    })
    return counts
  }, [filteredLines])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const n = Number(amount.replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0) return

    const line: EmissionLine = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `e-${Date.now()}`,
      scope,
      scope3Category: scope === 3 ? Number(scope3Category) : undefined,
      description: description.trim() || (settings.locale === 'en' ? 'Manual entry' : 'Entri manual'),
      facilityId: facilityId || null,
      amountTco2e: n,
      period,
      dataQuality,
    }
    addEmissionLine(line)
    setAmount('')
    setDescription('')
  }

  const title =
    settings.locale === 'en' ? 'Emissions inventory' : 'Pelacakan emisi'
  const subtitle =
    settings.locale === 'en'
      ? 'Manage GHG inventory by Scope 1–3 with auditable line items, aligned with GHG Protocol Corporate Standard.'
      : 'Kelola inventaris GHG per Scope 1–3 dengan baris yang dapat diaudit, selaras GHG Protocol Corporate Standard.'

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

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <article
            key={c.title}
            className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5"
          >
            <h3 className="text-sm font-semibold text-[var(--color-accent)]">
              {c.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg)]">
              {c.desc}
            </p>
            <p className="mt-3 text-xs text-[var(--color-muted)]">{c.hint}</p>
          </article>
        ))}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">High Quality</p>
          <p className="mt-1 text-xl font-semibold text-[var(--color-fg)]">{qualitySummary.high} items</p>
        </div>
        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Medium Quality</p>
          <p className="mt-1 text-xl font-semibold text-[var(--color-fg)]">{qualitySummary.medium} items</p>
        </div>
        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Estimated</p>
          <p className="mt-1 text-xl font-semibold text-[var(--color-fg)]">{qualitySummary.estimated} items</p>
        </div>
      </div>

      <section className="mb-8 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5 lg:p-6">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">
          {settings.locale === 'en'
            ? 'Add emission line'
            : 'Tambah baris emisi'}
        </h3>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          onSubmit={onSubmit}
        >
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            Scope
            <select
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={scope}
              onChange={(e) => setScope(Number(e.target.value) as 1 | 2 | 3)}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
          {scope === 3 ? (
            <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
              {settings.locale === 'en' ? 'Category (1–15)' : 'Kategori (1–15)'}
              <select
                className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
                value={scope3Category}
                onChange={(e) => setScope3Category(e.target.value)}
              >
                {SCOPE3_CATEGORIES.map((c) => (
                  <option key={c.cat} value={c.cat}>
                    {c.cat} —{' '}
                    {settings.locale === 'en' ? c.nameEn : c.nameId}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div />
          )}
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            tCO₂e
            <input
              required
              type="text"
              inputMode="decimal"
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Period (YYYY-MM)' : 'Periode (YYYY-MM)'}
            <input
              required
              pattern="\d{4}-\d{2}"
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Facility' : 'Fasilitas'}
            <select
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
            >
              <option value="">
                {settings.locale === 'en' ? 'Organization-level' : 'Tingkat organisasi'}
              </option>
              {state.facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Data quality' : 'Kualitas data'}
            <select
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={dataQuality}
              onChange={(e) =>
                setDataQuality(e.target.value as DataQuality)
              }
            >
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="estimated">estimated</option>
            </select>
          </label>
          <label className="sm:col-span-2 lg:col-span-3 flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Description' : 'Deskripsi'}
            <input
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-surface)] hover:opacity-90"
            >
              {settings.locale === 'en' ? 'Save line' : 'Simpan baris'}
            </button>
          </div>
        </form>
      </section>

      <div className="mb-8 overflow-x-auto rounded-xl border border-[var(--color-surface-border)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-3 py-3 font-medium">
                {settings.locale === 'en' ? 'Period' : 'Periode'}
              </th>
              <th className="px-3 py-3 font-medium">Scope</th>
              <th className="px-3 py-3 font-medium">Cat</th>
              <th className="px-3 py-3 font-medium">
                {settings.locale === 'en' ? 'Description' : 'Deskripsi'}
              </th>
              <th className="px-3 py-3 font-medium">
                {settings.locale === 'en' ? 'Site' : 'Lokasi'}
              </th>
              <th className="px-3 py-3 font-medium">tCO₂e</th>
              <th className="px-3 py-3 font-medium">QA</th>
              <th className="px-3 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-surface-border)] bg-[var(--color-surface)]">
            {filteredLines.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-[var(--color-muted)]"
                >
                  {settings.locale === 'en'
                    ? 'No rows for current filters.'
                    : 'Tidak ada baris untuk filter saat ini.'}
                </td>
              </tr>
            ) : (
              filteredLines.map((l) => {
                const fname =
                  l.facilityId &&
                  state.facilities.find((f) => f.id === l.facilityId)?.name
                return (
                  <tr key={l.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2 tabular-nums text-[var(--color-fg)]">
                      {l.period}
                    </td>
                    <td className="px-3 py-2 text-[var(--color-fg)]">
                      {l.scope}
                    </td>
                    <td className="px-3 py-2 text-[var(--color-muted)]">
                      {l.scope === 3 ? (l.scope3Category ?? '—') : '—'}
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-2 text-[var(--color-fg)]">
                      {l.description}
                    </td>
                    <td className="px-3 py-2 text-[var(--color-muted)]">
                      {fname ??
                        (settings.locale === 'en' ? 'Org' : 'Org')}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-[var(--color-fg)]">
                      {l.amountTco2e.toLocaleString(loc)}
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--color-muted)]">
                      {l.dataQuality}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="text-xs font-medium text-rose-400 hover:underline"
                        onClick={() => deleteEmissionLine(l.id)}
                      >
                        {settings.locale === 'en' ? 'Remove' : 'Hapus'}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5 lg:p-6">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en'
              ? 'Scope distribution'
              : 'Distribusi scope'}
          </h3>
          <div className="mt-6 h-[300px] w-full min-w-0">
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

        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5 lg:p-6">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en'
              ? 'Emissions by facility'
              : 'Emisi per fasilitas'}
          </h3>
          <div className="mt-6 h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={facilityDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#252a35" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#8b92a3', fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    background: '#161a22',
                    border: '1px solid #252a35',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v: number) => [v.toLocaleString(loc), 'tCO₂e']}
                />
                <Bar dataKey="value" fill="var(--color-accent)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5 lg:p-6">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en'
              ? 'Monthly stacked bars'
              : 'Emisi per bulan (batang)'}
          </h3>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySeries}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
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
                />
                <Tooltip
                  contentStyle={{
                    background: '#161a22',
                    border: '1px solid #252a35',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="scope1"
                  name="Scope 1"
                  fill="#f472b6"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
                <Bar
                  dataKey="scope2"
                  name="Scope 2"
                  fill="#60a5fa"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
                <Bar
                  dataKey="scope3"
                  name="Scope 3"
                  fill="#a78bfa"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5 lg:p-6">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">
          {settings.locale === 'en'
            ? 'Scope 3 — category breakdown (filtered)'
            : 'Scope 3 — rincian kategori (terfilter)'}
        </h3>
        {scope3Breakdown.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {settings.locale === 'en'
              ? 'No Scope 3 lines in view.'
              : 'Belum ada baris Scope 3 pada tampilan ini.'}
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {scope3Breakdown.map((r) => (
              <li
                key={r.cat}
                className="flex items-center justify-between gap-4 border-b border-[var(--color-surface-border)] border-dashed py-2 last:border-0"
              >
                <span className="text-[var(--color-fg)]">
                  {r.cat}. {r.name}
                </span>
                <span className="tabular-nums text-[var(--color-muted)]">
                  {r.value.toLocaleString(loc)} tCO₂e
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--color-surface-border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">
                {settings.locale === 'en' ? 'Category' : 'Kategori'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-surface-border)]">
            {SCOPE3_CATEGORIES.map((c) => (
              <tr key={c.cat} className="bg-[var(--color-surface-raised)]">
                <td className="px-3 py-2 tabular-nums text-[var(--color-muted)]">
                  {c.cat}
                </td>
                <td className="px-3 py-2 text-[var(--color-fg)]">
                  {settings.locale === 'en' ? c.nameEn : c.nameId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
