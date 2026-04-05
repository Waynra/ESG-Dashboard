import { useMemo } from 'react'
import { useDashboardActions, useDashboardState } from '../context/DashboardStateContext'

const statusMeta = {
  audit_ready: {
    id: 'Siap audit',
    en: 'Audit-ready',
    className: 'text-emerald-400',
  },
  in_progress: {
    id: 'Berjalan',
    en: 'In progress',
    className: 'text-sky-400',
  },
  gap: {
    id: 'Ada celah',
    en: 'Gap',
    className: 'text-amber-400',
  },
} as const

export function DisclosurePage() {
  const { disclosureWithProgress, state } = useDashboardState()
  const { toggleDisclosureTask } = useDashboardActions()
  const { settings } = state

  const avgProgress = useMemo(() => {
    if (disclosureWithProgress.length === 0) return 0
    return Math.round(
      disclosureWithProgress.reduce((a, i) => a + i.progress, 0) /
        disclosureWithProgress.length,
    )
  }, [disclosureWithProgress])

  const title =
    settings.locale === 'en'
      ? 'Disclosure readiness'
      : 'Kesiapan pengungkapan'
  const subtitle =
    settings.locale === 'en'
      ? 'Task-level evidence tracking for public reporting, investor DD, and regulatory requests. Progress drives the status badge.'
      : 'Pelacakan bukti per tugas untuk pelaporan publik, due diligence investor, dan permintaan regulator. Progres menentukan status.'

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

      <section className="mb-8 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
              {settings.locale === 'en'
                ? 'Aggregate readiness'
                : 'Skor agregat kesiapan'}
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--color-fg)]">
              {avgProgress}%
            </p>
          </div>
          <p className="max-w-md text-sm text-[var(--color-muted)]">
            {settings.locale === 'en'
              ? 'Average of workstream progress; prioritize “Gap” streams before filing.'
              : 'Rata-rata progres workstream; prioritaskan alur berstatus “Ada celah” sebelum pelaporan.'}
          </p>
        </div>
        <div
          className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--color-surface-border)]"
          role="progressbar"
          aria-valuenow={avgProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Disclosure readiness"
        >
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-500"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </section>

      <ul className="space-y-3">
        {disclosureWithProgress.map((item) => {
          const meta = statusMeta[item.status]
          const label = settings.locale === 'en' ? meta.en : meta.id
          return (
            <li
              key={item.id}
              className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--color-fg)]">
                    {item.label}
                  </p>
                  <p className={`mt-1 text-xs font-medium ${meta.className}`}>
                    {label}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-lg font-semibold tabular-nums text-[var(--color-fg)]">
                    {item.progress}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)]/80"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <ul className="mt-4 space-y-2 border-t border-[var(--color-surface-border)] pt-4">
                {item.tasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 rounded border-[var(--color-surface-border)]"
                      checked={task.done}
                      onChange={() =>
                        toggleDisclosureTask(item.id, task.id)
                      }
                      aria-label={task.label}
                    />
                    <span
                      className={
                        task.done
                          ? 'text-sm text-[var(--color-muted)] line-through'
                          : 'text-sm text-[var(--color-fg)]'
                      }
                    >
                      {task.label}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
