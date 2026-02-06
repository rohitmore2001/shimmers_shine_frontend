import mongoose from 'mongoose'

export async function connectToDb(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required')
  }

  mongoose.set('strictQuery', true)

  const dbName = process.env.MONGODB_DB_NAME
  const options = {
    serverSelectionTimeoutMS: 5000,
    ...(dbName ? { dbName } : {}),
  }

  try {
    await mongoose.connect(mongoUri, options)
    console.log(`MongoDB connected${dbName ? ` (db: ${dbName})` : ''}`)
  } catch (error) {
    console.warn('MongoDB connection failed, running without database:', error.message)
    // Don't throw error, allow server to start without DB
  }
}
