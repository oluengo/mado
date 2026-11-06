# Getting started

[Español](../es/primeros-pasos.md)

## What you need

- A Nostr account (your **npub**). You publish with your usual client (Habla, Yakihonne, Primal, Damus…); Mado only reads and shows.
- A GitHub account — or any static host (see [Self-hosting](self-hosting.md)).

## 1. Get the files

**Fork** this repository. If you want the site at `https://YOUR-USER.github.io/` instead of `/mado/`, see [Self-hosting](self-hosting.md#on-your-main-github-pages-site).

## 2. Turn on GitHub Pages

*Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.*

After a minute your site is at `https://YOUR-USER.github.io/mado/`. Without settings it shows a setup screen where you can try any npub.

## 3. Tell the site who you are

The site needs your npub to find your settings. Any of these three:

- **Domain NIP-05** (nothing to edit): if `https://YOUR-DOMAIN/.well-known/nostr.json` has the name `_` with your key, Mado uses it. See [Verification](verification.md).
- **`index.html`**: uncomment `<meta name="mado-npub" content="npub1…">` and put your npub.
- **`config.json`**: write your npub in `author.npub`.

## 4. Configure and publish to Nostr

Open `https://YOUR-USER.github.io/mado/admin.html`. You need a NIP-07 browser extension (Alby, nos2x…); **never type your nsec into a website**.

1. **Author** → **Connect with extension**: fills in your npub and loads any settings you already published.
2. Adjust the tabs (Content, Appearance, Site, Interactions…). **Preview** opens the site with your draft, only in your browser.
3. Click **Publish to Nostr**: the extension signs the settings (NIP-78, kind 30078) and they are published to your relays. The site reads them from there; nothing to upload to the repository.

Each site has its own settings, identified by its domain and folder (`mado:user.github.io/mado/`), so you can run several with the same npub.

**Export backup (JSON)** downloads the settings: a backup, or a `config.json` if you prefer not to depend on relays. If both exist, the one published on Nostr wins.

## 5. Verify your site (recommended)

So visitors know the site really is yours — see [Site verification](verification.md). It takes two minutes.

## Updating

Your settings and your posts live on Nostr, so updating Mado is just syncing your fork (*Sync fork* on GitHub). Keep your `index.html` or `config.json` if GitHub asks about conflicts.
