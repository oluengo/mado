# Credits

## Logo

`assets/img/logo*.svg`, `logo-*.png`, `favicon.ico` — Mado logo by oluengo. Released with the project under the MIT license.

## Default avatar

`assets/img/nostrich.png` — **Purple Nostrich Icon** by **SovrynMatt**, cropped to a round 256 px avatar.
Source: <https://github.com/SovrynMatt/Nostr-Website-Button-Design>

The author releases it as free and open source and invites people to use it on their websites.

If the file is missing, Mado falls back to a small ostrich drawn in its own code.

## Libraries

| Library | Use | License | Source |
|---|---|---|---|
| @noble/curves, @noble/hashes (Paul Miller) | Signature verification (bundled in `assets/js/vendor/nostr-verify.js`) | MIT | <https://github.com/paulmillr/noble-curves> |
| nostr-tools (fiatjaf and contributors) | Bunker sign-in, NIP-46 (bundled in `assets/js/vendor/nostr-signer.js`, built from `tools/signer/`) | Unlicense | <https://github.com/nbd-wtf/nostr-tools> |
| marked | Markdown rendering (loaded from cdnjs) | MIT | <https://github.com/markedjs/marked> |
| DOMPurify | HTML sanitizing (loaded from cdnjs) | Apache-2.0 / MPL-2.0 | <https://github.com/cure53/DOMPurify> |

## Fonts

The *serif* and *sans* typographies load Fraunces, Source Serif 4 and Inter from Google Fonts (SIL Open Font License).

The project website (`site/`) includes Fraunces and Inter (`site/fonts/`, SIL Open Font License; licence texts alongside).
