type Props = { className?: string }

/** A small gold flourish used to separate sections. */
export default function Divider({ className = '' }: Props) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-gold ${className}`}
      aria-hidden="true"
    >
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/70" />
      <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
        <path
          d="M14 1.5c2.5 3.5 5.5 4 9 5-3.5 1-6.5 1.5-9 5-2.5-3.5-5.5-4-9-5 3.5-1 6.5-1.5 9-5Z"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <circle cx="14" cy="6.5" r="1.4" fill="currentColor" />
      </svg>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/70" />
    </div>
  )
}
