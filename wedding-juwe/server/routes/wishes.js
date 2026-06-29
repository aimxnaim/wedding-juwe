import { Router } from 'express'
import Wish from '../models/Wish.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const wishes = await Wish.find().sort({ createdAt: -1 }).lean()
    res.json(wishes)
  } catch {
    res.status(500).json({ error: 'Failed to load wishes' })
  }
})

router.post('/', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' })
  }

  try {
    const wish = await Wish.create({ name, message })
    res.status(201).json(wish)
  } catch {
    res.status(500).json({ error: 'Failed to save wish' })
  }
})

export default router
