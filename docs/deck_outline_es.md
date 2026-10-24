# Voces de la Plaza · esquema de presentación

Estado: **contenido estable y deck PDF de diez páginas producido**, 24 de octubre de 2026. Narrativa: cuatro páginas Letter, 11 pt; deck: diez páginas 16:9. Asset QA inspeccionó las catorce páginas sin recortes. No se afirma que exista PPTX. El MP4 producido es silencioso con subtítulos y transcripción aparte; no se grabó voz. El [guion opcional](pitch_script_es.md) no es una grabación de narración ni un requisito para el video actual.

La evidencia actual incluye exportaciones web/Linux, Python 22, Node 17 y Godot GUT 9/9 aprobadas (40 aserciones, cero huérfanos), recorrido HTML Playwright y arranques Godot web/Linux. Ver [verification.md](verification.md) para alcance y capturas. No se ha realizado evaluación formal con lector de pantalla ni pilotaje; no están completos todos los controles manuales. Usar capturas del candidato probado y etiquetar diagramas/maquetas.

## Diapositiva 1 · La pregunta

**Texto en pantalla:** “Voces de la Plaza”. “¿Cómo convertir datos de participación en una conversación comprensible?” “INEhack · Reto 3”.

**Visual:** título y ruta “Comprender → conversar → dar seguimiento”; imagen original de la plaza si está disponible y atribuida. No inventar nombre de equipo o integrantes.

**Nota de exposición:** presentar una actividad para personas adultas principiantes y facilitadoras. Duración objetivo de la aventura: 10–15 minutos, pendiente de comprobar.

## Diapositiva 2 · Dos cifras, dos denominadores

**Texto en pantalla:** “CCPC federal 2024 · nacional”. “59.7% entre registros clasificados: SV/(SV+NV)”. “6.4% sin clasificación: NS/LN”. “Sin clasificación no significa abstención”.

**Visual:** dos fichas separadas con unidades, denominadores y fuente; nunca un pastel que mezcle ambas medidas.

**Nota de exposición:** aclarar el universo del dato y sus exclusiones. No equivale a preferencias por partido ni explica motivos individuales. Fuente: INE, ZIP/diccionario de 2024; registro nacional de `ccpc.json`.

## Diapositiva 3 · La historia y su alcance

**Texto en pantalla:** “Villa Brisa: una plaza, tres personajes”. “Dos misiones CCPC + consulta ficticia + exhibición final”. “Una historia breve, en español de México”.

**Visual:** diagrama de Luz/prensa → Mateo/cartel → Inés/consulta, con nombres tomados de `story.json`.

**Nota de exposición:** la exhibición conserva hallazgos, fuentes y límites; las recompensas reconocen razonamiento y reflexión. No atribuir a la ficción un efecto en participación real.

## Diapositiva 4 · Misión 1: La prensa de las voces

**Texto en pantalla:** “Distingue SV, NV y NS”. “Construye un boletín con año, lugar, fórmula y fuente”. “Consulta, explica, vuelve a intentar”.

**Visual:** interacción real verificada o diagrama rotulado “Diseño de interacción”; ficha de fuente y tabla exacta.

**Nota de exposición:** mostrar cómo un registro determina el resultado y la explicación. La ayuda está prevista; ayuda e intento independiente se distinguen. Con denominador cero, valor nulo y explicación, nunca un 0% inventado.

## Diapositiva 5 · Misión 2: El mapa que no lo dice todo

**Texto en pantalla:** “Más registros ≠ tasa mayor”. “Aguascalientes: 626,084 SV; 58.66%”. “Baja California: 1,396,335 SV; 47.05%”. “Combinados: 50.12%, sumando conteos primero”.

**Visual:** tabla/comparación con 2024, denominadores SV+NV de 1,067,306 y 2,968,011, respectivamente. Paneles “El dato muestra / No permite saber / Faltan datos”.

**Nota de exposición:** no promediar tasas para representar el conjunto. El promedio simple de 52.85% responde a otra operación. No inferir motivación ni valor cívico de las comunidades. Fuente: agregados `state_01`, `state_02` y suma documentada.

## Diapositiva 6 · Una plaza, varias ideas

**Texto en pantalla:** “Consulta ficticia: reglas y límites visibles”. “Sombra y bancas · rincón de lectura · jardín comunitario”. “Elegir, dejar sin marcar o no participar permite el mismo final”. “Después: ¿qué se hizo con los recursos?”

**Visual:** tres proyectos con idéntica jerarquía. Si se muestran resultados, rótulo “Escenario ficticio”; no usar sello de dato INE.

**Nota de exposición:** las preferencias son inventadas; no dependen de CCPC. La elección y los resultados que permitan reconstruirla no deben persistirse. Un voto cuenta aunque su opción no gane; un empate tiene estado explícito. Verificar técnicamente estas reglas antes de afirmar que pasaron pruebas.

## Diapositiva 7 · Acceso previsto por dos rutas

**Texto en pantalla:** “Aventura Godot + HTML semántico”. “HTML automatizado: recorrido completo y anchos 320/768/1440 px”. “Teclado, texto ampliable, tablas, silencio y movimiento reducido: diseño y revisión”. “Evaluación formal con lector de pantalla pendiente”.

**Visual:** dos rutas hacia los mismos hallazgos y final. Capturas etiquetadas solo según lo realmente disponible.

**Nota de exposición:** Playwright completó HTML sin el lienzo, revisó persistencia y ausencia de desbordamiento horizontal en los estados comprobados. El script no acredita navegación solo con teclado, contraste, zoom ni evaluación formal de lector de pantalla. Linux fue exportado y arrancó sin interfaz; su recorrido manual sigue pendiente. No prometer caché web sin conexión o conformidad WCAG.

## Diapositiva 8 · Reproducción y estado real

**Texto en pantalla:** “Godot 4.7.2 + plantillas: SHA-512 oficial verificado”. “CCPC: SHA-256 coincidente; 32 CSV; 9,773,730 filas; 33 agregados”. “Python 22 · Node 17 · Godot GUT 9/9; 40 aserciones, 0 huérfanos”. “Exportaciones web/Linux y arranques comprobados”.

**Visual:** flujo ZIP/diccionario → validación → JSON compartidos → ambas rutas. Referenciar registros locales sin exponer rutas privadas como único acceso al evaluador.

**Nota de exposición:** evidencia: `.tools/toolchain.json`, `data/validation_report.json`, `game/content/ccpc.json`, reporte/capturas en `build/evidence/` y confirmación final de main. GUT incluye siete pruebas de reglas y dos de recorrido reparadas. Playwright completa HTML y comprueba arranque Godot web con cero errores capturados; Linux pasa arranque sin interfaz. No afirmar recorrido manual completo. Los 33 agregados son nacional + 32 entidades. La aritmética no acredita exhaustividad o unicidad.

## Diapositiva 9 · Reutilización y evaluación propuestas

**Texto en pantalla:** “Talleres cívicos · bibliotecas · canales digitales autorizados”. “Guía de facilitación y fuentes reutilizables”. “Comprobar: un hallazgo, un límite, una pregunta de seguimiento”. “Sin resultados de aprendizaje o impacto electoral acreditados”.

**Visual:** tres espacios de uso con sus condiciones de acceso y una tarjeta de preguntas; sin barras de resultados inventadas.

**Nota de exposición:** son canales propuestos, no adopción institucional confirmada. Si se realizan sesiones, separar barreras, apoyo, comprensión y disfrute; informar participantes y límites reales. Si no hay pilotaje, presentar el diseño de evaluación como futuro. Consultar `facilitator.md` y la narrativa de difusión.

## Diapositiva 10 · Cierre y siguiente paso

**Texto en pantalla:** “Comprender los datos. Conversar con información. Dar seguimiento”. “Borradores locales producidos: revisión del equipo y acceso para evaluación”. “Arte y sonidos finales originales; fuentes y licencias visibles”.

**Visual:** exhibición final real o diagrama de propuesta; referencia legible a fuentes y material complementario disponible. Añadir enlaces/QR solo tras comprobar destino y permisos.

**Nota de exposición:** exportaciones y borradores locales producidos. Main confirma narrativa PDF de cuatro páginas, deck de diez y QA visual de las catorce sin recortes; MP4 silencioso con subtítulos de 108.07 s, 1920×1080, 30 fps, H.264 High, yuv420p, con SRT y transcripción aparte. Las 48 pruebas pasan: Python 22, Node 17, Godot 9. Quedan revisión del equipo, cartas firmadas, alojamiento, lector de pantalla y pilotaje. No anunciar voz grabada, envío, publicación o firmas.

## Fuentes y control editorial dentro del límite

Usar [registro de fuentes](source_register.md) para portal CCPC, ZIP/diccionario, manual y convocatoria; cifras y métodos en [datos compartidos](../game/content/ccpc.json) y [reporte](../data/validation_report.json); ficción en [story.json](../game/content/story.json). Los hipervínculos locales deben sustituirse o acompañarse con referencias accesibles al empaquetar. El contenido narrativo para el PDF está en [storyline_and_dissemination_es.md](storyline_and_dissemination_es.md).

Al cerrar el deck generado, comprobar capturas del candidato, denominador/año/fuente, alcance real de pruebas y pendientes visibles. El conteo PDF de diez páginas está confirmado por main; preservar ese máximo en revisiones. Main actualizará el handoff y checklist final después de completar la revisión de los artefactos.
