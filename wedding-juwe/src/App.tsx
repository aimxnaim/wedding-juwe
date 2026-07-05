import arabicNamesGold from './assets/arabic-names-gold.webp'
import CountdownSection from './components/CountdownSection'
import Hero from './components/Hero'
import LocationSection from './components/LocationSection'
import WishesSection from './components/WishesSection'

export default function App() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-cream shadow-xl">
      <Hero />
      <CountdownSection />
      <LocationSection />
      <WishesSection />
      <footer className="bg-violet-deep py-7 text-center text-cream/60">
        <img
          src={arabicNamesGold}
          alt="نجوان & عائشة — Najwan & Aisyah"
          className="mx-auto w-40"
        />
        <p className="mt-3 text-xs uppercase tracking-[0.3em]">30 Ogos 2026</p>
        <a
          href="https://website-portfolio-sepia.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-[0.65rem] tracking-wide text-cream/30 transition hover:text-cream/50"
        >
          Dibina oleh Aiman Naim
        </a>
      </footer>
    </main>
  )
}
