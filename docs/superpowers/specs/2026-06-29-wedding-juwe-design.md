# Wedding Juwe — Design Spec

**Date:** 2026-06-29
**Status:** Approved (pending spec review)

## Purpose

A single-page Malay wedding website for **Najwan Shah & Aisyah**. It displays the
couple's names and event details, and lets guests submit a wish (name + message)
that is then displayed publicly so other guests can read everyone's wishes.

## Event Details

- **Groom:** Najwan Shah
- **Bride:** Aisyah
- **Date:** 8 August 2026 (8/8/2026)
- **Venue:** Masjid Sri Sendayan

## Visual Style

Elegant & traditional, songket-inspired: gold accents with maroon / deep green,
ornate framing, classic serif headings. Uses the existing `hero.png`.

## Architecture

Monorepo-style, single repository:

- **Frontend:** existing React 19 + Vite + TypeScript app (in `wedding-juwe/`),
  styled with **Tailwind CSS** (to be added).
- **Backend:** small **Express + Mongoose** server in a `server/` folder.
  Connects to MongoDB via `MONGODB_URI` from a gitignored `.env` file.
- **Database:** MongoDB Atlas cluster. One collection: `wishes`.

Frontend and backend run together in development. The frontend talks to the
backend through a typed API client only (no raw `fetch` in components).

### Why this approach

Co-locating a small Express backend (vs. serverless functions or a separate
Express project) is the simplest to run, keeps the whole wedding site in one
place, and makes plugging in the Mongo connection string trivial — just paste
it into `.env`.

## Data Model

`wishes` collection, one document per wish:

```
{
  name: string,        // required, non-empty
  message: string,     // required, non-empty
  createdAt: Date       // set on creation
}
```

## API (Express)

- `GET /api/wishes` → `200` with all wishes, newest first (`createdAt` desc).
- `POST /api/wishes` → body `{ name, message }`.
  - Validates both fields are present and non-empty (trimmed).
  - `400` with JSON error on invalid input.
  - `201` with the created wish on success.
- `500` with JSON error on database failures.

## Frontend

Single elegant page, songket gold + maroon/deep green:

1. **Hero section** — "Najwan Shah & Aisyah", date (8 August 2026), venue
   (Masjid Sri Sendayan), ornate decorative framing, using `hero.png`.
2. **Wishes section**
   - A form: **Name** + **Message** fields → submit.
   - On submit: posts via the API client, shows a thank-you state, refreshes
     the list.
   - Below the form: a list of all submitted wishes (newest first) so guests
     can read each other's wishes.

### Components / units

- `src/api/wishes.ts` — typed API client: `getWishes()`, `createWish(input)`.
  The only place the frontend talks to the network.
- `src/components/Hero.tsx` — couple names + event details, presentational.
- `src/components/WishForm.tsx` — controlled form, calls `createWish`, emits an
  event/callback on success.
- `src/components/WishList.tsx` — renders an array of wishes.
- `src/components/WishesSection.tsx` — owns the wishes state, composes form +
  list, handles loading/refresh.
- `src/App.tsx` — composes Hero + WishesSection.

## Error Handling

- Backend: invalid input → `400`; DB errors → `500`; all errors as JSON.
- Frontend: API client surfaces errors; the form shows a friendly error message
  on failure and does not lose the user's input. The list shows a loading and an
  empty state.

## Testing

- **Backend:** tests for `POST /api/wishes` validation (rejects empty
  name/message) and the happy path; `GET /api/wishes` returns saved wishes.
- **Frontend:** test for the `wishes` API client (request shape / response
  parsing) and `WishForm` submit behavior (calls `createWish`, shows thank-you).

## Configuration

- `.env` (gitignored) holds `MONGODB_URI` and `PORT`.
- `.env.example` documents the required variables without secrets.
- Vite dev server proxies `/api` to the Express server.

## Out of Scope (YAGNI)

- RSVP / attendance / guest count.
- Authentication or moderation of wishes.
- Editing or deleting wishes.
- Multi-page routing.
