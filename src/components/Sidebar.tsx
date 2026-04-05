import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDashboardState } from '../context/DashboardStateContext'
import { navLabels } from '../strings/ui'

export function Sidebar() {
  const { user, logout } = useAuth()
  const { state } = useDashboardState()
  const n = navLabels(state.settings.locale)

  const nav = [
    { to: '/', label: n.overview, end: true },
    { to: '/emisi', label: n.emissions },
    { to: '/fasilitas', label: n.facilities },
    { to: '/target', label: n.targets },
    { to: '/pengungkapan', label: n.disclosure },
    { to: '/csrd', label: n.csrd },
    { to: '/erp', label: n.erp },
    { to: '/audit', label: n.audit },
    { to: '/pengaturan', label: n.settings },
  ]

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--color-surface-border)] bg-[var(--color-surface-raised)]">
      <div className="border-b border-[var(--color-surface-border)] px-5 py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          SaaS / ESG Tech
        </p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight text-[var(--color-fg)]">
          ESG Pulse
        </h1>
      </div>
      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3"
        aria-label="Main navigation"
      >
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:bg-white/5 hover:text-[var(--color-fg)]',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[var(--color-surface-border)] p-4">
        <p className="text-xs text-[var(--color-muted)]">
          {state.settings.locale === 'en' ? 'Signed in' : 'Masuk sebagai'}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-[var(--color-fg)]">
          {user?.email}
        </p>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          {state.settings.locale === 'en' ? 'Organization' : 'Organisasi'}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-[var(--color-fg)]">
          {state.settings.organizationName}
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded-lg border border-[var(--color-surface-border)] py-2 text-xs font-medium text-[var(--color-muted)] hover:bg-white/5 hover:text-[var(--color-fg)]"
          onClick={logout}
        >
          {state.settings.locale === 'en' ? 'Sign out' : 'Keluar'}
        </button>
      </div>
    </aside>
  )
}
