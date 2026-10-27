# Voces de la Plaza · Ruta HTML de aula (RV09)

Historia completa con HTML semántico, independiente de Godot. Servir el
repositorio por HTTP y abrir `/web/`. El paquete final usa `/build/web/` o la
ruta donde se publique su contenido. `file://` no permite cargar los JSON con
`fetch`. No hay fuentes remotas, cuentas ni telemetría.

Main exporta: copia **todos** los archivos de `web/` (incluido `views.mjs`) y
`game/content/{ccpc,story}.json` a `build/web/content/`; Godot queda en
`build/web/game/index.html`. En desarrollo los JSON se leen directamente desde
`game/content/`; el paquete no intenta rutas de desarrollo.

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

Las tres casas se pueden visitar desde el principio. Solo las tareas requieren
el boletín/cartel previo. Entrar enfoca el título de la casa; Escape cierra la
tarea y restaura su botón, después sale a la plaza y restaura el botón de entrada.
El cierre vuelve a la plaza y permite reabrir los artefactos.

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
asíncrono con `campaign-pdf.mjs` y conserva una copia de sus bytes y de la
selección en memoria. Antes de imprimir se puede reemplazar explícitamente el
envío con el cartel actual. Cambiar o cancelar un borrador no cambia el envío;
cancelar una preparación, salir de la casa, un error o reiniciar impiden que un
resultado asíncrono tardío lo reemplace.

La navegación HTML lleva a la imprenta de Luz. «Imprimir cartel» habilita
«FIN · La campaña comienza contigo» y un enlace real para descargar el PDF
de una página Carta mediante otra acción del usuario. No se usa una impresora
física ni se envían mensajes. La descarga repetida usa los mismos bytes.
`campaign_font.json` y `campaign_layout.json` son recursos canónicos del
generador, incluidos en `content/` por el exportador.

Al recargar un envío pendiente se vuelve a Inés para recrearlo. Un guardado
terminado muestra el cierre y explica que el diseño anterior no se conservó;
no reconstruye un PDF personalizado. Reset elimina la selección, el envío,
los bytes y el enlace Blob. No se guardan en localStorage, sessionStorage o URL.

Los diálogos usan tarjetas de fondo translúcido al final de cada casa, en el
flujo semántico del documento. El contenido sustantivo sigue el orden Luz,
Mateo, Inés, aunque se pueda visitar cualquier casa. Las preguntas, tablas,
fuentes y el taller conservan paneles amplios y lectura adaptable.

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
PREVIEW_URL=http://127.0.0.1:8765 HTML_PATH=/web/ SKIP_GODOT=1 EVIDENCE_DIR=/tmp/voces-rv09 node tests/browser_smoke.mjs
PREVIEW_URL=http://127.0.0.1:8765 HTML_PATH=/web/ EVIDENCE_DIR=/tmp/voces-campaign node tests/browser_campaign.mjs
# Solo después del export de main: HTML ensamblado y arranque real de Godot.
node tests/browser_smoke.mjs
node tests/browser_campaign.mjs
```

El smoke usa los JSON servidos junto a la ruta probada. Recorre las seis
actividades y cinco decisiones con Tab/flechas/Enter/Espacio, verifica foco,
apoyo, base nacional cero, migración, privacidad, contenido faltante/reintento,
almacenamiento denegado, semántica, contraste de texto sobre fondos sólidos y
reflujo a 320/768/1024/1440 px con tareas/tablas abiertas. Comprueba texto al 200%
por CSS además del ajuste grande; **no equivale a verificar zoom nativo**.
Usa axe solo si está instalado localmente o se proporciona `AXE_PATH`.

`browser_campaign.mjs` comprueba las cinco acciones hasta un archivo descargado
real, formato Carta con `pdfinfo`, texto con `pdftotext`, igualdad de bytes en
descargas repetidas y entre boletas con el mismo diseño, sustitución explícita,
cancelación de borrador y de generación asíncrona, fallo recuperable de una
sustitución, recarga pendiente/terminada, privacidad, inicio de
audio tras interacción, mute/volumen guardados y reset. Esas herramientas de
Poppler son requisitos de verificación, no dependencias del navegador.
También inspecciona el despacho y el final con axe, anchos de 320/768/1440 px
y texto CSS al 200% combinado con el ajuste grande. Las cancelaciones de un
rango OGG por Chromium se registran aparte cuando solicita otra parte de la
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

## Evidencia local · 27 de octubre de 2026

- `node --test tests/*.test.mjs`: **43/43**, incluidos los 36 casos web y los
  7 casos del generador PDF de su propietario; sin pruebas omitidas.
- `PREVIEW_URL=http://127.0.0.1:8766 HTML_PATH=/build/web/ EVIDENCE_DIR=/tmp/voces-html-final-export node tests/browser_smoke.mjs`:
  **pasó**, Chromium **153.0.8010.12**. Recorrido de teclado, seis actividades,
  cinco decisiones, descarga real, recursos de clase y arranque Godot;
  cinco estados axe sin violaciones y consola sin errores.
- Con las mismas variables, `node tests/browser_campaign.mjs`: **pasó**.
  Cinco finales desde contextos independientes, descargas Carta reales,
  bytes repetidos idénticos, selección congelada, reemplazo explícito,
  cancelación asíncrona, fallo recuperable, recargas, privacidad, audio y reset.
  Despacho/final sin violaciones axe ni desbordamiento a 320/768/1440 px
  o al combinar texto grande y CSS al 200%.
- Evidencia: `/tmp/voces-html-final-export/browser-results.json`,
  `browser-campaign-results.json`, capturas `html-campaign-*.png` y archivos
  `campaign-*.pdf`. Las seis cancelaciones de rango OGG observadas se
  identifican en el recibo; reproducción y elementos de audio sin errores.
- Los módulos/HTML/CSS servidos coinciden con `web/`; no se modificaron los
  archivos Godot de los exports. La verificación formal y su registro definitivo
  corresponden a main. Las limitaciones de lector de pantalla/zoom anteriores
  siguen vigentes para esta evidencia.
