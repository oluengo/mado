/* Mado — núcleo compartido por el blog y el admin.
   Nostr (bech32, relays), configuración, caché, temas, texto e idioma. */
(function () {
'use strict';
const Mado = {};

/* ---------- Ubicación del código ----------
   Mado puede ejecutarse desde otra carpeta (instancia ligera): el código, los temas, diseños
   y tipografías se cargan desde donde está este archivo, y config.json desde la página. */
Mado.BASE = (() => {
  if (typeof window.MADO_BASE === 'string') return window.MADO_BASE;
  const src = document.currentScript && document.currentScript.src;
  return src ? src.replace(/assets\/js\/core\.js(\?.*)?$/, '') : '';
})();
// Borrador del admin, uno por carpeta (plantilla e instancias no se mezclan).
Mado.draftKey = href => 'mado-draft:' + new URL('./', href).pathname;
Mado.url = p => /^(https?:|data:|\/)/.test(p) ? p : Mado.BASE + p;

/* ---------- Configuración por defecto ---------- */
Mado.DEFAULTS = {
  version: 1,
  author: { npub: '' },
  relays: ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net', 'wss://relay.snort.social'],
  remoteConfig: { enabled: false, d: 'mado-config' },
  content: {
    kinds: [30023, 1],       // 30023 = artículos (NIP-23), 1 = notas
    includeTags: [],         // solo publicaciones con estos hashtags
    tagMode: 'any',          // 'any' = alguno, 'all' = todos
    excludeTags: [],
    hideReplies: true,
    pinned: [],              // identificadores (d) o ids de evento
    maxPosts: 300
  },
  site: {
    url: '',                 // URL pública del blog (va firmada si se publica en Nostr)
    title: '', description: '', logo: '', fallbackAvatar: '', useProfile: true,
    theme: 'violeta', font: 'mono', colorMode: 'auto', modeToggle: true,
    layout: 'list', lang: 'auto', langSwitch: false, dateFormat: 'long', perPage: 10, order: 'desc',
    showTags: true, showReadingTime: true, showSearch: true,
    excerptLength: 220, footer: ''
  },
  nav: { showAllTags: true, showAbout: true, sections: [], links: [] },
  advanced: { cacheMinutes: 10, timeoutMs: 7000, verifySignatures: true }
};

const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
Mado.merge = (base, over) => {
  const out = isObj(base) ? { ...base } : {};
  if (!isObj(over)) return out;
  for (const k of Object.keys(over)) {
    out[k] = isObj(base && base[k]) && isObj(over[k]) ? Mado.merge(base[k], over[k]) : over[k];
  }
  return out;
};
Mado.clone = o => JSON.parse(JSON.stringify(o));

/* ---------- Almacenamiento local seguro ---------- */
Mado.store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch {} },
  clear(prefix) {
    try { Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k)); } catch {}
  }
};

/* ---------- bech32 (npub, naddr, nevent) ---------- */
const CH = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
function polymod(values) {
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((b >> i) & 1) chk ^= GEN[i];
  }
  return chk;
}
const hrpExpand = h => [...[...h].map(c => c.charCodeAt(0) >> 5), 0, ...[...h].map(c => c.charCodeAt(0) & 31)];
function convert(data, from, to, pad) {
  let acc = 0, bits = 0; const out = [], max = (1 << to) - 1;
  for (const v of data) {
    acc = ((acc << from) | v) & 0xffffff; bits += from;
    while (bits >= to) { bits -= to; out.push((acc >> bits) & max); }
  }
  if (pad && bits > 0) out.push((acc << (to - bits)) & max);
  return out;
}
Mado.bech32Encode = (hrp, bytes) => {
  const data = convert(bytes, 8, 5, true);
  const chk = polymod([...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0]) ^ 1;
  const sum = [0, 1, 2, 3, 4, 5].map(i => (chk >> (5 * (5 - i))) & 31);
  return hrp + '1' + [...data, ...sum].map(v => CH[v]).join('');
};
Mado.bech32Decode = str => {
  const s = str.trim().toLowerCase(), p = s.lastIndexOf('1');
  if (p < 1) throw Error('bech32');
  const hrp = s.slice(0, p);
  const data = [...s.slice(p + 1)].map(c => { const i = CH.indexOf(c); if (i < 0) throw Error('bech32'); return i; });
  if (data.length < 6 || polymod([...hrpExpand(hrp), ...data]) !== 1) throw Error('bech32');
  return { hrp, bytes: convert(data.slice(0, -6), 5, 8, false) };
};
const toHex = b => b.map(x => x.toString(16).padStart(2, '0')).join('');
const fromHex = h => h.match(/.{2}/g).map(x => parseInt(x, 16));

Mado.npubToHex = input => {
  const s = String(input || '').trim().toLowerCase().replace(/^nostr:/, '');
  if (/^[0-9a-f]{64}$/.test(s)) return s;
  const { hrp, bytes } = Mado.bech32Decode(s);
  if (hrp === 'npub' && bytes.length === 32) return toHex(bytes);
  if (hrp === 'nprofile') { // TLV: tipo 0 = pubkey
    for (let i = 0; i < bytes.length;) { const t = bytes[i], l = bytes[i + 1]; if (t === 0 && l === 32) return toHex(bytes.slice(i + 2, i + 34)); i += 2 + l; }
  }
  throw Error('npub');
};
Mado.hexToNpub = hex => Mado.bech32Encode('npub', fromHex(hex));
const tlv = (t, bytes) => [t, bytes.length, ...bytes];
Mado.naddr = (kind, pubkey, d) => Mado.bech32Encode('naddr', [
  ...tlv(0, [...new TextEncoder().encode(d)]), ...tlv(2, fromHex(pubkey)),
  ...tlv(3, [(kind >>> 24) & 255, (kind >>> 16) & 255, (kind >>> 8) & 255, kind & 255])
]);
Mado.nevent = (id, pubkey) => Mado.bech32Encode('nevent', [...tlv(0, fromHex(id)), ...tlv(2, fromHex(pubkey))]);

/* ---------- Firmas (NIP-01) ---------- */
// Se rechaza todo evento cuyo id o firma no cuadren. Si falta la librería, no se acepta nada.
Mado.verifySignatures = true;
Mado.verifyEvent = e => !Mado.verifySignatures || !!(window.NostrVerify && window.NostrVerify.verifyEvent(e));

/* ---------- Relays ---------- */
// Consulta un filtro en varios relays y devuelve los eventos únicos con firma válida.
Mado.query = (relays, filter, { timeout = 7000 } = {}) => new Promise(resolve => {
  const events = new Map(), socks = [];
  let pending = relays.length, finished = false, timer;
  const finish = () => {
    if (finished) return; finished = true; clearTimeout(timer);
    socks.forEach(s => { try { s.close(); } catch {} });
    resolve([...events.values()]);
  };
  timer = setTimeout(finish, timeout);
  if (!pending) return finish();
  relays.forEach(url => {
    let closed = false;
    const done = () => { if (closed) return; closed = true; if (--pending <= 0) finish(); };
    let ws; try { ws = new WebSocket(url); } catch { return done(); }
    socks.push(ws);
    const sub = 'mado' + Math.random().toString(36).slice(2, 9);
    ws.onopen = () => ws.send(JSON.stringify(['REQ', sub, filter]));
    ws.onmessage = m => {
      let d; try { d = JSON.parse(m.data); } catch { return; }
      if (d[0] === 'EVENT' && d[1] === sub && d[2] && d[2].id && !events.has(d[2].id) && Mado.verifyEvent(d[2])) events.set(d[2].id, d[2]);
      else if ((d[0] === 'EOSE' || d[0] === 'CLOSED') && d[1] === sub) { try { ws.send(JSON.stringify(['CLOSE', sub])); } catch {} done(); }
    };
    ws.onerror = done; ws.onclose = done;
  });
});

// Pide eventos por tandas (paginando con "until") hasta llegar a "max".
Mado.fetchMany = async (relays, filter, max = 300, timeout = 7000) => {
  const all = new Map(); let until;
  for (let round = 0; round < 10 && all.size < max; round++) {
    const f = { ...filter, limit: Math.min(200, max - all.size) };
    if (until) f.until = until;
    const batch = await Mado.query(relays, f, { timeout });
    let added = 0, oldest = Infinity;
    for (const e of batch) { if (!all.has(e.id)) { all.set(e.id, e); added++; } if (e.created_at < oldest) oldest = e.created_at; }
    if (!added || batch.length < f.limit) break;
    until = oldest - 1;
  }
  return [...all.values()];
};

// Publica un evento firmado. Devuelve { url: {ok, msg} }.
Mado.publish = (relays, event, timeout = 7000) => new Promise(resolve => {
  const results = {}; let pending = relays.length, timer;
  const fin = () => { clearTimeout(timer); resolve(results); };
  timer = setTimeout(fin, timeout);
  if (!pending) return fin();
  relays.forEach(url => {
    let ws, ended = false;
    const done = (ok, msg) => { if (ended) return; ended = true; results[url] = { ok, msg }; try { ws && ws.close(); } catch {} if (--pending <= 0) fin(); };
    try { ws = new WebSocket(url); } catch { return done(false, 'error'); }
    ws.onopen = () => ws.send(JSON.stringify(['EVENT', event]));
    ws.onmessage = m => { let d; try { d = JSON.parse(m.data); } catch { return; } if (d[0] === 'OK' && d[1] === event.id) done(!!d[2], d[3] || ''); };
    ws.onerror = () => done(false, 'error'); ws.onclose = () => done(false, 'closed');
  });
});

/* ---------- Configuración ---------- */
// Convierte configuraciones de la beta anterior (temas que incluían letra y estructura).
Mado.migrate = raw => {
  const c = Mado.clone(raw || {}), site = c.site || (c.site = {});
  const OLD = { minimal: ['violeta', 'mono', 'list'], revista: ['arena', 'serif', 'featured'], tarjetas: ['oceano', 'sans', 'grid'] };
  if (OLD[site.theme]) {
    const [t, f, l] = OLD[site.theme];
    site.theme = t;
    if (!site.font) site.font = f;
    if (!site.layout || site.layout === 'auto') site.layout = l;
  }
  if (site.layout === 'auto') site.layout = 'list';
  return c;
};
Mado.fetchRemoteConfig = async cfg => {
  const pk = Mado.npubToHex(cfg.author.npub);
  const ev = await Mado.query(cfg.relays, { authors: [pk], kinds: [30078], '#d': [cfg.remoteConfig.d], limit: 5 },
    { timeout: Math.min(cfg.advanced.timeoutMs, 5000) });
  const latest = ev.filter(e => e.pubkey === pk).sort((a, b) => b.created_at - a.created_at)[0];
  if (!latest) return null;
  try { return { data: JSON.parse(latest.content), event: latest }; } catch { return null; }
};

// Orden: borrador del admin (?preview) > window.MADO_CONFIG > config.json; luego NIP-78 si está activo.
Mado.loadConfig = async ({ preview = false } = {}) => {
  let cfg = preview ? Mado.store.get(Mado.draftKey(location.href)) : null;
  if (!cfg && window.MADO_CONFIG) cfg = window.MADO_CONFIG;
  if (!cfg) { const r = await fetch(window.MADO_CONFIG_URL || 'config.json', { cache: 'no-store' }); if (!r.ok) throw Error('config.json'); cfg = await r.json(); }
  cfg = Mado.merge(Mado.DEFAULTS, Mado.migrate(cfg));
  if (cfg.remoteConfig.enabled && cfg.author.npub && !preview) {
    const key = 'mado-remote:' + cfg.author.npub + ':' + cfg.remoteConfig.d;
    const cached = Mado.store.get(key);
    let remote = cached && Date.now() - cached.ts < cfg.advanced.cacheMinutes * 60000 ? cached.data : null;
    if (!remote) {
      try { const r = await Mado.fetchRemoteConfig(cfg); remote = r ? r.data : null; } catch {}
      if (remote) Mado.store.set(key, { ts: Date.now(), data: remote });
      else if (cached) remote = cached.data;
    }
    if (remote) {
      remote = Mado.migrate(remote);
      Mado.signedSiteUrl = remote.site && remote.site.url || ''; // viene de un evento firmado por el autor
      const r = { ...remote }; delete r.author; delete r.remoteConfig; cfg = Mado.merge(cfg, r);
    }
  }
  Mado.verifySignatures = cfg.advanced.verifySignatures !== false;
  return cfg;
};

/* ---------- Verificación de propiedad ----------
   Los motivos de fallo son claves de texto (r_*) que traduce el admin.
   La web está verificada si el autor (con eventos firmados) la reclama:
   1) NIP-05: el perfil dice nombre@este-dominio y /.well-known/nostr.json de este dominio da su clave.
   2) Enlace firmado: el campo "website" del perfil, o site.url de la configuración NIP-78, apunta a esta web. */
Mado.normUrl = u => {
  if (!u) return '';
  try {
    const x = new URL(/^[a-z]+:\/\//i.test(u) ? u : 'https://' + u);
    return (x.host + x.pathname.replace(/\/[^/]*\.html?$/i, '/')).replace(/\/+$/, '').toLowerCase();
  } catch { return ''; }
};
// La reclamación cubre esta web si es la misma URL o una carpeta que la contiene.
Mado.urlCovers = (claim, here) => !!claim && !!here && (here === claim || here.startsWith(claim + '/'));
Mado.isLocal = () => !/^https?:$/.test(location.protocol) || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || !!window.MADO_BUNDLE;

Mado.checkNip05 = async (nip05, pk, onlyHost) => {
  const m = String(nip05 || '').trim().toLowerCase().match(/^([a-z0-9._-]+)@([a-z0-9.-]+\.[a-z]{2,})$/);
  if (!m) return { ok: false, reason: 'r_noNip05' };
  const [, name, domain] = m;
  if (onlyHost && domain !== onlyHost.toLowerCase()) return { ok: false, reason: 'r_nip05Other', arg: domain, domain };
  try {
    const r = await fetch(`https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`, { cache: 'no-store' });
    if (!r.ok) return { ok: false, reason: 'r_noJson', arg: domain, domain };
    const j = await r.json(), names = j && j.names || {};
    const v = names[name] || names[Object.keys(names).find(k => k.toLowerCase() === name)];
    return v && v.toLowerCase() === pk ? { ok: true, id: `${name}@${domain}`, domain } : { ok: false, reason: 'r_jsonNoKey', domain };
  } catch { return { ok: false, reason: 'r_jsonErr', arg: domain, domain }; }
};

// here = URL normalizada del blog; host = dominio donde debe estar el NIP-05.
Mado.checkOwnership = async ({ pk, profile, signedUrl, here, host }) => {
  const res = { verified: false, method: '', detail: '', checks: [] };
  const n = await Mado.checkNip05(profile && profile.nip05, pk, host);
  res.checks.push({ method: 'nip05', ...n });
  if (n.ok) return { ...res, verified: true, method: 'nip05', detail: n.id };
  const site = profile && Mado.normUrl(profile.website);
  const w = Mado.urlCovers(site, here);
  res.checks.push({ method: 'website', ok: w, reason: site ? (w ? '' : 'r_websiteOther') : 'r_noWebsite', arg: site });
  if (w) return { ...res, verified: true, method: 'website', detail: site };
  const s = Mado.normUrl(signedUrl), ok78 = Mado.urlCovers(s, here);
  res.checks.push({ method: 'nip78', ok: ok78, reason: s ? (ok78 ? '' : 'r_nip78Other') : 'r_noNip78', arg: s });
  if (ok78) return { ...res, verified: true, method: 'nip78', detail: s };
  return res;
};

/* ---------- Temas y modo claro/oscuro ---------- */
Mado.loadThemes = async () => {
  if (window.MADO_THEMES) return window.MADO_THEMES;
  try { const r = await fetch(Mado.url('themes/themes.json'), { cache: 'no-store' }); return await r.json(); }
  catch { return [{ id: 'violeta', name: 'Violeta' }]; }
};
// Un tema es solo una paleta de colores (claro y oscuro).
Mado.applyTheme = theme => {
  document.querySelectorAll('[data-mado-theme]').forEach(n => n.remove());
  const css = window.MADO_THEMES_CSS && window.MADO_THEMES_CSS[theme.id];
  let n;
  if (css) { n = document.createElement('style'); n.textContent = css; }
  else { n = document.createElement('link'); n.rel = 'stylesheet'; n.href = Mado.url(`themes/${theme.id}/theme.css`); }
  n.dataset.madoTheme = ''; document.head.appendChild(n);
};

/* ---------- Tipografía ---------- */
Mado.loadFonts = async () => {
  if (window.MADO_FONTS) return window.MADO_FONTS;
  try { const r = await fetch(Mado.url('fonts/fonts.json'), { cache: 'no-store' }); return await r.json(); }
  catch { return [{ id: 'mono', body: 'ui-monospace, monospace', head: 'ui-monospace, monospace', size: '15px' }]; }
};
Mado.applyFont = font => {
  document.querySelectorAll('[data-mado-font]').forEach(n => n.remove());
  if (!font) return;
  if (font.href) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = font.href; l.dataset.madoFont = ''; document.head.appendChild(l); }
  const st = document.documentElement.style;
  st.setProperty('--font-body', font.body); st.setProperty('--font-head', font.head || font.body);
  if (font.size) st.setProperty('--fs', font.size);
  document.body.className = document.body.className.replace(/\bfont-\S+/g, '').trim();
  document.body.classList.add('font-' + font.id);
};

/* ---------- Diseños (estructura de la página) ----------
   Cada diseño vive en layouts/<id>/ (layout.js + layout.css) y se registra con
   Mado.registerLayout(id, { shell, list, item, options }). Ver docs/es/disenos.md. */
Mado._layouts = {};
Mado.registerLayout = (id, def) => { Mado._layouts[id] = def || {}; };
Mado.loadLayouts = async () => {
  if (window.MADO_LAYOUTS) return window.MADO_LAYOUTS;
  try { const r = await fetch(Mado.url('layouts/layouts.json'), { cache: 'no-store' }); return await r.json(); }
  catch { return [{ id: 'list', name: 'List' }]; }
};
const loadScript = src => new Promise(res => {
  const s = document.createElement('script'); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s);
});
// Carga (si hace falta) y aplica un diseño. Si falla, usa el diseño de lista integrado.
Mado.useLayout = async id => {
  if (!Mado._layouts[id] && !window.MADO_BUNDLE) await loadScript(Mado.url(`layouts/${id}/layout.js`));
  if (!Mado._layouts[id]) id = 'list';
  document.querySelectorAll('[data-mado-layout]').forEach(n => n.remove());
  const css = window.MADO_LAYOUTS_CSS && window.MADO_LAYOUTS_CSS[id];
  let n;
  if (css != null) { n = document.createElement('style'); n.textContent = css; }
  else { n = document.createElement('link'); n.rel = 'stylesheet'; n.href = Mado.url(`layouts/${id}/layout.css`); }
  n.dataset.madoLayout = ''; document.head.appendChild(n);
  document.body.className = document.body.className.replace(/\blayout-\S+/g, '').trim();
  document.body.classList.add('layout-' + id);
  return { id, ...Mado.LAYOUT_DEFAULTS, ...Mado._layouts[id], options: { pinFirst: true, ...(Mado._layouts[id].options || {}) } };
};
// Estructura por defecto: cabecera, contenido y pie en una columna.
Mado.LAYOUT_DEFAULTS = {
  shell: p => `<div class="mado-wrap">
    <header class="mado-header"><div class="mado-top">${p.brand}${p.tools}</div>${p.nav}${p.search}</header>
    ${p.main}${p.footer}</div>`,
  list: (items, ctx) => `<div class="mado-list">${items.map(ctx.item).join('')}</div>`
};
Mado.registerLayout('list', {});
Mado.initMode = mode => {
  const m = Mado.store.get('mado-mode') || mode;
  if (m === 'light' || m === 'dark') document.documentElement.dataset.theme = m;
  else delete document.documentElement.dataset.theme;
};
Mado.toggleMode = () => {
  const r = document.documentElement;
  const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme = dark ? 'light' : 'dark';
  Mado.store.set('mado-mode', r.dataset.theme);
};

/* Avatar por defecto si el perfil no tiene imagen: el icono Nostrich de SovrynMatt
   (https://github.com/SovrynMatt/Nostr-Website-Button-Design, libre de uso; ver CREDITS.md).
   Si ese archivo no está, se usa el avestruz dibujado aquí abajo. */
Mado.DEFAULT_AVATAR = window.MADO_DEFAULT_AVATAR || Mado.url('assets/img/nostrich.png');
Mado.OSTRICH = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#efe9df"/><path d="M8 64c2-11 10-18 24-18s22 7 24 18z" fill="#5f5751"/><path d="M14 64c3-8 9-12 18-12s15 4 18 12z" fill="#746a62"/><path d="M28.5 50c1.6-9 1.4-18 .2-26l6.4-.6c1.1 8.6 1.1 17.6-.4 26.8z" fill="#e7cdb6"/><ellipse cx="33.5" cy="19" rx="8.5" ry="7.4" fill="#e7cdb6"/><path d="M40.5 17.2c4.3-.4 7.8.4 10 2.2-2.6 1.6-6.4 2.3-10.4 1.8z" fill="#d8a56f"/><path d="M40.6 19.6l9.4-.2" stroke="#b9854f" stroke-width=".8" stroke-linecap="round"/><circle cx="36.3" cy="17.4" r="2.6" fill="#2b2622"/><circle cx="37.1" cy="16.6" r=".8" fill="#fff"/><path d="M33.2 14.2c1.4-.9 3.4-1 4.9-.3" stroke="#2b2622" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M27 13.5c.6-2.5 2.4-3.8 4.2-4.1M30 12c1-1.9 2.6-2.8 4.3-2.8" stroke="#8a7e74" stroke-width="1" fill="none" stroke-linecap="round"/></svg>');

// Si una imagen de avatar falla: primero el avatar por defecto configurado, luego el avestruz.
Mado.avatarFallback = (img, fallback) => {
  if (!img) return;
  img.onerror = () => {
    const next = fallback && img.getAttribute('src') !== fallback ? fallback : Mado.OSTRICH;
    if (img.getAttribute('src') === Mado.OSTRICH) { img.onerror = null; return; }
    img.src = next;
  };
};

/* ---------- Texto ---------- */
Mado.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
Mado.tag = (e, k) => (e.tags.find(t => t[0] === k) || [])[1];
Mado.normTag = t => String(t || '').trim().replace(/^#/, '').toLowerCase();

const NOSTR_ID = /nostr:((?:npub|nprofile|note|nevent|naddr)1[02-9ac-hj-np-z]+)/g;
Mado.stripMd = s => String(s || '')
  .replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/<[^>]+>/g, ' ').replace(NOSTR_ID, ' ').replace(/https?:\/\/\S+/g, ' ')
  .replace(/^#{1,6}\s+/gm, '').replace(/[*_~>#|-]+/g, ' ').replace(/\s+/g, ' ').trim();

/* ---------- Imágenes y vídeos ----------
   Se reconocen por la extensión o por la etiqueta imeta (NIP-92), que da el tipo MIME
   de enlaces sin extensión. Los vídeos se muestran parados: el visitante los activa. */
const IMG_EXT = /\.(png|jpe?g|gif|webp|avif|svg)(?:[?#]\S*)?$/i;
const VID_EXT = /\.(mp4|m4v|webm|mov|ogv|ogg)(?:[?#]\S*)?$/i;
// imeta: [["imeta", "url https://…", "m video/mp4", …], …] → { url: mime }
Mado.imeta = e => {
  const out = {};
  (e.tags || []).filter(t => t[0] === 'imeta').forEach(t => {
    let url = '', mime = '';
    t.slice(1).forEach(f => { const i = String(f).indexOf(' '); const k = f.slice(0, i), v = f.slice(i + 1); if (k === 'url') url = v; if (k === 'm') mime = v; });
    if (url && mime) out[url] = mime.toLowerCase();
  });
  return out;
};
Mado.mediaType = (url, media) => {
  const raw = String(url || '').replace(/&amp;/g, '&'), mime = media && media[raw];
  if (mime) return mime.startsWith('video/') ? 'video' : mime.startsWith('image/') ? 'image' : '';
  return VID_EXT.test(raw) ? 'video' : IMG_EXT.test(raw) ? 'image' : '';
};
// src ya escapado para HTML. "#t=0.1" hace que Safari muestre el primer fotograma.
const videoHtml = src => `<video class="mado-media mado-video" src="${src}${src.includes('#') ? '' : '#t=0.1'}" controls preload="metadata" playsinline></video>`;
const imageHtml = src => `<img class="mado-media" src="${src}" alt="" loading="lazy">`;

/* YouTube: se muestra la miniatura con un botón de play; el reproductor (youtube-nocookie)
   solo se carga cuando el visitante lo pulsa. Así no se conecta con YouTube antes de tiempo. */
Mado.youtube = url => {
  let u; try { u = new URL(String(url).replace(/&amp;/g, '&')); } catch { return null; }
  const host = u.hostname.replace(/^(www|m|music)\./, '');
  let id = '', short = false;
  if (host === 'youtu.be') id = u.pathname.slice(1);
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const p = u.pathname.split('/').filter(Boolean);
    if (p[0] === 'watch') id = u.searchParams.get('v') || '';
    else if (['shorts', 'embed', 'live', 'v'].includes(p[0])) { id = p[1] || ''; short = p[0] === 'shorts'; }
  }
  if (!/^[\w-]{11}$/.test(id)) return null;
  const t = u.searchParams.get('t') || u.searchParams.get('start') || '';
  const m = String(t).match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  const start = m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
  return { id, start, short };
};
Mado.playLabel = 'Play';
const youtubeHtml = y => `<span class="mado-yt${y.short ? ' mado-yt-short' : ''}" data-yt="${y.id}" data-start="${y.start}" role="button" tabindex="0" aria-label="${Mado.esc(Mado.playLabel)} (YouTube)">` +
  `<img src="https://i.ytimg.com/vi/${y.id}/hqdefault.jpg" alt="" loading="lazy"><span class="mado-yt-play" aria-hidden="true"></span></span>`;
// Sustituye la miniatura por el reproductor. Se llama al pulsar (ver blog.js).
Mado.playYoutube = el => {
  const id = el.dataset.yt, start = +el.dataset.start || 0;
  if (!/^[\w-]{11}$/.test(id)) return;
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${start ? '&start=' + start : ''}`;
  f.title = 'YouTube'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
  f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  el.replaceChildren(f); el.classList.add('is-playing'); el.removeAttribute('role'); el.removeAttribute('tabindex');
};

Mado.md = (src, media) => {
  const s = String(src || '').replace(NOSTR_ID, (m, id) => `[${id.slice(0, 14)}…](https://njump.me/${id})`);
  if (!(window.marked && window.DOMPurify)) return `<div class="mado-text">${Mado.linkify(src, null, media)}</div>`;
  const tpl = document.createElement('template');
  tpl.innerHTML = DOMPurify.sanitize(marked.parse(s));
  const video = url => { const v = document.createElement('video'); v.className = 'mado-media mado-video'; v.controls = true; v.preload = 'metadata'; v.playsInline = true; v.setAttribute('playsinline', ''); v.src = url.includes('#') ? url : url + '#t=0.1'; return v; };
  // ![](video.mp4) → reproductor
  tpl.content.querySelectorAll('img[src]').forEach(img => { if (Mado.mediaType(img.getAttribute('src'), media) === 'video') img.replaceWith(video(img.getAttribute('src'))); });
  tpl.content.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href'), type = Mado.mediaType(href, media), text = a.textContent.trim();
    // Solo enlaces «desnudos» (el texto es la propia URL): un enlace con texto propio se respeta.
    if (!/^https?:/i.test(href) || (text !== href && text !== href.replace(/^https?:\/\//, ''))) {
      if (/^https?:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
      return;
    }
    const yt = Mado.youtube(href);
    if (yt) { const t = document.createElement('template'); t.innerHTML = youtubeHtml(yt); a.replaceWith(t.content); }
    else if (type === 'video') a.replaceWith(video(href));
    else if (type === 'image') { const i = document.createElement('img'); i.className = 'mado-media'; i.alt = ''; i.loading = 'lazy'; i.src = href; a.replaceWith(i); }
    else { a.target = '_blank'; a.rel = 'noopener'; }
  });
  return tpl.innerHTML;
};

// Texto plano de notas: enlaces, imágenes, vídeos, referencias nostr: y hashtags.
Mado.linkify = (text, tagHref, media) => Mado.esc(text).replace(
  /(https?:\/\/[^\s<]*[^\s<.,;:!?)\]])|nostr:((?:npub|nprofile|note|nevent|naddr)1[02-9ac-hj-np-z]+)|(^|\s)#([\p{L}\p{N}_]+)/gu,
  (m, url, nid, pre, ht) => {
    if (url) {
      const yt = Mado.youtube(url);
      if (yt) return youtubeHtml(yt);
      const type = Mado.mediaType(url, media);
      if (type === 'image') return imageHtml(url);
      if (type === 'video') return videoHtml(url);
      return `<a href="${url}" target="_blank" rel="noopener">${url.replace(/^https?:\/\//, '').slice(0, 60)}</a>`;
    }
    if (nid) return `<a href="https://njump.me/${nid}" target="_blank" rel="noopener">${nid.slice(0, 14)}…</a>`;
    return `${pre}<a class="mado-hashtag" href="${tagHref ? tagHref(ht) : '#'}">#${ht}</a>`;
  });

Mado.readingTime = s => Math.max(1, Math.round(Mado.stripMd(s).split(' ').length / 220));

Mado.fmtDate = (ts, fmt, lang) => {
  const d = new Date(ts * 1000), loc = ((window.MADO_I18N || {}).LOCALES || {})[lang] || 'es-ES';
  if (fmt === 'short') return d.toLocaleDateString(loc);
  if (fmt === 'relative') {
    const diff = (ts * 1000 - Date.now()) / 1000, rtf = new Intl.RelativeTimeFormat(loc, { numeric: 'auto' });
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [u, s] of units) if (Math.abs(diff) >= s) return rtf.format(Math.round(diff / s), u);
    return rtf.format(0, 'minute');
  }
  return d.toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' });
};

// Mes y año, p. ej. «octubre de 2026» (para la cronología).
Mado.fmtMonth = (ts, lang) => {
  const loc = ((window.MADO_I18N || {}).LOCALES || {})[lang] || 'es-ES';
  const s = new Date(ts * 1000).toLocaleDateString(loc, { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/* ---------- Idiomas (textos en js/i18n.js) ---------- */
Mado.LANGS = () => (window.MADO_I18N || {}).LANGS || { es: 'Castellano' };
Mado.resolveLang = pref => {
  const L = Mado.LANGS();
  if (pref && L[pref]) return pref;
  const nav = (navigator.languages || [navigator.language || 'es']).map(l => String(l).slice(0, 2).toLowerCase());
  return nav.find(l => L[l]) || 'es';
};
// Texto que puede venir traducido como { es: '…', en: '…' }.
Mado.tr = (v, lang) => v && typeof v === 'object' ? (v[lang] || v.es || Object.values(v)[0] || '') : (v || '');
Mado.t = lang => { const B = (window.MADO_I18N || {}).BLOG || {}; return B[lang] || B.es; };
Mado.ta = lang => { const A = (window.MADO_I18N || {}).ADMIN || {}; return A[lang] || A.es; };

/* Proyecto original (mención en el pie). Puedes cambiarlo, aunque se agradece que lo mantengas. */
Mado.VERSION = '0.2.0';
Mado.PROJECT = { name: 'Mado', version: Mado.VERSION, url: 'https://github.com/oluengo/mado', npub: 'npub1vuf2g6s0mcjr34lhkg2vvtj4x65w29xn28nznw9fhcqcpyr4zc9q6myguj' };

window.Mado = Mado;
})();
