import { createAvatar } from '@dicebear/core'
import { openPeeps } from '@dicebear/collection'
import type { Options } from '@dicebear/open-peeps'

/**
 * Shared avatar helpers. Avatars are illustrated "Open Peeps" characters,
 * generated locally in the browser (no network) so shuffling is instant.
 * The same seed always yields the same face. Used by both the wish form
 * (live preview + picker) and the wishes list.
 */

const THEME_BACKGROUNDS = ['f4ecda', 'e7d3a1', 'd8c2d4', 'efe3c8']

// Open Peeps' full face set, minus cyclops (one eye), monster (three eyes),
// angryWithFang/rage/veryAngry (angry), and solemn (sad).
const FACES: NonNullable<Options['face']> = [
  'awe',
  'blank',
  'calm',
  'cheeky',
  'concerned',
  'concernedFear',
  'contempt',
  'cute',
  'driven',
  'eatingHappy',
  'explaining',
  'eyesClosed',
  'fear',
  'hectic',
  'lovingGrin1',
  'lovingGrin2',
  'old',
  'serious',
  'smile',
  'smileBig',
  'smileLOL',
  'smileTeethGap',
  'suspicious',
  'tired',
]

// Open Peeps' default accessories, minus eyepatch (also reads as one-eyed).
const ACCESSORIES: NonNullable<Options['accessories']> = [
  'glasses',
  'glasses2',
  'glasses3',
  'glasses4',
  'glasses5',
  'sunglasses',
  'sunglasses2',
]

// Cache generated data URIs so repeated renders of the same seed are free.
const cache = new Map<string, string>()

/** An Open Peeps avatar (as an inline data URI) for a given seed. */
export function avatarUrl(seed: string): string {
  const key = seed.trim() || 'zd291t6k'
  const cached = cache.get(key)
  if (cached) return cached

  const uri = createAvatar(openPeeps, {
    seed: key,
    backgroundColor: THEME_BACKGROUNDS,
    face: FACES,
    accessories: ACCESSORIES,
    radius: 50,
  }).toDataUri()

  cache.set(key, uri)
  return uri
}

/** A short random seed, used for shuffle / picker options. */
export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10)
}
