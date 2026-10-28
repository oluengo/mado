# Referencia de configuración

[English](../en/configuration.md)

Toda la configuración está en `config.json`. La página de configuración (`admin.html`) edita todos los campos; esta página es de consulta. Los campos que falten usan los valores por defecto indicados.

## `author`

| Campo | Por defecto | Descripción |
|---|---|---|
| `npub` | `""` | npub del autor (o clave pública en hex). Obligatorio. |

## `relays`

Lista de relays `wss://` de los que leer. Por defecto: `relay.damus.io`, `nos.lol`, `relay.primal.net`, `relay.snort.social`. Usa los relays donde publicas.

## `remoteConfig` (NIP-78)

| Campo | Por defecto | Descripción |
|---|---|---|
| `enabled` | `false` | Leer el resto de la configuración de un evento firmado en Nostr (kind 30078). |
| `d` | `"mado-config"` | Identificador (etiqueta `d`) de ese evento. |

`author` y `relays` salen siempre de `config.json`: hacen falta para encontrar la configuración remota.

## `content`

| Campo | Por defecto | Descripción |
|---|---|---|
| `kinds` | `[30023, 1]` | `30023` = artículos (NIP-23), `1` = notas. |
| `includeTags` | `[]` | Solo publicaciones con estos hashtags. Vacío = todas. Sin distinguir mayúsculas. |
| `tagMode` | `"any"` | `"any"` = al menos uno, `"all"` = todos. |
| `excludeTags` | `[]` | Ocultar publicaciones con estos hashtags. |
| `hideReplies` | `true` | Ocultar notas que responden a otras. |
| `pinned` | `[]` | Identificadores de artículo (etiqueta `d`) o ids de evento que van primero en portada. |
| `maxPosts` | `300` | Máximo de publicaciones a cargar. |

## `site`

| Campo | Por defecto | Descripción |
|---|---|---|
| `url` | `""` | URL pública de la web. Se usa para la verificación (va firmada si se publica con NIP-78). |
| `title`, `description` | `""` | Vacío = nombre y biografía del perfil. |
| `logo` | `""` | Imagen de la cabecera. Vacío = foto del perfil. |
| `fallbackAvatar` | `""` | Si no hay foto o falla. Vacío = `assets/img/nostrich.png`. |
| `useProfile` | `true` | Usar el perfil de Nostr para título, descripción e imagen. |
| `layout` | `"list"` | Id de diseño (estructura) de `layouts/layouts.json`. |
| `theme` | `"violeta"` | Id de tema (colores) de `themes/themes.json`. |
| `font` | `"mono"` | Id de tipografía de `fonts/fonts.json`. |
| `colorMode` | `"auto"` | `"auto"`, `"light"` u `"dark"`. |
| `modeToggle` | `true` | Botón claro/oscuro. |
| `lang` | `"auto"` | `es`, `ca`, `en`, `it`, `de` o `"auto"` (navegador). La URL puede cambiarlo con `?lang=`. |
| `langSwitch` | `false` | Selector de idioma en la cabecera. |
| `dateFormat` | `"long"` | `"long"`, `"short"` o `"relative"`. |
| `perPage` | `10` | Publicaciones por página. |
| `order` | `"desc"` | `"desc"` más recientes primero, `"asc"` más antiguas primero. |
| `showTags`, `showReadingTime`, `showSearch` | `true` | Mostrar hashtags, tiempo de lectura y buscador. |
| `excerptLength` | `220` | Caracteres del extracto cuando el artículo no tiene resumen. |
| `footer` | `""` | Texto adicional en el pie. |

## `nav`

| Campo | Por defecto | Descripción |
|---|---|---|
| `showAllTags` | `true` | Página de etiquetas. |
| `showAbout` | `true` | Página «Sobre mí» con la biografía del perfil. |
| `sections` | `[]` | Entradas del menú que muestran un hashtag: `{ "label": "Bitcoin", "tag": "bitcoin" }`. |
| `links` | `[]` | Enlaces externos: `{ "label": "GitHub", "url": "https://…" }`. |

## `interactions`

Lo que otras personas hacen con tus publicaciones en Nostr. Cada opción se activa por separado; todas vienen desactivadas. Se lee de los relays de `relays`, así que los números pueden variar un poco respecto a otros clientes.

| Campo | Por defecto | Descripción |
|---|---|---|
| `reactions` | `false` | Reacciones (kind 7): una por persona; el detalle de emojis sale al pasar el ratón. |
| `replies` | `false` | Número de comentarios (notas kind 1 y comentarios NIP-22, kind 1111). |
| `replyList` | `false` | Texto de los comentarios, en hilo, al final de cada publicación, en un bloque plegable (plegado al abrir), con enlace para responder en Nostr. |
| `zaps` | `false` | Zaps (kind 9735): total de sats. |
| `quotes` | `false` | Citas: notas que la mencionan (etiqueta `q`). |
| `reposts` | `false` | Reposts (kind 6 y 16), uno por persona. |
| `inList` | `false` | Mostrar los contadores también en portada y listados. Si es `false`, solo dentro de la publicación. |

Los contadores se guardan en la caché local (`advanced.cacheMinutes`). El diseño «Compacto» no los muestra en la lista.

## `advanced`

| Campo | Por defecto | Descripción |
|---|---|---|
| `cacheMinutes` | `10` | Caché local en el navegador del visitante. `0` = consultar siempre. |
| `timeoutMs` | `7000` | Tiempo de espera de los relays. |
| `verifySignatures` | `true` | Descartar eventos cuya firma no cuadra. Mantenlo activado. |

## Rutas de la web

| Ruta | Página |
|---|---|
| `#/` · `#/page/2` | Portada |
| `#/post/<id>` | Artículo (por etiqueta `d`) o nota (por id) |
| `#/tag/<hashtag>` | Publicaciones de un hashtag |
| `#/tags` | Todas las etiquetas |
| `#/search/<texto>` | Búsqueda |
| `#/about` | Sobre mí |

Añade `?lang=xx` antes del `#` para forzar un idioma, por ejemplo `…/mado/?lang=en#/tags`.
