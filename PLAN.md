# Verbo — Plan de Trabajo y Recursos Disponibles

*Actualizado: 2026-06-28*

---

## Estrategia General (decisión tomada 2026-06-28)

En lugar de traducir manualmente los 50+ libros pendientes de Matthew Henry al español, la estrategia es:

1. **Subir MH en inglés** — módulo `matthew-henry-en` con los 66 libros extraídos del ZIP fuente, verse-level real del original histórico
2. **Traducción automática** — botón EN/ES en el panel de comentario. Default: español (traducción automática via API MyMemory con caché localStorage). Clic "EN" muestra el original inglés.
3. **Biblia bilingüe** — agregar ASV (American Standard Version) como segunda Biblia en inglés, para vista bilingüe RVA-1909 + ASV
4. **Nueva RV española** — versión propia basada en RV1909, trabajada individualmente con Juan. La rva-1909 original permanece como módulo separado.

---

## Inventario Completo de Recursos Disponibles

### BIBLIAS

| Módulo | Idioma | Estado | Fuente |
|--------|--------|--------|--------|
| rva-1909 | ES | ✅ En proyecto, 66 libros completos | SWORD SpaRV1909, dominio público |
| Nueva RV (edición Verbo) | ES | 🔜 Pendiente — base: rva-1909 | Edición propia, individual con Juan |
| American Standard Version (ASV) | EN | 📦 Listo para extraer | `Archivos Verbo.zip` → `american_standard_version.zip` (74 .htm) |

> Las biblias en español se tratan individualmente con Juan antes de publicar.

---

### COMENTARIOS — GRUPO A: Formato HTML/texto, extraíbles ya

| Recurso | Idioma | Cobertura | Formato | Fuente |
|---------|--------|-----------|---------|--------|
| **Matthew Henry Complete (MHC)** | EN | 66 libros | HTML `.HTM` | `matthew_henry.zip` en raíz del repo |
| DTN (Devotional Treasury Notes) | EN | NT | `.vss` texto plano | `Archivos Verbo.zip` → `DTN.zip` |
| TFG (Fourfold Gospel) | EN | Evangelios | `.vss` con marcas | `Archivos Verbo.zip` → `TFG.zip` |

---

### COMENTARIOS — GRUPO B: Formato SWORD binario (.bzs/.bzv/.bzz), requieren parser

Todos son **comentarios completos en inglés** de alta calidad histórica, dominio público o licencia abierta.

| Recurso | Cobertura | Valor pastoral | Tamaño ZIP |
|---------|-----------|----------------|-----------|
| **JFB** (Jamieson-Fausset-Brown) | 66 libros | ⭐⭐⭐ clásico evangélico | 5.7 MB |
| **Clarke's Commentary** | 66 libros | ⭐⭐⭐ metodista erudito | 8.6 MB |
| **Wesley's Explanatory Notes** | 66 libros | ⭐⭐ pietismo wesleyano | 1.9 MB |
| **Calvin Commentaries** | ~50 libros | ⭐⭐⭐ reforma reformada | 20.9 MB |
| **Keil & Delitzsch (KD)** | AT completo | ⭐⭐⭐ exégesis hebrea clásica | 11.2 MB |
| **Barnes' Notes** | 66 libros | ⭐⭐ | 5.8 MB |
| **TSK** (Treasury of Scripture Knowledge) | 66 libros | Referencias cruzadas | 2.6 MB |
| **Scofield Reference Notes** | 66 libros | ⭐⭐ | 0.5 MB |
| **King Comments** | 66 libros | ⭐⭐ | 9.0 MB |
| Abbott / Burkitt | NT | menor | < 1 MB |

> **Acción pendiente:** Escribir parser Python para formato SWORD zcom (.bzs + .bzv + .bzz = bzip2 en bloques). Desbloquea 9+ comentarios completos de golpe.

---

### HERRAMIENTAS DE REFERENCIA

| Recurso | Tipo | Formato | Estado |
|---------|------|---------|--------|
| Strong's Greek (XML) | Diccionario lexical griego | XML parseable | `strongs-dictionary-xml-master.zip` |
| Brown-Driver-Briggs (BDB) | Léxico hebreo | XML parseable | `HebrewLexicon-master.zip` |
| STEPBible-Data | Bíblias interlineales + léxicos | TSV/TXT | `STEPBible-Data-master.zip` |
| Strong's Hebrew | Diccionario lexical hebreo | SWORD `.dat/.idx` | `StrongsHebrew.zip` |
| Strong's Greek (compiled) | Diccionario lexical griego | SWORD `.zdt` | `StrongsGreek.zip` |
| Robinson / OSHM / Packard | Morfología griega | SWORD `.zdt` | varios ZIPs |
| Westminster Confession | Documento teológico | SWORD genbook | `Westminster.zip` |
| Baptist Confession 1689 | Documento teológico | SWORD genbook | `BaptistConfession1689.zip` |
| ISBE | Enciclopedia bíblica internacional | SWORD `.zdt` | `ISBE.zip` |
| Smith's Bible Dictionary | Diccionario bíblico | SWORD `.dat/.idx` | `Smith.zip` |

---

### PADRES APOSTÓLICOS (español, ya en proyecto)

| Documento | Estado |
|-----------|--------|
| Ireneo contra Herejías | ✅ Módulo JSON en proyecto (`ireneo-contra-herejias`) |
| Clemente, Didaché, Hermas, Bernabé, etc. | 📦 PDFs + DOCX en `PA.zip` → Padres Apostólicos/ |

---

## Fases de Trabajo

### FASE 1 — Matthew Henry en inglés completo ⬅ PRIORIDAD INMEDIATA

**Qué:** Extraer los 66 libros de `matthew_henry.zip` → módulo `matthew-henry-en`
**Por qué:** Verse-level real del original, sin traducción manual. Los 66 libros quedan disponibles de inmediato.
**Cómo:**
- Script Python: lee cada `MHC{num}{cap}.HTM`, extrae secciones por `<A NAME="SecN">`, limpia HTML
- Verse ranges: extraídos del texto del capítulo introductorio (patrones `ver. N-M`)
- Genera JSON con mismo esquema que `matthew-henry-es`
- Módulo ID: `matthew-henry-en`, language: `"en"`

**UI — Botón traducir:**
- Panel de comentario muestra español por defecto (traducción automática vía MyMemory API)
- Caché en localStorage (cada entrada se traduce solo una vez por dispositivo)
- Botón "EN" muestra el original inglés
- América Latina = prioridad → español siempre visible primero

**Entregable:** `modules/commentaries/matthew-henry-en/` completo + botón EN/ES en `assets/app.js`

---

### FASE 2 — ASV como Biblia en inglés

**Qué:** Parsear `american_standard_version.zip` (74 archivos .htm) → módulo `american-standard-version`
**Por qué:** Habilita vista bilingüe Biblia ES + EN en columnas
**Cómo:** Script Python lee los HTM del ASV, extrae versículos, genera JSON con mismo formato que rva-1909
**Entregable:** `modules/bibles/american-standard-version/` + selector en UI

---

### FASE 3 — Parser SWORD para comentarios del Grupo B

**Qué:** Escribir decoder Python para formato SWORD zcom4 (`.bzs` = índices, `.bzv` = datos bzip2)
**Por qué:** Desbloquea JFB, Clarke, Wesley, Calvin, KD, Barnes, TSK, Scofield — 8 comentarios completos en un solo paso
**Cómo:** El formato SWORD zcom tiene bloques de 200 versículos. Cada bloque está comprimido con bzip2. El `.bzs` contiene los offsets. Con esto se puede leer cualquier versículo sin la librería SWORD.
**Entregable:** `tools/sword_reader.py` + módulos JSON para los 8+ comentarios

---

### FASE 4 — Herramientas de referencia (Strong's + BDB + STEPBible)

**Qué:** Convertir Strong's XML y BDB XML a módulos diccionario del sitio
**Por qué:** Completa la capa de herramientas de estudio (números Strong clickeables → definición)
**Cómo:** STEPBible-Data tiene Tagged Bibles (texto bíblico con números Strong en TSV); BDB y Strong XML son parseables directamente
**Entregable:** módulos diccionario actualizado + integración con lector bíblico

---

### FASE 5 — Nueva Biblia RV española (edición Verbo)

**Qué:** Versión propia del texto bíblico basada en RV1909, trabajada individualmente con Juan
**Reglas:**
- La rva-1909 original NO se borra — permanece como módulo separado
- La nueva edición Verbo tiene su propio module ID y nombre
- Se trabaja libro por libro con revisión de Juan antes de publicar
**Entregable:** `modules/bibles/rv-verbo/` (nombre a confirmar con Juan)

---

## Notas Técnicas

### Formato SWORD zcom (para referencia del parser)
```
archivo.bzs → tabla de offsets: (offset_en_bzv, tamaño_comprimido) por cada versículo
archivo.bzv → datos: bloques bzip2 concatenados
archivo.bzz → bloques de texto sin comprimir (alternativa)
```

### API de traducción en uso
- **MyMemory API** (gratuita, sin key): `https://api.mymemory.translated.net/get?q=TEXT&langpair=en|es`
- Límite: 5000 chars/request sin key (registrar email para 50K)
- Caché: localStorage key `mh-trans-{entryId}`

### Estructura de módulo comentario
```
modules/commentaries/{id}/
  manifest.json       → id, name, abbreviation, language, books[]
  books/{BOOK_ID}.json → { entries: [ {id, title, author, reference, content} ] }
```
