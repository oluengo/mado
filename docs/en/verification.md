# Site verification

[Español](../es/verificacion.md)

Anyone can display public Nostr posts — that is how Nostr works. Verification lets your site prove that **you**, the author, claim it. Mado checks it on every visit using data signed with your key.

The result shows as a subtle halo around the avatar — **pastel green** if verified, **pastel red** if not — and a short line in the footer. The avatar links to your profile on njump.me, so anyone can confirm it outside your site.

One of the two options is enough.

## A · NIP-05 (site at a domain root)

Works when the site is at the root of a domain: `user.github.io` or your own domain.

1. In the settings page (block 5), choose a name (`_` means "just the domain") and click **Download nostr.json**.
2. Upload it to `.well-known/nostr.json` at the root of the domain. On GitHub Pages it goes in the repository that serves the root (`user.github.io`), together with the `.nojekyll` file (already included in Mado).
3. In your Nostr client, set your NIP-05 to `_@user.github.io` (shown as `user.github.io`) or `name@user.github.io`.

Bonus: Nostr clients will also show your NIP-05 as verified.

## B · Signed link (any URL)

Works anywhere, including subfolders like `user.github.io/mado/`.

- In your Nostr client, put the site URL in your profile's **Website** field, **or**
- Fill in **Public blog URL** (block 5) and publish the settings on Nostr (block 6). That event is signed by you.

A link to a folder covers everything inside it: `user.github.io` also covers `user.github.io/mado/`.

## Check it

**Check verification** in the settings page shows which option works and why the other one fails.

## What it protects — and what it doesn't

- **The proof cannot be forged.** Without your nsec nobody can make your npub claim their site.
- **The badge can be faked by a copy.** Whoever copies the repo controls its code. That is why the avatar links to your profile on njump.me: the real check happens there, independently.
- **What you do get:** a copy that keeps your npub shows up as *not verified*, and forged events from a relay are rejected because every signature is checked.

**Never type your nsec into any website.** To sign, use a NIP-07 extension (Alby, nos2x…).
