import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiClock, FiRotateCcw } from 'react-icons/fi'
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
  const [openWish, setOpenWish] = useState<Wish | null>(null)
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

  // Hold the carousel still while a guest reads a wish in the modal, then
  // fall back to the normal idle countdown once they close it.
  useEffect(() => {
    if (!openWish) return
    pause()
    return () => scheduleResume()
  }, [openWish])

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

  // Stable identity so WishModal's effect doesn't re-run on every parent render.
  const closeModal = useCallback(() => setOpenWish(null), [])

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

  const isLast = active === wishes.length - 1

  return (
    <div>
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
            className="animate-rise min-h-64 w-[78%] shrink-0 snap-center rounded-2xl border border-gold/30
              bg-ivory p-5 shadow-[0_10px_26px_-14px_rgba(30,35,82,0.3)]"
          >
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl(wish.avatarSeed || wish.name)}
                alt=""
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded-full border border-gold/50 bg-cream-deep"
              />
              <div>
                <p className="font-display text-xl text-violet">{wish.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[0.7rem] text-violet/70">
                  <FiClock className="h-3 w-3 text-gold" aria-hidden="true" />
                  {formatWishDate(wish.createdAt)}
                </p>
              </div>
            </div>
            <WishMessage message={wish.message} onReadMore={() => setOpenWish(wish)} />
          </li>
        ))}
      </ul>

      {wishes.length > 1 && isLast && (
        <div className="animate-rise mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => goTo(0)}
            className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-ivory px-4 py-1.5
              text-sm font-medium text-gold shadow-[0_4px_12px_-6px_rgba(30,35,82,0.4)]"
          >
            <FiRotateCcw size={14} />
            Kembali ke awal
          </button>
        </div>
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

      {openWish && <WishModal wish={openWish} onClose={closeModal} />}
    </div>
  )
}

const wishDayFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** Formats a wish's timestamp, e.g. "5 July 2026, 3:45 PM". */
function formatWishDate(createdAt: string): string {
  const date = new Date(createdAt)
  const hours = date.getHours()
  const hour12 = hours % 12 || 12
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const meridiem = hours < 12 ? 'AM' : 'PM'
  return `${wishDayFormatter.format(date)}, ${hour12}:${minutes} ${meridiem}`
}

/**
 * Clamps a wish message to 4 lines and reveals a "Baca Lagi" button only when
 * the text actually overflows the clamp — so short messages never show a
 * pointless button. Reading the rest happens in WishModal, not in the card,
 * which keeps every card the same height inside the carousel.
 */
function WishMessage({ message, onReadMore }: { message: string; onReadMore: () => void }) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    setIsOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [message])

  return (
    <>
      <p ref={textRef} className="mt-3 leading-relaxed text-violet/85 line-clamp-4">
        {message}
      </p>
      {isOverflowing && (
        <button
          type="button"
          onClick={onReadMore}
          className="mt-1.5 text-sm font-medium text-gold underline-offset-2 hover:underline"
        >
          Baca Lagi
        </button>
      )}
    </>
  )
}

/**
 * Shows one wish's full, unclamped message over a dimmed backdrop. Portalled to
 * document.body so the carousel's `overflow-x-auto` track can't clip it. Closes
 * on backdrop tap; Escape is a silent fallback so keyboard users aren't trapped.
 */
function WishModal({ wish, onClose }: { wish: Wish; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <div
      // Only a tap on the backdrop itself closes — a tap that started on the
      // card (e.g. scrolling a long message) bubbles up here and must not.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-[55] flex items-center justify-center bg-violet/40 p-6 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ucapan daripada ${wish.name}`}
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gold/30 bg-ivory p-6
          shadow-[0_20px_50px_-20px_rgba(30,35,82,0.6)]"
      >
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl(wish.avatarSeed || wish.name)}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full border border-gold/50 bg-cream-deep"
          />
          <div>
            <p className="font-display text-xl text-violet">{wish.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[0.7rem] text-violet/70">
              <FiClock className="h-3 w-3 text-gold" aria-hidden="true" />
              {formatWishDate(wish.createdAt)}
            </p>
          </div>
        </div>
        <p className="mt-4 leading-relaxed text-violet/85">{wish.message}</p>
      </div>
    </div>,
    document.body,
  )
}
