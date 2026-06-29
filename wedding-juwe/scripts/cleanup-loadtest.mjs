// Remove all wishes created by the load test (names starting with "LOADTEST-").
//
// Usage (loads MONGODB_URI from .env):
//   node --env-file=.env scripts/cleanup-loadtest.mjs

import mongoose from 'mongoose'
import Wish from '../server/models/Wish.js'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is not set. Run with: node --env-file=.env scripts/cleanup-loadtest.mjs')
  process.exit(1)
}

await mongoose.connect(uri)
const res = await Wish.deleteMany({ name: { $regex: '^LOADTEST-' } })
console.log(`Removed ${res.deletedCount} load-test wishes.`)
await mongoose.disconnect()
