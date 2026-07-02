import type { Wish } from '../api/wishes'

type Props = { wishes: Wish[] }

/** A themed illustrated avatar, seeded by the guest's name so it stays consistent. */
function avatarUrl(name: string) {
  const seed = encodeURIComponent(name.trim() || 'tetamu')
  return (
    `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}` +
    '&backgroundColor=f4ecda,e7d3a1,d8c2d4,efe3c8&radius=50'
  )
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
          className="animate-rise rounded-2xl border border-gold/30 bg-ivory p-5 shadow-[0_10px_26px_-14px_rgba(30,35,82,0.3)]"
        >
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl(wish.name)}
              alt=""
              loading="lazy"
              className="h-11 w-11 shrink-0 rounded-full border border-gold/50 bg-cream-deep"
            />
            <p className="font-display text-xl text-navy">{wish.name}</p>
          </div>
          <p className="mt-3 leading-relaxed text-navy/85">{wish.message}</p>
        </li>
      ))}
    </ul>
  )
}
