import brFloral from '../assets/floral-corner-br.webp'
import tlFloral from '../assets/floral-corner-tl.webp'

type Corner = 'tl' | 'tr' | 'bl' | 'br'

/**
 * Lush plum/gold foliage tucked into chosen corners — the corner sprays from
 * the original Canva artwork, used to frame a section for an ornate feel.
 * Pass `corners` to control which corners appear (defaults to all four).
 */
export default function CornerFlorals({
  corners = ['tl', 'tr', 'bl', 'br'],
  className = 'w-28 sm:w-32',
}: {
  corners?: Corner[]
  className?: string
}) {
  const show = (c: Corner) => corners.includes(c)
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {show('tl') && (
        <img
          src={tlFloral}
          alt=""
          className={`animate-fadeup absolute -left-3 -top-3 ${className}`}
        />
      )}
      {show('tr') && (
        <img
          src={tlFloral}
          alt=""
          className={`animate-fadeup absolute -right-3 -top-3 -scale-x-100 ${className}`}
        />
      )}
      {show('bl') && (
        <img
          src={brFloral}
          alt=""
          className={`animate-fadeup absolute -bottom-2 -left-3 -scale-x-100 ${className}`}
        />
      )}
      {show('br') && (
        <img
          src={brFloral}
          alt=""
          className={`animate-fadeup absolute -bottom-2 -right-3 ${className}`}
        />
      )}
    </div>
  )
}
