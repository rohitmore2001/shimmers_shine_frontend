import { type FormEvent, useEffect, useState } from 'react'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import Modal from '../../components/Modal'
import { adminApiClient } from '../../services/adminApiClient'

type CustomerAddress = {
  fullName?: string
  phone?: string
  addressLine?: string
  city?: string
  pincode?: string
} | null

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  active: boolean
  defaultAddress: CustomerAddress
  addressesCount: number
  lastLoginAt: string
  createdAt: string
}

export default function AdminCustomersPage() {
  const [items, setItems] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [active, setActive] = useState(true)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminApiClient.get<Customer[]>('/api/admin/customers')
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

  function resetForm() {
    setEmail('')
    setName('')
    setPhone('')
    setPassword('')
    setActive(true)
  }

  function openCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function openEdit(c: Customer) {
    setEditing(c)
    setEmail(c.email)
    setName(c.name)
    setPhone(c.phone)
    setPassword('')
    setActive(Boolean(c.active))
    setEditOpen(true)
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    await adminApiClient.post('/api/admin/customers', {
      email,
      name,
      phone,
      password,
      active,
    })
    setCreateOpen(false)
    await load()
  }

  async function onUpdate(e: FormEvent) {
    e.preventDefault()
    if (!editing) return

    await adminApiClient.put(`/api/admin/customers/${editing.id}`, {
      email,
      name,
      phone,
      ...(password ? { password } : {}),
      active,
    })

    setEditOpen(false)
    setEditing(null)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-2xl tracking-wide">Customers</div>
            <div className="mt-2 text-sm text-brand-700">Manage customer accounts and see their saved addresses.</div>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center rounded-full bg-brand-900 px-5 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            ADD CUSTOMER
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="text-sm font-semibold">All customers</div>
        {error ? <div className="mt-3 text-sm text-red-700">{error}</div> : null}
        {loading ? (
          <div className="mt-3 text-sm text-brand-700">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-3 text-sm text-brand-700">No customers yet.</div>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-brand-700">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Addresses</th>
                  <th className="py-2">Last Login</th>
                  <th className="py-2">Active</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t border-brand-100">
                    <td className="py-2 font-semibold">{c.name}</td>
                    <td className="py-2 text-xs text-brand-700">{c.email}</td>
                    <td className="py-2 text-xs">{c.phone || '—'}</td>
                    <td className="py-2 text-xs">{c.addressesCount}</td>
                    <td className="py-2 text-xs text-brand-700">
                      {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-2 text-xs">{c.active ? 'Yes' : 'No'}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          title="Edit"
                          aria-label="Edit"
                          className="rounded-full border border-brand-200 bg-brand-50 p-2 text-brand-900 transition hover:bg-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await adminApiClient.put(`/api/admin/customers/${c.id}`, { active: !c.active })
                            await load()
                          }}
                          title={c.active ? 'Disable' : 'Enable'}
                          aria-label={c.active ? 'Disable' : 'Enable'}
                          className="rounded-full border border-brand-200 bg-brand-50 p-2 text-brand-900 transition hover:bg-white"
                        >
                          {c.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await adminApiClient.delete(`/api/admin/customers/${c.id}`)
                            await load()
                          }}
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

      <Modal open={createOpen} title="Add customer" onClose={() => setCreateOpen(false)}>
        <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            type="email"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="phone (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />

          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-brand-800">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>

          <button
            type="submit"
            className="sm:col-span-2 inline-flex w-fit rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            CREATE
          </button>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit customer" onClose={() => setEditOpen(false)}>
        <form onSubmit={onUpdate} className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            type="email"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="phone (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="new password (optional)"
            type="password"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-brand-800">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>

          <button
            type="submit"
            className="sm:col-span-2 inline-flex w-fit rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            SAVE
          </button>
        </form>
      </Modal>
    </div>
  )
}
