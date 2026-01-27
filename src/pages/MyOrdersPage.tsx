import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { login } from '../features/auth/authSlice'
import { selectProducts } from '../features/catalog/selectors'
import { 
  getMyOrders, 
  cancelOrder, 
  returnOrder, 
  replaceOrder,
  canCancelOrder, 
  canReturnOrder, 
  canReplaceOrder,
  getOrderStatusColor, 
  getOrderStatusLabel,
  type Order 
} from '../services/orderService'
import { formatMoney } from '../utils/money'
import ReturnOrderModal from '../components/ReturnOrderModal'
import ReplaceOrderModal from '../components/ReplaceOrderModal'
import CancelOrderModal from '../components/CancelOrderModal'


export default function MyOrdersPage() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((s) => s.auth)
  const products = useAppSelector(selectProducts)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [items, setItems] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [replaceModalOpen, setReplaceModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const orders = await getMyOrders()
      setItems(orders)
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

  async function handleCancelOrder(orderId: string, order: Order) {
    setSelectedOrderId(orderId)
    setSelectedOrder(order)
    setCancelModalOpen(true)
  }

  async function confirmCancelOrder() {
    if (!selectedOrderId) return
    
    setActionLoading(selectedOrderId)
    try {
      await cancelOrder(selectedOrderId)
      await load() // Refresh orders
      setCancelModalOpen(false)
      setSelectedOrderId(null)
      setSelectedOrder(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel order'
      setError(msg)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReturnOrder(orderId: string) {
    setSelectedOrderId(orderId)
    setReturnModalOpen(true)
  }

  async function handleReplaceOrder(orderId: string) {
    setSelectedOrderId(orderId)
    setReplaceModalOpen(true)
  }

  async function handleReturnSubmit(reason: string, description: string) {
    if (!selectedOrderId) return
    
    setActionLoading(selectedOrderId)
    try {
      await returnOrder(selectedOrderId, { reason, description })
      await load() // Refresh orders
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit return request'
      setError(msg)
    } finally {
      setActionLoading(null)
      setSelectedOrderId(null)
    }
  }

  async function handleReplaceSubmit(reason: string, description: string) {
    if (!selectedOrderId) return
    
    setActionLoading(selectedOrderId)
    try {
      await replaceOrder(selectedOrderId, { reason, description })
      await load() // Refresh orders
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit replacement request'
      setError(msg)
    } finally {
      setActionLoading(null)
      setSelectedOrderId(null)
    }
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
                  <div className="flex-1">
                    <div className="font-mono text-xs text-brand-700">{o.orderId}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getOrderStatusColor(o.orderStatus)}`}>
                        {getOrderStatusLabel(o.orderStatus)}
                      </span>
                      {o.deliveryStatus && (
                        <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700">
                          Delivery: {o.deliveryStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}
                      <span className="text-sm text-brand-700">
                        Payment: <span className="font-semibold text-brand-900">{o.paymentStatus}</span>
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-brand-700">{new Date(o.createdAt).toLocaleString()}</div>
                    
                    {o.distance && (
                      <div className="mt-2 text-xs text-brand-700">
                        Distance from Navi Mumbai: <span className="font-semibold">{o.distance.kilometers} km</span>
                        {o.distance.kilometers > 20 && (
                          <span className="ml-2 text-orange-600 font-semibold">• Long Distance Delivery</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm font-semibold">
                      {formatMoney(o.total, o.currency)}
                      {o.couponCode ? <span className="ml-2 text-xs text-brand-700">({o.couponCode})</span> : null}
                    </div>
                    
                    <div className="flex gap-2">
                      {canCancelOrder(o.orderStatus) && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(o.orderId, o)}
                          disabled={actionLoading === o.orderId}
                          className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {actionLoading === o.orderId ? 'CANCELLING…' : 'CANCEL'}
                        </button>
                      )}
                      
                      {canReturnOrder(o.orderStatus) && (
                        <button
                          type="button"
                          onClick={() => handleReturnOrder(o.orderId)}
                          disabled={actionLoading === o.orderId}
                          className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
                        >
                          {actionLoading === o.orderId ? 'SUBMITTING…' : 'RETURN'}
                        </button>
                      )}
                      
                      {canReplaceOrder(o.orderStatus) && (
                        <button
                          type="button"
                          onClick={() => handleReplaceOrder(o.orderId)}
                          disabled={actionLoading === o.orderId}
                          className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                        >
                          {actionLoading === o.orderId ? 'SUBMITTING…' : 'REPLACE'}
                        </button>
                      )}
                    </div>
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

                {o.returnRequest ? (
                  <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                    <div className="text-xs font-semibold tracking-[0.16em] text-orange-700">RETURN REQUEST</div>
                    <div className="mt-2">
                      <div className="font-semibold text-orange-900">Reason: {o.returnRequest.reason}</div>
                      {o.returnRequest.description && (
                        <div className="mt-1 text-orange-800/80">{o.returnRequest.description}</div>
                      )}
                      <div className="mt-1 text-xs text-orange-700">
                        Requested: {new Date(o.returnRequest.requestedAt).toLocaleString()}
                      </div>
                      {o.returnRequest.approvedAt && (
                        <div className="mt-1 text-xs text-green-700">
                          Approved: {new Date(o.returnRequest.approvedAt).toLocaleString()}
                        </div>
                      )}
                      {o.returnRequest.rejectedAt && (
                        <div className="mt-1 text-xs text-red-700">
                          Rejected: {new Date(o.returnRequest.rejectedAt).toLocaleString()}
                          {o.returnRequest.rejectionReason && ` - ${o.returnRequest.rejectionReason}`}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {o.replacementRequest ? (
                  <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                    <div className="text-xs font-semibold tracking-[0.16em] text-blue-700">REPLACEMENT REQUEST</div>
                    <div className="mt-2">
                      <div className="font-semibold text-blue-900">Reason: {o.replacementRequest.reason}</div>
                      {o.replacementRequest.description && (
                        <div className="mt-1 text-blue-800/80">{o.replacementRequest.description}</div>
                      )}
                      <div className="mt-1 text-xs text-blue-700">
                        Requested: {new Date(o.replacementRequest.requestedAt).toLocaleString()}
                      </div>
                      {o.replacementRequest.approvedAt && (
                        <div className="mt-1 text-xs text-green-700">
                          Approved: {new Date(o.replacementRequest.approvedAt).toLocaleString()}
                        </div>
                      )}
                      {o.replacementRequest.rejectedAt && (
                        <div className="mt-1 text-xs text-red-700">
                          Rejected: {new Date(o.replacementRequest.rejectedAt).toLocaleString()}
                          {o.replacementRequest.rejectionReason && ` - ${o.replacementRequest.rejectionReason}`}
                        </div>
                      )}
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
      
      <ReturnOrderModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSubmit={handleReturnSubmit}
        loading={actionLoading !== null}
      />
      
      <ReplaceOrderModal
        isOpen={replaceModalOpen}
        onClose={() => setReplaceModalOpen(false)}
        onSubmit={handleReplaceSubmit}
        loading={actionLoading !== null}
      />
      
      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancelOrder}
        loading={actionLoading !== null}
        orderTotal={selectedOrder?.total || 0}
        currency={selectedOrder?.currency || 'INR'}
        cancellationFee={Math.round((selectedOrder?.total || 0) * 0.1)}
      />
    </div>
  )
}
