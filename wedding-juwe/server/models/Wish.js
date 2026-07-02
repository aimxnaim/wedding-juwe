import mongoose from 'mongoose'

const wishSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  // Seed for the guest's chosen Open Peeps avatar; empty falls back to the name.
  avatarSeed: { type: String, trim: true, default: '', maxlength: 64 },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Wish', wishSchema)
