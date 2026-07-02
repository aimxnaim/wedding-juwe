import Divider from './Divider'
import Monogram from './Monogram'

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-maroon-deep via-maroon to-maroon px-6 pb-16 pt-14 text-center text-cream">
      {/* corner flourishes */}
      <CornerOrnament className="absolute left-3 top-3" />
      <CornerOrnament className="absolute right-3 top-3 -scale-x-100" />

      <p className="font-arabic text-2xl text-gold-soft" dir="rtl">
        بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْم
      </p>

      <p className="mt-6 font-display text-sm uppercase tracking-[0.45em] text-gold-soft">
        Raikan Cinta
      </p>

      <Monogram className="mx-auto mt-5 mb-7 w-[19rem] max-w-[86%]" />

      <h1 className="font-display text-5xl leading-tight text-gold-soft sm:text-6xl">
        Najwan Shah
      </h1>
      <p className="my-1 font-display text-3xl italic text-cream/80">dan</p>
      <h1 className="font-display text-5xl leading-tight text-gold-soft sm:text-6xl">
        Aisyah
      </h1>

      <Divider className="mt-9" />

      <div className="mt-7 space-y-1">
        <p className="font-display text-2xl tracking-wide text-cream">
          Sabtu, 8 Ogos 2026
        </p>
        <p className="text-cream/70">Masjid Sri Sendayan</p>
      </div>
    </header>
  )
}

function CornerOrnament({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-16 w-16 text-gold/40 ${className}`}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2c18 0 30 12 30 30M2 12c14 0 22 8 22 22M2 22c10 0 14 4 14 14"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  )
}
