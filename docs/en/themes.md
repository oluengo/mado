# Themes and typography

[Español](../es/temas.md)

Mado's look is made of three independent pieces:

| Piece | What it controls | Folder |
|---|---|---|
| **Layout** | Structure: where things go | `layouts/` — see [Layouts](layouts.md) |
| **Theme** | Colours only, light and dark | `themes/` |
| **Typography** | Fonts and base size | `fonts/fonts.json` |

Any combination works: Sidebar + Forest + Serif, Compact + Graphite + Mono…

## Themes (colour palettes)

| Id | Name |
|---|---|
| `violeta` | Violet — light grey with a Nostr purple accent |
| `oceano` | Ocean — calm blues |
| `bosque` | Forest — natural greens |
| `arena` | Sand — warm paper with a terracotta accent |
| `grafito` | Graphite — black and white |
| `sakura` | Sakura — soft pink with a cherry accent |

### Create a theme

1. Copy `themes/violeta` to `themes/my-theme`.
2. Change the colours. A theme only sets these variables, for light and dark mode:

| Variable | Use |
|---|---|
| `--bg` | Page background |
| `--fg` | Text |
| `--muted` | Secondary text (dates, descriptions) |
| `--line` | Borders and separators |
| `--card` | Background of cards and inputs |
| `--accent` | Links, active menu, highlights |
| `--accent-bg` | Background of tags and soft highlights |

```css
:root { --bg: #fafafa; --fg: #1d1d1f; … }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #121214; … } }
:root[data-theme="dark"] { --bg: #121214; … }
```

3. Add it to `themes/themes.json`:

```json
{
  "id": "my-theme",
  "name": { "en": "My theme", "es": "Mi tema" },
  "description": { "en": "…", "es": "…" },
  "preview": { "light": ["#fafafa", "#1d1d1f", "#7b3fe4"], "dark": ["#121214", "#ececef", "#b18cff"] }
}
```

`preview` holds the three swatches shown in the settings page (background, text, accent).

Keep themes to colours. Anything about structure belongs in a layout.

## Typography

| Id | Fonts | Base size |
|---|---|---|
| `mono` | System monospace | 15 px |
| `serif` | Fraunces (headings) + Source Serif 4 (text) | 18 px |
| `sans` | Inter | 16 px |

### Add a typography

Add an entry to `fonts/fonts.json`:

```json
{
  "id": "humanist",
  "name": { "en": "Humanist", "es": "Humanista" },
  "description": { "en": "…", "es": "…" },
  "body": "\"Nunito\", system-ui, sans-serif",
  "head": "\"Nunito\", system-ui, sans-serif",
  "size": "16px",
  "href": "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap"
}
```

`href` is optional (a Google Fonts stylesheet, or empty for system fonts). Mado sets `--font-body`, `--font-head` and `--fs`, and adds the class `font-<id>` to `<body>`.
