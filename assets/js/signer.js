/* Mado — sesión de la página de configuración.
   Se entra con un firmante: extensión del navegador (NIP-07), Amber en Android (NIP-55, por enlace)
   o bunker (NIP-46: nsec.app, Amber como bunker…). Mado nunca ve ni guarda una nsec; con bunker
   solo guarda la clave temporal de esa conexión. Cada firma se comprueba (autor y firma válidos).
   Necesita core.js y vendor/nostr-signer.js. */
(function () {
'use strict';
const KEY = 'mado-session', OP = 'mado-op', AMB_RES = 'mado-amber.res', AMB_REQ = 'mado-amber.req';
const N = () => window.MadoNostr;

class AmberAway extends Error { constructor() { super('amber'); } }
class SignErr extends Error { constructor(code) { super(code); this.code = code; } }

const sha = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))]
  .map(b => b.toString(16).padStart(2, '0')).join('');

/* ---------- Amber (NIP-55 por enlace) ----------
   Cada petición abre Amber con callbackUrl; Amber vuelve a esta página con el resultado en la URL.
   El resultado se guarda y la operación pendiente se repite desde el principio. */
const Amber = {
  async call(type, content, extra = {}) {
    const k = await sha(type + '|' + (extra.current || '') + '|' + content);
    const res = Mado.store.get(AMB_RES) || {};
    if (res[k] != null) return res[k];
    const id = Math.random().toString(36).slice(2, 10);
    Mado.store.set(AMB_REQ, { id, k });
    const u = new URL(location.href);
    u.hash = ''; u.searchParams.delete('amber'); u.searchParams.delete('result'); u.searchParams.set('amber', id);
    const cb = u.href + '&result=';
    const q = new URLSearchParams({ compressionType: 'none', returnType: type === 'sign_event' ? 'event' : 'signature', type, appName: 'Mado' });
    if (extra.current) q.set('current_user', extra.current);
    if (type === 'get_public_key') q.set('permissions', JSON.stringify([{ type: 'sign_event', kind: 30078 }]));
    location.href = `nostrsigner:${encodeURIComponent(content)}?${q}&callbackUrl=${encodeURIComponent(cb)}`;
    throw new AmberAway();
  },
  // Al volver de Amber: guarda el resultado y limpia la URL. true si había resultado.
  collect() {
    const u = new URL(location.href), id = u.searchParams.get('amber');
    if (!id) return false;
    const i = location.href.indexOf('&result=');
    let r = i >= 0 ? location.href.slice(i + 8) : '';
    try { r = decodeURIComponent(r); } catch {}
    const req = Mado.store.get(AMB_REQ);
    if (req && req.id === id && r) { const res = Mado.store.get(AMB_RES) || {}; res[req.k] = r; Mado.store.set(AMB_RES, res); }
    Mado.store.del(AMB_REQ);
    u.searchParams.delete('amber'); u.searchParams.delete('result');
    try { history.replaceState(null, '', u.pathname + u.search + location.hash.replace(/&result=.*$/, '')); } catch {}
    return !!r;
  },
  clear() { Mado.store.del(AMB_RES); Mado.store.del(AMB_REQ); }
};

const toHex = v => { try { return Mado.npubToHex(String(v || '').trim()); } catch { return ''; } };

Mado.Signer = {
  AmberAway, SignErr,
  isAndroid: /Android/i.test(navigator.userAgent),
  session: () => Mado.store.get(KEY),
  logout() {
    const s = Mado.store.get(KEY);
    if (s && s.method === 'bunker') try { N().bunkerClose(s.pubkey); } catch {}
    Mado.store.del(KEY); Mado.store.del(OP); Amber.clear();
  },
  async loginNip07() {
    if (!window.nostr) throw new SignErr('nip07');
    const pk = toHex(await window.nostr.getPublicKey());
    if (!pk) throw new SignErr('signer');
    Mado.store.set(KEY, { pubkey: pk, method: 'nip07' });
    return pk;
  },
  async loginBunker(input, onauth) {
    if (!N()) throw new SignErr('bunker');
    const r = await N().bunkerConnect(input, onauth);
    Mado.store.set(KEY, { pubkey: r.pubkey, method: 'bunker', sk: r.sk, bp: r.bp });
    return r.pubkey;
  },
  async loginAmber() {
    const pk = toHex(await Amber.call('get_public_key', ''));
    if (!pk) throw new SignErr('signer');
    Mado.store.set(KEY, { pubkey: pk, method: 'amber' });
    return pk;
  },
  // Firma una plantilla {kind, created_at, tags, content} con la sesión activa.
  async sign(t, onauth) {
    const s = Mado.store.get(KEY);
    if (!s) throw new SignErr('nosession');
    const base = { kind: t.kind, created_at: t.created_at, tags: t.tags, content: t.content, pubkey: s.pubkey };
    let ev = null;
    if (s.method === 'nip07') {
      if (!window.nostr) throw new SignErr('nip07');
      if (toHex(await window.nostr.getPublicKey()) !== s.pubkey) throw new SignErr('nip07-other');
      ev = await window.nostr.signEvent(base);
    } else if (s.method === 'bunker') {
      ev = await N().bunkerSign(s, base, onauth);
    } else if (s.method === 'amber') {
      base.id = N().eventHash(base);
      const r = await Amber.call('sign_event', JSON.stringify(base), { current: Mado.hexToNpub(s.pubkey) });
      try { ev = JSON.parse(r); } catch {}
      if (!ev && /^[0-9a-f]{128}$/i.test(r)) ev = { ...base, sig: r };
    }
    if (!ev || ev.pubkey !== s.pubkey || !(N() ? N().verify(ev) : true)) throw new SignErr('signer');
    return ev;
  },
  // Operación pendiente: con Amber la página se recarga al volver y se retoma desde aquí.
  setOp: op => Mado.store.set(OP, op),
  getOp: () => Mado.store.get(OP),
  doneOp() { Mado.store.del(OP); Amber.clear(); },
  collect: () => Amber.collect()
};
})();
