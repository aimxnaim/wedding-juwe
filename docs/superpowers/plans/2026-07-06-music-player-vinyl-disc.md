# Music Player Vinyl-Disc Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `MusicPlayer.tsx`'s slim pill + equalizer bars with a
vinyl-record disc that grows in place into a modest 168px "clock-face"
circle of controls when tapped, with discrete tap +/− volume steps
instead of a slider, closing via an explicit × button or a tap anywhere
outside the widget.

**Architecture:** Two sequential edits to existing files — no new files.
`src/index.css` removes the `eqBar` keyframe/class (fully superseded) and
adds a `vinylSpin` keyframe + a `.bg-vinyl-grooves` background utility.
`src/components/MusicPlayer.tsx` is substantially rewritten: the
component becomes a single circular `<div>` (collapsed 56px disc ↔
expanded 168px circle via a `width`/`height` CSS transition) instead of
two stacked elements (button + separate pill). Volume moves from a
continuous `0–1` float to a discrete `0–5` integer level. The YouTube
IFrame Player wiring (`togglePlay`, `goToTrack`, the player-creation
`useEffect`, `TRACKS`, the ambient `Window.YT` type) is unchanged — only
`updateVolume`/`toggleMute` are replaced by a new `adjustVolume`, and the
JSX is fully replaced.

**Tech Stack:** React 19 + TypeScript, Tailwind v4 (`@theme` tokens in
`src/index.css`), `react-icons/fi`. No test framework is present in this
repo; verification is manual, via `tsc -b`, `oxlint`, and a dev-server
visual/interaction check.

## Global Constraints

- Palette: existing `@theme` tokens only (`--color-violet`,
  `--color-violet-deep`, `--color-gold`, `--color-gold-soft`,
  `--color-ivory`, `--color-plum`) — no new colors.
- Collapsed disc: 56px (`h-14 w-14`, unchanged footprint from before),
  dark grooved vinyl look, small center label that fades out as it opens.
- Expanded circle: **168px diameter** (`10.5rem`), not larger — explicit
  user instruction to keep it "nice," not oversized like the 220px
  brainstorming demo. Background switches to `bg-ivory` with
  `border-gold/40 ring-1 ring-inset ring-gold/15` (same material as the
  rest of the site's cards).
- Grow/shrink transition: `width`/`height`, ~400ms,
  `cubic-bezier(0.22, 1, 0.36, 1)` — the same easing already used by
  `.animate-crest` in `index.css` (`animation: crestIn 1.1s
  cubic-bezier(0.22, 1, 0.36, 1) both;` at `src/index.css:171`).
- Controls arranged clock-face: title at 12 o'clock, prev/next at 9/3
  o'clock, play centered, volume at 6 o'clock.
- Volume: discrete integer level `0`–`5` (6 states), default level `3`
  (60%, i.e. `DEFAULT_LEVEL * 20` matches the old `DEFAULT_VOLUME = 0.6`
  exactly), shown as a 5-segment bar indicator, adjusted via tap −/+
  buttons only — no drag slider, no separate mute toggle (removed;
  redundant once level `0` already means silent).
- Closing: both an explicit **×** close button AND tapping anywhere
  outside the widget's bounding box must close it.
- Disc rotates continuously while playing **only when collapsed** (not
  while the circle is expanded) — reintroduces a spin animation, now
  applied to the vinyl-look disc itself.
- Respect `prefers-reduced-motion: reduce` for the spin animation.
- No new dependencies.
- Copy language: Malay (aria-labels).

---

### Task 1: Vinyl-disc CSS — replace `eqBar` with `vinylSpin` + grooves background

**Files:**
- Modify: `src/index.css:247-283` (the `eqBar` keyframe/class block and
  the `prefers-reduced-motion` media query's selector list)

**Interfaces:**
- Removes: `.animate-eq-bar` and `@keyframes eqBar` (fully superseded —
  Task 2 removes the last JSX reference to it).
- Produces: CSS class `.bg-vinyl-grooves` (dark concentric-groove
  background via `repeating-radial-gradient`, using
  `var(--color-violet-deep)`/`var(--color-violet)`), and CSS class
  `.animate-vinyl-spin` (keyframe `vinylSpin`, 3s linear infinite
  rotation), both consumed by Task 2's `MusicPlayer.tsx`.

- [ ] **Step 1: Replace the `eqBar` block in `src/index.css`**

Find this existing block (currently lines 247–264):

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

Replace it with:

```css
/* dark concentric-groove background for the collapsed music-player
   button, styled to look like a small vinyl record */
.bg-vinyl-grooves {
  background: repeating-radial-gradient(
    circle at center,
    var(--color-violet-deep) 0px,
    var(--color-violet-deep) 3px,
    var(--color-violet) 3px,
    var(--color-violet) 6px
  );
}

/* continuous rotation for the collapsed vinyl disc while a track plays */
@keyframes vinylSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-vinyl-spin {
  animation: vinylSpin 3s linear infinite;
}
```

- [ ] **Step 2: Update the reduced-motion selector list**

Find (currently around lines 266-277):

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

Replace `.animate-eq-bar,` with `.animate-vinyl-spin,`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fadeup,
  .animate-crest,
  .animate-rise,
  .animate-celebrate-glow,
  .animate-vinyl-spin,
  .reveal {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
```

- [ ] **Step 3: Confirm no stray references to the removed class remain**

Run: `grep -rn "animate-eq-bar\|eqBar" /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe/src`
Expected: matches only in `src/components/MusicPlayer.tsx` (Task 2
removes that usage) — no other files reference it.

- [ ] **Step 4: Type-check the project**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npx tsc -b`
Expected: no errors (this task touches no `.ts`/`.tsx` files).

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat: replace equalizer-bar CSS with vinyl-groove background and spin animation"
```

---

### Task 2: Rewrite `MusicPlayer.tsx` as a vinyl disc that expands into a clock-face circle

**Files:**
- Modify: `src/components/MusicPlayer.tsx` (full rewrite — imports,
  state, handlers, and JSX all change; the YouTube player-creation
  `useEffect`, `togglePlay`, `goToTrack`, `TRACKS`, and the ambient
  `Window.YT` type declaration keep their exact current logic, just
  relocated within the rewritten file)

**Interfaces:**
- Consumes: `.bg-vinyl-grooves` and `.animate-vinyl-spin` CSS classes
  from Task 1.
- Consumes from `react-icons/fi`: `FiPause`, `FiPlay`, `FiSkipBack`,
  `FiSkipForward`, `FiX` (replaces the previous icon set — `FiMusic`,
  `FiVolume2`, `FiVolumeX` are no longer used and must be removed from
  the import).
- Produces: `export default function MusicPlayer(): JSX.Element` — same
  public shape as before (no props), still mounted as `<MusicPlayer />`
  in `App.tsx` (no change needed there).
- Removes: the `EqualizerBars` helper function, `updateVolume`,
  `toggleMute`, and the `volume` (float) state — replaced by
  `adjustVolume` and `volumeLevel` (integer `0`–`5`) described below.

- [ ] **Step 1: Replace the entire contents of `src/components/MusicPlayer.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import { FiPause, FiPlay, FiSkipBack, FiSkipForward, FiX } from 'react-icons/fi'

// Replace with real YouTube video IDs (the 11-character id in a share link,
// e.g. https://youtu.be/XXXXXXXXXXX or ...watch?v=XXXXXXXXXXX).
const TRACKS = [
  { title: 'Lagu 1', videoId: 'SojAkORca9g' },
  { title: 'Lagu 2', videoId: 'tX73H2FRcK8' },
  { title: 'Lagu 3', videoId: 'pAbhAmOxGfc' },
]

const DEFAULT_LEVEL = 3
const VOLUME_LEVELS = [1, 2, 3, 4, 5]

/** Minimal shape of the pieces of the YouTube IFrame Player API this
 * component uses — kept local so no @types/youtube dependency is needed. */
type YouTubePlayer = {
  playVideo(): void
  pauseVideo(): void
  cueVideoById(videoId: string): void
  loadVideoById(videoId: string): void
  setVolume(volume: number): void
}

type YouTubePlayerEvent = { data: number; target: YouTubePlayer }

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string
          playerVars?: Record<string, number>
          events?: {
            onReady?: (event: YouTubePlayerEvent) => void
            onStateChange?: (event: YouTubePlayerEvent) => void
          }
        },
      ) => YouTubePlayer
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

export default function MusicPlayer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const trackIndexRef = useRef(0)

  const [isOpen, setIsOpen] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(DEFAULT_LEVEL)

  trackIndexRef.current = trackIndex

  // Loads the YouTube IFrame API script once and creates a single hidden
  // player instance backing all three tracks. onStateChange is the source
  // of truth for isPlaying — the API's own play/pause is async, so we
  // reflect its reported state rather than guessing ahead of it.
  useEffect(() => {
    function createPlayer() {
      if (!hostRef.current || playerRef.current || !window.YT) return
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId: TRACKS[0].videoId,
        playerVars: { controls: 0, disablekb: 1 },
        events: {
          onReady: (event) => {
            event.target.setVolume(DEFAULT_LEVEL * 20)
          },
          onStateChange: (event) => {
            const { PLAYING, PAUSED, ENDED } = window.YT!.PlayerState
            if (event.data === PLAYING) {
              setIsPlaying(true)
            } else if (event.data === PAUSED) {
              setIsPlaying(false)
            } else if (event.data === ENDED) {
              const next = (trackIndexRef.current + 1) % TRACKS.length
              setTrackIndex(next)
              event.target.loadVideoById(TRACKS[next].videoId)
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      createPlayer()
    } else {
      const previousCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.()
        createPlayer()
      }
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Closes the expanded circle when the guest taps anywhere outside it.
  useEffect(() => {
    if (!isOpen) return
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  function togglePlay() {
    const player = playerRef.current
    if (!player) return
    if (isPlaying) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  function goToTrack(nextIndex: number) {
    const wrapped = (nextIndex + TRACKS.length) % TRACKS.length
    setTrackIndex(wrapped)
    const player = playerRef.current
    if (!player) return
    if (isPlaying) {
      player.loadVideoById(TRACKS[wrapped].videoId)
    } else {
      player.cueVideoById(TRACKS[wrapped].videoId)
    }
  }

  function adjustVolume(delta: number) {
    setVolumeLevel((current) => {
      const next = Math.max(0, Math.min(5, current + delta))
      playerRef.current?.setVolume(next * 20)
      return next
    })
  }

  return (
    <div
      ref={containerRef}
      role={isOpen ? undefined : 'button'}
      tabIndex={isOpen ? undefined : 0}
      aria-label={isOpen ? undefined : 'Buka pemain muzik'}
      onClick={!isOpen ? () => setIsOpen(true) : undefined}
      onKeyDown={
        !isOpen
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setIsOpen(true)
              }
            }
          : undefined
      }
      className={`fixed right-5 bottom-5 z-50 rounded-full shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)]
        transition-[width,height] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]
        ${
          isOpen
            ? 'h-[10.5rem] w-[10.5rem] cursor-default border border-gold/40 bg-ivory ring-1 ring-inset ring-gold/15'
            : 'h-14 w-14 cursor-pointer bg-vinyl-grooves'
        }
        ${isPlaying && !isOpen ? 'animate-vinyl-spin' : ''}`}
    >
      <div ref={hostRef} className="hidden" aria-hidden="true" />

      <div
        aria-hidden="true"
        className={`absolute top-1/2 left-1/2 flex h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2
          items-center justify-center rounded-full bg-gold-soft ring-2 ring-gold transition-opacity
          duration-200 ${isOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-violet-deep" />
      </div>

      <div
        inert={!isOpen}
        className={`absolute inset-0 delay-100 transition-opacity duration-300
          ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <button
          type="button"
          aria-label="Tutup pemain muzik"
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-plum transition hover:text-violet"
        >
          <FiX size={16} />
        </button>

        <p className="absolute top-6 left-1/2 max-w-[110px] -translate-x-1/2 truncate text-center font-display text-xs text-violet">
          {TRACKS[trackIndex].title}
        </p>

        <button
          type="button"
          aria-label="Lagu sebelum"
          onClick={() => goToTrack(trackIndex - 1)}
          className="absolute top-1/2 left-4 -translate-y-1/2 text-violet/70 transition hover:text-violet"
        >
          <FiSkipBack size={18} />
        </button>

        <button
          type="button"
          aria-label={isPlaying ? 'Jeda muzik' : 'Main muzik'}
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2
            items-center justify-center rounded-full bg-gold text-ivory shadow-md transition hover:bg-gold/90"
        >
          {isPlaying ? <FiPause size={22} /> : <FiPlay size={22} className="ml-0.5" />}
        </button>

        <button
          type="button"
          aria-label="Lagu seterusnya"
          onClick={() => goToTrack(trackIndex + 1)}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-violet/70 transition hover:text-violet"
        >
          <FiSkipForward size={18} />
        </button>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
          <button
            type="button"
            aria-label="Kurangkan kelantangan"
            onClick={() => adjustVolume(-1)}
            className="flex h-5 w-5 items-center justify-center rounded-full text-violet ring-1 ring-gold/60"
          >
            <span className="text-xs leading-none">&minus;</span>
          </button>
          <div className="flex items-center gap-1">
            {VOLUME_LEVELS.map((level) => (
              <span
                key={level}
                className={`h-2.5 w-1 rounded-full ${level <= volumeLevel ? 'bg-gold' : 'bg-gold-soft/30'}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Tambah kelantangan"
            onClick={() => adjustVolume(1)}
            className="flex h-5 w-5 items-center justify-center rounded-full text-violet ring-1 ring-gold/60"
          >
            <span className="text-xs leading-none">+</span>
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check the project**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Lint the project**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npx oxlint`
Expected: no errors.

- [ ] **Step 4: Manually verify in the browser**

Run: `cd /Users/aimannaim/Documents/Repo/wedding-juwe/wedding-juwe && npm run dev:web`

Open the printed local URL. Confirm:

- The collapsed button looks like a small dark vinyl disc (grooves +
  gold center label), not a plain circle.
- Tapping the disc grows it smoothly (not an abrupt jump) into a ~168px
  circle; the center label fades out during the transition.
- Inside the expanded circle: the title sits near the top, prev/next are
  at the left/right edges, a large gold play button sits in the center,
  and −/bars/+ volume controls sit near the bottom — nothing overlaps or
  clips at this size.
- Tapping play starts real YouTube audio (the video IDs in `TRACKS` are
  real, playable songs) and flips the icon to pause; tapping the × button
  closes the circle back down to the small disc, which now rotates
  continuously since it's playing.
- Tapping pause stops the rotation.
- Reopen the circle, then click somewhere else on the page entirely
  (outside the widget) — confirm that also closes it.
- Tap + and − a few times each and confirm the 5-segment bar indicator
  fills/empties in step with taps, clamped at both ends (can't go below 0
  or above 5), and the actual audio volume audibly changes.
- Use Next/Prev inside the expanded circle to confirm the title updates
  and wraps at both ends (Lagu 1 → Prev → Lagu 3; Lagu 3 → Next → Lagu 1).
- Let a track play to completion and confirm it auto-advances to the
  next track and keeps playing.
- In a Chromium-based browser, enable "Emulate CSS media feature
  prefers-reduced-motion: reduce" in DevTools' Rendering panel, reload,
  play a track, and confirm the collapsed disc does NOT rotate.
- With the keyboard: `Tab` to the collapsed disc and press `Enter` or
  `Space` — confirm it opens the same as a click. Before that first tab
  stop reaches the disc, confirm `Tab` does NOT briefly focus any of the
  close/prev/play/next/volume buttons while the circle is still
  collapsed (the `inert` attribute on the controls wrapper should keep
  them out of the tab order until the circle is open).

Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 5: Commit**

```bash
git add src/components/MusicPlayer.tsx
git commit -m "feat: redesign music player as a vinyl disc that expands into a clock-face circle"
```
