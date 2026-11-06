## Learned User Preferences

- Use the `skullet` library for all loading skeletons site-wide, including images (via its image support, works with any `<img>` / `next/image`), with the user's provider setup: `mode="system"`, reveal enter `filter: "blur(6px)"`, theme `animation: "group-shimmer"`, `speed: "slow"`, text `top: "ascender"`, `bottom: "descender"`; keep reveals slow.
- Prefers minimal UI chrome: no explicit close or pause-motion buttons when Escape / click-outside or drag already cover the interaction.
- Reuse the same project-page footer (with the large Italy-time clock) everywhere a footer appears, instead of building variants.
- Often references live sites (e.g. permanent.is, officecommun.com for project and home sections, aesso.com, pda.archi) as motion/layout targets and expects close recreations of their behavior.
- Keep the first-visit WELCOME site preloader on entry (ported from `github.com/soloamente/idsculpt2026`).
- Navbar shell uses pure black (`bg-black`), not grey page ink, when the bar is on a dark surface.
- Contact pills, chips, and similar controls should reuse navbar surface styling (rounding and background), not square outlined buttons.
- May write requests in Italian; respond in English unless asked otherwise.

## Learned Workspace Facts

- Bun + Turborepo monorepo (`apps/*`, `packages/*`); main app is `apps/web` on Next.js 16, React 19, Tailwind CSS v4, better-auth, Drizzle (`@idsculpt26/db`), varlock for env codegen, Biome for lint/format (`bun run check`).
- Run the web app with `bun dev` (turbo) or `bun run dev:web`.
- The design source of truth is the Figma file "IDSC---WEB" (file key `SIZpOwfCaMXIa709Xdh8NL`).
- Team member photos live at `apps/web/public/team/<name>/<name>.png`, with per-member work under `apps/web/public/team/<name>/projects`.
- Project case-study media lives under `apps/web/public/work/<slug>/`.
- Prior public site (`github.com/soloamente/idsculpt2026`) is the reference for porting welcome, footer, and related legacy UI.
- `apps/web/AGENTS.md` contains an auto-generated Next.js block written by `next dev`; do not edit it.
