# Tappable Open Peeps Avatar Picker

Date: 2026-07-02

## Goal

Let a guest choose their own avatar when leaving a wish, instead of the
avatar being silently derived from their name. The chosen avatar is saved
with the wish and shown in the wishes list.

## Decisions (confirmed with user)

- **Avatar style:** DiceBear **Open Peeps** (`open-peeps`), replacing `lorelei`.
- **Placement:** a larger avatar circle **centered above the form**.
- **Edit cue:** a small **shuffle-icon badge** on the circle's corner (no text band).
- **Tap behaviour:** tapping the circle opens a **popup grid of 8 options** with a
  **reshuffle** control to regenerate the options.
- **Initial avatar:** seeded from the **typed name** (updates live) until the user
  picks from the grid, which **locks** the avatar to that choice.
- **Persistence:** avatar saved per wish via a new `avatarSeed` field.

## Data model & API

- `models/Wish.js`: add `avatarSeed: { type: String, trim: true, default: '' }`.
- `routes/wishes.js` POST: read `avatarSeed` from body, sanitize
  (string, `trim()`, cap length e.g. 64 chars); if empty, fall back to `name`.
  Return it in the created document. GET already returns full docs (`.lean()`).
- `src/api/wishes.ts`: add `avatarSeed: string` to `Wish`; add optional
  `avatarSeed?: string` to `WishInput`.
- **Legacy wishes** (no `avatarSeed`) fall back to name-seeding on render, so
  existing data renders unchanged.

## Frontend structure

- **`src/lib/avatar.ts`** (new, shared):
  - `avatarUrl(seed: string): string` — Open Peeps URL, keeps the themed
    `backgroundColor` palette + `radius=50`.
  - `randomSeed(): string` — random short string for shuffle/grid options.
- **`src/components/AvatarPicker.tsx`** (new): the circle button + popup grid.
  - Props: `name: string`, `value: string | null`, `onChange(seed: string)`.
  - Shows `value` when set, else name-seeded avatar. Corner shuffle-icon badge.
  - Tap → popup with 8 `randomSeed()` options (current highlighted) + reshuffle
    button. Selecting calls `onChange` and closes. Closes on outside click / Esc.
- **`WishForm.tsx`**: add `avatarSeed` state (`null` until picked); render
  `AvatarPicker` centered above the fields; send
  `avatarSeed: avatarSeed ?? name.trim()` in `createWish`; reset on submit.
- **`WishList.tsx`**: use `avatarUrl(wish.avatarSeed || wish.name)` from the
  shared lib; drop the local `lorelei` helper.

## Error handling

- Avatar images are external (DiceBear). On failure the `<img>` shows its
  themed background — acceptable, no blocking behaviour.
- Backend rejects only when name/message missing (unchanged); a bad/empty
  `avatarSeed` silently falls back to the name.

## Verification

- `npm run build` passes; typecheck clean.
- Browser: preview updates with name; badge visible; tapping opens the grid;
  reshuffle changes options; selecting locks the choice.
- Persistence round-trip needs local MongoDB. If unavailable, verify the POST
  handler by a direct route-level test and confirm the UI wiring; flag that the
  live DB round-trip was not exercised.

## Non-goals

- No image upload / custom photos — Open Peeps only.
- No editing an avatar after the wish is submitted.
- No auth or per-user identity.
