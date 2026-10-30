# Configuration reference

[Español](../es/configuracion.md)

All settings live in `config.json`. The settings page (`admin.html`) edits every field; this page is for reference. Missing fields use the defaults shown.

## `author`

| Field | Default | Description |
|---|---|---|
| `npub` | `""` | Author's npub (or hex public key). Required. |

## `relays`

List of `wss://` relays to read from. Default: `relay.damus.io`, `nos.lol`, `relay.primal.net`, `relay.snort.social`. Use the relays you publish to.

## `remoteConfig` (NIP-78)

| Field | Default | Description |
|---|---|---|
| `enabled` | `false` | Read the rest of the settings from a signed Nostr event (kind 30078). |
| `d` | `"mado-config"` | Identifier (`d` tag) of that event. |

`author` and `relays` always come from `config.json`: they are needed to find the remote settings.

## `content`

| Field | Default | Description |
|---|---|---|
| `kinds` | `[30023, 1]` | `30023` = articles (NIP-23), `1` = notes. |
| `includeTags` | `[]` | Only posts with these hashtags. Empty = all. Case-insensitive. |
| `tagMode` | `"any"` | `"any"` = at least one hashtag, `"all"` = every hashtag. |
| `excludeTags` | `[]` | Hide posts with these hashtags. |
| `hideReplies` | `true` | Hide notes that reply to other notes. |
| `pinned` | `[]` | Article identifiers (`d` tag) or event ids shown first on the home page. |
| `maxPosts` | `300` | Maximum posts to load. |

## `site`

| Field | Default | Description |
|---|---|---|
| `url` | `""` | Public URL of the site. Used for verification (signed when published via NIP-78). |
| `title`, `description` | `""` | Empty = profile name and bio. |
| `logo` | `""` | Header image. Empty = profile picture. |
| `fallbackAvatar` | `""` | Used if there is no picture or it fails. Empty = `assets/img/nostrich.png`. |
| `useProfile` | `true` | Use the Nostr profile for title, description and picture. |
| `layout` | `"list"` | Layout (structure) id from `layouts/layouts.json`. |
| `theme` | `"violeta"` | Theme (colours) id from `themes/themes.json`. |
| `font` | `"mono"` | Typography id from `fonts/fonts.json`. |
| `colorMode` | `"auto"` | `"auto"`, `"light"` or `"dark"`. |
| `modeToggle` | `true` | Light/dark button. |
| `lang` | `"auto"` | `es`, `ca`, `en`, `it`, `de` or `"auto"` (browser). The URL can override it with `?lang=`. |
| `langSwitch` | `false` | Language selector in the header. |
| `dateFormat` | `"long"` | `"long"`, `"short"` or `"relative"`. |
| `perPage` | `10` | Posts per page. |
| `order` | `"desc"` | `"desc"` newest first, `"asc"` oldest first. |
| `showTags`, `showReadingTime`, `showSearch` | `true` | Show hashtags, reading time, search box. |
| `excerptLength` | `220` | Characters of the excerpt when an article has no summary. |
| `footer` | `""` | Extra footer text. |

## `nav`

| Field | Default | Description |
|---|---|---|
| `showAbout` | `true` | "About" page with the profile bio. |
| `sections` | `[]` | Menu entries that show a hashtag: `{ "label": "Bitcoin", "tag": "bitcoin" }`. |
| `links` | `[]` | External links: `{ "label": "GitHub", "url": "https://…" }`. |

## `filters`

Tag filter for visitors. Everything is optional and off by default.

| Field | Default | Description |
|---|---|---|
| `tagBar` | `false` | Tag bar above the listings: clicking a tag shows only those posts. |
| `source` | `"auto"` | `"auto"` = the `content.includeTags` tags if there are several; otherwise the most used. `"custom"` = the ones in `tags`. |
| `tags` | `[]` | Your own tags for the bar (with `source: "custom"`), in that order. |
| `max` | `12` | Maximum tags in the bar. |
| `showCounts` | `true` | Number of posts next to each tag. |
| `multi` | `false` | Choose several tags at once (route `#/tag/a,b`). |
| `multiMode` | `"any"` | With several: `"any"` = posts with any of them, `"all"` = with all of them. |
| `tagSearch` | `false` | Tag search box inside the tag bar. Enter opens the first match. |

## `interactions`

What other people do with your posts on Nostr. Each option is independent; all are off by default. Data is read from the relays in `relays`, so numbers may differ slightly from other clients.

| Field | Default | Description |
|---|---|---|
| `reactions` | `false` | Reactions (kind 7): one per person; the emoji breakdown shows on hover. |
| `replies` | `false` | Number of comments (kind 1 notes and NIP-22 comments, kind 1111). |
| `replyList` | `false` | Comment text, threaded, at the end of each post, in a collapsible block (collapsed by default), with a link to reply on Nostr. |
| `zaps` | `false` | Zaps (kind 9735): total sats. |
| `quotes` | `false` | Quotes: notes that mention the post (`q` tag). |
| `reposts` | `false` | Reposts (kind 6 and 16), one per person. |
| `inList` | `false` | Also show counters on the home page and listings. If `false`, only inside the post. |

Counters are kept in the local cache (`advanced.cacheMinutes`). The "Compact" layout does not show them in the list.

## `advanced`

| Field | Default | Description |
|---|---|---|
| `cacheMinutes` | `10` | Local cache in the visitor's browser. `0` = always fetch. |
| `timeoutMs` | `7000` | How long to wait for relays. |
| `verifySignatures` | `true` | Discard events whose signature does not match. Keep it on. |

## Site routes

| Route | Page |
|---|---|
| `#/` · `#/page/2` | Home |
| `#/post/<id>` | Article (by `d` tag) or note (by id) |
| `#/tag/<hashtag>` · `#/tag/a,b` | Posts with a hashtag |
| `#/search/<text>` | Search |
| `#/about` | About |

Add `?lang=xx` before the `#` to force a language, e.g. `…/mado/?lang=en#/about`.
