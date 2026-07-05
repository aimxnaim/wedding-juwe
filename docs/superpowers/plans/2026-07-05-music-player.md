# Background Music Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating background-music widget (play/pause, volume, 3-track
switching) to the wedding site, styled to match the existing cream/violet/gold
theme.

**Architecture:** A single new component, `src/components/MusicPlayer.tsx`,
rendered once in `App.tsx`. It's a `fixed`-positioned widget independent of
document flow: a collapsed circular button that expands into a popover with
track title, prev/play-pause/next controls, and a volume slider. One shared
`<audio>` element (via `useRef`) backs all three tracks; switching tracks
swaps its `src`. A new CSS keyframe (`discSpin`) in `src/index.css` drives a
slow rotation on the collapsed button while a track plays.

**Tech Stack:** React 19 + TypeScript, Tailwind v4 (`@theme` tokens in
`src/index.css`), `react-icons/fi` (already a dependency, used elsewhere in
`WishList.tsx`/`LocationSection.tsx`), Vite. No test framework is present in
this repo — this plan does not introduce one; verification is manual, via
`tsc -b` and a dev-server visual/interaction check.

## Global Constraints

- Palette: use existing `@theme` tokens only (`--color-violet`, `--color-gold`,
  `--color-ivory`, `--color-plum`) — no new colors.
- Card styling matches `CountdownSection`'s panel:
  `rounded-3xl border border-gold/40 bg-ivory shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)] ring-1 ring-inset ring-gold/15`.
- Fonts: track title uses `font-display` (Cormorant Garamond); the "1 / 3"
  counter uses the existing uppercase-tracked label style
  (`text-[0.65rem] uppercase tracking-[0.3em]` class of styles, `text-plum`).
- Copy language: Malay (aria-labels included), matching existing tone.
- No autoplay — playback starts only when the guest taps play.
- No new dependencies — build with `useState`/`useRef`/`useEffect` and
  `react-icons/fi` only.
- Respect `prefers-reduced-motion: reduce` — the disc-spin animation must be
  added to the existing reduced-motion media query in `src/index.css`.

---

### Task 1: Audio asset folder + disc-spin animation utility

**Files:**
- Create: `public/audio/README.md`
- Modify: `src/index.css:245-247` (insert new keyframes/class between the end
  of `.sparkle` and the `@media (prefers-reduced-motion: reduce)` block at
  line 247; add the new class to that block's existing animation-freezing
  selector list)

**Interfaces:**
- Produces: a `public/audio/` directory served by Vite at `/audio/...`,
  expected to contain `song-1.mp3`, `song-2.mp3`, `song-3.mp3`.
- Produces: CSS class `.animate-disc-spin` (keyframe `discSpin`, 8s linear
  infinite rotation), consumed by Task 2's `MusicPlayer.tsx`.

- [ ] **Step 1: Create the audio asset placeholder folder**

Create `public/audio/README.md`:

```markdown
# Audio tracks

Drop three MP3 files here, named exactly:

- `song-1.mp3`
- `song-2.mp3`
- `song-3.mp3`

These are served at `/audio/song-1.mp3` etc. and consumed by
`src/components/MusicPlayer.tsx`'s `TRACKS` array. To use different
filenames or add display titles, edit that array directly.

Good sources for royalty-free instrumental / nasheed-style wedding music:

- Pixabay Music — https://pixabay.com/music/
- YouTube Audio Library — https://studio.youtube.com/channel/UC/music
```

- [ ] **Step 2: Add the disc-spin keyframe to `src/index.css`**

In `src/index.css`, insert this immediately before the
`@media (prefers-reduced-motion: reduce) {` line (currently line 247):

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

Then add `.animate-disc-spin` to the existing reduced-motion selector list
so it's included alongside the other `animation: none !important;` rules:

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
  .petal,
  .sparkle,
  .firework-spark {
    display: none !important;
  }
}
```

- [ ] **Step 3: Type-check the project**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npx tsc -b`
Expected: no errors (this task touches no `.ts`/`.tsx` files, so this just
confirms the baseline is clean before Task 2 builds on it).

- [ ] **Step 4: Commit**

```bash
git add public/audio/README.md src/index.css
git commit -m "feat: add audio asset folder and disc-spin animation utility"
```

---

### Task 2: `MusicPlayer` component + integration

**Files:**
- Create: `src/components/MusicPlayer.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `.animate-disc-spin` CSS class from Task 1.
- Consumes from `react-icons/fi`: `FiMusic`, `FiPause`, `FiPlay`,
  `FiSkipBack`, `FiSkipForward`, `FiVolume2`, `FiVolumeX` (all confirmed
  present in the `react-icons` package already used elsewhere in this repo).
- Produces: `export default function MusicPlayer(): JSX.Element` — a
  self-contained widget with no props, mounted once in `App.tsx`.

- [ ] **Step 1: Create `src/components/MusicPlayer.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import {
  FiMusic,
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
} from 'react-icons/fi'

const TRACKS = [
  { title: 'Lagu 1', src: '/audio/song-1.mp3' },
  { title: 'Lagu 2', src: '/audio/song-2.mp3' },
  { title: 'Lagu 3', src: '/audio/song-3.mp3' },
]

const DEFAULT_VOLUME = 0.6

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = TRACKS[trackIndex].src
    if (isPlaying) {
      audio.play().catch(() => {})
    }
    // isPlaying is intentionally read (not listed as a dep): this effect
    // should only re-run on track change, carrying forward whatever the
    // play state already is at that point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  function goToTrack(nextIndex: number) {
    setTrackIndex((nextIndex + TRACKS.length) % TRACKS.length)
  }

  function handleEnded() {
    goToTrack(trackIndex + 1)
    setIsPlaying(true)
  }

  function toggleMute() {
    setVolume((current) => (current === 0 ? DEFAULT_VOLUME : 0))
  }

  return (
    <div className="fixed right-5 bottom-5 z-50">
      <audio ref={audioRef} onEnded={handleEnded} />

      {isOpen && (
        <div
          className="mb-3 w-64 rounded-3xl border border-gold/40 bg-ivory p-5 text-violet
            shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)] ring-1 ring-inset ring-gold/15"
        >
          <p className="text-center font-display text-lg text-violet">
            {TRACKS[trackIndex].title}
          </p>
          <p className="mt-0.5 text-center text-[0.65rem] uppercase tracking-[0.3em] text-plum">
            {trackIndex + 1} / {TRACKS.length}
          </p>

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Lagu sebelum"
              onClick={() => goToTrack(trackIndex - 1)}
              className="text-violet/70 transition hover:text-violet"
            >
              <FiSkipBack size={18} />
            </button>
            <button
              type="button"
              aria-label={isPlaying ? 'Jeda muzik' : 'Main muzik'}
              onClick={togglePlay}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gold
                text-ivory shadow-md transition hover:bg-gold/90"
            >
              {isPlaying ? (
                <FiPause size={20} />
              ) : (
                <FiPlay size={20} className="ml-0.5" />
              )}
            </button>
            <button
              type="button"
              aria-label="Lagu seterusnya"
              onClick={() => goToTrack(trackIndex + 1)}
              className="text-violet/70 transition hover:text-violet"
            >
              <FiSkipForward size={18} />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              aria-label={volume === 0 ? 'Bunyikan' : 'Diamkan'}
              onClick={toggleMute}
              className="text-violet/70 transition hover:text-violet"
            >
              {volume === 0 ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Kelantangan"
              className="h-1 flex-1 accent-gold"
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
        <FiMusic size={22} className={isPlaying ? 'animate-disc-spin' : ''} />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Wire `MusicPlayer` into `App.tsx`**

Modify `src/App.tsx` (add the import and render it as the last child inside
`<main>`, after `<WishesSection />` and before the `<footer>`):

```tsx
import arabicNamesGold from './assets/arabic-names-gold.webp'
import CountdownSection from './components/CountdownSection'
import Hero from './components/Hero'
import LocationSection from './components/LocationSection'
import MusicPlayer from './components/MusicPlayer'
import WishesSection from './components/WishesSection'

export default function App() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-cream shadow-xl">
      <Hero />
      <CountdownSection />
      <LocationSection />
      <WishesSection />
      <MusicPlayer />
      <footer className="bg-violet-deep py-7 text-center text-cream/60">
        <img
          src={arabicNamesGold}
          alt="نجوان & عائشة — Najwan & Aisyah"
          className="mx-auto w-40"
        />
        <p className="mt-3 text-xs uppercase tracking-[0.3em]">30 Ogos 2026</p>
        <p className="mt-4 text-[0.65rem] tracking-wide text-cream/30">
          Dibina oleh{' '}
          <a
            href="https://website-portfolio-sepia.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-soft/70 underline underline-offset-2 transition hover:text-gold-soft"
          >
            Aiman Naim
          </a>
        </p>
      </footer>
    </main>
  )
}
```

- [ ] **Step 3: Type-check the project**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Manually verify in the browser**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npm run dev:web`

Open the printed local URL. Confirm:

- A round gold-ringed button with a music-note icon floats in the bottom-right
  corner and stays fixed there while scrolling through the whole page.
- Tapping it opens a popover above it showing "Lagu 1" and "1 / 3".
- Tapping the play button flips its icon to pause, and the collapsed button's
  music-note icon starts slowly rotating. Tapping it again pauses and the
  rotation stops.
- Tapping Next/Prev cycles the title and counter through Lagu 1 → Lagu 2 →
  Lagu 3 and wraps around at both ends.
- Dragging the volume slider moves smoothly from 0 to 1, and the mute-toggle
  icon swaps between the volume and muted icon; tapping it toggles volume to
  0 and back.
- Since `public/audio/song-*.mp3` are placeholders (no real files added yet
  per Task 1), no actual sound plays — this is expected. The UI state changes
  above (icon flips, rotation, track title) all work independently of whether
  the browser can decode the file, so this fully verifies the widget; add
  real MP3s afterward to hear audio.
- In a Chromium-based browser, enable "Emulate CSS media feature
  prefers-reduced-motion: reduce" in DevTools' Rendering panel, reload, and
  confirm the button's music-note icon no longer rotates while "playing".

Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/MusicPlayer.tsx
git commit -m "feat: add floating background music player"
```
