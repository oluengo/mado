# Changelog

## 0.6.0 (2026-11-09)

- Settings page with sign-in: browser extension (NIP-07), Amber on Android (NIP-55) or a bunker (NIP-46, e.g. nsec.app or Amber). Mado never asks for the nsec; the session is remembered in that browser.
- After signing in, the site's settings load from Nostr; **Save** (or Ctrl+S) signs and publishes them, with an "Unsaved changes / Saved" indicator. "Try without an account" allows changing and previewing without saving.
- Each site can have its own settings page at `/folder/admin/` (one `index.html` that loads the settings page from Mado): e.g. `/blog/admin/`. Also `/mado/admin/`.
- The settings page refuses to save a site that belongs to another npub.
- Export, import and JSON moved to *Advanced → Backup*.

## 0.5.0 (2026-11-06)

- Settings live on Nostr: the settings page signs them with a NIP-07 extension (**Connect with extension**, **Publish to Nostr**) and the site reads them from the relays (NIP-78, kind 30078). No need to upload `config.json`.
- One settings event per site, identified automatically by domain and folder (`d` = `mado:host/path/`); the old shared `mado-config` identifier is still read.
- The site finds its npub in `config.json`, in `<meta name="mado-npub">` in `index.html`, or in the domain NIP-05 (`_`). Relays from the author's NIP-65 list are added.
- `config.json` is optional (backup or an alternative without Nostr); if both exist, Nostr wins. Lightweight instances need only `index.html`.
- Settings page: publish, preview, discard and export in the top bar; loads the published settings on open.
- Config format version 2: old files are migrated (remote settings enabled).

## 0.4.0 (2026-10-30)

- Optional tag filter for visitors (`filters` in config.json, off by default): tag bar above the listings (automatic from `includeTags` / most used, or your own list), single or multiple choice (any/all), post counts, and a tag search box in the bar.
- The separate tags page (`#/tags`, `nav.showAllTags`) is removed: the tag bar and its search replace it. Old `#/tags` links go to the home page.
- Route `#/tag/a,b` shows posts with several tags.

## 0.3.0 (2026-10-28)

- Interactions, each one optional and off by default (`interactions` in config.json): reactions, comments (count and threaded text), zaps (sats), quotes and reposts. Counters on the home page/listings can be turned off with `inList`.
- Comments include NIP-22 (kind 1111); threaded replies in a collapsible block (collapsed by default) with author name and picture, plus a "Reply on Nostr" link.
- Settings page reorganised into tabs (Author, Content, Appearance, Site, Interactions, Menu, Verification, Advanced) to avoid long scrolling; the active tab is remembered. Shows the Mado version.
- Layout API: `ctx.ix(post)` adds the counters to custom layouts.

## 0.2.0 (2026-10-28)

- Version number shown next to "Made with Mado" (links to the releases).

- Videos in notes and articles show as players, paused until the visitor starts them (by file extension or NIP-92 `imeta` type).
- YouTube links (watch, youtu.be, shorts, live) show the thumbnail with a play button; the player (youtube-nocookie) only loads when the visitor clicks, keeping the start time.

## 0.1.0 — beta (2026-10-24)

- First public beta.
- Articles (NIP-23) and notes, hashtag filters, pinned posts, search, tags, About page.
- Layouts: list, grid, sidebar, featured, timeline, compact (extensible: `layouts/`).
- Colour themes: Violeta, Océano, Bosque, Arena, Grafito, Sakura (light/dark).
- Typographies: mono, serif, sans.
- Old theme ids (minimal, revista, tarjetas) are migrated automatically.
- Signature verification of every event (NIP-01).
- Site verification via NIP-05 or signed link (profile website / NIP-78), shown as a halo on the avatar.
- Settings page with export/import and optional NIP-78 publishing.
- Languages: es, ca, en, it, de (blog and settings page, `?lang=` parameter).
- Lightweight instances: run a blog from another folder with only `index.html` + `config.json` (`examples/instance/`, `admin.html?site=`).
