# Revisión independiente de rúbrica — secuencia guiada y campaña rosa

**Voces de la Plaza · Equipo Latas · 27 de octubre de 2026**

**Valoración independiente: 95/100 — 35/35, 29/30, 18/20 y 13/15.** La revisión de RV21–RV26 no identifica bloqueos concretos pendientes en el código, los recorridos exportados o los medios inspeccionados. Las dos incidencias P2 detectadas fueron corregidas y cuentan con regresiones aprobadas. Esta valoración no es un resultado del comité, una certificación de accesibilidad ni evidencia de aprendizaje o adopción institucional.

El cierre se basa en los exports congelados, el core final, los recorridos nativos y canvas y los medios terminados. A las **20:35:58 UTC** se repitió independientemente la comprobación conjunta de **443 rutas de artefactos**, sin conflictos entre recibos ni hashes distintos de los archivos actuales. El cierre de medios está fechado a las **20:34:04 UTC**, sin escrituras pendientes de su responsable.

La [revisión del 25 de octubre](rubric_review_2026-10-25.md) queda archivada **sin cambiar un byte**: 9,527 bytes, SHA-256 `ce0489eb9a63484daefb0a075b934738ae8239a8c74fb1f9fbf07ea7e8cd9e6d`. No se hereda su puntuación. Este documento y [rubric_review_sequential_2026-10-27.md](rubric_review_sequential_2026-10-27.md) contienen el mismo informe actual.

## 1. Rúbrica oficial y resultado

Se leyó la [Rúbrica de evaluación_Hackaton -1.pdf](<../Rúbrica de evaluación_Hackaton -1.pdf>) suministrada, de tres páginas, SHA-256 `a5848c3f7100404a118cadd3efddaa73a8ad4c09942b452a345d86ab5b1f5f28`. Se conservan sus cuatro criterios y ponderaciones **35/30/20/15**. La calificación oficial corresponde al promedio de cinco personas evaluadoras; esta revisión no lo sustituye.

| Criterio oficial | Máximo | Puntuación | Deducción frente al máximo | Nivel e intervalo oficial |
| --- | ---: | ---: | ---: | --- |
| Apego a la temática | 35 | **35** | 0 | Excelente: 30–35 |
| Claridad y solidez de la propuesta | 30 | **29** | −1 | Excelente: 26–30 |
| Originalidad y creatividad | 20 | **18** | −2 | Excelente: 17–20 |
| Viabilidad para el aprovechamiento institucional | 15 | **13** | −2 | Excelente: 13–15 |
| **Total** | **100** | **95** | **−5** | Valoración independiente |

Los puntos son un juicio razonado sobre estos artefactos, no una conversión del número de pruebas en nota. Estar en el intervalo excelente no obliga a conceder su máximo. No se descuenta por defectos ya corregidos ni se introducen requisitos automáticos de exclusión que no estén en la rúbrica.

### Apego a la temática — 35/35

Los CCPC son centrales para dos misiones: leer participación y desconocidos con Luz, y distinguir cantidad de proporción con Mateo. La reunión de Inés utiliza una consulta explícitamente ficticia. A, B, C, boleta sin marcar y no participar habilitan el mismo cierre; ninguna preferencia política se califica.

La información preserva conteos, bases, año, fuente y límites. Nacionalmente se distinguen SV 54,899,228, NV 37,105,466 y NS 6,325,654. La tasa clasificada usa SV + NV; NS usa LN y no se convierte en abstención ni voto nulo. En la comparación guiada, Baja California tiene más registros con marca y Aguascalientes mayor proporción. Se suman conteos antes de dividir, y no se atribuyen motivos individuales a los agregados.

Las seis actividades, el taller opcional con dos de las 32 entidades, el cartel ciudadano y los materiales docentes sostienen el mismo propósito. Los controles de referencia cubren las 496 parejas en ambas medidas. Los entregables examinados incluyen aventura, ruta HTML independiente, narrativa de cuatro páginas, presentación de diez diapositivas, hoja de dos páginas y demostración inferior a 150 segundos. El PDF ciudadano conserva la fuente histórica sin marcas Latas/INEhack, sello oficial ni resultados ficticios.

**Deducción: 0.** No se observó una desviación temática o del producto solicitado que justifique descontar puntos. Esto no certifica requisitos administrativos de inscripción, firma o envío. Evidencia: [diseño aprobado](sequential_campaign_design.md), [contenido compartido](../game/content/story.json), [CCPC](../game/content/ccpc.json), [narrativa](storyline_and_dissemination_es.md) y recibos de ejecución y medios citados abajo.

### Claridad y solidez de la propuesta — 29/30

La secuencia se entiende y está verificada: todas las casas abren; una visita temprana dirige a la primera tarea pendiente; Luz → Mateo → Inés inician el aprendizaje; el tablón sirve para revisar y la prensa se reserva para imprimir al final. Una sola selección cercana alimenta indicación, botón y activación. Los paneles bloquean la interacción con el mundo y restituyen el foco al cerrar. Se conservan seis preguntas breves, apoyo opcional y la separación entre completar y demostrar comprensión.

El encargo distingue borrador, publicación e instantánea impresa. Cancelar o fallar al reemplazar conserva el trabajo anterior. El progreso puede conservar `campaign_printed` y ajustes, pero no la elección, resultados vinculados a ella, selecciones del cartel, encargo o PDF de trabajo. Los formatos y migraciones permanecen: Godot 2 y HTML 3, con historia 3. Descargar voluntariamente un archivo es distinto de incluirlo en el guardado del juego. Recargar una partida terminada no inventa un PDF personal.

La evidencia vincula fuentes y exports; incluye entrada real, descargas, renders, estados de recarga y errores. Las limitaciones de datos y comprobaciones se explicitan. La reproducción previa de 32 CSV, 9,773,730 filas y 33 agregados se mantiene como evidencia fechada, sin presentarla como una adquisición nueva; los bytes CCPC siguen intactos.

**Deducción: −1 por densidad editorial residual en los apoyos.** La página 2 de narrativa y los detalles completos del cartel reúnen siglas, dos bases distintas, porcentajes y fórmulas; el video agrega 32 segmentos, con hasta 21.997 caracteres por segundo, además del texto de la interfaz. Son legibles y cumplen los controles, pero exigen más atención que las seis preguntas simplificadas. Es un juicio editorial sobre las muestras finales, no un fallo de lectura observado con participantes ni un cambio del umbral aprobado de subtítulos. La exactitud de los datos y el método siguen siendo sólidos.

### Originalidad y creatividad — 18/20

La aportación está en conectar una plaza explorable, tres interlocutores, la corrección de un boletín y un cartel, una decisión ficticia plural y una pieza ciudadana personalizable. Volver físicamente a la primera casa y utilizar su prensa da un desenlace concreto al trabajo con datos. El cartel rosa funciona como material para conversar, con barras comparables, pregunta neutral y límites visibles.

La identidad visual se conserva entre pantalla y PDF, también en gris. Los registros distinguen originales del equipo y recursos externos: **Sunset Walk, de KiluaBoy, es música CC0 externa**; Atkinson conserva su licencia OFL. No se atribuye al equipo la autoría de esos recursos.

**Deducción: −2.** La combinación es cuidada y diferenciada, pero sus mecanismos principales —aventura lineal, conversación guiada, preguntas, barras y consulta con escenarios prefijados— utilizan recursos conocidos. La evidencia acredita una integración creativa propia, sin justificar el máximo por una metodología o interacción especialmente novedosa. No se afirma haber hecho una búsqueda exhaustiva de antecedentes ni medido un efecto real en participación. Evidencia: [final de campaña](campaign_finale.md), [diseño del cartel](poster_design.md), recorridos y muestras finales.

### Viabilidad para el aprovechamiento institucional — 13/15

La propuesta tiene vías de uso concretas: HTML semántico sin cargar Godot, aventura web, respaldo Linux y papel/proyector. La [guía](facilitator.md) identifica bachillerato y personas adultas principiantes, una clase propuesta de 20 minutos y formas individual, por parejas o proyectada. La [reutilización](institutional_reuse.md) describe alojamiento estático, requisitos, mantenimiento, cambios de datos, licencias y preparación de la persona facilitadora.

No se requieren cuentas ni recoger preferencias políticas. La difusión propone preparar una versión, revisar su encaje docente, realizar una sesión voluntaria, recibir observaciones anónimas y corregir. Los exports y documentos funcionan en los entornos comprobados; esto permite considerar alto su potencial de adaptación.

**Deducción: −2, distribuida así:**

- **−1 por falta de observación del uso previsto.** No hay pilotaje con docente/principiantes que contraste duración, apoyos necesarios o barreras. Los 10–15 minutos de aventura y la clase de 20 minutos siguen siendo estimaciones; los tiempos de operadores automatizados no las validan.
- **−1 por cobertura de acceso e implantación todavía acotada.** La evidencia actual se concentra en Chromium y Linux. No se repitieron Orca ni zoom nativo sobre esta edición; el PDF ciudadano no tiene conformidad PDF/UA acreditada. Las alternativas y pruebas existentes reducen la barrera, pero aún hacen falta comprobaciones en los entornos y modalidades de acceso de una institución receptora.

No se exige una certificación como condición inventada de la rúbrica: estas carencias delimitan la confianza en la implantación real. No se afirma adopción del INE, certificación curricular ni eficacia educativa. Las autorizaciones de distribución de originales, firma, alojamiento y envío permanecen separadas del funcionamiento técnico.

## 2. Evidencia final y límites de cobertura

| Evidencia | Resultado verificado | Alcance y límite |
| --- | --- | --- |
| [Core final conservado](../build/evidence/verification-core-sequential.json) y [agregado actual](../build/evidence/verification.json) | Python **39**, Node **46**, GUT **73**: **158 pruebas**, **2,022 aserciones GUT**, cero huérfanos. Siete comandos del core y tres ejecuciones independientes incorporadas: **10 comprobaciones ejecutadas**. Coinciden las 97 fuentes, 39 salidas y la comprobación conjunta de 443 rutas; `source_updates` vacío. | No se presenta el agregado como una única ejecución monolítica. Los recibos conservan procedencia y hashes de cada recorrido. |
| [HTML](../build/evidence/browser-results.json) y [campaña HTML](../build/evidence/browser-campaign-results.json) | Seis actividades por teclado, cinco acciones de consulta, taller, cancelación/reemplazo, privacidad, recarga y descargas reales repetibles. Chromium 153.0.8010.12; anchuras 320–1440 px. Revelación automática observada: **2.062 s**; también omisión y movimiento reducido. | El 200% corresponde a ampliación CSS, no zoom nativo. axe no registra infracciones, pero deja `color-contrast` incompleto en FIN. Se registran seis cancelaciones de solicitudes de rango del audio, sin errores del elemento multimedia ni de aplicación. |
| [Linux completo](../build/evidence/native-window.json) y [supervisor](../build/evidence/sequential-native-supervisor.json) | **459.925 s** internos / **460.072 s** externos, 138 capturas, 166 hashes comprobados. Entrada real, casas, indicaciones, diálogos, taller, FIN normal/ampliado, foco, cancelación del diálogo PDF, progreso privado y reinicio. Revelación automática **2.371 s**; cero errores de ejecución. | Operación automatizada, no sesión con participantes. La cobertura exhaustiva de las cinco decisiones corresponde a los recorridos compilados/GUT y HTML. |
| [PDF nativo](../build/evidence/native-pdf-save.json) | **149.857 s**, 47 hashes comprobados. Dos guardados mediante FileDialog, **132,861 bytes idénticos**, una página Carta y cero errores. Primera impresión con movimiento reducido observada a los **0.511 s**. | Ese tiempo incluye interacción y observación del arnés; no representa una animación reducida de medio segundo. Se inspeccionó el render descargado. |
| [Canvas exportado](../build/evidence/godot-web-journey.json) y [supervisor](../build/evidence/sequential-canvas-supervisor.json) | **729.119 s** internos / **729.94 s** externos, 136 capturas, 163 hashes directos comprobados. Seis actividades, indicaciones, entrada real, encargo, FIN normal/ampliado, reinicio y descarga real de **132,873 bytes**. E omite la primera revelación; observación **0.590 s**. Sin errores, solicitudes fallidas o diferencias con referencias. | Recorrido de **boleta sin marcar**, no cinco recorridos físicos. Conserva cuatro avisos WebGL de `ReadPixels`; no se ocultan bajo una afirmación de «consola vacía». La comparación de píxeles no sustituye la lectura visual. |
| [Paridad del cartel](../build/evidence/pink-poster-pdf.json), [pruebas](../build/evidence/pink-poster-tests.json) y [revisión del responsable](../build/evidence/pink-poster-review.json) | Seis casos nativo/JavaScript con bytes y raster de color coincidentes; variantes en gris, fuentes incrustadas, texto seleccionable, Carta 612 × 792 pt y mínimo declarado de 10.5 pt. | Los casos de igualdad, cercanía y base no disponible incluyen datos de prueba identificados; no son material de difusión con resultados reales. No se hizo una impresión física ni certificación PDF/UA. |
| [Documentos](../build/media-review-sequential-2026-10-27/document-review.json) y [cierre de medios](../build/media-review-sequential-2026-10-27/final-review.json) | **16 páginas**: narrativa 4, presentación 10, hoja 2. Revisión visual completa por su responsable. Se comprobaron independientemente 59 hashes del recibo documental y 34 del cierre; todos coinciden. | La inspección visual independiente adicional muestreó cuatro páginas: narrativa 2, diapositivas 5/10 y hoja 2; sin recortes visibles. Se conserva el generador exacto de la hoja congelada. |
| [Video final](../build/media-review-sequential-2026-10-27/pitch-review.json) | H.264, 1920 × 1080, 30 fps; **141.867 s de contenedor**, **141.833333 s de pista**, por debajo de 150 s. **32 segmentos y 42 muestras** revisadas por su responsable: 38 habituales + 4 adicionales. SRT/transcripción/ASS coinciden; máximo 21.997 caracteres/s y dos líneas, dentro del umbral de 23. Decodificación completa aprobada. Los 79 hashes del recibo coinciden. | Grabación automatizada **sin audio**. La revisión visual no fue reproducción humana de cada fotograma. La inspección independiente añadió cuatro muestras codificadas; no acredita audibilidad de la música del juego. El recibo conserva un 404 de favicon, sin error de la aplicación. |

### Inspección visual y paridad de las descargas

Se revisaron las muestras actuales del cartel de [nombres largos](../build/evidence/pink-poster-native-long.png), [proporción en gris](../build/evidence/pink-poster-gray-rate.png) y [fuente en dos líneas](../build/evidence/pink-poster-source-wrap-fixture.png). Titulares, valores, pregunta, límites y fuente se mantienen legibles, sin recortes visibles.

También se inspeccionaron el [PDF descargado en Linux](../build/evidence/native-campaign.png), [FIN nativo ampliado](../build/evidence/native-ending-large.png), su [pie desplazado](../build/evidence/native-ending-large-footer.png), el [PDF del canvas](../build/evidence/godot-web-campaign.png), [FIN del canvas ampliado](../build/evidence/godot-web-ending-large.png), su [pie](../build/evidence/godot-web-ending-large-footer.png) y la [dirección de Mateo hacia Luz](../build/evidence/godot-web-house-2-prerequisite.png). El desplazamiento permite leer el contenido largo conservando título y acciones visibles. Una parte de tarjeta fuera del viewport desplazable no se confunde con un control fijo recortado.

Las dos descargas nativas corresponden al ejemplo **AGS/BC**. El canvas y la descarga real de la grabación corresponden al cartel personalizado **Nuevo León/BC**, con 55.70% y 47.05%. Esa diferencia es intencional. Para esta última selección, el PDF del canvas coincide con el descargado por HTML durante la grabación. Los campos automáticos `visual_review` pendientes de algunos recibos runtime se complementan con esta inspección de sus imágenes; no se alteraron esos recibos para simular una comprobación automática.

## 3. Identidades de los artefactos evaluados

| Artefacto | SHA-256 |
| --- | --- |
| `build/web/game/index.pck` | `874cf04634c305853243e53fca8463be330e53b6dce1a3a3cedf5066ab829cd6` |
| `build/linux/voces-de-la-plaza.pck` | `14b04c34ff196452c582613ea1fa331bc6412eb6ea98ea12d7dc4c927df88373` |
| `submission/voces_narrativa_y_difusion.pdf` | `32f43e6eeda4f29f10f83be5ec3ca0bc8c4453ce2262423de96ef94b83c9ef7e` |
| `submission/voces_presentacion.pdf` | `f850cf9e6bbed68b1b6a1a2060bafc8ee88d3d30a23cd59685c3994dc60924db` |
| `submission/classroom-handout.pdf` | `cae5060df86507d13a6c9fa9b45b30a140dd6296ef7c6e333ffed100f30d064f` |
| `submission/voces_pitch_borrador.mp4` — nombre conservado, salida final evaluada | `dd7ac18f8dfd0053befb4840b0c7debc7b45a2419b0ec2585cd031a4284da940` |
| `submission/pitch_subtitulos.srt` | `d89ebb406867710bd471c9756fdcf603fbb6f23df6a83bb05fe45415a51d39c6` |
| `submission/pitch_transcripcion.txt` | `9cabe3ba7619ec59e09fb4dd6210bd51fe0340b796d0fdcfbb97d7a3a932ba38` |
| PDF ciudadano guiado descargado en Linux, 132,861 bytes | `affd8a6f3177450221e1f341e956dc3ce7904b72529bd2cfb625e7abca254d38` |
| PDF ciudadano personalizado descargado en canvas/HTML, 132,873 bytes | `d49099ea7bafeb853cfbe26f6eb8b0cc4cf8e4ec3570a98ca108260c9a8bc0a5` |

La ruta HTML y las demás salidas están identificadas individualmente en el core. Los recibos principales de este corte son:

| Recibo | SHA-256 |
| --- | --- |
| `verification-core-sequential.json` | `31f29299aadc25384fa1e125bb6b279916d1a4aae53285c99021d30fc06e52aa` |
| `verification.json` agregado | `19218812d493e5a7fad20a0e2ec881f002f7f93fde9e9440a832ccf05e7f2eaa` |
| `document-review.json` | `8e7d77527665636a9db7051a630f30cc1f75c2ff9b5b0cd8bdbc8404e257f944` |
| `pitch-review.json` | `8b1dd3c4f3d438ce5c76e40e326b20e5f949ce113796e6502c21dd5a4b5d31d2` |
| `final-review.json` de medios | `b26e24670436d5849061b8e2a15c984000d5a10d54156ee42d8f0613b1ff83b9` |

El ZIP que incluya este informe se generará y comprobará después. **Su identidad se registrará en un recibo externo, no dentro de este informe**, para evitar una referencia recursiva. La puntuación corresponde a los artefactos anteriores; no espera al ZIP que contenga su propio texto. Un fallo real posterior del paquete podrá motivar una enmienda.

## 4. Incidencias detectadas y corregidas

| Hallazgo | Reproducción y efecto original | Corrección y evidencia |
| --- | --- | --- |
| **SEQ-P2-01: foco tras la primera impresión** | Imprimir por primera vez, omitir la revelación y cerrar con Explorar o Escape podía dejar el foco sin un control utilizable: el botón cercano todavía estaba desactivado al intentar restaurarlo. | [main.gd](../game/scripts/main.gd), `_close_panel`, líneas 248–255: refresca la interacción después de ocultar panel/fondo y antes de restaurar foco. [test_ending.gd](../game/tests/test_ending.gd), línea 165: regresión GUI de primera impresión, omisión, ambos cierres, foco en el botón y reapertura con Enter. |
| **SEQ-P2-02: repaso bloqueado tras completar** | Luz e Inés completadas y la urna final no ofrecían retomar voluntariamente actividad/consulta, aunque HTML conservaba esa posibilidad. | [main.gd](../game/scripts/main.gd), líneas 231, 453 y 457: «Explorar otra decisión ficticia», «Repasar la reunión» y «Repasar la actividad». [test_interactions.gd](../game/tests/test_interactions.gd), línea 109: imprime mediante `Campaign.print_job` y verifica que el repaso conserve encargo, PDF, `campaign_printed` y ubicación. Activa señales de botones; no se presenta como recorrido físico completo. |

Ambas correcciones están en la fuente congelada y sus regresiones integradas pasan. La nota de recarga compartida también se volvió neutral: informa que no hay un diseño listo en esa sesión y que los diseños no se guardan al cerrar. No se añaden campos de guardado para las selecciones privadas.

El primer intento nativo se conserva como fallido: el recorte de la comparación visual incluía el comienzo del cartel desplazable. Se cambió su límite vertical de 240 a 220 px, conservando igualdad exacta de píxeles; la repetición completa aprobó con el mismo export. El límite externo nativo pasó de 480 a 600 s, y el canvas usa un watchdog de 900 s con 930 s externos, para sus recorridos ampliados. **Estos presupuestos de ejecución no amplían la revelación de 2.5 s ni relajan los controles de píxeles o errores.** Los tiempos de operadores automatizados tampoco validan la duración educativa.

## 5. Limitaciones y prioridades

No hay pilotaje con participantes, medición de aprendizaje o efectos electorales, adopción institucional, evaluación actual con Orca, zoom nativo repetido ni certificación PDF/UA. La observación con Orca/zoom del 25 de octubre es histórica. El muestreo de imágenes y las comprobaciones automáticas no prueban accesibilidad universal, comprensión por principiantes ni funcionamiento en todos los equipos. No se repitió la adquisición completa del conjunto CCPC. El video silencioso no evalúa la audibilidad de la música.

Las prioridades restantes son proporcionales a esos límites:

1. **Completar el paquete local y su comprobación externa.** Incluir estas versiones del informe y los documentos, verificar la extracción limpia y sus identidades, y registrar el resultado fuera del ZIP. Si aparece un defecto real que cambie la valoración, enmendar el informe. Este paso pertenece a integración; firma, alojamiento y envío siguen separados.
2. **Comprobar acceso sobre la versión entregada.** Repetir Orca y zoom nativo, resolver la comprobación manual de contraste pendiente en FIN y revisar la modalidad de documentos que necesite la institución receptora. Texto seleccionable no equivale a PDF/UA.
3. **Observar uso educativo voluntario.** Con docente y principiantes, registrar tiempos, barreras y apoyo; contrastar explicaciones de un hallazgo, un límite y una pregunta de seguimiento. No recoger nombres, preferencias políticas ni elecciones individuales.
4. **Afinar la lectura de los apoyos.** Mantener las cifras exactas, pero priorizar las ideas en las páginas densas y ofrecer pausas o segmentos en la demostración. Comprobar la mejora con lectores antes de atribuirle efectos de aprendizaje.

**Dictamen de esta revisión:** propuesta técnicamente comprobada y temáticamente sólida, con alto potencial educativo e institucional, valorada en **95/100** dentro del alcance descrito. La puntuación es nueva, razonada y revisable ante evidencia material posterior; no garantiza la nota del comité.
