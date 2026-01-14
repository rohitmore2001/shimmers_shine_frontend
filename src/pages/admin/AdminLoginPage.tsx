import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin, getAdminUserFromStorage } from '../../services/adminAuthService'
import { getAdminToken } from '../../services/adminApiClient'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getAdminToken()
    const user = getAdminUserFromStorage()
    if (token && user) navigate('/admin')
  }, [navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await adminLogin({ email, password })
      navigate('/admin')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <div className="rounded-3xl border border-brand-200 bg-white p-8 shadow-soft">
        <div className="font-display text-2xl tracking-wide">Admin Login</div>
        <div className="mt-2 text-sm text-brand-700">Sign in to manage products, categories and coupons.</div>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block">
            <div className="text-xs font-semibold tracking-wide text-brand-800">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </label>

          <label className="block">
            <div className="text-xs font-semibold tracking-wide text-brand-800">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={[
              'inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition',
              loading ? 'cursor-not-allowed bg-brand-400' : 'bg-brand-900 hover:bg-black',
            ].join(' ')}
          >
            {loading ? 'LOGGING IN…' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  )
}
