# Primeros pasos

[English](../en/getting-started.md)

## Qué necesitas

- Una cuenta de Nostr (tu **npub**). Publicas con tu cliente habitual (Habla, Yakihonne, Primal, Damus…); Mado solo lee y muestra.
- Una cuenta de GitHub, o cualquier alojamiento estático (ver [Alojamiento propio](alojamiento-propio.md)).

## 1. Consigue los archivos

Haz **fork** de este repositorio. Si quieres la web en `https://TU-USUARIO.github.io/` en lugar de `/mado/`, mira [Alojamiento propio](alojamiento-propio.md#en-tu-web-principal-de-github-pages).

## 2. Activa GitHub Pages

*Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.*

En un minuto la web estará en `https://TU-USUARIO.github.io/mado/`. Sin npub muestra una pantalla inicial donde puedes probar cualquier npub.

## 3. Di a la web quién eres

La web necesita tu npub para encontrar tu configuración. Una de estas tres opciones:

- **NIP-05 del dominio** (nada que editar): si `https://TU-DOMINIO/.well-known/nostr.json` tiene el nombre `_` con tu clave, Mado lo usa. Ver [Verificación](verificacion.md).
- **`index.html`**: quita el comentario de `<meta name="mado-npub" content="npub1…">` y pon tu npub.
- **`config.json`**: escribe tu npub en `author.npub`.

## 4. Configura y publica en Nostr

Abre `https://TU-USUARIO.github.io/mado/admin.html`. Necesitas una extensión NIP-07 en el navegador (Alby, nos2x…); **nunca escribas tu nsec en una web**.

1. **Autor** → **Conectar con extensión**: rellena tu npub y carga la configuración que ya tengas publicada.
2. Ajusta las pestañas (Contenido, Aspecto, Web, Interacciones…). **Vista previa** abre la web con tu borrador, solo en tu navegador.
3. Pulsa **Publicar en Nostr**: la extensión firma la configuración (NIP-78, kind 30078) y se publica en tus relays. La web la lee de ahí; no hay que subir nada al repositorio.

Cada web tiene su propia configuración, identificada por su dominio y carpeta (`mado:usuario.github.io/mado/`), así que puedes tener varias con el mismo npub.

**Exportar copia (JSON)** descarga la configuración: sirve de copia de seguridad o para usarla como `config.json` si prefieres no depender de los relays. Si existen las dos, gana la publicada en Nostr.

## 5. Verifica tu web (recomendado)

Para que los visitantes sepan que la web es realmente tuya: mira [Verificación de la web](verificacion.md). Son dos minutos.

## Actualizar

Tu configuración y tus publicaciones están en Nostr, así que actualizar Mado es sincronizar tu fork (*Sync fork* en GitHub). Si GitHub pregunta por conflictos, conserva tu `index.html` o tu `config.json`.
