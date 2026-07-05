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
    let cancelled = false
    let latestRequestId = 0

    const refresh = () => {
      const requestId = ++latestRequestId
      return getWishes()
        .then((data) => {
          if (!cancelled && requestId === latestRequestId) setWishes(data)
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    refresh()

    const intervalId = setInterval(refresh, 15000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', refresh)

    return () => {
      cancelled = true
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', refresh)
    }
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
                <div className="mb-5 flex items-center justify-center gap-2.5">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/50" />
                  <span
                    className="rounded-full border border-gold/40 bg-ivory px-4 py-1.5 text-xs
                      uppercase tracking-[0.25em] text-violet/80 shadow-sm"
                  >
                    {wishes.length} Ucapan
                  </span>
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/50" />
                </div>
              )}
              <WishList wishes={wishes} />
            </>
          )}
        </Reveal>
      </div>
    </section>
  )
}
