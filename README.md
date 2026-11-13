<p align="center"><img src="assets/img/logo-purple.svg" width="96" alt="Mado"></p>

<h1 align="center">Mado</h1>

<p align="center"><b>A window onto your Nostr posts, on your own website.</b></p>

<p align="center"><a href="https://oluengo.github.io/mado/">Website</a> · <a href="https://oluengo.github.io/blog/">See a real blog</a> · <a href="https://oluengo.github.io/mado/admin/">Settings</a></p>

<table><tr>
<td width="33%"><img src="site/img/list-violeta.webp" alt="List layout, Violet theme"></td>
<td width="33%"><img src="site/img/featured-arena.webp" alt="Featured layout, Sand theme"></td>
<td width="33%"><img src="site/img/grid-oceano.webp" alt="Grid layout, Ocean theme"></td>
</tr></table>

**Mado** (窓, Japanese for “window”) turns your Nostr articles (NIP-23) and notes into a website you host yourself, on GitHub Pages or any static host. You publish with your usual Nostr client and Mado shows it. No server, no build step, nothing to install. Free. In Castellano, Català, English, Italiano and Deutsch.

## What it does

- **Paginated home page**, permanent links, hashtag sections, search and an “About” page.
- **Hashtag filters** (include/exclude, any/all), pinned posts and hidden replies. Optional: a tag bar and tag search for visitors.
- **Look in three independent pieces:** 6 layouts, 6 colour themes with light and dark mode, and 3 typefaces. Mix them and make your own.
- **Nostr interactions**, each optional: reactions, threaded comments, zaps, quotes and reposts.
- **Settings on Nostr (NIP-78)**, signed from `admin/` with your extension, Amber or a bunker (never your nsec): change the site without touching the repository.
- **Verified signatures:** every event is checked, and your site can prove it's yours (NIP-05 or a signed link).

## Quick start (GitHub Pages)

1. **Fork** this repository.
2. **Enable Pages:** *Settings → Pages → Deploy from a branch → `main` / root*.
3. Put your npub in `index.html` (`<meta name="mado-npub" …>`, already there as a comment) or in `config.json`. Not needed if your domain has NIP-05 `_@domain`.
4. Open `https://YOUR-USER.github.io/mado/admin/`, sign in with your extension, Amber or a bunker, choose your options and click **Save**. The site applies them right away.

This repository is a **template**: its `config.json` is empty on purpose. To run your blog inside another site with a single `index.html`, use a [lightweight instance](docs/self-hosting.md#lightweight-instance-recommended-for-your-own-blog), like <https://oluengo.github.io/blog/>. Other options (own domain, subfolder): [Self-hosting](docs/self-hosting.md).

To update your fork: **Sync fork** on GitHub. Check the [changelog](CHANGELOG.md) first.

## Privacy and security

- Mado is a static website: it stores nobody's data, has no analytics or cookies and only connects to Nostr relays.
- **Never type your nsec into a website.** To save, sign in with an extension (NIP-07), Amber or a bunker (NIP-46).
- The settings page cannot change your repository, and settings published on Nostr are only accepted when signed by the author's npub. You can delete `admin.html`, `admin/` and `assets/js/admin*.js` when you're done.

## Documentation

| Topic | Guide |
|---|---|
| Getting started | [getting-started](docs/getting-started.md) |
| Configuration reference | [configuration](docs/configuration.md) |
| Site verification | [verification](docs/verification.md) |
| Layouts | [layouts](docs/layouts.md) |
| Themes and typography | [themes](docs/themes.md) |
| Languages | [languages](docs/languages.md) |
| Self-hosting | [self-hosting](docs/self-hosting.md) |

## Development

HTML, CSS and JavaScript with no dependencies and no build step.

```
index.html              the website
admin.html, admin/      settings page (saves to Nostr)
config.json             optional: npub and settings without Nostr
assets/css, assets/js   styles, Nostr, routing, texts in 5 languages, signature verification (@noble, MIT)
assets/img              logo, favicons and default avatar (see CREDITS.md)
layouts/, themes/       layouts and colour themes (layouts.json, themes.json)
fonts/fonts.json        typefaces
examples/instance/      lightweight instance (index.html and admin/)
tools/signer/           source of assets/js/vendor/nostr-signer.js (nostr-tools, bunker)
site/                   project website (oluengo.github.io/mado); not needed in forks
docs/                   documentation
```

## Support the project

If you find Mado useful:

- **Lightning / zaps:** `oluengo@rizful.com`
- **Bitcoin:** `bc1pnvdct6hfnh67p7dcg2e5mdveyz8jlxuzv4yflkxqccc72qkuc8ls8raspa`
- **Nostr:** [npub1vuf2g6s0mcjr34lhkg2vvtj4x65w29xn28nznw9fhcqcpyr4zc9q6myguj](https://njump.me/npub1vuf2g6s0mcjr34lhkg2vvtj4x65w29xn28nznw9fhcqcpyr4zc9q6myguj)

---

[Changelog](CHANGELOG.md) · [Report a problem](https://github.com/oluengo/mado/issues) · [Credits](CREDITS.md) · [MIT License](LICENSE)

<sub>Built with AI · tested by humans. Screenshots with a sample blog.</sub>
