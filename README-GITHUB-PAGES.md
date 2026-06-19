# Verbo — Paquete para GitHub Pages

Este paquete está listo para publicarse como sitio estático en GitHub Pages.

## Estructura

- `index.html` — aplicación principal Verbo.
- `assets/` — JavaScript y CSS de Verbo.
- `modules/` — Biblias, comentarios, diccionarios y `registry.json`.
- `studio/` — Verbo Module Studio.
- `.nojekyll` — evita que GitHub Pages ignore carpetas o archivos con nombres especiales.

## Publicación rápida

1. Crea un repositorio nuevo en GitHub.
2. Sube **todo el contenido de esta carpeta** a la raíz del repositorio, no la carpeta completa dentro de otra carpeta.
3. En GitHub entra a:
   Settings → Pages.
4. En “Build and deployment” selecciona:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/root`
5. Guarda.
6. GitHub te dará una dirección parecida a:
   `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`

## Verbo Module Studio

Cuando el sitio esté publicado, abre:

`https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/studio/`

Module Studio puede convertir módulos en el navegador y descargar el resultado. No puede escribir directamente en GitHub Pages por seguridad. Para publicar un módulo convertido, descarga el ZIP, copia los archivos al repositorio local y sube cambios con GitHub Desktop o `git push`.

## Añadir módulos

Cada módulo debe tener su carpeta dentro de:

- `modules/bibles/`
- `modules/commentaries/`
- `modules/dictionaries/`

Y debe estar declarado en:

`modules/registry.json`

Module Studio v2 puede recibir el `registry.json` actual y devolverte uno actualizado.

## Nota importante

GitHub Pages publica archivos estáticos. No ejecuta Python, PHP ni bases de datos del lado servidor.
