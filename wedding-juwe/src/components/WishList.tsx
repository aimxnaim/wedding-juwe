import { useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
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
  const inViewRef = useRef(false)

  // Only auto-advance while the carousel is actually on screen, so it can't
  // do anything (visible or not) to the page's scroll position while the
  // guest is elsewhere, e.g. still up on the hero.
  useEffect(() => {
    const track = trackRef.current
    if (!track || typeof IntersectionObserver === 'undefined') {
      inViewRef.current = true
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting
    })
    io.observe(track)
    return () => io.disconnect()
  }, [])

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
      if (pausedRef.current || !inViewRef.current) return
      scrollToCard((active + 1) % wishes.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(id)
  }, [active, wishes.length])

  // Scrolls only the carousel's own horizontal track — never scrollIntoView,
  // which walks up every scrollable ancestor (including the page itself) and
  // would yank the whole viewport down to the carousel on auto-advance.
  function scrollToCard(index: number) {
    const track = trackRef.current
    const card = cardRefs.current[index]
    if (!track || !card) return
    const trackRect = track.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const cardOffset = cardRect.left - trackRect.left + track.scrollLeft
    const target = cardOffset - (track.clientWidth - card.clientWidth) / 2
    track.scrollTo({ left: target, behavior: 'smooth' })
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

  function goTo(index: number) {
    pause()
    scrollToCard((index + wishes.length) % wishes.length)
    scheduleResume()
  }

  return (
    <div className="relative">
      {wishes.length > 1 && (
        <button
          type="button"
          aria-label="Ucapan sebelumnya"
          onClick={() => goTo(active - 1)}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gold/30
            bg-ivory/90 p-1.5 text-gold shadow-[0_4px_12px_-6px_rgba(30,35,82,0.4)]"
        >
          <FiChevronLeft size={20} />
        </button>
      )}

      <ul
        ref={trackRef}
        onPointerDown={pause}
        onPointerUp={scheduleResume}
        onPointerCancel={scheduleResume}
        className="no-scrollbar flex snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-smooth px-8 pb-1"
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
            <WishMessage message={wish.message} />
          </li>
        ))}
      </ul>

      {wishes.length > 1 && (
        <button
          type="button"
          aria-label="Ucapan seterusnya"
          onClick={() => goTo(active + 1)}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gold/30
            bg-ivory/90 p-1.5 text-gold shadow-[0_4px_12px_-6px_rgba(30,35,82,0.4)]"
        >
          <FiChevronRight size={20} />
        </button>
      )}

      {wishes.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {wishes.map((wish, i) => (
            <button
              key={wish._id}
              type="button"
              aria-label={`Ucapan ${i + 1}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
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

/**
 * Clamps a wish message to 4 lines and reveals a "Baca Lagi" toggle only
 * when the text actually overflows the clamp — so short messages never show
 * a pointless button, and each card's expand state stays local to itself.
 */
function WishMessage({ message }: { message: string }) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    setIsOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [message])

  return (
    <>
      <p
        ref={textRef}
        className={`mt-3 leading-relaxed text-violet/85 ${expanded ? '' : 'line-clamp-4'}`}
      >
        {message}
      </p>
      {(isOverflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1.5 text-sm font-medium text-gold underline-offset-2 hover:underline"
        >
          {expanded ? 'Lebih Sikit' : 'Baca Lagi'}
        </button>
      )}
    </>
  )
}
