<p align="center"><img src="assets/img/logo-purple.svg" width="96" alt="Mado"></p>

# Mado

**Una ventana a tus publicaciones de Nostr, en tu propia web.**

Español · [English](README.md)

**Web:** <https://oluengo.github.io/mado/>

Mado convierte tus artículos (NIP-23) y notas de Nostr en una web alojada por ti, en GitHub Pages o en cualquier alojamiento estático. Sin servidor, sin compilar y sin nada que instalar.

- Portada paginada, enlaces permanentes, secciones por hashtag, buscador y página «Sobre mí».
- Filtros por hashtag (incluir/excluir, alguno/todos), publicaciones fijadas y respuestas ocultas. Opcional: barra y buscador de etiquetas para el visitante.
- Aspecto en tres piezas independientes: 6 diseños (estructura), 6 temas de color con modo claro y oscuro, y 3 tipografías. Combínalos libremente y crea los tuyos.
- Interacciones de Nostr, cada una opcional: reacciones, comentarios (número y texto en hilo), zaps, citas y reposts.
- Cinco idiomas: castellano, català, English, italiano y Deutsch.
- Configuración guardada en Nostr (NIP-78), firmada desde `admin/` con tu extensión, Amber o un bunker (nunca con la nsec): cambias la web sin tocar el repositorio.
- Cada evento se comprueba con su firma, y tu web puede demostrar que es tuya (NIP-05 o enlace firmado).

## Puesta en marcha (GitHub Pages)

1. Haz **fork** de este repositorio.
2. **Activa Pages**: *Settings → Pages → Deploy from a branch → `main` / root*.
3. Pon tu npub en `index.html` (`<meta name="mado-npub" …>`, ya está comentado) o en `config.json`. Si tu dominio tiene NIP-05 `_@dominio`, no hace falta.
4. Abre `https://TU-USUARIO.github.io/mado/admin/`, entra con tu extensión, Amber o bunker, elige las opciones y pulsa **Guardar**. La web lo aplica al momento.

Este repositorio es una **plantilla**: su `config.json` está vacío a propósito. Para tener tu blog dentro de otra web con solo un `index.html`, usa una [instancia ligera](docs/es/alojamiento-propio.md#instancia-ligera-recomendada-para-tu-propio-blog). Otras opciones (dominio propio, subcarpeta): [Alojamiento propio](docs/es/alojamiento-propio.md).

## Documentación

| Tema | Español | English |
|---|---|---|
| Primeros pasos | [docs/es/primeros-pasos.md](docs/es/primeros-pasos.md) | [docs/en/getting-started.md](docs/en/getting-started.md) |
| Referencia de configuración | [docs/es/configuracion.md](docs/es/configuracion.md) | [docs/en/configuration.md](docs/en/configuration.md) |
| Verificación de la web | [docs/es/verificacion.md](docs/es/verificacion.md) | [docs/en/verification.md](docs/en/verification.md) |
| Diseños | [docs/es/disenos.md](docs/es/disenos.md) | [docs/en/layouts.md](docs/en/layouts.md) |
| Temas y tipografía | [docs/es/temas.md](docs/es/temas.md) | [docs/en/themes.md](docs/en/themes.md) |
| Idiomas | [docs/es/idiomas.md](docs/es/idiomas.md) | [docs/en/languages.md](docs/en/languages.md) |
| Alojamiento propio | [docs/es/alojamiento-propio.md](docs/es/alojamiento-propio.md) | [docs/en/self-hosting.md](docs/en/self-hosting.md) |

## Estructura del proyecto

```
index.html              la web
admin.html, admin/      página de configuración (guarda en Nostr)
config.json             opcional: npub y configuración sin Nostr
.nojekyll               permite a GitHub Pages publicar .well-known/
assets/
  css/base.css          estructura común
  js/core.js            Nostr, configuración, caché, verificación
  js/blog.js            rutas y vistas
  js/admin.js           lógica de la página de configuración
  js/signer.js          sesión: extensión, Amber o bunker
  js/i18n.js            textos en 5 idiomas
  js/vendor/            verificación de firmas (@noble, MIT)
  img/logo.svg          logo y favicons
  img/nostrich.png      avatar por defecto (ver CREDITS.md)
layouts/
  layouts.json          lista de diseños
  <id>/layout.js, layout.css
themes/
  themes.json           temas de color
  <id>/theme.css
fonts/fonts.json        tipografías
examples/instance/      instancia ligera (index.html y admin/)
site/                   web del proyecto (oluengo.github.io/mado), no hace falta en los forks
docs/es, docs/en        documentación
```

## ¿Es seguro dejar `admin.html` publicado?

Sí. No puede cambiar el repositorio, y la configuración publicada en Nostr solo se acepta si la firma el npub del autor (con tu firmante). Puedes borrar `admin.html`, `admin/` y `assets/js/admin*.js` cuando termines.

**Nunca escribas tu nsec en ninguna web.** Para firmar, usa una extensión NIP-07 del navegador.

## Créditos y licencia

Mado se publica con [licencia MIT](LICENSE). Los recursos y librerías de terceros están en [CREDITS.md](CREDITS.md).

Creado por [oluengo](https://github.com/oluengo) · Nostr: `npub1vuf2g6s0mcjr34lhkg2vvtj4x65w29xn28nznw9fhcqcpyr4zc9q6myguj`
