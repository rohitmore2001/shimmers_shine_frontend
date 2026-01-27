import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, CreditCard, LockKeyhole, MapPin } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { login } from '../features/auth/authSlice'
import { clearCart } from '../features/cart/cartSlice'
import { selectCartLines } from '../features/cart/selectors'
import { selectProducts } from '../features/catalog/selectors'
import { formatMoney } from '../utils/money'
import PaymentModal from '../components/PaymentModal'

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const prefersReducedMotion = useReducedMotion()
  const auth = useAppSelector((s) => s.auth)
  const lines = useAppSelector(selectCartLines)
  const products = useAppSelector(selectProducts)

  const detailed = useMemo(() => {
    return lines
      .map((l) => ({
        line: l,
        product: products.find((p) => p.id === l.productId),
      }))
      .filter((x) => Boolean(x.product)) as Array<{
      line: { productId: string; quantity: number }
      product: NonNullable<(typeof products)[number]>
    }>
  }, [lines, products])

  const subtotal = detailed.reduce((sum, x) => sum + x.product.price * x.line.quantity, 0)
  const currency = detailed[0]?.product.currency || 'INR'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [placed, setPlaced] = useState(false)
  const [showModal, setShowModal] = useState(false)

  type Step = 'login' | 'delivery' | 'review'
  const [step, setStep] = useState<Step>(auth.status === 'authenticated' ? 'delivery' : 'login')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')

  const deliveryValid =
    Boolean(fullName.trim() && phone.trim() && addressLine.trim() && city.trim()) && pincode.trim().length === 6

  useEffect(() => {
    if (auth.status === 'authenticated' && step === 'login') {
      setStep('delivery')
    }
  }, [auth.status, step])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    await dispatch(login({ email, password }))
  }

  function placeOrder() {
    setShowModal(true)
  }

  if (placed) {
    return (
      <div className="rounded-3xl border border-brand-200 bg-white p-8 shadow-soft">
        <div className="font-display text-2xl">Order placed</div>
        <div className="mt-2 text-sm text-brand-700">
          Thank you{auth.user?.name ? `, ${auth.user.name}` : ''}. Your order has been received.
        </div>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
          <div className="font-display text-2xl tracking-wide">Checkout</div>
          <div className="mt-2 text-sm text-brand-700">
            A clean, quick flow. You can bind real address + payment APIs later.
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setStep('login')}
              className={[
                'flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition',
                step === 'login' ? 'border-brand-300 bg-brand-50' : 'border-brand-200 bg-white hover:bg-brand-50',
              ].join(' ')}
            >
              <LockKeyhole className="h-4 w-4" />
              <span className="font-semibold">Login</span>
            </button>
            <button
              type="button"
              onClick={() => auth.status === 'authenticated' && setStep('delivery')}
              className={[
                'flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition',
                auth.status !== 'authenticated'
                  ? 'cursor-not-allowed border-brand-200 bg-brand-50 text-brand-700'
                  : step === 'delivery'
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-brand-200 bg-white hover:bg-brand-50',
              ].join(' ')}
            >
              <MapPin className="h-4 w-4" />
              <span className="font-semibold">Delivery</span>
              {auth.status === 'authenticated' ? (
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-brand-700">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => auth.status === 'authenticated' && deliveryValid && setStep('review')}
              className={[
                'flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition',
                auth.status !== 'authenticated' || !deliveryValid
                  ? 'cursor-not-allowed border-brand-200 bg-brand-50 text-brand-700'
                  : step === 'review'
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-brand-200 bg-white hover:bg-brand-50',
              ].join(' ')}
            >
              <CreditCard className="h-4 w-4" />
              <span className="font-semibold">Review & Pay</span>
            </button>
          </div>
        </div>

        {detailed.length === 0 ? (
          <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
            <div className="text-sm text-brand-700">Your cart is empty.</div>
            <Link
              to="/products"
              className="mt-4 inline-flex rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
            >
              BROWSE PRODUCTS
            </Link>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-brand-200 bg-white p-6 shadow-soft"
          >
            {step === 'login' ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-display text-lg">Login to continue</div>
                    <div className="mt-1 text-sm text-brand-700">
                      Login is required at checkout. (Demo login: any email/password)
                    </div>
                  </div>
                  {auth.status === 'authenticated' ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-xs text-brand-800">
                      <CheckCircle2 className="h-4 w-4" />
                      Logged in
                    </div>
                  ) : null}
                </div>

                {auth.status !== 'authenticated' ? (
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
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {auth.error}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
                      disabled={auth.status === 'loading' || detailed.length === 0}
                    >
                      {auth.status === 'loading' ? 'LOGGING IN…' : 'LOGIN'}
                    </button>
                  </form>
                ) : (
                  <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
                    Logged in as <span className="font-semibold">{auth.user?.email}</span>.
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setStep('delivery')}
                        className="inline-flex rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
                      >
                        CONTINUE TO DELIVERY
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}

            {step === 'delivery' ? (
              <>
                <div className="font-display text-lg">Delivery details</div>
                <div className="mt-1 text-sm text-brand-700">
                  Enter a delivery address. (Demo only — no payment gateway connected.)
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <div className="text-xs font-semibold tracking-wide text-brand-800">Full name</div>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
                    />
                  </label>
                  <label className="block">
                    <div className="text-xs font-semibold tracking-wide text-brand-800">Phone</div>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <div className="text-xs font-semibold tracking-wide text-brand-800">Address</div>
                    <input
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
                    />
                  </label>
                  <label className="block">
                    <div className="text-xs font-semibold tracking-wide text-brand-800">City</div>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
                    />
                  </label>
                  <label className="block">
                    <div className="text-xs font-semibold tracking-wide text-brand-800">Pincode</div>
                    <input
                      value={pincode}
                      onChange={(e) => {
                        const next = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setPincode(next)
                      }}
                      inputMode="numeric"
                      pattern="\d{6}"
                      required
                      className="mt-1 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('review')}
                  disabled={!deliveryValid || detailed.length === 0}
                  className={[
                    'mt-5 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition',
                    !deliveryValid || detailed.length === 0
                      ? 'cursor-not-allowed bg-brand-400'
                      : 'bg-brand-900 hover:bg-black',
                  ].join(' ')}
                >
                  CONTINUE TO REVIEW
                </button>
              </>
            ) : null}

            {step === 'review' ? (
              <>
                <div className="font-display text-lg">Review & Pay</div>
                <div className="mt-1 text-sm text-brand-700">
                  Check your items and place the order. Payment integration can be added later.
                </div>

                <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
                  <div className="font-semibold">Deliver to</div>
                  <div className="mt-1 text-sm text-brand-800/80">
                    {fullName} • {phone}
                    <div>
                      {addressLine}, {city} - {pincode}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('delivery')}
                    className="mt-3 inline-flex rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold tracking-[0.14em] text-brand-900 transition hover:bg-brand-50"
                  >
                    EDIT DELIVERY
                  </button>
                </div>

                <div className="mt-5 rounded-2xl border border-brand-200 bg-white p-4">
                  <div className="text-sm font-semibold">Order items</div>
                  <div className="mt-3 space-y-3">
                    {detailed.map(({ line, product }) => (
                      <div key={product.id} className="flex items-center justify-between gap-4">
                        <div className="text-sm">
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-xs text-brand-700">Qty {line.quantity}</div>
                        </div>
                        <div className="text-sm font-semibold">
                          {formatMoney(product.price * line.quantity, product.currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </section>

      <aside className="h-fit rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="font-display text-lg">Summary</div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-brand-700">Subtotal</div>
          <div className="font-semibold">{formatMoney(subtotal, currency)}</div>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <div className="text-brand-700">Shipping</div>
          <div className="font-semibold">Free</div>
        </div>
        <div className="mt-4 h-px bg-brand-200" />
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-brand-800">Total</div>
          <div className="text-lg font-semibold">{formatMoney(subtotal, currency)}</div>
        </div>

        <button
          type="button"
          onClick={placeOrder}
          disabled={auth.status !== 'authenticated' || detailed.length === 0 || step !== 'review'}
          className={[
            'mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition',
            auth.status !== 'authenticated' || detailed.length === 0 || step !== 'review'
              ? 'cursor-not-allowed bg-brand-400'
              : 'bg-brand-900 hover:bg-black',
          ].join(' ')}
        >
          PLACE ORDER
        </button>

        {auth.status !== 'authenticated' ? (
          <div className="mt-3 text-xs text-brand-700">Please login to continue.</div>
        ) : step !== 'review' ? (
          <div className="mt-3 text-xs text-brand-700">Complete delivery details to place order.</div>
        ) : null}
      </aside>

      <PaymentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false)
          dispatch(clearCart())
          setPlaced(true)
        }}
        total={subtotal}
        currency={currency}
        lines={lines}
        delivery={{
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine: addressLine.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
        }}
      />
    </div>
  )
}
