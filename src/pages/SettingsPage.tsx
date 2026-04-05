import { type FormEvent, useState } from 'react'
import { useDashboardActions, useDashboardState } from '../context/DashboardStateContext'
import type { Locale, Scope2Accounting } from '../types/esg'

export function SettingsPage() {
  const { state, dispatch } = useDashboardState()
  const { patchSettings, resetDemo } = useDashboardActions()
  const { settings } = state

  const [org, setOrg] = useState(settings.organizationName)
  const [fiscalMonth, setFiscalMonth] = useState(
    String(settings.fiscalYearStartMonth),
  )

  const onOrgSubmit = (e: FormEvent) => {
    e.preventDefault()
    patchSettings({ organizationName: org.trim() || settings.organizationName })
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `esg-pulse-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!parsed.settings || !Array.isArray(parsed.emissionLines)) {
          throw new Error('Invalid format')
        }
        dispatch({ type: 'hydrate', state: parsed })
        alert(settings.locale === 'en' ? 'Data restored!' : 'Data berhasil dipulihkan!')
      } catch (err) {
        alert(settings.locale === 'en' ? 'Failed to restore: invalid JSON' : 'Gagal memulihkan: JSON tidak valid')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const title = settings.locale === 'en' ? 'Settings' : 'Pengaturan'
  const intro =
    settings.locale === 'en'
      ? 'Workspace preferences persisted in this browser (localStorage). For enterprise SSO and RBAC, plug in your identity provider.'
      : 'Preferensi kerja disimpan di browser ini (localStorage). Untuk SSO perusahaan dan RBAC, sambungkan ke penyedia identitas Anda.'

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

      <div className="mx-auto max-w-xl space-y-8">
        <form
          className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5"
          onSubmit={onOrgSubmit}
        >
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en' ? 'Organization' : 'Organisasi'}
          </h3>
          <label className="mt-3 flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en' ? 'Display name' : 'Nama tampilan'}
            <input
              className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)]"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-surface)] hover:opacity-90"
          >
            {settings.locale === 'en' ? 'Save' : 'Simpan'}
          </button>
        </form>

        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en' ? 'Language' : 'Bahasa'}
          </h3>
          <div className="mt-3 flex gap-2">
            {(['id', 'en'] as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                className={
                  settings.locale === loc
                    ? 'rounded-lg bg-[var(--color-accent-dim)] px-3 py-1.5 text-sm font-medium text-[var(--color-accent)]'
                    : 'rounded-lg border border-[var(--color-surface-border)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-white/5'
                }
                onClick={() => patchSettings({ locale: loc })}
              >
                {loc === 'id' ? 'Indonesia' : 'English'}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            Scope 2
          </h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en'
              ? 'Per GHG Protocol, disclose both location- and market-based where applicable.'
              : 'Menurut GHG Protocol, ungkapkan basis lokasi dan pasar bila relevan.'}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {(
              [
                ['location', 'Location-based / basis lokasi'],
                ['market', 'Market-based / basis pasar'],
              ] as [Scope2Accounting, string][]
            ).map(([v, label]) => (
              <label
                key={v}
                className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-fg)]"
              >
                <input
                  type="radio"
                  name="s2"
                  checked={settings.scope2Accounting === v}
                  onChange={() => patchSettings({ scope2Accounting: v })}
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en'
              ? 'Fiscal year start (month)'
              : 'Awal tahun fiskal (bulan)'}
          </h3>
          <select
            className="mt-3 w-full rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)]"
            value={fiscalMonth}
            onChange={(e) => {
              const n = Number(e.target.value)
              setFiscalMonth(e.target.value)
              patchSettings({ fiscalYearStartMonth: n })
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en'
              ? 'Used for reporting labels in exports and future period roll-ups.'
              : 'Digunakan untuk label ekspor dan agregasi periode mendatang.'}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-fg)]">
            {settings.locale === 'en' ? 'Backup & Restore' : 'Cadangan & Pemulihan'}
          </h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en'
              ? 'Save your data to a file or restore from a backup. This is useful for moving data between browsers.'
              : 'Simpan data ke file atau pulihkan dari cadangan. Ini berguna untuk memindahkan data antar browser.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg border border-[var(--color-surface-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg)] hover:bg-white/5"
              onClick={exportJson}
            >
              {settings.locale === 'en' ? 'Export JSON' : 'Ekspor JSON'}
            </button>
            <label className="relative flex cursor-pointer items-center rounded-lg bg-[var(--color-accent-dim)] px-4 py-2 text-sm font-medium text-[var(--color-accent)] hover:opacity-90">
              {settings.locale === 'en' ? 'Import JSON' : 'Impor JSON'}
              <input
                type="file"
                accept=".json"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={importJson}
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
          <h3 className="text-sm font-semibold text-rose-200">
            {settings.locale === 'en' ? 'Danger zone' : 'Zona bahaya'}
          </h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {settings.locale === 'en'
              ? 'Restore demo seed data. Your local changes will be replaced.'
              : 'Pulihkan data demo. Perubahan lokal akan diganti.'}
          </p>
          <button
            type="button"
            className="mt-3 rounded-lg border border-rose-500/50 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/10"
            onClick={() => {
              if (
                window.confirm(
                  settings.locale === 'en'
                    ? 'Reset all demo data in this browser?'
                    : 'Setel ulang semua data demo di browser ini?',
                )
              ) {
                resetDemo()
              }
            }}
          >
            {settings.locale === 'en' ? 'Reset demo data' : 'Setel ulang data demo'}
          </button>
        </section>
      </div>
    </main>
  )
}
