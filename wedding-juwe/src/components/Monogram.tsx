import crest from '../assets/monogram-crest.webp'

/**
 * The couple's wreath crest (gold ring, plum/gold florals, N·H monogram),
 * lifted from the Canva artwork and framed as a cream enclosure card so the
 * navy monogram reads against the maroon hero.
 */
export default function Monogram({ className = '' }: { className?: string }) {
  return (
    <img
      src={crest}
      alt="Najwan Shah & Aisyah monogram"
      className={`rounded-3xl border border-gold/60 shadow-[0_14px_30px_-10px_rgba(0,0,0,0.55)] ${className}`}
    />
  )
}
