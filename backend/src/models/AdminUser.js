import mongoose from 'mongoose'

const AdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const AdminUser = mongoose.model('AdminUser', AdminUserSchema)
