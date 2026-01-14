import { type FormEvent, useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import Modal from '../../components/Modal'
import { adminApiClient } from '../../services/adminApiClient'

type Category = { id: string; name: string; image: string }

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState('')

  function resetForm() {
    setId('')
    setName('')
    setImage('')
  }

  function openCreate() {
    setEditingId(null)
    resetForm()
    setCreateOpen(true)
  }

  function openEdit(c: Category) {
    setEditingId(c.id)
    setId(c.id)
    setName(c.name)
    setImage(c.image)
    setEditOpen(true)
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminApiClient.get<Category[]>('/api/admin/categories')
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
    await adminApiClient.post('/api/admin/categories', { id, name, image })
    setCreateOpen(false)
    await load()
  }

  async function onUpdate(e: FormEvent) {
    e.preventDefault()
    if (!editingId) return
    await adminApiClient.put(`/api/admin/categories/${editingId}`, { name, image })
    setEditOpen(false)
    setEditingId(null)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-2xl tracking-wide">Categories</div>
            <div className="mt-2 text-sm text-brand-700">Create and manage product categories.</div>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center rounded-full bg-brand-900 px-5 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            ADD CATEGORY
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="text-sm font-semibold">All categories</div>
        {error ? <div className="mt-3 text-sm text-red-700">{error}</div> : null}
        {loading ? (
          <div className="mt-3 text-sm text-brand-700">Loading…</div>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-brand-700">
                  <th className="py-2">ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Image</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t border-brand-100">
                    <td className="py-2 font-mono text-xs">{c.id}</td>
                    <td className="py-2">{c.name}</td>
                    <td className="py-2">
                      <a className="text-brand-900 underline" href={c.image} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </td>
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
                            await adminApiClient.delete(`/api/admin/categories/${c.id}`)
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

      <Modal open={createOpen} title="Add category" onClose={() => setCreateOpen(false)}>
        <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-3">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="id (e.g. rings)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="image URL"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />

          <button
            type="submit"
            className="sm:col-span-3 inline-flex w-fit rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            CREATE
          </button>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit category" onClose={() => setEditOpen(false)}>
        <form onSubmit={onUpdate} className="grid gap-3 sm:grid-cols-3">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="id"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            disabled
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="image URL"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />

          <button
            type="submit"
            className="sm:col-span-3 inline-flex w-fit rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            SAVE
          </button>
        </form>
      </Modal>
    </div>
  )
}
