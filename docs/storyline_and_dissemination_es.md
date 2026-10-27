# Voces de la Plaza

## Narrativa y plan de difusión · Reto 3

**Equipo Latas · Edición de aula · 25 de octubre de 2026.** Narrativa de cuatro páginas con una propuesta de difusión para bachillerato y personas adultas principiantes. [PDF de narrativa y difusión](../submission/voces_narrativa_y_difusion.pdf), [materiales docentes](../submission/classroom.html) y [registro de verificación](verification.md).

Los cuatro bloques conservan el formato de `tools/render_submission.mjs`. La [revisión editorial contra la rúbrica local](deck_outline_es.md#revisión-editorial-contra-la-rúbrica-local) distingue calidad del contenido, comprobaciones técnicas y evaluación educativa.

El taller opcional está implementado en Godot y HTML. El [recorrido nativo](../build/evidence/native-window.json) y el [registro de verificación](verification.md) delimitan las comprobaciones técnicas; no constituyen una evaluación de aprendizaje. La presentación incluye una captura real de su vista previa.

<!-- INICIO DEL CONTENIDO PARA PDF: PÁGINA 1 -->

## 1. Una plaza para aprender a conversar con datos

**Voces de la Plaza** propone una aventura de educación cívica para estudiantes de bachillerato de aproximadamente 15–18 años que se acercan a su primer voto, y para personas adultas principiantes. La pregunta es cómo leer información pública, reconocer sus límites y usarla en una conversación sobre decisiones colectivas. No requiere experiencia con videojuegos ni resolver operaciones para avanzar.

En la Villa Brisa ficticia hay recursos para empezar una mejora de la plaza y tres propuestas distintas. Antes de la reunión, la persona jugadora ayuda a preparar **Las voces que construyen la plaza**, una exhibición con un boletín y un cartel. El recorrido conserva un pueblo, tres casas, tres personajes que hablan, dos misiones CCPC y una consulta ficticia con final.

**Imprenta de Luz:** preparar un boletín honesto sobre la participación nacional de 2024, sin borrar la información desconocida. **Archivo de Mateo:** corregir un cartel que confunde cantidad con proporción al comparar Aguascalientes y Baja California. **Casa de reunión de Inés:** escuchar necesidades distintas, conocer una regla de decisión inventada y pensar cómo dar seguimiento.

El diseño permite entrar y salir de las tres casas desde el principio. Cada anfitrión anticipa su tarea; la consulta se habilita cuando están listos los dos objetos de evidencia. Al regresar a la plaza se pueden volver a leer los hallazgos, fuentes y límites. Los interiores sirven para trabajar sobre esos objetos, dentro de la misma historia.

La aventura tiene una duración objetivo de 10–15 minutos. La guía docente propone una clase de 20 minutos: dos de introducción, trece de actividad y cinco de conversación opcional. Son tiempos por comprobar con participantes. Se ofrecen formatos individual, por parejas o con proyector, y una hoja de trabajo para usar sin computadora.

El taller de carteles es una ampliación opcional del archivo, con tiempo adicional por prever. Omitirlo conserva las seis actividades, la consulta y el mismo cierre; no es una misión obligatoria nueva.

El resultado educativo buscado es explicar un hallazgo real, reconocer algo que no sabemos y formular una pregunta de seguimiento. El contenido compartido conecta los tres interiores con los materiales de aula. No se atribuyen al juego cambios en intención de voto o participación electoral.

<div style="page-break-after: always;"></div>

<!-- PÁGINA 2 -->

## 2. Dos misiones con datos que se pueden revisar

**Fuente real:** INE, Conteos Censales de Participación Ciudadana, elección federal de 2024; conjunto local `ccpc-2024-v1`. Los conteos reproducidos del ZIP oficial son el sustento de los hallazgos. No representan preferencias partidistas ni describen al alumnado de 15–18 años.

**La prensa de las voces.** En el agregado nacional hay 54,899,228 registros con marca de voto (SV), 37,105,466 sin marca (NV) y 6,325,654 sin clasificación (NS); el total analizado (LN) es 98,330,348. Entre los 92,004,694 con información conocida, cerca de 60 de cada 100 tienen marca: **59.67%**, redondeado. Por separado, NS representa **6.43% del total analizado**, redondeado. No comparten base y no deben sumarse en una sola composición del 100%.

Luz propone tres decisiones: reconocer qué categoría clasificada tiene más registros; explicar que, cuando falta información, no sabemos si la persona participó; y colocar diez registros desconocidos en «No sabemos» dentro de un ejemplo nuevo inventado de 60 con participación, 30 sin participación y 10 desconocidos. Sin clasificación no significa abstención ni voto nulo.

**El mapa que no lo dice todo.** Mateo presenta las cantidades exactas y las tasas, redondeadas a dos decimales:

| Entidad, 2024 | Con marca (SV) | Con información (SV + NV) | Tasa clasificada |
| --- | ---: | ---: | ---: |
| Aguascalientes | 626,084 | 1,067,306 | 58.66% |
| Baja California | 1,396,335 | 2,968,011 | 47.05% |

Las otras tres decisiones son identificar dónde hay más registros con marca, dónde hay mayor proporción y resolver un caso nuevo **inventado**: A tiene 20 participantes de 40 (50%); B, 60 de 200 (30%). Más participantes no siempre significa mayor porcentaje. BC tiene más registros; AGS, cerca de 59 de cada 100 clasificados frente a 47 en BC.

Las seis actividades exigen leer e interpretar, con reintentos y apoyo. Los casos nuevos permiten intentar aplicar la idea en otro ejemplo; no constituyen una medida validada de comprensión. Completar con ayuda no demuestra dominio independiente. Las fórmulas quedan opcionales: `100 × SV / (SV + NV)` y `100 × NS / LN`. Al reunir entidades se suman primero conteos: 2,022,419 entre 4,035,317, aproximadamente 50.12%. Sin base válida no se inventa un 0%.

El archivo documenta exclusiones de casillas especiales y voto desde el extranjero. Un agregado no revela motivos individuales ni permite juzgar el valor cívico de una comunidad. La hoja conserva valores exactos, lecturas sencillas, año, base, fuente y estos límites.

**Crea tu cartel para la reunión (opcional).** Tras las seis actividades, el taller permite elegir dos de las 32 entidades, cantidad o proporción y una pregunta neutral. La vista previa cambia con los datos elegidos y conserva conteos, bases, NS, año, fuente y límites. Se puede revisar y llevar a Inés durante la sesión. No añade una prueba, operaciones obligatorias ni preferencias políticas; tampoco cambia resultados de consulta o reconocimiento.

**Procedencia:** el reporte local documenta 32 CSV, 9,773,730 filas y 33 agregados, con el SHA-256 del ZIP reproducido. Filas no equivalen a personas; consistencia aritmética no demuestra unicidad o exhaustividad.

<div style="page-break-after: always;"></div>

<!-- PÁGINA 3 -->

## 3. Escuchar, decidir y dar seguimiento

Antes de entrar a la consulta, Inés explica: **«Los datos del INE nos hablan de la participación en 2024. Esta consulta es inventada para practicar cómo escuchar y tomar decisiones».** Los hallazgos históricos no eligen el proyecto ni explican las preferencias de los personajes.

La Casa de reunión ofrece tres propuestas con igual espacio y tono: **A, Sombra y bancas**, para descansar y conversar, con mantenimiento y riego; **B, Rincón de lectura**, para compartir historias y aprender, con cuidado de libros y facilitación; **C, Jardín comunitario**, para cuidar un espacio verde, con agua y trabajo continuo. Los recursos permiten comenzar una; las necesidades que quedan pendientes siguen siendo legítimas.

Hay cinco acciones: elegir A, elegir B, elegir C, dejar la boleta sin marcar o no participar. Todas permiten el mismo final y reconocimiento. Elegir suma uno a esa opción y al total; dejar sin marcar suma solo al total; no participar conserva ambos. Si hay empate, la ficción requiere otra decisión, sin preferir automáticamente A. Estas reglas didácticas no reproducen todos los procedimientos de una elección constitucional.

Los escenarios son inventados: conteos A/B/C de 8/5/3, 11/8/6 y 8/10/7. Los últimos dos tienen 25 participantes y ganadores distintos: el total de participación, por sí solo, no determina quién gana. Proceden de un grupo ficticio de 30 personajes; quien juega es una persona adicional. No son resultados del salón ni datos del INE.

El cierre propone revisar el uso de recursos, el avance del proyecto o las necesidades aún pendientes. Las tres preguntas son válidas. Ninguna preferencia ni voluntad de votar se califica. La clase no solicita nombres, afiliaciones, intención de voto o elecciones de consulta; no recoge datos políticos de menores ni de personas adultas. La hoja permanece con quien la usa. En proyector se demuestra una acción anunciada, sin votar ni contar preferencias del grupo.

La ruta HTML semántica ofrece las mismas seis actividades, fuentes, apoyos y final sin ejecutar Godot. El taller opcional está disponible en ambas rutas. En la aventura caminamos con WASD y cruzamos puertas; incorpora foco visible, texto ampliable, silencio y movimiento reducido. Las visualizaciones tienen tablas exactas; Linux ofrece una alternativa local. El registro de verificación identifica el entorno y alcance de las comprobaciones, sin prometer compatibilidad universal.

La elección y los resultados que la revelan no se guardan ni transmiten. Al retomar la historia, el cierre conserva un resumen neutral de lo completado. La revisión técnica de estas reglas es distinta de observar comprensión en una clase.

El cartel opcional se conserva solo en memoria durante la sesión. Su pregunta puede invitar a reconocer información faltante, escuchar a quienes no han hablado o revisar si se cumplió lo acordado. No identifica personas ni recoge preferencias; los datos del cartel no eligen un proyecto para la consulta ficticia.

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
2. La persona facilitadora revisaría el encaje docente, prepararía el equipo y recorrería las seis actividades, la consulta y el cierre; decidiría si ofrece el taller opcional. Elegiría HTML, aventura, Linux o papel según el acceso disponible.
3. Tras una sesión voluntaria, devolvería observaciones de claridad, tiempo y barreras, asociadas a la versión y modalidad; sin nombres, preferencias ni respuestas individuales del alumnado.
4. Latas revisaría esas observaciones, corregiría el material y comprobaría datos y ambas rutas. Entregaría una nueva edición y sus cambios para repetir la preparación antes de difundirla por canales autorizados.

**Materiales preparados:** guía HTML, hoja HTML/PDF de dos páginas con datos y escenarios de consulta, glosario, narrativa de cuatro páginas, presentación de diez diapositivas y guion de pitch. Las capturas muestran la plaza, los interiores, el cierre y la ruta HTML.

**Evaluación futura:** una revisión con una persona docente y 5–8 principiantes podría orientar mejoras. Con menores, coordinar participación voluntaria y condiciones escolares. Registrar barreras, apoyo y totales anónimos de explicaciones, e informar el número real observado. Aún no hay pilotaje ni evaluación formal con lector de pantalla; las comprobaciones técnicas no acreditan aprendizaje.

La rúbrica local pondera temática, claridad, originalidad y viabilidad en 35/30/20/15 puntos. El dictamen corresponde al comité; no se anticipa una puntuación.

**Fuentes y uso:** INE, [portal CCPC](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/), [ZIP 2024 y diccionario](https://ine.mx/wp-content/uploads/2025/08/DatosAbiertos_DECEyEC_ConteosCensales2024.zip); `game/content/ccpc.json`, `data/validation_report.json`, [registro de fuentes](source_register.md), [verificación](verification.md), [guía](facilitator.md), [hoja](classroom_handout.md) y [reutilización institucional propuesta](institutional_reuse.md). La rúbrica oficial local y la [convocatoria](https://www.ine.mx/wp-content/uploads/2026/09/Convocatoria_Hackaton-1.pdf) sustentan la revisión editorial y el checklist de entrega.

<!-- FIN DEL CONTENIDO PARA PDF -->
