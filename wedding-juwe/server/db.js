import mongoose from 'mongoose'

// Cache the connection promise so that in a serverless environment (Vercel),
// a warm function instance reuses the existing MongoDB connection instead of
// opening a new one on every request.
let connectionPromise = null

export function connectDB(uri) {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri)
  }
  return connectionPromise
}
