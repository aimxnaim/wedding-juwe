import { Router } from 'express'
import Wish from '../models/Wish.js'

const router = Router()

// Tiny in-memory cache so repeated homepage loads don't hit the database
// every time. Safe here because we run a single server instance. The cache
// is cleared the moment a new wish is added, so guests still see fresh data.
const CACHE_TTL_MS = 10_000
let cache = { data: null, expiresAt: 0 }

function clearCache() {
  cache = { data: null, expiresAt: 0 }
}

router.get('/', async (_req, res) => {
  try {
    if (cache.data && cache.expiresAt > Date.now()) {
      return res.json(cache.data)
    }
    const wishes = await Wish.find().sort({ createdAt: -1 }).lean()
    cache = { data: wishes, expiresAt: Date.now() + CACHE_TTL_MS }
    res.json(wishes)
  } catch {
    res.status(500).json({ error: 'Failed to load wishes' })
  }
})

router.post('/', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
  const rawSeed = typeof req.body?.avatarSeed === 'string' ? req.body.avatarSeed.trim() : ''
  // Cap the seed length; fall back to the name when none was chosen.
  const avatarSeed = (rawSeed || name).slice(0, 64)

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' })
  }

  try {
    const wish = await Wish.create({ name, message, avatarSeed })
    clearCache()
    res.status(201).json(wish)
  } catch {
    res.status(500).json({ error: 'Failed to save wish' })
  }
})

export default router
