# Countdown Section — Design

## Purpose

Add a live countdown to the wedding date (30 Aug 2026, 12:00 PM, Asia/Kuala_Lumpur)
between the Hero and the Wishes section, matching the site's existing
cream/violet/gold visual language and Malay copy.

## Placement

New component `src/components/CountdownSection.tsx`, rendered in `App.tsx`
between `<Hero />` and `<WishesSection />`:

```tsx
<Hero />
<CountdownSection />
<WishesSection />
```

## Visual structure

Follows the same section shell pattern as `WishesSection.tsx`:

- `<section>` with `bg-paper text-violet` (continuing Hero's palette, not
  Wishes' blush) and `FloatingAccents` for the ambient background motif.
- `Reveal`-wrapped header: `SectionOrnament` + `font-display` heading (e.g.
  "Detik Bahagia") + `Divider`.
- A `Reveal`-wrapped panel below, styled like the `WishForm` container
  (`rounded-3xl border border-gold/40 bg-ivory p-6 shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)] ring-1 ring-inset ring-gold/15`)
  holding either the countdown grid or the zero-state message.

### Countdown grid (pre-wedding state)

Four cards in a row, each:

- Big `font-display` numeral (visually consistent with the "30" in
  `Hero.tsx`'s `DatePlate`), zero-padded to 2 digits.
- Small uppercase tracked label beneath: **Hari · Jam · Minit · Saat**.
- Cards separated by a thin gold hairline/`:` divider, not heavy borders.

Values tick live, updating once per second.

### Zero state (post-wedding)

Once `Date.now()` passes the target, the grid is replaced (same panel,
no layout jump) by:

- `SectionOrnament`
- A `font-display` celebratory line in Malay (e.g. "Hari Bahagia Kami!")
- A short warm subline (e.g. "Terima kasih kerana menjadi sebahagian
  daripada hari istimewa kami.")

Exact wording chosen by implementer to match existing tone (see Hero.tsx,
WishesSection.tsx for reference — warm, understated, Malay).

## Logic

A `useCountdown(targetIso: string)` hook, co-located in
`CountdownSection.tsx` (not split into a separate file — single consumer,
no reuse case):

- Computes `{ days, hours, minutes, seconds, isPast }` from
  `target - Date.now()`.
- Target constant: `2026-08-30T12:00:00+08:00`.
- `useEffect` sets a 1s `setInterval` to recompute; cleared on unmount.
- When remaining time <= 0, `isPast` is `true` and the numeric fields are
  clamped to 0 (grid isn't rendered in this state anyway, but keeps the
  hook's output well-defined).

## Testing

- Manual verification: temporarily point the target date to a few seconds
  in the future, confirm the grid ticks down and flips to the zero-state
  message without a layout jump, then restore the real date.
- No unit test framework currently present in the project; scope does not
  warrant introducing one for a single ticking display.
