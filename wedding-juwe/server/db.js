import mongoose from 'mongoose'

export function connectDB(uri) {
  return mongoose.connect(uri)
}
