import dotenv from 'dotenv'
import { connectToDb } from './db/connect.js'
import { seedFromPublicJsonIfEmpty } from './db/seedFromJson.js'
import { ensureAdminFromEnv } from './db/ensureAdmin.js'
import { createApp } from './app.js'

dotenv.config()

const PORT = Number(process.env.PORT || 4000)

async function main() {
  await connectToDb(process.env.MONGODB_URI)
  await seedFromPublicJsonIfEmpty()
  await ensureAdminFromEnv()

  const app = createApp()
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('Failed to start backend', err)
  process.exit(1)
})
