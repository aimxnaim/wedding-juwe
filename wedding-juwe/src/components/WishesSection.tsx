import { useEffect, useState } from 'react'
import { getWishes, type Wish } from '../api/wishes'
import Divider from './Divider'
import FloatingAccents from './FloatingAccents'
import Reveal from './Reveal'
import SectionOrnament from './SectionOrnament'
import WishForm from './WishForm'
import WishList from './WishList'

export default function WishesSection() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWishes()
      .then(setWishes)
      .catch(() => setWishes([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="relative overflow-hidden bg-blush px-5 pb-16 pt-12">
      <FloatingAccents />

      <div className="relative mx-auto max-w-md">
        <Reveal>
          <SectionOrnament className="w-52" />
          <h2 className="mt-5 text-center font-display text-4xl text-violet">
            Ucapan &amp; Doa
          </h2>
          <Divider className="mt-4" />
        </Reveal>

        <Reveal delay={120}>
          <div
            className="mt-8 rounded-3xl border border-gold/40 bg-ivory p-6 shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)]
              ring-1 ring-inset ring-gold/15"
          >
            <WishForm onCreated={(wish) => setWishes((prev) => [wish, ...prev])} />
          </div>
        </Reveal>

        <Reveal delay={200} className="mt-10">
          {loading ? (
            <p className="text-center text-violet/50">Memuatkan ucapan…</p>
          ) : (
            <>
              {wishes.length > 0 && (
                <p className="mb-5 text-center text-sm uppercase tracking-[0.3em] text-gold">
                  {wishes.length} Ucapan
                </p>
              )}
              <WishList wishes={wishes} />
            </>
          )}
        </Reveal>
      </div>
    </section>
  )
}
