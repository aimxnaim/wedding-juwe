import CornerFlorals from './CornerFlorals'
import Divider from './Divider'
import FloatingAccents from './FloatingAccents'
import Monogram from './Monogram'

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-paper px-7 pb-16 pt-14 text-center text-navy">
      <FloatingAccents />
      <CornerFlorals />

      {/* ornamental double-hairline gold frame */}
      <div className="pointer-events-none absolute inset-3 rounded-[1.9rem] border border-gold/35" />
      <div className="pointer-events-none absolute inset-[15px] rounded-[1.6rem] border border-gold/20" />

      <div className="relative">
        <p
          className="animate-fadeup font-arabic text-2xl text-navy/85"
          dir="rtl"
          style={{ animationDelay: '80ms' }}
        >
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْم
        </p>

        <FlourishLabel
          className="animate-fadeup mt-6"
          style={{ animationDelay: '200ms' }}
        >
          Raikan Cinta
        </FlourishLabel>

        <Monogram className="animate-crest mx-auto mt-3 mb-3 w-[20rem] max-w-[88%]" />

        <h1
          className="animate-fadeup font-display text-6xl leading-tight text-navy"
          style={{ animationDelay: '450ms' }}
        >
          Najwan Shah
        </h1>

        <div
          className="animate-fadeup my-2 flex items-center justify-center gap-4"
          style={{ animationDelay: '560ms' }}
        >
          <Rule />
          <span className="font-display text-3xl italic text-plum/80">dan</span>
          <Rule className="-scale-x-100" />
        </div>

        <h1
          className="animate-fadeup font-display text-6xl leading-tight text-navy"
          style={{ animationDelay: '650ms' }}
        >
          Aisyah
        </h1>

        <Divider className="animate-fadeup mt-8" style={{ animationDelay: '780ms' }} />

        {/* framed date plate */}
        <div
          className="animate-fadeup mx-auto mt-7 w-fit rounded-2xl border border-gold/30
            bg-cream/50 px-8 py-5 backdrop-blur-[1px]"
          style={{ animationDelay: '880ms' }}
        >
          <p className="text-[0.7rem] uppercase tracking-[0.4em] text-gold">
            Sabtu
          </p>
          <p className="mt-1 font-display text-3xl tracking-wide text-navy">
            8 Ogos 2026
          </p>
          <p className="mt-1 text-navy/60">Masjid Sri Sendayan</p>
        </div>
      </div>
    </header>
  )
}

/** A centered label flanked by small gold leaf sprigs. */
function FlourishLabel({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      style={style}
    >
      <Sprig />
      <p className="text-[0.72rem] uppercase tracking-[0.5em] text-plum">
        {children}
      </p>
      <Sprig className="-scale-x-100" />
    </div>
  )
}

function Sprig({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-3 w-8 text-gold ${className}`}
      viewBox="0 0 32 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 6h22" stroke="currentColor" strokeWidth="1" />
      <path
        d="M23 6c3-2 5-2 8-4M23 6c3 2 5 2 8 4M17 6c1.5-1.5 3-1.5 5-3M17 6c1.5 1.5 3 1.5 5 3"
        stroke="currentColor"
        strokeWidth="0.9"
      />
    </svg>
  )
}

function Rule({ className = '' }: { className?: string }) {
  return (
    <span
      className={`h-px w-12 bg-gradient-to-r from-transparent to-gold/70 ${className}`}
    />
  )
}
