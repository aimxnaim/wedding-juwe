import { Analytics } from '@vercel/analytics/react'
import arabicNamesGold from './assets/arabic-names-gold.webp'
import CountdownSection from './components/CountdownSection'
import Hero from './components/Hero'
import LocationSection from './components/LocationSection'
import MusicPlayer from './components/MusicPlayer'
import WishesSection from './components/WishesSection'

export default function App() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-cream shadow-xl">
      <Hero />
      <CountdownSection />
      <LocationSection />
      <WishesSection />
      <MusicPlayer />
      <footer className="bg-violet-deep py-7 text-center text-cream/60">
        <img
          src={arabicNamesGold}
          alt="نجوان & عائشة — Najwan & Aisyah"
          className="mx-auto w-40"
        />
        <p className="mt-3 text-xs uppercase tracking-[0.3em]">30 Ogos 2026</p>
        <p className="mt-4 text-[0.65rem] tracking-wide text-cream/30">
          Dibina oleh{' '}
          <a
            href="https://website-portfolio-sepia.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-soft/70 underline underline-offset-2 transition hover:text-gold-soft"
          >
            Aiman Naim
          </a>
        </p>
      </footer>
      <Analytics />
    </main>
  )
}
