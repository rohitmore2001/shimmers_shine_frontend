import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { login } from '../features/auth/authSlice'
import { selectProducts } from '../features/catalog/selectors'
import { apiClient } from '../services/apiClient'
import { formatMoney } from '../utils/money'

type Delivery = {
  fullName?: string
  phone?: string
  addressLine?: string
  city?: string
  pincode?: string
} | null

type Order = {
  orderId: string
  orderStatus: string
  paymentStatus: string
  subtotal: number
  discountAmount: number
  total: number
  couponCode: string | null
  currency: string
  lines: Array<{ productId: string; quantity: number }>
  delivery?: Delivery
  createdAt: string
}

export default function MyOrdersPage() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((s) => s.auth)
  const products = useAppSelector(selectProducts)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [items, setItems] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get<Order[]>('/api/orders/me')
      setItems(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auth.status !== 'authenticated') return
    void load()
  }, [auth.status])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    await dispatch(login({ email, password }))
  }

  if (auth.status !== 'authenticated') {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
            <div className="font-display text-2xl tracking-wide">My Orders</div>
            <div className="mt-2 text-sm text-brand-700">Login to view your past orders and delivery details.</div>
          </div>

          <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
            <div className="font-display text-lg">Login</div>
            <div className="mt-1 text-sm text-brand-700">Use the same customer login used at checkout.</div>

            <form onSubmit={handleLogin} className="mt-5 space-y-3">
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
          <div className="font-display text-lg">Tip</div>
          <div className="mt-3 text-sm text-brand-700">
            If you placed orders earlier with a different email, login using that same email.
          </div>
          <Link
            to="/products"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-brand-900 transition hover:bg-white"
          >
            BROWSE PRODUCTS
          </Link>
        </aside>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-display text-2xl tracking-wide">My Orders</div>
            <div className="mt-1 text-sm text-brand-700">
              {auth.user?.email ? `Signed in as ${auth.user.email}.` : 'Your recent orders.'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex w-fit rounded-full border border-brand-200 bg-brand-50 px-5 py-2 text-xs font-semibold tracking-[0.18em] text-brand-900 transition hover:bg-white"
            disabled={loading}
          >
            REFRESH
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="text-sm font-semibold">All orders</div>
        {error ? <div className="mt-3 text-sm text-red-700">{error}</div> : null}
        {loading ? (
          <div className="mt-3 text-sm text-brand-700">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-sm text-brand-700">
            No orders yet. When you place an order at checkout, it will appear here.
            <div className="mt-4">
              <Link
                to="/products"
                className="inline-flex rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
              >
                SHOP NOW
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {items.map((o) => (
              <div key={o.orderId} className="rounded-2xl border border-brand-200 bg-white p-5 shadow-soft">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-mono text-xs text-brand-700">{o.orderId}</div>
                    <div className="mt-1 text-sm">
                      <span className="font-semibold text-brand-900">Order:</span> {o.orderStatus} •{' '}
                      <span className="font-semibold text-brand-900">Payment:</span> {o.paymentStatus}
                    </div>
                    <div className="mt-1 text-xs text-brand-700">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatMoney(o.total, o.currency)}
                    {o.couponCode ? <span className="ml-2 text-xs text-brand-700">({o.couponCode})</span> : null}
                  </div>
                </div>

                {o.delivery ? (
                  <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
                    <div className="text-xs font-semibold tracking-[0.16em] text-brand-700">DELIVERY</div>
                    <div className="mt-2">
                      <div className="font-semibold text-brand-900">{o.delivery.fullName || '—'}</div>
                      <div className="text-brand-800/80">{o.delivery.phone || '—'}</div>
                      <div className="mt-1 text-brand-800/80">
                        {o.delivery.addressLine || '—'}
                        {o.delivery.city ? `, ${o.delivery.city}` : ''}
                        {o.delivery.pincode ? ` - ${o.delivery.pincode}` : ''}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4">
                  <div className="text-xs font-semibold tracking-[0.16em] text-brand-700">ITEMS</div>
                  <div className="mt-3 space-y-2">
                    {o.lines.map((l) => {
                      const p = productById.get(l.productId)
                      return (
                        <div key={`${o.orderId}-${l.productId}`} className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-brand-900">{p?.name || l.productId}</div>
                            <div className="text-xs text-brand-700">Qty {l.quantity}</div>
                          </div>
                          <div className="text-xs text-brand-700">{p ? formatMoney(p.price * l.quantity, p.currency) : ''}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
