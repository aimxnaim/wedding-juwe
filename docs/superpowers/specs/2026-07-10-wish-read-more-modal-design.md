# "Baca Lagi" Opens a Wish in a Modal

Date: 2026-07-10

## Goal

Tapping **Baca Lagi** on a wish card opens that wish's full message in a modal
overlay, instead of expanding the text inside the card. The carousel's
auto-advance pauses for as long as the modal is open, so a guest reading a long
wish never has the card slide away from under them.

## Decisions (confirmed with user)

- **Replaces inline expand.** Card text stays clamped to 4 lines permanently.
  The `expanded` state and the "Lebih Sikit" label are removed; the modal's
  dismissal is the only way back.
- **Dismissal:** tap the backdrop (primary, visible) **or** press Escape
  (silent fallback so keyboard users are not trapped). No X button.
- **Scope:** the modal shows only the wish belonging to the card whose button
  was tapped.
- **Unchanged:** wishes short enough not to overflow show no button, and so
  open no modal.

## Frontend structure

All changes are contained in `src/components/WishList.tsx`.

- **`WishModal`** (new, local to the file): renders through `createPortal` into
  `document.body`, so the carousel's `overflow-x-auto` track cannot clip it.
  - Props: `wish: Wish`, `onClose: () => void`.
  - Content: avatar, name, `formatWishDate(wish.createdAt)`, and the full
    unclamped message.
  - Card capped at `max-h-[80vh]` with internal vertical scroll, so a very long
    wish stays on screen.
  - Markup: `role="dialog"`, `aria-modal="true"`, labelled by the guest's name.
  - Locks `document.body` scroll while mounted; restores the previous value on
    unmount, so the page does not drift behind the backdrop on mobile.
- **`WishMessage`**: drops `expanded` state; keeps the `isOverflowing`
  measurement. Gains an `onReadMore: () => void` prop, called by the button.
  Button label is always "Baca Lagi".
- **`WishList`**: holds `const [openWish, setOpenWish] = useState<Wish | null>(null)`.
  Each card passes its own `wish` up via `onReadMore`. Renders
  `{openWish && <WishModal wish={openWish} onClose={() => setOpenWish(null)} />}`.
  - State lives here (not in the card) because the modal portals out of the card
    and the pause is a carousel-level concern.

## Pausing the carousel

Reuses the existing `pausedRef` / `pause()` / `scheduleResume()` machinery — no
new timer logic.

- An effect keyed on `openWish` calls `pause()` when a wish opens. `pause()`
  sets the flag and clears any pending resume timer, so the 5s interval keeps
  ticking but skips every advance for as long as the modal is open.
- On close, `scheduleResume()` restarts the normal idle countdown.

## Error handling / edge cases

- **Backdrop click must check `e.target === e.currentTarget`.** Otherwise
  scrolling the message text inside the card bubbles up and closes the modal
  mid-read. This is the main correctness risk in the change.
- Escape listener is registered on mount and removed on unmount, so it cannot
  fire after close or stack across openings.
- `createPortal` requires `document`; the app is client-rendered (Vite, no SSR),
  so no guard is needed.

## Verification

- `npm run build` passes; typecheck clean.
- Browser: tap "Baca Lagi" on a long wish → modal shows that wish only; the
  carousel does not advance while it is open; tapping the backdrop and pressing
  Escape both close it; auto-advance resumes ~5s after closing.
- Scroll a long message inside the modal and confirm it does not close.
- Short wishes still render no button.

## Non-goals

- No swipe-to-dismiss gesture.
- No navigating between wishes from inside the modal.
- No focus trap beyond the Escape exit.
- No change to the wish data model or API.
