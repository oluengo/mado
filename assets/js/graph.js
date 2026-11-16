/* Mado — grafo social animado (página «Sobre mí»).
   El autor en el centro y la gente que sigue alrededor; quienes le siguen también (mutuos) van más
   cerca y con borde de color. Se puede arrastrar; tocar un nodo abre su perfil en njump.me.
   Se carga solo si nav.socialGraph está activado. Sin librerías: canvas y una simulación de fuerzas. */
(function () {
'use strict';

Mado.drawGraph = function (box, data, opts) {
  const { center, label, open } = opts;      // center: { pk, name, picture }, label(node) -> texto, open(node)
  const canvas = document.createElement('canvas'), tip = document.createElement('div');
  canvas.className = 'mado-graph-canvas'; tip.className = 'mado-graph-tip'; tip.hidden = true;
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', opts.aria || '');
  box.append(canvas, tip);
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  let W = 0, H = 0, dpr = 1, alpha = 1, raf = 0, hover = null, drag = null, moved = false;

  const n = data.nodes.length, small = n > 70 ? 0.8 : 1;
  const nodes = [{ ...center, center: true, r: 26 }, ...data.nodes.map(d => ({ ...d, r: (d.mutual ? 14 : 11) * small }))];
  // Posición inicial: mutuos en un anillo interior, el resto fuera.
  nodes.forEach((d, i) => {
    if (d.center) { d.x = d.y = 0; return; }
    const a = i * 2.39996, rr = (d.mutual ? 0.45 : 0.85) * (120 + Math.sqrt(i) * 8);
    d.x = Math.cos(a) * rr; d.y = Math.sin(a) * rr; d.vx = d.vy = 0;
  });
  // Avatares (si fallan, círculo con la inicial).
  nodes.forEach(d => {
    if (!d.picture) return;
    const img = new Image(); img.referrerPolicy = 'no-referrer'; img.decoding = 'async';
    img.onload = () => { d.img = img; if (!raf) draw(); };
    img.src = d.picture;
  });

  function size() {
    const w = box.clientWidth || 600;
    W = w; H = Math.round(Math.min(560, Math.max(320, w * 0.75)));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }

  // Simulación: repulsión entre nodos, muelle hacia el centro (más corto para mutuos) y colisión.
  function tick() {
    const scale = Math.min(W, H) / 2 - 20;
    const Lm = scale * 0.42, Lo = scale * 0.82;
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy || 0.01, d = Math.sqrt(d2);
        const min = a.r + b.r + 3;
        let f = 900 / d2;
        if (d < min) f += (min - d) * 0.5;
        dx /= d; dy /= d;
        a.vx += dx * f * alpha; a.vy += dy * f * alpha; b.vx -= dx * f * alpha; b.vy -= dy * f * alpha;
      }
      const d = Math.hypot(a.x, a.y) || 0.01, L = a.mutual ? Lm : Lo, k = (d - L) * 0.02 * alpha;
      a.vx -= a.x / d * k * 2; a.vy -= a.y / d * k * 2;
      const c = a.r + nodes[0].r + 6; // no pisar al autor
      if (d < c) { a.vx += a.x / d * (c - d) * 0.3; a.vy += a.y / d * (c - d) * 0.3; }
    }
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i];
      if (a === drag) { a.vx = a.vy = 0; continue; }
      a.vx *= 0.82; a.vy *= 0.82; a.x += a.vx; a.y += a.vy;
      const lim = (W / 2) - a.r - 2, limY = (H / 2) - a.r - 2;
      a.x = Math.max(-lim, Math.min(lim, a.x)); a.y = Math.max(-limY, Math.min(limY, a.y));
    }
    alpha *= 0.985;
  }

  function circle(d, x, y, r) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath();
    if (d.img) { ctx.clip(); ctx.drawImage(d.img, x - r, y - r, r * 2, r * 2); }
    else {
      ctx.fillStyle = css('--accent-bg') || '#eee'; ctx.fill();
      const ch = (d.name || '').trim()[0];
      if (ch) {
        ctx.fillStyle = css('--accent') || '#666'; ctx.font = `600 ${Math.round(r)}px system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch.toUpperCase(), x, y + 1);
      }
    }
    ctx.restore();
  }

  function draw() {
    const accent = css('--accent') || '#7b3fe4', line = css('--line') || '#ddd';
    ctx.setTransform(dpr, 0, 0, dpr, W / 2 * dpr, H / 2 * dpr);
    ctx.clearRect(-W / 2, -H / 2, W, H);
    const c = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      const d = nodes[i], on = d === hover;
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y);
      ctx.strokeStyle = d.mutual || on ? accent : line;
      ctx.globalAlpha = on ? 0.9 : d.mutual ? 0.35 : 0.6; ctx.lineWidth = on ? 1.6 : 1; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const d = nodes[i], r = d === hover ? d.r * 1.25 : d.r;
      circle(d, d.x, d.y, r);
      ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = d.center || d.mutual || d === hover ? accent : line;
      ctx.lineWidth = d.center ? 3 : d.mutual ? 2 : 1; ctx.stroke();
    }
  }

  function loop() {
    tick(); draw();
    raf = alpha > 0.02 || drag ? requestAnimationFrame(loop) : 0;
  }
  function heat(a = 0.5) { alpha = Math.max(alpha, a); if (!raf && !reduce) raf = requestAnimationFrame(loop); }

  // Interacción: pasar por encima, arrastrar y tocar.
  const at = e => {
    const r = canvas.getBoundingClientRect(), x = e.clientX - r.left - W / 2, y = e.clientY - r.top - H / 2;
    for (let i = nodes.length - 1; i >= 0; i--) { const d = nodes[i]; if (Math.hypot(d.x - x, d.y - y) <= d.r + 3) return { d, x, y }; }
    return { d: null, x, y };
  };
  function showTip(d) {
    if (!d) { tip.hidden = true; return; }
    tip.textContent = label(d); tip.hidden = false;
    const left = Math.max(4, Math.min(W - tip.offsetWidth - 4, d.x + W / 2 - tip.offsetWidth / 2));
    tip.style.left = left + 'px'; tip.style.top = Math.max(0, d.y + H / 2 - d.r - 34) + 'px';
  }
  canvas.addEventListener('pointermove', e => {
    const h = at(e);
    if (drag) { moved = moved || Math.hypot(h.x - drag.x, h.y - drag.y) > 3; drag.x = h.x; drag.y = h.y; heat(0.3); showTip(drag); return; }
    if (h.d !== hover) { hover = h.d; canvas.style.cursor = hover ? 'pointer' : 'default'; showTip(hover); if (!raf) draw(); }
  });
  canvas.addEventListener('pointerleave', () => { if (!drag) { hover = null; showTip(null); if (!raf) draw(); } });
  canvas.addEventListener('pointerdown', e => {
    const h = at(e); if (!h.d) return;
    hover = h.d; moved = false; showTip(h.d);
    if (!h.d.center) { drag = h.d; canvas.setPointerCapture(e.pointerId); heat(0.3); }
  });
  canvas.addEventListener('pointerup', e => {
    const d = drag || hover; drag = null;
    if (d && !moved) open(d);
    if (e.pointerType !== 'mouse') { hover = null; showTip(null); }
    if (!raf) draw();
  });

  size();
  if (reduce) { for (let i = 0; i < 300; i++) tick(); draw(); } else heat(1);
  if (window.ResizeObserver) new ResizeObserver(() => { const w = W; size(); if (w !== W) { if (reduce) draw(); else heat(0.3); } }).observe(box);
};
})();
