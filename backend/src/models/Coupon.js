import mongoose from 'mongoose'

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    label: { type: String, trim: true },
    description: { type: String, trim: true },
    type: { type: String, required: true, enum: ['percentage', 'flat'] },
    value: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
    minSubtotal: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
  },
  { timestamps: true },
)

export const Coupon = mongoose.model('Coupon', CouponSchema)
