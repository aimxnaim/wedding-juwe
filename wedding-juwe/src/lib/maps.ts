/**
 * Map links for the venue.
 *
 * Plain https links to waze.com / google.com/maps only reach the installed
 * app through iOS Universal Links and Android App Links, and those are
 * ignored inside in-app browsers (WhatsApp, Instagram, Facebook) — which is
 * how most guests open the invitation. There the link just loads the mobile
 * *website*, which is what elderly guests get stuck on.
 *
 * So each context gets the one link the platform itself knows how to resolve,
 * and the platform decides what to do when the app is missing. We never race a
 * timer against the "Open in Waze?" prompt: a timer cannot tell a guest who
 * tapped Cancel from a guest who has no app installed, and guessing wrong
 * yanks them somewhere they did not ask to go.
 */

export const VENUE = {
  lat: 6.103472,
  lng: 102.256502,
  label: 'Lot-1700, Jalan Masjid Lundang, 15150 Kota Bharu, Kelantan',
}

const LL = `${VENUE.lat},${VENUE.lng}`

/**
 * Embed URL for the iframe.
 *
 * The obvious `maps?q=…&output=embed` form is a 301 to this endpoint, and that
 * redirect response carries `X-Frame-Options: SAMEORIGIN`. WebKit checks that
 * header on redirect hops as well as on the final response, so on iOS the frame
 * can end up blank. Pointing straight at the destination skips the hop, drops
 * the header, and saves a round trip on a slow connection.
 *
 * The `pb` payload is Google's own — it is what the redirect above resolves to.
 */
export const MAP_EMBED_URL = `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${LL}!6i17`

/** Google's documented URL API — far more app-friendly than a copied share link. */
export const GOOGLE_MAPS_WEB_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LL)}`
export const WAZE_WEB_URL = `https://waze.com/ul?ll=${encodeURIComponent(LL)}&navigate=yes`

export type Platform = 'ios' | 'ios-webview' | 'android' | 'other'

export function detectPlatform(userAgent: string, maxTouchPoints = 0): Platform {
  if (/android/i.test(userAgent)) return 'android'

  const isIos =
    /iphone|ipad|ipod/i.test(userAgent) ||
    // iPadOS 13+ reports a desktop Macintosh user agent; touch points give it away.
    (/macintosh/i.test(userAgent) && maxTouchPoints > 1)
  if (!isIos) return 'other'

  // A real browser on iOS advertises Safari/ or its own token (CriOS, FxiOS,
  // EdgiOS). The bare WKWebView that WhatsApp and friends embed advertises
  // none of them — and that is exactly where Universal Links stop working.
  return /safari|crios|fxios|edgios/i.test(userAgent) ? 'ios' : 'ios-webview'
}

/**
 * Android intent URL. Chrome resolves this against the installed packages, so
 * it opens the app when present and follows `browser_fallback_url` when not —
 * and does nothing at all if the guest dismisses the chooser.
 */
function androidIntent(httpsUrl: string, androidPackage: string): string {
  return (
    `intent://${httpsUrl.replace(/^https:\/\//, '')}` +
    `#Intent;scheme=https;package=${androidPackage};` +
    `S.browser_fallback_url=${encodeURIComponent(httpsUrl)};end`
  )
}

export function wazeUrl(platform: Platform): string {
  if (platform === 'android') return androidIntent(WAZE_WEB_URL, 'com.waze')
  // Universal Links are dead inside a WebView, so address the app directly.
  if (platform === 'ios-webview') return `waze://?ll=${LL}&navigate=yes`
  // Safari/Chrome on iOS resolve this to the app silently, or to the website
  // if Waze is not installed. No prompt, no guesswork.
  return WAZE_WEB_URL
}

export function googleMapsUrl(platform: Platform): string {
  if (platform === 'android') {
    return androidIntent(GOOGLE_MAPS_WEB_URL, 'com.google.android.apps.maps')
  }
  if (platform === 'ios-webview') {
    return `comgooglemaps://?q=${LL}&center=${LL}&zoom=17`
  }
  return GOOGLE_MAPS_WEB_URL
}
