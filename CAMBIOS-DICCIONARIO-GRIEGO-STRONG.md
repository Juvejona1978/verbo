# Diccionario Strong Verbo — sección griega completada

## Diagnóstico previo

- El Multiléxico Strong de Verbo solo tenía la sección hebrea (H1-H8674).
- El Nuevo Testamento de `rvg-2004-strong` ya traía códigos Strong griegos
  embebidos en `segments`, pero al tocarlos el diccionario no tenía
  ninguna entrada `G` que mostrar (manifest marcaba `"greek": "pendiente"`).

## Construcción de `entries-G.json`

- No fue posible descargar el léxico griego en prosa de 1890 (bloqueo de
  acceso automático a GitHub/raw en este entorno).
- Se construyó en su lugar a partir del módulo KJV con Strong de CrossWire
  Bible Society (Textus Receptus + KJV2003, dominio público/GPL), provisto
  como `KJV.zip`.
- Se escribió un parser propio del formato binario SWORD zText (`.bzs`/
  `.bzv`/`.bzz`) para extraer los 8,245 versículos del Nuevo Testamento
  con sus etiquetas `<w lemma="strong:G... lemma.TR:...">`.
- Se agregaron, por cada código G, la forma griega real, transliteración
  aproximada, morfología Robinson y las glosas KJV reales consolidadas
  por frecuencia.
- Corrección durante el proceso: cuando un código coexistía con el
  artículo griego en el mismo tag (p. ej. "ο χριστος"), una primera
  versión del script asignaba por error la forma del artículo a todos
  los códigos del tag. Se corrigió emparejando código↔forma griega por
  posición, no por primera coincidencia.
- Se priorizó la forma nominativa/presente cuando la morfología la
  identifica (p. ej. χριστος en vez de una variante flexionada), para
  acercarse al lema lexicográfico tradicional.

## Resultado

- 5,363 entradas G generadas (de 5,624 numeradas; los códigos sin uso en
  la KJV de origen quedan documentados como huecos reales, no inventados).
- Cobertura medida contra los códigos G realmente usados en el Nuevo
  Testamento de `rvg-2004-strong`: 97.79% (5,378 códigos usados, 119 sin
  dato disponible en la fuente).
- Prueba funcional: Mateo 1:1 (7 códigos G) resuelve el 100% contra el
  nuevo diccionario.

## Archivos modificados

- `modules/dictionaries/strong-verbo/entries-G.json` (nuevo)
- `modules/dictionaries/strong-verbo/manifest.json` (agrega `entryFiles.G`,
  actualiza `coverage.greek`, agrega `greekSource` con la procedencia real)
- `modules/dictionaries/strong-verbo/index.json` (agrega claves G al índice)

## Nota de transparencia

Esta sección griega no reproduce el texto en prosa del léxico original de
Strong (1890); se documenta así en el propio manifest (`greekSource`) para
que la procedencia quede clara si en el futuro se reemplaza por el léxico
original completo.
