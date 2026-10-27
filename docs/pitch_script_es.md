# Voces de la Plaza · guion de pitch

**Equipo Latas · Cierre de campaña · 27 de octubre de 2026.** Presupuesto editorial de **hasta 150 segundos**, incluidos transiciones y cierre; no es una duración medida. La grabación conserva la composición existente: entrada real en el canvas Godot y recorrido real de HTML, con subtítulos incrustados, SRT y transcripción. El [registro de verificación](verification.md) identifica el alcance técnico.

Los medios anteriores son históricos. La producción final espera el recorrido nativo nuevo aprobado y los exports actuales. El [recibo de codificación](../build/evidence/pitch-encoding.json) identifica la grabación, duración medida, resolución, fuentes y PDF realmente descargado. La música tranquila CC0 «Sunset Walk», de KiluaBoy, pertenece al juego; el pitch es silencioso y no permite evaluar comodidad auditiva. No contiene imágenes ni respuestas del alumnado.

## Guion editorial

<!-- NARRATION_START -->

### 00:00–00:15 · Tres casas abiertas

Latas presenta Voces de la Plaza, una aventura cívica para bachillerato y personas adultas principiantes. Las tres casas abren desde el inicio; las conversaciones siguen el orden Luz, Mateo e Inés. En Godot caminamos con WASD; HTML tiene navegación propia.

### 00:15–00:45 · Luz y lo que no sabemos

Visitamos tres casas. En la imprenta de Luz usamos datos del INE sobre participación federal de 2024. En el agregado nacional, cerca de sesenta de cada cien registros con información conocida tienen marca de voto. Los registros sin clasificación se muestran aparte: no sabemos si participaron. El boletín conserva cifras exactas, fuente y límites.

### 00:45–01:10 · Mateo y una comparación justa

En el archivo de Mateo, Baja California tiene más registros con marca, pero Aguascalientes tiene mayor proporción. Leemos sin juzgar a las comunidades. Las seis actividades ofrecen apoyo y ejemplos nuevos; calcular es opcional.

### 01:10–01:29 · Un cartel propio, opcional

El taller permite elegir dos de 32 entidades, cantidad o proporción y una pregunta neutral. Revisamos datos, bases, desconocidos, fuente y límites. Guardar conserva la publicación durante la sesión. Si omitimos el taller, Inés ofrece la comparación guiada AGS/BC por proporción.

### 01:29–01:48 · Consulta ficticia y seguimiento

Inés presenta sombra y bancas, lectura y jardín. Los conteos son inventados. Elegir A, B o C, dejar sin marcar o no participar, y una pregunta neutral de seguimiento, habilitan la campaña. Ninguna preferencia se califica ni se guarda.

### 01:48–02:15 · Inés, Luz, impresión y FIN

Inés revisa el diseño y lo encarga a Luz dentro de la ficción. Volvemos a la primera casa; en Godot caminamos hasta la prensa. **Imprimir cartel** completa la aventura: **FIN · La campaña comienza contigo**. Descargar el PDF Carta es aparte. Dice «Tu voto cuenta. Infórmate y participa.»: campaña ciudadana con fuente INE/CCPC, sin marcas de equipo, sello oficial ni resultado ficticio.

### 02:15–02:30 · Reutilización y límites

Guía y hoja permiten trabajo individual, en parejas, con proyector o en papel. Los tiempos son propuestos; todavía no hay pilotaje con docentes y estudiantes ni certificación formal. El juego tiene música CC0 opcional; esta demostración no tiene audio. No atribuimos eficacia educativa ni efectos electorales.

<!-- NARRATION_END -->

## Apoyos visuales y edición

| Tiempo objetivo | Imagen y texto legible | Fuente y límite |
| --- | --- | --- |
| 00:00–00:15 | Plaza y entrada con W al archivo; después portada HTML. | Export actual; distinguir las dos rutas. El orden del aprendizaje no cierra las casas. |
| 00:15–00:45 | Boletín: 59.67% entre 92,004,694 clasificados. NS: 6.43% de 98,330,348 totales. | INE, ZIP/diccionario 2024, `national`. Bases distintas; no unir en un pastel del 100%. Ejemplo 60/30/10 rotulado inventado. |
| 00:45–01:10 | AGS 626,084 / 1,067,306 = 58.66%; BC 1,396,335 / 2,968,011 = 47.05%. | `state_01`/`state_02`; con marca / clasificados. Ejemplo A:20/40 y B:60/200 separado como ficción. |
| 01:10–01:29 | Selección, cambio de medida, vista previa y publicación del cartel. | Operaciones reales HTML. Godot guarda sin cambiar de lugar y exige caminar a Inés. No atribuir vistas nuevas a capturas antiguas. |
| 01:29–01:48 | Proyectos de igual jerarquía, cinco acciones, resultado inventado y seguimiento. | Acción de demostración «no participar», sin elecciones del alumnado. La consulta no produce FIN por sí sola. |
| 01:48–02:15 | Inés: revisión y envío; regreso a la imprenta; «Imprimir cartel», FIN y descarga real. | Preparar PDF antes de confirmar el encargo. Conservar hash de los bytes descargados. El envío es ficción; descargar o imprimir físicamente es opcional. |
| 02:15–02:30 | Guía, hoja y regreso al final neutral. | Recursos congelados. Recargar conserva el final, sin reconstruir el PDF personal. Sin pilotaje ni eficacia demostrada. |

`tools/record_pitch.mjs --self-test` comprueba 31 escenas, las seis actividades canónicas y **127.5 segundos de pausas legibles**; las transiciones consumen parte del margen hasta 150. La grabación atraviesa encargo, prensa, FIN y descarga con controles reales, sin sembrar progreso terminado. El recibo conserva las identidades de fuentes, exports, video fuente, salida, subtítulos, transcripción y PDF descargado.

Conservar texto legible en la banda inferior: subtítulos de hasta dos líneas, sin solapamiento, a máximo 23 caracteres por segundo y dentro de la duración codificada. Revisar todas las muestras codificadas y cada cue contra SRT, transcripción y recibo. MP4: 1920 × 1080, 30 fps, H.264/yuv420p, silencioso y de máximo 150 segundos. Revisar muestras no equivale a haber observado cada cuadro. El video silencioso no evalúa el audio del juego.

Este guion no demuestra por sí mismo una grabación, un envío o una publicación. El recibo de codificación y los subtítulos/transcripción de la grabación final prevalecen para describir el archivo entregado. La evidencia técnica no implica conformidad WCAG o adopción institucional.

Fuentes: [portal CCPC](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/), [ZIP oficial 2024 y diccionario](https://ine.mx/wp-content/uploads/2025/08/DatosAbiertos_DECEyEC_ConteosCensales2024.zip), [datos compartidos](../game/content/ccpc.json), [contenido compartido](../game/content/story.json), [guía docente](facilitator.md), [hoja de trabajo](classroom_handout.md) y [registro de verificación](verification.md).
