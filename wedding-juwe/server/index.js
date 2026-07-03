import 'dotenv/config'
import { createApp } from './app.js'
import { connectDB } from './db.js'

const PORT = process.env.PORT || 3001

// Use a local MongoDB when running locally; use the configured URI in production.
const isLocal = process.env.NODE_ENV === 'development'
const uri = isLocal
  ? process.env.MONGODB_URI_LOCAL
  : process.env.MONGODB_URI

if (!uri) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.')
  process.exit(1)
}

console.log(`Connecting to MongoDB (${isLocal ? 'local' : 'production'})`)

connectDB(uri)
  .then(() => {
    const app = createApp()
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
