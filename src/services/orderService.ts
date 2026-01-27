import { apiClient } from './apiClient'

export interface Order {
  orderId: string
  orderStatus: string
  paymentStatus: string
  deliveryStatus?: string
  subtotal: number
  discountAmount: number
  total: number
  couponCode?: string
  currency: string
  lines: Array<{
    productId: string
    quantity: number
  }>
  delivery: {
    fullName: string
    phone: string
    addressLine: string
    city: string
    pincode: string
  }
  payment?: any
  distance?: {
    kilometers: number
    fromNaviMumbai: boolean
  }
  returnRequest?: {
    reason: string
    description?: string
    requestedAt: string
    approvedAt?: string
    rejectedAt?: string
    rejectionReason?: string
  }
  replacementRequest?: {
    reason: string
    description?: string
    requestedAt: string
    approvedAt?: string
    rejectedAt?: string
    rejectionReason?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CancelOrderPayload {
  reason?: string
}

export interface ReturnOrderPayload {
  reason: string
  description?: string
}

export interface ReplaceOrderPayload {
  reason: string
  description?: string
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>('/api/orders/me')
  return data
}

export async function cancelOrder(orderId: string, payload: CancelOrderPayload = {}): Promise<{
  orderId: string
  orderStatus: string
  paymentStatus: string
  message: string
}> {
  const { data } = await apiClient.post(`/api/orders/${orderId}/cancel`, payload)
  return data
}

export async function returnOrder(orderId: string, payload: ReturnOrderPayload): Promise<{
  orderId: string
  orderStatus: string
  returnRequest: any
  message: string
}> {
  const { data } = await apiClient.post(`/api/orders/${orderId}/return`, payload)
  return data
}

export async function replaceOrder(orderId: string, payload: ReplaceOrderPayload): Promise<{
  orderId: string
  orderStatus: string
  replacementRequest: any
  message: string
}> {
  const { data } = await apiClient.post(`/api/orders/${orderId}/replace`, payload)
  return data
}

export function canCancelOrder(orderStatus: string): boolean {
  return ['created', 'confirmed'].includes(orderStatus)
}

export function canReturnOrder(orderStatus: string, deliveryStatus?: string, updatedAt?: string): boolean {
  // Check if order is effectively delivered
  const isDelivered = orderStatus === 'delivered' || deliveryStatus === 'delivered'
  if (!isDelivered) return false
  
  // Check if return is within 3 days of delivery
  if (updatedAt) {
    const deliveryDate = new Date(updatedAt)
    const now = new Date()
    const daysSinceDelivery = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceDelivery <= 3
  }
  
  return true // If no date provided, allow return
}

export function canReplaceOrder(orderStatus: string, deliveryStatus?: string, updatedAt?: string): boolean {
  // Check if order is effectively delivered
  const isDelivered = orderStatus === 'delivered' || deliveryStatus === 'delivered'
  if (!isDelivered) return false
  
  // Check if replacement is within 3 days of delivery
  if (updatedAt) {
    const deliveryDate = new Date(updatedAt)
    const now = new Date()
    const daysSinceDelivery = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceDelivery <= 3
  }
  
  return true // If no date provided, allow replacement
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'created':
      return 'text-blue-600 bg-blue-50'
    case 'confirmed':
      return 'text-green-600 bg-green-50'
    case 'shipped':
      return 'text-purple-600 bg-purple-50'
    case 'delivered':
      return 'text-emerald-600 bg-emerald-50'
    case 'cancelled':
      return 'text-red-600 bg-red-50'
    case 'return_requested':
      return 'text-orange-600 bg-orange-50'
    case 'return_approved':
      return 'text-teal-600 bg-teal-50'
    case 'return_rejected':
      return 'text-red-600 bg-red-50'
    case 'returned':
      return 'text-gray-600 bg-gray-50'
    case 'replacement_requested':
      return 'text-indigo-600 bg-indigo-50'
    case 'replacement_approved':
      return 'text-cyan-600 bg-cyan-50'
    case 'replacement_rejected':
      return 'text-red-600 bg-red-50'
    case 'replaced':
      return 'text-green-600 bg-green-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'created':
      return 'Order Placed'
    case 'confirmed':
      return 'Confirmed'
    case 'shipped':
      return 'Shipped'
    case 'delivered':
      return 'Delivered'
    case 'cancelled':
      return 'Cancelled'
    case 'return_requested':
      return 'Return Requested'
    case 'return_approved':
      return 'Return Approved'
    case 'return_rejected':
      return 'Return Rejected'
    case 'returned':
      return 'Returned'
    case 'replacement_requested':
      return 'Replacement Requested'
    case 'replacement_approved':
      return 'Replacement Approved'
    case 'replacement_rejected':
      return 'Replacement Rejected'
    case 'replaced':
      return 'Replaced'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}
