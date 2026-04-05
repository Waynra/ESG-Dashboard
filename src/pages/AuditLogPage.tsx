import { useDashboardState } from '../context/DashboardStateContext'

export function AuditLogPage() {
  const { state } = useDashboardState()
  const { activityLog, settings } = state

  const title =
    settings.locale === 'en' ? 'Activity log' : 'Log aktivitas'
  const subtitle =
    settings.locale === 'en'
      ? 'Immutable-style trail of configuration and data changes (client-side). In production, stream to your SIEM or audit store.'
      : 'Jejak perubahan konfigurasi dan data (sisi klien). Untuk produksi, arahkan ke SIEM atau penyimpanan audit.'

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

      <div className="overflow-x-auto rounded-xl border border-[var(--color-surface-border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-4 py-3 font-medium">
                {settings.locale === 'en' ? 'Timestamp (UTC)' : 'Stempel waktu (UTC)'}
              </th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-surface-border)] bg-[var(--color-surface)]">
            {activityLog.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-[var(--color-muted)]"
                >
                  {settings.locale === 'en' ? 'No events yet.' : 'Belum ada peristiwa.'}
                </td>
              </tr>
            ) : (
              activityLog.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-[var(--color-muted)]">
                    {row.at}
                  </td>
                  <td className="px-4 py-2 text-[var(--color-accent)]">{row.action}</td>
                  <td className="max-w-md truncate px-4 py-2 text-[var(--color-fg)]">
                    {row.detail}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
