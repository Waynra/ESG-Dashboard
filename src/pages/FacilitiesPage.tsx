import { type FormEvent, useMemo, useState } from 'react'
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
import type { Facility, FacilityStatus } from '../types/esg'

const statusLabel: Record<
  FacilityStatus,
  { id: string; en: string; className: string }
> = {
  on_track: {
    id: 'On track',
    en: 'On track',
    className: 'bg-emerald-500/15 text-emerald-400',
  },
  watch: {
    id: 'Perlu perhatian',
    en: 'Watch',
    className: 'bg-amber-500/15 text-amber-400',
  },
  risk: {
    id: 'Risiko',
    en: 'At risk',
    className: 'bg-rose-500/15 text-rose-400',
  },
}

function slugId(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base || `site-${Date.now()}`
}

export function FacilitiesPage() {
  const { state } = useDashboardState()
  const { addFacility, deleteFacility } = useDashboardActions()
  const { settings, facilities } = state
  const loc = settings.locale === 'en' ? 'en-US' : 'id-ID'

  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [energyMwh, setEnergyMwh] = useState('')
  const [waterKl, setWaterKl] = useState('')
  const [wasteT, setWasteT] = useState('')
  const [intensity, setIntensity] = useState('')
  const [status, setStatus] = useState<FacilityStatus>('on_track')

  const chartData = useMemo(
    () =>
      facilities.map((f) => ({
        name: f.name,
        intensitas: f.intensity,
        status: f.status
      })).sort((a, b) => b.intensitas - a.intensitas),
    [facilities],
  )

  const avgIntensity = useMemo(() => {
    if (facilities.length === 0) return 0
    return Math.round((facilities.reduce((a, b) => a + b.intensity, 0) / facilities.length) * 10) / 10
  }, [facilities])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const f: Facility = {
      id: slugId(name.trim()),
      name: name.trim(),
      region: region.trim() || '—',
      energyMwh: Number(energyMwh.replace(',', '.')) || 0,
      waterKl: Number(waterKl.replace(',', '.')) || 0,
      wasteT: Number(wasteT.replace(',', '.')) || 0,
      intensity: Number(intensity.replace(',', '.')) || 0,
      status,
    }
    if (facilities.some((x) => x.id === f.id)) {
      f.id = `${f.id}-${Date.now()}`
    }
    addFacility(f)
    setName('')
    setRegion('')
    setEnergyMwh('')
    setWaterKl('')
    setWasteT('')
    setIntensity('')
  }

  const title =
    settings.locale === 'en' ? 'Facilities & KPIs' : 'Fasilitas & KPI'
  const subtitle =
    settings.locale === 'en'
      ? 'Site-level resource use and intensity metrics — supports group roll-up and assurance sampling.'
      : 'Penggunaan sumber daya dan metrik intensitas per lokasi — mendukung agregasi grup dan sampling assurance.'

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

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Avg. Intensity' : 'Rata-rata Intensitas'}
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-fg)]">
            {avgIntensity}
            <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">tCO₂e / unit</span>
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'At Risk Sites' : 'Lokasi Berisiko'}
          </p>
          <p className="mt-2 text-2xl font-semibold text-rose-400">
            {facilities.filter(f => f.status === 'risk').length}
          </p>
        </div>
      </div>

      <section className="mb-8 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5 lg:p-6">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">
          {settings.locale === 'en' ? 'Register facility' : 'Daftarkan fasilitas'}
        </h3>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
          onSubmit={onSubmit}
        >
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Name' : 'Nama'}
            <input
              required
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Region' : 'Wilayah'}
            <input
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            MWh
            <input
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={energyMwh}
              onChange={(e) => setEnergyMwh(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Water (kL)' : 'Air (kL)'}
            <input
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={waterKl}
              onChange={(e) => setWaterKl(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Waste (t)' : 'Limbah (t)'}
            <input
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={wasteT}
              onChange={(e) => setWasteT(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Intensity (custom)' : 'Intensitas (kustom)'}
            <input
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            Status
            <select
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-fg)]"
              value={status}
              onChange={(e) => setStatus(e.target.value as FacilityStatus)}
            >
              <option value="on_track">on_track</option>
              <option value="watch">watch</option>
              <option value="risk">risk</option>
            </select>
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-4 xl:col-span-7">
            <button
              type="submit"
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-surface)] hover:opacity-90"
            >
              {settings.locale === 'en' ? 'Add facility' : 'Tambah fasilitas'}
            </button>
          </div>
        </form>
      </section>

      <section className="mb-8 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5 lg:p-6">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">
          {settings.locale === 'en'
            ? 'Emission intensity by site (custom metric)'
            : 'Intensitas emisi per fasilitas (metrik kustom)'}
        </h3>
        <div className="mt-4 h-[240px]">
          {chartData.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              {settings.locale === 'en'
                ? 'No facilities yet.'
                : 'Belum ada fasilitas.'}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#252a35"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: '#8b92a3', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
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
                <Bar
                  dataKey="intensitas"
                  name="Intensity"
                  fill="var(--color-accent)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-surface-border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-4 py-3 font-medium">
                {settings.locale === 'en' ? 'Facility' : 'Fasilitas'}
              </th>
              <th className="px-4 py-3 font-medium">
                {settings.locale === 'en' ? 'Region' : 'Wilayah'}
              </th>
              <th className="px-4 py-3 font-medium tabular-nums">MWh</th>
              <th className="px-4 py-3 font-medium tabular-nums">kL</th>
              <th className="px-4 py-3 font-medium tabular-nums">t</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-surface-border)] bg-[var(--color-surface)]">
            {facilities.map((f) => {
              const s = statusLabel[f.status]
              const st = settings.locale === 'en' ? s.en : s.id
              return (
                <tr
                  key={f.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-fg)]">
                    {f.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {f.region}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[var(--color-fg)]">
                    {f.energyMwh.toLocaleString(loc, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[var(--color-fg)]">
                    {f.waterKl.toLocaleString(loc)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[var(--color-fg)]">
                    {f.wasteT}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}
                    >
                      {st}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-xs font-medium text-rose-400 hover:underline"
                      onClick={() => deleteFacility(f.id)}
                    >
                      {settings.locale === 'en' ? 'Remove' : 'Hapus'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
