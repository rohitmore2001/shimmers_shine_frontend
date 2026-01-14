import crypto from 'crypto'

export function createOrderId() {
  return `ord_${crypto.randomBytes(8).toString('hex')}`
}

export function createCustomerToken() {
  return crypto.randomBytes(24).toString('hex')
}
