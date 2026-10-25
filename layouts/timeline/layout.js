/* Diseño «Cronología»: publicaciones agrupadas por mes, sobre una línea de tiempo.
   Las fijadas no se adelantan, para respetar el orden de fechas. */
Mado.registerLayout('timeline', {
  options: { pinFirst: false },
  list: (items, ctx) => {
    const groups = [];
    for (const p of items) {
      const m = ctx.month(p), g = groups[groups.length - 1];
      if (g && g.m === m) g.items.push(p); else groups.push({ m, items: [p] });
    }
    return `<div class="mado-tl">${groups.map(g => `<section class="mado-tl-group">
      <h3 class="mado-tl-month">${ctx.esc(g.m)}</h3>
      <div class="mado-tl-items">${g.items.map(ctx.item).join('')}</div></section>`).join('')}</div>`;
  }
});
