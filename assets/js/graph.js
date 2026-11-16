/* Mado — grafo social animado (página «Sobre mí»).
   Red viva: el autor en el centro, la gente que sigue alrededor y las conexiones entre ellos
   (quién sigue a quién), así que se forman grupos. Los mutuos brillan y por sus líneas viajan
   destellos. Al pasar por un nodo se ilumina su vecindad; se puede arrastrar, mover el fondo y
   hacer zoom (botones o Ctrl/pellizco). Tocar un nodo abre su perfil en njump.me.
   Sin librerías: canvas y una simulación de fuerzas. Se carga solo si nav.socialGraph está activado. */
(function () {
'use strict';

Mado.drawGraph = function (box, data, opts) {
  const { center, label, open, t = {} } = opts;
  const canvas = document.createElement('canvas'), tip = document.createElement('div'), ui = document.createElement('div');
  canvas.className = 'mado-graph-canvas'; tip.className = 'mado-graph-tip'; tip.hidden = true; ui.className = 'mado-graph-ui';
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', opts.aria || '');
  ui.innerHTML = `<button type="button" data-z="in" title="${t.zoomIn || '+'}" aria-label="${t.zoomIn || '+'}">+</button>` +
    `<button type="button" data-z="out" title="${t.zoomOut || '−'}" aria-label="${t.zoomOut || '−'}">−</button>` +
    `<button type="button" data-z="fit" title="${t.reset || '⟲'}" aria-label="${t.reset || '⟲'}">⟲</button>`;
  box.append(canvas, ui, tip);
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, alpha = 1, raf = 0, hover = null, drag = null, pan = null, moved = false, visible = true, t0 = performance.now();
  const view = { k: 1, x: 0, y: 0 };
  let colors = {};
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement), v = n => cs.getPropertyValue(n).trim();
    colors = { accent: v('--accent') || '#7b3fe4', line: v('--line') || '#ddd', bg: v('--card') || v('--bg') || '#fff', fg: v('--fg') || '#222', soft: v('--accent-bg') || '#eee' };
  };
  readColors();

  /* ---------- Nodos y conexiones ---------- */
  const many = data.nodes.length > 70 ? 0.85 : 1;
  const nodes = [{ ...center, center: true, r: 28 }, ...data.nodes.map(d => ({ ...d, r: (d.mutual ? 15 : 11) * many }))];
  const byPk = new Map(nodes.map(d => [d.pk, d]));
  const links = (data.links || []).map(([a, b]) => [byPk.get(a), byPk.get(b)]).filter(([a, b]) => a && b);
  const adj = new Map(nodes.map(d => [d, new Set()]));
  links.forEach(([a, b]) => { adj.get(a).add(b); adj.get(b).add(a); });
  nodes.forEach(d => { if (!d.center) { adj.get(d).add(nodes[0]); adj.get(nodes[0]).add(d); } d.deg = adj.get(d).size; });
  // Salen del centro en espiral, escalonados (animación de entrada).
  nodes.forEach((d, i) => {
    d.s = 0; d.born = d.center ? 0 : 120 + i * 14;
    if (d.center) { d.x = d.y = 0; return; }
    const a = i * 2.39996, rr = 30 + Math.sqrt(i) * 6;
    d.x = Math.cos(a) * rr; d.y = Math.sin(a) * rr; d.vx = d.vy = 0;
    d.phase = Math.random() * Math.PI * 2; d.speed = 0.25 + Math.random() * 0.35;
  });
  nodes.forEach(d => {
    if (!d.picture) return;
    const img = new Image(); img.referrerPolicy = 'no-referrer'; img.decoding = 'async';
    img.onload = () => { d.img = img; if (!raf) draw(); };
    img.src = d.picture;
  });

  function size() {
    W = box.clientWidth || 600; H = Math.round(Math.min(600, Math.max(340, W * 0.78)));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }

  /* ---------- Física ---------- */
  function tick(now) {
    const R = Math.min(W, H) / 2 - 24, ringM = R * 0.45, ringO = R * 0.86;
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy || 0.01; const d = Math.sqrt(d2);
        let f = 1100 / d2; const min = a.r + b.r + 6;
        if (d < min) f += (min - d) * 0.6;
        dx /= d; dy /= d;
        a.vx += dx * f * alpha; a.vy += dy * f * alpha; b.vx -= dx * f * alpha; b.vy -= dy * f * alpha;
      }
      // Anillo: mutuos dentro, el resto fuera; los muy conectados un poco más cerca.
      const d = Math.hypot(a.x, a.y) || 0.01, L = (a.mutual ? ringM : ringO) * (1 - Math.min(0.25, a.deg * 0.015));
      const k = (d - L) * 0.035 * alpha;
      a.vx -= a.x / d * k; a.vy -= a.y / d * k;
      const c = a.r + nodes[0].r + 10;
      if (d < c) { a.vx += a.x / d * (c - d) * 0.4; a.vy += a.y / d * (c - d) * 0.4; }
    }
    // Conexiones entre seguidos: muelles suaves, forman grupos.
    for (const [a, b] of links) {
      if (a.center || b.center) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, k = (d - 90) * 0.0012 * alpha;
      a.vx += dx / d * k; a.vy += dy / d * k; b.vx -= dx / d * k; b.vy -= dy / d * k;
    }
    // Siempre algo vivo: deriva lenta de cada nodo (se apaga con «reducir movimiento»).
    const live = reduce ? 0 : 0.035;
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i];
      if (a === drag) { a.vx = a.vy = 0; continue; }
      a.vx += Math.cos(now / 1000 * a.speed + a.phase) * live; a.vy += Math.sin(now / 1100 * a.speed + a.phase) * live;
      a.vx *= 0.86; a.vy *= 0.86; a.x += a.vx; a.y += a.vy;
      const bx = W / 2 - a.r - 6, by = H / 2 - a.r - 6; // dentro del recuadro
      if (a.x > bx) { a.x = bx; a.vx *= -0.3; } else if (a.x < -bx) { a.x = -bx; a.vx *= -0.3; }
      if (a.y > by) { a.y = by; a.vy *= -0.3; } else if (a.y < -by) { a.y = -by; a.vy *= -0.3; }
    }
    alpha = Math.max(reduce ? 0 : 0.06, alpha * 0.985);
  }

  /* ---------- Dibujo ---------- */
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  function avatar(d, r) {
    ctx.save(); ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2); ctx.closePath();
    if (d.img) { ctx.clip(); ctx.drawImage(d.img, d.x - r, d.y - r, r * 2, r * 2); }
    else {
      ctx.fillStyle = colors.soft; ctx.fill();
      const ch = (d.name || '').trim()[0];
      if (ch) { ctx.fillStyle = colors.accent; ctx.font = `600 ${Math.round(r)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch.toUpperCase(), d.x, d.y + 1); }
    }
    ctx.restore();
  }
  function draw(now = performance.now()) {
    const el = now - t0, focus = hover || drag, near = focus ? adj.get(focus) : null;
    const lit = d => !focus || d === focus || near.has(d);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // Halo suave detrás del autor.
    const g = ctx.createRadialGradient(W / 2 + view.x, H / 2 + view.y, 0, W / 2 + view.x, H / 2 + view.y, Math.min(W, H) * 0.5 * view.k);
    g.addColorStop(0, colors.soft); g.addColorStop(1, colors.bg);
    ctx.globalAlpha = 0.7; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    ctx.setTransform(dpr * view.k, 0, 0, dpr * view.k, dpr * (W / 2 + view.x), dpr * (H / 2 + view.y));
    const c = nodes[0];
    // Líneas: autor → cada persona, y conexiones entre ellas.
    ctx.lineCap = 'round';
    for (let i = 1; i < nodes.length; i++) {
      const d = nodes[i], s = ease((el - d.born) / 500); if (!s) continue;
      const on = focus && (d === focus || focus.center);
      ctx.globalAlpha = (focus ? (on ? 0.9 : 0.06) : d.mutual ? 0.45 : 0.18) * s;
      ctx.strokeStyle = d.mutual || on ? colors.accent : colors.line; ctx.lineWidth = (on ? 1.8 : 1) / view.k;
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + (d.x - c.x) * s, c.y + (d.y - c.y) * s); ctx.stroke();
    }
    for (const [a, b] of links) {
      const s = ease((el - Math.max(a.born, b.born) - 300) / 600); if (!s) continue;
      const on = focus && (a === focus || b === focus);
      ctx.globalAlpha = (focus ? (on ? 0.75 : 0.04) : 0.16) * s;
      ctx.strokeStyle = on ? colors.accent : colors.line; ctx.lineWidth = (on ? 1.4 : 0.8) / view.k;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    // Destellos que viajan entre el autor y sus mutuos (y por las líneas del nodo enfocado).
    if (!reduce) {
      ctx.fillStyle = colors.accent;
      const pulse = (a, b, speed, off) => {
        const p = ((now / 1000) * speed + off) % 1, x = a.x + (b.x - a.x) * p, y = a.y + (b.y - a.y) * p;
        ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9; ctx.beginPath(); ctx.arc(x, y, 2.2 / view.k, 0, Math.PI * 2); ctx.fill();
      };
      for (let i = 1; i < nodes.length; i++) {
        const d = nodes[i];
        if (el < d.born + 600) continue;
        if (focus ? (d === focus || (focus.center && d.mutual)) : d.mutual) pulse(d, c, d.speed * 0.5, d.phase);
      }
      if (focus && !focus.center) near.forEach(o => { if (!o.center) pulse(focus, o, 0.4, o.phase); });
    }
    // Nodos (los enfocados encima, crecen suavemente).
    const order = nodes.slice(1).sort((a, b) => (a === focus) - (b === focus) || (near ? near.has(a) - near.has(b) : 0));
    for (const d of [...order, c]) {
      const born = ease((el - d.born) / 450); if (!born) continue;
      const target = d === focus ? 1.35 : near && near.has(d) ? 1.12 : 1;
      d.s += (target - d.s) * 0.2 || 0; if (!d.s) d.s = target;
      const r = d.r * d.s * born;
      ctx.globalAlpha = lit(d) ? 1 : 0.22;
      if (d.mutual || d.center) {
        const glow = d.center ? 18 : 10 + Math.sin(now / 600 + (d.phase || 0)) * 3;
        ctx.save(); ctx.shadowColor = colors.accent; ctx.shadowBlur = reduce ? 8 : glow; ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = colors.bg; ctx.fill(); ctx.restore();
      }
      avatar(d, r);
      ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = d.center || d.mutual || d === focus ? colors.accent : colors.line;
      ctx.lineWidth = (d.center ? 3 : d.mutual ? 2 : 1.2) / view.k; ctx.stroke();
      // Nombre: del nodo enfocado y, con zoom, de los mutuos.
      if (d.name && (d === focus || (view.k > 1.5 && d.mutual && !focus))) {
        ctx.globalAlpha = lit(d) ? 0.95 : 0.3; ctx.fillStyle = colors.fg; ctx.font = `500 ${11 / view.k}px system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(d.name.slice(0, 24), d.x, d.y + r + 4 / view.k);
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    raf = 0;
    if (!visible) return;
    tick(now); draw(now);
    if (!reduce || drag || alpha > 0.02 || now - t0 < 2500) raf = requestAnimationFrame(loop);
  }
  const heat = (a = 0.4) => { alpha = Math.max(alpha, a); if (!raf) raf = requestAnimationFrame(loop); };

  /* ---------- Interacción ---------- */
  const toWorld = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left - W / 2 - view.x) / view.k, y: (e.clientY - r.top - H / 2 - view.y) / view.k, sx: e.clientX, sy: e.clientY }; };
  const hit = p => { for (let i = nodes.length - 1; i >= 0; i--) { const d = nodes[i]; if (Math.hypot(d.x - p.x, d.y - p.y) <= d.r * (d.s || 1) + 4 / view.k) return d; } return null; };
  function showTip(d) {
    if (!d) { tip.hidden = true; return; }
    tip.textContent = label(d); tip.hidden = false;
    const x = W / 2 + view.x + d.x * view.k, y = H / 2 + view.y + d.y * view.k;
    tip.style.left = Math.max(4, Math.min(W - tip.offsetWidth - 4, x - tip.offsetWidth / 2)) + 'px';
    tip.style.top = Math.max(0, y - d.r * view.k * 1.4 - 32) + 'px';
  }
  canvas.addEventListener('pointermove', e => {
    const p = toWorld(e);
    if (drag) { moved = moved || Math.hypot(p.x - drag.x, p.y - drag.y) > 3 / view.k; drag.x = p.x; drag.y = p.y; heat(0.25); showTip(drag); return; }
    if (pan) { view.x = pan.vx + (e.clientX - pan.sx); view.y = pan.vy + (e.clientY - pan.sy); moved = true; heat(0.05); return; }
    const h = hit(p);
    if (h !== hover) { hover = h; canvas.style.cursor = h ? 'pointer' : 'grab'; showTip(h); heat(0.05); }
  });
  canvas.addEventListener('pointerleave', () => { if (!drag && !pan) { hover = null; showTip(null); heat(0.05); } });
  canvas.addEventListener('pointerdown', e => {
    const p = toWorld(e), h = hit(p); moved = false;
    canvas.setPointerCapture(e.pointerId);
    if (h && !h.center) { drag = h; hover = h; showTip(h); heat(0.3); }
    else if (h) { hover = h; }
    else { pan = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y }; canvas.style.cursor = 'grabbing'; }
  });
  canvas.addEventListener('pointerup', e => {
    const d = drag || (!pan && hover); drag = null; pan = null; canvas.style.cursor = 'grab';
    if (d && !moved) open(d);
    if (e.pointerType !== 'mouse') { hover = null; showTip(null); }
    heat(0.05);
  });
  // Zoom: botones, o rueda con Ctrl/⌘ (y el pellizco del trackpad); la rueda sola sigue desplazando la página.
  const zoomAt = (f, sx = W / 2, sy = H / 2) => {
    const k = Math.min(3, Math.max(0.5, view.k * f)); f = k / view.k;
    view.x = (view.x - (sx - W / 2)) * f + (sx - W / 2); view.y = (view.y - (sy - H / 2)) * f + (sy - H / 2); view.k = k;
    showTip(null); heat(0.05);
  };
  canvas.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault(); const r = canvas.getBoundingClientRect();
    zoomAt(Math.exp(-e.deltaY * 0.004), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  ui.addEventListener('click', e => {
    const z = e.target.closest('[data-z]'); if (!z) return;
    if (z.dataset.z === 'in') zoomAt(1.3); else if (z.dataset.z === 'out') zoomAt(1 / 1.3);
    else { view.k = 1; view.x = view.y = 0; heat(0.3); }
  });
  canvas.style.cursor = 'grab';

  // Solo se anima mientras se ve (ahorra batería); se adapta al tamaño y al tema.
  if (window.IntersectionObserver) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) heat(0.05); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) heat(0.05); });
  if (window.ResizeObserver) new ResizeObserver(() => { const w = W; size(); if (w !== W) heat(0.2); }).observe(box);
  new MutationObserver(() => { readColors(); heat(0.05); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-mode', 'data-theme', 'style'] });

  size();
  if (reduce) { const now = t0 + 5000; for (let i = 0; i < 300; i++) tick(now); t0 -= 5000; draw(now); }
  else heat(1);
};
})();
