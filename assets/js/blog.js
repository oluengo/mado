/* Mado — el blog público. Rutas con #/… para funcionar en GitHub Pages. */
(async function () {
'use strict';
const $ = s => document.querySelector(s);
const enc = encodeURIComponent;
const preview = new URLSearchParams(location.search).has('preview');
let cfg, T, pk, themes, layouts, fonts, layout, lang, listening = false;
const state = { posts: [], profile: null, ready: false, error: null, sig: '', verify: null };

try { cfg = await Mado.loadConfig({ preview }); }
catch { document.body.innerHTML = '<p style="padding:24px;font-family:sans-serif">No se pudo leer config.json.</p>'; return; }
themes = await Mado.loadThemes();
layouts = await Mado.loadLayouts();
fonts = await Mado.loadFonts();

async function start() {
  // Idioma: ?lang=xx en la URL > configuración ('auto' = navegador).
  const q = new URLSearchParams(location.search).get('lang');
  lang = Mado.resolveLang(q && Mado.LANGS()[q] ? q : cfg.site.lang === 'auto' ? null : cfg.site.lang);
  T = Mado.t(lang);
  document.documentElement.lang = lang;
  Mado.initMode(cfg.site.colorMode);
  // Tres piezas independientes: tema (colores), tipografía y diseño (estructura).
  Mado.applyTheme(themes.find(t => t.id === cfg.site.theme) || themes[0]);
  Mado.applyFont(fonts.find(f => f.id === cfg.site.font) || fonts[0]);
  const want = cfg.site.layout;
  layout = await Mado.useLayout(layouts.some(l => l.id === want) ? want : 'list');
  if (!cfg.author.npub) return renderSetup();
  try { pk = Mado.npubToHex(cfg.author.npub); } catch { return renderSetup(T.badNpub); }
  renderShell();
  if (!listening) {
    listening = true;
    window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
    // Vídeos de YouTube: se cargan solo al pulsar la miniatura (ratón o teclado).
    const play = e => { const el = e.target.closest && e.target.closest('.mado-yt:not(.is-playing)'); if (!el) return; e.preventDefault(); Mado.playYoutube(el); };
    document.addEventListener('click', play);
    document.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') play(e); });
    // Ir a las respuestas sin cambiar la ruta (#/post/…).
    document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('[data-ix-go]'); if (!a) return; e.preventDefault(); const r = $('#mado-replies'); if (r) r.scrollIntoView({ behavior: 'smooth' }); });
  }
  Mado.playLabel = T.playVideo;
  route();
  loadData();
}

/* ---------- Pantalla inicial si no hay npub ---------- */
function renderSetup(msg) {
  document.body.innerHTML = `<div class="mado-wrap mado-setup">
    <h1 class="mado-title">${T.setupTitle}</h1>
    <p class="mado-desc">${msg ? Mado.esc(msg) : T.setupText}</p>
    <p><a class="mado-btn" href="${Mado.url('admin.html')}">${T.setupAdmin}</a></p>
    <form id="mado-try"><label class="mado-desc">${T.tryNpub}</label>
      <div class="mado-row"><input id="mado-try-npub" placeholder="npub1…" autocomplete="off" required><button class="mado-btn">${T.tryBtn}</button></div>
    </form></div>`;
  $('#mado-try').onsubmit = e => { e.preventDefault(); cfg.author.npub = $('#mado-try-npub').value.trim(); start(); };
}

/* ---------- Estructura ---------- */
function renderShell() {
  // El diseño coloca estas piezas; cada una lleva su id y debe aparecer una vez.
  const parts = {
    brand: `<div class="mado-brand"><a class="mado-av mado-av-h" id="mado-av" target="_blank" rel="noopener"><img id="mado-logo" alt=""></a>
      <a class="mado-brand-text" href="#/"><h1 class="mado-title" id="mado-title"></h1><p class="mado-desc" id="mado-desc"></p></a></div>`,
    tools: `<div class="mado-tools">${cfg.site.langSwitch ? `<select class="mado-btn mado-lang" id="mado-lang" aria-label="${T.language}">${Object.entries(Mado.LANGS()).map(([k, n]) => `<option value="${k}"${k === lang ? ' selected' : ''}>${k.toUpperCase()} · ${n}</option>`).join('')}</select>` : ''}${cfg.site.modeToggle ? `<button class="mado-btn" id="mado-mode" title="${T.toggleMode}" aria-label="${T.toggleMode}">◐</button>` : ''}</div>`,
    nav: `<nav class="mado-nav" id="mado-nav"></nav>`,
    search: cfg.site.showSearch ? `<form class="mado-search" id="mado-search" role="search"><input type="search" placeholder="${T.searchPh}" aria-label="${T.search}"></form>` : '',
    aside: `<div class="mado-aside-tags" id="mado-aside-tags"></div>`,
    main: `<main id="mado-view"></main>`,
    footer: `<footer class="mado-footer" id="mado-footer"></footer>`
  };
  try { document.body.innerHTML = layout.shell(parts, ctx()); }
  catch { document.body.innerHTML = Mado.LAYOUT_DEFAULTS.shell(parts, ctx()); }
  if ($('#mado-mode')) $('#mado-mode').onclick = Mado.toggleMode;
  if ($('#mado-lang')) $('#mado-lang').onchange = e => setLang(e.target.value);
  if ($('#mado-search')) $('#mado-search').onsubmit = e => {
    e.preventDefault(); const q = e.target.querySelector('input').value.trim();
    location.hash = q ? '#/search/' + enc(q) : '#/';
  };
  renderBrand();
  renderAsideTags();
}

// Etiquetas más usadas, para los diseños que las muestran (p. ej. barra lateral).
function renderAsideTags() {
  const box = $('#mado-aside-tags'); if (!box) return;
  const counts = {};
  state.posts.forEach(p => p.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15);
  box.innerHTML = top.length ? `<h3 class="mado-aside-h">${T.tags}</h3><div class="mado-tagcloud">${top.map(([t, n]) => `<a class="mado-tag" href="${tagHref(t)}">#${Mado.esc(t)} <span>${n}</span></a>`).join('')}</div>` : '';
}

// Cambia de idioma sin recargar y deja ?lang= en la URL para poder compartirla.
function setLang(l) {
  try { const u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u); } catch {}
  lang = l; T = Mado.t(l); document.documentElement.lang = l;
  renderShell(); route();
}

function renderBrand() {
  const p = cfg.site.useProfile ? (state.profile || {}) : {};
  const title = cfg.site.title || p.display_name || p.name || 'Blog';
  const desc = cfg.site.description || (p.about ? p.about.split('\n')[0].slice(0, 160) : '');
  // Avatar: logo configurado > foto del perfil > avatar por defecto (Nostrich) > avestruz.
  const fallback = cfg.site.fallbackAvatar || Mado.DEFAULT_AVATAR;
  const logo = cfg.site.logo || p.picture || fallback;
  $('#mado-title').textContent = title;
  $('#mado-desc').textContent = desc;
  // Halo del avatar: verde = verificada, rojo = no verificada, sin halo = comprobando o en local.
  // Enlaza al perfil en njump, donde se comprueba de forma independiente.
  const npub = Mado.hexToNpub(pk), v = state.verify, njump = `https://njump.me/${npub}`;
  const st = !v || v.local ? '' : v.verified ? 'is-ok' : 'is-no';
  const tip = st === 'is-ok' ? `${T.verified} (${{ nip05: T.vNip05(v.detail), website: T.vWebsite, nip78: T.vNip78 }[v.method]}) · ${T.checkOutside}`
    : st === 'is-no' ? T.unverified : T.pending;
  const halo = `mado-halo ${st}`;
  const av = $('#mado-av');
  av.className = `mado-av mado-av-h ${halo}`; av.href = njump; av.title = tip; av.setAttribute('aria-label', tip);
  const img = $('#mado-logo');
  Mado.avatarFallback(img, fallback);
  if (img.getAttribute('src') !== logo) img.src = logo;
  const name = Mado.esc((state.profile || {}).name || npub.slice(0, 16) + '…');
  const how = st === 'is-ok' ? { nip05: T.vNip05(v.detail), website: T.vWebsite, nip78: T.vNip78 }[v.method] : '';
  const status = st ? `<span class="mado-vstate ${st}">${st === 'is-ok' ? `<b>✓</b> ${T.footOk} · ${Mado.esc(how)}` : `<b>✕</b> ${T.footNo}`}</span> · ` : '';
  $('#mado-footer').innerHTML = (cfg.site.footer ? `<p>${Mado.esc(cfg.site.footer)}</p>` : '') +
    `<p class="mado-footer-author">${T.by} <a class="mado-av mado-av-f ${halo}" href="${njump}" target="_blank" rel="noopener" title="${Mado.esc(tip)}" aria-label="${Mado.esc(tip)}"><img id="mado-flogo" src="${Mado.esc(logo)}" alt=""></a><a href="${njump}" target="_blank" rel="noopener">${name}</a></p>` +
    // Estado de la verificación y mención al proyecto original.
    (status ? `<p class="mado-credit">${status.replace(/ · $/, '')}</p>` : '') +
    `<p class="mado-credit">${T.madeWith} <a href="${Mado.PROJECT.url}" target="_blank" rel="noopener">${Mado.PROJECT.name}</a> <a class="mado-ver" href="${Mado.PROJECT.url}/releases" target="_blank" rel="noopener" title="${Mado.PROJECT.name} ${Mado.PROJECT.version}">v${Mado.PROJECT.version}</a> · <a href="${Mado.PROJECT.url}/blob/main/LICENSE" target="_blank" rel="noopener">${T.license}</a></p>`;
  Mado.avatarFallback($('#mado-flogo'), fallback);
  state.siteTitle = title;
  renderNav();
}

function renderNav() {
  const nav = $('#mado-nav'); if (!nav) return;
  const cur = location.hash || '#/';
  const links = [[T.home, '#/']];
  cfg.nav.sections.forEach(s => s.tag && links.push([s.label || '#' + s.tag, '#/tag/' + enc(Mado.normTag(s.tag))]));
  if (cfg.nav.showAllTags) links.push([T.tags, '#/tags']);
  if (cfg.nav.showAbout && state.profile && state.profile.about) links.push([T.about, '#/about']);
  nav.innerHTML = links.map(([l, h]) => `<a href="${h}"${(h === '#/' ? cur === '#/' || cur === '#' || /^#\/page\//.test(cur) : cur.startsWith(h)) ? ' class="active"' : ''}>${Mado.esc(l)}</a>`).join('') +
    cfg.nav.links.filter(l => l.url).map(l => `<a href="${Mado.esc(l.url)}" target="_blank" rel="noopener">${Mado.esc(l.label || l.url)} ↗</a>`).join('');
}

/* ---------- Datos ---------- */
async function loadData() {
  const kinds = [...new Set([...cfg.content.kinds, 5])];
  const key = `mado-cache:${pk}:${cfg.content.kinds.join(',')}:${cfg.content.maxPosts}`, pkey = `mado-profile:${pk}`;
  const cache = Mado.store.get(key), pcache = Mado.store.get(pkey);
  if (pcache) { state.profile = pcache.data; renderBrand(); }
  if (cache) ingest(cache.data);
  const ttl = cfg.advanced.cacheMinutes * 60000;
  if (cache && pcache && Date.now() - cache.ts < ttl) return runVerify();
  try {
    const [events, meta] = await Promise.all([
      Mado.fetchMany(cfg.relays, { authors: [pk], kinds }, cfg.content.maxPosts, cfg.advanced.timeoutMs),
      Mado.query(cfg.relays, { authors: [pk], kinds: [0], limit: 2 }, { timeout: cfg.advanced.timeoutMs })
    ]);
    const m = meta.filter(e => e.pubkey === pk).sort((a, b) => b.created_at - a.created_at)[0];
    if (m) { try { state.profile = JSON.parse(m.content); Mado.store.set(pkey, { ts: Date.now(), data: state.profile }); } catch {} }
    const own = events.filter(e => e.pubkey === pk);
    if (own.length || !cache) { Mado.store.set(key, { ts: Date.now(), data: own }); ingest(own); }
  } catch (e) {
    if (!cache) { state.error = e.message || 'error'; state.ready = true; route(); }
  }
  renderBrand();
  runVerify();
}

/* ---------- Verificación de la web ---------- */
async function runVerify() {
  // Solo en las demos empaquetadas se puede forzar el estado para ver el aspecto.
  if (window.MADO_BUNDLE && typeof window.MADO_FORCE_VERIFY === 'boolean') {
    state.verify = window.MADO_FORCE_VERIFY ? { verified: true, method: 'nip05', detail: '_@ejemplo.github.io' } : { verified: false };
    return renderBrand();
  }
  if (Mado.isLocal() || preview) { state.verify = { verified: false, local: true }; return renderBrand(); }
  const here = Mado.normUrl(location.href), key = `mado-verify:${pk}:${here}`;
  const c = Mado.store.get(key);
  if (c && Date.now() - c.ts < cfg.advanced.cacheMinutes * 60000) state.verify = c.data;
  else {
    state.verify = await Mado.checkOwnership({ pk, profile: state.profile, signedUrl: Mado.signedSiteUrl, here, host: location.hostname });
    Mado.store.set(key, { ts: Date.now(), data: state.verify });
  }
  renderBrand();
}

function ingest(events) {
  const posts = processEvents(events);
  const sig = posts.map(p => p.id).join();
  state.ready = true;
  if (sig === state.sig) return;
  state.posts = posts; state.sig = sig;
  renderAsideTags();
  route();
}

function processEvents(events) {
  const deleted = new Set();
  events.forEach(e => { if (e.kind === 5) e.tags.forEach(t => { if (t[0] === 'e' || t[0] === 'a') deleted.add(t[1]); }); });
  const map = new Map();
  for (const e of events) {
    if (e.kind === 5 || !cfg.content.kinds.includes(e.kind) || deleted.has(e.id)) continue;
    const repl = e.kind >= 30000 && e.kind < 40000;
    const key = repl ? `${e.kind}:${e.pubkey}:${Mado.tag(e, 'd') || ''}` : e.id;
    if (repl && deleted.has(key)) continue;
    const prev = map.get(key);
    if (!prev || e.created_at > prev.created_at) map.set(key, e);
  }
  const c = cfg.content, inc = c.includeTags.map(Mado.normTag).filter(Boolean), exc = c.excludeTags.map(Mado.normTag).filter(Boolean);
  return [...map.values()].map(toPost).filter(p => {
    if (c.hideReplies && p.isReply) return false;
    if (exc.some(t => p.tags.includes(t))) return false;
    if (inc.length) return c.tagMode === 'all' ? inc.every(t => p.tags.includes(t)) : inc.some(t => p.tags.includes(t));
    return true;
  }).sort((a, b) => cfg.site.order === 'asc' ? a.date - b.date : b.date - a.date);
}

function toPost(e) {
  const isArticle = e.kind === 30023, d = Mado.tag(e, 'd');
  // Los hashtags se comparan en minúsculas: los relays distinguen mayúsculas.
  const tags = [...new Set(e.tags.filter(t => t[0] === 't' && t[1]).map(t => Mado.normTag(t[1])))];
  if (!isArticle) for (const m of (e.content || '').matchAll(/(?:^|\s)#([\p{L}\p{N}_]+)/gu)) { const t = Mado.normTag(m[1]); if (!tags.includes(t)) tags.push(t); }
  return {
    id: e.id, kind: e.kind, isArticle, slug: isArticle && d ? d : e.id, d,
    title: isArticle ? (Mado.tag(e, 'title') || T.untitled) : '',
    summary: Mado.tag(e, 'summary') || '', image: Mado.tag(e, 'image') || '',
    content: e.content || '', date: +Mado.tag(e, 'published_at') || e.created_at, tags,
    isReply: e.kind === 1 && e.tags.some(t => t[0] === 'e' && t[3] !== 'mention'),
    pubkey: e.pubkey, media: Mado.imeta(e)
  };
}

/* ---------- Rutas ---------- */
function route() {
  const parts = (location.hash.replace(/^#\/?/, '')).split('/').filter(Boolean).map(decodeURIComponent);
  renderNav();
  const s = $('#mado-search input'); if (s && parts[0] !== 'search') s.value = '';
  switch (parts[0]) {
    case 'post': return viewPost(parts.slice(1).join('/'));
    case 'tag': return viewList({ tag: Mado.normTag(parts[1]), page: pageOf(parts, 2) });
    case 'tags': return viewTags();
    case 'search': if (s) s.value = parts.slice(1).join('/'); return viewList({ q: parts.slice(1).join('/'), page: pageOf(parts, 2) });
    case 'about': return viewAbout();
    default: return viewList({ page: pageOf(parts, 0) });
  }
}
const pageOf = (parts, i) => parts[i] === 'page' ? Math.max(1, +parts[i + 1] || 1) : 1;
const tagHref = t => '#/tag/' + enc(Mado.normTag(t));
const postHref = p => '#/post/' + enc(p.slug);
const view = html => { $('#mado-view').innerHTML = html; };
const status = msg => view(`<p class="mado-status">${msg}</p>`);
const setTitle = t => { document.title = t ? `${t} · ${state.siteTitle}` : state.siteTitle; };

function notReady() {
  if (!state.ready) { status(T.loading); return true; }
  if (state.error && !state.posts.length) { status(`${T.error}.`); return true; }
  return false;
}

function viewList({ tag, q, page }) {
  if (notReady()) return;
  let list = state.posts, heading = '', base = '';
  if (tag) { list = list.filter(p => p.tags.includes(tag)); heading = '#' + tag; base = '#/tag/' + enc(tag); setTitle('#' + tag); }
  else if (q) {
    const s = q.toLowerCase();
    list = list.filter(p => (p.title + ' ' + p.summary + ' ' + p.content).toLowerCase().includes(s));
    heading = T.results(list.length, q); base = '#/search/' + enc(q); setTitle(q);
  } else {
    const pins = layout.options.pinFirst ? cfg.content.pinned.map(String) : [];
    if (pins.length) {
      const pinned = pins.map(id => list.find(p => p.slug === id || p.id === id)).filter(Boolean);
      list = [...pinned.map(p => ({ ...p, pinned: true })), ...list.filter(p => !pinned.includes(p))];
    }
    setTitle('');
  }
  const per = Math.max(1, +cfg.site.perPage || 10), pages = Math.max(1, Math.ceil(list.length / per));
  page = Math.min(page, pages);
  const items = list.slice((page - 1) * per, page * per);
  view((heading ? `<h2 class="mado-heading">${Mado.esc(heading)}</h2>` : '') +
    (items.length ? renderList(items, { page, pages, home: !tag && !q }) : `<p class="mado-status">${T.empty}</p>`) +
    pager(page, pages, base));
  if (items.length) loadIx(items, false);
}

// Lo que recibe un diseño para pintar: piezas ya hechas y utilidades.
function ctx(extra = {}) {
  return {
    lang, T, cfg, esc: Mado.esc, href: postHref, tagHref,
    item: p => (layout.item || itemHtml)(p, ctx(extra)), defaultItem: itemHtml,
    meta: metaHtml, tags: tagsHtml, excerpt, ix: p => ixSlot(p, false),
    date: p => Mado.fmtDate(p.date, cfg.site.dateFormat, lang), month: p => Mado.fmtMonth(p.date, lang),
    cover: p => p.image ? `<a class="mado-cover-link" href="${postHref(p)}" tabindex="-1"><img class="mado-cover" src="${Mado.esc(p.image)}" alt="" loading="lazy"></a>` : '',
    ...extra
  };
}
function renderList(items, extra) {
  try { return layout.list(items, ctx(extra)); }
  catch (e) { console.error('Mado layout:', e); return Mado.LAYOUT_DEFAULTS.list(items, { item: itemHtml }); }
}

function metaHtml(p) {
  const bits = [];
  if (p.pinned) bits.push(`<span class="mado-pin">${T.pinned}</span>`);
  bits.push(`<time datetime="${new Date(p.date * 1000).toISOString()}">${Mado.fmtDate(p.date, cfg.site.dateFormat, lang)}</time>`);
  if (p.isArticle && cfg.site.showReadingTime) bits.push(`<span>${T.minRead(Mado.readingTime(p.content))}</span>`);
  return `<div class="mado-meta">${bits.join('')}</div>`;
}
const tagsHtml = p => cfg.site.showTags && p.tags.length
  ? `<div class="mado-tags">${p.tags.map(t => `<a class="mado-tag" href="${tagHref(t)}">#${Mado.esc(t)}</a>`).join('')}</div>` : '';
function excerpt(p) {
  if (p.summary) return p.summary;
  const s = Mado.stripMd(p.content), n = +cfg.site.excerptLength || 220;
  return s.length > n ? s.slice(0, n).replace(/\s\S*$/, '') + '…' : s;
}

function itemHtml(p) {
  if (!p.isArticle) {
    return `<article class="mado-item mado-note${p.pinned ? ' is-pinned' : ''}"><a class="mado-note-link" href="${postHref(p)}">${metaHtml(p)}</a>
      <div class="mado-text">${Mado.linkify(p.content, tagHref, p.media)}</div>${tagsHtml(p)}${ixSlot(p, false)}</article>`;
  }
  const url = postHref(p);
  return `<article class="mado-item${p.pinned ? ' is-pinned' : ''}${p.image ? ' has-cover' : ''}">
    ${ctx().cover(p)}
    <div class="mado-item-body">
      <h2><a href="${url}">${Mado.esc(p.title)}</a></h2>
      ${metaHtml(p)}
      <p class="mado-excerpt">${Mado.esc(excerpt(p))}</p>
      ${tagsHtml(p)}${ixSlot(p, false)}
    </div></article>`;
}

function pager(page, pages, base) {
  if (pages <= 1) return '';
  const href = n => n === 1 ? (base || '#/') : `${base || '#'}/page/${n}`;
  const asc = cfg.site.order === 'asc';
  return `<nav class="mado-pager">
    <span>${page > 1 ? `<a href="${href(page - 1)}">${asc ? T.prevAsc : T.prev}</a>` : ''}</span>
    <span class="mado-pager-info">${T.page(page, pages)}</span>
    <span>${page < pages ? `<a href="${href(page + 1)}">${asc ? T.nextAsc : T.next}</a>` : ''}</span></nav>`;
}

async function viewPost(slug) {
  let p = state.posts.find(x => x.slug === slug || x.id === slug);
  if (!p) {
    if (!state.ready) return status(T.loading);
    status(T.loading);
    // Puede estar fuera del límite o de los filtros: se pide directamente (solo del autor).
    const f = /^[0-9a-f]{64}$/.test(slug) ? { ids: [slug], authors: [pk] } : { authors: [pk], kinds: [30023], '#d': [slug] };
    const ev = (await Mado.query(cfg.relays, f, { timeout: cfg.advanced.timeoutMs })).filter(e => e.pubkey === pk).sort((a, b) => b.created_at - a.created_at)[0];
    if (decodeURIComponent(location.hash.replace(/^#\/post\//, '')) !== slug) return;
    if (!ev) return status(T.notFound);
    p = toPost(ev);
  }
  const nostrId = p.isArticle && p.d ? Mado.naddr(p.kind, p.pubkey, p.d) : Mado.nevent(p.id, p.pubkey);
  setTitle(p.title || Mado.stripMd(p.content).slice(0, 60));
  view(`<article class="mado-post${p.isArticle ? '' : ' mado-post-note'}">
    ${p.isArticle ? `<h1>${Mado.esc(p.title)}</h1>` : ''}
    ${metaHtml(p)}
    ${p.image ? `<img class="mado-cover mado-post-cover" src="${Mado.esc(p.image)}" alt="">` : ''}
    ${p.isArticle && p.summary ? `<p class="mado-lead">${Mado.esc(p.summary)}</p>` : ''}
    <div class="mado-body">${p.isArticle ? Mado.md(p.content, p.media) : `<div class="mado-text">${Mado.linkify(p.content, tagHref, p.media)}</div>`}</div>
    ${tagsHtml(p)}
    ${ixSlot(p, true)}
    <div class="mado-actions">
      <a href="#/" onclick="if(history.length>1){history.back();return false}">${T.back}</a>
      <a href="https://njump.me/${nostrId}" target="_blank" rel="noopener">${T.openNostr}</a>
      <button class="mado-btn" id="mado-copy">${T.copy}</button>
    </div>
    ${ixOn().replyList ? `<section class="mado-replies" id="mado-replies" data-for="${p.id}"><h2 class="mado-replies-h">${T.ixReplies}</h2><p class="mado-status">${T.loading}</p></section>` : ''}
    </article>`);
  loadIx([p], true, nostrId);
  $('#mado-copy').onclick = async e => {
    try { await navigator.clipboard.writeText(location.href); e.target.textContent = T.copied; } catch {}
  };
}

/* ---------- Interacciones ---------- */
const ixMem = {}, profMem = {};
const ixOn = () => cfg.interactions || {};
const ixAny = () => { const o = ixOn(); return o.reactions || o.replies || o.zaps || o.quotes || o.reposts; };
// Hueco donde se pintan los contadores; se rellena cuando llegan los datos.
function ixSlot(p, full) {
  if (!ixAny() || (!full && !ixOn().inList)) return '';
  return `<div class="mado-ix" data-ix="${p.id}" hidden></div>`;
}
const ICON = {
  reactions: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  replies: '<path d="M5 5h14v10H9l-4 4z"/>',
  reposts: '<path d="M7 7h10l-3-3M17 17H7l3 3M17 7v5M7 17v-5"/>',
  quotes: '<path d="M6 17c2-1 3-3 3-6V7H5v4h4M15 17c2-1 3-3 3-6V7h-4v4h4"/>',
  zaps: '<path d="M13 3 6 13h5l-1 8 7-10h-5z"/>'
};
const icon = k => `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;
const coordOf = p => p.isArticle && p.d ? `${p.kind}:${p.pubkey}:${p.d}` : '';

function ixBar(p, s, full) {
  const o = ixOn(), n = v => Mado.fmtCount(v, lang), out = [];
  const add = (k, v, label, text) => { if (o[k] && v > 0) out.push(`<span class="mado-ix-i mado-ix-${k}" title="${Mado.esc(label)}" aria-label="${Mado.esc(label)}">${icon(k)}<span>${text}</span></span>`); };
  const emo = Object.entries(s.emojis || {}).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([e, c]) => `${e} ${c}`).join('  ');
  add('reactions', s.reactions, T.ixReactionsN(s.reactions) + (emo ? ` · ${emo}` : ''), n(s.reactions));
  if (o.replies && s.replies > 0) {
    const label = Mado.esc(T.ixRepliesN(s.replies));
    out.push(full ? `<a class="mado-ix-i mado-ix-replies" href="#mado-replies" data-ix-go title="${label}" aria-label="${label}">${icon('replies')}<span>${n(s.replies)}</span></a>`
      : `<a class="mado-ix-i mado-ix-replies" href="${postHref(p)}" title="${label}" aria-label="${label}">${icon('replies')}<span>${n(s.replies)}</span></a>`);
  }
  add('reposts', s.reposts, T.ixRepostsN(s.reposts), n(s.reposts));
  add('quotes', s.quotes, T.ixQuotesN(s.quotes), n(s.quotes));
  add('zaps', s.zaps, T.ixZapsN(s.zaps, n(s.sats)), s.sats ? n(s.sats) : n(s.zaps));
  return out.join('');
}

function paintIx(p, s, full) {
  document.querySelectorAll(`.mado-ix[data-ix="${p.id}"]`).forEach(el => {
    const html = ixBar(p, s, full);
    el.innerHTML = html; el.hidden = !html;
  });
}

const summary = d => ({ reactions: d.reactions, emojis: d.emojis, replies: d.replies.length, zaps: d.zaps, sats: d.sats, quotes: d.quotes, reposts: d.reposts });

async function loadIx(posts, full, nostrId) {
  const o = ixOn();
  if (!ixAny() && !(full && o.replyList)) return;
  if (!full && !o.inList) return;
  const ttl = cfg.advanced.cacheMinutes * 60000, todo = [];
  for (const p of posts) {
    const c = ixMem[p.id] || Mado.store.get('mado-ix:' + p.id);
    if (c) paintIx(p, c.data, full);
    if (full || !c || Date.now() - c.ts >= ttl) todo.push(p);
  }
  if (!todo.length) return;
  let res;
  try { res = await Mado.fetchInteractions(cfg.relays, todo.map(p => ({ id: p.id, coord: coordOf(p) })), { ...o, replyList: full && o.replyList }, cfg.advanced.timeoutMs); }
  catch { return; }
  for (const p of todo) {
    const s = summary(res[p.id]), c = { ts: Date.now(), data: s };
    ixMem[p.id] = c; Mado.store.set('mado-ix:' + p.id, c);
    paintIx(p, s, full);
  }
  if (full && o.replyList) renderReplies(todo[0], res[todo[0].id].replies, nostrId);
}

async function renderReplies(p, replies, nostrId) {
  const box = document.getElementById('mado-replies');
  if (!box || box.dataset.for !== p.id) return;
  const foot = `<p class="mado-replies-foot"><a href="https://njump.me/${nostrId}" target="_blank" rel="noopener">${T.ixReplyOn}</a></p>`;
  const head = `<h2 class="mado-replies-h">${T.ixReplies}${replies.length ? ` <span>${replies.length}</span>` : ''}</h2>`;
  if (!replies.length) { box.innerHTML = head + `<p class="mado-status">${T.ixNoReplies}</p>` + foot; return; }
  // Perfiles de quienes responden (nombre y foto).
  const want = [...new Set(replies.map(e => e.pubkey))].filter(k => !profMem[k]).slice(0, 150);
  if (want.length) {
    try {
      const metas = await Mado.query(cfg.relays, { kinds: [0], authors: want }, { timeout: cfg.advanced.timeoutMs });
      metas.sort((a, b) => a.created_at - b.created_at).forEach(m => { try { profMem[m.pubkey] = JSON.parse(m.content); } catch {} });
    } catch {}
    want.forEach(k => { if (!profMem[k]) profMem[k] = {}; });
  }
  if (box.dataset.for !== p.id || !document.body.contains(box)) return;
  // Hilo: cada respuesta cuelga de su padre; si el padre no está, va al primer nivel.
  const ids = new Set(replies.map(e => e.id)), kids = {};
  replies.forEach(e => { const par = Mado.replyParent(e); const k = par && ids.has(par) && par !== e.id ? par : ''; (kids[k] = kids[k] || []).push(e); });
  const fallback = cfg.site.fallbackAvatar || Mado.DEFAULT_AVATAR;
  const one = (e, depth) => {
    const pr = profMem[e.pubkey] || {}, npub = Mado.hexToNpub(e.pubkey);
    const name = Mado.esc(pr.display_name || pr.name || npub.slice(0, 12) + '…');
    const pic = Mado.esc(pr.picture || fallback);
    const sub = (kids[e.id] || []).map(c => one(c, depth + 1)).join('');
    return `<div class="mado-reply${depth ? ' is-sub' : ''}">
      <div class="mado-reply-head"><a class="mado-reply-av" href="https://njump.me/${npub}" target="_blank" rel="noopener"><img src="${pic}" alt="" loading="lazy" data-fb></a>
        <a class="mado-reply-name" href="https://njump.me/${npub}" target="_blank" rel="noopener">${name}</a>
        <a class="mado-reply-date" href="https://njump.me/${Mado.nevent(e.id, e.pubkey)}" target="_blank" rel="noopener">${Mado.fmtDate(e.created_at, 'relative', lang)}</a></div>
      <div class="mado-text mado-reply-text">${Mado.linkify(e.content, tagHref, Mado.imeta(e))}</div>
      ${sub ? `<div class="mado-reply-kids${depth >= 3 ? ' is-flat' : ''}">${sub}</div>` : ''}</div>`;
  };
  box.innerHTML = head + `<div class="mado-reply-list">${(kids[''] || []).map(e => one(e, 0)).join('')}</div>` + foot;
  box.querySelectorAll('img[data-fb]').forEach(i => Mado.avatarFallback(i, fallback));
}

function viewTags() {
  if (notReady()) return;
  const counts = {};
  state.posts.forEach(p => p.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  const list = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  setTitle(T.tags);
  view(`<h2 class="mado-heading">${T.tags}</h2>` + (list.length
    ? `<div class="mado-tagcloud">${list.map(([t, n]) => `<a class="mado-tag" href="${tagHref(t)}">#${Mado.esc(t)} <span>${n}</span></a>`).join('')}</div>`
    : `<p class="mado-status">${T.empty}</p>`));
}

function viewAbout() {
  const p = state.profile;
  if (!p) return status(state.ready ? T.notFound : T.loading);
  const npub = Mado.hexToNpub(pk);
  setTitle(T.about);
  view(`<section class="mado-about">
    <img class="mado-avatar" id="mado-about-av" src="${Mado.esc(p.picture || cfg.site.fallbackAvatar || Mado.DEFAULT_AVATAR)}" alt="">
    <h2 class="mado-about-name">${Mado.esc(p.display_name || p.name || '')}</h2>
    ${p.nip05 ? `<p class="mado-meta">${Mado.esc(p.nip05)}</p>` : ''}
    <div class="mado-text">${Mado.linkify(p.about || '', tagHref)}</div>
    <div class="mado-actions">
      ${p.website ? `<a href="${Mado.esc(p.website)}" target="_blank" rel="noopener">${Mado.esc(p.website.replace(/^https?:\/\//, ''))} ↗</a>` : ''}
      <a href="https://njump.me/${npub}" target="_blank" rel="noopener">${T.openNostr}</a>
    </div></section>`);
  Mado.avatarFallback($('#mado-about-av'), cfg.site.fallbackAvatar || Mado.DEFAULT_AVATAR);
}

start();
})();
