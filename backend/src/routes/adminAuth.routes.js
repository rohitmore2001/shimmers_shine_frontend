import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AdminUser } from '../models/AdminUser.js'

export const adminAuthRouter = Router()

adminAuthRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const admin = await AdminUser.findOne({ email: email.toLowerCase(), active: true })
  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(password, admin.passwordHash)
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' })
  }

  const token = jwt.sign({ sub: admin._id.toString(), role: 'admin', email: admin.email }, secret, {
    expiresIn: '7d',
  })

  return res.json({
    token,
    admin: {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    },
  })
})
