# Map Location Section — Design Spec

**Date:** 2026-07-03
**Status:** Approved

## Purpose

Add a section to the wedding site showing the event venue on a map, so guests
can navigate there directly via Waze or Google Maps.

## Venue

The venue has changed since the original spec (`2026-06-29-wedding-juwe-design.md`,
which listed "Masjid Sri Sendayan"). The current venue:

```
Bertempat di kediaman kami:
Lot-1700, Jalan Masjid Lundang, 15150, Kota Bharu, Kelantan.
```

Coordinates: `6.103472, 102.256502`

- Waze: https://waze.com/ul/hw30dwzhgx
- Google Maps: https://www.google.com/maps/place/6°06'12.5%22N+102°15'23.4%22E/@6.103472,102.2539271,17z

The original spec's venue line will be updated to reflect this change.

## Placement

Between `CountdownSection` and `WishesSection`:

```
Hero → CountdownSection → LocationSection → WishesSection → footer
```

## Component

`src/components/LocationSection.tsx` — new, presentational, no props, no state.

Mirrors the structure already established by `CountdownSection`:

1. `Reveal` > `SectionOrnament` + heading "Lokasi Majlis" + `Divider`
2. `Reveal` (staggered delay) > content card:
   - `rounded-3xl border border-gold/40 bg-ivory` card (same styling as the
     countdown card)
   - Embedded map: an `<iframe>` using Google's no-API-key embed URL
     (`https://www.google.com/maps?q=6.103472,102.256502&z=17&output=embed`),
     `loading="lazy"`, fixed aspect-ratio container so it doesn't jump the
     page layout while loading
   - Address text below the map, centered, styled consistent with body copy
     elsewhere on the site (`text-violet`/`text-plum` tones)
   - Two link-buttons side by side: "Buka di Waze" and "Buka di Google Maps",
     each `<a target="_blank" rel="noopener noreferrer" href="...">`, styled
     as small gold-bordered pill buttons

### Why this approach

- No API key, no new dependency, no backend involvement — matches the fully
  static nature of `Hero`/`CountdownSection`.
- Reusing the existing card/heading/divider pattern keeps the new section
  visually consistent with the rest of the page without inventing new
  conventions.

## Error Handling

None needed — this is static content with no user input and no network
calls beyond the iframe itself (which degrades gracefully; if it fails to
load, the address text and the two buttons are still usable).

## Testing

Component is purely presentational (no logic/state), so no unit tests are
planned beyond a visual check in the browser. Manually verify the two links
open the correct Waze/Google Maps URLs.

## Out of Scope (YAGNI)

- Interactive/zoomable custom map (Mapbox/Leaflet, etc.).
- Multiple venues / itinerary (akad nikah vs. reception).
- Directions/ETA calculation.
