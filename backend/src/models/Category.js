import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

export const Category = mongoose.model('Category', CategorySchema)
