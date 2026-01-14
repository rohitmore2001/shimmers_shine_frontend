import { useEffect, useState } from 'react'
import { adminApiClient } from '../../services/adminApiClient'

type OrderStatus = 'created' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

type OrderCustomer = {
  id: string | null
  name: string
  email: string
  phone?: string
}

type Delivery = {
  fullName?: string
  phone?: string
  addressLine?: string
  city?: string
  pincode?: string
} | null

type AdminOrder = {
  orderId: string
  customer: OrderCustomer | null
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  discountAmount: number
  total: number
  couponCode: string | null
  currency: string
  delivery?: Delivery
  createdAt: string
}

export default function AdminOrdersPage() {
  const [items, setItems] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminApiClient.get<AdminOrder[]>('/api/admin/orders')
      setItems(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function update(orderId: string, patch: Partial<Pick<AdminOrder, 'orderStatus' | 'paymentStatus'>>) {
    await adminApiClient.put(`/api/admin/orders/${orderId}`, patch)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="font-display text-2xl tracking-wide">Orders</div>
        <div className="mt-2 text-sm text-brand-700">Track and update order + payment status.</div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="text-sm font-semibold">All orders</div>
        {error ? <div className="mt-3 text-sm text-red-700">{error}</div> : null}
        {loading ? (
          <div className="mt-3 text-sm text-brand-700">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-3 text-sm text-brand-700">No orders yet.</div>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-brand-700">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Delivery</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Coupon</th>
                  <th className="py-2">Order Status</th>
                  <th className="py-2">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.orderId} className="border-t border-brand-100">
                    <td className="py-2 font-mono text-xs">{o.orderId}</td>
                    <td className="py-2 text-xs">
                      {o.customer ? (
                        <div>
                          <div className="font-semibold text-brand-900">{o.customer.name || '—'}</div>
                          <div className="text-brand-700">{o.customer.email || '—'}</div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 text-xs text-brand-700">
                      {o.delivery ? (
                        <div>
                          <div className="font-semibold text-brand-900">{o.delivery.fullName || '—'}</div>
                          <div>
                            {o.delivery.addressLine || '—'}
                            {o.delivery.city ? `, ${o.delivery.city}` : ''}
                            {o.delivery.pincode ? ` - ${o.delivery.pincode}` : ''}
                          </div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 text-xs text-brand-700">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="py-2">
                      {o.total} {o.currency}
                    </td>
                    <td className="py-2 text-xs">{o.couponCode || '—'}</td>
                    <td className="py-2">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => void update(o.orderId, { orderStatus: e.target.value as OrderStatus })}
                        className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
                      >
                        {['created', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <select
                        value={o.paymentStatus}
                        onChange={(e) => void update(o.orderId, { paymentStatus: e.target.value as PaymentStatus })}
                        className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
                      >
                        {['pending', 'paid', 'failed', 'refunded'].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
