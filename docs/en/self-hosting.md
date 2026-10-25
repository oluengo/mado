# Self-hosting

[Español](../es/alojamiento-propio.md)

Mado is plain static files with relative paths, so it runs on any static host and in any folder.

## Lightweight instance (recommended for your own blog)

Keep Mado as a clean template and run your blog from another folder with just two files:

```
your-site/
  mado/            ← Mado (fork or copy), untouched
  blog/
    index.html     ← copy of examples/instance/index.html
    config.json    ← your settings
```

`index.html` loads the code, layouts, themes and typographies from `/mado/`; only `config.json` is yours. Updating Mado (sync your fork) updates every instance, and nobody who forks Mado inherits your settings.

To edit the instance settings, open `/mado/admin.html?site=/blog/`: it loads `/blog/config.json`, keeps its own draft and **Preview** opens `/blog/`.

The `/mado/` URL in `index.html` can also point to another site (`https://user.github.io/mado/`), but prefer your own fork so updates are under your control.

## On your main GitHub Pages site

To serve Mado at `https://user.github.io/` (or inside it, e.g. `/blog/`):

- **Whole site:** copy the contents of this repo into your `user.github.io` repository.
- **Subfolder:** copy everything into a folder, e.g. `blog/`. The site will be at `https://user.github.io/blog/`.

Keep `.nojekyll` at the root of that repository if you use NIP-05 verification.

## Your own domain on GitHub Pages

*Settings → Pages → Custom domain*, then point your DNS as GitHub explains. NIP-05 then works with `name@your-domain`.

## Any other static host

Netlify, Cloudflare Pages, Vercel, a VPS with nginx or Apache, shared hosting… Upload the files and you are done. No build command, no server-side code.

### Serving `nostr.json` (NIP-05)

The file must be reachable at `https://your-domain/.well-known/nostr.json`. Most hosts serve it as-is. If your server hides dot-folders, allow it — for example in nginx:

```nginx
location /.well-known/nostr.json {
  add_header Access-Control-Allow-Origin *;
  default_type application/json;
}
```

Nostr clients read this file from other origins, so it needs `Access-Control-Allow-Origin: *` (GitHub Pages already sends it).

## Checklist

- `config.json` at the same level as `index.html`.
- `assets/`, `layouts/`, `themes/` and `fonts/` next to them.
- HTTPS (needed for verification and for most relays).
- Optional: remove `admin.html` and `assets/js/admin.js` from production once configured.

## Embedding in an existing website

Mado takes over the page it runs in, so the simplest way is its own folder (`/blog/`) linked from your menu. If you want it inside another page, use an `<iframe src="/blog/">`.
