# Temas y tipografía

[English](../en/themes.md)

El aspecto de Mado se compone de tres piezas independientes:

| Pieza | Qué controla | Carpeta |
|---|---|---|
| **Diseño** | La estructura: dónde va cada cosa | `layouts/` (ver [Diseños](disenos.md)) |
| **Tema** | Solo los colores, en claro y oscuro | `themes/` |
| **Tipografía** | Las fuentes y el tamaño base | `fonts/fonts.json` |

Cualquier combinación funciona: Barra lateral + Bosque + Serif, Compacto + Grafito + Monoespaciada…

## Temas (paletas de color)

| Id | Nombre |
|---|---|
| `violeta` | Violeta: gris claro con acento morado Nostr |
| `oceano` | Océano: azules tranquilos |
| `bosque` | Bosque: verdes naturales |
| `arena` | Arena: papel cálido con acento terracota |
| `grafito` | Grafito: blanco y negro |
| `sakura` | Sakura: rosa suave con acento cereza |

### Crear un tema

1. Copia `themes/violeta` como `themes/mi-tema`.
2. Cambia los colores. Un tema solo define estas variables, para el modo claro y el oscuro:

| Variable | Uso |
|---|---|
| `--bg` | Fondo de la página |
| `--fg` | Texto |
| `--muted` | Texto secundario (fechas, descripciones) |
| `--line` | Bordes y separadores |
| `--card` | Fondo de tarjetas y campos |
| `--accent` | Enlaces, menú activo, destacados |
| `--accent-bg` | Fondo de etiquetas y destacados suaves |

```css
:root { --bg: #fafafa; --fg: #1d1d1f; … }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #121214; … } }
:root[data-theme="dark"] { --bg: #121214; … }
```

3. Añádelo a `themes/themes.json`:

```json
{
  "id": "mi-tema",
  "name": { "es": "Mi tema", "en": "My theme" },
  "description": { "es": "…", "en": "…" },
  "preview": { "light": ["#fafafa", "#1d1d1f", "#7b3fe4"], "dark": ["#121214", "#ececef", "#b18cff"] }
}
```

`preview` son las tres muestras que se ven en la página de configuración (fondo, texto y acento).

Limita los temas a los colores. Todo lo que sea estructura va en un diseño.

## Tipografía

| Id | Fuentes | Tamaño base |
|---|---|---|
| `mono` | Monoespaciada del sistema | 15 px |
| `serif` | Fraunces (títulos) + Source Serif 4 (texto) | 18 px |
| `sans` | Inter | 16 px |

### Añadir una tipografía

Añade una entrada en `fonts/fonts.json`:

```json
{
  "id": "humanista",
  "name": { "es": "Humanista", "en": "Humanist" },
  "description": { "es": "…", "en": "…" },
  "body": "\"Nunito\", system-ui, sans-serif",
  "head": "\"Nunito\", system-ui, sans-serif",
  "size": "16px",
  "href": "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap"
}
```

`href` es opcional (una hoja de estilos de Google Fonts, o vacío para fuentes del sistema). Mado define `--font-body`, `--font-head` y `--fs`, y añade la clase `font-<id>` al `<body>`.
