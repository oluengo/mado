/* Diseño «Compacto»: una línea por publicación (fecha y título). Ideal para archivos grandes. */
Mado.registerLayout('compact', {
  item: (p, ctx) => {
    const d = new Date(p.date * 1000).toLocaleDateString(((window.MADO_I18N || {}).LOCALES || {})[ctx.lang] || 'es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const title = p.isArticle ? p.title : (Mado.stripMd(p.content).slice(0, 90) || '…');
    const tags = ctx.cfg.site.showTags ? p.tags.slice(0, 3).map(t => `<span>#${ctx.esc(t)}</span>`).join('') : '';
    return `<a class="mado-row${p.pinned ? ' is-pinned' : ''}" href="${ctx.href(p)}">
      <time datetime="${new Date(p.date * 1000).toISOString()}">${d}</time>
      <span class="mado-row-title">${p.pinned ? '★ ' : ''}${ctx.esc(title)}</span>
      <span class="mado-row-tags">${tags}</span></a>`;
  },
  list: (items, ctx) => `<div class="mado-list mado-compact">${items.map(ctx.item).join('')}</div>`
});
