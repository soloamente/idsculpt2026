# Background and Motivation

- User reported site performance issues: browser freezes and slow image loading.
- Prior: Biome format-on-save, responsiveness brainstorm (Lenis, in-view animations, mobile).

# Key Challenges and Analysis

- **Film grain overlay** loaded a 7.5MB PNG (`bg-noize.png`) on every page visit after preloader dismiss.
- **Three simultaneous rAF loops**: Lenis smooth scroll, hero shader cursor follow, footer DiaGradient scroll reveal.
- **WebGPU hero shader** runs continuously on all devices including mobile/coarse pointer.
- **Images**: many multi-MB PNGs served raw via `unoptimized`; homepage work cards used `loading="eager"` and 5000×5000 dimensions.
- Largest assets: `bg-noize.png` 7.5MB, `chili.png` 7.2MB, `sec3.png` 3.6MB (used twice on homepage).

## Planner: Hero shader scroll-back lag (Oct 23)

**Request:** scrolling down past the hero and back up makes the hero shader lag before the user can reach the top; whole site feels slow.

**Evidence (measured in the Cursor browser on `localhost:3001`, 1440x900 viewport):**
- At DPR 1 (canvas 1425x900): scroll-away/back cycles are smooth (p95 8ms, worst frame ~33ms).
- At DPR 2 (canvas 2850x1800, ~5.1M px): worst frame on return is 54-171ms (4 cycles: 92 / 54 / 171 / 92ms), p95 up to 33ms. Long-animation-frame shows 0 script time, so it is GPU/render cost, not JS.
- `@basementstudio/shader-lab` `ShaderLabComposition` hard-codes `window.devicePixelRatio` and has no resolution cap. The gradient layer runs 4 warp iterations of ridge noise x2 + 5 points per pixel, so cost scales with pixels (4x on retina).
- The library rAF loop never stops, even when we hide the shader (`visibility:hidden`): each frame calls `getBoundingClientRect` + `setPixelRatio/setSize`.
- Forcing the canvas to stay visible gave worst frames of 46-58ms (vs 54-171ms), but the test was noisy; toggling `visibility` may add a re-composite spike.
- Not the culprits in this test: film grain (p95 8.4 -> 4.5ms when removed, minor) and `backdrop-blur` (no change).

**Root-cause hypothesis:** the shader renders at full retina resolution; resuming it after being hidden produces a large GPU frame that blocks scrolling.

# High-level Task Breakdown

## Hero shader perf plan (steps 1-3 DONE Oct 23, pending user verification; step 4 not started)
- Executor result: bun patch `patches/@basementstudio%2Fshader-lab@1.4.0.patch` (root `package.json` `patchedDependencies`) adds `maxPixelRatio`, `paused`, ResizeObserver-cached size. Hero uses `maxPixelRatio={1}` + `paused={!heroVisible}`; old `animate`/`visibility` toggling removed.
- Re-measure at DPR 2 (4 away/back cycles): canvas 1425x900 (was 2850x1800); worst frame 29-54ms (was 54-171ms); p95 8.3-12.5ms (was up to 33ms).
- Step 4 (site-wide profile, read-only, dev server, DPR 2, 1440x900, instant `scrollTo` steps of 450px over the 5499px page): every position had p95 4-8ms; worst frames were 42ms at y=4500 (footer glow first appears: SVG `feGaussianBlur` columns, scaleY reveal) and 21ms at y=900 (work grid entering). No long-animation-frame entries (no JS jank). Lenis wheel scrolling was NOT exercised.
- Step 4 candidates (not changed): (a) `sec3.png` 3.6MB 3740x1212 shown at ~454x454 and used in `design-approach-section.tsx` + `design-taste-bento-section.tsx`; `Frame 147/148.png` also served raw in the approach section in dev; other big PNGs in `public/images` (`chili.png` 7.2MB, `chili_2.png` 5.4MB, `tenryuu-posters.png` 4.1MB) and `bg-noize.png` 7.5MB is now unused; (b) 21 elements with filter/backdrop-filter, 13 with `will-change`; (c) film grain SVG overlay is a full-page `mix-blend-overlay` layer.
- **Follow-up root cause (user still saw lag):** the library calls three's `renderer.setSize` every frame, and `setSize` assigns `canvas.width/height` unconditionally, so the WebGPU drawing buffer was reallocated ~144x/second (measured 288 sets in 2s, 287 same-value). Patch now only calls `resize` when size or pixel ratio changes. After: 0 sets in 2s; 5 away/back cycles at DPR 2 all had worst frame 8.5ms, 0 frames > 16.7ms (before this fix: 29-54ms; originally 54-171ms).
- Pre-existing, unrelated `tsc` errors: `improved-identities-section.tsx` lines 350 and 423 (Link route type).
1. Patch `@basementstudio/shader-lab` (bun patch, committed in `patches/`): add `maxPixelRatio` prop (cap resolution), cache canvas size with `ResizeObserver` (no per-frame layout read), add `paused` prop that stops the rAF loop. Success: at DPR 2 the canvas is ~1x/1.25x CSS size and scroll-back worst frame < ~40ms.
2. Hero: pass `maxPixelRatio` (about 1) and `paused={!heroVisible}`; stop toggling `animate`/`visibility` hacks if the pause makes them redundant. Success: no visible banding on the gradient, cursor follow + Discover hover unchanged.
3. Re-measure with the same script (4 away/back cycles at DPR 2) and report numbers.
4. Site-wide pass: profile scroll through `/` (other sections, Lenis, footer glow) and list the next biggest costs before touching anything.


- [x] Replace 7.5MB grain PNG with inline SVG turbulence overlay.
- [x] Disable Lenis on touch/coarse pointer; bridge native scroll for footer glow.
- [x] Remove DiaGradient dedicated rAF loop; paint on scroll events only.
- [x] Hero shader: dynamic import, desktop-only, pause when hero off-screen.
- [x] Enable next/image optimization in production (AVIF/WebP); lazy work grid images with `sizes`.
- [ ] User verifies: no freezes on mobile/Safari/Firefox; images load faster; grain + footer glow still look correct.

# Project Status Board

- [x] Performance pass: grain overlay, RAF reduction, image loading, hero shader guards (pending user verification).
- [x] About team: Figma 526:103 type row + name-hover photo (pending user verification).

# Current Status / Progress Tracking

- Executor replaced `bg-noize.png` with `FilmGrainOverlay` (SVG feTurbulence) in `site-preloader.tsx`.
- Executor disabled Lenis on touch/coarse pointer; native scroll bridges `app-scroll` when Lenis off (`providers.tsx`).
- Executor removed continuous rAF from `dia-gradient.tsx`; paints on scroll/resize/app-scroll.
- Executor: hero shader dynamically imported, desktop-only, unmounts when hero leaves viewport.
- Executor: homepage images use `fill` + `sizes`, production AVIF/WebP via `next.config.ts`; `unoptimized` only in dev for gallery/approach/about.
- Typecheck passed (`bunx tsc --noEmit` in `apps/web`).

# Executor's Feedback or Assistance Requests

- About team (Figma 526:103): shader cards replaced by a centered type row. Neighbors scale down, blur, and fade. Arrows and dots step the focus. Hovering a name (mouse only) fades in that person's photo and springs it after the pointer. Quotes keep each member's real line, set in Playfair. Please check `/about` on a wide window: Adam centered should match the frame; hover “Adam Adamu” and move the pointer.

- Case studies: `/gallery/chili-riders`, `/gallery/oasis`, `/gallery/navia` — Figma section PNGs under `public/images/case-studies/`. Gallery cards for those three link through; Case studies tab now enabled. Please verify on `/gallery` → Case studies → open each project; check Return pill, intro chip, scroll fades, footer thumbs + Email us.
- About page word stickers now use [sticker-forge](https://github.com/CatsJuice/sticker-forge) (WebGL peel physics) instead of the custom canvas engine. Embed bundle vendored at `apps/web/public/embed/sticker-forge.es.js` (~856KB).
- Please hard-refresh `/about` and peel a sticker edge (drag inward on the die-cut border). Desktop: all 14 words; mobile/coarse pointer: ~7 stickers, medium quality, sound off.
- Old `engine.ts` / `sticker-render.ts` removed; font definitions in `stickers.ts` unchanged.
- **Sticker UX fixes (Jul 29):** (1) wrappers positioned before DOM mount + relayout after each init — no top-left pile-up on load; (2) 48px peel padding around each WebGL target so curl/shadow stay inside canvas; (3) about `main` uses `overflow-x-clip` instead of `overflow-x-hidden` so vertical peel FX are not clipped by the scroll container. User to verify peel no longer shows a rectangular crop and stickers appear in place on first paint.

# Lessons

- A tiled 7.5MB PNG overlay is worse for performance than an inline SVG noise filter.
- Multiple independent rAF loops (Lenis + shader + gradient) compound main-thread jank — consolidate or gate by viewport/device.
- `unoptimized` on next/image bypasses all resizing/compression; keep it dev-only when assets change often.
