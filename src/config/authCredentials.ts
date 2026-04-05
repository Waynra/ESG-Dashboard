/**
 * Kredensial demo (tanpa backend).
 * Override lewat .env: VITE_AUTH_EMAIL dan VITE_AUTH_PASSWORD
 */
export function getExpectedCredentials() {
  const fromEnv = (key: string) => {
    const v = import.meta.env[key] as string | undefined
    if (v == null || String(v).trim() === '') return undefined
    return String(v).trim()
  }

  return {
    email: fromEnv('VITE_AUTH_EMAIL') ?? 'admin@esg-pulse.local',
    password: fromEnv('VITE_AUTH_PASSWORD') ?? 'esgpulse2026',
  }
}
