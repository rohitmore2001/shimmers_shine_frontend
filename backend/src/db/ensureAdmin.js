import bcrypt from 'bcryptjs'
import { AdminUser } from '../models/AdminUser.js'

export async function ensureAdminFromEnv() {
  try {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    const name = process.env.ADMIN_NAME || 'Admin'

    if (!email || !password) return

    const existing = await AdminUser.findOne({ email: email.toLowerCase() })
    if (existing) return

    const passwordHash = await bcrypt.hash(password, 10)
    await AdminUser.create({ email: email.toLowerCase(), name, passwordHash })
  } catch (error) {
    console.warn('Admin user creation skipped (no connection):', error.message)
  }
}
