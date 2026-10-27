# Voces de la Plaza · Ruta HTML secuencial y campaña rosa

Historia completa con HTML semántico, independiente de Godot. Servir el
repositorio por HTTP y abrir `/web/`. El paquete final usa `/build/web/` o la
ruta donde se publique su contenido. `file://` no permite cargar los JSON con
`fetch`. No hay fuentes remotas, cuentas ni telemetría.

Main exporta: copia **todos** los archivos de `web/` a `build/web/` y el
contenido canónico de `game/content/` a `build/web/content/`, incluidos
`ccpc.json`, `story.json`, `campaign_font.json` y `campaign_layout.json`.
Godot queda en `build/web/game/index.html`. En desarrollo los JSON se leen
directamente desde `game/content/`; el paquete no intenta rutas de desarrollo.

## Contrato compartido y evaluador

`story.json` **es obligatorio**, versión `3.0.0`. No hay preguntas antiguas de
sustitución. `normalizeStory(value)` devuelve el mismo contenido validado o
`null`; `loadStory()` muestra un error recuperable si falta contenido.

Los títulos, preguntas, opciones, pistas, explicaciones y vistas de las seis
actividades vienen del archivo canónico. Esta es la lista cerrada de reglas;
no se ejecutan expresiones del JSON. El orden del texto/opciones se conserva.

| Actividad | Capítulo | Regla | Vista | Opciones | Transferencia |
| --- | --- | --- | --- | --- | --- |
| participation-reading | printing | national-participation | national | sv, nv, equal | no |
| unknown | printing | unknown | national | separate, nv | no |
| unknown-transfer | printing | unknown-transfer | printing-fixture | unknown, nv, sv | sí |
| more-count | comparison | count | count | state_01, state_02, equal | no |
| higher-rate | comparison | rate | rate | state_01, state_02, equal | no |
| comparison-transfer | comparison | comparison-transfer | comparison-fixture | no, yes | sí |

También se validan las tres casas (`printshop → printing`, `archive → comparison`,
`hall → consultation`), los tres capítulos, texto no vacío, los cinco campos de
`optional_math` y los dos conjuntos de `assessment_fixtures`. Los conteos deben
ser enteros seguros no negativos y cumplir `LN = SV + NV + NS`; una base cero
es válida y no se reemplaza por otro ejemplo. Se exigen proyectos A/B/C y
escenarios `baseline`, `more_same_winner`, `more_other_winner`, con tres conteos
no negativos dentro de las preferencias del roster compartido. El roster suma
`eligible_npcs` y la persona que juega es adicional.

- `assessActivity(activity, answer, data, story)` acepta el objeto de actividad
  (o su ID) y devuelve `{correct, available, message}`. Reglas conceptuales:
  `unknown → separate`, `unknown-transfer → unknown`, `comparison-transfer → no`.
  Las comparaciones usan conteos y productos cruzados `BigInt`, sin redondear.
  Datos faltantes/base nacional o de tasa cero: `available:false`. Para pruebas
  de paridad, `answer:'unavailable'` coincide con ese resultado; la interfaz
  desactiva respuestas y ofrece continuación explícita **con apoyo**, sin
  afirmar una respuesta correcta ni comprensión independiente.
- `aggregateRecords`, `assessAnswer`, `transferExercises` conservan las fórmulas
  y los ejercicios antiguos `transfer1`/`transfer2`. Se usan solo como ejemplos
  opcionales y pruebas matemáticas; no bloquean el recorrido.
- `resolveConsultation(choice, scenario, story)` usa escenarios/roster canónicos.
  La firma antigua de dos argumentos y `SCENARIOS` se conservan para regresión.
- `views.mjs` presenta barras, tablas, fuentes y artefactos. Los datos exactos y
  cálculos son expandibles. Los desconocidos tienen su propia base y nunca se
  mezclan con el porcentaje clasificado en un gráfico de 100%.

## Navegación, apoyo y privacidad

Las tres casas se pueden visitar desde el principio. Las conversaciones y
actividades siguen **Luz → Mateo → Inés → prensa → FIN**. Una visita temprana
orienta hacia Luz en la casa izquierda o, después del boletín, hacia Mateo en
la casa central, con instrucciones propias de la navegación HTML. Solo los
anfitriones ofrecen las actividades; la prensa es un objeto distinto y sirve
exclusivamente para el cartel final. Las visitas a un anfitrión ya completado
indican el siguiente paso y ofrecen repasar como acción secundaria.

Entrar enfoca el título de la casa. Escape cierra la tarea y restaura su botón;
otro Escape desde la casa vuelve a la plaza y restaura el botón de entrada.
La pantalla FIN tiene su propio cierre: Escape o «Seguir explorando» devuelve
el foco a un control utilizable sin cambiar de casa. Reiniciar empieza en la
plaza. Esta navegación semántica sigue siendo independiente del movimiento
WASD de Godot.

Las explicaciones se revelan después de responder correctamente o al pedir
apoyo. Un error ofrece mirar otra vez; no entrega la solución automáticamente.
Pistas, ejemplos y cálculos abiertos antes de responder se distinguen de una
respuesta sin apoyo. La ayuda nunca rellena una opción correcta en nombre del
estudiante. No se guarda ninguna respuesta ni se declara dominio por terminar.

Se conserva la clave `voces-plaza.web.v1` para migrar dispositivos, con formato
`version:3`: `completedChapters`, `legacyCompleted`, `settings`, `hints`, `assisted`
y `campaign_printed`. Los formatos 1 y 2 conservan el avance, sin inventar una
campaña impresa. `settings` solo acepta `textSize`, `reducedMotion`, `muted` y
`music_volume` (0–1; valor inicial 0.2).
La revisión secuencial/rosa mantiene estos formatos: no añade otra migración.
Los capítulos anteriores 1/2/3 se convierten a IDs canónicos y se honran; no se
migran respuestas, pistas ni supuestos logros a los nuevos checks. La interfaz
avisa que el guardado anterior no evaluó las actividades nuevas.

No se guardan boleta, resultado, reflexión ni respuestas de actividades. Los
resultados de consulta desaparecen al salir/cerrar/recargar. Las cinco acciones
permiten el mismo final; el guardado solo conserva haber terminado. Almacenamiento
denegado o corrupto permite jugar en memoria.

## Campaña, diálogo y música

Después de cualquiera de las cinco decisiones y su seguimiento, Inés presenta
`story.campaign`: revisa el cartel publicado con Mateo o el ejemplo
`state_01/state_02/rate/missing`. «Enviar a la imprenta de Luz» prepara el PDF
asíncrono con `campaign-pdf.mjs` y conserva copias de sus bytes, de la selección
y del cartel compuesto en memoria. Antes de imprimir se puede reemplazar
explícitamente el envío con el cartel actual. Cambiar o cancelar un borrador no cambia el envío;
cancelar una preparación, salir de la casa, un error o reiniciar impiden que un
resultado asíncrono tardío lo reemplace.

La navegación HTML lleva a la imprenta de Luz. «Imprimir cartel» marca el
cierre una sola vez, antes de revelar la hoja. La animación dura dos segundos
(límite aceptado: 2.5 s); E, Enter o «Saltar animación» la omiten. El ajuste
de movimiento reducido de la aplicación o del sistema muestra FIN de inmediato.
Cerrar durante la animación no deshace la impresión; reabrir el final o terminar
otra consulta no repite la animación.

**FIN · La campaña comienza contigo** ocupa un diálogo dedicado. El título y
las acciones «Descargar cartel PDF», «Ampliar cartel» y «Seguir explorando»
permanecen visibles mientras el cartel ampliado se desplaza por separado.
La vista inicial muestra un resumen textual con esas acciones, sin una miniatura
del cartel. Ampliar alterna el cartel real congelado y el resumen. La descarga
requiere una acción explícita y entrega `cartel-ciudadano.pdf`, una página Carta. No se usa
una impresora física ni se envían mensajes. Las descargas repetidas y la vista
ampliada conservan la impresión, incluso si después se edita el taller.

El cartel ciudadano usa rosa `#B41476`, blanco `#FFFFFF`, tinta `#242124` y
rosa pálido `#FBEAF3`. El titular blanco sobre rosa dice «Tu voto cuenta.
Infórmate y participa.»; la etiqueta es «Campaña ciudadana · Material educativo».
La vista HTML lee colores y textos de `campaign_layout.json` y carga Atkinson
Hyperlegible Regular/Bold desde `campaign_font.json`, los mismos recursos locales
de los escritores PDF. Conserva hallazgo, dos barras de igual escala/color,
valores, pregunta en campo pálido, conteos, base, NS, límites y enlace oficial.
Una proporción no disponible no dibuja barra. No hay logo oficial, marca de
Latas/INEhack, afirmación de respaldo institucional ni resultados de la consulta
ficticia en el cartel.

Cuando no hay diseño en la sesión, el mensaje orienta a Inés para prepararlo,
sin suponer un envío anterior. Al recargar un envío pendiente hay que recrearlo.
Un guardado terminado muestra el cierre y explica que el diseño anterior no se
conservó; no inventa una vista personalizada ni habilita su descarga. Reset
elimina la selección, el envío, los bytes y el enlace Blob. No se guardan en
localStorage, sessionStorage o URL.

Los diálogos usan tarjetas en el flujo semántico, junto al objetivo y antes de
las actividades de cada casa. Las visitas tempranas no muestran el discurso
sustantivo bloqueado. Las preguntas simplificadas siguen viniendo de `story.json`,
con los mismos seis IDs y reglas. Preguntas, tablas, fuentes y taller conservan
paneles amplios y lectura adaptable.

La música CC0 Sunset Walk se inicia después de una interacción, al 20% salvo
ajustes guardados. Se puede silenciar y cambiar el volumen con controles
etiquetados. Un rechazo de reproducción no bloquea la historia. En `/web/` se
lee `../game/assets/audio/sunset-walk.ogg`; el paquete usa
`./assets/audio/sunset-walk.ogg`. No se duplica el OGG en el código web.

## Recursos de clase

`#classroom-resource` enlaza `./classroom.html`, guía docente del paquete.
El exportador incluye esa página y `classroom-handout.html`/`.pdf`, generados
con `node tools/render_submission.mjs --handout-only` desde los documentos
canónicos. La ruta de fuente `/web/` es para desarrollo; estos recursos se
comprueban en `/build/web/`. No hay una segunda copia editable de las cifras.

## Verificación

```sh
node --test tests/*.test.mjs
node --check web/app.mjs
node --check web/views.mjs
# Fuente: servidor en la raíz del repositorio; evidencia fuera del paquete final.
PREVIEW_URL=http://127.0.0.1:8765 HTML_PATH=/web/ SKIP_GODOT=1 EVIDENCE_DIR=/tmp/voces-html-check node tests/browser_smoke.mjs
PREVIEW_URL=http://127.0.0.1:8765 HTML_PATH=/web/ EVIDENCE_DIR=/tmp/voces-html-check node tests/browser_campaign.mjs
# Solo después del export de main: HTML ensamblado y arranque real de Godot.
node tests/browser_smoke.mjs
node tests/browser_campaign.mjs
```

El smoke usa los JSON servidos junto a la ruta probada. Recorre las seis
actividades y cinco decisiones con Tab/flechas/Enter/Espacio, verifica foco,
apoyo, base nacional cero, migración, privacidad, contenido faltante/reintento,
almacenamiento denegado, semántica, contraste de texto sobre fondos sólidos y
reflujo a 320/768/1024/1440 px con tareas/tablas abiertas. Comprueba texto al 200%
por CSS además del ajuste grande, verificando tamaños efectivos de **32 px en
la raíz y 40 px en el cuerpo**; **no equivale a verificar zoom nativo**.
Usa axe solo si está instalado localmente o se proporciona `AXE_PATH`.

`browser_campaign.mjs` comprueba las cinco acciones hasta un archivo descargado
real, formato Carta con `pdfinfo`, texto con `pdftotext`, igualdad de bytes en
descargas repetidas y entre boletas con el mismo diseño, sustitución explícita,
cancelación de borrador y de generación asíncrona, fallo recuperable de una
sustitución, recarga pendiente/terminada, privacidad, inicio de
audio tras interacción, mute/volumen guardados y reset. Esas herramientas de
Poppler son requisitos de verificación, no dependencias del navegador.
También verifica E, Enter y el botón para omitir la revelación, el límite de
2.5 segundos, movimiento reducido de aplicación/sistema, cierre sin viajar,
reapertura inmediata y conservación de vista/bytes tras editar después de imprimir.
También inspecciona el despacho y el final con axe, anchos de 320/768/1440 px
y texto CSS al 200% combinado con el ajuste grande. El título y las tres acciones
finales deben caber sin desplazar la pantalla, incluso al desplazar el cartel.
Las cancelaciones de un rango OGG por Chromium se registran aparte cuando solicita otra parte de la
pista; los errores de script, consola, respuestas de recursos y reproducción
siguen provocando un fallo.

Sin `SKIP_GODOT`, conserva el protocolo de `godot-browser.png`, Escape y
`godot-plaza.png`, además de `browser-results.json`. La prueba de fuente impide
sobrescribir `build/evidence`. Main genera los exports; las comprobaciones web
no modifican sus archivos Godot.

La revisión HTML de campaña cambia contenido y foco. Las observaciones de Orca
del 25 de octubre permanecen históricas y **no validan esta revisión**. No se
repitió una sesión con lector de pantalla ni zoom nativo para estos cambios.
Las comprobaciones semánticas, de teclado y axe no equivalen a certificación
de accesibilidad; tampoco hay un piloto con estudiantes/docentes.

## Evidencia exportada · 27 de octubre de 2026

Main ejecutó la verificación formal `python3 tools/verify.py --browser`.
`build/evidence/verification.json` registra **siete comandos con código de salida
0**, incluidos los dos recorridos HTML contra
`http://127.0.0.1:8765/build/web/`. Estos resultados pertenecen al export
secuencial/rosa con el mensaje neutral actualizado de sesión sin diseño.

- Node: **46/46**, cero fallos u omisiones, en
  `build/evidence/node-tests.log`. Comando formal exacto:
  `node --test --test-isolation=none tests/campaign-pdf.test.mjs tests/web.test.mjs`.
- `node tests/browser_smoke.mjs`: **pasó**, Chromium **153.0.8010.12**.
  `build/evidence/browser-results.json` registra recorrido de teclado, seis
  actividades, cinco decisiones, apoyo, migración, privacidad, recursos de clase,
  arranque Godot, reflujo y texto ampliado; `errors` y `gameErrors` están vacíos.
  Los cinco estados axe examinados no tienen violaciones ni elementos incompletos.
- `node tests/browser_campaign.mjs`: **pasó**. El recibo
  `build/evidence/browser-campaign-results.json` conserva descargas Carta reales,
  hashes, reemplazo/cancelación, recargas, audio, privacidad y geometría de FIN.
  La revelación automática midió **2,068 ms**; omitir con botón/E/Enter y las
  dos rutas de movimiento reducido también pasaron. No es un benchmark de otros
  dispositivos.
- Axe en campaña: despacho sin violaciones ni elementos incompletos; FIN sin
  violaciones, pero con **`color-contrast` en `incomplete`**. Esa comprobación
  automática no queda resuelta por llamar al recorrido «pasado». Las mediciones
  de la paleta rosa/blanco (6.36:1) y tinta/rosa pálido (13.78:1), junto con la
  inspección visual, son evidencia complementaria, no una auditoría completa.
- El recibo de campaña separa **seis cancelaciones de rango OGG**
  (`net::ERR_ABORTED`). La reproducción no tuvo errores; la lista restante de
  errores de script, consola y red está vacía.

Alcance de las capturas en `build/evidence/`:

- `html-campaign-ending.png` muestra el **resumen fresco de FIN**, tomado tras
  imprimir y descargar el cartel personalizado, antes de recargar. Muestra
  encabezado y acciones; no acredita una vista compacta del cartel, que no forma
  parte de ese resumen HTML.
- `html-ending-enlarged-poster.png` muestra el **cartel real ampliado** de una
  sesión activa (ejemplo Aguascalientes/Baja California), con acciones visibles
  encima del área desplazable. Se captura antes de recargar.
- `html-ending-320.png` y `html-ending-large-200.png` documentan los controles
  del resumen a 320 px y con la ampliación CSS efectiva más el ajuste grande.
- Los archivos `campaign-*.pdf` conservan las descargas comprobadas. Las pruebas
  posteriores de recarga muestran finalización sin restaurar diseño ni PDF.

Los antiguos **43/43** y los recibos de `/tmp/voces-html-final-export/` son
evidencia histórica de la campaña anterior; no certifican esta revisión.
El recibo de fuente `/tmp/voces-html-rv24-final/html-source-freeze.json` es
suplementario y precede al último cambio compartido de `campaign.reload_note`.
Los recibos exportados actuales cubren esa copia posterior.

Esta revisión solo acredita el navegador indicado. No hay una nueva sesión de
Orca ni prueba de zoom nativo; las observaciones del 25 de octubre permanecen
históricas. Tampoco se afirma certificación de accesibilidad ni piloto docente.
La actualización de este README es documental: no repite pruebas ni modifica
código, capturas, PDFs o recibos; main integra su hash en las huellas finales.
