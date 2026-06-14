# Envelope Intro — Design

**Date:** 2026-06-14
**Project:** Ahmed & Nada engagement invitation (static page: `index.html`, `styles.css`, `app.js`)

## Goal

Replace the current theater-curtain page intro with a sealed-envelope intro. On
load the visitor sees a sealed cream envelope; tapping the tape opens the flap,
the envelope flies away to reveal the invitation, and background music starts on
that same tap.

Reference: the common wedding-invite reel pattern (sealed envelope → tap/peel
tape → flap opens → envelope vanishes → content + music).

## Behavior

1. On load, a full-screen overlay (`#envelope-overlay`) covers the page: a dimmed
   warm backdrop with a centered cream envelope.
2. A small pulsing hint reads *"tap to open."*
3. A rose-tinted **tape strip** sits across the flap. Tapping the tape — or
   anywhere on the envelope — runs the open sequence:
   1. Tape peels off and drops/fades away.
   2. The flap swings open (3D `rotateX`).
   3. The envelope lifts, scales up slightly, and fades out.
   4. The overlay backdrop fades, revealing the invitation underneath.
4. **Music starts on this same tap.** The tap is a valid user gesture, so audio
   autoplay is permitted. Reuse the existing music `tryPlay()` path.
5. The existing `.curtain` intro is **removed entirely** — the envelope is the
   single intro mechanism.
6. **No persistence.** The envelope shows on every visit (consistent with the
   prior "remove local storage" commit). No localStorage / sessionStorage.

## Look

Reuse existing CSS tokens (`:root` in `styles.css`):

- Envelope body: cream/ivory from the `--bg` family, soft shadow
  (`box-shadow` consistent with existing card shadows).
- Backdrop: dim warm overlay (semi-transparent dark over the page).
- Front of envelope: "Ahmed & Nada" in serif italic (`--serif`), with a small
  SVG floral flourish in the existing palette (rose / sage / terracotta).
- Tape strip: `--rose` / `--rose-soft`, faint diagonal texture, slight rotation
  for a hand-placed feel.

No raster images required — built from divs + inline SVG.

## Implementation

### HTML (`index.html`)
- Remove the `.curtain` block (`#curtain` with `.curtain-half` children).
- Add an `#envelope-overlay` block before the hero, containing:
  - backdrop layer
  - envelope container (front face with names + flourish, the flap element,
    the tape strip element, the "tap to open" hint).
- Use appropriate ARIA: overlay is a button-like tappable region with an
  accessible label (e.g. "Open the invitation").

### CSS (`styles.css`)
- Remove `.curtain*` rules.
- Add envelope / flap / tape / backdrop styles and keyframed animations:
  - tape peel-and-drop
  - flap `rotateX` open
  - envelope lift + scale + fade
  - backdrop fade
- Stagger via `animation-delay` or sequential classes added in JS.
- `@media (prefers-reduced-motion: reduce)`: hide overlay immediately, show the
  page, skip animations. Replace the existing curtain reduced-motion rule.

### JS (`app.js`)
- Replace the `curtain()` IIFE (section 3) with an `envelope()` IIFE.
- On tap of the overlay/envelope:
  - add the `open` class(es) to drive the CSS animation sequence,
  - on animation end (or a matching timeout) add `hidden` to remove the overlay
    from the layer / set `display:none`,
  - trigger music start through the existing music module's play path so it
    begins on this gesture.
- Keep the music toggle button for pause/resume (section 8) unchanged in intent;
  ensure the envelope tap and the toggle cooperate (no double-handling).
- Reduced motion: if `prefers-reduced-motion: reduce`, hide the overlay
  immediately (as the curtain code does today); music still starts on first
  gesture via the existing listeners.

## Out of scope

- No changes to countdown, details, map, hashtag, or photo-gate sections.
- No letter-slides-out variant (rejected during brainstorming).
- No envelope addressing beyond the names + flourish.
