# Alojamiento propio

[English](../en/self-hosting.md)

Mado son archivos estáticos con rutas relativas, así que funciona en cualquier alojamiento estático y en cualquier carpeta.

## Instancia ligera (recomendada para tu propio blog)

Mantén Mado como plantilla limpia y ejecuta tu blog desde otra carpeta con un solo archivo:

```
tu-web/
  mado/            ← Mado (fork o copia), sin tocar
  blog/
    index.html     ← copia de examples/instance/index.html, con tu npub
    admin/
      index.html   ← copia de examples/instance/admin/index.html (opcional)
```

`index.html` carga el código, los diseños, los temas y las tipografías desde `/mado/`, y la configuración desde Nostr. Al actualizar Mado (sincronizando tu fork) se actualizan todas las instancias, y nadie que haga fork de Mado hereda tu configuración.

Para editar la configuración de la instancia, abre `/blog/admin/` (o, sin esa carpeta, `/mado/admin.html?site=/blog/`): entras con tu firmante, carga la configuración publicada para `/blog/`, **Vista previa** abre `/blog/` y **Guardar** la firma para esa carpeta. La página de `admin/` carga siempre el admin de `/mado/`, así que se actualiza sola. Un `config.json` en `/blog/` es opcional (copia o alternativa sin Nostr).

La URL `/mado/` de `index.html` también puede apuntar a otra web (`https://usuario.github.io/mado/`), pero mejor tu propio fork, para controlar las actualizaciones.

## En tu web principal de GitHub Pages

Para servir Mado en `https://usuario.github.io/` (o dentro, por ejemplo `/blog/`):

- **Toda la web:** copia el contenido de este repo en tu repositorio `usuario.github.io`.
- **Subcarpeta:** copia todo en una carpeta, por ejemplo `blog/`. La web estará en `https://usuario.github.io/blog/`.

Si usas la verificación NIP-05, deja `.nojekyll` en la raíz de ese repositorio.

## Dominio propio en GitHub Pages

*Settings → Pages → Custom domain*, y configura el DNS como indica GitHub. Así el NIP-05 funciona con `nombre@tu-dominio`.

## Cualquier otro alojamiento estático

Netlify, Cloudflare Pages, Vercel, un VPS con nginx o Apache, un hosting compartido… Sube los archivos y listo. Sin comando de compilación ni código de servidor.

### Servir `nostr.json` (NIP-05)

El archivo debe estar accesible en `https://tu-dominio/.well-known/nostr.json`. La mayoría de alojamientos lo sirven tal cual. Si tu servidor oculta las carpetas que empiezan por punto, permítelo; por ejemplo, en nginx:

```nginx
location /.well-known/nostr.json {
  add_header Access-Control-Allow-Origin *;
  default_type application/json;
}
```

Los clientes de Nostr leen este archivo desde otros dominios, así que necesita `Access-Control-Allow-Origin: *` (GitHub Pages ya lo envía).

## Lista de comprobación

- Tu npub en `index.html` (`<meta name="mado-npub">`), en `config.json` o en el NIP-05 `_` del dominio.
- `assets/`, `layouts/`, `themes/` y `fonts/` junto a ellos.
- HTTPS (necesario para la verificación y para la mayoría de relays).
- Opcional: quita `admin.html`, `admin/` y `assets/js/admin*.js` de producción una vez configurado.

## Integrarlo en una web existente

Mado ocupa la página donde se ejecuta, así que lo más sencillo es darle su propia carpeta (`/blog/`) y enlazarla desde tu menú. Si lo quieres dentro de otra página, usa un `<iframe src="/blog/">`.
