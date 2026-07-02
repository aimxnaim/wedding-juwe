import type { CSSProperties } from 'react'

/**
 * Ambient wedding motion for the hero: a scatter of plum/gold petals drifting
 * down and a few gold sparkles twinkling. Purely decorative and non-blocking.
 */

type Petal = {
  left: string
  size: number
  color: string
  duration: number
  delay: number
  drift: string
  opacity: number
}

const PETALS: Petal[] = [
  { left: '8%', size: 13, color: '#a884a0', duration: 13, delay: 0, drift: '30px', opacity: 0.5 },
  { left: '22%', size: 9, color: '#c9a227', duration: 17, delay: 4, drift: '-24px', opacity: 0.45 },
  { left: '38%', size: 11, color: '#7c556f', duration: 15, delay: 8, drift: '22px', opacity: 0.4 },
  { left: '54%', size: 8, color: '#e2c97a', duration: 19, delay: 2, drift: '34px', opacity: 0.5 },
  { left: '68%', size: 14, color: '#a884a0', duration: 14, delay: 6, drift: '-30px', opacity: 0.45 },
  { left: '82%', size: 10, color: '#c9a227', duration: 18, delay: 10, drift: '26px', opacity: 0.4 },
  { left: '92%', size: 8, color: '#7c556f', duration: 16, delay: 3, drift: '-20px', opacity: 0.4 },
]

const SPARKLES = [
  { left: '18%', top: '30%', size: 6, duration: 3.2, delay: 0 },
  { left: '78%', top: '24%', size: 5, duration: 4, delay: 1.1 },
  { left: '64%', top: '46%', size: 7, duration: 3.6, delay: 2 },
  { left: '30%', top: '52%', size: 5, duration: 4.4, delay: 0.6 },
  { left: '86%', top: '58%', size: 6, duration: 3.8, delay: 1.6 },
]

export default function FloatingAccents() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {PETALS.map((p, i) => (
        <span
          key={`p${i}`}
          className="petal"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size,
              background: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--petal-drift': p.drift,
              '--petal-opacity': p.opacity,
            } as CSSProperties
          }
        />
      ))}
      {SPARKLES.map((s, i) => (
        <span
          key={`s${i}`}
          className="sparkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
