import mongoose from 'mongoose'

export async function connectToDb(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required')
  }

  mongoose.set('strictQuery', true)

  const dbName = process.env.MONGODB_DB_NAME
  const options = {
    serverSelectionTimeoutMS: 10000,
    ...(dbName ? { dbName } : {}),
  }

  await mongoose.connect(mongoUri, options)
  console.log(`MongoDB connected${dbName ? ` (db: ${dbName})` : ''}`)
}
