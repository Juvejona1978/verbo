# Cambios Verbo — 2026-06-19

## Comentarios bíblicos

- Se corrigió la carga de introducciones con `chapterStart: 0` para que aparezcan ancladas al capítulo 1.
- Se refinó JFB: los bloques largos por capítulo fueron divididos en entradas por versículo cuando el texto contenía marcadores internos tipo `<strong>1.</strong>`.
- Se refinó Diario Vivir: los bloques por capítulo fueron divididos en entradas por versículo usando marcadores internos tipo `6.2`, `6.3, 4`, etc.
- LBLA ya venía mayormente por versículo; se mantiene, pero ahora sus introducciones también pueden mostrarse.

## Organización de recursos

- El panel `Diccionario` queda enfocado en Strong / Multiléxico.
- Se agregó una nueva entrada visual de `Biblioteca` al lado izquierdo.
- La Biblioteca queda preparada para diccionarios de referencia, Padres Apostólicos y libros adicionales.
- Barclay y otros diccionarios no Strong quedan fuera del selector principal de Strong y pueden abrirse desde Biblioteca.

## Archivos principales modificados

- `assets/module-loader.js`
- `assets/app.js`
- `assets/style.css`
- `index.html`
- `modules/commentaries/jfb/books/*.json`
- `modules/commentaries/comentarios-de-la-biblia-del-diario-vivir/books/*.json`
- `modules/registry.json`
