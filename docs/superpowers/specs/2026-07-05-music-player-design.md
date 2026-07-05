# Background Music Player — Design

## Purpose

Add a floating background-music widget to the wedding site: play/pause,
volume control, and switching between three songs, styled to match the
site's existing cream/violet/gold visual language.

## Placement

New component `src/components/MusicPlayer.tsx`, rendered once in
`App.tsx` alongside the existing sections:

```tsx
<Hero />
<CountdownSection />
<LocationSection />
<WishesSection />
<MusicPlayer />
```

It renders as a `fixed bottom-5 right-5 z-50` widget, independent of
document flow, so it stays visible while scrolling regardless of where
it's placed in the JSX. On wide desktop viewports it sits at the browser
corner rather than the centered card's corner (the page is a mobile-width
card on desktop) — acceptable since the primary audience views this on
phones, where viewport and card edge coincide.

## Visual structure

### Collapsed state (default)

A round button, ~56px, matching the countdown card's material:
`rounded-full border border-gold/40 bg-ivory shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)] ring-1 ring-inset ring-gold/15`,
containing a music-note icon (`FiMusic` from `react-icons/fi`) in
`text-violet`. While a track is playing, the button slowly rotates (new
`discSpin` keyframe, 8s linear infinite, `animation-play-state` toggled
by `isPlaying` so it pauses/resumes rather than resetting) — a subtle
gramophone-disc nod using only CSS, no new artwork.

### Expanded state (tap to open)

Tapping the collapsed button opens a popover card directly above it,
anchored bottom-right, using the same shell as `CountdownSection`'s
panel: `rounded-3xl border border-gold/40 bg-ivory p-5 shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)] ring-1 ring-inset ring-gold/15`.
Contents, top to bottom:

- Track title in `font-display text-violet`, with a small "1 / 3"
  counter in `text-plum` beneath it.
- A control row: `FiSkipBack` (prev) — larger circular gold button with
  `FiPlay`/`FiPause` (toggle) — `FiSkipForward` (next). Prev/Next wrap
  around the 3-track list.
- A volume row: mute-toggle icon (`FiVolume2`/`FiVolumeX`) + a
  horizontal `<input type="range">` styled with `accent-color: var(--color-gold)`
  matching the theme.

Tapping the collapsed button again (or the button while expanded) closes
the popover; the underlying button icon/rotation state doesn't change
when the popover opens or closes — those are orthogonal.

## Behavior

- Starts paused; there is **no autoplay**. Nothing plays until the guest
  taps the play button, avoiding browser autoplay-restriction complexity
  entirely.
- A single `<audio>` element (via `useRef`) backs all three tracks;
  switching tracks swaps its `src` and preserves the play/pause and
  volume state (if it was playing, the new track starts playing
  immediately).
- Volume slider updates `audioRef.current.volume` directly (0–1 range);
  default volume is `0.6`.
- On the audio `ended` event, auto-advance to the next track (wrapping
  after the third back to the first) and keep playing — background music
  shouldn't just stop at the end of one track.
- No persistence (localStorage) of play state/volume/track across page
  reloads — out of scope, adds complexity for a feature guests will use
  once per visit.

## Audio files

Tracks are declared as a small constant at the top of the component:

```tsx
const TRACKS = [
  { title: 'Lagu 1', src: '/audio/song-1.mp3' },
  { title: 'Lagu 2', src: '/audio/song-2.mp3' },
  { title: 'Lagu 3', src: '/audio/song-3.mp3' },
]
```

Files are expected in `public/audio/` (served at `/audio/...` by Vite).
That directory will be created with a short `README.md` placeholder
explaining the expected filenames and pointing to royalty-free sources
(Pixabay Music, YouTube Audio Library) for calm instrumental/nasheed-style
tracks appropriate to a Malay wedding site. Swapping in real songs later
only requires dropping MP3s into that folder and editing the `title`/`src`
strings — no other code changes.

If a file is missing (e.g. before the user adds real MP3s), the browser
will fail to load it silently on play attempt; no special error UI is
built for this since it's a temporary placeholder-only state during setup,
not a real runtime condition.

## Testing

- Manual verification: tap play/pause, confirm audio starts/stops and the
  button begins/stops rotating; drag the volume slider and confirm audible
  level change; use Next/Prev to cycle through all 3 tracks including
  wraparound at both ends; let a short test track play to completion and
  confirm it auto-advances.
- No unit test framework currently present in the project; scope does not
  warrant introducing one for this widget.
