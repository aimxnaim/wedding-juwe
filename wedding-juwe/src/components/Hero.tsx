import Divider from './Divider'
import FloatingAccents from './FloatingAccents'
import Monogram from './Monogram'

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-paper px-6 pb-14 pt-12 text-center text-navy">
      <FloatingAccents />

      {/* corner flourishes */}
      <CornerOrnament className="absolute left-3 top-3" />
      <CornerOrnament className="absolute right-3 top-3 -scale-x-100" />

      <div className="relative">
        <p
          className="animate-fadeup font-arabic text-2xl text-navy/85"
          dir="rtl"
          style={{ animationDelay: '80ms' }}
        >
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْم
        </p>

        <p
          className="animate-fadeup mt-6 text-[0.7rem] uppercase tracking-[0.45em] text-plum"
          style={{ animationDelay: '200ms' }}
        >
          Raikan Cinta
        </p>

        <Monogram className="animate-crest mx-auto mt-2 mb-4 w-[21rem] max-w-[90%]" />

        <h1
          className="animate-fadeup font-display text-6xl leading-tight text-navy"
          style={{ animationDelay: '450ms' }}
        >
          Najwan Shah
        </h1>
        <p
          className="animate-fadeup my-1 font-display text-3xl italic text-plum/80"
          style={{ animationDelay: '560ms' }}
        >
          dan
        </p>
        <h1
          className="animate-fadeup font-display text-6xl leading-tight text-navy"
          style={{ animationDelay: '650ms' }}
        >
          Aisyah
        </h1>

        <Divider className="animate-fadeup mt-8" style={{ animationDelay: '780ms' }} />

        <div
          className="animate-fadeup mt-7 space-y-1"
          style={{ animationDelay: '880ms' }}
        >
          <p className="font-display text-2xl tracking-wide text-navy">
            Sabtu, 8 Ogos 2026
          </p>
          <p className="text-navy/60">Masjid Sri Sendayan</p>
        </div>
      </div>
    </header>
  )
}

function CornerOrnament({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-16 w-16 text-gold/60 ${className}`}
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
