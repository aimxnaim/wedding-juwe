import { useEffect, useRef, useState } from 'react'
import welcomeGate from '../assets/welcome-gate-wedding-juwe.svg'

/**
 * Full-screen welcome gate shown on first load. While shut it is quietly
 * alive — the mandala turns slowly, a gold sheen sweeps across it, and a soft
 * light breathes behind the medallion. Tapping anywhere swings the two halves
 * apart on their outer hinges — the mandala parts like a seal — revealing the
 * site, then the whole gate zooms forward and fades, as if walking through the
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

/** The artwork's own maroon ground, used to fill the stretchable middle and
 * (on desktop) the area beside the centred stage. */
const GATE_MAROON = '#510400'

/**
 * The artwork is a fixed-aspect panel but phone screens are far taller, so it
 * is sliced into bands that re-compose responsively: the top border pins to
 * the top, the bottom border pins to the bottom, the medallion group sits
 * centred, and the artwork's maroon fills whatever is between.
 *
 * Every band is a window onto the same SVG: the image is drawn at the stage's
 * full width and slid up by `offset` so the wanted slice lands in view.
 * Percentage margins resolve against the container's *width*, which is what we
 * want since the image is width-scaled — so all of this stays correct at any
 * stage width.
 *
 * Geometry measured off a 400x563 render of the artwork:
 *   top border    rows   0..185
 *   top divider   rows 186..201
 *   mandala       rows 219..368, centred at x=199, ~150px across
 *   bottom divider rows 379..394
 *   bottom border rows 447..562
 */
const ART_W = 400
const pctOfWidth = (px: number) => `${(px / ART_W) * 100}%`

/** Medallion group spans the two dividers and the mandala: rows 186..394. */
const GROUP_TOP = 186
const GROUP_ROWS = 209
const pctOfGroup = (px: number) => `${(px / GROUP_ROWS) * 100}%`

/** The mandala's circular mask: a touch wider than the medallion so its
 * outer points are never clipped. The ring between them is plain maroon, so
 * spinning the circle shows only the mandala turning. */
const MANDALA_CENTER = { x: 199, y: 293.5 }
const MANDALA_R = 80

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
      style={{ inset: '-2px', backgroundColor: GATE_MAROON }}
    >
      {/* Stage matches the app's centred card width, so the gate's proportions
          stay phone-like on desktop; the leaf's maroon fills either side. */}
      <div className="relative mx-auto h-full w-full max-w-md overflow-hidden">
        <Band className="top-0" aspectRatio={ART_W / 186} offset={0} />
        <MedallionGroup />
        <Band className="bottom-0" aspectRatio={ART_W / 116} offset={447} />
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

/** A full-width window onto the artwork, showing the slice starting at `offset`. */
function Band({
  className,
  aspectRatio,
  offset,
}: {
  className: string
  aspectRatio: number
  offset: number
}) {
  return (
    <div className={`absolute right-0 left-0 overflow-hidden ${className}`} style={{ aspectRatio }}>
      <img
        src={welcomeGate}
        alt=""
        className="block h-auto w-full"
        style={{ marginTop: `-${pctOfWidth(offset)}` }}
      />
    </div>
  )
}

/** The two dividers (static) plus the mandala (slowly turning), centred. */
function MedallionGroup() {
  return (
    <div
      className="absolute top-1/2 right-0 left-0 -translate-y-1/2"
      style={{ aspectRatio: ART_W / GROUP_ROWS }}
    >
      <Divider top={pctOfGroup(0)} offset={186} />

      {/* Mandala in a circular mask: rotating it turns only the medallion, since
          the rest of the circle is the artwork's own maroon. Centring lives on
          this wrapper — the spin keyframe replaces `transform` wholesale, so it
          must not share an element with the translate. */}
      <div
        className="absolute left-1/2 aspect-square -translate-x-1/2"
        style={{
          top: pctOfGroup(MANDALA_CENTER.y - MANDALA_R - GROUP_TOP),
          width: pctOfWidth(MANDALA_R * 2),
        }}
      >
        <div className="gate-mandala h-full w-full overflow-hidden rounded-full">
          <img
            src={welcomeGate}
            alt=""
            className="absolute block h-auto max-w-none"
            style={{
              // sized/offset so the artwork lands with the mandala dead-centre
              width: `${(ART_W / (MANDALA_R * 2)) * 100}%`,
              left: `${(-(MANDALA_CENTER.x - MANDALA_R) / (MANDALA_R * 2)) * 100}%`,
              top: `${(-(MANDALA_CENTER.y - MANDALA_R) / (MANDALA_R * 2)) * 100}%`,
            }}
          />
        </div>
      </div>

      <Divider top={pctOfGroup(379 - GROUP_TOP)} offset={379} />

      {/* Gold rings rippling outward from the medallion. Staggered so one is
          always mid-flight. Centred on the mandala, so nothing reads as skewed. */}
      {[0, 2, 4].map((delay) => (
        <div
          key={delay}
          className="gate-ripple pointer-events-none absolute left-1/2 aspect-square w-[40%] rounded-full"
          style={{
            top: pctOfGroup(MANDALA_CENTER.y - GROUP_TOP),
            transform: 'translate(-50%, -50%)',
            border: '1px solid rgba(226,201,122,0.45)',
            animationDelay: `${delay}s`,
          }}
        />
      ))}

      {/* Breathing gold light over the medallion. It sits *above* the mandala
          and screen-blends: the mandala's mask is opaque maroon, so a glow
          behind it would be hidden in the middle and read as a hard-edged ring.
          The base transform centres it; the pulse keyframe re-declares the same
          translate so the centring holds through the animation. */}
      <div
        className="gate-glow pointer-events-none absolute left-1/2 aspect-square w-[62%] rounded-full"
        style={{
          top: pctOfGroup(MANDALA_CENTER.y - GROUP_TOP),
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'screen',
          background: 'radial-gradient(circle, rgba(255,206,110,0.42), rgba(255,206,110,0) 70%)',
        }}
      />
    </div>
  )
}

/** One thin ornamental divider, held still while the mandala turns. */
function Divider({ top, offset }: { top: string; offset: number }) {
  return (
    <div
      className="absolute right-0 left-0 overflow-hidden"
      style={{ top, height: pctOfGroup(16) }}
    >
      <img
        src={welcomeGate}
        alt=""
        className="block h-auto w-full"
        style={{ marginTop: `-${pctOfWidth(offset)}` }}
      />
    </div>
  )
}
