import jwt from 'jsonwebtoken'

export function requireAdmin(req, res, next) {
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
    req.admin = payload
    return next()
  } catch (_err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
