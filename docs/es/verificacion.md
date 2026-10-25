# Verificación de la web

[English](../en/verification.md)

Cualquiera puede mostrar publicaciones públicas de Nostr: así funciona Nostr. La verificación permite a tu web demostrar que **tú**, el autor, la reclamas. Mado lo comprueba en cada visita con datos firmados por tu clave.

El resultado se ve como un halo sutil alrededor del avatar, **verde pastel** si está verificada y **rojo pastel** si no, y en una línea breve del pie. El avatar enlaza a tu perfil en njump.me, para que cualquiera lo confirme fuera de tu web.

Basta con una de las dos opciones.

## A · NIP-05 (web en la raíz de un dominio)

Funciona cuando la web está en la raíz de un dominio: `usuario.github.io` o un dominio propio.

1. En la página de configuración (bloque 5), elige un nombre (`_` significa «solo el dominio») y pulsa **Descargar nostr.json**.
2. Súbelo a `.well-known/nostr.json` en la raíz del dominio. En GitHub Pages va en el repositorio que sirve la raíz (`usuario.github.io`), junto con el archivo `.nojekyll` (ya incluido en Mado).
3. En tu cliente Nostr, pon como NIP-05 `_@usuario.github.io` (se muestra como `usuario.github.io`) o `nombre@usuario.github.io`.

Extra: los clientes de Nostr también mostrarán tu NIP-05 como verificado.

## B · Enlace firmado (cualquier URL)

Funciona en cualquier sitio, también en subcarpetas como `usuario.github.io/mado/`.

- En tu cliente Nostr, pon la URL de la web en el campo **Web** de tu perfil, **o**
- Rellena **URL pública del blog** (bloque 5) y publica la configuración en Nostr (bloque 6). Ese evento va firmado por ti.

Un enlace a una carpeta cubre todo lo que contiene: `usuario.github.io` también cubre `usuario.github.io/mado/`.

## Compruébalo

**Comprobar verificación**, en la página de configuración, muestra qué opción funciona y por qué falla la otra.

## Qué protege y qué no

- **La prueba no se puede falsificar.** Sin tu nsec nadie puede hacer que tu npub reclame su web.
- **Una copia puede imitar la insignia.** Quien copia el repo controla su código. Por eso el avatar enlaza a tu perfil en njump.me: la comprobación real se hace allí, de forma independiente.
- **Lo que sí consigues:** una copia que mantenga tu npub aparece como *no verificada*, y los eventos falsificados por un relay se rechazan porque se comprueba cada firma.

**Nunca escribas tu nsec en ninguna web.** Para firmar, usa una extensión NIP-07 (Alby, nos2x…).
