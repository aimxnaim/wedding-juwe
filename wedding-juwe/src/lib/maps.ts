/**
 * Map links for the venue.
 *
 * Plain https links to waze.com / google.com/maps only reach the installed
 * app through iOS Universal Links and Android App Links, and those are
 * ignored inside in-app browsers (WhatsApp, Instagram, Facebook) — which is
 * how most guests open the invitation. There the link just loads the mobile
 * *website*, which is what elderly guests get stuck on.
 *
 * Custom schemes (waze://, comgooglemaps://, intent://) are handed to the OS
 * even from a WebView, so we try those first on mobile and fall back to the
 * https link if nothing takes over.
 */

export const VENUE = {
  lat: 6.103472,
  lng: 102.256502,
  label: 'Lot-1700, Jalan Masjid Lundang, 15150 Kota Bharu, Kelantan',
}

const LL = `${VENUE.lat},${VENUE.lng}`

/** Google's documented URL API — far more app-friendly than a copied share link. */
export const GOOGLE_MAPS_WEB_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LL)}`
export const WAZE_WEB_URL = `https://waze.com/ul?ll=${encodeURIComponent(LL)}&navigate=yes`

export type Platform = 'ios' | 'android' | 'other'

export function detectPlatform(userAgent: string, maxTouchPoints = 0): Platform {
  if (/android/i.test(userAgent)) return 'android'
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios'
  // iPadOS 13+ reports a desktop Macintosh user agent; touch points give it away.
  if (/macintosh/i.test(userAgent) && maxTouchPoints > 1) return 'ios'
  return 'other'
}

/** Scheme URL that launches the native app, or null when there is no app to launch. */
export function wazeAppUrl(platform: Platform): string | null {
  if (platform === 'other') return null
  return `waze://?ll=${LL}&navigate=yes`
}

export function googleMapsAppUrl(platform: Platform): string | null {
  if (platform === 'ios') return `comgooglemaps://?q=${LL}&center=${LL}&zoom=17`
  if (platform === 'android') {
    // Android intent URLs let Chrome do the fallback itself if Maps is missing.
    return (
      `intent://maps.google.com/maps?q=${LL}&z=17#Intent;scheme=https;` +
      `package=com.google.android.apps.maps;` +
      `S.browser_fallback_url=${encodeURIComponent(GOOGLE_MAPS_WEB_URL)};end`
    )
  }
  return null
}

const FALLBACK_DELAY_MS = 1200

/**
 * Try to hand the URL to the native app; if we are still on the page a moment
 * later the app never opened, so send the guest to the website instead.
 */
export function openMapApp(appUrl: string | null, webUrl: string) {
  if (!appUrl) {
    window.open(webUrl, '_blank', 'noopener,noreferrer')
    return
  }

  const timer = window.setTimeout(() => {
    if (document.visibilityState === 'visible') window.location.href = webUrl
  }, FALLBACK_DELAY_MS)

  // The app taking over hides the page — that means no fallback is needed.
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'hidden') window.clearTimeout(timer)
    },
    { once: true },
  )

  window.location.href = appUrl
}
