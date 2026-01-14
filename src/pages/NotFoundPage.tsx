import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="rounded-3xl border border-brand-200 bg-white p-10 text-center shadow-soft">
      <div className="font-display text-3xl">Page not found</div>
      <div className="mt-2 text-sm text-brand-700">The page you are looking for doesn’t exist.</div>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
      >
        GO HOME
      </Link>
    </div>
  )
}
