import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getExpectedCredentials } from '../config/authCredentials'

export type AuthUser = {
  email: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (email: string, password: string, remember: boolean) => boolean
  logout: () => void
}

const SESSION_KEY = 'esg-pulse-session-v1'

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession(): AuthUser | null {
  try {
    const raw =
      localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { email?: string }
    if (typeof data.email === 'string' && data.email.length > 0) {
      return { email: data.email }
    }
  } catch {
    /* ignore */
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredSession())

  const login = useCallback(
    (email: string, password: string, remember: boolean) => {
      const trimmedEmail = email.trim().toLowerCase()
      const trimmedPass = password.trim()
      const { email: expectedEmail, password: expectedPassword } =
        getExpectedCredentials()
      const ok =
        trimmedEmail === expectedEmail.trim().toLowerCase() &&
        trimmedPass === expectedPassword
      if (!ok) return false

      const next: AuthUser = { email: trimmedEmail }
      setUser(next)
      const payload = JSON.stringify({ email: next.email })
      try {
        sessionStorage.removeItem(SESSION_KEY)
        localStorage.removeItem(SESSION_KEY)
        if (remember) localStorage.setItem(SESSION_KEY, payload)
        else sessionStorage.setItem(SESSION_KEY, payload)
      } catch {
        /* quota */
      }
      return true
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    try {
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
