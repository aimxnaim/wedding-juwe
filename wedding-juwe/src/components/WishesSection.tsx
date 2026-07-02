import { useEffect, useState } from 'react'
import { getWishes, type Wish } from '../api/wishes'
import Divider from './Divider'
import Reveal from './Reveal'
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
    <section className="bg-blush px-5 py-14">
      <div className="mx-auto max-w-md">
        <Reveal>
          <h2 className="text-center font-display text-4xl text-navy">
            Ucapan &amp; Doa
          </h2>
          <Divider className="mt-4" />
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-8 rounded-3xl border border-gold/30 bg-cream-deep/60 p-6 shadow-sm">
            <WishForm onCreated={(wish) => setWishes((prev) => [wish, ...prev])} />
          </div>
        </Reveal>

        <div className="mt-10">
          {loading ? (
            <p className="text-center text-navy/50">Memuatkan ucapan…</p>
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
        </div>
      </div>
    </section>
  )
}
