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

**Superseded by the addendum below** — the project pivoted from
self-hosted MP3s to YouTube-hosted tracks before real audio was sourced.
Original local-file design, kept for history:

```tsx
const TRACKS = [
  { title: 'Lagu 1', src: '/audio/song-1.mp3' },
  { title: 'Lagu 2', src: '/audio/song-2.mp3' },
  { title: 'Lagu 3', src: '/audio/song-3.mp3' },
]
```

Files were expected in `public/audio/` (served at `/audio/...` by Vite),
with a short `README.md` placeholder pointing to royalty-free sources.

## Addendum: YouTube-backed audio (supersedes "Audio files" above)

The user will supply YouTube links for the three songs instead of
hosting MP3 files directly (simpler than sourcing/licensing standalone
audio files; the video stays on YouTube's own player). `public/audio/`
is removed — no longer used.

- Tracks are declared as `{ title, videoId }`, where `videoId` is the
  11-character id from a YouTube share link:
  ```tsx
  const TRACKS = [
    { title: 'Lagu 1', videoId: 'VIDEO_ID_1' },
    { title: 'Lagu 2', videoId: 'VIDEO_ID_2' },
    { title: 'Lagu 3', videoId: 'VIDEO_ID_3' },
  ]
  ```
  `VIDEO_ID_1`/`2`/`3` are placeholders; the user supplies real ids later
  by editing this array only — no other code changes.
- A single hidden (`className="hidden"`, i.e. `display: none`) `<div>`
  is mounted once as the host element for one `window.YT.Player`
  instance (YouTube IFrame Player API), created after dynamically
  injecting the `https://www.youtube.com/iframe_api` script tag (skipped
  if already present, so this stays safe if the component were ever
  mounted twice). `display: none` does not interfere with the player's
  ability to initialize or play — confirmed directly (see debugging
  note below).
  `playerVars: { controls: 0, disablekb: 1 }` hides YouTube's own UI
  chrome entirely — the site's existing custom controls are the only UI
  the guest sees.
- No `@types/youtube` dependency is added (keeps the "no new
  dependencies" constraint); a minimal local ambient `Window.YT` type
  covering only the methods/events this component uses is declared
  in-file instead of pulling in official types.
- `isPlaying` is no longer optimistically set from click handlers — it's
  driven entirely by the player's own `onStateChange` event
  (`PLAYING`/`PAUSED`), since the IFrame API's state changes are
  asynchronous. `togglePlay` calls `playVideo()`/`pauseVideo()` and waits
  for the resulting state event to update the UI.
- Track switching calls `loadVideoById` (autoplays) if a track was
  already playing, or `cueVideoById` (loads without playing) if paused —
  preserving the original "if playing, keep playing; if paused, stay
  paused" behavior from the MP3 design.
- On `ENDED`, auto-advance to the next track via `loadVideoById` (same
  wraparound behavior as before).
- Volume: UI state stays a 0–1 slider value for continuity with the
  original design; converted to YouTube's 0–100 range only at the
  `player.setVolume()` call site.
- Trade-off accepted: this requires an internet connection to reach
  YouTube (a local MP3 wouldn't), and is technically loading a hidden
  video rather than a plain audio stream. Acceptable since the user
  prefers not to source/host standalone audio files.
- Until real video ids are substituted, pressing play calls the YouTube
  API with an invalid id; no special error handling is added for this —
  same "silent no-op during setup" posture as the original missing-MP3
  case.
- **Debugging note:** while wiring this up, an "Invalid video id" runtime
  error was chased down to a mistyped 12-character placeholder test ID
  (one character too many — real YouTube video ids are always 11
  characters). It was initially misattributed to the hidden host div's
  `display: none`, and the div was briefly changed to an off-screen
  `absolute`/`opacity-0` position as a workaround. That hypothesis was
  re-tested in isolation with a correct-length id and disproved — the
  player initializes fine under `display: none`. The workaround was
  reverted; the fix was correcting the video id, nothing else.

## Addendum 2: Slim pill redesign + equalizer bars

The original tall popover card (`w-64`, title stacked above controls)
felt too big and overlapped surrounding content awkwardly when open (see
screenshot feedback). Replaced with a compact single-row horizontal pill,
and the disc-spin "now playing" animation is replaced with pulsing
equalizer bars.

**Constraint:** the audio plays through a YouTube iframe (cross-origin),
so there is no way to read real frequency/waveform data from it —
browsers block that for security. The bars are a decorative, looping CSS
animation with staggered per-bar delays, not reactive to the actual
audio. This is the standard approach for "equalizer" icons that can't
access real audio data.

### Collapsed button (FAB)

Unchanged position/material (`rounded-full border-gold/40 bg-ivory`
button, bottom-right). Icon swaps based on `isPlaying`:
- Paused: static `FiMusic` (unchanged from before).
- Playing: 3 thin vertical bar `<span>`s, each animated with a new
  `eqBar` CSS keyframe (scaleY oscillating between ~30% and 100%),
  staggered via `animation-delay` (0s / 0.2s / 0.4s) so they don't move
  in lockstep. Bars use `bg-gold`. This fully replaces `.animate-disc-spin`
  (removed from `index.css`, along with the `@keyframes discSpin` rule and
  its entry in the `prefers-reduced-motion` list) — a new `.animate-eq-bar`
  class takes its place in that same reduced-motion list, so guests with
  reduced-motion preferences see static bars instead of a looping bounce.

### Expanded state — horizontal pill (replaces the popover card)

Tapping the button opens a single-row pill extending leftward, anchored
at the same bottom-right point, roughly 290–300px wide (vs. the previous
256px-wide, ~180px-tall card) — same `rounded-full border-gold/40
bg-ivory shadow-[...] ring-1 ring-inset ring-gold/15` material as before,
just one row instead of a stacked block:

```
◉ Lagu 1  |◁  ▶  ▷|   🔊──●─
```

Left to right:
- Truncated track title only (`truncate max-w-[72px]`, `font-display
  text-sm text-violet`) — the "1 / 3" counter is dropped to save width;
  the title alone is enough context.
- `FiSkipBack` / play-pause (gold circle, smaller than before —
  `h-9 w-9` instead of `h-11 w-11` — to fit the row height) / `FiSkipForward`.
- Mute-toggle icon (`FiVolume2`/`FiVolumeX`) + a compact `w-14` volume
  slider (`accent-gold`), same 0–1 range and behavior as before.

All existing interaction logic is unchanged: tap-to-open/close, prev/next
wraparound, `ended` auto-advance, real-time volume updates, mute toggle.
This addendum is a visual-only restyle of `MusicPlayer.tsx`'s JSX/classes
plus one CSS swap (disc-spin → equalizer bars) — no changes to the
YouTube IFrame Player wiring from Addendum 1.

## Addendum 3: Vinyl-record disc redesign (supersedes Addendum 2)

User feedback after seeing the pill: still "not appealing," and the
floating widget appearing over different, changing page content while
scrolling read as it "suddenly jumping to the middle" — an inherent
side effect of any `position: fixed` corner widget, not something
specific to the pill shape. Explored via the visual brainstorming
companion (mockups + a live interactive HTML demo); user confirmed a
concrete direction: a vinyl-record aesthetic that grows into a circle on
tap, decided after clicking through options in the companion tool
(session log: `.superpowers/brainstorm/` mockups, not committed —
gitignored scratch). Confirmed choice was to **keep** the floating
corner widget (not switch to a full-width bar).

This fully replaces Addendum 2's pill and equalizer bars. The disc
rotating while playing is itself the "now playing" signal — no separate
equalizer bars needed.

### Collapsed state — vinyl disc

Same footprint and position as before (`h-14 w-14`, i.e. 56px, fixed
bottom-right). Restyled to look like a small vinyl record instead of a
plain ivory circle:
- Background: `repeating-radial-gradient(circle at center, <violet-deep>
  0px, <violet-deep> 3px, <violet> 3px, <violet> 6px)` — fine dark
  concentric grooves, using the existing `--color-violet-deep` /
  `--color-violet` tokens.
- A small center "label" circle (~30px), `bg-gold-soft` with a
  `ring-gold` border and a tiny dark center dot (`bg-violet-deep`),
  matching a real record's paper label + spindle hole.
- While playing, the whole disc rotates continuously (reintroduces a
  `discSpin`-equivalent keyframe — reusing the same rotation mechanism
  Addendum 1 originally had, now applied to a disc that actually looks
  like a record, so the metaphor lands correctly this time). Respects
  `prefers-reduced-motion: reduce` the same way the original
  `.animate-disc-spin` did.
- The center label fades out (`opacity` transition) as the disc expands,
  since the label doesn't make sense once controls take over that space.

### Expanded state — clock-face circle

Tapping the disc grows it in place (CSS `width`/`height` transition,
~400ms, `cubic-bezier(0.22, 1, 0.36, 1)` — the same easing curve already
used by `.animate-crest` elsewhere in `index.css`, so the motion feels
consistent with the rest of the site) into a modestly-sized circle —
**168px diameter** (roughly 3× the collapsed size; deliberately much
smaller than the 220px used in the throwaway brainstorming demo, per
explicit user instruction to keep it "nice," not oversized). Background
switches from the dark grooved disc to `bg-ivory` with the same
`border-gold/40 ring-1 ring-inset ring-gold/15` material used elsewhere
on the site, so the expanded state matches the site's card language
while the collapsed state keeps the vinyl look.

Controls are arranged radially ("clock-face" layout), confirmed as the
preferred option over a plain stacked-center or big-center-play layout:
- **12 o'clock:** truncated track title (`font-display text-xs
  text-violet`), absolutely positioned near the top edge.
- **9 o'clock / 3 o'clock:** `FiSkipBack` / `FiSkipForward`, vertically
  centered at the left/right edges.
- **Center:** play/pause button, gold filled circle, the visual anchor
  of the whole layout (largest single element).
- **6 o'clock:** volume control, **not** a drag slider (confirmed
  against a curved arc-dial alternative and a tiny straight-slider
  alternative — both rejected as more fiddly/less fitting) — instead a
  tap **−** / **+** step control with a small 5-segment bar indicator
  showing the current discrete level. 6 levels total (0 through 5,
  i.e. 0%/20%/40%/60%/80%/100%); default level **3** (60%), preserving
  the existing `DEFAULT_VOLUME = 0.6` default exactly. Each tap moves
  one level and calls `player.setVolume(level * 20)` (YouTube's 0–100
  range), clamped to `[0, 5]`.

### Closing the expanded circle

Two ways to close, both required:
1. An explicit small **×** close button (`FiX`, `text-plum`) in the
   corner of the expanded circle (top-right).
2. Tapping **anywhere outside** the widget's bounding box (a
   document-level click listener that closes the circle if the click
   target isn't inside the widget's root `<div>`) — explicitly requested
   by the user as an additional, more discoverable way to dismiss it,
   since with the circle mostly filled by controls there's little empty
   "background" area left to tap inside it.

Tapping the collapsed disc still opens it, same as before (unchanged
toggle-on-tap-the-button semantics for opening).

### Data model changes

Volume moves from a continuous `0–1` float (driven by a range `<input>`)
to a discrete integer level `0–5` (driven by tap +/-). The conversion to
YouTube's `setVolume` call becomes `level * 20` instead of
`volume * 100`. `DEFAULT_VOLUME` becomes `const DEFAULT_LEVEL = 3`.
Mute is dropped as a separate concept — tapping **−** down to level `0`
already achieves silence, so a dedicated mute toggle is redundant and
removed (YAGNI once volume is already discrete step-based).

All other logic from Addendum 1 (YouTube IFrame Player wiring,
`togglePlay`, `goToTrack`'s `loadVideoById`/`cueVideoById` split, ENDED
auto-advance) is unchanged.

## Addendum 4: Footer bar redesign (supersedes Addendum 3)

User feedback after living with the vinyl-disc-in-the-corner: the
floating corner circle still wasn't the look they wanted. New direction,
decided via the visual brainstorming companion (mockups + live
interactive demos; scratch in `.superpowers/brainstorm/`, gitignored):
replace the corner circle with a **music footer bar docked at the bottom
of the page**. This also pairs with the new entry gate
(`2026-07-08-entry-gate-design.md`) which now handles autoplay-on-entry.

This fully replaces Addendum 3's corner disc/clock-face. The player is no
longer a corner FAB — it's a bottom-docked bar with a small-pill collapsed
state and a compact expanded card.

### Position — bottom-center dock

- Container becomes `fixed inset-x-0 bottom-0 z-50`, a flex row that
  centers its child, with bottom + side padding — so the player sits
  **centered along the bottom edge** rather than in a corner. It stays
  put while the page scrolls (unchanged `position: fixed` behavior).
- **Two footers, no conflict:** the existing `App.tsx` `<footer>` (Arabic
  names / date / credit) is part of normal document flow and scrolls away
  like the rest of the page. This music bar is `fixed` and floats above
  the very bottom of the viewport. They never collide — the music bar
  simply hovers over whatever content is at the bottom, including the page
  footer when scrolled there. (Confirmed as the intended behavior with the
  user.)

### Collapsed state — small pill (default)

The default resting state, kept deliberately small so it stays out of the
way:

- A compact rounded pill, `bg-maroon`-gradient (maroon → maroon-deep) with
  a `border-gold` hairline and a soft drop shadow — matching the gate's
  material so the two read as one family.
- Contents: the small spinning vinyl **disc** (reused groove styling from
  Addendum 3, ~28–30px) + a tiny **3-bar equalizer** tick
  (`--color-gold-soft` bars, staggered `eqBar` keyframe) as the "now
  playing" signal. Width is just enough for those two (~90px).
- While playing, the disc rotates (respects `prefers-reduced-motion`); the
  equalizer bars animate. Tapping the pill expands it.

### Expanded state — compact floating card (tap to open)

Tapping the pill grows it **in place** into the full card (CSS `width` /
`border-radius` / `padding` transition, ~450ms `cubic-bezier(.5,0,.3,1)`).
This is the design the user approved with the disc + progress bar; kept
compact ("nice, not big"):

```
◉  Nasyid Cinta        ⏮  ⏸  ⏭   ✕
   MUZIK MAJLIS   ────────
```

Left to right, single row:
- The spinning **disc** (~36px), grown slightly from the pill's disc (same
  element, animates size).
- **Track title** (`font-display text-cream`, `truncate`) with a small
  `MUZIK MAJLIS` label beneath, and a thin **progress bar** under that
  (`--color-gold-soft` fill on a translucent track) reflecting playback
  position.
- **Controls** in `--color-gold-soft`: `FiSkipBack` / play-pause
  (`FiPlay`/`FiPause`) / `FiSkipForward`.
- A small **`FiX`** to collapse back to the pill.

Card stays a single short row (never tall) and auto-fits the card width to
the mobile card; on the phone-width layout it spans the dock with side
gaps (the approved "floating card" look, type C).

### Progress bar (new vs. Addendum 3)

Addendum 3 had no progress indicator. The bar here reflects real playback
position: poll `player.getCurrentTime()` / `player.getDuration()` on an
interval (e.g. every ~500ms while expanded and playing) and set the fill
width `= currentTime / duration`. Add `getCurrentTime`/`getDuration` to
the local `YouTubePlayer` type. Non-interactive for v1 (display only — no
seek-on-click); seeking can be a later addition if wanted.

### Controls, volume, closing

- Play/pause, prev/next wraparound, and `ENDED` auto-advance: **unchanged**
  from Addendum 1's YouTube wiring.
- **Volume:** the clock-face tap −/+ 6-level control from Addendum 3 does
  not fit the single-row bar. For v1 the bar omits an on-surface volume
  control (guests use their device volume), keeping the row compact. The
  `DEFAULT_LEVEL = 3` (60%) initial volume set in `onReady` stays. (If a
  volume affordance is later wanted, add a small popover above the bar —
  out of scope now, YAGNI.)
- **Closing:** the `✕` collapses the card back to the pill. The
  document-level outside-click listener from Addendum 3 also collapses it
  (tap anywhere off the card). No full "hide/dismiss" — the pill always
  remains as the persistent now-playing affordance.

### What's removed from Addendum 3

- The corner position (`bottom-5 right-5`) → bottom-center dock.
- The 168px clock-face circle and its radial control layout → single-row
  compact card.
- The on-widget tap −/+ volume stepper (see Volume note above).
- The center-label-fade-on-expand detail (the disc now persists into the
  expanded card rather than being replaced by an ivory face).

Kept: the vinyl groove disc styling, the YouTube IFrame wiring
(Addendum 1), prev/next wraparound, ENDED auto-advance, reduced-motion
handling for the spin.

## Addendum 5: iOS production fixes + deep-violet theming

Three bugs reported from the deployed site on iPhone Safari, all invisible
in desktop Chrome:

- **Autoplay never started.** `new YT.Player(<div>)` lets the API build the
  iframe, and that iframe carries **no `allow` attribute**. iOS Safari
  refuses programmatic playback on a cross-origin iframe that has not been
  delegated the autoplay permission, so `playVideo()` inside the gate's tap
  handler silently did nothing. Fixed by rendering the `<iframe>` ourselves
  with `allow="autoplay; encrypted-media"` and `playsinline=1` (the latter
  stops iOS hijacking playback into a fullscreen player), then attaching
  `new YT.Player(iframeEl, { events })` to it — the video id and player vars
  now come from the iframe's own `src`. The host is also visually hidden
  (`h-px w-px opacity-0`) rather than `display: none`, since some mobile
  browsers won't start audio in a fully un-rendered iframe.
- **Prev/next loaded but didn't play.** `goToTrack` called `cueVideoById`
  (load without playing) whenever `isPlaying` was false. `isPlaying` is
  driven by the player's *async* `onStateChange`, so it is routinely still
  false right after entry — and stayed false permanently once autoplay was
  refused. Now prev/next always `loadVideoById`: an explicit tap is an
  explicit intent to play.
- **The pill was hidden behind iOS Safari's bottom toolbar** at
  `bottom-0` + `pb-3` (12px). The dock now uses
  `padding-bottom: calc(1.25rem + env(safe-area-inset-bottom))`.

Also, per the user: the pill moves from bottom-**centre** to bottom-**right**
(`justify-end`), and the maroon is dropped in favour of the site's existing
`--color-violet`/`--color-violet-deep` — matching the entry gate, so the
invitation keeps to one accent colour instead of introducing a second.

## Testing

- Manual verification: tap the collapsed disc, confirm it grows smoothly
  into the 168px circle (not an abrupt jump) and the center label fades
  out; confirm the clock-face layout (title top, prev/next sides, play
  center, volume bottom) doesn't overlap or clip at that size; tap +/-
  and confirm the bar indicator updates and moves in 6 discrete steps
  (0–5) with real volume changes audible; tap the × button and confirm it
  closes; reopen and tap outside the widget and confirm that also
  closes; tap play and confirm the *collapsed* disc rotates continuously
  once closed while playing, and stops rotating when paused; check the
  rotation freezes under `prefers-reduced-motion: reduce`; use Next/Prev
  to confirm wraparound at both ends; let a track play to completion and
  confirm ENDED auto-advance still works.
- **Addendum 4 (footer bar):** confirm the player docks bottom-center and
  stays there while scrolling; the default is the small pill (disc +
  equalizer) and it's unobtrusive; tapping it grows smoothly into the
  compact one-row card (title + progress + ⏮ ⏸ ⏭ + ✕), never tall; the
  progress bar advances during playback; ⏸/▶ and prev/next wraparound and
  ENDED auto-advance all still work; ✕ and outside-click both collapse
  back to the pill; the pill's disc spins while playing and freezes under
  `prefers-reduced-motion: reduce`; the page `<footer>` and the music bar
  don't visually collide when scrolled to the bottom.
- No unit test framework currently present in the project; scope does not
  warrant introducing one for this widget.
