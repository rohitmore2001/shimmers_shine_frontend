import { useEffect, useState } from 'react'
import { adminApiClient } from '../../services/adminApiClient'

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<{ products: number; categories: number; coupons: number; orders: number } | null>(null)

  useEffect(() => {
    let mounted = true
    Promise.all([
      adminApiClient.get('/api/admin/products'),
      adminApiClient.get('/api/admin/categories'),
      adminApiClient.get('/api/admin/coupons'),
      adminApiClient.get('/api/admin/orders'),
    ]).then(([p, c, co, o]) => {
      if (!mounted) return
      setCounts({ products: p.data.length, categories: c.data.length, coupons: co.data.length, orders: o.data.length })
    })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="font-display text-2xl tracking-wide">Dashboard</div>
        <div className="mt-2 text-sm text-brand-700">Manage your store content from here.</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { k: 'Products', v: counts?.products ?? '—' },
          { k: 'Categories', v: counts?.categories ?? '—' },
          { k: 'Coupons', v: counts?.coupons ?? '—' },
          { k: 'Orders', v: counts?.orders ?? '—' },
        ].map((x) => (
          <div key={x.k} className="rounded-2xl border border-brand-200 bg-white p-5 shadow-soft">
            <div className="text-xs font-semibold tracking-[0.18em] text-brand-700">{x.k.toUpperCase()}</div>
            <div className="mt-2 font-display text-3xl">{x.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
