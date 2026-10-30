# Idiomas

[English](../en/languages.md)

La web y la página de configuración están disponibles en:

| Código | Idioma |
|---|---|
| `es` | Castellano |
| `ca` | Català |
| `en` | English |
| `it` | Italiano |
| `de` | Deutsch |

## Elegir el idioma

- **Configuración:** `site.lang`, un idioma fijo o `"auto"` para seguir el del navegador del visitante.
- **URL:** cualquier enlace puede forzarlo con `?lang=`: `…/mado/?lang=ca`, `?lang=de#/about`. Útil para compartir.
- **Selector:** `site.langSwitch: true` añade un selector de idioma en la cabecera.

La página de configuración tiene su propio selector (arriba a la derecha) y recuerda tu elección.

Tus publicaciones se muestran tal como las escribiste; solo se traduce la interfaz.

## Añadir un idioma

Todos los textos están en `assets/js/i18n.js`:

1. Añade el código y el nombre en `LANGS`, y el formato de fecha en `LOCALES`.
2. Copia el bloque `es` de `BLOG` y de `ADMIN`, y tradúcelo. Las claves que son funciones (`n => …`) forman frases con números o nombres.
3. Opcionalmente, traduce los nombres y descripciones de los temas en `themes/themes.json`.

Las pull requests con nuevos idiomas son bienvenidas.
