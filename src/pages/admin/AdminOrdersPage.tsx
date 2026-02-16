import { useEffect, useState } from 'react'
import { adminApiClient } from '../../services/adminApiClient'
import Modal from '../../components/Modal'
import { Trash2 } from 'lucide-react'

type OrderStatus = 'created' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested' | 'return_approved' | 'return_rejected' | 'returned' | 'replacement_requested' | 'replacement_approved' | 'replacement_rejected' | 'replaced'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
type DeliveryStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'failed'

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

type OrderLine = {
  productId: string
  productName?: string
  quantity: number
}

type AdminOrder = {
  orderId: string
  customer: OrderCustomer | null
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  deliveryStatus: DeliveryStatus
  subtotal: number
  discountAmount: number
  total: number
  couponCode: string | null
  currency: string
  lines?: OrderLine[]
  delivery?: Delivery
  returnRequest?: {
    reason: string
    description?: string
    requestedAt: string
    approvedAt?: string
    rejectedAt?: string
    rejectionReason?: string
  }
  replacementRequest?: {
    reason: string
    description?: string
    requestedAt: string
    approvedAt?: string
    rejectedAt?: string
    rejectionReason?: string
  }
  createdAt: string
}

export default function AdminOrdersPage() {
  const [items, setItems] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminOrder | null>(null)

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

  async function update(orderId: string, patch: Partial<Pick<AdminOrder, 'orderStatus' | 'paymentStatus' | 'deliveryStatus'>>) {
    await adminApiClient.put(`/api/admin/orders/${orderId}`, patch)
    await load()
  }

  async function handleReturnAction(orderId: string, action: 'approve' | 'reject', rejectionReason?: string) {
    await adminApiClient.put(`/api/admin/orders/${orderId}/return`, { action, rejectionReason })
    await load()
  }

  async function handleReplacementAction(orderId: string, action: 'approve' | 'reject', rejectionReason?: string) {
    await adminApiClient.put(`/api/admin/orders/${orderId}/replace`, { action, rejectionReason })
    await load()
  }

  function openDelete(o: AdminOrder) {
    setDeleting(o)
    setDeleteOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    await adminApiClient.delete(`/api/admin/orders/${deleting.orderId}`)
    setDeleteOpen(false)
    setDeleting(null)
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
          <div className="mt-4 overflow-auto rounded-2xl border border-brand-100">
            <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-white text-xs text-brand-700">
                  <th className="w-[150px] px-3 py-3">Order</th>
                  <th className="w-[260px] px-3 py-3">Items</th>
                  <th className="w-[220px] px-3 py-3">Customer</th>
                  <th className="w-[260px] px-3 py-3">Delivery</th>
                  <th className="w-[150px] px-3 py-3">Created</th>
                  <th className="w-[120px] px-3 py-3">Total</th>
                  <th className="w-[110px] px-3 py-3">Coupon</th>
                  <th className="w-[170px] px-3 py-3">Order Status</th>
                  <th className="w-[170px] px-3 py-3">Delivery Status</th>
                  <th className="w-[150px] px-3 py-3">Payment</th>
                  <th className="w-[120px] px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.orderId} className="border-t border-brand-100 align-top">
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="font-mono text-[11px] text-brand-700">{o.orderId}</div>
                        <div className="text-[11px] text-brand-600">
                          {o.discountAmount > 0 ? `Discount: ${o.discountAmount}` : 'No discount'}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-xs text-brand-700">
                      {o.lines && o.lines.length > 0 ? (
                        <div className="space-y-1">
                          {o.lines.slice(0, 4).map((l) => (
                            <div key={`${o.orderId}-${l.productId}`} className="leading-snug">
                              <div className="text-brand-900">
                                {l.productName || '—'}
                                <span className="ml-1 font-mono text-[11px] text-brand-600">×{l.quantity}</span>
                              </div>
                            </div>
                          ))}
                          {o.lines.length > 4 ? <div className="text-[11px] text-brand-600">+{o.lines.length - 4} more</div> : null}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-3 py-3 text-xs">
                      {o.customer ? (
                        <div>
                          <div className="font-semibold text-brand-900">{o.customer.name || '—'}</div>
                          <div className="text-brand-700">{o.customer.email || '—'}</div>
                          {o.customer.phone ? <div className="text-[11px] text-brand-600">{o.customer.phone}</div> : null}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-3 py-3 text-xs text-brand-700">
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

                    <td className="px-3 py-3 text-xs text-brand-700">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
                    <td className="px-3 py-3 font-semibold">
                      {Number.isFinite(o.total) ? o.total : 0} {o.currency || 'INR'}
                    </td>
                    <td className="px-3 py-3 text-xs">{o.couponCode || '—'}</td>
                    <td className="px-3 py-3">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => void update(o.orderId, { orderStatus: e.target.value as OrderStatus })}
                        className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
                      >
                        {['created', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_requested', 'return_approved', 'return_rejected', 'returned', 'replacement_requested', 'replacement_approved', 'replacement_rejected', 'replaced'].map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <select
                        value={o.deliveryStatus}
                        onChange={(e) => void update(o.orderId, { deliveryStatus: e.target.value as DeliveryStatus })}
                        className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
                      >
                        {['pending', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'failed'].map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        {o.orderStatus === 'return_requested' && (
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => handleReturnAction(o.orderId, 'approve')}
                              className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-200"
                            >
                              Approve Return
                            </button>
                            <button
                              onClick={() => handleReturnAction(o.orderId, 'reject')}
                              className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                            >
                              Reject Return
                            </button>
                          </div>
                        )}
                        {o.orderStatus === 'replacement_requested' && (
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => handleReplacementAction(o.orderId, 'approve')}
                              className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                            >
                              Approve Replace
                            </button>
                            <button
                              onClick={() => handleReplacementAction(o.orderId, 'reject')}
                              className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                            >
                              Reject Replace
                            </button>
                          </div>
                        )}
                        {['created', 'confirmed'].includes(o.orderStatus) && (
                          <button
                            onClick={() => update(o.orderId, { orderStatus: 'cancelled' })}
                            className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openDelete(o)}
                          title="Delete"
                          aria-label="Delete"
                          className="rounded-full border border-brand-200 bg-brand-50 p-2 text-brand-900 transition hover:bg-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={deleteOpen} title="Delete order" onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <div className="text-sm text-brand-800">
            Are you sure you want to delete order <span className="font-mono">{deleting?.orderId}</span>?
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setDeleteOpen(false)
                setDeleting(null)
              }}
              className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-5 py-2 text-xs font-semibold tracking-[0.18em] text-brand-900 transition hover:bg-white"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              className="inline-flex rounded-full bg-red-700 px-5 py-2 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-red-800"
            >
              DELETE
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
