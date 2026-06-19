# Módulos JSON de Verbo — esquema v2

Verbo carga cada recurso mediante `modules/registry.json`.

## Biblia propia

Cada Biblia contiene `manifest.json` y un JSON por libro. Un versículo sencillo puede ser:

```json
{"text":"En el principio creó Dios..."}
```

Una Biblia con Strong puede añadir segmentos:

```json
{
  "text":"En el principio creó Dios...",
  "segments":[
    {"text":"En"},
    {"text":"el"},
    {"text":"principio","strong":"H7225","morph":"NCcSFC"}
  ]
}
```

## Comentario propio

Cada entrada admite rangos de versículos:

```json
{
  "id":"comentario-rom-7-14",
  "title":"Romanos 7:14",
  "author":"Juan",
  "reference":{"book":"ROM","chapterStart":7,"verseStart":14,"chapterEnd":7,"verseEnd":17},
  "content":"<p>Contenido del comentario.</p>"
}
```

## Diccionarios

Los diccionarios grandes pueden dividir sus entradas por prefijo con `entryFiles` en el manifiesto. La app carga únicamente el archivo G o H cuando se consulta un código.

## Recursos incorporados en esta versión

- RVG 2004
- Jünemann
- RV1960+ con Strong
- Comentario de Matthew Henry
- Multiléxico

La administración y verificación de licencias corresponde al propietario del proyecto.

## Diccionarios múltiples y exégesis

El `registry.json` ahora acepta estas listas:

```json
"dictionaries": [
  "dictionaries/multilexico/manifest.json",
  "dictionaries/otro-diccionario/manifest.json"
],
"exegesis": [
  "exegesis/mi-exegesis/manifest.json"
]
```

### Diccionarios léxicos / Strong

Pueden usar `entriesFile` o `entryFiles`, como el módulo `multilexico`. Se consultan al tocar un código Strong.

### Diccionarios con enlaces a versículos

También pueden funcionar con estructura parecida a comentarios:

```json
{
  "id": "barclay",
  "name": "Barclay",
  "abbreviation": "Barclay",
  "books": [
    { "id": "ROM", "name": "Romanos", "file": "books/ROM.json" }
  ]
}
```

Y cada archivo de libro:

```json
{
  "entries": [
    {
      "id": "barclay-ROM-7-1",
      "title": "Romanos 7:1",
      "author": "Barclay",
      "reference": { "book": "ROM", "chapterStart": 7, "verseStart": 1, "chapterEnd": 7, "verseEnd": 6 },
      "content": "Texto del diccionario o recurso exegético."
    }
  ]
}
```

Si el diccionario trae enlaces por versículo, Verbo lo muestra dentro del panel **Diccionario** y lo sincroniza con el versículo activo.

### Exégesis

La pestaña **Exégesis** está lista para módulos propios. Usa la misma estructura por libro/capítulo/versículo que los comentarios o diccionarios enlazados por pasaje.
