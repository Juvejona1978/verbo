# Verbo — Contexto del proyecto

Este archivo da contexto permanente sobre el proyecto Verbo (verbobiblia.com) para cualquier sesión de Claude Code en este repositorio. Léelo completo antes de proponer o ejecutar cambios.

## Qué es Verbo

Plataforma de estudio bíblico en español (verbobiblia.com), creada por Juan (pastor, teólogo y músico, con canal cristiano de 17,000+ suscriptores). Es un sitio estático en GitHub Pages, sin backend propio todavía.

**Posicionamiento:** Verbo no compite con Logos siendo "más completo". Está afilado para UN perfil: el pastor que sirve activamente (predica, enseña niños/adolescentes, forma maestros) — no el académico investigador.

**Modelo de negocio:** SaaS de pago real, con planes Individual / Pastor / Iglesia, más una beca para pastores en países de bajos ingresos. La Biblia (texto) siempre es gratuita; se cobra por herramientas y funciones avanzadas, nunca por el texto bíblico en sí.

## Regla de neutralidad doctrinal (NO NEGOCIABLE)

Línea de coherencia fija: comprensión judeocristiana del Antiguo Testamento + fe cristiana de la iglesia de los dos primeros siglos (pre-siglo III).

Todo lo posterior a esa línea (bautismo, predestinación, dones, escatología, etc.) se presenta MOSTRANDO las distintas posturas (reformada, arminiana, católica, ortodoxa, Padres de la Iglesia) con sus argumentos, sin declarar un ganador.

Tono exigido en cualquier contenido generado: aclarar e ilustrar, nunca señalar, condenar ni imponer.

## Estado legal del contenido — CRÍTICO, leer antes de tocar Biblias/comentarios/diccionarios

- **Texto original hebreo/griego** — dominio público. Usar libremente.
- **SpaRV / SpaRV1909 (Reina-Valera 1909, sin y con números de Strong)** — dominio público, del repositorio SWORD (crosswire.org). Es la Biblia que estamos integrando como principal mientras se resuelve el permiso de RVG.
- **RVG (Reina Valera Gómez)** — licencia CC BY-NC-ND. El propio texto de copyright del Dr. Humberto Gómez Caballero permite distribución gratuita, pero PROHÍBE expresamente el uso con fines de lucro sin permiso explícito. Juan ya le envió un correo pidiendo permiso (humberto_gmz@yahoo.com) — está PENDIENTE de respuesta. NO usar RVG como base de un producto de pago hasta tener esa confirmación por escrito.
- **Módulos de MySword (Barclay, multilexico, matthew-henry-es, comentarios de la Biblia del diario vivir, LBLA, JFB, MacArthur, MacDonald, Scofield, RVR1960-notas, Peshitta-notas, strong-prueba, etc.)** — convertidos desde SQLite de MySword, varios con copyright de editoriales (ej. Casa Bautista de Publicaciones). Eran contenido DE PRUEBA, no para producción. Deben eliminarse del sitio (carpetas + entradas en `modules/registry.json`) antes de cualquier lanzamiento de pago. EXCEPCIÓN: `ireneo-contra-herejias` y `strong-verbo` parecen curados a mano / dominio público reconstruido por Juan — NO eliminar estos dos sin confirmar con Juan primero.
- Regla general: nunca asumir que algo "disponible para descarga gratuita" significa "libre para uso comercial". Cada módulo tiene su propia licencia — verificar antes de integrar cualquier contenido nuevo a un producto de pago.

## Arquitectura del producto (decisión ya tomada, no rediscutir desde cero — actualizado 2026-06-23)

**Se elimina toda generación de IA en tiempo real en producción.** El sitio es y seguirá siendo estático en su totalidad: GitHub Pages solo sirve contenido que ya existe como archivo en el repo. Si una combinación versículo+categoría no ha sido generada todavía, simplemente no está disponible — nunca se genera "al vuelo" para el usuario que la pide. No hay cache-on-first-use en producción.

Razón del cambio (reemplaza el plan anterior de IA respondiendo por clic): la generación de IA en el momento del clic produce variaciones de redacción entre una consulta y otra del mismo versículo/categoría. Esto genera desconfianza en el usuario (pastor/ministro), que percibe inconsistencia doctrinal donde solo hay variación de estilo — riesgo inaceptable para un producto que depende de la confianza del usuario en la fidelidad del contenido.

**Nuevo modelo: generación previa, revisada, fija.**
- Todo el contenido teológico (Biblia modernizada, comentarios, diccionario Strong) se genera **una sola vez, de antemano**, vía Claude Code desde la terminal de Juan contra este mismo repositorio — el mismo patrón que ya se usó para integrar RVA 1909.
- Cada pieza de contenido pasa por el **meta-prompt de "revisión teológica brutal" de Juan antes de comitearse al repo** (ver pendiente: este meta-prompt aún no existe como documento formal).
- Una vez comiteado, el contenido es fijo. No se regenera en producción bajo ninguna circunstancia automática; cualquier corrección futura es un cambio deliberado y versionado, hecho por Juan + Claude Code, igual que cualquier otro commit.
- Generación de IA (Claude/ChatGPT) se usa exclusivamente como **herramienta de trabajo offline** (traducción de fuentes reales, asistencia en modernización del texto bíblico, borradores de diccionario) — nunca como servicio en vivo de cara al usuario final.
- Orden de resolución de fuentes al generar contenido: (1) buscar primero en archivos reales de dominio público (Matthew Henry, diccionario Strong completo) que Juan tiene en PDFs/repos en su PC — nunca generar texto nuevo atribuido a un comentarista histórico real; (2) si se necesita otro idioma, traducir el fragmento real encontrado (no inventar); (3) generar contenido con IA solo cuando no hay fuente real disponible, siempre bajo la regla de neutralidad doctrinal.

El asistente de IA conversacional (chat libre, separado de los paneles fijos) sigue siendo una idea para el futuro, fuera del alcance de esta fase. Si se construye, respondería preguntas libremente en una ventana de chat, pero **nunca escribiría directamente en un panel fijo** del sitio (Comentario, Exégesis, etc.).

Módulos guiados (Preparar enseñanza, Niños, Adolescentes): la IA GUÍA con preguntas, nunca genera la prédica/lección terminada para usar tal cual. El pastor es el autor real del contenido final.

## Alcance del lanzamiento de prueba (familiares + pastores/ministros amigos)

Objetivo: validar el contenido, no el producto completo. Login/cuentas NO forman parte de esta fase. Acceso de solo lectura para todos.

**Componentes requeridos para considerar el sitio "listo para prueba":**
1. Biblia propia — modernización de RV1909 (framework 🟢/🟡/🔴 ya definido en sesiones previas).
2. La misma Biblia modernizada + números Strong enlazados.
3. Diccionario Strong en español — traducción/elaboración propia, no genérica.
4. Comentarios — mínimo 2: **Matthew Henry** (traducido del repo original en inglés que Juan ya tiene, dominio público; primero en la cola) + un segundo autor por definir (candidatos: Calvin, Wesley, Barnes, Keil & Delitzsch, Scofield, o Ireneo —ya integrado como módulo patrístico—).

**Orden de trabajo confirmado por Juan:** (1) traducción de Matthew Henry al español, (2) modernización bíblica de RV1909, (3) diccionario Strong en español, (4) continuar con el segundo comentario y el resto una vez resuelto qué autor usar.

**Eliminado/pospuesto explícitamente de esta fase:**
- Sección de Exégesis: eliminada de esta fase (pendiente decidir si se oculta del todo o queda visible como "próximamente" — preguntar a Juan antes de tocar la UI de este panel).
- Resto de paneles (Comparar, Mis notas, Tema, Biblioteca, Padres Apostólicos, Evangelio cronológico): no bloquean el lanzamiento, se llenan progresivamente.
- Login, notas de usuario, Stripe: pospuestos a una fase posterior.
- Asistente conversacional de IA: pospuesto indefinidamente, sin diseño aún.

## Infraestructura técnica decidida

- **Hosting:** GitHub Pages (estático) es suficiente para Biblia, Biblia+Strong, diccionario Strong y comentarios — todo JSON/archivos planos, mismo patrón que `modules/bibles/rva-1909/`. No se necesita backend para servir contenido mientras no haya IA en vivo en producción.
- **Supabase (auth + DB), login de usuario, "Mis notas", Stripe:** pospuestos — no bloquean el lanzamiento de prueba. Se implementan en una fase posterior, cuando el contenido ya esté validado por los primeros testers. (Decisión de usar Supabase para esa fase posterior sigue en pie, no rediscutir Railway/VPS salvo que Juan lo pida explícitamente.)
- **API de IA (uso offline, generación de contenido):** Claude Sonnet 4.6.
- El sitio HOY no tiene backend, ni base de datos, ni autenticación, ni APIs externas conectadas — es 100% estático. Confirmado por exploración del repositorio.

## Pendientes abiertos (sin resolver aún, no bloquean empezar a trabajar)

- ¿Cuál es el segundo comentario? (ver candidatos arriba).
- ¿El panel de Exégesis se oculta del menú o queda visible como "próximamente"?
- El meta-prompt de "revisión teológica brutal" no existe como archivo todavía — formalizarlo y guardarlo en el repo (ej. `docs/meta-prompt-revision-teologica.md`) es necesario antes de poder aplicarlo de forma sistemática a cada pieza de contenido generada.
- Respuesta del Dr. Humberto Gómez Caballero sobre licencia comercial de RVG (sigue sin respuesta). Si llega aprobación: recuperar del historial de git (`git show 055faf6:modules/bibles/rvg-2004/...` o ruta equivalente) antes de reintegrar a `registry.json` — no estaba aprobada para uso comercial, solo existía como contenido de prueba.

## Cómo trabajar con Juan

- Juan tiene comodidad técnica media: puede seguir instrucciones paso a paso, pero no domina frameworks ni terminología técnica a profundidad. Explica los comandos en términos simples antes o al pedir su aprobación.
- Juan revisa y aprueba cada paso — no asumas luz verde para cambios que toquen el repositorio real, `registry.json`, o cualquier `git commit`/`git push`. Los cambios que solo exploran, leen, o trabajan en archivos temporales (`/tmp/`) son de bajo riesgo y pueden proponerse con confianza.
- Antes de borrar o desactivar cualquier módulo de Biblia/comentario/diccionario, presenta el plan completo (qué se borra, qué se mantiene, por qué) y espera confirmación explícita de Juan.
- El control de calidad teológico de contenido generado usa un meta-prompt propio de Juan ("revisión teológica brutal") — si se genera contenido teológico, debe pasar por ese proceso. Preguntar a Juan por el meta-prompt si no está disponible en el repositorio.

## Estado actual del trabajo (actualizar conforme se avance)

- Explorado el repositorio completo: estructura, módulos de Biblias/comentarios/diccionarios, confirmado que es estático sin backend.
- Reina-Valera 1909 (RVA 1909, SpaRV1909 de crosswire.org, dominio público) integrada como Biblia en el sitio: 66 libros + manifest + entrada en `registry.json`. Solo texto plano, sin números Strong (esa capa tiene licencia "Permission to distribute granted to CrossWire", no claramente extensible a Verbo). Verificado en vivo (selector, carga de texto, navegación) — funciona correctamente. Publicado en GitHub.
- Módulos de MySword de prueba ELIMINADOS (2026-06-23, commit `09f01f4`): comentarios (matthew-henry-es, comentarios-de-la-biblia-del-diario-vivir, lbla, jfb, macarthur, macdonald, scofield, rvr1960-notas, peshitta-notas), biblioteca (nelson, arqueologico, geografia, usos-costumbres, barclay), diccionarios huérfanos no conectados al sitio (barclay, multilexico, strong-prueba, barclay-verbo), y la Biblia huérfana rv1960-strong (RV1960 con Strong, nunca conectada al sitio).
- Limpieza ampliada por instrucción explícita de Juan (2026-06-23, commit `1df794d`): se eliminaron TODAS las demás traducciones bíblicas con copyright editorial (RVG 2004, RVG 2004+Strong, NVI 1984, NTV, DHH, Biblia en Lenguaje Sencillo, Jünemann, LBLA, Biblia del Oso, Nácar-Colunga) y el diccionario strong-verbo. **El sitio hoy solo tiene una Biblia: RVA 1909 (dominio público), que es ahora la `defaultBible`.** Se mantuvieron únicamente como excepción: `ireneo-contra-herejias` (comentario + patrística, traducción propia de Juan, licencia CC BY-NC-ND no comercial) y `gospel/evangelio-uf` (Evangelio cronológico). `modules/dictionaries/` y `modules/library/` quedaron sin ningún módulo. Verificado en vivo tras cada borrado (selector, navegación, paneles) sin errores de consola. Ambos commits publicados en GitHub.
- Importante para cualquier sesión futura: si se vuelve a hablar de "las Biblias del sitio" o "la Biblia RVG", recordar que YA NO EXISTEN en el repo — solo queda RVA 1909. Antes de reintroducir cualquier traducción con copyright (RVG, NVI, NTV, DHH, LBLA, etc.) a producción, se necesita resolver la licencia correspondiente (ver caso RVG/Dr. Gómez abajo) — no asumir que estaban aprobadas porque existieron antes de esta limpieza.
- Correo enviado por Juan al Dr. Humberto Gómez Caballero solicitando permiso de uso comercial de RVG — esperando respuesta. (Nota: el módulo RVG ya no está en el repo; si llega el permiso, habría que reconstruirlo o recuperarlo del historial de git antes de reintegrarlo.)
