# Proyecto RVG 2004 + Strong para Verbo

## Estado inicial

- RVG 2004 conservada literalmente.
- RV1960+ usada como primera fuente de alineación español-español.
- 31.102 versículos procesados.
- 336.748 etiquetas Strong transferidas de forma conservadora.
- Cobertura inicial: 89,8 % de las etiquetas presentes en la fuente.
- 1.670 asignaciones fuzzy de alta similitud; todas quedan identificables en el informe.
- Los casos no seguros no reciben etiqueta.

## Módulos creados

- `modules/bibles/rvg-2004-strong/`
- `modules/dictionaries/strong-verbo/`

## Herramientas reproducibles

- `tools/build_rvg_strong.py`
- `tools/build_strong_hebrew_dictionary.py`

## Próxima etapa

1. Usar KJV Strong para recuperar etiquetas omitidas por diferencias entre RV1960 y RVG.
2. Incorporar Strong griego público para el Nuevo Testamento.
3. Revisar automáticamente nombres propios, frases compuestas y partículas no traducidas.
4. Traducir y editar al español el diccionario público de Strong sin copiar traducciones modernas.
5. Publicar como versión estable cuando la auditoría alcance el umbral acordado.
