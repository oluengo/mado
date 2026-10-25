/* Diseño «Rejilla»: tarjetas en columnas que se adaptan al ancho. */
Mado.registerLayout('grid', {
  list: (items, ctx) => `<div class="mado-list mado-grid">${items.map(ctx.item).join('')}</div>`
});
