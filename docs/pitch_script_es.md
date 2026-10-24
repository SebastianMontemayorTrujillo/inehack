# Voces de la Plaza · guion de pitch

Estado: **borrador MP4 producido; texto de referencia estable**, 24 de octubre de 2026. Main confirma grabación real de pantalla **silenciosa, con subtítulos**, de **108.07 s (1:48.07), 1920×1080, 30 fps, H.264 High, yuv420p**. SRT y transcripción aparte incluidos. No hay narración grabada; una locución humana es opcional y requeriría revisión de esa nueva versión. El borrador actual queda sujeto a revisión del equipo y alojamiento.

El guion opcional de locución tiene **296 palabras** y conserva un presupuesto de hasta tres minutos. Sus tiempos son orientativos para una posible versión con voz; **no son los tiempos ni el audio del MP4 silencioso producido**, cuya duración medida es 108.07 s. La transcripción del video actual es [pitch_transcripcion.txt](../submission/pitch_transcripcion.txt), y sus marcas temporales están en [pitch_subtitulos.srt](../submission/pitch_subtitulos.srt).

Estado reconciliado con main: **48 pruebas aprobadas — Python 22/22, Node 17/17, Godot GUT 9/9**; Godot registra 40 aserciones y cero huérfanos. Exportaciones web/Linux realizadas. El reporte Playwright acredita recorrido HTML, cinco acciones, persistencia/privacidad, tres anchos y arranque Godot web sin errores capturados; Linux pasó arranque sin interfaz. Quedan evaluación formal con lector de pantalla y pilotaje. Ver [evidencia y capturas](verification.md).

## Guion de locución opcional, no grabada

<!-- NARRATION_START -->

### 00:00–00:20 · La pregunta

¿Cómo convertir datos de participación en una conversación que más personas puedan comprender? Voces de la Plaza propone una aventura breve para explorar evidencia, reconocer sus límites y pensar cómo participar en decisiones colectivas.

### 00:20–00:50 · La evidencia

Partimos de los Conteos Censales de Participación Ciudadana del INE de 2024. Reprodujimos nueve millones setecientas setenta y tres mil setecientas treinta filas en treinta y tres agregados: nacional y treinta y dos entidades. En el nacional, la participación entre registros clasificados es 59.7 por ciento; la proporción sin clasificación es 6.4 por ciento de la lista nominal analizada. Son denominadores distintos.

### 00:50–01:20 · La primera misión

En la Villa Brisa ficticia, Luz necesita reparar una prensa. La misión consiste en distinguir registros con marca, sin marca y sin clasificación para construir un boletín con fuente. Sin clasificación no significa abstención. La propuesta permite consultar explicaciones, recibir apoyo y volver a intentarlo.

### 01:20–01:50 · La segunda misión

Mateo presenta un cartel que confunde cantidades y porcentajes. Baja California tiene más registros con marca; Aguascalientes, una tasa mayor. Para combinar ambos lugares se suman primero los conteos. El reto pide construir un hallazgo, identificar qué no podemos concluir y señalar qué información falta.

### 01:50–02:20 · La decisión ficticia

Después, Inés propone una consulta ficticia entre tres proyectos. Sus cifras son inventadas y están separadas de los datos del INE. La regla permite elegir, dejar la boleta sin marcar o no participar, con el mismo final. La elección no debe guardarse. El cierre pregunta qué se hizo con los recursos y qué necesidades siguen pendientes.

### 02:20–02:50 · Alcance y siguiente paso

Exportamos versiones web y Linux. Pasaron veintidós pruebas Python, diecisiete Node y nueve Godot, con treinta y seis aserciones y cero huérfanos. HTML completó cinco decisiones, persistencia y comprobaciones de tamaño. Godot web arrancó; Linux pasó arranque sin interfaz. Faltan revisión del equipo, lector de pantalla y pilotaje. No afirmamos efectos educativos ni electorales.

<!-- NARRATION_END -->

## Apoyos visuales y edición

| Tiempo objetivo | Imagen / texto en pantalla | Integridad de la demostración |
| --- | --- | --- |
| 00:00–00:20 | Título; “Comprender · conversar · dar seguimiento”. | Puede usarse la captura real `godot-plaza.png`; mantener su relación con el candidato. |
| 00:20–00:50 | Dos fichas separadas: 59.7% = SV/(SV+NV), 6.4% = NS/LN; 2024, nacional, fuente INE. | No juntar ambos porcentajes en una composición de 100%. Mostrar enlace o referencia legible. |
| 00:50–01:20 | Prensa, categorías SV/NV/NS y panel de fuente. | Grabar una interacción real si está verificada; de otro modo, diagrama “Secuencia propuesta”. |
| 01:20–01:50 | Aguascalientes/Baja California: cantidades, tasas y hallazgo con límite. | Mantener visibles año, unidades y denominadores; no acelerar texto hasta volverlo ilegible. |
| 01:50–02:20 | Tres proyectos con igual jerarquía y rótulo “Consulta ficticia”. | No atribuir las cifras a CCPC ni mostrar una preferencia como correcta. |
| 02:20–02:50 | “48 pruebas: Python 22 · Node 17 · Godot 9/9 (40 aserciones, 0 huérfanos)”; revisión del equipo y fuentes. | Separar HTML completo, arranque Godot web y Linux sin interfaz. No presentar una pantalla HTML como evaluación formal de lector de pantalla. |
| 02:50–03:00 | Reserva para pausas, cierre y créditos/fuente. | El archivo completo, incluidos créditos, debe durar como máximo tres minutos. |

El MP4 silencioso, su SRT y su transcripción ya están producidos; el video no depende de grabar este guion opcional. Main confirmó duración y codificación; la revisión del equipo y el acceso de solo lectura siguen abiertos. Los resultados están registrados en [verification.md](verification.md); main empaqueta el candidato y actualizará el estado final de entrega.

Fuentes de trabajo: [datos compartidos](../game/content/ccpc.json), [reporte de validación](../data/validation_report.json), [contenido narrativo](../game/content/story.json), [registro de fuentes](source_register.md). La fuente de cifras es el ZIP oficial de 2024 documentado allí; los tres personajes y la consulta pertenecen a la ficción del proyecto.
