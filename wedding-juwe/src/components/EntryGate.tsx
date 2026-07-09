import { useEffect, useRef, useState } from 'react'
import welcomeGate from '../assets/welcome-gate-wedding-juwe.svg'

/**
 * Full-screen welcome gate shown on first load. While shut it is quietly
 * alive — the mandala turns slowly, gold rings ripple out from it, and a soft
 * light breathes behind it. Tapping anywhere swings the two halves apart on
 * their outer hinges — the mandala parts like a seal — revealing the site,
 * then the whole gate zooms forward and fades, as if walking through the
 * doorway.
 *
 * The tap is a real user gesture, so `onEnter` (which starts the background
 * music) runs inside the gesture call stack, satisfying the browser's autoplay
 * policy. The gate self-dismisses after the animation and does not reappear.
 */
export default function EntryGate({ onEnter }: { onEnter: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    rootRef.current?.focus()
  }, [])

  function open() {
    if (isOpen) return
    onEnter() // start music within the user-gesture call stack
    setIsOpen(true)
    // Unmount once the swing + zoom-through have finished (see index.css).
    window.setTimeout(() => setIsDone(true), 2000)
  }

  if (isDone) return null

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label="Buka jemputan"
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      }}
      className={`gate-overlay fixed inset-0 z-[60] cursor-pointer overflow-hidden outline-none ${
        isOpen ? 'is-open' : ''
      }`}
      style={{ perspective: '1400px' }}
    >
      <GateLeaf side="left" />
      <GateLeaf side="right" />
    </div>
  )
}

/** The artwork's own ground (--color-violet-deep): fills the stretchable middle
 * and, on desktop, the area beside the centred stage. Must stay in sync with
 * the background fills inside welcome-gate-wedding-juwe.svg. */
const GATE_BG = '#2c2445'

/**
 * The artwork is a fixed-aspect panel but phone screens are far taller, so it
 * is sliced into bands re-composed responsively: the top border pins to the
 * top, the bottom border pins to the bottom, the medallion group sits centred,
 * and the artwork's maroon fills whatever is between.
 *
 * Every vertical dimension here is a **percentage of the stage's width**,
 * expressed as percentage padding (for box heights) or percentage margin (for
 * image offsets). Both of those always resolve against the containing block's
 * *inline size*, in every browser.
 *
 * This is deliberate. The first version sized the medallion group with
 * `aspect-ratio` and gave its children percentage *heights*. Chrome resolved
 * those; Safari treats an aspect-ratio-derived height as indefinite, so each
 * divider's height collapsed to `auto` and spilled its full image — painting
 * extra mandalas and duplicate corner ornaments. Nothing below depends on a
 * parent's height.
 *
 * Geometry measured off a 400x563 render of the artwork:
 *   top border     rows   0..185
 *   top divider    rows 186..201
 *   mandala mask   rows 213.5..373.5  (centre x=199, medallion ~150px across)
 *   bottom divider rows 379..394
 *   bottom border  rows 447..562
 */
const ART_W = 400
/** A slice's height, as a % of stage width — used as percentage padding. */
const pad = (rows: number) => `${(rows / ART_W) * 100}%`
/** An image's offset, as a % of stage width — used as negative percentage margin. */
const shift = (rows: number) => `${(-rows / ART_W) * 100}%`

const MANDALA = { centerX: 199, top: 213.5, size: 160 }

function GateLeaf({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left'
  return (
    <div
      aria-hidden="true"
      className={`gate-leaf absolute ${isLeft ? 'gate-leaf-left' : 'gate-leaf-right'}`}
      // Overhang the viewport by 2px on every side. At fractional zoom / DPR the
      // leaf's box can round a hair short of the edge and leak a hairline of the
      // site through; bleeding past the edge makes that impossible. The 50% clip
      // still lands on the true centre since the overhang is symmetric.
      style={{ inset: '-2px', backgroundColor: GATE_BG }}
    >
      {/* Stage matches the app's centred card width, so the gate's proportions
          stay phone-like on desktop; the leaf's maroon fills either side. */}
      <div className="relative mx-auto h-full w-full max-w-md overflow-hidden">
        <Slice className="absolute top-0 left-0 w-full" rows={186} offset={0} />
        <MedallionGroup />
        <Slice className="absolute bottom-0 left-0 w-full" rows={116} offset={447} />
      </div>

      <div
        className={`gate-seam absolute inset-y-0 w-[8%] ${isLeft ? 'right-1/2' : 'left-1/2'}`}
        style={{
          background: `linear-gradient(to ${isLeft ? 'right' : 'left'}, transparent, rgba(0,0,0,0.35))`,
        }}
      />
    </div>
  )
}

/** A window onto the artwork showing `rows` rows starting at `offset`. Its
 * height comes from percentage padding; the image is pulled up by a negative
 * percentage margin and clipped by `overflow: hidden`. */
function Slice({
  className = '',
  rows,
  offset,
}: {
  className?: string
  rows: number
  offset: number
}) {
  return (
    <div className={`overflow-hidden ${className}`} style={{ height: 0, paddingBottom: pad(rows) }}>
      <img
        src={welcomeGate}
        alt=""
        className="block w-full max-w-none"
        style={{ marginTop: shift(offset) }}
      />
    </div>
  )
}

/** The two dividers, the slowly turning mandala, and its ripple/glow — stacked
 * in normal flow so no child depends on the group's height. */
function MedallionGroup() {
  return (
    <div className="absolute top-0 left-0 w-full" style={{ top: '50%', transform: 'translateY(-50%)' }}>
      <Slice rows={16} offset={186} />
      <div style={{ height: 0, paddingBottom: pad(11.5) }} />

      {/* Square wrapper: width 40% of the stage, height matched via padding. */}
      <div
        className="relative mx-auto"
        style={{ width: pad(MANDALA.size), height: 0, paddingBottom: pad(MANDALA.size) }}
      >
        {/* Mandala in a circular mask. Rotating it turns only the medallion —
            the rest of the circle is the artwork's own maroon, and the dividers
            sit outside the circle entirely. */}
        <div className="gate-mandala absolute inset-0 overflow-hidden rounded-full">
          {/* Inside the mask, percentage margins resolve against the *mask's*
              width (MANDALA.size), not the artwork's — so these offsets are
              scaled by that, not by ART_W. */}
          <img
            src={welcomeGate}
            alt=""
            className="absolute top-0 left-0 block max-w-none"
            style={{
              width: `${(ART_W / MANDALA.size) * 100}%`,
              marginLeft: `${(-(MANDALA.centerX - MANDALA.size / 2) / MANDALA.size) * 100}%`,
              marginTop: `${(-MANDALA.top / MANDALA.size) * 100}%`,
            }}
          />
        </div>

        {/* Gold rings rippling outward, staggered so one is always mid-flight. */}
        {[0, 2, 4].map((delay) => (
          <div
            key={delay}
            className="gate-ripple pointer-events-none absolute inset-0 rounded-full"
            style={{ border: '1px solid rgba(226,201,122,0.45)', animationDelay: `${delay}s` }}
          />
        ))}

        {/* Breathing gold light. It sits *above* the mandala and screen-blends:
            placed behind, the opaque maroon mask would hide its middle and it
            would read as a hard-edged ring. Sized by `scale()` off inset-0 so
            it never depends on the parent's resolved height. */}
        <div
          className="gate-glow pointer-events-none absolute inset-0 rounded-full"
          style={{
            mixBlendMode: 'screen',
            background: 'radial-gradient(circle, rgba(255,206,110,0.42), rgba(255,206,110,0) 70%)',
          }}
        />
      </div>

      <div style={{ height: 0, paddingBottom: pad(5.5) }} />
      <Slice rows={16} offset={379} />
    </div>
  )
}
