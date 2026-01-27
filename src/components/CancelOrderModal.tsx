interface CancelOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  orderTotal: number
  currency: string
  cancellationFee: number
}

export default function CancelOrderModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading, 
  orderTotal, 
  currency, 
  cancellationFee 
}: CancelOrderModalProps) {
  if (!isOpen) return null

  const refundAmount = orderTotal - cancellationFee

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <div className="font-display text-lg text-red-900">Cancel Order</div>
        <div className="mt-2 text-sm text-brand-700">
          Are you sure you want to cancel this order? Cancellation charges will apply.
        </div>

        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="text-sm font-semibold text-red-900">Cancellation Details</div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-700">Order Total:</span>
              <span className="font-semibold">{orderTotal} {currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-700">Cancellation Fee (10%):</span>
              <span className="font-semibold text-red-700">-{cancellationFee} {currency}</span>
            </div>
            <div className="mt-2 border-t border-red-200 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-brand-900">Refund Amount:</span>
                <span className="font-bold text-green-700">{refundAmount} {currency}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3">
          <div className="text-xs text-orange-800">
            <strong>Note:</strong> Cancellation charges are non-refundable. The refund will be processed to your original payment method within 5-7 business days.
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-brand-900 transition hover:bg-white disabled:opacity-50"
          >
            KEEP ORDER
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'CANCELLING…' : 'CONFIRM CANCELLATION'}
          </button>
        </div>
      </div>
    </div>
  )
}
