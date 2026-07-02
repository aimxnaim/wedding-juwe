import crest from '../assets/monogram-crest.webp'

/**
 * The couple's wreath crest (gold ring, plum/gold florals, N·H monogram),
 * extracted from the Canva artwork on a transparent background so it sits
 * directly on the cream hero.
 */
export default function Monogram({ className = '' }: { className?: string }) {
  return (
    <img
      src={crest}
      alt="Najwan Shah & Aisyah monogram"
      className={className}
    />
  )
}
