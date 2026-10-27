# Voces de la Plaza

## Narrativa y plan de difusión · Reto 3

**Equipo Latas · Secuencia guiada y campaña rosa · 27 de octubre de 2026.** Narrativa de cuatro páginas con una propuesta de difusión para bachillerato y personas adultas principiantes. [PDF de narrativa y difusión](../submission/voces_narrativa_y_difusion.pdf), [materiales docentes](../submission/classroom.html) y [registro de verificación](verification.md).

Los cuatro bloques conservan el formato de `tools/render_submission.mjs`. La [revisión editorial contra la rúbrica local](deck_outline_es.md#revisión-editorial-contra-la-rúbrica-local) distingue calidad del contenido, comprobaciones técnicas y evaluación educativa.

El [contrato de secuencia y diseño](sequential_campaign_design.md) actualiza el [final de campaña](campaign_finale.md). La [edición anterior archivada](../build/media-review-sequential-2026-10-27/history-campaign/manifest.json) conserva fuentes, salidas y recibos históricos; no verifica las nuevas pantallas. Los recibos de cada edición y el [registro de verificación](verification.md) delimitan comprobaciones técnicas, sin constituir una evaluación de aprendizaje.

<!-- INICIO DEL CONTENIDO PARA PDF: PÁGINA 1 -->

## 1. Una plaza para aprender a conversar con datos

**Voces de la Plaza** propone una aventura de educación cívica para estudiantes de bachillerato de aproximadamente 15–18 años que se acercan a su primer voto, y para personas adultas principiantes. La pregunta es cómo leer información pública, reconocer sus límites y usarla en una conversación sobre decisiones colectivas. No requiere experiencia con videojuegos ni resolver operaciones para avanzar.

En la Villa Brisa ficticia hay recursos para empezar una mejora de la plaza y tres propuestas distintas. Antes de la reunión, la persona jugadora prepara **Las voces que construyen la plaza**, una exhibición con un boletín y un cartel. El recorrido conserva un pueblo, tres casas, tres personajes, dos misiones CCPC y una consulta ficticia; termina al imprimir un cartel ciudadano en la primera casa.

**Luz, en la casa izquierda:** preparar un boletín honesto sobre la participación nacional de 2024, sin borrar la información desconocida. **Mateo, en el centro:** corregir un cartel que confunde cantidad con proporción al comparar Aguascalientes y Baja California. **Inés, a la derecha:** escuchar necesidades distintas, conocer una regla de decisión inventada y pensar cómo dar seguimiento.

Las casas abren desde el principio; el aprendizaje sigue a Luz, Mateo e Inés. Una visita temprana dirige a la primera tarea pendiente e indica la casa. Los personajes comienzan las actividades; el tablón permite revisar la comparación y la prensa se reserva para el final. El diálogo ocupa una franja inferior translúcida. El encabezado orienta, el suelo queda sin prosa y una indicación [E] aparece cerca del objetivo. La consulta es el paso tres de cuatro; después, Inés encarga el cartel y se vuelve caminando a la prensa de Luz.

La aventura tiene una duración objetivo de 10–15 minutos. La guía docente propone una clase de 20 minutos: dos de introducción, trece de actividad y cinco de conversación opcional. Son tiempos por comprobar con participantes. Se ofrecen formatos individual, por parejas o con proyector, y una hoja de trabajo para usar sin computadora.

El taller del archivo permite personalizar el cartel, con tiempo adicional por prever. Si se omite, Inés ofrece la comparación guiada AGS/BC por proporción. Las seis actividades y la consulta se conservan; la impresión final no exige otra prueba ni una impresora física.

El resultado educativo buscado es explicar un hallazgo real, reconocer algo que no sabemos y formular una pregunta de seguimiento. El contenido compartido conecta los tres interiores con los materiales de aula. No se atribuyen al juego cambios en intención de voto o participación electoral.

<div style="page-break-after: always;"></div>

<!-- PÁGINA 2 -->

## 2. Dos misiones con datos que se pueden revisar

**Fuente real:** INE, Conteos Censales de Participación Ciudadana, elección federal de 2024; conjunto local `ccpc-2024-v1`. Los conteos reproducidos del ZIP oficial son el sustento de los hallazgos. No representan preferencias partidistas ni describen al alumnado de 15–18 años.

**El boletín de Luz.** En el agregado nacional hay 54,899,228 registros con marca de voto (SV), 37,105,466 sin marca (NV) y 6,325,654 sin clasificación (NS); el total analizado (LN) es 98,330,348. Entre los 92,004,694 con información conocida, cerca de 60 de cada 100 tienen marca: **59.67%**, redondeado. Por separado, NS representa **6.43% del total analizado**, redondeado. No comparten base y no deben sumarse en una sola composición del 100%.

Luz explica que un registro reúne información de una persona. Sus preguntas piden reconocer la barra con más registros, decir si sabemos que alguien votó cuando falta información y ubicar diez desconocidos en «No sabemos» en un ejemplo inventado de 60 con participación, 30 sin participación y 10 desconocidos. Sin clasificación no significa abstención ni voto nulo.

**El mapa que no lo dice todo.** Mateo presenta las cantidades exactas y las tasas, redondeadas a dos decimales:

| Entidad, 2024 | Con marca (SV) | Con información (SV + NV) | Tasa clasificada |
| --- | ---: | ---: | ---: |
| Aguascalientes | 626,084 | 1,067,306 | 58.66% |
| Baja California | 1,396,335 | 2,968,011 | 47.05% |

Las otras tres decisiones son identificar dónde hay más registros con marca, dónde hay mayor proporción y resolver un caso nuevo **inventado**: A tiene 20 participantes de 40 (50%); B, 60 de 200 (30%). Más participantes no siempre significa mayor porcentaje. BC tiene más registros; AGS, cerca de 59 de cada 100 clasificados frente a 47 en BC.

Un porcentaje expresa cuántos de cada 100. Las seis preguntas breves permiten reintentos y apoyo; aplicar una idea en los ejemplos nuevos no es una medida validada de comprensión. Completar con ayuda no demuestra dominio independiente. Fórmulas opcionales: `100 × SV / (SV + NV)` y `100 × NS / LN`. Al reunir entidades se suman primero conteos: 2,022,419 entre 4,035,317, aproximadamente 50.12%. Sin base válida no se inventa un 0%.

El archivo documenta exclusiones de casillas especiales y voto desde el extranjero. Un agregado no revela motivos individuales ni permite juzgar el valor cívico de una comunidad. La hoja conserva valores exactos, lecturas sencillas, año, base, fuente y estos límites.

**Crea tu cartel para la reunión (opcional).** Tras las seis actividades, el taller permite elegir dos de las 32 entidades, cantidad o proporción y una pregunta neutral. La vista previa cambia con los datos elegidos y conserva conteos, bases, NS, año, fuente y límites. Se puede revisar y llevar a Inés durante la sesión. No añade una prueba, operaciones obligatorias ni preferencias políticas; tampoco cambia resultados de consulta o reconocimiento.

**Procedencia:** la reproducción previa documenta 32 CSV, 9,773,730 filas y 33 agregados, con SHA-256 del ZIP. Esta revisión no la presenta como una adquisición nueva. Filas no equivalen a personas; consistencia aritmética no demuestra unicidad o exhaustividad.

<div style="page-break-after: always;"></div>

<!-- PÁGINA 3 -->

## 3. Escuchar, decidir y dar seguimiento

Antes de entrar a la consulta, Inés explica: **«Los datos del INE nos hablan de la participación en 2024. Esta consulta es inventada para practicar cómo escuchar y tomar decisiones».** Los hallazgos históricos no eligen el proyecto ni explican las preferencias de los personajes.

La Casa de reunión ofrece tres propuestas con igual espacio y tono: **A, Sombra y bancas**, para descansar y conversar, con mantenimiento y riego; **B, Rincón de lectura**, para compartir historias y aprender, con cuidado de libros y facilitación; **C, Jardín comunitario**, para cuidar un espacio verde, con agua y trabajo continuo. Los recursos permiten comenzar una; las necesidades que quedan pendientes siguen siendo legítimas.

Hay cinco acciones: elegir A, B o C, dejar la boleta sin marcar o no participar. Todas permiten el mismo final y reconocimiento. Elegir suma uno a esa opción y al total; sin marcar, solo al total; no participar conserva ambos. Un empate requiere otra decisión ficticia, sin preferir automáticamente A. No se reproducen todos los procedimientos de una elección constitucional.

Los escenarios son inventados: conteos A/B/C de 8/5/3, 11/8/6 y 8/10/7. Los últimos dos tienen 25 participantes y ganadores distintos: el total de participación, por sí solo, no determina quién gana. Proceden de un grupo ficticio de 30 personajes; quien juega es una persona adicional. No son resultados del salón ni datos del INE.

Las tres preguntas de seguimiento son válidas: recursos, avances o necesidades pendientes. Ninguna preferencia ni voluntad de votar se califica. La clase no recoge nombres ni datos políticos; la hoja permanece con quien la usa. En proyector se demuestra una acción anunciada, sin votar ni contar preferencias del grupo.

**La misión final.** Tras el seguimiento, Inés revisa el cartel personal o el guiado AGS/BC. El encargo prepara el PDF en la sesión, sin envío externo. Se camina a la casa izquierda y, cerca de su prensa, se elige **Imprimir cartel**. La impresión dura hasta 2.5 segundos; E, Enter o un botón la omiten, y movimiento reducido la salta. **FIN · La campaña comienza contigo** mantiene visibles Descargar, Ampliar y Explorar. Reabrir no repite la animación; cerrar conserva el lugar.

El cartel rosa y blanco es una composición ciudadana original: **«Tu voto cuenta. Infórmate y participa.»** El PDF Carta vertical conserva texto seleccionable, conteos, bases, NS, barras comparables, pregunta, límites y fuente histórica INE/CCPC. No lleva Latas, INEhack, sello oficial ni resultado ficticio. Descargar es opcional y cancelar no deshace FIN. Ampliar permite leer el cartel en su zona desplazable, con las acciones finales a la vista.

La ruta HTML conserva contenido y final con navegación propia. Godot usa WASD para cruzar puertas y E/Enter cerca para interactuar. Ofrece texto ampliable, foco, silencio y movimiento reducido; Linux es la alternativa local. La música tranquila «Sunset Walk», de KiluaBoy, es CC0, con volumen y silencio: no es música original del equipo ni es necesaria para avanzar.

La elección y los resultados que la revelan no se guardan ni transmiten. Diseños, encargo y PDF viven en memoria: cancelar una revisión conserva el encargo; imprimir lo fija para repetir descargas. Reiniciar los borra. Al recargar un pendiente se recrea con Inés; un progreso completado conserva el final, sin reconstruir el cartel personal. La revisión técnica no equivale a observar aprendizaje o certificar accesibilidad.

<div style="page-break-after: always;"></div>

<!-- PÁGINA 4 -->

## 4. Reutilización y difusión propuesta

La propuesta es una sesión breve de ética o educación cívica sobre información honesta, comparación justa, pluralidad y seguimiento. La guía y la hoja están preparadas; su eficacia, duración y adecuación curricular necesitan observación. No se afirma certificación SEP ni adopción del INE.

| Público / espacio propuesto | Material y formato | Condición de uso |
| --- | --- | --- |
| Bachillerato, 15–18 años | Guía de 20 minutos; actividad individual, en parejas o proyectada; hoja con fuentes y reflexión. | Docente, papel o equipo comprobado; no solicitar preferencias políticas ni conservar elecciones. |
| Personas adultas principiantes; bibliotecas y talleres | La misma historia y hoja, con lectura acompañada y apoyo opcional. | Lenguaje respetuoso, texto legible y ruta de acceso adecuada al grupo. |
| Canales educativos o institucionales autorizados | Aventura, HTML independiente y materiales descargables identificados por versión. | Publicación autorizada; comprobar enlaces, permisos, fuentes, licencias y alcance de acceso. |

**Secuencia de difusión propuesta:**

1. Una persona mantenedora de **Latas** prepararía un paquete identificado por versión, con fuentes, requisitos, guía, hoja y registro de cambios, para una persona facilitadora receptora.
2. La persona facilitadora revisaría el encaje docente, prepararía el equipo y recorrería las seis actividades, la consulta, el encargo y la impresión final; decidiría si ofrece personalización. Elegiría HTML, aventura, Linux o papel según el acceso disponible.
3. Tras una sesión voluntaria, devolvería observaciones de claridad, tiempo y barreras, asociadas a la versión y modalidad; sin nombres, preferencias ni respuestas individuales del alumnado.
4. Latas revisaría esas observaciones, corregiría el material y comprobaría datos y ambas rutas. Entregaría una nueva edición y sus cambios para repetir la preparación antes de difundirla por canales autorizados.

**Materiales:** guía HTML, hoja HTML/PDF de dos páginas con datos, consulta y campaña, glosario, narrativa de cuatro páginas, presentación de diez diapositivas y demostración subtitulada de hasta 150 segundos. Los recibos identifican las capturas y archivos de cada edición. Latas se conserva como autor de la entrega, fuera del cartel ciudadano.

**Evaluación futura:** una revisión con una persona docente y 5–8 principiantes podría orientar mejoras. Con menores, coordinar participación voluntaria y condiciones escolares. Registrar barreras, apoyo y totales anónimos de explicaciones, e informar el número real observado. Aún no hay pilotaje ni evaluación formal con lector de pantalla; las comprobaciones técnicas no acreditan aprendizaje.

La rúbrica local pondera temática, claridad, originalidad y viabilidad en 35/30/20/15 puntos. El dictamen corresponde al comité; no se anticipa una puntuación.

**Fuentes y uso:** INE, [portal CCPC](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/), [ZIP 2024 y diccionario](https://ine.mx/wp-content/uploads/2025/08/DatosAbiertos_DECEyEC_ConteosCensales2024.zip); `game/content/ccpc.json`, `data/validation_report.json`, [registro de fuentes](source_register.md), [verificación](verification.md), [guía](facilitator.md), [hoja](classroom_handout.md) y [reutilización institucional propuesta](institutional_reuse.md). La rúbrica oficial local y la [convocatoria](https://www.ine.mx/wp-content/uploads/2026/09/Convocatoria_Hackaton-1.pdf) sustentan la revisión editorial y el checklist de entrega.

<!-- FIN DEL CONTENIDO PARA PDF -->
