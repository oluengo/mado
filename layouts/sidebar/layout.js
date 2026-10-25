/* Diseño «Barra lateral»: perfil, menú, buscador y etiquetas a la izquierda; contenido a la derecha.
   En pantallas estrechas la barra pasa arriba. */
Mado.registerLayout('sidebar', {
  shell: p => `<div class="mado-wrap mado-sb">
    <aside class="mado-aside">
      <header class="mado-header"><div class="mado-top">${p.brand}${p.tools}</div>${p.nav}${p.search}</header>
      ${p.aside}
    </aside>
    <div class="mado-sb-main">${p.main}${p.footer}</div>
  </div>`
});
