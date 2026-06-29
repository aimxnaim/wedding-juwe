import { createApp } from '../server/app.js'
import { connectDB } from '../server/db.js'

// Vercel serverless entry point. All /api/* requests are routed here (see
// vercel.json rewrites) and handled by the existing Express app. We ensure a
// (cached) MongoDB connection before delegating to Express.
const app = createApp()

export default async function handler(req, res) {
  if (!process.env.MONGODB_URI) {
    res.status(500).json({ error: 'MONGODB_URI is not configured.' })
    return
  }
  await connectDB(process.env.MONGODB_URI)
  return app(req, res)
}
