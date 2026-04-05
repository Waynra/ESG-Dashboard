import { type FormEvent, useState } from 'react'
import { flushSync } from 'react-dom'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getExpectedCredentials } from '../config/authCredentials'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const raw = (location.state as { from?: string } | null)?.from
  const from =
    raw && raw !== '/login' && raw.startsWith('/') ? raw : '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState(false)

  const demo = getExpectedCredentials()

  if (user) {
    return <Navigate to="/" replace />
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(false)
    let ok = false
    flushSync(() => {
      ok = login(email, password, remember)
    })
    if (ok) navigate(from, { replace: true })
    else setError(true)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-md">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          SaaS / ESG Tech
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight text-[var(--color-fg)]">
          ESG Pulse
        </h1>
        <p className="mt-1 text-center text-sm text-[var(--color-muted)]">
          Masuk ke konsol keberlanjutan
        </p>

        <form
          className="mt-8 space-y-4 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-6"
          onSubmit={onSubmit}
        >
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-[var(--color-muted)]"
            >
              Email
            </label>
            <input
              id="login-email"
              type="text"
              inputMode="email"
              autoComplete="username"
              required
              className="mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-fg)] outline-none ring-[var(--color-accent)] focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-[var(--color-muted)]"
            >
              Kata sandi
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-fg)] outline-none ring-[var(--color-accent)] focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-fg)]">
            <input
              type="checkbox"
              className="size-4 rounded border-[var(--color-surface-border)]"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Ingat saya di perangkat ini
          </label>

          {error ? (
            <p className="text-sm text-rose-400" role="alert">
              Email atau kata sandi tidak sesuai.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[var(--color-surface)] hover:opacity-90"
          >
            Masuk
          </button>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-[var(--color-muted)]">
          Demo (tanpa server):{' '}
          <span className="font-mono text-[var(--color-fg)]">{demo.email}</span>
          {' · '}
          <span className="font-mono text-[var(--color-fg)]">
            {demo.password}
          </span>
        </p>
        <p className="mt-2 text-center text-[11px] text-[var(--color-muted)]">
          Ubah lewat file <code className="text-[var(--color-fg)]">.env</code>{' '}
          — variabel{' '}
          <code className="text-[var(--color-fg)]">VITE_AUTH_EMAIL</code> dan{' '}
          <code className="text-[var(--color-fg)]">VITE_AUTH_PASSWORD</code>
        </p>
      </div>
    </div>
  )
}
