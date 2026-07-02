import { useEffect, useRef, useState } from 'react'
import { avatarUrl, randomSeed } from '../lib/avatar'

type Props = {
  /** The typed guest name — seeds the avatar until the user picks one. */
  name: string
  /** The chosen seed, or null while still following the name. */
  value: string | null
  onChange: (seed: string) => void
}

const GRID_SIZE = 8

function freshOptions(keep?: string | null): string[] {
  const opts: string[] = []
  if (keep) opts.push(keep)
  while (opts.length < GRID_SIZE) opts.push(randomSeed())
  return opts
}

/**
 * A circular avatar the guest can tap to change. Tapping opens a small grid of
 * Open Peeps options (with a reshuffle button); choosing one locks the avatar
 * to that seed. Until then the avatar follows the typed name.
 */
export default function AvatarPicker({ name, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<string[]>(() => freshOptions())
  const rootRef = useRef<HTMLDivElement>(null)

  const currentSeed = value ?? name

  // Close on outside click or Escape while the popup is open.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function toggle() {
    if (!open) setOptions(freshOptions(value))
    setOpen((v) => !v)
  }

  function pick(seed: string) {
    onChange(seed)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={toggle}
        aria-label="Tukar avatar"
        aria-expanded={open}
        className="relative rounded-full outline-none transition focus-visible:ring-2
          focus-visible:ring-gold/50 active:scale-[0.97]"
      >
        <img
          src={avatarUrl(currentSeed)}
          alt="Avatar anda"
          className="h-20 w-20 rounded-full border border-gold/50 bg-cream-deep shadow-sm"
        />
        {/* shuffle-icon badge signalling the avatar is changeable */}
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center
            rounded-full border-2 border-ivory bg-gradient-to-b from-gold to-gold/80 text-ivory shadow"
          aria-hidden="true"
        >
          <ShuffleIcon />
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Pilih avatar"
          className="absolute top-24 z-30 w-64 rounded-2xl border border-gold/40 bg-ivory p-3
            shadow-[0_18px_40px_-16px_rgba(44,36,69,0.4)]"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs uppercase tracking-[0.2em] text-green">Pilih avatar</p>
            <button
              type="button"
              onClick={() => setOptions(freshOptions(value))}
              aria-label="Jana pilihan baru"
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[0.7rem] uppercase
                tracking-wider text-violet/70 transition hover:text-violet active:scale-95"
            >
              <ShuffleIcon className="h-3.5 w-3.5" />
              Lagi
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {options.map((seed) => {
              const selected = seed === value
              return (
                <button
                  key={seed}
                  type="button"
                  onClick={() => pick(seed)}
                  aria-pressed={selected}
                  className={`rounded-full transition active:scale-95 ${
                    selected
                      ? 'ring-2 ring-gold ring-offset-1 ring-offset-ivory'
                      : 'ring-1 ring-gold/20 hover:ring-gold/60'
                  }`}
                >
                  <img
                    src={avatarUrl(seed)}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 rounded-full bg-cream-deep"
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ShuffleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="M15 15l6 6" />
      <path d="M4 4l5 5" />
    </svg>
  )
}
