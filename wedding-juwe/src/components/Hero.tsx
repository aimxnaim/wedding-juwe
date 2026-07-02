import arabicNames from '../assets/arabic-names.webp'
import CornerFlorals from './CornerFlorals'
import FloatingAccents from './FloatingAccents'
import Monogram from './Monogram'

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-paper px-7 pb-16 pt-14 text-center text-violet">
      <FloatingAccents />
      {/* gold-and-plum floral spray anchored bottom-right, echoing the reference */}
      <CornerFlorals corners={['br']} className="w-24 sm:w-28" />

      {/* violet double-hairline frame */}
      <div className="pointer-events-none absolute inset-3 rounded-[1.9rem] border border-violet/45" />
      <div className="pointer-events-none absolute inset-[15px] rounded-[1.6rem] border border-violet/25" />

      <div className="relative">
        <p
          className="animate-fadeup font-arabic text-2xl text-violet/85"
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

        {/* gold wreath crest — the top floral ring of the reference */}
        <Monogram className="animate-crest mx-auto mt-3 mb-2 w-[19rem] max-w-[86%]" />

        {/* couple's names, lifted straight from the logo artwork's Arabic
            lettering (keyed to transparent and recoloured to the theme violet) */}
        <img
          src={arabicNames}
          alt="نجوان & عائشة — Najwan & Aisyah"
          className="animate-fadeup mx-auto mt-1 w-[17rem] max-w-[74%]"
          style={{ animationDelay: '450ms' }}
        />

        <DatePlate
          className="animate-fadeup"
          style={{ animationDelay: '820ms' }}
        />
      </div>
    </header>
  )
}

/**
 * The reference date block: month centred on top, a three-column row of
 * day · big date · time, and the year centred below — the flanking rules
 * bracket the day and time columns.
 */
function DatePlate({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`relative z-10 mx-auto mt-9 grid w-fit max-w-76 grid-cols-[1fr_auto_1fr]
        items-center gap-x-3 font-display text-violet ${className}`}
      style={style}
    >
      {/* left column: rule · AHAD · rule */}
      <Rule />
      <p className="text-center text-[0.72rem] uppercase tracking-[0.4em]">
        Ogos
      </p>
      <Rule className="-scale-x-100" />

      <p className="text-center text-[0.76rem] uppercase tracking-[0.3em]">Ahad</p>
      <p className="px-1 text-5xl leading-none tracking-wide">30</p>
      <p className="text-center text-[0.76rem] uppercase tracking-[0.2em]">
        12:00 PM
      </p>

      <Rule />
      <p className="text-center text-[0.82rem] tracking-[0.35em]">2026</p>
      <Rule className="-scale-x-100" />
    </div>
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
      className={`h-px w-full bg-gradient-to-r from-transparent to-violet/50 ${className}`}
    />
  )
}
