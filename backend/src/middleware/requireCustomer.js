import jwt from 'jsonwebtoken'
import { Customer } from '../models/Customer.js'

export async function requireCustomer(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' })
  }

  try {
    const payload = jwt.verify(token, secret)
    const customerId = payload?.sub ? String(payload.sub) : ''

    if (!customerId) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    const customer = await Customer.findById(customerId).lean()
    if (!customer || !customer.active) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    req.customer = {
      id: customer._id.toString(),
      email: customer.email,
      name: customer.name,
    }

    return next()
  } catch (_err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
