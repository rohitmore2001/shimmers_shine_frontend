import express from 'express'
import cors from 'cors'
import { publicRouter } from './routes/public.routes.js'
import { adminAuthRouter } from './routes/adminAuth.routes.js'
import { adminCategoriesRouter } from './routes/adminCategories.routes.js'
import { adminProductsRouter } from './routes/adminProducts.routes.js'
import { adminCouponsRouter } from './routes/adminCoupons.routes.js'
import { adminOrdersRouter } from './routes/adminOrders.routes.js'
import { adminCustomersRouter } from './routes/adminCustomers.routes.js'
import { publicPaymentsRouter } from './routes/publicPayments.routes.js'
import { requireAdmin } from './middleware/requireAdmin.js'

export function createApp() {
  const app = express()

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
  const origin = corsOrigin === '*' ? true : corsOrigin

  app.use(
    cors({
      origin,
      credentials: true,
    }),
  )

  app.use(express.json({ limit: '1mb' }))

  app.use('/api', publicRouter)
  app.use('/api/payments', publicPaymentsRouter)

  app.use('/api/admin/auth', adminAuthRouter)
  app.use('/api/admin/categories', requireAdmin, adminCategoriesRouter)
  app.use('/api/admin/products', requireAdmin, adminProductsRouter)
  app.use('/api/admin/coupons', requireAdmin, adminCouponsRouter)
  app.use('/api/admin/orders', requireAdmin, adminOrdersRouter)
  app.use('/api/admin/customers', requireAdmin, adminCustomersRouter)

  return app
}
