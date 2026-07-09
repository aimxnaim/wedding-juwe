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
  cueVideoById(videoId: string): void
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
  const playerBarRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
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
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId: TRACKS[0].videoId,
        playerVars: { controls: 0, disablekb: 1 },
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

  function goToTrack(nextIndex: number) {
    const wrapped = (nextIndex + TRACKS.length) % TRACKS.length
    setTrackIndex(wrapped)
    setProgress(0)
    const player = playerRef.current
    if (!player) return
    if (isPlaying) {
      player.loadVideoById(TRACKS[wrapped].videoId)
    } else {
      player.cueVideoById(TRACKS[wrapped].videoId)
    }
  }

  return (
    <>
      <div ref={hostRef} className="hidden" aria-hidden="true" />

      <EntryGate onEnter={startMusic} />

      {/* Bottom-center dock. The wrapper ignores pointer events so it never
          intercepts taps meant for the page; only the bar itself is live. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md justify-center px-4 pb-3">
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
          className={`pointer-events-auto flex items-center overflow-hidden border border-gold text-cream shadow-[0_8px_22px_-8px_rgba(0,0,0,0.55)] transition-[width,border-radius,padding] duration-[450ms] ease-[cubic-bezier(0.5,0,0.3,1)] ${
            isOpen
              ? 'w-full gap-3 rounded-2xl px-3 py-2.5'
              : 'w-[92px] cursor-pointer gap-2 rounded-full px-2 py-1.5'
          }`}
          style={{
            background:
              'linear-gradient(180deg, var(--color-maroon), var(--color-maroon-deep))',
          }}
        >
          {/* spinning vinyl disc — grows slightly when expanded */}
          <div
            aria-hidden="true"
            className={`relative flex-none rounded-full bg-vinyl-grooves ring-1 ring-gold/50 ${
              isPlaying ? 'animate-vinyl-spin' : ''
            } ${isOpen ? 'h-9 w-9' : 'h-[30px] w-[30px]'}`}
          >
            <span className="absolute inset-[42%] rounded-full bg-gold-soft" />
          </div>

          {/* collapsed: little equalizer tick as the now-playing signal */}
          {!isOpen && (
            <div aria-hidden="true" className="flex h-3.5 items-end gap-0.5">
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
          )}

          {/* expanded: title + progress + controls */}
          {isOpen && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm text-cream">
                  {TRACKS[trackIndex].title}
                </p>
                <p className="text-[0.55rem] tracking-[0.2em] text-gold-soft/70">MUZIK MAJLIS</p>
                <div className="mt-1.5 h-0.5 rounded-full bg-cream/25">
                  <div
                    className="h-full rounded-full bg-gold-soft transition-[width] duration-500 ease-linear"
                    style={{ width: `${Math.min(100, progress * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-none items-center gap-3 text-gold-soft">
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
            </>
          )}
        </div>
      </div>
    </>
  )
}
