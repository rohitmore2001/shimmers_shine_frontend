import { useState } from 'react'

interface ReplaceOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, description: string) => void
  loading: boolean
}

export default function ReplaceOrderModal({ isOpen, onClose, onSubmit, loading }: ReplaceOrderModalProps) {
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
        <div className="font-display text-lg">Request Replacement</div>
        <div className="mt-2 text-sm text-brand-700">
          Please provide details about why you want to replace this order.
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
                <option value="Wrong size">Wrong size</option>
                <option value="Defective product">Defective product</option>
                <option value="Damaged during delivery">Damaged during delivery</option>
                <option value="Wrong item delivered">Wrong item delivered</option>
                <option value="Quality issues">Quality issues</option>
                <option value="Not as described">Not as described</option>
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
                placeholder="Please provide additional details about the replacement request..."
              />
            </label>
          </div>

          {/* Return & Exchange Policy */}
          <div className="mt-4 max-h-[150px] overflow-y-auto rounded-xl border border-brand-200 bg-brand-50 p-4">
            <div className="text-sm font-semibold text-brand-900 mb-3">Return & Exchange Policy</div>
            <div className="space-y-3 text-xs">
              <div>
                <div className="font-semibold text-brand-800">Returns & Exchanges</div>
                <ul className="mt-1 space-y-0.5 text-brand-700">
                  <li>• Within 3 days of delivery</li>
                  <li>• Product must be unused with original packaging</li>
                </ul>
              </div>
              
              <div>
                <div className="font-semibold text-brand-800">Non-Returnable Items</div>
                <ul className="mt-1 space-y-0.5 text-brand-700">
                  <li>• Customized/engraved jewellery</li>
                  <li>• Sale/discounted items</li>
                  <li>• Products damaged by chemicals</li>
                </ul>
              </div>
              
              <div>
                <div className="font-semibold text-brand-800">Damaged Items</div>
                <ul className="mt-1 space-y-0.5 text-brand-700">
                  <li>• Contact within 48 hours with photos/videos</li>
                  <li>• Replacement offered after verification</li>
                </ul>
              </div>
              
              <div>
                <div className="font-semibold text-brand-800">Refunds & Exchange</div>
                <ul className="mt-1 space-y-0.5 text-brand-700">
                  <li>• No cash refunds, shipping non-refundable</li>
                  <li>• Exchange allowed once per order</li>
                  <li>• Customer pays return shipping</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-brand-200">
              <div className="text-xs text-brand-600">
                By submitting, you agree to our Return & Exchange Policy.
              </div>
            </div>
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
