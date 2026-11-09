// Firmantes externos para la página de configuración de Mado (se empaqueta en
// assets/js/vendor/nostr-signer.js con `npm ci && npm run build` en esta carpeta).
// Mado no ve ni guarda ninguna nsec: firma una extensión (NIP-07), un bunker (NIP-46) o Amber.
// Con bunker se guarda solo la clave temporal de esa conexión.
import { BunkerSigner, parseBunkerInput } from "nostr-tools/nip46";
import { SimplePool } from "nostr-tools/pool";
import { generateSecretKey, getEventHash, verifyEvent } from "nostr-tools/pure";
import { bytesToHex, hexToBytes } from "nostr-tools/utils";

const pool = new SimplePool();
const bunkers = new Map();

export const verify = ev => { try { return verifyEvent(ev); } catch { return false; } };
export const eventHash = getEventHash;

/** Conecta con un bunker (bunker://… o NIP-05). Devuelve { pubkey, sk, bp } para guardar la sesión. */
export async function bunkerConnect(input, onauth) {
  const bp = await parseBunkerInput(String(input || "").trim());
  if (!bp || !bp.relays?.length) throw new Error("bunker");
  const sk = generateSecretKey();
  const s = BunkerSigner.fromBunker(sk, bp, { pool, onauth });
  await s.connect();
  const pubkey = await s.getPublicKey();
  bunkers.set(pubkey, s);
  return { pubkey, sk: bytesToHex(sk), bp };
}
/** Firma con una sesión de bunker guardada. */
export function bunkerSign(session, template, onauth) {
  let s = bunkers.get(session.pubkey);
  if (!s) { s = BunkerSigner.fromBunker(hexToBytes(session.sk), session.bp, { pool, onauth }); bunkers.set(session.pubkey, s); }
  return s.signEvent({ kind: template.kind, created_at: template.created_at, tags: template.tags, content: template.content });
}
export function bunkerClose(pubkey) { const s = bunkers.get(pubkey); bunkers.delete(pubkey); try { s?.close(); } catch {} }
