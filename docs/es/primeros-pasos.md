# Primeros pasos

[English](../en/getting-started.md)

## Qué necesitas

- Una cuenta de Nostr (tu **npub**). Publicas con tu cliente habitual (Habla, Yakihonne, Primal, Damus…); Mado solo lee y muestra.
- Una cuenta de GitHub, o cualquier alojamiento estático (ver [Alojamiento propio](alojamiento-propio.md)).

## 1. Consigue los archivos

Haz **fork** de este repositorio. Si quieres la web en `https://TU-USUARIO.github.io/` en lugar de `/mado/`, mira [Alojamiento propio](alojamiento-propio.md#en-tu-web-principal-de-github-pages).

## 2. Activa GitHub Pages

*Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.*

En un minuto la web estará en `https://TU-USUARIO.github.io/mado/`. Sin configurar muestra una pantalla inicial donde puedes probar cualquier npub.

## 3. Configura

Abre `https://TU-USUARIO.github.io/mado/admin.html`:

1. **Autor y relays**: pega tu npub; debajo aparece tu perfil para confirmarlo.
2. **Contenido**: artículos, notas o ambos. Pulsa **Analizar publicaciones del autor** para ver tus hashtags y fijar artículos con un clic.
3. **Apariencia** y **Navegación**: tema, título, idioma, secciones del menú…
4. **Vista previa** abre la web con tu borrador (solo en tu navegador).

Todo se guarda como borrador en tu navegador hasta que lo exportes.

## 4. Publica la configuración

Pulsa **Descargar config.json** y súbelo a la raíz del repo, sustituyendo el existente (*Add file → Upload files*, o edita `config.json` y pega el JSON de **Copiar JSON**). GitHub Pages vuelve a publicar en uno o dos minutos.

## 5. Verifica tu web (recomendado)

Para que los visitantes sepan que la web es realmente tuya: mira [Verificación de la web](verificacion.md). Son dos minutos.

## Actualizar

Tu configuración está en `config.json` y tus publicaciones en Nostr, así que actualizar Mado es sincronizar tu fork (*Sync fork* en GitHub). Si GitHub pregunta por conflictos, conserva tu `config.json`.
