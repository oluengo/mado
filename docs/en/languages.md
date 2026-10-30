# Languages

[Español](../es/idiomas.md)

The site and the settings page are available in:

| Code | Language |
|---|---|
| `es` | Castellano |
| `ca` | Català |
| `en` | English |
| `it` | Italiano |
| `de` | Deutsch |

## Choosing the language

- **Settings:** `site.lang` — a fixed language, or `"auto"` to follow the visitor's browser.
- **URL:** any link can force it with `?lang=`: `…/mado/?lang=ca`, `?lang=de#/about`. Handy for sharing.
- **Selector:** `site.langSwitch: true` adds a language selector to the header.

The settings page has its own selector (top right) and remembers your choice.

Your posts are shown as you wrote them; only the interface is translated.

## Adding a language

All texts are in `assets/js/i18n.js`:

1. Add the code and name to `LANGS`, and the date locale to `LOCALES`.
2. Copy the `es` block in `BLOG` and in `ADMIN`, and translate it. Keys that are functions (`n => …`) build sentences with numbers or names.
3. Optionally translate theme names and descriptions in `themes/themes.json`.

Pull requests with new languages are welcome.
