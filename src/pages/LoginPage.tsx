import { type FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { login } from '../features/auth/authSlice'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const redirect = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (auth.status !== 'authenticated') return

    navigate(redirect, {
      replace: true,
      state: {
        from: location.pathname + location.search,
      },
    })
  }, [auth.status, navigate, redirect, location.pathname, location.search])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    await dispatch(login({ email, password }))
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
          <div className="font-display text-2xl tracking-wide">Login</div>
          <div className="mt-2 text-sm text-brand-700">Login to manage your orders and checkout faster.</div>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
          <form onSubmit={handleLogin} className="space-y-3">
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

            {auth.status === 'failed' && auth.error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{auth.error}</div>
            ) : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
              disabled={auth.status === 'loading'}
            >
              {auth.status === 'loading' ? 'LOGGING IN…' : 'LOGIN'}
            </button>
          </form>
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-brand-200 bg-white p-6 shadow-soft lg:sticky lg:top-24">
        <div className="font-display text-lg">Next</div>
        <div className="mt-3 text-sm text-brand-700">
          After login you’ll be redirected to:
          <div className="mt-1 font-mono text-xs text-brand-900">{redirect}</div>
        </div>

        <Link
          to={redirect}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-brand-900 transition hover:bg-white"
        >
          GO BACK
        </Link>
      </aside>
    </div>
  )
}
