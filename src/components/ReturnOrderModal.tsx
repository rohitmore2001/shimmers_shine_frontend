import { useState } from 'react'

interface ReturnOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, description: string) => void
  loading: boolean
}

export default function ReturnOrderModal({ isOpen, onClose, onSubmit, loading }: ReturnOrderModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return
    
    onSubmit(reason.trim(), description.trim())
    setReason('')
    setDescription('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="font-display text-lg">Request Return</div>
        <div className="mt-2 text-sm text-brand-700">
          Please provide details about why you want to return this order.
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block">
              <div className="text-xs font-semibold tracking-wide text-brand-800">Reason *</div>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
              >
                <option value="">Select a reason</option>
                <option value="Damaged product">Damaged product</option>
                <option value="Wrong item delivered">Wrong item delivered</option>
                <option value="Size not suitable">Size not suitable</option>
                <option value="Quality not as expected">Quality not as expected</option>
                <option value="Changed mind">Changed mind</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <div>
            <label className="block">
              <div className="text-xs font-semibold tracking-wide text-brand-800">Description (Optional)</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm outline-none focus:border-brand-400 resize-none"
                placeholder="Please provide additional details..."
              />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-brand-900 transition hover:bg-white disabled:opacity-50"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 rounded-full bg-brand-900 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black disabled:opacity-50"
            >
              {loading ? 'SUBMITTING…' : 'SUBMIT REQUEST'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
