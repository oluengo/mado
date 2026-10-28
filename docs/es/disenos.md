# Diseños

[English](../en/layouts.md)

Mado separa los **diseños** (estructura), los **temas** (colores) y la **tipografía**. Cualquier combinación funciona: ver [Temas y tipografía](temas.md).

| Id | Nombre | Qué hace |
|---|---|---|
| `list` | Lista | Una columna clásica. |
| `grid` | Rejilla | Tarjetas en columnas. |
| `sidebar` | Barra lateral | Perfil, menú, buscador y etiquetas principales a la izquierda. En pantallas estrechas la barra pasa arriba. |
| `featured` | Portada destacada | En portada, la última publicación (o la fijada) a lo grande y el resto en rejilla. |
| `timeline` | Cronología | Publicaciones agrupadas por mes sobre una línea de tiempo. Las fijadas no se adelantan. |
| `compact` | Compacto | Una línea por publicación: fecha, título y etiquetas. |

Se elige en la página de configuración (bloque 3) o en `config.json`:

```json
"site": { "layout": "sidebar", "theme": "bosque", "font": "serif" }
```

## Crear un diseño

Un diseño es una carpeta con dos archivos:

```
layouts/mi-diseno/layout.js
layouts/mi-diseno/layout.css
```

y una entrada en `layouts/layouts.json`:

```json
{ "id": "mi-diseno", "name": { "es": "Mi diseño", "en": "My layout" }, "description": { "es": "…", "en": "…" } }
```

`layout.js` lo registra:

```js
Mado.registerLayout('mi-diseno', {
  // Estructura de la página. Opcional: sin ella se usa la de por defecto.
  shell: (p, ctx) => `<div class="mado-wrap">
    <header class="mado-header"><div class="mado-top">${p.brand}${p.tools}</div>${p.nav}${p.search}</header>
    ${p.main}${p.footer}</div>`,

  // Cómo se coloca una página de publicaciones. Opcional.
  list: (items, ctx) => `<div class="mado-list">${items.map(ctx.item).join('')}</div>`,

  // Cómo se ve cada publicación en el listado. Opcional.
  item: (post, ctx) => `<a href="${ctx.href(post)}">${ctx.esc(post.title)}</a>`,

  options: { pinFirst: true }   // false = no adelantar las publicaciones fijadas
});
```

### `shell(p, ctx)`: las piezas

Cada pieza lleva ya su id; **incluye cada pieza una sola vez** (`aside` es opcional).

| Pieza | Contenido |
|---|---|
| `p.brand` | Avatar (con el halo de verificación), título y descripción |
| `p.tools` | Selector de idioma y botón claro/oscuro |
| `p.nav` | Menú |
| `p.search` | Buscador (vacío si está desactivado) |
| `p.aside` | Etiquetas principales, se rellena al cargar las publicaciones |
| `p.main` | Donde se muestran las páginas |
| `p.footer` | Pie (autor, verificación, mención) |

### `list(items, ctx)` e `item(post, ctx)`: las utilidades

| Utilidad | Devuelve |
|---|---|
| `ctx.item(post)` | La publicación según este diseño (`item`, o la de por defecto) |
| `ctx.defaultItem(post)` | La tarjeta de publicación por defecto de Mado |
| `ctx.href(post)`, `ctx.tagHref(tag)` | Enlaces |
| `ctx.date(post)`, `ctx.month(post)` | Fecha formateada, «Mes de año» |
| `ctx.meta(post)`, `ctx.tags(post)`, `ctx.cover(post)`, `ctx.ix(post)` | Piezas HTML ya hechas (`ix` = contadores de interacciones, se rellenan al cargar) |
| `ctx.excerpt(post)` | Resumen o extracto |
| `ctx.esc(texto)` | Texto escapado para HTML: úsalo con cualquier texto que insertes |
| `ctx.home`, `ctx.page`, `ctx.pages` | ¿Es la portada? Página actual y total |
| `ctx.lang`, `ctx.T`, `ctx.cfg` | Idioma, textos de la interfaz, configuración |

Una publicación tiene: `title`, `summary`, `image`, `content`, `date`, `tags`, `isArticle`, `pinned`, `id`, `slug`.

Si un diseño falla, Mado vuelve a la lista por defecto para que la web nunca quede en blanco.

## ¿Diseño, tema o tipografía?

- Dónde va cada cosa, columnas, agrupaciones, espaciados, adornos → **diseño** (`layouts/`).
- Colores → **tema** (`themes/`), usando solo las variables de color.
- Fuentes → **tipografía** (`fonts/fonts.json`).

En el CSS de tu diseño usa las variables (`var(--accent)`, `var(--font-head)`…) en lugar de colores o fuentes fijos, para que funcione con cualquier tema y tipografía.

Prefija las reglas propias del diseño con `.layout-<id>` (Mado añade esa clase al `<body>`) para que no afecten a otros diseños.
