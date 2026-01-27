import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Gift, X, CreditCard, Smartphone, RefreshCw } from 'lucide-react'
import { formatMoney } from '../utils/money'
import { apiClient } from '../services/apiClient'

declare global {
    interface Window {
        Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
    }
}

type PaymentMethod = 'upi' | 'cod'
type DeliveryMethod = 'standard' | 'fastest'

type AvailableCoupon = {
    code: string
    label: string
    description: string
}

export default function PaymentModal({
    open,
    onClose,
    onSuccess,
    total,
    currency,
    lines,
    delivery,
}: {
    open: boolean
    onClose: () => void
    onSuccess: (order: { orderId: string }) => void
    total: number
    currency: string
    lines: Array<{ productId: string; quantity: number }>
    delivery: { fullName: string; phone: string; addressLine: string; city: string; pincode: string }
}) {
    const prefersReducedMotion = useReducedMotion()
    const [method, setMethod] = useState<PaymentMethod>('upi')
    const [codConfirmed, setCodConfirmed] = useState(false)
    const [coupon, setCoupon] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [couponMessage, setCouponMessage] = useState<string | null>(null)
    const [couponError, setCouponError] = useState<string | null>(null)
    const [couponsOpen, setCouponsOpen] = useState(false)
    const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([])
    const [couponsLoading, setCouponsLoading] = useState(false)
    const [couponsLoadError, setCouponsLoadError] = useState<string | null>(null)
    const couponsBoxRef = useRef<HTMLDivElement | null>(null)
    const [placing, setPlacing] = useState(false)
    const [placeError, setPlaceError] = useState<string | null>(null)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard')

    useEffect(() => {
        if (!open) {
            setShowCancelConfirm(false)
            return
        }

        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                if (showCancelConfirm) {
                    setShowCancelConfirm(false)
                } else {
                    setShowCancelConfirm(true)
                }
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = prevOverflow
        }
    }, [open, onClose, showCancelConfirm])

    useEffect(() => {
        if (!couponsOpen) return

        function onDocMouseDown(e: MouseEvent) {
            const t = e.target as Node | null
            if (!t) return
            if (couponsBoxRef.current && !couponsBoxRef.current.contains(t)) {
                setCouponsOpen(false)
            }
        }

        document.addEventListener('mousedown', onDocMouseDown)
        return () => document.removeEventListener('mousedown', onDocMouseDown)
    }, [couponsOpen])

    async function loadAvailableCoupons() {
        setCouponsLoading(true)
        setCouponsLoadError(null)
        try {
            const { data } = await apiClient.get<AvailableCoupon[]>('/api/coupons')
            setAvailableCoupons(Array.isArray(data) ? data : [])
        } catch (_err) {
            setCouponsLoadError('Failed to load coupons')
            setAvailableCoupons([])
        } finally {
            setCouponsLoading(false)
        }
    }

    async function handleApplyCoupon() {
        const code = coupon.trim().toUpperCase()
        if (!code) {
            setAppliedCoupon(null)
            setDiscountAmount(0)
            setCouponMessage(null)
            setCouponError(null)
            return
        }

        setCouponMessage(null)
        setCouponError(null)

        try {
            const { data } = await apiClient.post<
                { valid: true; code: string; label: string; discountAmount: number } | { valid: false; message?: string }
            >('/api/coupons/validate', { code, subtotal: total })

            if (!data.valid) {
                setAppliedCoupon(null)
                setDiscountAmount(0)
                setCouponError(data.message || 'Invalid coupon code')
                return
            }

            setAppliedCoupon(data.code)
            setDiscountAmount(Number(data.discountAmount || 0))
            setCouponMessage(data.label || 'Coupon applied')
        } catch (_err) {
            setAppliedCoupon(null)
            setDiscountAmount(0)
            setCouponError('Failed to apply coupon')
        }
    }

    const discountedTotal = Math.max(0, total - discountAmount)
    const deliveryCharge = deliveryMethod === 'fastest' ? 80 : 0
    const finalTotal = discountedTotal + deliveryCharge

    const canProceed = (method === 'upi' ? true : codConfirmed) && !placing

    async function loadRazorpay() {
        if (typeof window === 'undefined') return false
        if (window.Razorpay) return true

        await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.async = true
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load Razorpay'))
            document.body.appendChild(script)
        })

        return Boolean(window.Razorpay)
    }

    const portalTarget = useMemo(() => {
        if (typeof document === 'undefined') return null
        return document.body
    }, [])

    const modalTree = (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60"
                        onClick={() => setShowCancelConfirm(true)}
                    />
                    <motion.div
                        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
                        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="
  w-full max-h-[90vh] max-w-lg overflow-auto rounded-3xl border border-brand-200 bg-white shadow-2xl

  scrollbar-thin
  scrollbar-track-transparent
  scrollbar-thumb-[#00000020]
  hover:scrollbar-thumb-[#00000040]
  scrollbar-thumb-rounded-full
  transition-colors duration-300
">

                            <div className="relative border-b border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelConfirm(true)}
                                    className="absolute right-4 top-4 rounded-full p-2 text-brand-700 transition hover:bg-brand-100"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="flex items-start gap-3">
                                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-900 text-white shadow-soft">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-display text-2xl tracking-wide">Complete Payment</div>
                                        <div className="mt-1 text-sm text-brand-700">Choose a method, apply offers, and confirm.</div>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-brand-200 bg-white/70 p-4 backdrop-blur">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-semibold tracking-[0.16em] text-brand-700">PAYABLE</div>
                                        <div className="text-lg font-semibold text-brand-900">{formatMoney(finalTotal, currency)}</div>
                                    </div>
                                    {discountAmount > 0 ? (
                                        <div className="mt-1 text-xs text-green-700">
                                            Saved {formatMoney(total - discountedTotal, currency)} with {appliedCoupon}
                                        </div>
                                    ) : (
                                        <div className="mt-1 text-xs text-brand-700">Use a coupon to unlock savings.</div>
                                    )}
                                    {deliveryCharge > 0 && (
                                        <div className="mt-1 text-xs text-orange-700">
                                            +{formatMoney(deliveryCharge, currency)} for fastest delivery
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Payment Methods */}
                                <div className="space-y-3">
                                    <label className="block cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="upi"
                                            checked={method === 'upi'}
                                            onChange={() => {
                                                setMethod('upi')
                                                setCodConfirmed(false)
                                            }}
                                            className="sr-only"
                                        />
                                        <div
                                            className={[
                                                'flex items-center gap-3 rounded-2xl border p-4 transition',
                                                method === 'upi'
                                                    ? 'border-brand-300 bg-brand-50'
                                                    : 'border-brand-200 bg-white hover:bg-brand-50',
                                            ].join(' ')}
                                        >
                                            <Smartphone className="h-5 w-5 text-brand-900" />
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold">UPI</div>
                                                <div className="text-xs text-brand-700">Pay via any UPI app</div>
                                            </div>
                                            {method === 'upi' && <CheckCircle2 className="h-5 w-5 text-brand-900" />}
                                        </div>
                                    </label>

                                    <label className="block cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={method === 'cod'}
                                            onChange={() => setMethod('cod')}
                                            className="sr-only"
                                        />
                                        <div
                                            className={[
                                                'flex items-center gap-3 rounded-2xl border p-4 transition',
                                                method === 'cod'
                                                    ? 'border-brand-300 bg-brand-50'
                                                    : 'border-brand-200 bg-white hover:bg-brand-50',
                                            ].join(' ')}
                                        >
                                            <CreditCard className="h-5 w-5 text-brand-900" />
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold">Cash on Delivery</div>
                                                <div className="text-xs text-brand-700">Pay when you receive</div>
                                            </div>
                                            {method === 'cod' && <CheckCircle2 className="h-5 w-5 text-brand-900" />}
                                        </div>
                                    </label>
                                </div>

                                {method === 'upi' ? (
                                    <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
                                        <div className="text-sm font-semibold text-brand-900">UPI Payment</div>
                                        <div className="mt-1 text-xs text-brand-700">
                                            You'll be redirected to Razorpay's secure payment gateway. All UPI apps (GPay, PhonePe, Paytm, etc.) are supported.
                                        </div>
                                        <div className="mt-3 rounded-2xl border border-brand-200 bg-white p-3 text-xs text-brand-700">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="h-4 w-4 text-brand-900" />
                                                <span>Fast and secure payment via any UPI app</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
                                        <div className="text-sm font-semibold text-brand-900">Cash on Delivery</div>
                                        <div className="mt-1 text-xs text-brand-700">
                                            Pay in cash when your order arrives. Availability depends on location and order value.
                                        </div>
                                        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-200 bg-white p-3">
                                            <input
                                                type="checkbox"
                                                checked={codConfirmed}
                                                onChange={(e) => setCodConfirmed(e.target.checked)}
                                                className="mt-1 h-4 w-4"
                                            />
                                            <div>
                                                <div className="text-sm font-semibold text-brand-900">Confirm COD</div>
                                                <div className="mt-1 text-xs text-brand-700">
                                                    I understand I will pay {formatMoney(finalTotal, currency)} on delivery.
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                )}

                                {/* Delivery Options */}
                                <div className="mt-6 space-y-3">
                                    <div className="text-sm font-semibold text-brand-900">Delivery Options</div>
                                    <label className="block cursor-pointer">
                                        <input
                                            type="radio"
                                            name="delivery"
                                            value="standard"
                                            checked={deliveryMethod === 'standard'}
                                            onChange={() => setDeliveryMethod('standard')}
                                            className="sr-only"
                                        />
                                        <div
                                            className={[
                                                'flex items-center gap-3 rounded-2xl border p-4 transition',
                                                deliveryMethod === 'standard'
                                                    ? 'border-brand-300 bg-brand-50'
                                                    : 'border-brand-200 bg-white hover:bg-brand-50',
                                            ].join(' ')}
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold">Standard Delivery</div>
                                                <div className="text-xs text-brand-700">within 4-7 days</div>
                                            </div>
                                            <div className="text-sm font-semibold text-green-700">Free</div>
                                            {deliveryMethod === 'standard' && <CheckCircle2 className="h-5 w-5 text-brand-900" />}
                                        </div>
                                    </label>

                                    <label className="block cursor-pointer">
                                        <input
                                            type="radio"
                                            name="delivery"
                                            value="fastest"
                                            checked={deliveryMethod === 'fastest'}
                                            onChange={() => setDeliveryMethod('fastest')}
                                            className="sr-only"
                                        />
                                        <div
                                            className={[
                                                'flex items-center gap-3 rounded-2xl border p-4 transition',
                                                deliveryMethod === 'fastest'
                                                    ? 'border-brand-300 bg-brand-50'
                                                    : 'border-brand-200 bg-white hover:bg-brand-50',
                                            ].join(' ')}
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold">Fastest Delivery</div>
                                                <div className="text-xs text-brand-700">within 2-3 days</div>
                                            </div>
                                            <div className="text-sm font-semibold text-orange-700">+{formatMoney(80, currency)}</div>
                                            {deliveryMethod === 'fastest' && <CheckCircle2 className="h-5 w-5 text-brand-900" />}
                                        </div>
                                    </label>
                                </div>

                                {/* Coupon */}
                                <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-brand-900">
                                            <Gift className="h-4 w-4" />
                                            Offers / Coupon
                                        </div>
                                        <button
                                            type="button"
                                            onClick={loadAvailableCoupons}
                                            disabled={couponsLoading}
                                            className="rounded-full p-1.5 text-brand-600 transition hover:bg-brand-200 hover:text-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Fetch latest coupons"
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 ${couponsLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                    <div className="mt-3" ref={couponsBoxRef}>
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={coupon}
                                                onChange={(e) => setCoupon(e.target.value)}
                                                placeholder="Enter code"
                                                className="flex-1 rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 uppercase"
                                            />

                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const next = !couponsOpen
                                                    setCouponsOpen(next)
                                                    if (next && availableCoupons.length === 0 && !couponsLoading) {
                                                        await loadAvailableCoupons()
                                                    }
                                                }}
                                                className="rounded-xl border border-brand-200 bg-white px-3 py-2 text-xs font-semibold tracking-[0.14em] text-brand-900 transition hover:bg-brand-100 shrink-0"
                                            >
                                                {couponsOpen ? 'HIDE' : 'COUPONS'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                className="rounded-xl bg-brand-900 px-3 py-2 text-xs font-semibold tracking-[0.14em] text-white transition hover:bg-black shrink-0"
                                            >
                                                APPLY
                                            </button>
                                        </div>

                                        {couponsOpen ? (
                                            <div className="mt-2 rounded-2xl border border-brand-200 bg-white shadow-soft">
                                                <div className="max-h-[150px] overflow-auto p-2">
                                                    {couponsLoading ? (
                                                        <div className="p-2 text-xs text-brand-700">Loading…</div>
                                                    ) : couponsLoadError ? (
                                                        <div className="p-2 text-xs text-red-700">{couponsLoadError}</div>
                                                    ) : availableCoupons.length === 0 ? (
                                                        <div className="p-2 text-xs text-brand-700">No coupons available.</div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {availableCoupons.map((c) => (
                                                                <button
                                                                    key={c.code}
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        setCoupon(c.code)
                                                                        await handleApplyCoupon()
                                                                    }}
                                                                    className={[
                                                                        'w-full rounded-xl border px-3 py-2 text-left transition',
                                                                        appliedCoupon === c.code
                                                                            ? 'border-brand-300 bg-brand-100'
                                                                            : 'border-brand-100 bg-white hover:bg-brand-50'
                                                                    ].join(' ')}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="text-xs font-semibold tracking-[0.14em] text-brand-900">
                                                                            {c.code}
                                                                        </div>
                                                                        {appliedCoupon === c.code && (
                                                                            <CheckCircle2 className="h-3.5 w-3.5 text-brand-900" />
                                                                        )}
                                                                    </div>
                                                                    {c.description ? (
                                                                        <div className="mt-1 text-xs text-brand-700">{c.description}</div>
                                                                    ) : null}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    {appliedCoupon ? (
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="text-xs text-green-700">
                                                {couponMessage ? `${couponMessage} — ` : ''}You saved{' '}
                                                {formatMoney(total - discountedTotal, currency)}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAppliedCoupon(null)
                                                    setDiscountAmount(0)
                                                    setCouponMessage(null)
                                                    setCouponError(null)
                                                    setCoupon('')
                                                }}
                                                className="ml-2 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                            >
                                                REMOVE
                                            </button>
                                        </div>
                                    ) : couponError ? (
                                        <div className="mt-2 text-xs text-red-700">{couponError}</div>
                                    ) : (
                                        <div className="mt-2 text-xs text-brand-700">Ask admin for a coupon code.</div>
                                    )}
                                </div>

                                {/* Summary */}
                                <div className="mt-6 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <div className="text-brand-700">Subtotal</div>
                                        <div>{formatMoney(total, currency)}</div>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-green-700">
                                            <div>Discount ({appliedCoupon})</div>
                                            <div>-{formatMoney(total - discountedTotal, currency)}</div>
                                        </div>
                                    )}
                                    {deliveryCharge > 0 && (
                                        <div className="flex justify-between text-orange-700">
                                            <div>Delivery ({deliveryMethod === 'fastest' ? 'Fastest' : 'Standard'})</div>
                                            <div>+{formatMoney(deliveryCharge, currency)}</div>
                                        </div>
                                    )}
                                    <div className="mt-2 flex justify-between font-semibold">
                                        <div>Total</div>
                                        <div>{formatMoney(finalTotal, currency)}</div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!canProceed) return
                                        setPlacing(true)
                                        setPlaceError(null)

                                        try {
                                            const couponInfo = appliedCoupon
                                                ? { code: appliedCoupon, discountAmount }
                                                : null

                                            if (method === 'cod') {
                                                const payment = { method: 'cod', amount: finalTotal, currency }

                                                const { data } = await apiClient.post<{ orderId: string }>('/api/orders', {
                                                    lines,
                                                    delivery,
                                                    payment,
                                                    coupon: couponInfo,
                                                })

                                                onSuccess({ orderId: data.orderId })
                                                return
                                            }

                                            const loaded = await loadRazorpay()
                                            if (!loaded || !window.Razorpay) {
                                                setPlaceError('Failed to load payment gateway')
                                                return
                                            }

                                            const { data: init } = await apiClient.post<{
                                                keyId: string
                                                orderId: string
                                                razorpayOrderId: string
                                                amount: number
                                                currency: string
                                                name: string
                                                description: string
                                                prefill: { name: string; contact: string }
                                            }>('/api/payments/razorpay/create-order', {
                                                lines,
                                                delivery,
                                                coupon: couponInfo,
                                            })

                                            const options: Record<string, unknown> = {
                                                key: init.keyId,
                                                amount: init.amount,
                                                currency: init.currency,
                                                name: init.name,
                                                description: init.description,
                                                order_id: init.razorpayOrderId,
                                                prefill: init.prefill,
                                                notes: {
                                                    internalOrderId: init.orderId,
                                                },
                                                handler: async (response: any) => {
                                                    try {
                                                        const { data: verified } = await apiClient.post<{ ok: boolean }>(
                                                            '/api/payments/razorpay/verify',
                                                            {
                                                                orderId: init.orderId,
                                                                razorpay_order_id: response.razorpay_order_id,
                                                                razorpay_payment_id: response.razorpay_payment_id,
                                                                razorpay_signature: response.razorpay_signature,
                                                            },
                                                        )

                                                        if (!verified.ok) {
                                                            setPlaceError('Payment verification failed')
                                                            return
                                                        }

                                                        onSuccess({ orderId: init.orderId })
                                                    } catch (_err) {
                                                        setPlaceError('Payment verification failed')
                                                    }
                                                },
                                                modal: {
                                                    ondismiss: () => {
                                                        setPlaceError('Payment was cancelled')
                                                    },
                                                },
                                            }

                                            const rz = new window.Razorpay(options)
                                            rz.open()
                                        } catch (_err) {
                                            setPlaceError('Failed to place order')
                                        } finally {
                                            setPlacing(false)
                                        }
                                    }}
                                    disabled={!canProceed}
                                    className={[
                                        'mt-6 w-full rounded-full px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white shadow-soft transition',
                                        canProceed
                                            ? 'bg-brand-900 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300'
                                            : 'cursor-not-allowed bg-brand-400',
                                    ].join(' ')}
                                >
                                    {placing
                                        ? 'PLACING ORDER…'
                                        : method === 'upi'
                                            ? `PAY ${formatMoney(finalTotal, currency)}`
                                            : `CONFIRM COD ${formatMoney(finalTotal, currency)}`}
                                </button>

                                {placeError ? (
                                    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        {placeError}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>

                    {/* Cancel Confirmation Modal */}
                    <AnimatePresence>
                        {showCancelConfirm && (
                            <>
                                <motion.div
                                    initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                                    animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                                    exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                                    className="fixed inset-0 z-[60] bg-black/80"
                                    onClick={() => setShowCancelConfirm(false)}
                                />
                                <motion.div
                                    initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
                                    animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
                                    exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                                >
                                    <div 
                                        className="w-full max-h-[80vh] max-w-md overflow-auto rounded-3xl border border-brand-200 bg-white shadow-2xl p-6"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="font-display text-xl tracking-wide">Lose Your Discount?</div>
                                            <button
                                                type="button"
                                                onClick={() => setShowCancelConfirm(false)}
                                                className="rounded-full p-2 text-brand-700 transition hover:bg-brand-100"
                                                aria-label="Close"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="text-sm text-brand-700 mb-4">
                                            Are you sure you want to cancel? You'll lose any applied discounts and offers!
                                        </div>

                                        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 mb-4">
                                            <div className="text-sm font-semibold text-orange-900 mb-2">Don't miss out on savings!</div>
                                            {appliedCoupon ? (
                                                <div className="space-y-1 text-xs text-orange-800">
                                                    <div>• Applied coupon: {appliedCoupon}</div>
                                                    <div>• You're saving: {formatMoney(total - discountedTotal, currency)}</div>
                                                    <div>• This offer may not be available later</div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1 text-xs text-orange-800">
                                                    <div>• Complete your order to keep current pricing</div>
                                                    <div>• Special offers may expire</div>
                                                    <div>• Cart items may go out of stock</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowCancelConfirm(false)}
                                                className="flex-1 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-brand-900 transition hover:bg-brand-100"
                                            >
                                                CONTINUE PAYMENT
                                            </button>
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="flex-1 rounded-full bg-brand-900 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-white transition hover:bg-black"
                                            >
                                                CANCEL ORDER
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    )

    if (!portalTarget) return null
    return createPortal(modalTree, portalTarget)
}
