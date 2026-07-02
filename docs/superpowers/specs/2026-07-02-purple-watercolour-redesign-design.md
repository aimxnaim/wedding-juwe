# Purple Watercolour Redesign

Date: 2026-07-02

## Goal

Restyle the wedding invitation from the current navy + gold "cream card"
look to the purple/mauve + gold **handmade-paper** look of the reference
image (textured paper, violet border frame, Arabic calligraphy names,
gold wreath + floral spray, split date block).

## Decisions (confirmed with user)

- **Names:** Arabic calligraphy only — `نجوان & عائشة`. Latin names dropped from the hero.
- **Palette:** Full shift to plum/violet + gold. Navy retired page-wide.
- **Date:** `AHAD · 30 OGOS 2026 · 12:00 PM` everywhere (hero + footer), in the reference's split layout.
- **Scope:** Whole page — hero, wishes section, footer.

## Changes

### `index.html`
- Add Google Font **Aref Ruqaa** (calligraphic Arabic) to the existing font link.

### `src/index.css`
- New theme tokens: `--color-violet: #4a3c68` (primary text), `--font-calligraphy: "Aref Ruqaa", serif`.
- Rework `.bg-paper` and `.bg-blush` into a handmade-paper texture using an inline
  SVG `feTurbulence` fractal-noise `data:` URI layered over warm ivory (self-contained,
  no new image asset).
- Border frame color → violet.

### `src/components/Hero.tsx`
- Replace the two Latin `<h1>` names with a single large Aref Ruqaa violet line `نجوان & عائشة`.
- Keep the Basmala + "Raikan Cinta" flourish.
- New internal `DatePlate`: `OGOS` centered over a rule; a 3-column row `AHAD` · **`30`** · `12:00 PM`
  with underlines; `2026` centered below.
- Monogram crest = top wreath; `floral-corner-br` = bottom-right spray; small top-left accent.

### Page carry-through
- `WishesSection.tsx`, footer in `App.tsx`, `WishesSection` headings: swap navy → violet.
- Petals/accents already use plum/gold — unchanged.

## Non-goals

- No new floral image assets (reuse existing `monogram-crest.webp` / `floral-corner-*.webp`).
- No content/data changes beyond the date.

## Verification

- `npm run build` passes.
- Dev server renders: Arabic names, violet palette, paper texture, split date block, violet frame.
