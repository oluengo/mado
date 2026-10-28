/* Mado — página de configuración.
   Genera config.json; no guarda nada en el repo por sí sola. */
(async function () {
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let cfg;

/* ---------- Utilidades ---------- */
const getP = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setP = (o, p, v) => { const ks = p.split('.'); let t = o; ks.slice(0, -1).forEach(k => { t = t[k] || (t[k] = {}); }); t[ks[ks.length - 1]] = v; };
const say = (el, text, kind = '') => { el.textContent = text; el.className = 'msg ' + kind; };
const msg = (t, k) => say($('#msg'), t, k);
const pretty = c => JSON.stringify(c, null, 2);

Mado.initMode('auto');
$('#mode').onclick = () => { Mado.toggleMode(); if (typeof renderThemes === 'function') renderThemes(); };

/* ---------- Idioma de la página ---------- */
let ui = Mado.resolveLang(Mado.store.get('mado-admin-lang')), A = Mado.ta(ui);
// a('clave', ...args): texto traducido (las claves con argumentos son funciones).
const a = (k, ...args) => { const v = A[k] != null ? A[k] : Mado.ta('es')[k]; return typeof v === 'function' ? v(...args) : (v == null ? k : v); };
$('#ui-lang').innerHTML = Object.entries(Mado.LANGS()).map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
$('#ui-lang').value = ui;
$('#ui-lang').onchange = e => { ui = e.target.value; A = Mado.ta(ui); Mado.store.set('mado-admin-lang', ui); applyTexts(); };

function applyTexts() {
  document.documentElement.lang = ui;
  $$('[data-i18n]').forEach(el => { el.innerHTML = a(el.dataset.i18n); });
  $$('[data-i18n-title]').forEach(el => { el.title = a(el.dataset.i18nTitle); el.setAttribute('aria-label', el.title); });
  renderThemes(); renderLayouts(); renderFonts(); renderLangOptions(); renderDateOptions(); renderRepeaters(); nip05Hint();
  if (lastAnalysis) renderAnalysis();
  if (cfg.author.npub) showProfile();
}
function renderLangOptions() {
  const sel = $('#site-lang'), v = cfg.site.lang;
  sel.innerHTML = `<option value="auto">${a('langAuto')}</option>` + Object.entries(Mado.LANGS()).map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
  sel.value = v;
}
function renderDateOptions() {
  const now = Math.floor(Date.now() / 1000), opts = $('#date-fmt').options;
  opts[0].textContent = Mado.fmtDate(now, 'long', ui);
  opts[1].textContent = Mado.fmtDate(now, 'short', ui);
  opts[2].textContent = Mado.fmtDate(now - 3 * 86400, 'relative', ui);
}

/* ---------- Carga inicial ---------- */
// ?site=/blog/ edita la configuración de una instancia ligera en otra carpeta del mismo dominio.
const SITE = (() => {
  const v = new URLSearchParams(location.search).get('site') || '';
  return /^(\.{0,2}\/)(?!\/)[\w\-./]*$/.test(v) ? v.replace(/\/?$/, '/') : '';
})();
async function repoConfig() {
  if (window.MADO_CONFIG) return Mado.clone(window.MADO_CONFIG);
  const r = await fetch(SITE + 'config.json', { cache: 'no-store' });
  if (!r.ok) throw Error('config.json');
  return r.json();
}
const DRAFT = Mado.draftKey(new URL(SITE || './', location.href).href);
const draft = Mado.store.get(DRAFT);
try { cfg = Mado.merge(Mado.DEFAULTS, Mado.migrate(draft || await repoConfig())); }
catch { cfg = Mado.clone(Mado.DEFAULTS); }

const themes = await Mado.loadThemes();
const layouts = await Mado.loadLayouts();
const fonts = await Mado.loadFonts();
// Carga las fuentes para que las muestras se vean con su letra.
fonts.filter(f => f.href).forEach(f => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = f.href; document.head.appendChild(l); });
const card = (name, id, cur, title, desc, extra = '') => `<label class="theme-opt"><input type="radio" name="${name}" value="${Mado.esc(id)}" data-path="site.${name}" data-type="radio"${cur === id ? ' checked' : ''}>
  ${extra}<b>${Mado.esc(title)}</b><span class="hint">${Mado.esc(desc)}</span></label>`;
function renderLayouts() {
  $('#layouts').innerHTML = layouts.map(l => card('layout', l.id, cfg.site.layout, Mado.tr(l.name, ui), Mado.tr(l.description, ui))).join('');
}
function renderFonts() {
  $('#fonts').innerHTML = fonts.map(f => card('font', f.id, cfg.site.font, Mado.tr(f.name, ui), Mado.tr(f.description, ui),
    `<span class="font-sample" style="font-family:${Mado.esc(f.head || f.body)}">Aa Bb 123</span>`)).join('');
}
let lastAnalysis = null;
function renderThemes() {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  $('#themes').innerHTML = themes.map(t => {
    const c = (t.preview || {})[dark ? 'dark' : 'light'] || [];
    return card('theme', t.id, cfg.site.theme, Mado.tr(t.name, ui), Mado.tr(t.description, ui), `<span class="swatch">${c.map(x => `<i style="background:${Mado.esc(x)}"></i>`).join('')}</span>`);
  }).join('');
}

/* ---------- Formulario <-> config ---------- */
function fill() {
  $$('[data-path]').forEach(el => {
    const v = getP(cfg, el.dataset.path), t = el.dataset.type;
    if (t === 'kinds') el.checked = (v || []).includes(+el.value);
    else if (t === 'radio') el.checked = v === el.value;
    else if (el.type === 'checkbox') el.checked = !!v;
    else if (t === 'list') el.value = (v || []).join(', ');
    else if (t === 'lines') el.value = (v || []).join('\n');
    else el.value = v == null ? '' : v;
  });
  renderRepeaters();
  update(false);
}

function collect() {
  const kinds = [];
  $$('[data-path]').forEach(el => {
    const p = el.dataset.path, t = el.dataset.type;
    if (t === 'kinds') { if (el.checked) kinds.push(+el.value); return; }
    if (t === 'radio') { if (el.checked) setP(cfg, p, el.value); return; }
    let v;
    if (el.type === 'checkbox') v = el.checked;
    else if (t === 'list') v = el.value.split(',').map(s => s.trim()).filter(Boolean);
    else if (t === 'lines') v = el.value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    else if (t === 'number') v = el.value === '' ? getP(Mado.DEFAULTS, p) : +el.value;
    else v = el.value.trim();
    setP(cfg, p, v);
  });
  cfg.content.kinds = kinds.length ? kinds : [30023];
  Mado.verifySignatures = cfg.advanced.verifySignatures !== false;
}

function update(save = true) {
  $('#json').textContent = pretty(cfg);
  if (save) Mado.store.set(DRAFT, cfg);
}

$('#form').addEventListener('input', e => {
  if (e.target.closest('.rep')) return;
  collect(); update();
  if (e.target.dataset.path === 'author.npub') debounceProfile();
});

/* ---------- Secciones y enlaces ---------- */
function renderRepeaters() {
  const rows = (list, ka, kb, pa, pb) => list.map((x, i) => `<div class="rep-row" data-i="${i}">
    <input type="text" data-k="${ka}" value="${Mado.esc(x[ka] || '')}" placeholder="${pa}">
    <input type="text" data-k="${kb}" value="${Mado.esc(x[kb] || '')}" placeholder="${pb}">
    <button type="button" data-del title="${a('remove')}" aria-label="${a('remove')}">✕</button></div>`).join('');
  $('#sections').innerHTML = rows(cfg.nav.sections, 'label', 'tag', a('secLabelPh'), a('secTagPh'));
  $('#links').innerHTML = rows(cfg.nav.links, 'label', 'url', a('linkLabelPh'), 'https://…');
}
function bindRepeater(id, key, blank) {
  const box = $('#' + id);
  box.addEventListener('input', e => {
    const row = e.target.closest('.rep-row'); if (!row) return;
    cfg.nav[key][+row.dataset.i][e.target.dataset.k] = e.target.value.trim(); update();
  });
  box.addEventListener('click', e => {
    if (!e.target.matches('[data-del]')) return;
    cfg.nav[key].splice(+e.target.closest('.rep-row').dataset.i, 1); renderRepeaters(); update();
  });
  $('#add-' + (key === 'sections' ? 'section' : 'link')).onclick = () => { cfg.nav[key].push({ ...blank }); renderRepeaters(); update(); };
}
bindRepeater('sections', 'sections', { label: '', tag: '' });
bindRepeater('links', 'links', { label: '', url: '' });

/* ---------- Perfil del autor ---------- */
let pt;
function debounceProfile() { clearTimeout(pt); pt = setTimeout(showProfile, 600); }
async function showProfile() {
  const box = $('#profile');
  if (!cfg.author.npub) { box.textContent = ''; return; }
  let pk; try { pk = Mado.npubToHex(cfg.author.npub); } catch { box.textContent = a('badNpub'); return; }
  box.textContent = a('searchingProfile');
  const ev = (await Mado.query(cfg.relays, { authors: [pk], kinds: [0], limit: 2 }, { timeout: cfg.advanced.timeoutMs }))
    .filter(e => e.pubkey === pk).sort((a, b) => b.created_at - a.created_at)[0];
  let p = null; try { p = ev && JSON.parse(ev.content); } catch {}
  box.innerHTML = p ? `${p.picture ? `<img src="${Mado.esc(p.picture)}" alt="">` : ''}<span><b>${Mado.esc(p.display_name || p.name || '')}</b> ${Mado.esc(p.nip05 || '')}</span>`
    : a('profileNotFound');
}

/* ---------- Analizar publicaciones ---------- */
$('#b-analyze').onclick = async () => {
  const m = $('#analyze-msg'), box = $('#analyze');
  collect();
  let pk; try { pk = Mado.npubToHex(cfg.author.npub); } catch { return say(m, a('needNpub'), 'err'); }
  say(m, a('querying'));
  const events = (await Mado.fetchMany(cfg.relays, { authors: [pk], kinds: [...cfg.content.kinds, 5] }, cfg.content.maxPosts, cfg.advanced.timeoutMs))
    .filter(e => e.pubkey === pk);
  const deleted = new Set();
  events.filter(e => e.kind === 5).forEach(e => e.tags.forEach(t => { if (t[0] === 'e' || t[0] === 'a') deleted.add(t[1]); }));
  const byKey = new Map();
  events.filter(e => e.kind !== 5 && !deleted.has(e.id)).forEach(e => {
    const k = e.kind === 30023 ? `30023:${pk}:${Mado.tag(e, 'd') || ''}` : e.id, prev = byKey.get(k);
    if (e.kind === 30023 && deleted.has(k)) return;
    if (!prev || e.created_at > prev.created_at) byKey.set(k, e);
  });
  const posts = [...byKey.values()];
  const counts = {};
  posts.forEach(e => new Set(e.tags.filter(t => t[0] === 't' && t[1]).map(t => Mado.normTag(t[1]))).forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  const tags = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const articles = posts.filter(e => e.kind === 30023).sort((a, b) => (+Mado.tag(b, 'published_at') || b.created_at) - (+Mado.tag(a, 'published_at') || a.created_at));
  lastAnalysis = { tags, articles, notes: posts.length - articles.length };
  renderAnalysis();
};
function renderAnalysis() {
  const { tags, articles, notes } = lastAnalysis, box = $('#analyze');
  say($('#analyze-msg'), a('analyzeRes', articles.length, notes, tags.length, cfg.content.kinds.includes(1)), 'ok');
  box.hidden = false;
  box.innerHTML = (tags.length ? `<div><span class="hint">${a('hashtagsFound')}</span><div class="scroll" style="margin-top:6px"><table>
      <tr><th>${a('colTag')}</th><th>${a('colN')}</th><th></th></tr>
      ${tags.map(([t, n]) => `<tr data-tag="${Mado.esc(t)}"><td>#${Mado.esc(t)}</td><td class="n">${n}</td><td class="a">
        <button type="button" data-act="inc">${a('actInc')}</button> <button type="button" data-act="exc">${a('actExc')}</button> <button type="button" data-act="nav">${a('actNav')}</button></td></tr>`).join('')}
    </table></div></div>` : `<p class="hint">${a('noHashtags')}</p>`) +
    (articles.length ? `<div><span class="hint">${a('articles')}</span><div class="scroll" style="margin-top:6px"><table>
      <tr><th>${a('colTitle')}</th><th>${a('colDate')}</th><th></th></tr>
      ${articles.map(e => { const d = Mado.tag(e, 'd') || e.id; return `<tr data-pin="${Mado.esc(d)}"><td>${Mado.esc(Mado.tag(e, 'title') || a('untitled'))}</td>
        <td class="n">${Mado.fmtDate(+Mado.tag(e, 'published_at') || e.created_at, 'short', ui)}</td><td class="a"><button type="button" data-act="pin">${a('actPin')}</button></td></tr>`; }).join('')}
    </table></div></div>` : '');
  markAnalyze();
}
function markAnalyze() {
  const inc = cfg.content.includeTags.map(Mado.normTag), exc = cfg.content.excludeTags.map(Mado.normTag), nav = cfg.nav.sections.map(s => Mado.normTag(s.tag));
  $$('#analyze tr[data-tag]').forEach(r => {
    const t = r.dataset.tag;
    r.querySelector('[data-act=inc]').classList.toggle('on', inc.includes(t));
    r.querySelector('[data-act=exc]').classList.toggle('on', exc.includes(t));
    r.querySelector('[data-act=nav]').classList.toggle('on', nav.includes(t));
  });
  $$('#analyze tr[data-pin]').forEach(r => r.querySelector('[data-act=pin]').classList.toggle('on', cfg.content.pinned.includes(r.dataset.pin)));
}
const toggle = (arr, v) => { const i = arr.map(Mado.normTag).indexOf(Mado.normTag(v)); if (i >= 0) arr.splice(i, 1); else arr.push(v); };
$('#analyze').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const row = b.closest('tr'), act = b.dataset.act;
  if (act === 'pin') { const d = row.dataset.pin, i = cfg.content.pinned.indexOf(d); if (i >= 0) cfg.content.pinned.splice(i, 1); else cfg.content.pinned.push(d); }
  else {
    const t = row.dataset.tag;
    if (act === 'inc') toggle(cfg.content.includeTags, t);
    if (act === 'exc') toggle(cfg.content.excludeTags, t);
    if (act === 'nav') { const i = cfg.nav.sections.findIndex(s => Mado.normTag(s.tag) === t); if (i >= 0) cfg.nav.sections.splice(i, 1); else cfg.nav.sections.push({ label: t.charAt(0).toUpperCase() + t.slice(1), tag: t }); }
  }
  fill(); update(); markAnalyze();
});

/* ---------- Barra de acciones ---------- */
$('#b-preview').onclick = () => {
  collect(); update();
  if (window.MADO_BUNDLE) return msg(a('previewBundle'), 'err');
  if (!Mado.store.set(DRAFT, cfg)) return msg(a('noStorage'), 'err');
  window.open((SITE || '') + 'index.html?preview', '_blank');
};
$('#b-download').onclick = () => {
  collect();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([pretty(cfg) + '\n'], { type: 'application/json' }));
  link.download = 'config.json'; document.body.appendChild(link); link.click(); link.remove();
  msg(a('downloaded'), 'ok');
};
$('#b-copy').onclick = async () => {
  collect();
  try { await navigator.clipboard.writeText(pretty(cfg)); msg(a('copied'), 'ok'); }
  catch { msg(a('copyFail'), 'err'); }
};
$('#b-import').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try { cfg = Mado.merge(Mado.DEFAULTS, Mado.migrate(JSON.parse(await f.text()))); fill(); update(); msg(a('imported'), 'ok'); showProfile(); }
  catch { msg(a('badJson'), 'err'); }
  e.target.value = '';
};
$('#b-reload').onclick = async () => {
  if (!confirm(a('reloadConfirm'))) return;
  try { cfg = Mado.merge(Mado.DEFAULTS, Mado.migrate(await repoConfig())); Mado.store.del(DRAFT); fill(); msg(a('reloaded'), 'ok'); showProfile(); }
  catch { msg(a('reloadFail'), 'err'); }
};
$('#b-clear').onclick = () => { Mado.store.clear('mado-cache:'); Mado.store.clear('mado-profile:'); Mado.store.clear('mado-remote:'); msg(a('cacheCleared'), 'ok'); };

/* ---------- NIP-78 ---------- */
const nmsg = (t, k) => say($('#nostr-msg'), t, k);
$('#b-nostr-load').onclick = async () => {
  collect();
  try { Mado.npubToHex(cfg.author.npub); } catch { return nmsg(a('needNpub'), 'err'); }
  nmsg(a('remoteSearching'));
  const r = await Mado.fetchRemoteConfig(cfg).catch(() => null);
  if (!r) return nmsg(a('remoteNone'), 'err');
  const when = Mado.fmtDate(r.event.created_at, 'long', ui);
  if (!confirm(a('remoteConfirm', when))) return nmsg('');
  const keep = { author: cfg.author, relays: cfg.relays, remoteConfig: cfg.remoteConfig };
  cfg = Mado.merge(Mado.merge(Mado.DEFAULTS, Mado.migrate(r.data)), keep); fill(); update();
  nmsg(a('remoteLoaded', when), 'ok');
};
$('#b-nostr-pub').onclick = async () => {
  collect();
  if (!window.nostr) return nmsg(a('noNip07'), 'err');
  let pk; try { pk = Mado.npubToHex(cfg.author.npub); } catch { return nmsg(a('needNpub'), 'err'); }
  try {
    const signer = await window.nostr.getPublicKey();
    if (signer !== pk) return nmsg(a('wrongKey'), 'err');
    if (!cfg.site.url && !confirm(a('urlEmptyConfirm'))) return nmsg('');
    const data = Mado.clone(cfg); delete data.author;
    const ev = await window.nostr.signEvent({
      kind: 30078, created_at: Math.floor(Date.now() / 1000),
      tags: [['d', cfg.remoteConfig.d], ['client', 'mado']], content: JSON.stringify(data)
    });
    nmsg(a('publishing'));
    const res = await Mado.publish(cfg.relays, ev, cfg.advanced.timeoutMs);
    const ok = Object.values(res).filter(r => r.ok).length;
    nmsg(ok ? a('published', ok, cfg.relays.length, !cfg.remoteConfig.enabled) : a('publishFail'), ok ? 'ok' : 'err');
  } catch (e) { nmsg(a('signErr') + ' ' + (e.message || e), 'err'); }
};

/* ---------- Verificación de la web ---------- */
const guessUrl = () => /^https?:$/.test(location.protocol) && !window.MADO_BUNDLE
  ? new URL(SITE || './', location.href).href : '';
const siteUrl = () => cfg.site.url || guessUrl();
const hostOf = u => { try { return new URL(/^[a-z]+:\/\//i.test(u) ? u : 'https://' + u).hostname; } catch { return ''; } };
if (!cfg.site.url && guessUrl()) $('#site-url').placeholder = guessUrl();
function nip05Hint() {
  const name = ($('#nip05-name').value.trim() || '_').toLowerCase(), host = hostOf(siteUrl()) || 'usuario.github.io';
  // "_@dominio" es válido y los clientes lo muestran solo como "dominio".
  $('#nip05-hint').textContent = `${name}@${host}`;
  $('#nip05-shown').textContent = name === '_' ? host : `${name}@${host}`;
  $('#nip05-domain').textContent = '@' + host;
}
$('#nip05-name').oninput = nip05Hint;
$('#site-url').addEventListener('input', nip05Hint);

$('#b-nip05').onclick = () => {
  let pk; try { pk = Mado.npubToHex(cfg.author.npub); } catch { return say($('#verify-msg'), a('needNpub'), 'err'); }
  const name = ($('#nip05-name').value.trim() || '_').toLowerCase();
  if (!/^[a-z0-9._-]+$/.test(name)) return say($('#verify-msg'), a('nip05BadName'), 'err');
  const json = { names: { [name]: pk }, relays: { [pk]: cfg.relays } };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(json, null, 2) + '\n'], { type: 'application/json' }));
  link.download = 'nostr.json'; document.body.appendChild(link); link.click(); link.remove();
  say($('#verify-msg'), a('nip05Done', hostOf(siteUrl()) || 'usuario.github.io', $('#nip05-hint').textContent), 'ok');
};

$('#b-verify').onclick = async () => {
  collect();
  const box = $('#verify-msg'), url = siteUrl();
  let pk; try { pk = Mado.npubToHex(cfg.author.npub); } catch { return say(box, a('needNpub'), 'err'); }
  if (!url) return say(box, a('needUrl'), 'err');
  say(box, a('checking'));
  const ev = (await Mado.query(cfg.relays, { authors: [pk], kinds: [0], limit: 2 }, { timeout: cfg.advanced.timeoutMs }))
    .filter(e => e.pubkey === pk).sort((a, b) => b.created_at - a.created_at)[0];
  let profile = null; try { profile = ev && JSON.parse(ev.content); } catch {}
  let signedUrl = '';
  if (cfg.remoteConfig.enabled) { const r = await Mado.fetchRemoteConfig(cfg).catch(() => null); signedUrl = r && r.data.site && r.data.site.url || ''; }
  const res = await Mado.checkOwnership({ pk, profile, signedUrl, here: Mado.normUrl(url), host: hostOf(url) });
  const names = { nip05: a('mNip05'), website: a('mWebsite'), nip78: a('mNip78') };
  box.className = 'msg';
  box.innerHTML = `<b style="color:var(--${res.verified ? 'ok' : 'err'})">${res.verified ? a('verifiedOk') : a('notVerified')} — ${Mado.esc(Mado.normUrl(url))}</b>` +
    res.checks.map(c => `<span>${c.ok ? '✓' : '·'} ${names[c.method]}${c.ok ? '' : ': ' + Mado.esc(a(c.reason, c.arg))}</span>`).join('') +
    (profile ? '' : `<span>${a('noProfile')}</span>`) +
    (!res.verified && !cfg.remoteConfig.enabled ? `<span>${a('nip78Off')}</span>` : '');
};

/* ---------- Pestañas ---------- */
// Cada grupo de opciones en su pestaña; se recuerda la última abierta.
function showTab(id) {
  if (!$(`[data-panel="${id}"]`)) id = 'author';
  $$('#tabs [data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === id)));
  $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== id; });
  Mado.store.set('mado-admin-tab', id);
}
$$('#tabs [data-tab]').forEach(b => { b.onclick = () => showTab(b.dataset.tab); });
showTab(Mado.store.get('mado-admin-tab') || 'author');
$('#ver').textContent = 'Mado v' + Mado.VERSION;

applyTexts();   // también busca el perfil si ya hay npub
fill();
if (draft) msg(a('draftLoaded'));
})();
