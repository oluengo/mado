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

## 3. Configure

Open `https://YOUR-USER.github.io/mado/admin.html`:

1. **Author and relays** — paste your npub; your profile appears below to confirm it.
2. **Content** — articles, notes or both. Click **Analyze the author's posts** to see your hashtags and pin articles with one click.
3. **Appearance**, **Navigation** — theme, title, language, menu sections…
4. **Preview** opens the site with your draft (only in your browser).

Everything is saved as a draft in your browser until you export it.

## 4. Publish the settings

Click **Download config.json** and upload it to the root of the repo, replacing the existing one (*Add file → Upload files*, or edit `config.json` and paste the JSON from **Copy JSON**). GitHub Pages republishes in a minute or two.

## 5. Verify your site (recommended)

So visitors know the site really is yours — see [Site verification](verification.md). It takes two minutes.

## Updating

Your settings live in `config.json` and your posts live on Nostr, so updating Mado is just syncing your fork (*Sync fork* on GitHub). Keep your `config.json` if GitHub asks about conflicts.
