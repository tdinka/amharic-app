# Security audit and Next.js 15 upgrade plan

_Written 4 October 2026, from `npm audit` on Next.js 14.2.35._

> **Done (4 October 2026):** upgraded to Next.js 15.5.27 and React 19.3. `npm audit --omit=dev` now shows no Next.js advisories. The one remaining live-site warning is the PostCSS 8.4.31 that Next.js bundles (moderate/high). It only processes our own CSS at build time, so it can't be used against the site. Next.js 16.3.8 bundles a fixed PostCSS; until we move there, it can be silenced with an npm `overrides` entry if wanted.

## Summary

- `npm audit` reports 10 problems (1 critical, 9 high). **8 of them are in tools that only run on the developer's computer** (ESLint, Tailwind's file watcher). They never reach the live site.
- The 2 that ship with the app are **Next.js itself** and the copy of **PostCSS** bundled inside it.
- **14.2.35 is the newest Next.js 14 release. There is no small patch.** Every Next.js fix is only in 15.5.x (the critical ones need 15.5.24 or later).
- For now, `next.config.mjs` sets `images: { unoptimized: true }`. The app never uses `next/image`, so nothing changes on screen, but the `/_next/image` endpoint now returns 404. That closes the two critical advisories and the image-related ones.
- The app is not on the internet yet (Railway hosting comes later). **Do the Next.js 15 upgrade before the first public deploy.**

## Which advisories affect this app

| Package | Where it runs | Affects us? | Why |
|---|---|---|---|
| `next`: Remote Code Execution via image optimizer (AVIF), image optimizer DoS, image disk cache growth, `remotePatterns` DoS | Live site | **Closed by this change** | Endpoint is switched off (`images.unoptimized`). |
| `next`: Remote Code Execution on Windows-hosted servers | Live site | No | Railway runs Linux. |
| `next`: Denial of Service with Server Components (several), RSC cache poisoning | Live site | **Yes, once deployed** | The app uses the App Router, so these apply. An attacker could slow down or crash the server; no data at risk (progress lives in the learner's browser). Fix needs Next 15.5. |
| `next`: Server Actions DoS / SSRF / payload size, Server Function endpoint disclosure | Live site | No | The app has no Server Actions (`"use server"`). |
| `next`: rewrites smuggling / SSRF, middleware redirects, i18n middleware bypass, WebSocket SSRF | Live site | No | No rewrites, redirects, middleware, i18n or WebSockets. |
| `next`: XSS with CSP nonces / `beforeInteractive` scripts | Live site | No | Neither is used. |
| `next`: cache confusion for requests with bodies | Live site | Low | Only the two studio routes accept POST, and they refuse to work outside `npm run dev`. |
| `postcss` 8.4.31 (inside `next`) | Build time | No | Only processes our own CSS. The top-level `postcss` is already 8.5.28 (fixed). |
| `glob` 10.3.10 (ESLint plugin) | Developer computer | No | The bug is in glob's command-line tool, which we never run. |
| `braces` / `micromatch` / `chokidar` / `fast-glob` (Tailwind 3) | Developer computer | No | Only triggered by hostile file patterns; ours are in `tailwind.config.ts`. `npm audit` lists every version of `braces`, so only Tailwind 4 makes the warning go away — not worth a rewrite of the styling. |

## The upgrade plan (Next.js 14.2 → 15.5)

Do this on its own branch, in one sitting, before deploying.

1. **Back up `.env` / `.env.local`.**
2. **Update packages** — `next@15.5` (newest 15.5.x, at least 15.5.24), `eslint-config-next@15.5`, `react@19`, `react-dom@19`, `@types/react@19`, `@types/react-dom@19`. Next 15's App Router needs React 19.
   Next.js offers a helper that does most of this: `npx @next/codemod@canary upgrade latest` — but it would jump to 16, so update by hand to 15.5 instead.
3. **Code changes** — small, because the app is mostly client-side:
   - `app/lesson/[id]/page.tsx`: in Next 15, `params` arrives as a Promise. Make `generateMetadata` and `LessonPage` `async` and use `const { id } = await params`. The codemod `npx @next/codemod@latest next-async-request-api .` does this.
   - No other page reads `params`, `searchParams`, `cookies()` or `headers()`.
   - Check the studio API routes still save (they use `req.nextUrl` and `req.arrayBuffer()`, unchanged in 15).
4. **Keep `images: { unoptimized: true }`** unless we start using `next/image`.
5. **ESLint**: `next lint` still works in 15.5 but prints a "deprecated" notice. Leave ESLint 8 and `.eslintrc.json` as they are for now; moving to ESLint 9 is separate.
6. **Check everything**: `npx tsc --noEmit`, `npm run lint`, `npm run build`, then click through home, `/lesson/w1-l1`, `/review`, `/fidel`, `/progress`, and record and save one clip in `/studio` with `npm run dev`.
7. **Re-run `npm audit --omit=dev`**. No Next.js advisories should remain; only the build-time PostCSS one bundled inside Next.js (see the note at the top).

## Risks

- **React 19** is the main risk. Our own components are plain React, and `ts-fsrs` and `@breezystack/lamejs` don't use React, so the risk is low. Watch for type errors in `useRef` (React 19 requires an initial value, e.g. `useRef<HTMLAudioElement>(null)`).
- **Caching defaults changed in 15**: GET route handlers and client navigation are no longer cached by default. Our pages are built from local JSON files, so this shouldn't matter.
- **The known Next 14.2 trap** (`useSearchParams` + `Suspense` + `force-dynamic` stack overflow) doesn't apply — the app doesn't use `useSearchParams`. Keep reading `window.location.search` if needed later.
- **Why not Next 16?** It is a larger jump (more removals and new defaults). 15.5 is still getting security fixes and is the smallest step that clears every advisory.
