import mongoose from 'mongoose'

const CustomerAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    addressLine: { type: String, trim: true },
    city: { type: String, trim: true },
    pincode: { type: String, trim: true },
  },
  { _id: false },
)

const CustomerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    active: { type: Boolean, default: true },
    addresses: { type: [CustomerAddressSchema], default: [] },
    defaultAddress: { type: CustomerAddressSchema },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
)

export const Customer = mongoose.model('Customer', CustomerSchema)
