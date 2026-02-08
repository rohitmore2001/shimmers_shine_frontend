import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    categoryId: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, enum: ['INR', 'USD', 'EUR'], default: 'INR' },
    metal: { type: String, trim: true },
    image: { type: String, required: true, trim: true }, // Keep for backward compatibility
    images: [{ type: String, trim: true }], // New field for multiple images
    rating: { type: Number, min: 0, max: 5 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Product = mongoose.model('Product', ProductSchema)
