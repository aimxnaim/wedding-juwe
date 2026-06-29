import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import wishesRouter from './routes/wishes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(__dirname, '../dist')

export function createApp() {
  const app = express()
  app.use(express.json())

  // Health check (handy for verifying a deploy is alive)
  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  app.use('/api/wishes', wishesRouter)

  // Optionally serve the built React site from this same server (used when
  // running as a single always-on process). On Vercel the static site is
  // served by the CDN, so this stays off (SERVE_STATIC is not set there).
  if (process.env.SERVE_STATIC === '1') {
    app.use(express.static(distPath))
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  return app
}
