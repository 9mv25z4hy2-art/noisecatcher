# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Turbopack dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type-check without emitting
```

```bash
npm test             # vitest run (28 tests across stats, psychoacoustics, audioImport)
npx vitest run lib/audio/__tests__/stats.test.ts  # single test file
```

Verify with `tsc --noEmit` and `lint` before committing.

## Stack

- **Next.js 16.2.6** — App Router only; no Pages Router; Turbopack (`turbopack: {}` in `next.config.ts`). No webpack.
- **React 19.2.4** — strict mode
- **Dexie.js 4.4.3** — IndexedDB for pin storage (`lib/db.ts`, `EntityTable`)
- **MapLibre GL JS v5.24.0** CSP variant — worker served from `/public/maplibre-worker.js`; must call `ml.setWorkerUrl("/maplibre-worker.js")` before map init
- **TensorFlow.js / YAMNet** — 521-class AudioSet classifier, lazy-loaded
- **IBM Plex Mono** — sole font, loaded via `next/font/google`; CSS vars `--font-display` / `--font-ibm-mono`

## Architecture

### App shell (`app/layout.tsx`)
Server component. Reads `nc-theme` cookie server-side → applies `light`/`dark` class on `<html>`. Provider stack (client): `I18nProvider` → `PinsProvider` → children. iOS 18+ haptics via hidden `<input id="nc-haptic-ios" type="checkbox" switch="" />`.

### Pins (`lib/pins.ts`, `lib/db.ts`)
All pin I/O is async. Use `loadPins()`, `savePin()`, `deletePin(id)` — never touch `db` directly outside `lib/db.ts`. `PinsProvider` runs `migrateLegacyPins()` on mount (one-time localStorage → IDB migration). `NoisePin` type lives in `lib/pins.ts`.

### i18n (`lib/i18n/`)
16 locales. Use the `useI18n()` hook to get `{ t, locale, setLocale, isRTL }`. Add new string keys to `LocaleStrings` interface in `locales.ts` and fill all 16 locales. For long-form pages (about, help) use the `en_only_notice` key with a `<LangNotice>` component when full translation is unavailable.

### Audio (`lib/audio/meter.ts`)
`NoiseMeter` class: `start(deviceId?)`, `stop()`, `getAnalyser()`, `isActive()`. Fires `onReading(db)` on every animation frame. A-weighting per IEC 61672-1:2013. **Leq** (energy average) = `10 * log10(mean(10^(v/10)))` — not arithmetic mean.

### Abécédaire (`lib/abecedaire.ts`)
88 entries. Each entry: `{ id, term, definition, category, sources?, relatedTerms?, relatedDbThreshold? }`. Categories: `acoustic | health | social | legal | environmental`.

### Service Worker (`public/sw.js`)
Vanilla JS. Caches app shell + map tiles. Registered in `app/layout.tsx`.

### No backend
Entirely client-side. Pins stored in IDB. No auth, no server DB.

## Key conventions

- No comments unless the WHY is non-obvious.
- Single font — IBM Plex Mono everywhere. Do not add other typefaces.
- All new `aria-*` attributes should follow existing patterns (see `components/meter/NoiseMeter.tsx`, `components/abecedaire/TermCard.tsx`).
- Map overlays use the Noise-Planet WMS federation (`lib/noisePlanet.ts`).
- Psychoacoustics: Zwicker model — Loudness (sone), Sharpness (acum), Roughness (asper), Psychoacoustic Annoyance — computed in meter components.
