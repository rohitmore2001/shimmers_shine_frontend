import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { removeFromCart, setQuantity } from '../features/cart/cartSlice'
import { selectCartLines } from '../features/cart/selectors'
import { selectProducts } from '../features/catalog/selectors'
import { formatMoney } from '../utils/money'

export default function CartPage() {
  const dispatch = useAppDispatch()
  const prefersReducedMotion = useReducedMotion()
  const lines = useAppSelector(selectCartLines)
  const products = useAppSelector(selectProducts)

  const detailed = lines
    .map((l) => ({
      line: l,
      product: products.find((p) => p.id === l.productId),
    }))
    .filter((x) => Boolean(x.product)) as Array<{
    line: { productId: string; quantity: number }
    product: NonNullable<(typeof products)[number]>
  }>

  const subtotal = detailed.reduce((sum, x) => sum + x.product.price * x.line.quantity, 0)
  const currency = detailed[0]?.product.currency || 'INR'

  return (
    <div className="space-y-6">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-display text-2xl tracking-wide">Your cart</div>
            <div className="mt-1 text-sm text-brand-700">
              {detailed.length === 0
                ? 'Add your favorite pieces and checkout when ready.'
                : `${detailed.length} items • Secure checkout`}
            </div>
          </div>
          <Link
            to="/products"
            className="inline-flex w-fit rounded-full border border-brand-200 bg-brand-50 px-5 py-2 text-xs font-semibold tracking-[0.18em] text-brand-900 transition hover:bg-white"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">

          {detailed.length === 0 ? (
            <div className="rounded-2xl border border-brand-200 bg-white p-8 text-center shadow-soft">
              <div className="font-display text-2xl">Your cart is empty</div>
              <div className="mt-2 text-sm text-brand-700">
                Explore our collection and add items to get started.
              </div>
              <Link
                to="/products"
                className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
              >
                BROWSE PRODUCTS
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {detailed.map(({ line, product }) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-4 rounded-2xl border border-brand-200 bg-white p-4 shadow-soft"
                >
                  <div className="h-28 w-24 overflow-hidden rounded-2xl bg-brand-200">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display text-base">{product.name}</div>
                        <div className="mt-1 text-xs text-brand-700">{product.metal}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCart({ productId: product.id }))}
                        className="rounded-full border border-transparent p-2 text-brand-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-900"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-2 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(setQuantity({ productId: product.id, quantity: line.quantity - 1 }))
                          }
                          className="rounded-full p-1 hover:bg-white"
                          aria-label="Decrease"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="min-w-8 text-center text-sm font-semibold">{line.quantity}</div>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(setQuantity({ productId: product.id, quantity: line.quantity + 1 }))
                          }
                          className="rounded-full p-1 hover:bg-white"
                          aria-label="Increase"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-sm font-semibold">
                        {formatMoney(product.price * line.quantity, product.currency)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-2xl border border-brand-200 bg-white p-6 shadow-soft lg:sticky lg:top-24">
          <div className="font-display text-lg">Summary</div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-brand-700">Subtotal</div>
              <div className="font-semibold">{formatMoney(subtotal, currency)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-brand-700">Shipping</div>
              <div className="font-semibold">Free</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-brand-700">Taxes</div>
              <div className="font-semibold">Included</div>
            </div>
          </div>

          <div className="mt-4 h-px bg-brand-200" />
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-brand-800">Total</div>
            <div className="text-lg font-semibold">{formatMoney(subtotal, currency)}</div>
          </div>

          <Link
            to="/checkout"
            className={[
              'mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition',
              detailed.length === 0 ? 'pointer-events-none bg-brand-400' : 'bg-brand-900 hover:bg-black',
            ].join(' ')}
          >
            CHECKOUT
          </Link>

          <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-xs text-brand-700">
            Tip: Login is requested at checkout. Your cart is saved while you browse.
          </div>
        </aside>
      </div>
    </div>
  )
}
