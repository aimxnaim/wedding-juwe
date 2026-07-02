import { useEffect, useRef, useState } from 'react'
import type { Wish } from '../api/wishes'
import { avatarUrl } from '../lib/avatar'

type Props = { wishes: Wish[] }

const AUTO_ADVANCE_MS = 5000

/**
 * A swipeable one-card-at-a-time carousel (native CSS scroll-snap, so touch
 * dragging is free). Auto-advances every 5s when idle; any user interaction
 * pauses it, then it resumes after another idle period.
 */
export default function WishList({ wishes }: Props) {
  const trackRef = useRef<HTMLUListElement>(null)
  const cardRefs = useRef<Array<HTMLLIElement | null>>([])
  const [active, setActive] = useState(0)
  const pausedRef = useRef(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Track which card is centred in view, so the dots and auto-advance agree
  // with whatever the user last scrolled to (manually or automatically).
  useEffect(() => {
    const track = trackRef.current
    if (!track || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!mostVisible) return
        const index = cardRefs.current.findIndex((el) => el === mostVisible.target)
        if (index !== -1) setActive(index)
      },
      { root: track, threshold: [0.6] },
    )
    cardRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [wishes.length])

  // Auto-advance to the next card every 5s, unless paused or the guest
  // prefers reduced motion.
  useEffect(() => {
    if (wishes.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      if (pausedRef.current) return
      scrollToCard((active + 1) % wishes.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(id)
  }, [active, wishes.length])

  function scrollToCard(index: number) {
    cardRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }

  function pause() {
    pausedRef.current = true
    clearTimeout(resumeTimerRef.current)
  }

  function scheduleResume() {
    clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false
    }, AUTO_ADVANCE_MS)
  }

  if (wishes.length === 0) {
    return (
      <p className="text-center font-display text-lg italic text-violet/50">
        Jadilah yang pertama meninggalkan ucapan.
      </p>
    )
  }

  return (
    <div>
      <ul
        ref={trackRef}
        onPointerDown={pause}
        onPointerUp={scheduleResume}
        onPointerCancel={scheduleResume}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-8 pb-1"
      >
        {wishes.map((wish, i) => (
          <li
            key={wish._id}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="animate-rise w-[78%] shrink-0 snap-center rounded-2xl border border-gold/30
              bg-ivory p-5 shadow-[0_10px_26px_-14px_rgba(30,35,82,0.3)]"
          >
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl(wish.avatarSeed || wish.name)}
                alt=""
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded-full border border-gold/50 bg-cream-deep"
              />
              <p className="font-display text-xl text-violet">{wish.name}</p>
            </div>
            <p className="mt-3 leading-relaxed text-violet/85">{wish.message}</p>
          </li>
        ))}
      </ul>

      {wishes.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {wishes.map((wish, i) => (
            <button
              key={wish._id}
              type="button"
              aria-label={`Ucapan ${i + 1}`}
              aria-current={i === active}
              onClick={() => {
                pause()
                scrollToCard(i)
                scheduleResume()
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? 'w-5 bg-gold' : 'w-1.5 bg-gold/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
