import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectToDb } from './db/connect.js'
import { seedFromPublicJsonIfEmpty } from './db/seedFromJson.js'
import { ensureAdminFromEnv } from './db/ensureAdmin.js'
import { createApp } from './app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

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
