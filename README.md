# SmartMeme AI — Foundation (Phase 1)

## Setup
```bash
npm install
npm run dev
```
No `app/page.tsx` exists yet by design — the root route will 404 until Phase 2 (Landing Page). This phase is tokens + primitives only.

## Decisions worth flagging (Rule 5)
- **Tailwind v3, not v4.** Next.js 15 currently scaffolds v4 by default, but v3's config-file model gives us a single, explicit place (`tailwind.config.ts`) to wire CSS-variable design tokens — clearer for a multi-phase project than v4's CSS-first config. Easy to revisit later if you'd prefer v4.
- **`next-themes` with `enableSystem: false`.** Ensures dark is always the true default on first visit, matching "dark mode first" exactly, rather than deferring to the visitor's OS setting.
- **Global reduced-motion via `<MotionConfig reducedMotion="user">`** in `motion-provider.tsx`, plus a CSS-level fallback in `globals.css`. Components never need to check `prefers-reduced-motion` themselves — it's handled once, centrally.
- **Stricter TypeScript** (`noUncheckedIndexedAccess`, `noImplicitOverride`) beyond Next's default template, since this project is meant to reach production.

## Structure
```
app/
  layout.tsx        Root layout: fonts, ThemeProvider, MotionProvider
  globals.css        Design tokens (dark-first), base styles, reduced-motion
components/
  theme-provider.tsx
  theme-toggle.tsx
  motion-provider.tsx
  ui/
    button.tsx
    card.tsx
    badge.tsx
    input.tsx
    glass-panel.tsx
lib/
  utils.ts           cn() class-merge helper
  motion.ts           Shared easing/spring tokens + Framer Motion variants
```
