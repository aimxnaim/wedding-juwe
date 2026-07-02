import Hero from './components/Hero'
import WishesSection from './components/WishesSection'

export default function App() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-cream shadow-xl">
      <Hero />
      <WishesSection />
      <footer className="bg-navy-deep py-7 text-center text-cream/60">
        <p className="font-display text-xl text-gold-soft">Najwan &amp; Aisyah</p>
        <p className="mt-1 text-xs uppercase tracking-[0.3em]">8 Ogos 2026</p>
      </footer>
    </main>
  )
}
