# Music Player Pill Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `MusicPlayer.tsx`'s tall popover card with a slim single-row
horizontal pill, and replace the disc-spin "now playing" animation with
pulsing equalizer bars on the collapsed button.

**Architecture:** Two small, sequential edits to existing files — no new
components, no new files. `src/index.css` swaps the `discSpin` keyframe for
an `eqBar` keyframe (three bars, staggered via `animation-delay`).
`src/components/MusicPlayer.tsx` restyles its expanded-state JSX from a
stacked card into a single flex row, and swaps its collapsed-button icon
between a static note (paused) and a small three-bar equalizer (playing).
No changes to the YouTube playback logic (`togglePlay`, `goToTrack`,
`updateVolume`, `toggleMute`, the player-creation effect) — this is a
visual-only restyle.

**Tech Stack:** React 19 + TypeScript, Tailwind v4 (`@theme` tokens in
`src/index.css`), `react-icons/fi`. No test framework is present in this
repo; verification is manual, via `tsc -b`, `oxlint`, and a dev-server
visual/interaction check.

## Global Constraints

- Palette: existing `@theme` tokens only (`--color-violet`, `--color-gold`,
  `--color-ivory`, `--color-plum`) — no new colors.
- Pill material matches the existing card treatment: `border border-gold/40
  bg-ivory shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)] ring-1 ring-inset
  ring-gold/15` (just `rounded-full` instead of `rounded-3xl`, and one row
  instead of a stacked block).
- Pill width: roughly 290–300px max, single row, anchored bottom-right
  extending leftward (same `mb-3` spacing above the collapsed button as
  before).
- Track title: truncated (`truncate`), no "1 / 3" counter (dropped to save
  width).
- Equalizer bars are **decorative only** (not audio-reactive) — the audio
  plays through a cross-origin YouTube iframe, so real frequency data isn't
  readable from JS. Three bars, `bg-gold`, staggered `animation-delay`
  (`0s` / `0.2s` / `0.4s`).
- Respect `prefers-reduced-motion: reduce` — `.animate-eq-bar` must be added
  to the existing reduced-motion media query in `src/index.css`, and
  `.animate-disc-spin`/`@keyframes discSpin` must be fully removed (not left
  dead in the file).
- No new dependencies.
- Copy language: Malay (aria-labels), matching existing tone — unchanged
  from current labels.

---

### Task 1: Swap `discSpin` for `eqBar` in `src/index.css`

**Files:**
- Modify: `src/index.css:247-260` (the `discSpin` keyframe + `.animate-disc-spin`
  class block)
- Modify: `src/index.css:267` (`.animate-disc-spin` entry in the
  `@media (prefers-reduced-motion: reduce)` selector list)

**Interfaces:**
- Produces: CSS class `.animate-eq-bar` (keyframe `eqBar`, `scaleY`
  oscillating 0.3 ↔ 1, `transform-origin: bottom`, 0.9s ease-in-out
  infinite), consumed by Task 2's `MusicPlayer.tsx`.
- Removes: `.animate-disc-spin` and `@keyframes discSpin` (no longer used
  anywhere after Task 2).

- [ ] **Step 1: Replace the `discSpin` block with `eqBar` in `src/index.css`**

Find this existing block (currently lines 247–260):

```css
/* slow rotation on the music-player button while a track is playing,
   evoking a spinning gramophone disc */
@keyframes discSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-disc-spin {
  animation: discSpin 8s linear infinite;
}
```

Replace it with:

```css
/* pulsing equalizer bars on the music-player button while a track plays;
   each bar gets a staggered animation-delay (set inline per-bar) so they
   don't move in lockstep. Decorative only — not reactive to real audio,
   since the audio plays through a cross-origin YouTube iframe. */
@keyframes eqBar {
  0%,
  100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}

.animate-eq-bar {
  animation: eqBar 0.9s ease-in-out infinite;
  transform-origin: bottom;
}
```

- [ ] **Step 2: Update the reduced-motion selector list**

Find (currently around line 262-273):

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fadeup,
  .animate-crest,
  .animate-rise,
  .animate-celebrate-glow,
  .animate-disc-spin,
  .reveal {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
```

Replace `.animate-disc-spin,` with `.animate-eq-bar,`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fadeup,
  .animate-crest,
  .animate-rise,
  .animate-celebrate-glow,
  .animate-eq-bar,
  .reveal {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
```

- [ ] **Step 3: Confirm no other references to the removed class remain**

Run: `grep -rn "animate-disc-spin\|discSpin" /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe/src`
Expected: matches only in `src/components/MusicPlayer.tsx` (Task 2 removes
that usage) — no other files reference it.

- [ ] **Step 4: Type-check the project**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npx tsc -b`
Expected: no errors (this task touches no `.ts`/`.tsx` files, so this just
confirms the baseline is clean before Task 2).

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat: swap disc-spin animation for equalizer-bar CSS utility"
```

---

### Task 2: Redesign `MusicPlayer.tsx` expanded state as a slim pill

**Files:**
- Modify: `src/components/MusicPlayer.tsx` (the returned JSX only —
  `togglePlay`, `goToTrack`, `updateVolume`, `toggleMute`, and the
  player-creation `useEffect` are unchanged)

**Interfaces:**
- Consumes: `.animate-eq-bar` CSS class from Task 1.
- Consumes existing component state/handlers (already defined in this
  file, unchanged): `isOpen`, `trackIndex`, `isPlaying`, `volume`,
  `togglePlay()`, `goToTrack(nextIndex: number)`,
  `updateVolume(next: number)`, `toggleMute()`, `TRACKS` (array of
  `{ title: string; videoId: string }`).
- Produces: a new local (not exported) helper component
  `function EqualizerBars()` rendering the three animated bars, used only
  inside `MusicPlayer`'s own JSX.

- [ ] **Step 1: Replace the `return (...)` block in `src/components/MusicPlayer.tsx`**

The file currently ends with this `return` statement (everything from
`return (` to the function's closing `)` and `}`). Replace the entire
`return (...)` block with:

```tsx
  return (
    <div className="fixed right-5 bottom-5 z-50">
      <div ref={hostRef} className="hidden" aria-hidden="true" />

      {isOpen && (
        <div
          className="mb-3 flex max-w-[300px] items-center gap-3 rounded-full border
            border-gold/40 bg-ivory px-4 py-2.5 text-violet shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)]
            ring-1 ring-inset ring-gold/15"
        >
          <p className="max-w-[72px] truncate font-display text-sm text-violet">
            {TRACKS[trackIndex].title}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Lagu sebelum"
              onClick={() => goToTrack(trackIndex - 1)}
              className="text-violet/70 transition hover:text-violet"
            >
              <FiSkipBack size={16} />
            </button>
            <button
              type="button"
              aria-label={isPlaying ? 'Jeda muzik' : 'Main muzik'}
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gold
                text-ivory shadow-md transition hover:bg-gold/90"
            >
              {isPlaying ? (
                <FiPause size={16} />
              ) : (
                <FiPlay size={16} className="ml-0.5" />
              )}
            </button>
            <button
              type="button"
              aria-label="Lagu seterusnya"
              onClick={() => goToTrack(trackIndex + 1)}
              className="text-violet/70 transition hover:text-violet"
            >
              <FiSkipForward size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={volume === 0 ? 'Bunyikan' : 'Diamkan'}
              onClick={toggleMute}
              className="text-violet/70 transition hover:text-violet"
            >
              {volume === 0 ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => updateVolume(Number(event.target.value))}
              aria-label="Kelantangan"
              className="h-1 w-14 accent-gold"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? 'Tutup pemain muzik' : 'Buka pemain muzik'}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40
          bg-ivory text-violet shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)] ring-1 ring-inset ring-gold/15"
      >
        {isPlaying ? <EqualizerBars /> : <FiMusic size={22} />}
      </button>
    </div>
  )
}

function EqualizerBars() {
  return (
    <span className="flex h-5 items-end gap-1" aria-hidden="true">
      <span
        className="animate-eq-bar h-full w-1 rounded-full bg-gold"
        style={{ animationDelay: '0s' }}
      />
      <span
        className="animate-eq-bar h-full w-1 rounded-full bg-gold"
        style={{ animationDelay: '0.2s' }}
      />
      <span
        className="animate-eq-bar h-full w-1 rounded-full bg-gold"
        style={{ animationDelay: '0.4s' }}
      />
    </span>
  )
}
```

Note: `EqualizerBars` is a plain function declaration placed after the
closing `}` of `MusicPlayer`, at the bottom of the file — same pattern
this codebase already uses for small helper components (e.g.
`CountdownGrid` at the bottom of `CountdownSection.tsx`).

- [ ] **Step 2: Type-check the project**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Lint the project**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npx oxlint`
Expected: no errors.

- [ ] **Step 4: Manually verify in the browser**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npm run dev:web`

Open the printed local URL. Confirm:

- The collapsed button shows the static music-note icon while paused.
- Tapping the button opens a single-row pill (not a tall stacked card)
  showing a truncated track title, prev/play-pause/next controls, and a
  mute icon + volume slider all in one horizontal line — it should visibly
  not overlap surrounding page content the way the old tall card did.
- Tapping play: the collapsed button's icon switches from the static note
  to three small vertical bars pulsing at staggered offsets (not all
  moving in unison). Tapping pause switches it back to the static note.
- Next/Prev still cycle Lagu 1 → Lagu 2 → Lagu 3 and wrap at both ends;
  volume slider and mute toggle still work — these behaviors are
  unchanged from before, just restyled.
- In a Chromium-based browser, enable "Emulate CSS media feature
  prefers-reduced-motion: reduce" in DevTools' Rendering panel, reload,
  play a track, and confirm the equalizer bars are frozen (not animating)
  instead of pulsing.

Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 5: Commit**

```bash
git add src/components/MusicPlayer.tsx
git commit -m "feat: redesign music player as a slim pill with equalizer bars"
```
