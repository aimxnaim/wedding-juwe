import { useEffect, useRef, useState } from 'react'
import { FiPause, FiPlay, FiSkipBack, FiSkipForward, FiX } from 'react-icons/fi'
import EntryGate from './EntryGate'

// Replace with real YouTube video IDs (the 11-character id in a share link,
// e.g. https://youtu.be/XXXXXXXXXXX or ...watch?v=XXXXXXXXXXX).
const TRACKS = [
  { title: 'Lagu 1', videoId: 'SojAkORca9g' },
  { title: 'Lagu 2', videoId: 'tX73H2FRcK8' },
  { title: 'Lagu 3', videoId: 'pAbhAmOxGfc' },
]

const DEFAULT_LEVEL = 3

/** Minimal shape of the pieces of the YouTube IFrame Player API this
 * component uses — kept local so no @types/youtube dependency is needed. */
type YouTubePlayer = {
  playVideo(): void
  pauseVideo(): void
  loadVideoById(videoId: string): void
  setVolume(volume: number): void
  getCurrentTime(): number
  getDuration(): number
}

type YouTubePlayerEvent = { data: number; target: YouTubePlayer }

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          // Omitted when attaching to an existing <iframe>: the video and
          // player vars come from that iframe's own src.
          videoId?: string
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

/**
 * We render the <iframe> ourselves instead of letting YT.Player build it from a
 * <div>. A YT-built iframe carries no `allow` attribute, and iOS Safari refuses
 * programmatic playback on a cross-origin iframe that hasn't been delegated the
 * autoplay permission — so `playVideo()` silently did nothing on iPhone even
 * though it worked on desktop Chrome. `playsinline=1` likewise stops iOS from
 * hijacking playback into a fullscreen player.
 */
function buildEmbedSrc(videoId: string) {
  const params = new URLSearchParams({
    enablejsapi: '1',
    controls: '0',
    disablekb: '1',
    playsinline: '1',
    rel: '0',
    // Trim the player down to just audio playback: no branding, no annotations,
    // no fullscreen affordance, no related-video overlay.
    modestbranding: '1',
    iv_load_policy: '3',
    fs: '0',
    origin: window.location.origin,
  })
  // The privacy-enhanced host: no ad module, so none of the
  // googleads.g.doubleclick.net/pagead requests fire. (YouTube's own playback
  // telemetry — log_event / ptracking / qoe — still does; that is internal to
  // its player and cannot be switched off from the embed.)
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`
}

export default function MusicPlayer() {
  const playerBarRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const trackIndexRef = useRef(0)
  // Set when the guest opens the gate before the player has finished
  // loading; onReady checks it so music still starts on a slow connection.
  const intentToPlayRef = useRef(false)

  const [isOpen, setIsOpen] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  trackIndexRef.current = trackIndex

  // Loads the YouTube IFrame API script once and creates a single hidden
  // player instance backing all three tracks. onStateChange is the source
  // of truth for isPlaying — the API's own play/pause is async, so we
  // reflect its reported state rather than guessing ahead of it.
  useEffect(() => {
    function createPlayer() {
      if (!hostRef.current || playerRef.current || !window.YT) return
      // Attach to the iframe we rendered (which carries allow="autoplay" and
      // playsinline). Its src already supplies the video id and player vars.
      playerRef.current = new window.YT.Player(hostRef.current, {
        events: {
          onReady: (event) => {
            event.target.setVolume(DEFAULT_LEVEL * 20)
            // Guest already tapped the gate while we were still loading.
            if (intentToPlayRef.current) event.target.playVideo()
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
              setProgress(0)
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
      // index.html already requests this script so the player warms up in
      // parallel with the bundle; this append is only a fallback for the case
      // where that tag is missing.
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Advance the progress bar while the card is open and a track is playing.
  useEffect(() => {
    if (!isOpen || !isPlaying) return
    const id = window.setInterval(() => {
      const player = playerRef.current
      if (!player?.getDuration) return
      const duration = player.getDuration()
      setProgress(duration ? player.getCurrentTime() / duration : 0)
    }, 500)
    return () => window.clearInterval(id)
  }, [isOpen, isPlaying, trackIndex])

  // Collapse the expanded card back to the pill when tapping outside it.
  useEffect(() => {
    if (!isOpen) return
    function handleOutsideClick(event: MouseEvent) {
      if (playerBarRef.current && !playerBarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  // Called from the entry gate's tap, inside the user-gesture call stack.
  function startMusic() {
    const player = playerRef.current
    if (player) {
      player.playVideo()
    } else {
      intentToPlayRef.current = true
    }
  }

  function togglePlay() {
    const player = playerRef.current
    if (!player) return
    if (isPlaying) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  // Tapping prev/next always starts the new track. It used to `cueVideoById`
  // (load, don't play) whenever `isPlaying` was false, which left the guest
  // staring at a track that never started — `isPlaying` is driven by the
  // player's async onStateChange, so it is routinely still false right after
  // entering, and stays false whenever autoplay was refused.
  function goToTrack(nextIndex: number) {
    const wrapped = (nextIndex + TRACKS.length) % TRACKS.length
    setTrackIndex(wrapped)
    setProgress(0)
    playerRef.current?.loadVideoById(TRACKS[wrapped].videoId)
  }

  return (
    <>
      {/* Visually hidden rather than display:none — some mobile browsers won't
          start audio in a fully un-rendered iframe. */}
      <iframe
        ref={hostRef}
        src={buildEmbedSrc(TRACKS[0].videoId)}
        allow="autoplay; encrypted-media"
        title=""
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute -z-10 h-px w-px border-0 opacity-0"
      />

      <EntryGate onEnter={startMusic} />

      {/* Top-left dock. The wrapper ignores pointer events so it never
          intercepts taps meant for the page; only the bar itself is live.
          The safe-area padding keeps the pill clear of the iOS notch and of
          Safari's top chrome. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto flex max-w-md justify-start px-4"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        <div
          ref={playerBarRef}
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
          // px-2.5 in both states: unequal padding slid the disc 2px sideways
          // as the card opened. Equal padding pins it, so only width animates.
          // Everything but the disc is absolutely positioned, so the width
          // animation never reflows the contents mid-flight.
          className={`pointer-events-auto relative flex h-14 items-center overflow-hidden border border-gold/40 px-2.5 text-cream shadow-[0_6px_18px_-10px_rgba(44,36,69,0.5)] backdrop-blur-md transition-[width,border-radius] duration-[450ms] ease-[cubic-bezier(0.5,0,0.3,1)] ${
            isOpen ? 'w-[268px] rounded-[1.75rem]' : 'w-[92px] cursor-pointer rounded-full'
          }`}
          style={{
            background:
              // Same deep-violet family as the entry gate, so the site keeps to
              // one accent colour rather than introducing a separate maroon.
              // Held back from opaque so the page reads faintly through it —
              // backdrop-blur keeps text legible over busy hero imagery.
              'linear-gradient(180deg, color-mix(in srgb, var(--color-violet) 72%, transparent), color-mix(in srgb, var(--color-violet-deep) 78%, transparent))',
          }}
        >
          {/* spinning vinyl disc — one size in both states, so opening the card
              animates width alone rather than resizing the disc mid-flight */}
          <div
            aria-hidden="true"
            className={`relative h-9 w-9 flex-none rounded-full bg-vinyl-grooves ring-1 ring-gold/50 ${
              isPlaying ? 'animate-vinyl-spin' : ''
            }`}
          >
            {/* gloss streak — rotates with the disc, so the spin is visible */}
            <span className="bg-vinyl-sheen absolute inset-0 rounded-full opacity-70" />
            {/* rim marker: the one asymmetric feature on an otherwise
                rotationally symmetric disc. Without it the spin is invisible. */}
            <span className="absolute left-1/2 top-[3px] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-gold/80" />
            {/* deeper gold than the old gold-soft: the label sat on a violet
                disc before and now needs to hold its own against cream */}
            <span className="absolute inset-[42%] rounded-full bg-gold" />
          </div>

          {/* Both layers stay mounted and absolutely positioned beside the disc.
              Mounting them conditionally made the contents pop in and then get
              squeezed by the width animation; cross-fading them instead lets the
              bar's width and its contents move independently. Each layer fades
              out fast, and fades in only once the width has mostly settled. */}

          {/* collapsed: little equalizer tick as the now-playing signal */}
          <div
            aria-hidden="true"
            className={`absolute left-14 top-1/2 flex h-3.5 -translate-y-1/2 items-end gap-0.5 transition-opacity ${
              isOpen ? 'opacity-0 duration-150' : 'opacity-100 delay-200 duration-200'
            }`}
          >
            <span className="w-0.5 rounded-full bg-gold-soft animate-eq-bar" style={{ height: '6px' }} />
            <span
              className="w-0.5 rounded-full bg-gold-soft animate-eq-bar"
              style={{ height: '14px', animationDelay: '0.2s' }}
            />
            <span
              className="w-0.5 rounded-full bg-gold-soft animate-eq-bar"
              style={{ height: '9px', animationDelay: '0.4s' }}
            />
          </div>

          {/* expanded: title + progress + controls. `inert` keeps the controls
              out of the tab order and off screen readers while collapsed. */}
          <div
            inert={!isOpen}
            className={`absolute inset-y-0 left-14 right-2.5 flex items-center gap-2.5 transition-opacity ${
              isOpen ? 'opacity-100 delay-200 duration-200' : 'opacity-0 duration-150'
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm text-cream">{TRACKS[trackIndex].title}</p>
              <p className="text-[0.55rem] tracking-[0.2em] text-gold-soft/70">MUZIK MAJLIS</p>
              <div className="mt-1.5 h-0.5 rounded-full bg-cream/25">
                <div
                  className="h-full rounded-full bg-gold-soft transition-[width] duration-500 ease-linear"
                  style={{ width: `${Math.min(100, progress * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex flex-none items-center gap-2 text-gold-soft">
              <button
                type="button"
                aria-label="Lagu sebelum"
                onClick={() => goToTrack(trackIndex - 1)}
                className="transition hover:text-cream"
              >
                <FiSkipBack size={16} />
              </button>
              <button
                type="button"
                aria-label={isPlaying ? 'Jeda muzik' : 'Main muzik'}
                onClick={togglePlay}
                className="transition hover:text-cream"
              >
                {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
              </button>
              <button
                type="button"
                aria-label="Lagu seterusnya"
                onClick={() => goToTrack(trackIndex + 1)}
                className="transition hover:text-cream"
              >
                <FiSkipForward size={16} />
              </button>
              <button
                type="button"
                aria-label="Tutup pemain muzik"
                onClick={() => setIsOpen(false)}
                className="text-gold-soft/60 transition hover:text-cream"
              >
                <FiX size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
