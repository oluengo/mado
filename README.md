# Mado 窓

**A window onto your Nostr posts, on your own website.**

[Español](README.es.md) · English

Mado turns your Nostr articles (NIP-23) and notes into a website you host yourself — on GitHub Pages or any static host. No server, no build step, nothing to install.

- Paginated home page, permanent links, hashtag sections, tag cloud, search and an "About" page.
- Hashtag filters (include/exclude, any/all), pinned posts, hidden replies.
- Look built from three independent pieces: 6 layouts (structure), 6 colour themes with light and dark mode, and 3 typographies. Mix them freely and add your own.
- Five languages: Castellano, Català, English, Italiano, Deutsch.
- Settings page (`admin.html`) that generates `config.json` — no JSON editing by hand.
- Every event is checked against its signature, and your site can prove it belongs to you (NIP-05 or a signed link).
- Optional: store the settings on Nostr (NIP-78) and change the site without touching the repo.

## Quick start (GitHub Pages)

1. **Fork** this repository.
2. **Enable Pages**: *Settings → Pages → Deploy from a branch → `main` / root*.
3. Open `https://YOUR-USER.github.io/mado/admin.html`, set your npub and options, and click **Download config.json**.
4. Upload that file to the root of the repo, replacing the existing one. Your site updates in a minute or two.

> Shortcut: open `config.json` on GitHub, click the pencil and paste the JSON from **Copy JSON**.

This repository is a **template**: its `config.json` is empty on purpose. To run your blog inside another site with only `index.html` + `config.json`, use a [lightweight instance](docs/en/self-hosting.md#lightweight-instance-recommended-for-your-own-blog). Other options (own domain, subfolder): [Self-hosting](docs/en/self-hosting.md).

## Documentation

| Topic | English | Español |
|---|---|---|
| Getting started | [docs/en/getting-started.md](docs/en/getting-started.md) | [docs/es/primeros-pasos.md](docs/es/primeros-pasos.md) |
| Configuration reference | [docs/en/configuration.md](docs/en/configuration.md) | [docs/es/configuracion.md](docs/es/configuracion.md) |
| Site verification | [docs/en/verification.md](docs/en/verification.md) | [docs/es/verificacion.md](docs/es/verificacion.md) |
| Layouts | [docs/en/layouts.md](docs/en/layouts.md) | [docs/es/disenos.md](docs/es/disenos.md) |
| Themes and typography | [docs/en/themes.md](docs/en/themes.md) | [docs/es/temas.md](docs/es/temas.md) |
| Languages | [docs/en/languages.md](docs/en/languages.md) | [docs/es/idiomas.md](docs/es/idiomas.md) |
| Self-hosting | [docs/en/self-hosting.md](docs/en/self-hosting.md) | [docs/es/alojamiento-propio.md](docs/es/alojamiento-propio.md) |

## Project structure

```
index.html              the site
admin.html              settings page (generates config.json)
config.json             site settings
.nojekyll               lets GitHub Pages publish .well-known/
assets/
  css/base.css          shared layout
  js/core.js            Nostr, settings, cache, verification
  js/blog.js            routes and views
  js/admin.js           settings page logic
  js/i18n.js            texts in 5 languages
  js/vendor/            signature verification (@noble, MIT)
  img/nostrich.png      default avatar (see CREDITS.md)
layouts/
  layouts.json          layout list
  <id>/layout.js, layout.css
themes/
  themes.json           colour themes
  <id>/theme.css
fonts/fonts.json        typographies
examples/instance/       lightweight instance (index.html + config.json)
docs/en, docs/es        documentation
```

## Is it safe to keep `admin.html` online?

Yes. It only builds a file in your browser; it cannot change your repository. Settings published on Nostr are only accepted when signed by the author's npub. You can delete `admin.html` and `assets/js/admin.js` once you are done.

**Never type your nsec into any website.** To sign, use a NIP-07 browser extension.

## Credits and license

Mado is released under the [MIT license](LICENSE). Third-party assets and libraries are listed in [CREDITS.md](CREDITS.md).

Created by [oluengo](https://github.com/oluengo) · Nostr: `npub1vuf2g6s0mcjr34lhkg2vvtj4x65w29xn28nznw9fhcqcpyr4zc9q6myguj`
