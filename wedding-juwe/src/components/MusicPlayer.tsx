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
