import { Plus, Star } from 'lucide-react'
import type { Product } from '../types/catalog'
import { formatMoney } from '../utils/money'

export default function ProductCard({
  product,
  onAdd,
  inCart,
  quantity,
}: {
  product: Product
  onAdd: (productId: string) => void
  inCart?: boolean
  quantity?: number
}) {
  const qty = quantity ?? 0
  const isInCart = Boolean(inCart || qty > 0)

  return (
    <div
      className={[
        'group relative overflow-hidden rounded-2xl border bg-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow focus-within:shadow',
        isInCart ? 'border-brand-300 ring-2 ring-brand-400/40' : 'border-brand-200',
      ].join(' ')}
    >
      <div className="aspect-square overflow-hidden bg-brand-200 sm:aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-black/0 to-black/0 opacity-0 transition group-hover:opacity-100" />
      </div>

      {isInCart ? (
        <div className="absolute left-3 top-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-brand-900 shadow-soft backdrop-blur sm:px-3 sm:text-[11px]">
            IN CART
            <span className="rounded-full bg-brand-200 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-brand-900">
              x{qty}
            </span>
          </div>
        </div>
      ) : null}

      <div className="space-y-2 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-sm leading-snug sm:text-base">{product.name}</div>
            {product.metal ? (
              <div className="mt-0.5 text-[11px] text-brand-700 sm:mt-1 sm:text-xs">{product.metal}</div>
            ) : null}
          </div>
          {product.rating ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-1 text-[11px] text-brand-800 sm:text-xs">
              <Star className="h-3.5 w-3.5" />
              {product.rating.toFixed(1)}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold sm:text-sm">
            {formatMoney(product.price, product.currency)}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAdd(product.id)}
              className="hidden rounded-full bg-brand-900 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-white shadow-soft transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 active:scale-[0.98] sm:inline-flex"
            >
              {isInCart ? 'Add one more' : 'Add to cart'}
            </button>

            <button
              type="button"
              onClick={() => onAdd(product.id)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-900 text-white shadow-soft transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 active:scale-[0.98] sm:hidden"
              aria-label="Add one"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
