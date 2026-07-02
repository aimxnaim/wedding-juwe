import arabicNamesGold from './assets/arabic-names-gold.webp'
import Hero from './components/Hero'
import WishesSection from './components/WishesSection'

export default function App() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-cream shadow-xl">
      <Hero />
      <WishesSection />
      <footer className="bg-violet-deep py-7 text-center text-cream/60">
        <img
          src={arabicNamesGold}
          alt="نجوان & عائشة — Najwan & Aisyah"
          className="mx-auto w-40"
        />
        <p className="mt-3 text-xs uppercase tracking-[0.3em]">30 Ogos 2026</p>
      </footer>
    </main>
  )
}
