import type { Wish } from '../api/wishes'

type Props = { wishes: Wish[] }

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '♥'
}

export default function WishList({ wishes }: Props) {
  if (wishes.length === 0) {
    return (
      <p className="text-center font-display text-lg italic text-navy/50">
        Jadilah yang pertama meninggalkan ucapan.
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {wishes.map((wish) => (
        <li
          key={wish._id}
          className="animate-rise rounded-2xl border border-gold/30 bg-cream/80 p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                bg-navy font-display text-lg text-gold-soft"
            >
              {initial(wish.name)}
            </span>
            <p className="font-display text-xl text-green">{wish.name}</p>
          </div>
          <p className="mt-3 leading-relaxed text-navy/85">{wish.message}</p>
        </li>
      ))}
    </ul>
  )
}
