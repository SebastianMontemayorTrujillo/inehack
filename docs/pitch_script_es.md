# Voces de la Plaza · guion de pitch

**Equipo Latas · Secuencia guiada y campaña rosa · 27 de octubre de 2026.** Presupuesto editorial de **hasta 150 segundos**, incluidos transiciones y cierre; no es una duración medida. La grabación conserva la composición existente: entrada real en el canvas Godot y recorrido real de HTML, con subtítulos incrustados, SRT y transcripción. Aplica el [diseño secuencial aprobado](sequential_campaign_design.md). El [registro de verificación](verification.md) identifica el alcance técnico.

La revisión anterior está preservada en el [manifiesto histórico](../build/media-review-sequential-2026-10-27/history-campaign/manifest.json). La producción final exige el recorrido nativo nuevo aprobado y exports con fuentes idénticas a la revisión actual. El [recibo de codificación](../build/evidence/pitch-encoding.json) identifica la grabación, duración medida, resolución, fuentes y PDF realmente descargado. La música tranquila CC0 «Sunset Walk», de KiluaBoy, pertenece al juego; el pitch es silencioso y no permite evaluar comodidad auditiva. No contiene imágenes ni respuestas del alumnado.

## Guion editorial

<!-- NARRATION_START -->

### 00:00–00:22 · Tres casas abiertas

Latas presenta Voces de la Plaza, una aventura cívica para bachillerato y personas adultas principiantes. Las tres casas abren desde el inicio; hablamos con Luz a la izquierda, Mateo al centro e Inés a la derecha. En Godot caminamos con WASD hasta Luz y hablamos con E cerca de ella. Los personajes inician las lecciones; la prensa sólo sirve para la campaña final. HTML tiene navegación propia.

### 00:22–00:51 · Luz y lo que no sabemos

Luz explica qué representa un registro y abre las preguntas. Usamos datos del INE sobre participación federal de 2024. En el agregado nacional, cerca de sesenta de cada cien registros con información conocida tienen marca de voto. Los registros sin clasificación se muestran aparte: no sabemos si participaron. El boletín conserva cifras exactas, fuente y límites.

### 00:51–01:13 · Mateo y una comparación justa

Mateo inicia la comparación; el tablón permite revisar el cartel. Baja California tiene más registros con marca, pero Aguascalientes tiene mayor proporción. El porcentaje pregunta cuántos de cada cien participaron entre quienes tienen información conocida. Leemos sin juzgar a las comunidades. Las seis preguntas usan lenguaje sencillo y ofrecen apoyo y ejemplos nuevos; calcular es opcional.

### 01:13–01:28 · Un cartel propio, opcional

El taller permite elegir dos de 32 entidades, cantidad o proporción y una pregunta neutral. Revisamos datos, bases, desconocidos, fuente y límites. Guardar conserva la publicación durante la sesión. Si omitimos el taller, Inés ofrece la comparación guiada AGS/BC por proporción.

### 01:28–01:46 · Consulta ficticia y seguimiento

Inés presenta sombra y bancas, lectura y jardín. Los conteos son inventados. Elegir A, B o C, dejar sin marcar o no participar, y una pregunta neutral de seguimiento, habilitan la campaña. Ninguna preferencia se califica ni se guarda.

### 01:46–02:16 · Inés, Luz, impresión y FIN

Inés revisa el diseño y lo encarga a Luz dentro de la ficción. Volvemos a la casa izquierda; en Godot caminamos hasta la prensa. **Imprimir cartel** completa la aventura. Una revelación de hasta 2.5 segundos lleva a **FIN · La campaña comienza contigo**; E, Enter o el botón permiten omitirla y reducir movimiento la evita. Descargar es opcional. Ampliamos el cartel rosa y desplazamos los datos: FIN y Descargar, Ampliar o volver al resumen y Seguir explorando permanecen visibles. El PDF Carta dice «Tu voto cuenta. Infórmate y participa.»: campaña ciudadana original con fuente INE/CCPC, sin marcas de equipo, sello oficial ni resultado ficticio.

### 02:16–02:30 · Reutilización y límites

Guía y hoja permiten trabajo individual, en parejas, con proyector o en papel. Los tiempos son propuestos; todavía no hay pilotaje con docentes y estudiantes ni certificación formal. El juego tiene música CC0 opcional; esta demostración no tiene audio. No atribuimos eficacia educativa ni efectos electorales.

<!-- NARRATION_END -->

## Apoyos visuales y edición

| Tiempo objetivo | Imagen y texto legible | Fuente y límite |
| --- | --- | --- |
| 00:00–00:22 | Plaza, camino WASD a la casa izquierda y acercamiento a Luz con E; después portada HTML. | Export actual; distinguir las dos rutas. El orden del aprendizaje no cierra las casas. El personaje y la prensa tienen funciones distintas. |
| 00:22–00:51 | Boletín: 59.67% entre 92,004,694 clasificados. NS: 6.43% de 98,330,348 totales. | INE, ZIP/diccionario 2024, `national`. Bases distintas; no unir en un pastel del 100%. Ejemplo 60/30/10 rotulado inventado. |
| 00:51–01:13 | AGS 626,084 / 1,067,306 = 58.66%; BC 1,396,335 / 2,968,011 = 47.05%. | `state_01`/`state_02`; con marca / clasificados. Ejemplo A:20/40 y B:60/200 separado como ficción. |
| 01:13–01:28 | Selección, cambio de medida, vista previa rosa y publicación del cartel. | Operaciones reales HTML. Godot guarda sin cambiar de lugar y exige caminar a Inés. No atribuir vistas nuevas a capturas antiguas. |
| 01:28–01:46 | Proyectos de igual jerarquía, cinco acciones, resultado inventado y seguimiento. | Acción de demostración «no participar», sin elecciones del alumnado. La consulta no produce FIN por sí sola. |
| 01:46–02:16 | Inés: envío; regreso a Luz; «Imprimir cartel», revelación, FIN, cartel ampliado y descarga real. | Revelación medida, controles visibles al desplazar el cartel, cierre en la misma casa y reapertura sin animación. Conservar hash del PDF descargado. Enviar es ficción; descargar o imprimir físicamente es opcional. |
| 02:16–02:30 | Guía, hoja y regreso al final neutral. | Recursos congelados. Recargar conserva el final, sin reconstruir el PDF personal. Sin pilotaje ni eficacia demostrada. |

Los intervalos anteriores son objetivos editoriales. `tools/record_pitch.mjs --self-test` comprueba 32 escenas, las seis actividades canónicas y **126.5 segundos de pausas legibles**; el camino a Luz y las transiciones consumen parte del margen hasta 150. La grabación atraviesa encargo, prensa, revelación, FIN, ampliación y descarga con controles reales, sin sembrar progreso terminado. Cinco escenas muestran también la pregunta; la ampliación muestra también el pie del cartel. El recibo conserva las identidades de fuentes, exports, video fuente, salida, subtítulos, transcripción y PDF descargado.

Conservar texto legible en la banda inferior: subtítulos de hasta dos líneas, sin solapamiento, a máximo 23 caracteres por segundo y dentro de la duración codificada; la planificación deja margen a 22. Revisar las 38 muestras codificadas y cada cue contra SRT, transcripción y recibo, además del último cuadro con subtítulo. MP4: 1920 × 1080, 30 fps, H.264/yuv420p, silencioso y de máximo 150 segundos. Revisar muestras no equivale a haber observado cada cuadro. El video silencioso no evalúa el audio del juego.

Este guion no demuestra por sí mismo una grabación, un envío o una publicación. El recibo de codificación y los subtítulos/transcripción de la grabación final prevalecen para describir el archivo entregado. La evidencia técnica no implica conformidad WCAG o adopción institucional.

Fuentes: [portal CCPC](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/), [ZIP oficial 2024 y diccionario](https://ine.mx/wp-content/uploads/2025/08/DatosAbiertos_DECEyEC_ConteosCensales2024.zip), [datos compartidos](../game/content/ccpc.json), [contenido compartido](../game/content/story.json), [guía docente](facilitator.md), [hoja de trabajo](classroom_handout.md) y [registro de verificación](verification.md).
