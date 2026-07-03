# Map Location Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Lokasi Majlis" section to the wedding site, between the countdown and wishes sections, showing an embedded map and Waze/Google Maps buttons for the venue.

**Architecture:** A single new presentational React component, `LocationSection`, composed into `App.tsx`. No new dependencies, no backend involvement — it follows the exact same structural pattern as the existing `CountdownSection`/`WishesSection` (`Reveal` → `SectionOrnament` heading → `Divider` → ivory card).

**Tech Stack:** React 19 + TypeScript + Tailwind CSS v4 (existing stack, no additions).

## Global Constraints

- Venue address (copy verbatim): `Bertempat di kediaman kami:` / `Lot-1700, Jalan Masjid Lundang, 15150, Kota Bharu, Kelantan.`
- Coordinates: `6.103472, 102.256502`
- Waze URL (copy verbatim): `https://waze.com/ul/hw30dwzhgx`
- Google Maps URL (copy verbatim): `https://www.google.com/maps/place/6°06'12.5%22N+102°15'23.4%22E/@6.103472,102.2539271,17z/data=!3m1!4b1!4m4!3m3!8m2!3d6.103472!4d102.256502!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D`
- Heading text: `Lokasi Majlis` (Malay, matches existing section heading style e.g. "Detik Bahagia")
- No API key, no new npm dependency — map embed must use the keyless `https://www.google.com/maps?q=...&output=embed` form.
- No test framework exists in this repo (no vitest/jest configured) — do not add one; verification is manual (dev server + browser).

---

### Task 1: Update the existing wedding-juwe design spec to reflect the venue change

**Files:**
- Modify: `docs/superpowers/specs/2026-06-29-wedding-juwe-design.md` (already updated during brainstorming — verify only)

- [ ] **Step 1: Verify the venue line was already updated**

Run: `grep -n "Venue" docs/superpowers/specs/2026-06-29-wedding-juwe-design.md`

Expected output includes:
```
- **Venue:** Lot-1700, Jalan Masjid Lundang, 15150, Kota Bharu, Kelantan
  (superseded from the original "Masjid Sri Sendayan" — see
  `2026-07-03-map-location-design.md`)
```

This was already done during brainstorming (commit `e22e490`). Nothing to change here — this step is a checkpoint, not new work. If the grep doesn't match, stop and re-apply the edit shown above before continuing.

- [ ] **Step 2: No commit needed**

Skip — nothing changed in this task.

---

### Task 2: Build the `LocationSection` component

**Files:**
- Create: `src/components/LocationSection.tsx`
- Modify: `src/App.tsx:1-22`

**Interfaces:**
- Consumes: `Divider` (default export, `src/components/Divider.tsx`, props `{ className?, style? }`), `FloatingAccents` (default export, `src/components/FloatingAccents.tsx`, no required props), `Reveal` (default export, `src/components/Reveal.tsx`, props `{ children, className?, delay? }`), `SectionOrnament` (default export, `src/components/SectionOrnament.tsx`, props include `className?`).
- Produces: `LocationSection` — default export, no props, a `<section>` React component. Consumed by `App.tsx`.

- [ ] **Step 1: Create the component file**

Write `src/components/LocationSection.tsx`:

```tsx
import Divider from './Divider'
import FloatingAccents from './FloatingAccents'
import Reveal from './Reveal'
import SectionOrnament from './SectionOrnament'

const MAP_EMBED_SRC = 'https://www.google.com/maps?q=6.103472,102.256502&z=17&output=embed'
const WAZE_URL = 'https://waze.com/ul/hw30dwzhgx'
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/6°06'12.5%22N+102°15'23.4%22E/@6.103472,102.2539271,17z/data=!3m1!4b1!4m4!3m3!8m2!3d6.103472!4d102.256502!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D"

export default function LocationSection() {
  return (
    <section className="relative overflow-hidden bg-songket px-5 pb-16 pt-14 text-violet">
      <FloatingAccents />

      <div className="relative mx-auto max-w-md">
        <Reveal>
          <SectionOrnament className="w-52" />
          <h2 className="mt-5 text-center font-display text-4xl text-violet">
            Lokasi Majlis
          </h2>
          <Divider className="mt-4" />
        </Reveal>

        <Reveal delay={120}>
          <div
            className="mt-8 overflow-hidden rounded-3xl border border-gold/40 bg-ivory shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)]
              ring-1 ring-inset ring-gold/15"
          >
            <div className="aspect-[4/3] w-full">
              <iframe
                title="Lokasi Majlis"
                src={MAP_EMBED_SRC}
                loading="lazy"
                className="h-full w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-6 text-center">
              <p className="text-sm text-violet/80">Bertempat di kediaman kami:</p>
              <p className="mt-1 font-display text-lg text-violet">
                Lot-1700, Jalan Masjid Lundang,
                <br />
                15150, Kota Bharu, Kelantan.
              </p>

              <div className="mt-5 flex justify-center gap-3">
                <a
                  href={WAZE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-gold/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-violet
                    transition hover:bg-gold/10"
                >
                  Buka di Waze
                </a>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-gold/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-violet
                    transition hover:bg-gold/10"
                >
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Compose it into `App.tsx`**

Read current `src/App.tsx` (shown below for reference — it should still match this) and update it:

Current content:
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

New content:
```tsx
import arabicNamesGold from './assets/arabic-names-gold.webp'
import CountdownSection from './components/CountdownSection'
import Hero from './components/Hero'
import LocationSection from './components/LocationSection'
import WishesSection from './components/WishesSection'

export default function App() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-cream shadow-xl">
      <Hero />
      <CountdownSection />
      <LocationSection />
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

- [ ] **Step 3: Type-check and lint**

Run: `cd wedding-juwe && npx tsc -b --noEmit && npx oxlint src/components/LocationSection.tsx src/App.tsx`
Expected: no errors from either command.

- [ ] **Step 4: Manual browser verification**

Run: `cd wedding-juwe && npm run dev:web`
Open the printed local URL. Scroll to the new "Lokasi Majlis" section between the countdown and the wishes form. Verify:
- The map iframe loads and shows a pin near Kota Bharu, Kelantan.
- The address text reads correctly.
- Clicking "Buka di Waze" opens `https://waze.com/ul/hw30dwzhgx` in a new tab.
- Clicking "Buka di Google Maps" opens the Google Maps URL in a new tab.
- The section's card styling (rounded corners, gold border, ivory background) visually matches the countdown/wishes cards above and below it.

Stop the dev server after verifying (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add wedding-juwe/src/components/LocationSection.tsx wedding-juwe/src/App.tsx
git commit -m "$(cat <<'EOF'
feat: add map location section with Waze and Google Maps links

Shows an embedded map and venue address between the countdown and
wishes sections, with buttons to open the location in Waze or Google
Maps.
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** heading text, card styling, embedded map (keyless embed), address text, Waze button, Google Maps button, and placement between Countdown/Wishes are all covered in Task 2. The venue-change documentation update is covered (already applied) in Task 1.
- **No new test framework introduced** — matches the spec's "Testing" section (presentational-only, manual browser check).
- **Type consistency:** `LocationSection` takes no props and is used the same way (`<LocationSection />`) as its neighbors `CountdownSection`/`WishesSection` in `App.tsx`.
