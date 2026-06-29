import express from 'express'
import wishesRouter from './routes/wishes.js'

export function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/wishes', wishesRouter)
  return app
}
