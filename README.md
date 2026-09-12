# brainzscrobble

A manual scrobbler for [ListenBrainz](https://listenbrainz.org), inspired by Open Scrobbler.
A **100% client-side SPA**: your token and history live only in your browser, and scrobbles go
straight to the public ListenBrainz API.

## Stack

- [Svelte 5](https://svelte.dev) + [Vite](https://vite.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (Vite plugin)
- Social images generated with [sharp](https://sharp.pixelplumbing.com)

## Commands

```bash
npm install          # install dependencies
npm run dev          # development server
npm run check        # typecheck (svelte-check + tsc)
npm run build        # production build → dist/
npm run preview      # serve dist/ locally
npm run gen:images   # regenerate public/og.png and apple-touch-icon.png
```

## Languages

Dictionaries live in `src/i18n/*.ts` and are auto-discovered (one file per language).
To add a language, just create `src/i18n/<xx>.ts`:

```ts
import type { Translations } from './es';
const xx: Translations = {
  // every key from es.ts translated (the type requires all keys)
};
export default xx;
```

The `Translations` type guarantees at compile time that no keys are missing or extra.

## Usage

1. **Connect**: press **Connect with ListenBrainz**, open your ListenBrainz settings
   (`https://listenbrainz.org/settings`), copy your User Token and paste it (you can copy it in
   advance: the app auto-fills it from the clipboard). The app validates it and shows
   "Connected as `<user>`" in the header. To disconnect, click your username in the header and
   choose **Sign out**.
   *(ListenBrainz has no OAuth for third parties; apps like WebScrobbler all use the User Token,
   which is stored only locally on this device.)*
2. Fill in Artist / Track / Album (optional) and pick when it was listened (presets or a custom date/time).
3. **Scrobble now** sends instantly (`listen_type: single`).
4. In the **List** tab, paste several tracks (one per line, `Artist - Track`) and press **Send all**:
   they enter the queue and are sent together (`listen_type: import`, chunks of 100).
5. Pasting `Artist - Track` into the form fields auto-splits them (like OpenScrobbler). If pasted
   the other way round, the central arrows button swaps artist and track without re-copying.
6. The header gear icon (or your username, when signed in) opens **Settings**: language
   (Español / English), link to your ListenBrainz profile, time format (12 h / 24 h), date format
   (MM/DD/YYYY, DD/MM/YYYY or YYYY-MM-DD), auto-split on paste (only affects single fields, not the
   List tab) and light/dark theme. Everything is stored in `localStorage`.
7. When signed in, clicking your **username** in the header opens a menu with **View profile**,
   **Settings** and **Sign out** (with icons).

Notes:

- Timestamps are sent as UNIX epoch (start of playback).
- Submissions go through a queue with states (queued / error) with individual or batch retry.
- The recent history (up to 50) is stored in `localStorage`.

## SEO and domains

- `index.html` includes meta `description`, Open Graph, Twitter Card, `canonical`, `robots` and
  JSON-LD `WebApplication`; `lang`, `title`, `description` and `og:locale` are updated on language
  change.
- **Important**: until you set the real domain, use `https://brainzscrobble.vercel.app/` as a
  placeholder in `index.html` (canonical, `og:url`, `og:image`, `twitter:image` and JSON-LD).
  Change it to your final domain before shipping.

## Security

- `vercel.json` adds security headers on all routes: Content-Security-Policy (only `self` +
  `https://api.listenbrainz.org`), `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy` and
  `Permissions-Policy`.
- The token lives only in `localStorage` (the real vector is XSS; CSP mitigates it and the code
  never uses `innerHTML`/`{@html}`/`eval`).

## Deploy

Static site, output lands in `dist/`:

```bash
npx vercel          # automatic build and deploy
npx vercel --prod   # production
```