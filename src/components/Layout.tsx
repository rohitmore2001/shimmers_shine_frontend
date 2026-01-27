import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, ShoppingBag, UserRound, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectCartCount } from '../features/cart/selectors'
import { loadCatalog } from '../features/catalog/catalogSlice'
import { selectCatalogStatus } from '../features/catalog/selectors'
import { logout } from '../features/auth/authSlice'

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return [
    'relative text-sm tracking-wide transition-colors',
    isActive ? 'text-brand-900' : 'text-brand-700 hover:text-brand-900',
  ].join(' ')
}

export default function Layout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const cartCount = useAppSelector(selectCartCount)
  const catalogStatus = useAppSelector(selectCatalogStatus)
  const auth = useAppSelector((s) => s.auth)
  const [mobileOpen, setMobileOpen] = useState(false)

  const loginHref = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`

  useEffect(() => {
    if (catalogStatus === 'idle') dispatch(loadCatalog())
  }, [catalogStatus, dispatch])

  async function handleLogout() {
    await dispatch(logout())
    navigate('/')
  }

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-brand-100 text-brand-900">
      <header className="sticky top-0 z-30 border-b border-brand-200 bg-brand-100/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="group flex items-baseline gap-3" onClick={closeMobile}>
            <div className="font-display text-lg tracking-wide sm:text-xl">SHIMMERS &amp; SHINE</div>
            <div className="hidden text-[10px] font-semibold tracking-[0.22em] text-brand-700/80 sm:block">
              JEWELLERY STUDIO
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <NavLink to="/products" className={navLinkClassName}>
              Products
            </NavLink>
            <NavLink to="/cart" className={navLinkClassName}>
              Cart
            </NavLink>
            <NavLink to="/checkout" className={navLinkClassName}>
              Checkout
            </NavLink>
            <NavLink to="/my-orders" className={navLinkClassName}>
              My Orders
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex rounded-full border border-brand-300 bg-white/60 p-2 text-brand-900 shadow-soft transition hover:bg-white md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {auth.status === 'authenticated' ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-full border border-brand-300 bg-white/60 px-3 py-2 text-xs text-brand-800 shadow-soft transition hover:bg-white md:inline-flex"
              >
                Logout ({auth.user?.name})
              </button>
            ) : (
              <Link
                to={loginHref}
                className="hidden items-center gap-2 rounded-full border border-brand-300 bg-white/60 px-3 py-2 text-xs text-brand-800 shadow-soft transition hover:bg-white md:inline-flex"
              >
                <UserRound className="h-4 w-4" />
                Login
              </Link>
            )}

            <Link
              to="/cart"
              onClick={closeMobile}
              className="relative inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white/60 px-3 py-2 text-sm shadow-soft transition hover:bg-white"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 ? (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-800 px-1 text-[11px] font-semibold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-brand-200 bg-brand-100/95 backdrop-blur md:hidden"
            >
              <div className="mx-auto max-w-6xl px-4 py-4">
                <div className="grid gap-2">
                  <Link
                    to="/products"
                    onClick={closeMobile}
                    className="rounded-2xl border border-brand-200 bg-white/60 px-4 py-3 text-sm text-brand-900 shadow-soft transition hover:bg-white"
                  >
                    Products
                  </Link>
                  <Link
                    to="/cart"
                    onClick={closeMobile}
                    className="rounded-2xl border border-brand-200 bg-white/60 px-4 py-3 text-sm text-brand-900 shadow-soft transition hover:bg-white"
                  >
                    Cart
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={closeMobile}
                    className="rounded-2xl border border-brand-200 bg-white/60 px-4 py-3 text-sm text-brand-900 shadow-soft transition hover:bg-white"
                  >
                    Checkout
                  </Link>

                  <Link
                    to="/my-orders"
                    onClick={closeMobile}
                    className="rounded-2xl border border-brand-200 bg-white/60 px-4 py-3 text-sm text-brand-900 shadow-soft transition hover:bg-white"
                  >
                    My Orders
                  </Link>

                  {auth.status === 'authenticated' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await handleLogout()
                        closeMobile()
                      }}
                      className="mt-2 inline-flex items-center justify-center rounded-2xl bg-brand-900 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
                    >
                      LOGOUT
                    </button>
                  ) : (
                    <Link
                      to={loginHref}
                      onClick={closeMobile}
                      className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-brand-900 transition hover:bg-white"
                    >
                      <UserRound className="h-4 w-4" />
                      LOGIN
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-brand-200 bg-brand-100">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <div className="font-display text-lg">Get in Touch</div>
            <div className="mt-2 text-sm text-brand-700">support@jwellery.local</div>
            <div className="text-sm text-brand-700">+91 90000 00000</div>
          </div>
          {/* <div>
            <div className="text-sm font-semibold text-brand-900">Visit</div>
            <div className="mt-2 text-sm text-brand-700">Mon-Sat 10:00 - 20:00</div>
            <div className="text-sm text-brand-700">City Center, India</div>
          </div> */}
          {/* <div>
            <div className="text-sm font-semibold text-brand-900">Note</div>
            <div className="mt-2 text-sm text-brand-700">
              SHIMMERS &amp; SHINE is a demo storefront using dummy JSON data. Plug your API
              in the service layer when ready.
            </div>
          </div> */}
        </div>
      </footer>
    </div>
  )
}
