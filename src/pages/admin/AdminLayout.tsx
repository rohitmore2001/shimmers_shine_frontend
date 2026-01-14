import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminLogout, getAdminUserFromStorage } from '../../services/adminAuthService'
import { getAdminToken } from '../../services/adminApiClient'

function navClassName({ isActive }: { isActive: boolean }) {
  return [
    'block rounded-xl px-3 py-2 text-sm transition',
    isActive ? 'bg-brand-200/60 text-brand-900' : 'text-brand-800 hover:bg-brand-50',
  ].join(' ')
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const token = getAdminToken()
  const admin = getAdminUserFromStorage()

  if (!token || !admin) {
    return (
      <div className="mx-auto max-w-lg py-10">
        <div className="rounded-3xl border border-brand-200 bg-white p-8 shadow-soft">
          <div className="font-display text-2xl tracking-wide">Admin</div>
          <div className="mt-2 text-sm text-brand-700">You are not logged in.</div>
          <Link
            to="/admin/login"
            className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            GO TO LOGIN
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl border border-brand-200 bg-white p-5 shadow-soft md:sticky md:top-20">
        <div className="font-display text-lg">Admin Panel</div>
        <div className="mt-1 text-xs text-brand-700">{admin.email}</div>

        <nav className="mt-5 space-y-1">
          <NavLink to="/admin" end className={navClassName}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={navClassName}>
            Orders
          </NavLink>
          <NavLink to="/admin/customers" className={navClassName}>
            Customers
          </NavLink>
          <NavLink to="/admin/products" className={navClassName}>
            Products
          </NavLink>
          <NavLink to="/admin/categories" className={navClassName}>
            Categories
          </NavLink>
          <NavLink to="/admin/coupons" className={navClassName}>
            Coupons
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={async () => {
            await adminLogout()
            navigate('/admin/login')
          }}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-brand-900 transition hover:bg-white"
        >
          LOGOUT
        </button>
      </aside>

      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
