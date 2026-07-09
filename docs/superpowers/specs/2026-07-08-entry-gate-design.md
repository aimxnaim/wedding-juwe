# Entry Gate (Masjid Door) — Design

## Purpose

Add an aesthetic full-screen "entrance" the guest taps once when the
site first loads. Two jobs:

1. **Delight / ceremony** — the site opens by walking through an ornate
   door into the venue, instead of dropping the guest straight onto the
   page. (Final treatment is an illustrated door + zoom-through — see
   "Final direction" below.)
2. **Unlock autoplay** — that single tap is a genuine user gesture, which
   is exactly what browsers require before audio may play. Calling the
   music player's `playVideo()` inside the gate's tap handler satisfies
   the autoplay policy, so background music starts the moment the door
   opens — no separate "press play" needed. This is the technical reason
   the gate exists (browsers block sound-on autoplay without a gesture).

Decided via the visual brainstorming companion (mockups + live
interactive HTML demos); the user clicked through envelope / folded-card /
doors concepts and confirmed the door direction, then a maroon+gold
masjid-door treatment, then approved the opening motion. Session mockups
live in `.superpowers/brainstorm/` (gitignored scratch, not committed).

## Placement & lifecycle

- New presentational component `src/components/EntryGate.tsx`, rendered by
  `MusicPlayer` (not `App` directly) so the tap handler has direct access
  to the YouTube player instance and can call `playVideo()` synchronously
  within the user-gesture call stack — the safest way to satisfy autoplay
  restrictions. `MusicPlayer` already self-contains the player wiring, so
  keeping the gate there avoids lifting player state into a context.
- Shown on first load as a `fixed inset-0 z-[60]` overlay covering the
  whole viewport (above everything, including the `z-50` footer player).
- One-shot: once opened it animates out and unmounts. It does **not**
  reappear on scroll or re-render. No persistence across reloads — a
  fresh page load shows the gate again (acceptable; a guest opens the
  invite once per visit, and re-showing it each load keeps the autoplay
  gesture guaranteed).

## Final direction: the user's own welcome-gate SVG, split into two doors

Several art directions were tried and rejected before landing here:

1. **Hand-drawn SVG masjid door** (three iterations, kept below for
   history) — rejected as "ugly": raw SVG primitives read as crude, and
   stretching them to full phone height distorted circles into ovals.
2. **A watercolour concept illustration** (`src/assets/door-preview.png`)
   pasted full-bleed with a zoom-through — rejected: it treated the
   painting's own painted interior as the "inside", rather than opening
   into the real site. That image also has one door already ajar, so its
   leaves can't be split into a matching closed pair.
3. **A polished hand-built vector door** (shaded wood grain, brass
   lanterns, roses) — closer, but still not what the user wanted.

The user then supplied their **own artwork**:
`src/assets/welcome-gate-wedding-juwe.svg` (589 kB, true vector — 68
paths, no embedded raster; `viewBox 0 0 297.75 419.25`). It is a maroon
panel with a gold multifoil (ogee) arch, Islamic geometric corner
patterns, a central gold mandala medallion, and two ornamental dividers.
All previously hand-built door art is removed.

### Visual structure (final)

- Full-screen `fixed inset-0 z-[60]` overlay, `perspective: 1400px`, no
  background of its own (so the site sits behind it).
- The artwork is a **single flat panel**, not two separate leaves — so each
  "door" is a **full copy of the whole SVG clipped to one half**:
  - `.gate-leaf-left` → `clip-path: inset(0 50% 0 0)`, hinged
    `transform-origin: left center`
  - `.gate-leaf-right` → `clip-path: inset(0 0 0 50%)`, hinged
    `transform-origin: right center`
  - Each `<img>` uses `object-cover`, so both halves scale identically and
    reassemble seamlessly when shut.
- A soft gradient (`.gate-seam`) along the centre seam fakes depth as the
  doors part. **It is `opacity: 0` while closed** — otherwise it paints a
  dark stripe down the middle of the closed artwork (caught in review).
- Bare: no text, no glow overlay (per the user's "fully bare" instruction).

### Responsive band composition

The artwork is a fixed-aspect panel (0.71) but phones are far taller, so
fitting it whole letterboxed it and floated the borders away from the
screen edges. Instead it is **sliced into bands re-composed responsively**:
the top border pins to the top, the bottom border pins to the bottom, the
medallion group sits centred, and the artwork's maroon (`#510400`, painted
on the leaf) fills whatever is between.

Each band is a window onto the same SVG: the image is drawn at the stage's
full width and slid up by an offset so the wanted slice lands in view.

**Every vertical dimension is a percentage of the stage's *width*** —
expressed as percentage *padding* (box heights) or negative percentage
*margin* (image offsets). Both always resolve against the containing
block's inline size, in every engine. Nothing depends on a parent's
resolved height.

> This is deliberate, and was a Safari-only production bug. The first
> version sized the medallion group with `aspect-ratio` and gave its
> children percentage `height`s. Chrome resolves those; **Safari treats an
> `aspect-ratio`-derived height as indefinite**, so each divider's height
> collapsed to `auto` and spilled its whole image — painting extra mandalas
> and duplicate corner ornaments. Do not reintroduce `aspect-ratio` +
> percentage heights here.
>
> Note also that inside the mandala's circular mask, percentage margins
> resolve against the *mask's* width, not the artwork's — those offsets are
> scaled by `MANDALA.size`, not `ART_W`.

Geometry, measured off a 400x563 render (not eyeballed):

| slice | rows |
| --- | --- |
| top border | 0..185 |
| top divider | 186..201 |
| mandala | 219..368 (centre x=199, ~150px across) |
| bottom divider | 379..394 |
| bottom border | 447..562 |

Two coverage bugs were found and fixed here:

- The SVG ships a full-size `fill="#ffffff"` background rect, and its maroon
  layer stops ~0.3 units short of the viewBox edge — leaking a hairline of
  white along the bottom/right. **That one white fill was recoloured to
  `#510400`** in the asset. (If the art is re-exported, this must be redone.)
- The leaf is inset by `-2px` on every side so that at fractional zoom/DPR a
  rounded-short box can never leak a hairline of the site at the edges. The
  50% clip still lands on the true centre since the overhang is symmetric.

### Scroll lock

While the gate is up the page is pinned to the top and scrolling is frozen,
so the guest cannot scroll the site behind the gate and land mid-page when
it opens. `position: fixed` on the `<body>` (not merely `overflow: hidden`)
is what actually holds on iOS Safari; the overlay also sets
`touch-action: none`, and `history.scrollRestoration` is forced to `manual`
so a reload can't restore a previous offset. On release the page is scrolled
back to `(0, 0)`.

The lock effect is keyed on `isDone`, **not** on mount: the component returns
`null` when finished but stays mounted, so an unmount-only cleanup would
never run and the page would stay frozen forever.

### Idle "living gate"

While shut, the gate is quietly alive (no text, per the bare instruction):

- **Mandala turns** (`gateMandalaSpin`, 90s linear). It lives in a *circular
  mask*: everything in that circle except the medallion is the artwork's own
  maroon, so only the mandala reads as moving and the dividers above/below —
  outside the circle — stay put. Centring lives on a wrapper element, since
  the spin keyframe replaces `transform` wholesale.
- **Gold sheen sweeps** across the gate (`gateShimmer`, 7.5s).
- **Light breathes** behind the medallion (`gateGlowPulse`, 5.5s). The glow
  sits *above* the mandala and `mix-blend-mode: screen`s — placed behind, the
  opaque maroon mask hid its middle and it read as a hard-edged ring.

All three are disabled under `prefers-reduced-motion: reduce`.

### Opening animation (final) — doors swing, then walk through

- Tap anywhere → both halves **swing apart on their outer hinges**:
  left → `rotateY(-110deg)`, right → `rotateY(110deg)`, over **1.15s**
  `cubic-bezier(.66,0,.34,1)`. The centre mandala parts like a seal and the
  live site is revealed through the widening gap.
  `backface-visibility: hidden` so a leaf disappears once past 90° rather
  than showing a mirrored back face.
- Then the **whole gate zooms forward and fades** —
  `.gate-overlay.is-open` sets `transform: scale(1.9)` + `opacity: 0`
  (delayed ~0.95s, after the swing) — like walking through the doorway.
  The component unmounts ~2s after the tap.
- **No sound on open**; the background music starts on the same tap.
- `prefers-reduced-motion: reduce`: skip the swing + zoom, just cross-fade
  the gate out; music still starts.

---

## (Superseded) Hand-drawn SVG masjid door

*Kept for history — replaced by the user's own artwork above.*

## Visual structure (closed state)

A bare, ornate masjid door on a maroon ground. **No names, no date, no
text** on the gate (explicit user instruction — "just a door"). Built with
inline **SVG** (not div-borders) for crisp geometry that scales; the door
went through three iterations in the visual companion (v1 simple → v2
ornate → v3 richer, all approved).

Layout is responsive: a centered **portrait panel** (`w-full max-w-md`,
full viewport height) so the doorway lines up with the app's centered
`max-w-md` card. On phones the panel fills the screen; on desktop it's a
centered maroon portal on the page.

- **Wall:** one stretched SVG (`viewBox 0 0 280 480`,
  `preserveAspectRatio="none"`) filling the panel — a maroon radial
  gradient (`--color-maroon` → `#6e1722` → `#4c0e16`) with a **pointed
  (mihrab) arch opening** cut out via `fill-rule="evenodd"`. The opening
  is transparent so the **live site shows through it** (the overlay itself
  has *no* background — that's what makes the reveal work). **Arabesque
  spandrels** fill the two arch corners.
- **Arch trim (separate SVG, above the doors):** double gold arch outline
  (`--color-gold` + inner `--color-gold-soft` hairline), a **keystone** at
  the apex, small **foils** dotted along the arch, and a gold **threshold**
  band at the base.
- **Hanging masjid lamp** at the apex: a small lantern with chain, glow
  halo, and tassel, gently swaying (`gateLampSway` keyframe).
- **Two door leaves** (each an SVG, right one mirrored via `scaleX(-1)` on
  its inner `<svg>` so knockers/studs meet at the center; the mirror is on
  the SVG, never on the `.gate-leaf` div, so it can't clobber the swing
  transform):
  - Warm wood gradient + a subtle diagonal **sheen** overlay and faint
    vertical plank lines.
  - Gold double frame with **corner brackets**.
  - Upper: a **strapwork 8-point khatam star** (three interlaced frames +
    petals + concentric circles).
  - Middle: a banded panel with a diamond and dot accents.
  - Lower: an **arabesque mandorla** with curls and a **rosette boss**.
  - A **ring-knocker on a rosette plate** at the meeting edge, and a
    column of **brass studs** down the seam.
  - The leaves are clipped to the arch via an SVG `clipPath`
    (`clipPathUnits="objectBoundingBox"`, path in 0–1 units) so the arch
    shape scales with the panel and stays aligned with the wall's opening.

## Opening animation

Approved motion from the live demos ("must feel like opening a door, not a
fade"):

- The guest taps **anywhere** on the gate (whole overlay is the target;
  fully bare, no hint text).
- Both leaves swing apart in 3D: left `transform-origin: left` →
  `rotateY(-115deg)`, right → `rotateY(115deg)`, over **~1.15s** with
  `cubic-bezier(.66,0,.34,1)`. Parent uses `perspective: 1200px`. Both
  move together. As they swing, the **live site is revealed *through* the
  archway** (framed by the maroon wall, gold arch, and lamp) — not a fade.
- Then the **whole gate zooms forward and fades** — `.gate-overlay.is-open`
  sets `transform: scale(1.9)` + `opacity: 0` (transition delayed ~0.95s
  so it starts after the swing) — like walking through the open doorway.
  The component unmounts ~2s after the tap.
- **No sound on open** (explicit user instruction) — the only audio is
  the background music, which starts at the same moment.
- Respect `prefers-reduced-motion: reduce`: skip the 3D swing + zoom and
  just
  cross-fade the overlay out (no rotation), so the gate still dismisses
  and music still starts.

## Coordination with music (autoplay)

- On tap, `MusicPlayer`'s gate handler: (1) calls `player.playVideo()`
  directly (within the gesture), (2) sets `entered = true` to trigger the
  gate's exit animation, (3) after the animation, unmounts the gate.
- Edge case: if the YouTube player isn't `onReady` yet when the guest
  taps, set an `intentToPlay` ref; `onReady` checks it and calls
  `playVideo()` then. Keeps the "music starts on entry" promise even on a
  slow connection, without blocking the door animation.
- The footer music player (see music-player Addendum 4) renders behind
  the gate the whole time; the guest first sees it (as the small pill)
  right after the doors open, already playing.

## Testing

- Manual: load the site → gate covers the screen, doors closed, no text.
- Tap → doors swing apart smoothly (~1.1s), maroon fades, site revealed,
  music begins playing at that moment (confirm audio actually starts —
  this is the autoplay-unlock check).
- Confirm the gate does not reappear on scroll or when interacting with
  the page afterward.
- Reload → gate shows again from scratch.
- `prefers-reduced-motion: reduce` → gate cross-fades out (no 3D swing),
  music still starts.
- Slow-connection case: throttle network, tap before the player is ready,
  confirm music still starts once the player finishes loading.
- No unit-test framework in the project; scope doesn't warrant adding one.
