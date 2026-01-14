import mongoose from 'mongoose'

const OrderLineSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
)

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, trim: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customer: { type: Object },
    lines: { type: [OrderLineSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
    couponCode: { type: String, trim: true, uppercase: true },
    currency: { type: String, required: true, enum: ['INR', 'USD', 'EUR'], default: 'INR' },
    delivery: { type: Object },
    payment: { type: Object },
    orderStatus: {
      type: String,
      required: true,
      enum: ['created', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'created',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

export const Order = mongoose.model('Order', OrderSchema)
