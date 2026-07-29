# Background and Motivation

- User reported site performance issues: browser freezes and slow image loading.
- Prior: Biome format-on-save, responsiveness brainstorm (Lenis, in-view animations, mobile).

# Key Challenges and Analysis

- **Film grain overlay** loaded a 7.5MB PNG (`bg-noize.png`) on every page visit after preloader dismiss.
- **Three simultaneous rAF loops**: Lenis smooth scroll, hero shader cursor follow, footer DiaGradient scroll reveal.
- **WebGPU hero shader** runs continuously on all devices including mobile/coarse pointer.
- **Images**: many multi-MB PNGs served raw via `unoptimized`; homepage work cards used `loading="eager"` and 5000×5000 dimensions.
- Largest assets: `bg-noize.png` 7.5MB, `chili.png` 7.2MB, `sec3.png` 3.6MB (used twice on homepage).

# High-level Task Breakdown

- [x] Replace 7.5MB grain PNG with inline SVG turbulence overlay.
- [x] Disable Lenis on touch/coarse pointer; bridge native scroll for footer glow.
- [x] Remove DiaGradient dedicated rAF loop; paint on scroll events only.
- [x] Hero shader: dynamic import, desktop-only, pause when hero off-screen.
- [x] Enable next/image optimization in production (AVIF/WebP); lazy work grid images with `sizes`.
- [ ] User verifies: no freezes on mobile/Safari/Firefox; images load faster; grain + footer glow still look correct.

# Project Status Board

- [x] Performance pass: grain overlay, RAF reduction, image loading, hero shader guards (pending user verification).

# Current Status / Progress Tracking

- Executor replaced `bg-noize.png` with `FilmGrainOverlay` (SVG feTurbulence) in `site-preloader.tsx`.
- Executor disabled Lenis on touch/coarse pointer; native scroll bridges `app-scroll` when Lenis off (`providers.tsx`).
- Executor removed continuous rAF from `dia-gradient.tsx`; paints on scroll/resize/app-scroll.
- Executor: hero shader dynamically imported, desktop-only, unmounts when hero leaves viewport.
- Executor: homepage images use `fill` + `sizes`, production AVIF/WebP via `next.config.ts`; `unoptimized` only in dev for gallery/approach/about.
- Typecheck passed (`bunx tsc --noEmit` in `apps/web`).

# Executor's Feedback or Assistance Requests

- About page word stickers now use [sticker-forge](https://github.com/CatsJuice/sticker-forge) (WebGL peel physics) instead of the custom canvas engine. Embed bundle vendored at `apps/web/public/embed/sticker-forge.es.js` (~856KB).
- Please hard-refresh `/about` and peel a sticker edge (drag inward on the die-cut border). Desktop: all 14 words; mobile/coarse pointer: ~7 stickers, medium quality, sound off.
- Old `engine.ts` / `sticker-render.ts` removed; font definitions in `stickers.ts` unchanged.

# Lessons

- A tiled 7.5MB PNG overlay is worse for performance than an inline SVG noise filter.
- Multiple independent rAF loops (Lenis + shader + gradient) compound main-thread jank — consolidate or gate by viewport/device.
- `unoptimized` on next/image bypasses all resizing/compression; keep it dev-only when assets change often.
