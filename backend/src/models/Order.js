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
      enum: ['created', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_requested', 'return_approved', 'return_rejected', 'returned', 'replacement_requested', 'replacement_approved', 'replacement_rejected', 'replaced'],
      default: 'created',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'failed'],
      default: 'pending',
    },
    returnRequest: {
      reason: { type: String },
      description: { type: String },
      requestedAt: { type: Date },
      approvedAt: { type: Date },
      rejectedAt: { type: Date },
      rejectionReason: { type: String },
    },
    replacementRequest: {
      reason: { type: String },
      description: { type: String },
      requestedAt: { type: Date },
      approvedAt: { type: Date },
      rejectedAt: { type: Date },
      rejectionReason: { type: String },
    },
    distance: {
      kilometers: { type: Number, default: 0 },
      fromNaviMumbai: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
)

export const Order = mongoose.model('Order', OrderSchema)
