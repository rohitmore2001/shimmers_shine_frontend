import { Link } from 'react-router-dom'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { item1, item2, item3, item4, mainPage, metome, newCollection } from '../assets/images'

const previewTiles = [
  { image: item1, label: 'Rings', categoryId: 'rings' },
  { image: item2, label: 'Bracelets', categoryId: 'bracelets' },
  { image: item3, label: 'Necklaces', categoryId: 'necklaces' },
  { image: item4, label: 'Earrings', categoryId: 'earrings' },
]

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion()

  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease },
    },
  }

  const stagger: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.08,
      },
    },
  }

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-[32px] border border-brand-200 bg-white shadow-soft">
        <div className="absolute inset-0">
          <motion.div
            aria-hidden
            className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-200/60 blur-3xl"
            animate={prefersReducedMotion ? undefined : { x: [0, 14, 0], y: [0, 10, 0] }}
            transition={prefersReducedMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-[#d7b39b]/60 blur-3xl"
            animate={prefersReducedMotion ? undefined : { x: [0, -18, 0], y: [0, -12, 0] }}
            transition={prefersReducedMotion ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative grid gap-6 p-6 md:grid-cols-2 md:p-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col justify-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-brand-800"
            >
              MAKE MEMORIES MEMORABLE
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-4 font-display text-4xl leading-[1.05] tracking-wide text-brand-900 md:text-5xl"
            >
              SHIMMERS &amp; SHINE
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-4 max-w-lg text-sm text-brand-800/80 md:text-base">
              Minimal, timeless, and designed to feel special every day. Explore curated
              pieces for gifting, milestones, and your everyday glow.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="inline-flex rounded-full bg-brand-900 px-7 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
              >
                SHOP NOW
              </Link>
              <Link
                to="/products?category=rings"
                className="inline-flex rounded-full border border-brand-200 bg-white/70 px-7 py-3 text-xs font-semibold tracking-[0.18em] text-brand-900 shadow-soft transition hover:bg-white"
              >
                VIEW BESTSELLERS
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[{ k: 'Premium', v: 'Finish' }, { k: 'Trusted', v: 'Quality' }, { k: 'Easy', v: 'Returns' }].map(
                (x) => (
                  <div key={x.k} className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                    <div className="text-sm font-semibold text-brand-900">{x.k}</div>
                    <div className="mt-1 text-xs text-brand-700">{x.v}</div>
                  </div>
                ),
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease }}
            className="overflow-hidden rounded-[28px]"
          >
            <img src={mainPage} alt="Jewellery hero" className="h-full w-full object-cover" />
          </motion.div>
        </div>
      </section>

      <section className="space-y-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="font-display text-2xl tracking-wide">Browse by category</div>
            <div className="mt-1 text-sm text-brand-700">
              Find what fits your mood. Tap a category to shop instantly.
            </div>
          </div>
          <Link
            to="/products"
            className="inline-flex w-fit rounded-full border border-brand-200 bg-white/70 px-5 py-2 text-xs font-semibold tracking-[0.18em] text-brand-900 shadow-soft transition hover:bg-white"
          >
            VIEW ALL
          </Link>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {previewTiles.map((t) => (
            <motion.div key={t.categoryId} variants={fadeUp}>
              <Link
                to={`/products?category=${encodeURIComponent(t.categoryId)}`}
                className="group relative block overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={t.image}
                    alt={t.label}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
                <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-brand-900">
                  {t.label}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease }}
          className="overflow-hidden rounded-3xl shadow-soft"
        >
          <img src={metome} alt="From me to me" className="h-full w-full object-cover" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease }}
          className="rounded-3xl bg-[#d7b39b] p-8 shadow-soft"
        >
          <div className="max-w-md space-y-4">
            <div className="font-display text-3xl tracking-wide">FROM ME TO ME</div>
            <div className="text-sm text-brand-900/80">
              Celebrate small wins. Pick a piece that reminds you how far you’ve come.
            </div>
            <Link
              to="/products"
              className="inline-flex rounded-full border border-brand-900/30 bg-white/70 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-brand-900 shadow-soft transition hover:bg-white"
            >
              EXPLORE
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease }}
          className="rounded-3xl bg-[#d7b39b] p-8 shadow-soft"
        >
          <div className="max-w-md space-y-4">
            <div className="font-display text-3xl tracking-wide">OUR NEW COLLECTION</div>
            <div className="text-sm text-brand-900/80">
              Crafted to turn heads. Designed to be cherished.
              Timeless pieces that tell your story.
            </div>
            <Link
              to="/products"
              className="inline-flex rounded-full bg-brand-900 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-black"
            >
              SHOP
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease }}
          className="overflow-hidden rounded-3xl shadow-soft"
        >
          <img src={newCollection} alt="New collection" className="h-full w-full object-cover" />
        </motion.div>
      </section>

      {/* <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="rounded-3xl bg-white p-8 shadow-soft"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-display text-2xl tracking-wide">Customer reviews</div>
            <div className="mt-1 text-sm text-brand-700">
              Loved for comfort, finish, and everyday wear.
            </div>
          </div>
          <Link
            to="/products"
            className="inline-flex w-fit rounded-full border border-brand-200 bg-brand-50 px-5 py-2 text-xs font-semibold tracking-[0.18em] text-brand-900 transition hover:bg-white"
          >
            SHOP NOW
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              name: 'Aanya',
              text: 'Elegant pieces and premium finish. The packaging felt luxurious.',
            },
            {
              name: 'Rohit',
              text: 'Fast delivery, great quality. The ring looks even better in person.',
            },
            {
              name: 'Meera',
              text: 'Minimal and beautiful. Perfect for daily wear and gifting.',
            },
          ].map((r) => (
            <motion.div
              key={r.name}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-brand-200 bg-brand-50 p-5"
            >
              <div className="text-sm font-semibold text-brand-900">{r.name}</div>
              <div className="mt-2 text-sm text-brand-800/80">{r.text}</div>
            </motion.div>
          ))}
        </div>
      </motion.section> */}

      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="rounded-3xl bg-white p-8 shadow-soft"
      >
        <div className="font-display text-2xl tracking-wide">Return & Exchange Policy (India)</div>
        <div className="mt-4 text-sm text-brand-700">
          We take great care in crafting and packing every piece. However, if you face any issues, please read our policy below:
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="font-semibold text-brand-900">Returns & Exchanges</h3>
            <ul className="mt-2 space-y-1 text-sm text-brand-800">
              <li>• We accept returns or exchanges within 3 days of delivery.</li>
              <li>• The product must be unused, unworn, and in original condition with packaging.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-brand-900">Non-Returnable Items</h3>
            <div className="mt-2 text-sm text-brand-700">For hygiene and safety reasons, we do not accept returns or exchanges on:</div>
            <ul className="mt-1 space-y-1 text-sm text-brand-800">
              <li>• Customized / engraved jewellery</li>
              <li>• Sale or discounted items</li>
              <li>• Products damaged due to perfume, sweat, or chemicals</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-brand-900">Damaged or Wrong Product Received</h3>
            <ul className="mt-2 space-y-1 text-sm text-brand-800">
              <li>• Contact us within 48 hours of delivery</li>
              <li>• Share clear photos/videos + unboxing video</li>
              <li>• After verification, we will offer a replacement</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-brand-900">Refunds</h3>
            <ul className="mt-2 space-y-1 text-sm text-brand-800">
              <li>• We do not offer cash refund</li>
              <li>• Shipping charges are non-refundable</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-brand-900">Exchange Policy</h3>
            <ul className="mt-2 space-y-1 text-sm text-brand-800">
              <li>• Exchange is allowed once per order</li>
              <li>• Customer bears return shipping cost</li>
              <li>• Replacement shipping will be covered by us (for approved cases)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
            <p className="text-sm text-brand-800">
              By placing an order, you agree to our Return & Exchange Policy.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
