# Wish "Baca Lagi" Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tapping "Baca Lagi" on a wish card opens that wish's full message in a modal overlay, and the carousel's auto-advance stays paused until the modal closes.

**Architecture:** All changes live in `src/components/WishList.tsx`. A new local `WishModal` component portals into `document.body` so the carousel's `overflow-x-auto` track cannot clip it. `WishList` owns the `openWish` state; `WishMessage` becomes a dumb component that reports clicks upward. Pausing reuses the existing `pausedRef` / `pause()` / `scheduleResume()` machinery via an effect keyed on `openWish` — no new timer logic.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite, react-icons.

## Global Constraints

- **No test framework exists in this repo.** There is no vitest/jest and no `*.test.*` files. Do NOT add one. Verification is `npm run build` (which runs `tsc -b`), `npm run lint` (oxlint), and manual browser checks — matching the "Verification" sections of existing specs in `docs/superpowers/specs/`.
- All commands run from `wedding-juwe/` (the inner directory containing `package.json`), not the repo root.
- **Malay UI copy.** The button label is exactly `Baca Lagi`. The modal's accessible label is exactly `Ucapan daripada ${wish.name}`.
- **Z-index:** the modal uses `z-[55]` — above `MusicPlayer` (`z-50`), below `EntryGate` (`z-[60]`).
- Existing card styling tokens must be reused verbatim: `border-gold/30`, `bg-ivory`, `text-violet`, `bg-cream-deep`, `font-display`.
- React Compiler (`babel-plugin-react-compiler`) is enabled — do not hand-add `useMemo`/`memo`.

---

### Task 1: Modal component, wiring, and carousel pause

This is a single task: the modal is not reachable without the wiring, and the pause is not observable without the modal. There is no intermediate state worth a separate reviewer gate.

**Files:**
- Modify: `wedding-juwe/src/components/WishList.tsx`
- Test: none (see Global Constraints)

**Interfaces:**
- Consumes: `Wish` from `../api/wishes` (fields used: `_id`, `name`, `message`, `createdAt`, `avatarSeed`), `avatarUrl` from `../lib/avatar`, and the existing file-local `formatWishDate(createdAt: string): string`.
- Produces: nothing consumed outside this file.

- [ ] **Step 1: Update imports**

At the top of `wedding-juwe/src/components/WishList.tsx`, add `useCallback` to the React import and add the `createPortal` import.

```tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiClock, FiRotateCcw } from 'react-icons/fi'
import type { Wish } from '../api/wishes'
import { avatarUrl } from '../lib/avatar'
```

- [ ] **Step 2: Add `openWish` state and its close callback**

In `WishList`, immediately after the existing `const [active, setActive] = useState(0)` line, add:

```tsx
  const [openWish, setOpenWish] = useState<Wish | null>(null)
```

Then, immediately after the existing `scheduleResume()` function definition (after its closing brace, before the `if (wishes.length === 0)` early return), add:

```tsx
  // Stable identity so WishModal's effect doesn't re-run on every parent render.
  const closeModal = useCallback(() => setOpenWish(null), [])
```

- [ ] **Step 3: Pause auto-advance while the modal is open**

Add this effect directly after the existing auto-advance `useEffect` (the one ending in `}, [active, wishes.length])`).

It MUST be placed above the `if (wishes.length === 0)` early return — React hooks cannot run conditionally, and that return sits below the other effects in this file.

`pause()` sets `pausedRef.current = true` and clears any pending resume timer, so the 5s interval keeps ticking but skips every advance for as long as the modal is open. The cleanup runs when `openWish` goes back to `null`.

```tsx
  // Hold the carousel still while a guest reads a wish in the modal, then
  // fall back to the normal idle countdown once they close it.
  useEffect(() => {
    if (!openWish) return
    pause()
    return () => scheduleResume()
  }, [openWish])
```

- [ ] **Step 4: Pass the clicked wish up from the card**

In the `wishes.map(...)` body, replace this line:

```tsx
            <WishMessage message={wish.message} />
```

with:

```tsx
            <WishMessage message={wish.message} onReadMore={() => setOpenWish(wish)} />
```

- [ ] **Step 5: Render the modal**

Inside `WishList`'s returned JSX, add this as the last child of the outer `<div>` — after the closing `)}` of the pagination-dots block, immediately before the final `</div>`:

```tsx
      {openWish && <WishModal wish={openWish} onClose={closeModal} />}
```

- [ ] **Step 6: Strip inline expansion from `WishMessage`**

Replace the entire existing `WishMessage` component (its doc comment and body) with the version below. The `expanded` state and the "Lebih Sikit" label are gone; the paragraph is permanently clamped; `isOverflowing` still gates whether the button appears at all.

```tsx
/**
 * Clamps a wish message to 4 lines and reveals a "Baca Lagi" button only when
 * the text actually overflows the clamp — so short messages never show a
 * pointless button. Reading the rest happens in WishModal, not in the card,
 * which keeps every card the same height inside the carousel.
 */
function WishMessage({ message, onReadMore }: { message: string; onReadMore: () => void }) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    setIsOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [message])

  return (
    <>
      <p ref={textRef} className="mt-3 leading-relaxed text-violet/85 line-clamp-4">
        {message}
      </p>
      {isOverflowing && (
        <button
          type="button"
          onClick={onReadMore}
          className="mt-1.5 text-sm font-medium text-gold underline-offset-2 hover:underline"
        >
          Baca Lagi
        </button>
      )}
    </>
  )
}
```

- [ ] **Step 7: Add the `WishModal` component**

Append this to the end of `wedding-juwe/src/components/WishList.tsx`, after `WishMessage`.

Two details that are easy to get wrong:
1. The backdrop's `onClick` checks `e.target === e.currentTarget`. Without it, scrolling or clicking the message text bubbles up to the backdrop and closes the modal mid-read.
2. Body scroll is restored to its **previous** value on unmount, not hard-coded to `''`, so this composes with any other component that locks scrolling.

```tsx
/**
 * Shows one wish's full, unclamped message over a dimmed backdrop. Portalled to
 * document.body so the carousel's `overflow-x-auto` track can't clip it. Closes
 * on backdrop tap; Escape is a silent fallback so keyboard users aren't trapped.
 */
function WishModal({ wish, onClose }: { wish: Wish; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <div
      // Only a tap on the backdrop itself closes — a tap that started on the
      // card (e.g. scrolling a long message) bubbles up here and must not.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="animate-fade fixed inset-0 z-[55] flex items-center justify-center bg-violet/40 p-6 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ucapan daripada ${wish.name}`}
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gold/30 bg-ivory p-6
          shadow-[0_20px_50px_-20px_rgba(30,35,82,0.6)]"
      >
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl(wish.avatarSeed || wish.name)}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full border border-gold/50 bg-cream-deep"
          />
          <div>
            <p className="font-display text-xl text-violet">{wish.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[0.7rem] text-violet/70">
              <FiClock className="h-3 w-3 text-gold" aria-hidden="true" />
              {formatWishDate(wish.createdAt)}
            </p>
          </div>
        </div>
        <p className="mt-4 leading-relaxed text-violet/85">{wish.message}</p>
      </div>
    </div>,
    document.body,
  )
}
```

- [ ] **Step 8: Confirm the `animate-fade` utility exists**

Step 7 uses `animate-fade` on the backdrop. Check whether it is defined:

Run: `grep -rn "animate-fade\|--animate-fade" wedding-juwe/src/index.css`

Expected: a match. **If there is no match**, remove the `animate-fade` class from the backdrop's `className` in Step 7 and move on — the modal does not depend on it. Do not invent a new keyframe.

- [ ] **Step 9: Typecheck and build**

Run: `cd wedding-juwe && npm run build`
Expected: PASS — `tsc -b` reports no errors and Vite writes `dist/`.

A failure naming `expanded` or `WishMessage` props means Step 4 or Step 6 was applied only partially.

- [ ] **Step 10: Lint**

Run: `cd wedding-juwe && npm run lint`
Expected: PASS — oxlint reports 0 errors.

- [ ] **Step 11: Verify in the browser**

Run: `cd wedding-juwe && npm run dev`, then open the printed localhost URL and scroll to the wishes carousel.

Check each of these:
1. A wish long enough to clamp shows "Baca Lagi"; a short one shows no button.
2. Tapping "Baca Lagi" opens the modal showing **that card's** name, avatar, timestamp, and full message — not a neighbour's.
3. While the modal is open, wait 10+ seconds: the carousel behind it does **not** advance.
4. Tapping the dimmed backdrop closes it. Pressing Escape closes it.
5. Open a wish long enough to scroll inside the modal, drag/scroll the message text: it scrolls and does **not** close. (Guards the `e.target === e.currentTarget` check.)
6. After closing, the carousel resumes auto-advancing about 5 seconds later.
7. The page behind the backdrop does not scroll while the modal is open, and page scrolling works again after closing.

- [ ] **Step 12: Commit**

The repo is on `master`. Branch first, then commit.

```bash
cd wedding-juwe
git checkout -b wish-read-more-modal
git add src/components/WishList.tsx docs/superpowers/specs/2026-07-10-wish-read-more-modal-design.md docs/superpowers/plans/2026-07-10-wish-read-more-modal.md
git commit -m "feat: open full wish in a modal from Baca Lagi, pausing the carousel"
```

Note: the two docs paths are relative to the repo root, so run `git add` from the repo root if `cd wedding-juwe` puts them out of reach.

---

## Self-Review

**Spec coverage:**
- Replaces inline expand, permanent clamp, no "Lebih Sikit" → Step 6.
- Backdrop tap + Escape, no X button → Step 7.
- Only the clicked card's wish → Steps 4 and 5 (`setOpenWish(wish)` passes the card's own object).
- Short wishes show no button → Step 6 (`isOverflowing` gate).
- `createPortal` into `document.body` → Step 7.
- `max-h-[80vh]` + internal scroll → Step 7.
- `role="dialog"` / `aria-modal` / name label → Step 7.
- Body scroll lock, restored on unmount → Step 7.
- Reuses `pausedRef` / `pause()` / `scheduleResume()`, effect keyed on `openWish` → Step 3.
- `e.target === e.currentTarget` backdrop guard → Step 7, verified in Step 11 check 5.
- Escape listener added on mount, removed on unmount → Step 7.
- No `document` guard needed (client-only Vite app) → no task; correct.
- Verification via build + browser → Steps 9–11.

**Placeholder scan:** No TBDs. Every code step shows complete code. Step 8's conditional branch names the exact fallback action.

**Type consistency:** `WishMessage` is declared with `{ message: string; onReadMore: () => void }` in Step 6 and called with exactly `message` and `onReadMore` in Step 4. `WishModal` is declared with `{ wish: Wish; onClose: () => void }` in Step 7 and called with exactly `wish` and `onClose` in Step 5. `closeModal` is defined in Step 2 and consumed in Step 5.

**Deviation from the skill's TDD default:** this repo has no test runner, so the red/green/refactor cycle is replaced by typecheck + lint + a scripted browser checklist. Adding vitest would be scope the user did not ask for.
