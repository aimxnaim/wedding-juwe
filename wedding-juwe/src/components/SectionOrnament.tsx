/** An elegant symmetric gold flourish used to open a section. */
export default function SectionOrnament({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 44"
      className={`mx-auto text-gold ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        {/* tapering side rules */}
        <path d="M24 22h74" opacity="0.75" />
        <path d="M236 22h-74" opacity="0.75" />
        {/* delicate leaf sprigs curling toward the centre */}
        <path d="M98 22c-7-3-11-8-12-16" strokeWidth="0.9" />
        <path d="M98 22c-7 3-11 8-12 16" strokeWidth="0.9" />
        <path d="M162 22c7-3 11-8 12-16" strokeWidth="0.9" />
        <path d="M162 22c7 3 11 8 12 16" strokeWidth="0.9" />
      </g>
      {/* centre diamond */}
      <path
        d="M130 9c3 6.5 6 8.5 12.5 13-6.5 4.5-9.5 6.5-12.5 13-3-6.5-6-8.5-12.5-13 6.5-4.5 9.5-6.5 12.5-13Z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="24" cy="22" r="1.7" fill="currentColor" />
      <circle cx="236" cy="22" r="1.7" fill="currentColor" />
    </svg>
  )
}
