/* Diseño «Portada destacada»: en la portada, la primera publicación (o la fijada) a lo grande
   y el resto en rejilla. En etiquetas, búsquedas y páginas siguientes, solo la rejilla. */
Mado.registerLayout('featured', {
  list: (items, ctx) => {
    const grid = list => list.length ? `<div class="mado-list mado-grid">${list.map(ctx.item).join('')}</div>` : '';
    if (!ctx.home || ctx.page !== 1 || !items.length) return grid(items);
    const [h, ...rest] = items;
    const hero = h.isArticle ? `<article class="mado-hero${h.image ? ' has-cover' : ''}">
        ${ctx.cover(h)}
        <div class="mado-hero-body">
          <h2><a href="${ctx.href(h)}">${ctx.esc(h.title)}</a></h2>
          ${ctx.meta(h)}
          <p class="mado-excerpt">${ctx.esc(ctx.excerpt(h))}</p>
          ${ctx.tags(h)}
        </div></article>` : `<div class="mado-hero">${ctx.item(h)}</div>`;
    return hero + grid(rest);
  }
});
