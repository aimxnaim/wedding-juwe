import brFloral from '../assets/floral-corner-br.webp'
import tlFloral from '../assets/floral-corner-tl.webp'

/**
 * Lush plum/gold foliage tucked into the four corners of the hero — the corner
 * sprays from the original Canva artwork, framing the content for an ornate feel.
 */
export default function CornerFlorals() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <img
        src={tlFloral}
        alt=""
        className="animate-fadeup absolute -left-3 -top-3 w-28 sm:w-32"
      />
      <img
        src={tlFloral}
        alt=""
        className="animate-fadeup absolute -right-3 -top-3 w-28 -scale-x-100 sm:w-32"
      />
      <img
        src={brFloral}
        alt=""
        className="animate-fadeup absolute -bottom-3 -left-3 w-24 -scale-x-100 sm:w-28"
      />
      <img
        src={brFloral}
        alt=""
        className="animate-fadeup absolute -bottom-3 -right-3 w-24 sm:w-28"
      />
    </div>
  )
}
