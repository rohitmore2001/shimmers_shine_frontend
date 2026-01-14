import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  const portalTarget = useMemo(() => {
    if (typeof document === 'undefined') return null
    return document.body
  }, [])

  if (!portalTarget) return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-2xl">
              <div className="relative border-b border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-3 rounded-full p-2 text-brand-700 transition hover:bg-brand-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="font-display text-xl tracking-wide">{title}</div>
              </div>

              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    portalTarget,
  )
}
