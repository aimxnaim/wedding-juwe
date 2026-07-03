import { useEffect, useState, type CSSProperties } from 'react'
import Divider from './Divider'
import FloatingAccents from './FloatingAccents'
import Reveal from './Reveal'
import SectionOrnament from './SectionOrnament'

const WEDDING_DATE_ISO = import.meta.env.DEV
  ? new Date(Date.now() + 3000).toISOString()
  : '2026-08-30T12:00:00+08:00'

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

function getTimeLeft(targetIso: string): TimeLeft {
  const diffMs = new Date(targetIso).getTime() - Date.now()

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isPast: false }
}

function useCountdown(targetIso: string): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetIso))

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(targetIso))
    }, 1000)
    return () => clearInterval(id)
  }, [targetIso])

  return timeLeft
}

export default function CountdownSection() {
  const { days, hours, minutes, seconds, isPast } = useCountdown(WEDDING_DATE_ISO)

  return (
    <section className="relative overflow-hidden bg-paper-fade px-5 pb-16 pt-14 text-violet">
      <FloatingAccents />
      {isPast && <CelebrationConfetti />}
      {isPast && <CelebrationFireworks />}

      <div className="relative mx-auto max-w-md">
        <Reveal>
          <SectionOrnament className="w-52" />
          <h2 className="mt-5 text-center font-display text-4xl text-violet">
            Detik Bahagia
          </h2>
          <Divider className="mt-4" />
        </Reveal>

        <Reveal delay={120}>
          <div
            className="relative mt-8 rounded-3xl border border-gold/40 bg-ivory p-6 shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)]
              ring-1 ring-inset ring-gold/15"
          >
            <CountdownGrid days={days} hours={hours} minutes={minutes} seconds={seconds} />
          </div>
        </Reveal>

        {isPast && (
          <Reveal className="mt-7 text-center">
            <Divider />
            <p className="animate-celebrate-glow mt-4 font-display text-3xl text-violet">
              Hari Bahagia Kami!
            </p>
            <p className="mx-auto mt-2 max-w-xs text-sm text-violet/70">
              Terima kasih kerana menjadi sebahagian daripada hari istimewa kami.
            </p>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function CountdownGrid({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number
  hours: number
  minutes: number
  seconds: number
}) {
  const units: { value: number; label: string }[] = [
    { value: days, label: 'Hari' },
    { value: hours, label: 'Jam' },
    { value: minutes, label: 'Minit' },
    { value: seconds, label: 'Saat' },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          <div className="flex flex-1 flex-col items-center gap-1">
            <p className="font-display text-4xl tabular-nums leading-none text-violet">
              {String(unit.value).padStart(2, '0')}
            </p>
            <p className="text-[0.62rem] uppercase tracking-[0.25em] text-plum">
              {unit.label}
            </p>
          </div>
          {index < units.length - 1 && (
            <span className="mx-1 -mt-4 text-lg text-gold/70">:</span>
          )}
        </div>
      ))}
    </div>
  )
}

const SPARK_OFFSETS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2
  const distance = 26 + (i % 2) * 12
  return {
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance),
    size: i % 2 === 0 ? 7 : 5,
  }
})

const FIREWORK_BURSTS = [
  { top: '4%', left: '12%', delay: 0 },
  { top: '4%', left: '86%', delay: 0.55 },
  { top: '68%', left: '8%', delay: 1.1 },
  { top: '68%', left: '90%', delay: 0.3 },
]

/** Gold sparks bursting outward from a few points scattered across the
 * section — corners of the section, away from the heading and the
 * countdown card, so it celebrates the whole moment rather than
 * cluttering the card. */
function CelebrationFireworks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {FIREWORK_BURSTS.map((burst, bi) => (
        <div
          key={`burst-${bi}`}
          className="absolute"
          style={{ top: burst.top, left: burst.left }}
        >
          {SPARK_OFFSETS.map((spark, si) => (
            <span
              key={`spark-${bi}-${si}`}
              className="firework-spark"
              style={
                {
                  width: spark.size,
                  height: spark.size,
                  animationDelay: `${burst.delay}s`,
                  '--burst-x': `${spark.x}px`,
                  '--burst-y': `${spark.y}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const CONFETTI_PETALS = [
  { left: '8%', size: 17, color: '#a884a0', duration: 5.2, delay: 0, drift: '38px', opacity: 0.85 },
  { left: '24%', size: 13, color: '#c9a227', duration: 6.4, delay: 0.7, drift: '-30px', opacity: 0.8 },
  { left: '40%', size: 15, color: '#7c556f', duration: 5.6, delay: 1.4, drift: '32px', opacity: 0.85 },
  { left: '56%', size: 12, color: '#e2c97a', duration: 6.8, delay: 0.3, drift: '-36px', opacity: 0.8 },
  { left: '70%', size: 17, color: '#a884a0', duration: 5.4, delay: 1.9, drift: '28px', opacity: 0.85 },
  { left: '84%', size: 14, color: '#c9a227', duration: 6.1, delay: 1, drift: '-32px', opacity: 0.8 },
  { left: '92%', size: 12, color: '#7c556f', duration: 5.9, delay: 2.3, drift: '24px', opacity: 0.8 },
]

/** Larger flower petals falling across the whole section like confetti —
 * separate from the sparks so the celebration reads across the section,
 * not crammed onto the small countdown card. */
function CelebrationConfetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {CONFETTI_PETALS.map((petal, i) => (
        <span
          key={`confetti-${i}`}
          className="petal"
          style={
            {
              left: petal.left,
              width: petal.size,
              height: petal.size,
              background: petal.color,
              animationDuration: `${petal.duration}s`,
              animationDelay: `${petal.delay}s`,
              '--petal-drift': petal.drift,
              '--petal-opacity': petal.opacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
