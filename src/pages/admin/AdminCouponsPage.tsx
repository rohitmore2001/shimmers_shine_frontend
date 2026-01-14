import { type FormEvent, useEffect, useState } from 'react'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import Modal from '../../components/Modal'
import { adminApiClient } from '../../services/adminApiClient'

type Coupon = {
  code: string
  label: string
  description: string
  type: 'percentage' | 'flat'
  value: number
  active: boolean
  startsAt: string
  endsAt: string
  minSubtotal: number | ''
  maxDiscount: number | ''
}

export default function AdminCouponsPage() {
  const [items, setItems] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<string | null>(null)

  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'percentage' | 'flat'>('percentage')
  const [value, setValue] = useState('')
  const [minSubtotal, setMinSubtotal] = useState('')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [active, setActive] = useState(true)

  function resetForm() {
    setCode('')
    setLabel('')
    setDescription('')
    setType('percentage')
    setValue('')
    setMinSubtotal('')
    setMaxDiscount('')
    setActive(true)
  }

  function openCreate() {
    setEditingCode(null)
    resetForm()
    setCreateOpen(true)
  }

  function openEdit(c: Coupon) {
    setEditingCode(c.code)
    setCode(c.code)
    setLabel(c.label || '')
    setDescription(c.description || '')
    setType(c.type)
    setValue(String(c.value))
    setMinSubtotal(c.minSubtotal === '' ? '' : String(c.minSubtotal))
    setMaxDiscount(c.maxDiscount === '' ? '' : String(c.maxDiscount))
    setActive(Boolean(c.active))
    setEditOpen(true)
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminApiClient.get<Coupon[]>('/api/admin/coupons')
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

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    await adminApiClient.post('/api/admin/coupons', {
      code,
      label,
      description,
      type,
      value: Number(value),
      minSubtotal: minSubtotal ? Number(minSubtotal) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      active,
    })
    setCreateOpen(false)
    await load()
  }

  async function onUpdate(e: FormEvent) {
    e.preventDefault()
    if (!editingCode) return
    await adminApiClient.put(`/api/admin/coupons/${editingCode}`, {
      label,
      description,
      type,
      value: Number(value),
      minSubtotal: minSubtotal === '' ? '' : Number(minSubtotal),
      maxDiscount: maxDiscount === '' ? '' : Number(maxDiscount),
      active,
    })
    setEditOpen(false)
    setEditingCode(null)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-2xl tracking-wide">Coupons</div>
            <div className="mt-2 text-sm text-brand-700">Create offers and discount codes.</div>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center rounded-full bg-brand-900 px-5 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            ADD COUPON
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="text-sm font-semibold">All coupons</div>
        {error ? <div className="mt-3 text-sm text-red-700">{error}</div> : null}
        {loading ? (
          <div className="mt-3 text-sm text-brand-700">Loading…</div>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-brand-700">
                  <th className="py-2">Code</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Value</th>
                  <th className="py-2">Active</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.code} className="border-t border-brand-100">
                    <td className="py-2 font-mono text-xs">{c.code}</td>
                    <td className="py-2">{c.type}</td>
                    <td className="py-2">{c.value}</td>
                    <td className="py-2">{c.active ? 'Yes' : 'No'}</td>
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
                            await adminApiClient.put(`/api/admin/coupons/${c.code}`, { active: !c.active })
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
                            await adminApiClient.delete(`/api/admin/coupons/${c.code}`)
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

      <Modal open={createOpen} title="Add coupon" onClose={() => setCreateOpen(false)}>
        <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CODE"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400 uppercase"
            required
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="label (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="description (optional)"
            className="md:col-span-2 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'percentage' | 'flat')}
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat amount</option>
          </select>

          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === 'percentage' ? 'value (e.g. 10 for 10%)' : 'value (e.g. 250)'}
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />

          <input
            value={minSubtotal}
            onChange={(e) => setMinSubtotal(e.target.value)}
            placeholder="min subtotal (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <input
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="max discount (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <label className="md:col-span-2 flex items-center gap-2 text-sm text-brand-800">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>

          <button
            type="submit"
            className="md:col-span-2 inline-flex w-fit rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            CREATE
          </button>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit coupon" onClose={() => setEditOpen(false)}>
        <form onSubmit={onUpdate} className="grid gap-3 md:grid-cols-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CODE"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400 uppercase"
            disabled
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="label (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="description (optional)"
            className="md:col-span-2 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'percentage' | 'flat')}
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat amount</option>
          </select>

          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === 'percentage' ? 'value (e.g. 10 for 10%)' : 'value (e.g. 250)'}
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />

          <input
            value={minSubtotal}
            onChange={(e) => setMinSubtotal(e.target.value)}
            placeholder="min subtotal (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <input
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="max discount (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <label className="md:col-span-2 flex items-center gap-2 text-sm text-brand-800">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>

          <button
            type="submit"
            className="md:col-span-2 inline-flex w-fit rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            SAVE
          </button>
        </form>
      </Modal>
    </div>
  )
}
