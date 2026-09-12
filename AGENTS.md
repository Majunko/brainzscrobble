# AGENTS.md

## Project

**brainzscrobble** — a manual scrobbler for ListenBrainz (Open Scrobbler style). A fully client-side
SPA that sends listens to the public ListenBrainz API. No backend.

## Stack

- **Svelte 5** (`$state`/`$derived`/`$effect`/`$props` runes) + **TypeScript**
- **Vite** (static build to `dist/`)
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin; no `tailwind.config` — uses `@theme` and `@layer` in `src/app.css`)
- Deploy: **Vercel** (static, `dist/`, with CSP headers in `vercel.json`)

## Commands

```bash
npm run dev         # dev server (HMR)
npm run build       # static build to dist/
npm run preview     # preview the build
npm run check       # lint/types: svelte-check + tsc (mandatory before finishing a task)
npm run gen:images  # regenerate og.png (1200x630) and apple-touch-icon.png (180x180) with sharp
```

Always run `npm run check` (and `npm run build` if output changes) after modifying code.

## Structure

- `src/App.svelte` — layout, header (brand, user menu with View profile/Settings/Sign out, gear for settings when signed out, user chip), login gate, fluid grid (`form | queue | history`), `$effect` for SEO/language and theme.
- `src/components/` — `LoginGate` (connection), `ScrobbleForm` (single + List tab), `SettingsModal` (settings), `ScrobbleQueue`, `History`, `ListenRow` (shared row).
- `src/lib/`
  - `store.svelte.ts` — global `$state` + `localStorage` (auth, queue, history); `connect/logout/enqueue/submitSingle/submitBatch/markError`.
  - `listenbrainz.ts` — LB API client (`submit-listens`, `validate-token`, 100-track chunks).
  - `i18n.svelte.ts` — auto-discovery of `src/i18n/*.ts` via `import.meta.glob`; `t()`, `setLocale()`, `availableLocales()`; persisted under `brainzscrobble.locale`.
  - `time.ts` — presets, `nowEpoch`, `formatTime` (respects time/date settings), `relativeTime` (localized).
  - `parse.ts` — Open Scrobbler-style parser (`parsePasted`/`parseList`).
  - `settings.svelte.ts` — user settings (`timeFormat` 12/24, `dateFormat`, `autoSplit`, `theme`) persisted in `localStorage` (`brainzscrobble.settings`); applies the `light` class to `<html>` on import.
- `src/i18n/es.ts` + `src/i18n/en.ts` — dictionaries. `es` is the reference; `type Translations = Record<keyof typeof es, string>` enforces at compile time that every language has exactly the same keys.
- `index.html` — SEO/OG/Twitter/JSON-LD metas; inline script that picks the saved locale (or
  `navigator.language`) and sets `<html lang>`/`title`/`description` pre-render; hreflang es/en/x-default;
  **unreplaced domain placeholder `https://brainzscrobble.vercel.app/`**.
- `vercel.json` — security headers (strict CSP, nosniff, etc.).
- `scripts/generate-meta-images.mjs` — generates social images with sharp.

## Decisions and conventions

- **Auth**: "Connect with ListenBrainz" flow. Magic OAuth login is NOT possible: MusicBrainz OAuth
  only issues scopes without `listenbrainz:*`; `submit-listens` requires `listenbrainz:submit-listens`.
  Every real client (WebScrobbler) uses the User Token. WebScrobbler scrapes the token from
  `listenbrainz.org/settings` through the session cookie, but that only works in an extension (host
  permissions); a plain website cannot. So: step 1 links to `https://listenbrainz.org/settings`, the
  user pastes their token once (password field with show/hide eye), it is validated via `/validate-token`
  and "Connected as `<user>`" is shown.
- **Open Scrobbler-style parsing**: pasting into artist/track splits `Artist - Track` (regex
  `/- ?| ?- | ?[－–—] ?/`, split limit 2; pasting into track is reversed). "Swaptool" button (rail with
  ⏋/⏌) to fix an inverted paste. **List** tab: one-line-per-track textarea that sends everything at once.
- **i18n**: adding a language = create `src/i18n/<xx>.ts` exporting `default const xx: Translations`.
  Do not touch the core.
- **Themes**: dark by default, light mode available. CSS tokens in `:root` (dark) and `html.light` in
  `app.css` (`--bg`, `--surface*`, `--elev`, `--line*`, `--text-*`); use the semantic classes
  `.t-strong/.t-sub/.t-soft/.t-faint/.t-dim`, `.bd-line/.bd-soft`, `.bg-surface*/.bg-elev` and the
  `.msg-info/.msg-ok/.msg-warn/.msg-err` messages instead of hardcoded zinc colors. Accents
  (purple/amber/red/emerald) and `bg-purple-600` buttons stay in both themes; status badges use
  `.badge-amber/.badge-err/.badge-ok`, theme-colored links use `.link-purple`. `theme-color` and
  `color-scheme` are synced via a `$effect` in App.svelte. Background neon via `--glow-a/--glow-b`.
- **Security**: the SPA never uses `innerHTML`/`{@html}`/`eval`. Token in `localStorage`. CSP in
  `vercel.json` mitigates XSS (`connect-src 'self' https://api.listenbrainz.org`). No meta-CSP (it
  breaks dev/HMR).
- **Searching in bash**: `rg` is not installed; use the Grep tool or `grep -o`.

## Notes

- Timestamps are sent as UNIX epoch.
- The queue persists across reloads; history is capped at 50 entries.
- Before shipping: replace the domain placeholder in `index.html` and regenerate images if the design changes.