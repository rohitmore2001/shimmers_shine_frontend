import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import Modal from '../../components/Modal'
import { adminApiClient } from '../../services/adminApiClient'

type Product = {
  id: string
  name: string
  categoryId: string
  price: number
  currency: 'INR' | 'USD' | 'EUR'
  metal: string
  image: string
  images?: string[]
  rating: number | null
  active: boolean
}

type Category = { id: string; name: string; image: string }

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR')
  const [metal, setMetal] = useState('')
  const [image, setImage] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageInput, setImageInput] = useState('')
  const [rating, setRating] = useState('')
  const [active, setActive] = useState(true)

  function resetForm() {
    setId('')
    setName('')
    setCategoryId(categories[0]?.id || '')
    setPrice('')
    setCurrency('INR')
    setMetal('')
    setImage('')
    setImages([])
    setImageInput('')
    setRating('')
    setActive(true)
  }

  function addImage() {
    if (imageInput.trim() && !images.includes(imageInput.trim())) {
      setImages([...images, imageInput.trim()])
      setImageInput('')
    }
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index))
  }

  function openCreate() {
    setEditingId(null)
    resetForm()
    setCreateOpen(true)
  }

  function openEdit(p: Product) {
    setEditingId(p.id)
    setId(p.id)
    setName(p.name)
    setCategoryId(p.categoryId)
    setPrice(String(p.price))
    setCurrency(p.currency)
    setMetal(p.metal || '')
    setImage(p.image)
    setImages(p.images || [])
    setImageInput('')
    setRating(p.rating?.toString() || '')
    setActive(p.active)
    setEditOpen(true)
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [p, c] = await Promise.all([
        adminApiClient.get<Product[]>('/api/admin/products'),
        adminApiClient.get<Category[]>('/api/admin/categories'),
      ])
      setItems(p.data)
      setCategories(c.data)
      setCategoryId((prev) => prev || c.data[0]?.id || '')
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

  const categoryNameById = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]))
    return (idValue: string) => map.get(idValue) || idValue
  }, [categories])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    await adminApiClient.post('/api/admin/products', {
      id,
      name,
      categoryId,
      price: Number(price),
      currency,
      metal,
      image,
      images: images.length > 0 ? images : [image], // Use images array or fallback to single image
      rating: rating ? Number(rating) : undefined,
      active,
    })
    setCreateOpen(false)
    await load()
  }

  async function onUpdate(e: FormEvent) {
    e.preventDefault()
    if (!editingId) return

    await adminApiClient.put(`/api/admin/products/${editingId}`, {
      name,
      categoryId,
      price: Number(price),
      currency,
      metal,
      image,
      images: images.length > 0 ? images : [image], // Use images array or fallback to single image
      rating: rating ? Number(rating) : null,
      active,
    })

    setEditOpen(false)
    setEditingId(null)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-2xl tracking-wide">Products</div>
            <div className="mt-2 text-sm text-brand-700">Create and manage products shown in the storefront.</div>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center rounded-full bg-brand-900 px-5 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
          >
            ADD PRODUCT
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="text-sm font-semibold">All products</div>
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
                  <th className="py-2">Category</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Active</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-t border-brand-100">
                    <td className="py-2 font-mono text-xs">{p.id}</td>
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{categoryNameById(p.categoryId)}</td>
                    <td className="py-2">
                      {p.price} {p.currency}
                    </td>
                    <td className="py-2">{p.active ? 'Yes' : 'No'}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          title="Edit"
                          aria-label="Edit"
                          className="rounded-full border border-brand-200 bg-brand-50 p-2 text-brand-900 transition hover:bg-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await adminApiClient.put(`/api/admin/products/${p.id}`, { active: !p.active })
                            await load()
                          }}
                          title={p.active ? 'Disable' : 'Enable'}
                          aria-label={p.active ? 'Disable' : 'Enable'}
                          className="rounded-full border border-brand-200 bg-brand-50 p-2 text-brand-900 transition hover:bg-white"
                        >
                          {p.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await adminApiClient.delete(`/api/admin/products/${p.id}`)
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

      <Modal open={createOpen} title="Add product" onClose={() => setCreateOpen(false)}>
        <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-2">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="id (e.g. ring-009)"
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

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-2">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="price"
              inputMode="numeric"
              className="col-span-2 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
              required
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD' | 'EUR')}
              className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <input
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            placeholder="metal (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <input
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="rating 0-5 (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Primary image URL"
            className="md:col-span-2 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />

          {/* Multiple Images Management */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-sm font-medium text-brand-900">Additional Images</div>
            <div className="flex gap-2">
              <input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Add image URL"
                className="flex-1 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-900 transition hover:bg-brand-100"
              >
                Add
              </button>
            </div>
            
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-brand-700">Additional images ({images.length}):</div>
                <div className="flex flex-wrap gap-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="group relative flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm"
                    >
                      <span className="truncate max-w-[200px]">{img}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded-full bg-red-100 p-1 text-red-600 opacity-0 transition group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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

      <Modal open={editOpen} title="Edit product" onClose={() => setEditOpen(false)}>
        <form onSubmit={onUpdate} className="grid gap-3 md:grid-cols-2">
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

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-2">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="price"
              inputMode="numeric"
              className="col-span-2 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
              required
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD' | 'EUR')}
              className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <input
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            placeholder="metal (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <input
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="rating 0-5 (optional)"
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />

          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Primary image URL"
            className="md:col-span-2 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            required
          />

          {/* Multiple Images Management */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-sm font-medium text-brand-900">Additional Images</div>
            <div className="flex gap-2">
              <input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Add image URL"
                className="flex-1 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-900 transition hover:bg-brand-100"
              >
                Add
              </button>
            </div>
            
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-brand-700">Additional images ({images.length}):</div>
                <div className="flex flex-wrap gap-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="group relative flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm"
                    >
                      <span className="truncate max-w-[200px]">{img}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded-full bg-red-100 p-1 text-red-600 opacity-0 transition group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
