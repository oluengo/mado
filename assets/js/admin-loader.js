/* Mado — página de configuración dentro de una instancia (p. ej. /blog/admin/).
   Carga admin.html desde donde está publicado Mado y la monta aquí, así siempre está al día.
   La página que lo usa define window.MADO_SITE (carpeta de la web, p. ej. '../'). */
(async function () {
  const base = new URL('../../', document.currentScript.src).href; // …/mado/
  const fail = t => { document.body.innerHTML = '<p style="font:15px system-ui;padding:24px">' + t + '</p>'; };
  let html;
  try { const r = await fetch(base + 'admin.html', { cache: 'no-store' }); if (!r.ok) throw 0; html = await r.text(); }
  catch { return fail('Mado: admin.html not found at ' + base); }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const abs = (el, attr) => { const v = el.getAttribute(attr); if (v && !/^([a-z]+:|\/\/|#|data:)/i.test(v)) el.setAttribute(attr, new URL(v, base).href); };
  doc.querySelectorAll('[src]').forEach(el => abs(el, 'src'));
  doc.querySelectorAll('link[href]').forEach(el => abs(el, 'href'));
  document.title = doc.title;
  doc.head.querySelectorAll('style, link').forEach(el => document.head.appendChild(document.importNode(el, true)));
  const scripts = [...doc.body.querySelectorAll('script')].map(s => s.src);
  doc.body.querySelectorAll('script').forEach(s => s.remove());
  document.body.innerHTML = doc.body.innerHTML;
  for (const src of scripts) await new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.body.appendChild(s); });
})();
