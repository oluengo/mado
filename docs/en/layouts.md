# Layouts

[Español](../es/disenos.md)

Mado separates **layouts** (structure), **themes** (colours) and **typography**. Any combination works — see [Themes and typography](themes.md).

| Id | Name | What it does |
|---|---|---|
| `list` | List | Classic single column. |
| `grid` | Grid | Cards in columns. |
| `sidebar` | Sidebar | Profile, menu, search and top tags on the left. On narrow screens the bar moves to the top. |
| `featured` | Featured | On the home page, the latest (or pinned) post large and the rest in a grid. |
| `timeline` | Timeline | Posts grouped by month on a timeline. Pinned posts are not moved to the top. |
| `compact` | Compact | One line per post: date, title and tags. |

Choose it in the settings page (block 3) or in `config.json`:

```json
"site": { "layout": "sidebar", "theme": "bosque", "font": "serif" }
```

## Create a layout

A layout is a folder with two files:

```
layouts/my-layout/layout.js
layouts/my-layout/layout.css
```

and an entry in `layouts/layouts.json`:

```json
{ "id": "my-layout", "name": { "en": "My layout", "es": "Mi diseño" }, "description": { "en": "…", "es": "…" } }
```

`layout.js` registers it:

```js
Mado.registerLayout('my-layout', {
  // Page structure. Optional: without it, the default one is used.
  shell: (p, ctx) => `<div class="mado-wrap">
    <header class="mado-header"><div class="mado-top">${p.brand}${p.tools}</div>${p.nav}${p.search}</header>
    ${p.main}${p.footer}</div>`,

  // How a page of posts is laid out. Optional.
  list: (items, ctx) => `<div class="mado-list">${items.map(ctx.item).join('')}</div>`,

  // How a single post looks in the list. Optional.
  item: (post, ctx) => `<a href="${ctx.href(post)}">${ctx.esc(post.title)}</a>`,

  options: { pinFirst: true }   // false = do not move pinned posts to the top
});
```

### `shell(p, ctx)` — the pieces

Each piece already carries its id; **include every piece exactly once** (you can skip `aside`).

| Piece | Contents |
|---|---|
| `p.brand` | Avatar (with verification halo), title and description |
| `p.tools` | Language selector and light/dark button |
| `p.nav` | Menu |
| `p.search` | Search box (empty if disabled) |
| `p.aside` | Top tags, filled in once posts load |
| `p.main` | Where pages are shown |
| `p.footer` | Footer (author, verification, credit) |

### `list(items, ctx)` and `item(post, ctx)` — the helpers

| Helper | Returns |
|---|---|
| `ctx.item(post)` | The post as rendered by this layout (`item`, or the default one) |
| `ctx.defaultItem(post)` | Mado's default post card |
| `ctx.href(post)`, `ctx.tagHref(tag)` | Links |
| `ctx.date(post)`, `ctx.month(post)` | Formatted date, "Month Year" |
| `ctx.meta(post)`, `ctx.tags(post)`, `ctx.cover(post)` | Ready-made HTML pieces |
| `ctx.excerpt(post)` | Summary or excerpt text |
| `ctx.esc(text)` | HTML-escaped text — use it for any text you insert |
| `ctx.home`, `ctx.page`, `ctx.pages` | Is it the home page? Current page and total |
| `ctx.lang`, `ctx.T`, `ctx.cfg` | Language, interface texts, settings |

A post has: `title`, `summary`, `image`, `content`, `date`, `tags`, `isArticle`, `pinned`, `id`, `slug`.

If a layout throws an error, Mado falls back to the default list so the site never goes blank.

## Layout, theme or typography?

- Where things go, columns, grouping, spacing, decorations → **layout** (`layouts/`).
- Colours → **theme** (`themes/`), using only the colour variables.
- Fonts → **typography** (`fonts/fonts.json`).

In your layout CSS use the variables (`var(--accent)`, `var(--font-head)`…) instead of fixed colours or fonts, so it works with every theme and typography.

Prefix layout-specific rules with `.layout-<id>` (Mado adds that class to `<body>`) so they don't leak into other layouts.
