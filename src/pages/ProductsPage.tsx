import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addToCart } from '../features/cart/cartSlice'
import { selectCartLines } from '../features/cart/selectors'
import { selectCategories, selectCatalogStatus } from '../features/catalog/selectors'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'
import { loadCatalog } from '../features/catalog/catalogSlice'
import { apiClient } from '../services/apiClient'
import type { Product } from '../types/catalog'

export default function ProductsPage() {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const prefersReducedMotion = useReducedMotion()

  const PAGE_SIZE = 12

  const selectedCategory = searchParams.get('category') || ''
  const catalogStatus = useAppSelector(selectCatalogStatus)
  const categories = useAppSelector(selectCategories)
  const cartLines = useAppSelector(selectCartLines)

  const [items, setItems] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const inFlightRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const cartQtyByProductId = useMemo(() => {
    const map: Record<string, number> = {}
    for (const l of cartLines) {
      map[l.productId] = l.quantity
    }
    return map
  }, [cartLines])

  const selectedCategoryName =
    categories?.find((c) => c.id === selectedCategory)?.name || (selectedCategory ? selectedCategory : 'All')

  const handleQuickView = useCallback((product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }, [])

  const handleAddToCart = useCallback((productId: string) => {
    dispatch(addToCart({ productId }))
  }, [dispatch])

  const fetchPage = useCallback(
    async (nextPage: number, mode: 'replace' | 'append') => {
      if (inFlightRef.current) return
      inFlightRef.current = true

      setProductsLoading(true)
      setProductsError(null)

      try {
        const params: Record<string, string | number> = {
          page: nextPage,
          limit: PAGE_SIZE,
        }
        if (selectedCategory) params.category = selectedCategory

        const { data } = await apiClient.get<{
          items: Product[]
          page: number
          limit: number
          total: number
          hasMore: boolean
        }>('/api/products', { params })

        const totalNext = Number(data.total || 0)
        const itemsNext = data.items || []

        setTotal(totalNext)
        setPage(nextPage)
        setHasMore((nextPage - 1) * PAGE_SIZE + itemsNext.length < totalNext)

        setItems((prev) => {
          if (mode === 'replace') return itemsNext
          const existing = new Set(prev.map((p) => p.id))
          const merged = [...prev]
          for (const p of itemsNext) {
            if (!existing.has(p.id)) merged.push(p)
          }
          return merged
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load products'
        setProductsError(msg)
      } finally {
        setProductsLoading(false)
        inFlightRef.current = false
      }
    },
    [PAGE_SIZE, selectedCategory],
  )

  const gridVariants = {
    hidden: {},
    show: {
      transition: prefersReducedMotion
        ? undefined
        : {
            staggerChildren: 0.04,
            delayChildren: 0.02,
          },
    },
  }

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 },
    show: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 },
    exit: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8, scale: 0.98 },
  }

  function selectCategory(id: string) {
    const next = new URLSearchParams(searchParams)
    if (!id) next.delete('category')
    else next.set('category', id)
    setSearchParams(next)
  }

  useEffect(() => {
    if (catalogStatus === 'idle') dispatch(loadCatalog())
  }, [dispatch, catalogStatus])

  useEffect(() => {
    setItems([])
    setPage(1)
    setTotal(0)
    setHasMore(true)
    void fetchPage(1, 'replace')
  }, [fetchPage, selectedCategory])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    if (!hasMore) return

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (!first?.isIntersecting) return
        void fetchPage(page + 1, 'append')
      },
      { root: null, rootMargin: '600px' },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [fetchPage, hasMore, page])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-display text-2xl tracking-wide">Products</div>
            <div className="mt-1 text-sm text-brand-700">
              {productsLoading && items.length === 0 ? 'Loading products…' : `${total || items.length} items • ${selectedCategoryName}`}
            </div>
          </div>

          <div className="flex w-full gap-2 overflow-auto pb-1 sm:w-auto sm:pb-0">
            <button
              type="button"
              onClick={() => selectCategory('')}
              className={[
                'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.14em] transition',
                !selectedCategory
                  ? 'border-brand-300 bg-brand-200/50 text-brand-900'
                  : 'border-brand-200 bg-brand-50 text-brand-800 hover:bg-white',
              ].join(' ')}
            >
              ALL
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCategory(c.id)}
                className={[
                  'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.14em] transition',
                  selectedCategory === c.id
                    ? 'border-brand-300 bg-brand-200/50 text-brand-900'
                    : 'border-brand-200 bg-brand-50 text-brand-800 hover:bg-white',
                ].join(' ')}
              >
                {c.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <aside className="hidden space-y-4 md:sticky md:top-24 md:block md:self-start">
          <div className="rounded-2xl border border-brand-200 bg-white p-5 shadow-soft">
            <div className="font-display text-lg">Filter</div>
            <div className="mt-3 text-sm text-brand-700">Choose a category to refine results.</div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => selectCategory('')}
                className={[
                  'w-full rounded-xl px-3 py-2 text-left text-sm transition',
                  !selectedCategory ? 'bg-brand-200/60 text-brand-900' : 'hover:bg-brand-50',
                ].join(' ')}
              >
                All products
              </button>

              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCategory(c.id)}
                  className={[
                    'w-full rounded-xl px-3 py-2 text-left text-sm transition',
                    selectedCategory === c.id ? 'bg-brand-200/60 text-brand-900' : 'hover:bg-brand-50',
                  ].join(' ')}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <div className="text-sm font-semibold">Live products</div>
            <div className="mt-2 text-sm text-brand-800/80">
              Products load from the backend with category filtering and pagination.
            </div>
          </div> */}
        </aside>

        <section className="space-y-4">
          {productsLoading && items.length === 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft"
                >
                  <div className="aspect-square bg-brand-200/60 sm:aspect-[4/5]" />
                  <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
                    <div className="h-4 w-4/5 rounded bg-brand-200/60" />
                    <div className="h-3 w-2/3 rounded bg-brand-200/40" />
                    <div className="h-10 rounded-full bg-brand-200/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-brand-200 bg-white p-8 text-center shadow-soft">
              <div className="font-display text-2xl">No items found</div>
              <div className="mt-2 text-sm text-brand-700">Try a different category.</div>
              <button
                type="button"
                onClick={() => selectCategory('')}
                className="mt-5 inline-flex rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
              >
                CLEAR FILTER
              </button>
            </div>
          ) : (
            <motion.div
              layout
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {items.map((p) => (
                  <motion.div key={p.id} layout variants={itemVariants} exit="exit">
                    <ProductCard
                      product={p}
                      quantity={cartQtyByProductId[p.id] || 0}
                      onAdd={handleAddToCart}
                      onQuickView={handleQuickView}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {productsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load products. Please refresh.
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              {productsLoading && items.length > 0 ? <div className="text-sm text-brand-700">Loading more…</div> : null}
              {hasMore ? <div ref={sentinelRef} className="h-10 w-full" /> : null}
              {!hasMore ? <div className="text-xs text-brand-700">You’ve reached the end.</div> : null}
            </div>
          ) : null}

          {catalogStatus === 'failed' ? <div className="text-xs text-red-700">Failed to load categories.</div> : null}
        </section>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
        inCart={selectedProduct ? Boolean(cartQtyByProductId[selectedProduct.id]) : false}
        quantity={selectedProduct ? cartQtyByProductId[selectedProduct.id] || 0 : 0}
      />
    </div>
  )
}
