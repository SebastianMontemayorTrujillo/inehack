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

`story.json` **es obligatorio**, versión `2.0.0`. No hay preguntas antiguas de
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
`version:2`: `completedChapters`, `legacyCompleted`, `settings`, `hints`, `assisted`.
Los capítulos anteriores 1/2/3 se convierten a IDs canónicos y se honran; no se
migran respuestas, pistas ni supuestos logros a los nuevos checks. La interfaz
avisa que el guardado anterior no evaluó las actividades nuevas.

No se guardan boleta, resultado, reflexión ni respuestas de actividades. Los
resultados de consulta desaparecen al salir/cerrar/recargar. Las cinco acciones
permiten el mismo final; el guardado solo conserva haber terminado. Almacenamiento
denegado o corrupto permite jugar en memoria.

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
# Solo después del export de main: HTML ensamblado y arranque real de Godot.
node tests/browser_smoke.mjs
```

El smoke usa los JSON servidos junto a la ruta probada. Recorre las seis
actividades y cinco decisiones con Tab/flechas/Enter/Espacio, verifica foco,
apoyo, base nacional cero, migración, privacidad, contenido faltante/reintento,
almacenamiento denegado, semántica, contraste de texto sobre fondos sólidos y
reflujo a 320/768/1024/1440 px con tareas/tablas abiertas. Comprueba texto al 200%
por CSS además del ajuste grande; **no equivale a verificar zoom nativo**.
Usa axe solo si está instalado localmente o se proporciona `AXE_PATH`.

Sin `SKIP_GODOT`, conserva el protocolo de `godot-browser.png`, Escape y
`godot-plaza.png`, además de `browser-results.json`. La prueba de fuente impide
sobrescribir `build/evidence`. No se generó ningún export para esta revisión web.
Ni las comprobaciones semánticas ni axe sustituyen una evaluación con lector de
pantalla; esa evaluación y el pilotaje con estudiantes/docentes siguen pendientes.
