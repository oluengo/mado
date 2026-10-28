# Changelog

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

- First public beta · Primera beta pública.
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
