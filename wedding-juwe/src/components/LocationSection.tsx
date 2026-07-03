import { SiGooglemaps, SiWaze } from 'react-icons/si'
import Divider from './Divider'
import FloatingAccents from './FloatingAccents'
import Reveal from './Reveal'
import SectionOrnament from './SectionOrnament'

const MAP_EMBED_SRC = 'https://www.google.com/maps?q=6.103472,102.256502&z=17&output=embed'
const WAZE_URL = 'https://waze.com/ul/hw30dwzhgx'
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/6°06'12.5%22N+102°15'23.4%22E/@6.103472,102.2539271,17z/data=!3m1!4b1!4m4!3m3!8m2!3d6.103472!4d102.256502!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D"

export default function LocationSection() {
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
                  href={WAZE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
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
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
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
