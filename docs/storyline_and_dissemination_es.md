# Voces de la Plaza

## Narrativa y plan de difusión · Reto 3

Estado editorial: **fuente estable; borradores producidos**, 24 de octubre de 2026. Main confirma narrativa PDF de **4 páginas, Letter, 11 pt** y presentación PDF de **10 páginas, 16:9**; asset QA revisó visualmente las **14 páginas sin recortes**. MP4 silencioso con subtítulos, SRT y transcripción aparte: **108.07 s, 1920×1080, 30 fps, H.264 High, yuv420p**. No hay voz grabada. La revisión final del equipo y los trámites de entrega son distintos de la producción ya completada.

Estado reconciliado con main: **48 pruebas aprobadas: 22 Python, 17 Node y 9/9 Godot GUT**, con 40 aserciones y cero huérfanos en Godot. Exportaciones web/Linux y recorrido HTML automatizado con todas las opciones, persistencia/privacidad y tres anchos aprobados; arranques web/Linux acreditados con el alcance de [verification.md](verification.md). Evaluación formal con lector de pantalla y pilotaje no realizados.

<!-- INICIO DEL CONTENIDO PARA PDF: PÁGINA 1 -->

## 1. Una plaza para comprender y conversar

**Voces de la Plaza** propone una aventura de datos para personas adultas principiantes y facilitadoras de educación cívica. Su pregunta central es: ¿cómo transformar información pública de participación en una historia comprensible que invite a conversar y dar seguimiento a las decisiones colectivas?

La experiencia está diseñada para durar entre 10 y 15 minutos. Ocurre en Villa Brisa, un pueblo ficticio con una plaza, un archivo y un tablero comunitario. Tres personajes —Luz, Mateo e Inés— acompañan dos misiones basadas en CCPC y una consulta breve con cifras inventadas. La duración es un objetivo pendiente de comprobar en una sesión completa.

El hilo narrativo es preparar **Las voces que construyen la plaza**, una exhibición que conserva hallazgos, visualizaciones, cifras exactas, fuentes y límites. Los datos no aparecen como decoración: deben determinar el boletín reparado, las comparaciones válidas y la explicación que se ofrece a quien juega. La recompensa narrativa reconoce una interpretación responsable y la reflexión; ninguna opción política o decisión de votar merece más premio.

La primera misión pregunta qué nos cuentan los registros y qué permanece desconocido. La segunda distingue cantidades de porcentajes y confronta una inferencia que la evidencia no respalda. La consulta final incorpora necesidades distintas y recursos limitados, sin presentar una simulación completa de una elección constitucional.

El aprendizaje buscado es que una persona pueda explicar un patrón real, reconocer un límite de ese dato y proponer una forma de participar o de revisar lo que ocurre después. No se afirma que jugar aumente la participación electoral, que una comunidad tenga más valor cívico que otra ni que una cifra revele por qué actuó cada persona.

La implementación reúne una aventura Godot con dirección visual simplepixels, una ruta HTML semántica y un respaldo nativo Linux. Ambas exportaciones se realizaron; el alcance de las pruebas se detalla en la última página. El proyecto conserva un solo pueblo, tres personajes, dos misiones de evidencia y un final completo. El arte y los sonidos finales son originales y se integran mediante identificadores de rol; las referencias de desarrollo y la tipografía OFL se registran por separado.

<div style="page-break-after: always;"></div>

<!-- PÁGINA 2 -->

## 2. De los registros a la exhibición

**La prensa de las voces.** Luz necesita un boletín que conserve tanto lo que sabemos como lo que no podemos clasificar. Quien juega organiza tres categorías: SV, registros con marca de voto; NV, sin marca de voto; y NS, participación sin especificar. El mecanismo se repara al distinguir la tasa entre registros clasificados de la proporción sin clasificación. Una ficha permite revisar año, lugar, valores, fórmula, fuente y versión.

La tasa se calcula como **100 × SV / (SV + NV)**. La proporción sin clasificación es **100 × NS / LN**. Son denominadores distintos: NS no equivale a abstención ni a voto nulo. Si no hay denominador, se informa que no hay datos clasificables, en lugar de fabricar un 0%. Los porcentajes clasificados y NS/LN no se mezclan en una sola composición del 100%.

En el agregado nacional de 2024 hay 54,899,228 registros SV, 37,105,466 NV y 6,325,654 NS; LN suma 98,330,348. La tasa entre registros clasificados es 59.7% y la proporción NS/LN, 6.4%, redondeadas a un decimal. Estas cifras describen el universo analizado, no preferencias partidistas ni resultados por candidatura.

**El mapa que no lo dice todo.** Mateo pide corregir un cartel que confunde “más registros” con “tasa mayor”. La comparación usa Aguascalientes y Baja California en el mismo año:

| Entidad, 2024 | SV | SV + NV | Tasa clasificada |
| --- | ---: | ---: | ---: |
| Aguascalientes | 626,084 | 1,067,306 | 58.66% |
| Baja California | 1,396,335 | 2,968,011 | 47.05% |

Baja California tiene más registros SV; Aguascalientes tiene la tasa mayor. Para combinar ambas entidades se suman primero los conteos: 2,022,419 SV entre 4,035,317 registros clasificados, equivalente a 50.12%. Promediar directamente las dos tasas daría 52.85% y respondería otra operación, no la tasa del conjunto.

El tablero terminado incluye “El dato muestra”, “No permite saber” y “Faltan datos”. Un agregado no revela motivos individuales ni permite calificar a las comunidades como mejores o peores ciudadanas. Los registros provienen de marcas en cuadernillos de lista nominal; el alcance documentado excluye casillas especiales y voto desde el extranjero. No deben confundirse con totales de actas bajo otras definiciones.

Ambas misiones prevén explicaciones, reintentos y apoyo. Un ejemplo didáctico nuevo, claramente sintético, permite comprobar si se comprendió la idea sin memorizar cifras. La ayuda y el intento independiente se distinguen: completar una misión con apoyo no acredita por sí solo dominio independiente.

<div style="page-break-after: always;"></div>

<!-- PÁGINA 3 -->

## 3. Una plaza, varias ideas: autonomía y acceso

Inés recibe la exhibición y plantea una consulta ficticia: comenzar un proyecto entre sombra y bancas, un rincón de lectura o un jardín comunitario. Los tres reciben el mismo espacio y tono. Cada propuesta aporta algo y requiere cuidado; el presupuesto permite iniciar solo una. Las necesidades que no ganan siguen siendo legítimas.

Las cifras de esta escena son inventadas y están separadas de CCPC. Tres escenarios de participantes producen conteos A/B/C de 8/5/3, 11/8/6 y 8/10/7. Los dos últimos tienen 25 participantes y distinto proyecto ganador: un mayor total de participación no determina por sí mismo quién gana. Se trata de subconjuntos de un padrón ficticio de 30 personajes; quien juega es una persona adicional.

La regla se explica antes de decidir: elegir añade una unidad a esa opción y al total; dejar la boleta sin marcar añade una unidad solo al total; no participar conserva ambos. Un empate debe mostrar un estado ficticio explícito de nueva decisión, sin preferencia automática por una opción. Estas reglas didácticas no se presentan como procedimiento electoral mexicano.

Todas las acciones permiten el mismo final y los mismos reconocimientos de aprendizaje. Playwright completó las cinco acciones en HTML y comprobó el avance tras recargar; las claves guardadas revisadas no contienen la elección ni resultados que la revelen. Las pruebas de reglas y recorrido Godot también comprobaron la lista permitida de guardado. Esto no sustituye una auditoría completa de privacidad, URLs o red. El diseño excluye perfiles políticos e identificadores personales.

La conversación termina con preguntas como “¿Qué se hizo con el presupuesto?”, “¿Cómo sabremos si el proyecto se realizó?” y “¿Qué necesidades siguen pendientes?”. Participar aporta al conteo; que una opción pierda no borra su aportación. El seguimiento continúa después de la decisión.

El acceso forma parte del diseño: teclado, foco visible, texto ampliable, silencio, movimiento reducido y una alternativa a arrastrar o recorrer el mapa. Cada visualización debe tener texto y tabla con valores exactos. La ruta HTML semántica debe permitir las mismas misiones, apoyos, consulta y reflexión sin ejecutar el lienzo Godot. No basta una transcripción de diálogos.

El recorrido HTML automatizado pasó sin desbordamiento horizontal en los estados comprobados a 320, 768 y 1440 píxeles; se revisaron las clases de configuración de texto grande y movimiento reducido. Linux exportó y pasó arranque sin interfaz. Estas pruebas tienen un alcance automatizado y no establecen conformidad WCAG, compatibilidad universal, portabilidad a cualquier equipo o caché web sin conexión. La evaluación formal con lector de pantalla y el pilotaje con personas usuarias siguen pendientes.

<div style="page-break-after: always;"></div>

<!-- PÁGINA 4 -->

## 4. Difusión, reutilización y evidencia

La difusión propuesta combina una actividad breve con conversación guiada. No existen acuerdos de adopción institucional acreditados. Cualquier publicación o envío se realizará con autorización y revisión de las condiciones de la convocatoria y de los derechos de distribución.

| Público / espacio | Canal y formato | Condiciones de uso |
| --- | --- | --- |
| Personas adultas en talleres de educación cívica | Sesión facilitada: aventura o HTML, seguida de diálogo | Equipo y controles probados; no pedir intención de voto ni datos personales. |
| Bibliotecas y espacios educativos | Estación individual o demostración grupal, con ficha de fuentes | Texto legible, reinicio entre sesiones, apoyo disponible y respaldo Linux verificado. |
| Público digital por canales institucionales autorizados | Micrositio con dos rutas, transcripción y guía descargable | Enlaces y permisos comprobados; versión, fuentes, licencias y límites visibles. |

La [guía de facilitación](facilitator.md) propone pedir un hallazgo real, un límite y una pregunta de seguimiento. Ofrece apoyo sin confundirlo con respuesta independiente. Si se realizan sesiones formativas, se registrarán barreras y errores anónimos, su contexto y las reparaciones; no la elección de la consulta. Si solo hay revisión interna, se informará así. No hay resultados de pilotaje, ganancias de aprendizaje, retención o efectos electorales acreditados en este documento.

**Evidencia actual.** Godot 4.7.2 y sus plantillas se instalaron con SHA-512 cotejado con sumas oficiales; GUT 9.7.1 está instalado. El SHA-256 del ZIP CCPC coincidió y se reprodujeron 9,773,730 filas de 32 CSV, con 33 agregados: nacional y 32 entidades. Pasaron **22 pruebas Python, 17 Node y 9/9 Godot GUT; Godot registra 40 aserciones y cero huérfanos**, incluyendo las dos pruebas de recorrido reparadas. La coherencia aritmética no demuestra unicidad o exhaustividad de la fuente.

Las exportaciones web y Linux finalizaron. Playwright completó HTML con las cinco acciones de consulta, persistencia y tres anchos; el arranque Godot web no registró errores de consola o página. Linux pasó arranque sin interfaz. Son alcances diferentes: no equivalen a un recorrido manual completo de ambas exportaciones. El reporte `build/evidence/browser-results.json` y sus capturas, el reporte de datos y los registros de herramientas sustentan estos avances; [verification.md](verification.md) conserva procedencia y límites.

Los borradores locales están producidos: narrativa PDF de cuatro páginas y presentación PDF de diez, con revisión visual de sus catorce páginas sin recortes. El video es una grabación real de pantalla, silenciosa con subtítulos, de 108.07 segundos, 1920×1080 a 30 fps, H.264 High y yuv420p; incluye SRT y transcripción aparte, sin voz grabada. Quedan revisión del equipo, cartas firmadas, alojamiento de solo lectura, evaluación formal con lector de pantalla y pilotaje. No se presenta el borrador como una candidatura enviada ni como evidencia de efectos educativos o electorales.

La evaluación con lector de pantalla y el pilotaje son controles internos de calidad y evaluación del proyecto, no requisitos oficiales de entrega. Su estado pendiente delimita la evidencia disponible, sin atribuir al prototipo resultados de uso o aprendizaje que no se han observado.

**Fuentes.** INE, [portal CCPC](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/), [datos abiertos de 2024 y diccionario incluido](https://ine.mx/wp-content/uploads/2025/08/DatosAbiertos_DECEyEC_ConteosCensales2024.zip), y [manual 2009–2024](https://ine.mx/wp-content/uploads/2025/06/Manual-Conteos-Censales-2009-2024.pdf). La reproducción utiliza el conjunto `ccpc-2024-v1`; la comparación combina conteos antes de calcular. El [registro de fuentes](source_register.md) conserva enlaces, procedencia y límites. La [convocatoria](https://www.ine.mx/wp-content/uploads/2026/09/Convocatoria_Hackaton-1.pdf) establece los requisitos de participación y entrega.

<!-- FIN DEL CONTENIDO PARA PDF -->
