# Verbo Module Studio

Aplicación web para convertir módulos MySword SQLite al formato JSON schemaVersion 2 de Verbo.

## Formatos admitidos

- `.bbl.mybible` — Biblia
- `.cmt.mybible` — Comentario
- `.dct.mybible` — Diccionario

## Uso

1. Inicia un servidor local dentro de esta carpeta:
   ```bash
   python3 -m http.server 8090
   ```
2. Abre `http://localhost:8090` en Chrome.
3. Arrastra un módulo.
4. Revisa o edita los metadatos.
5. Pulsa **Convertir y descargar ZIP**.

La conversión se ejecuta localmente en el navegador. La aplicación utiliza sql.js y JSZip desde CDN, por lo que necesita Internet la primera vez que se abre.

## Salida

- Biblias: `manifest.json` y un JSON por libro.
- Comentarios: `manifest.json` y un JSON por libro.
- Diccionarios: `manifest.json` y archivos separados para G, H y otras entradas.
