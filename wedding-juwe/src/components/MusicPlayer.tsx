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
