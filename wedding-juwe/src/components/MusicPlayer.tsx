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

// Replace with real YouTube video IDs (the 11-character id in a share link,
// e.g. https://youtu.be/XXXXXXXXXXX or ...watch?v=XXXXXXXXXXX).
const TRACKS = [
  { title: 'Lagu 1', videoId: 'VIDEO_ID_1' },
  { title: 'Lagu 2', videoId: 'VIDEO_ID_2' },
  { title: 'Lagu 3', videoId: 'VIDEO_ID_3' },
]

const DEFAULT_VOLUME = 0.6

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
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const trackIndexRef = useRef(0)

  const [isOpen, setIsOpen] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)

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
            event.target.setVolume(volume * 100)
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

  function updateVolume(next: number) {
    setVolume(next)
    playerRef.current?.setVolume(next * 100)
  }

  function toggleMute() {
    updateVolume(volume === 0 ? DEFAULT_VOLUME : 0)
  }

  return (
    <div className="fixed right-5 bottom-5 z-50">
      {/* display:none breaks the YouTube iframe player's ability to
          initialize/play — position it off-screen instead so it stays
          rendered (and audible) while remaining invisible. */}
      <div
        ref={hostRef}
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        style={{ left: '-9999px' }}
        aria-hidden="true"
      />

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
              onChange={(event) => updateVolume(Number(event.target.value))}
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
