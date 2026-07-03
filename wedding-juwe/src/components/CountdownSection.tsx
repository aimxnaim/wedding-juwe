import { useEffect, useState } from 'react'
import Divider from './Divider'
import FloatingAccents from './FloatingAccents'
import Reveal from './Reveal'
import SectionOrnament from './SectionOrnament'

const WEDDING_DATE_ISO = '2026-08-30T12:00:00+08:00'

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
            className="mt-8 rounded-3xl border border-gold/40 bg-ivory p-6 shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)]
              ring-1 ring-inset ring-gold/15"
          >
            {isPast ? <CountdownCelebration /> : <CountdownGrid days={days} hours={hours} minutes={minutes} seconds={seconds} />}
          </div>
        </Reveal>
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

function CountdownCelebration() {
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <SectionOrnament className="w-40" />
      <p className="font-display text-3xl text-violet">Hari Bahagia Kami!</p>
      <p className="max-w-xs text-sm text-violet/70">
        Terima kasih kerana menjadi sebahagian daripada hari istimewa kami.
      </p>
    </div>
  )
}
