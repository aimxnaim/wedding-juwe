# Countdown Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live-ticking countdown to the wedding date (30 Aug 2026, 12:00 PM,
Asia/Kuala_Lumpur) as a new section between Hero and WishesSection.

**Architecture:** A single new component, `src/components/CountdownSection.tsx`,
containing a co-located `useCountdown` hook plus the section markup. It follows
the exact shell pattern already used by `WishesSection.tsx` (`Reveal`,
`SectionOrnament`, `Divider`, `FloatingAccents`) and reuses the ivory-panel
styling already used by `WishForm`'s wrapper in `WishesSection.tsx`. Wired into
`App.tsx` between `<Hero />` and `<WishesSection />`.

**Tech Stack:** React 19 + TypeScript, Tailwind v4 (`@theme` tokens in
`src/index.css`), Vite. No test framework is present in this repo — this plan
does not introduce one; verification is manual, via `tsc -b` and a dev-server
visual check with a temporarily overridden target date.

## Global Constraints

- Target date/time: `2026-08-30T12:00:00+08:00` (matches Hero.tsx's DatePlate: 30 Ogos 2026).
- Palette: use existing `@theme` tokens only (`--color-violet`, `--color-gold`,
  `--color-ivory`, `--color-cream`/`bg-paper`, `--color-plum`) — no new colors.
- Fonts: numerals use `font-display` (Cormorant Garamond), labels use existing
  uppercase-tracking label style (`text-[0.72rem] uppercase tracking-[0.3em]` class of styles).
- Section background: `bg-paper text-violet` (continuing Hero's palette), not blush.
- Copy language: Malay, matching existing tone (e.g. "Ucapan & Doa", "Detik Bahagia").
- No new dependencies — build the countdown with `useState`/`useEffect` only.

---

### Task 1: `useCountdown` hook + `CountdownSection` component

**Files:**
- Create: `src/components/CountdownSection.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `export default function CountdownSection(): JSX.Element` — a
  section component with no props, self-contained (reads `Date.now()`
  internally).
- Produces (internal, not exported): `function useCountdown(targetIso: string): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean }`.
- Consumes from existing codebase: `Reveal` (default export, `src/components/Reveal.tsx`, props `{ children, className?, delay? }`), `SectionOrnament` (default export, `src/components/SectionOrnament.tsx`, props `{ className? }`), `Divider` (default export, `src/components/Divider.tsx`, props `{ className?, style? }`), `FloatingAccents` (default export, `src/components/FloatingAccents.tsx`, no props — confirm by reading the file before use).

- [ ] **Step 1: Read `FloatingAccents.tsx` to confirm its prop signature**

Run: read `src/components/FloatingAccents.tsx` and check whether it takes
props (Hero.tsx and WishesSection.tsx both call it as `<FloatingAccents />`
with no props — confirm this before reuse).

- [ ] **Step 2: Create `src/components/CountdownSection.tsx`**

```tsx
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
    <section className="relative overflow-hidden bg-paper px-5 pb-16 pt-14 text-violet">
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
```

- [ ] **Step 3: Wire `CountdownSection` into `App.tsx`**

Modify `src/App.tsx`:

```tsx
import arabicNamesGold from './assets/arabic-names-gold.webp'
import CountdownSection from './components/CountdownSection'
import Hero from './components/Hero'
import WishesSection from './components/WishesSection'

export default function App() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-cream shadow-xl">
      <Hero />
      <CountdownSection />
      <WishesSection />
      <footer className="bg-violet-deep py-7 text-center text-cream/60">
        <img
          src={arabicNamesGold}
          alt="نجوان & عائشة — Najwan & Aisyah"
          className="mx-auto w-40"
        />
        <p className="mt-3 text-xs uppercase tracking-[0.3em]">30 Ogos 2026</p>
      </footer>
    </main>
  )
}
```

- [ ] **Step 4: Type-check the project**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npx tsc -b`
Expected: no errors.

- [ ] **Step 5: Manually verify the ticking grid renders correctly**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npm run dev:web`

Open the printed local URL in a browser. Confirm:
- A new "Detik Bahagia" section appears between the Hero and "Ucapan & Doa".
- Four numbers (Hari/Jam/Minit/Saat) are visible and the seconds value
  changes every second.
- Layout matches the ivory-panel style used by the wish form below it (no
  visual regressions to Hero or WishesSection).

Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 6: Manually verify the zero-state (celebratory message)**

Temporarily edit `WEDDING_DATE_ISO` in `src/components/CountdownSection.tsx`
to a few seconds in the future, e.g.:

```ts
const WEDDING_DATE_ISO = new Date(Date.now() + 5000).toISOString()
```

Run `npm run dev:web` again, load the page, wait ~5 seconds, and confirm the
grid is replaced by the "Hari Bahagia Kami!" message with no layout jump
(panel stays the same size/position). Then revert the line back to:

```ts
const WEDDING_DATE_ISO = '2026-08-30T12:00:00+08:00'
```

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/components/CountdownSection.tsx
git commit -m "feat: add live countdown section to the wedding date"
```
