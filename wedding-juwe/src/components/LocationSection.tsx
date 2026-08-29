import type { MouseEvent } from 'react'
import { SiGooglemaps, SiWaze } from 'react-icons/si'
import Divider from './Divider'
import FloatingAccents from './FloatingAccents'
import Reveal from './Reveal'
import SectionOrnament from './SectionOrnament'
import {
  GOOGLE_MAPS_WEB_URL,
  VENUE,
  WAZE_WEB_URL,
  detectPlatform,
  googleMapsAppUrl,
  openMapApp,
  wazeAppUrl,
  type Platform,
} from '../lib/maps'

const MAP_EMBED_SRC = `https://www.google.com/maps?q=${VENUE.lat},${VENUE.lng}&z=17&output=embed`

export default function LocationSection() {
  // The href stays a plain https link so long-press, copy and desktop still
  // work; the click handler is what gets the native app to open.
  const openIn = (
    appUrl: (platform: Platform) => string | null,
    webUrl: string,
  ) => (event: MouseEvent<HTMLAnchorElement>) => {
    const platform = detectPlatform(navigator.userAgent, navigator.maxTouchPoints)
    if (platform === 'other') return
    event.preventDefault()
    openMapApp(appUrl(platform), webUrl)
  }

  return (
    <section className="relative overflow-hidden bg-songket px-5 pb-16 pt-14 text-violet">
      <FloatingAccents />

      <div className="relative mx-auto max-w-md">
        <Reveal>
          <SectionOrnament className="w-52" />
          <h2 className="mt-5 text-center font-display text-4xl text-violet">
            Lokasi Majlis
          </h2>
          <Divider className="mt-4" />
        </Reveal>

        <Reveal delay={120}>
          <div
            className="mt-8 overflow-hidden rounded-3xl border border-gold/40 bg-ivory shadow-[0_18px_40px_-18px_rgba(30,35,82,0.35)]
              ring-1 ring-inset ring-gold/15"
          >
            <div className="aspect-[4/3] w-full">
              <iframe
                title="Lokasi Majlis"
                src={MAP_EMBED_SRC}
                loading="lazy"
                className="h-full w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-6 text-center">
              <p className="text-sm text-violet/80">Bertempat di kediaman kami:</p>
              <p className="mt-1 font-display text-lg text-violet">
                Lot-1700, Jalan Masjid Lundang,
                <br />
                15150, Kota Bharu, Kelantan.
              </p>

              <div className="mt-5 flex justify-center gap-8">
                <a
                  href={WAZE_WEB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={openIn(wazeAppUrl, WAZE_WEB_URL)}
                  className="flex w-28 flex-col items-center gap-2"
                >
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-ivory
                      shadow-[0_10px_20px_-8px_rgba(30,35,82,0.35)] ring-1 ring-inset ring-gold/15 transition
                      hover:bg-gold/10"
                  >
                    <SiWaze className="h-7 w-7 text-[#05C8F6]" />
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] text-violet/80">
                    Waze
                  </span>
                </a>
                <a
                  href={GOOGLE_MAPS_WEB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={openIn(googleMapsAppUrl, GOOGLE_MAPS_WEB_URL)}
                  className="flex w-28 flex-col items-center gap-2"
                >
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-ivory
                      shadow-[0_10px_20px_-8px_rgba(30,35,82,0.35)] ring-1 ring-inset ring-gold/15 transition
                      hover:bg-gold/10"
                  >
                    <SiGooglemaps className="h-7 w-7 text-[#4285F4]" />
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] text-violet/80">
                    Google Maps
                  </span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
