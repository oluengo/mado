# Changelog

## Unreleased

- Videos in notes and articles show as players, paused until the visitor starts them (by file extension or NIP-92 `imeta` type).

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
