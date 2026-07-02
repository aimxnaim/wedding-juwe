import { useState } from 'react'
import { createWish, type Wish } from '../api/wishes'
import AvatarPicker from './AvatarPicker'

type Props = { onCreated: (wish: Wish) => void }

const fieldClass =
  'w-full rounded-lg border border-gold/40 bg-cream px-4 py-3 text-violet ' +
  'placeholder:text-violet/35 outline-none transition focus:border-gold ' +
  'focus:ring-2 focus:ring-gold/30'

export default function WishForm({ onCreated }: Props) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  // null while the avatar follows the typed name; a seed once the guest picks.
  const [avatarSeed, setAvatarSeed] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('sending')
    try {
      const wish = await createWish({
        name: name.trim(),
        message: message.trim(),
        avatarSeed: avatarSeed ?? name.trim(),
      })
      onCreated(wish)
      setName('')
      setMessage('')
      setAvatarSeed(null)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col items-center">
        <AvatarPicker name={name} value={avatarSeed} onChange={setAvatarSeed} />
        <p className="mt-2 text-xs text-violet/50">Ketik untuk tukar avatar</p>
      </div>
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm uppercase tracking-wider text-green"
        >
          Nama
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama anda"
          className={fieldClass}
          required
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm uppercase tracking-wider text-green"
        >
          Ucapan
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Tinggalkan ucapan & doa anda…"
          className={`${fieldClass} resize-none`}
          required
        />
      </div>

      {error && <p className="text-sm text-plum">{error}</p>}
      {status === 'done' && (
        <p className="text-center text-sm text-green">
          Terima kasih atas ucapan anda 🤍
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-gradient-to-b from-violet to-violet-deep py-3.5
          text-sm uppercase tracking-[0.2em] text-gold-soft shadow-md transition
          hover:from-violet-deep hover:to-violet active:scale-[0.99]
          disabled:opacity-60"
      >
        {status === 'sending' ? 'Menghantar…' : 'Hantar Ucapan'}
      </button>
    </form>
  )
}
