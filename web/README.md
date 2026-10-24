# Voces de la Plaza · Ruta HTML

Experiencia completa sin framework ni fuentes remotas. Servir el repositorio por
HTTP y abrir `/web/`; no abrir `index.html` mediante `file://` porque el contenido
compartido se carga con `fetch`.

## Integración

El empaquetador de main copia el contenido de `web/` a `build/web/`, los JSON a
`build/web/content/` y la exportación de Godot a `build/web/game/index.html`.
El enlace Godot es `./game/index.html` en el paquete; `/web/` en desarrollo apunta
a `../build/web/game/index.html`. Si Godot aún no está exportado, la historia HTML
sigue siendo independiente y el aviso junto al enlace lo explica.

La carga de CCPC usa `../game/content/ccpc.json` solo cuando la página está en
`/web/` o `/web/index.html`; en el paquete, raíz u otra ruta usa directamente
`./content/ccpc.json`, sin solicitar primero una ruta de desarrollo inexistente.
Exige el contrato `1.0.0`, dataset `ccpc-2024-v1`, fuente
HTTPS con hash y diccionario, conciliación LN = SV + NV + NS y tasas compatibles
con los conteos. Acepta el paquete completo de 33 registros y exige los tres que
usan los capítulos: `national`, `state_01`, `state_02`. Un fallo muestra un error
y un botón de reintento; no hay datos oficiales de sustitución.

`story.json` es opcional y usa la misma selección de carpeta. Se consume el
formato canónico de main (`printing`, `comparison`, `consultation` y los proyectos
anidados en `consultation.projects` con `name`/`benefit`/`tradeoff`). También se
acepta la forma de integración inicial:

```json
{
  "schema_version": "1.0.0",
  "title": "Voces de la Plaza",
  "message": "Mensaje cívico de cierre",
  "chapters": [{ "id": 1, "title": "Título", "question": "Pregunta", "intro": "Introducción", "quote": "Diálogo" }],
  "projects": [{ "id": "A", "title": "Proyecto", "description": "Necesidad", "tradeoff": "Mantenimiento pendiente" }],
  "ending": { "title": "Título del cierre", "body": "Reflexión" }
}
```

Los capítulos tienen id canónico de texto o numérico 1–3 y los proyectos A–C. Los campos de texto son
opcionales y se insertan con `textContent`. El HTML contiene una historia completa
si el archivo opcional falta. El JSON aporta prosa; las reglas no se cambian con
el texto.

Main puede añadir al JSON canónico las transferencias sintéticas mediante:

```json
{
  "assessment_fixtures": {
    "printing": { "ln": 100, "sv": 60, "nv": 30, "ns": 10 },
    "comparison": [
      { "ln": 40, "sv": 20, "nv": 20, "ns": 0 },
      { "ln": 200, "sv": 60, "nv": 140, "ns": 0 }
    ]
  }
}
```

Se calculan desde esos conteos la pregunta, las opciones, las pistas, la respuesta
y la explicación. Si faltan o son inválidos, se usan esos mismos casos sintéticos
canónicos: 66.67 % y 33.33 %, equivalentes a Godot. Nunca sustituyen observaciones
CCPC. La fuente tipográfica es la del sistema con alternativas locales; no hay
fuentes remotas. El favicon SVG está incluido como URL `data:`.

## Reglas puras en `logic.mjs`

- `aggregateRecords(records)` devuelve `{ln,sv,nv,ns,classified,participation_pct,unknown_pct}`; las tasas sin base son `null`.
- `validateDataset(data)` devuelve el bundle validado o lanza un error.
- `contentPaths(filename, pathname?)` elige fuente o paquete. Sin ubicación (Node) conserva las dos rutas para pruebas inyectables.
- `loadDataset(fetcher?, pathname?)` carga y valida el bundle; no requiere Node en el navegador.
- `transferExercises(assessmentFixtures?)` calcula los dos ejercicios sintéticos. Respuestas predeterminadas: `66.67` y `33.33`.
- `assessAnswer(quest, answer, data, assessmentFixtures?)` devuelve `{correct,message}`. IDs de pregunta: `denominator`, `unknown`, `more-count`, `higher-rate`, `combined`, `limit`, `transfer1`, `transfer2`.
- `SCENARIOS` contiene `base` A8/B5/C3, `more-a` A11/B8/C6 y `more-b` A8/B10/C7.
- `createRoster()` devuelve las mismas 30 personas sintéticas `{id,preference}`, con preferencias A12/B10/C8.
- `resolveConsultation(choice, scenario='base')` acepta `A`, `B`, `C`, `unmarked`, `decline` y devuelve `{counts:{A,B,C},unmarked,population:31,participants,winner,tied,needsSecondDecision}`.
- `resolveTally(counts)` devuelve `{winner,tied,needsSecondDecision}`; un empate exige otra decisión, sin prioridad automática.
- `sanitizeProgress`, `readProgress(storage)` y `writeProgress(storage, progress)` permiten solo `{version:1,completedChapters,settings:{textSize,reducedMotion},hints}`. La clave es `voces-plaza.web.v1`. Nunca guardan intentos, boletas, resultados o reflexiones. Un almacenamiento bloqueado no impide jugar.
- `gameHref(pathname)` distingue la ruta fuente de la exportada.
- `normalizeStory(value)` adapta la prosa canónica a capítulos 1–3 y proyectos; un esquema incompatible devuelve `null` para conservar la historia HTML.

## Verificación

```sh
node --test --test-isolation=none tests/web.test.mjs
node --check web/app.mjs
```

Los fixtures de las pruebas son sintéticos, distintos del bundle oficial. La
verificación de navegador de integración debe cubrir teclado, lector de pantalla,
320/768/1024/1440 px, ampliación, pérdida de almacenamiento, reintento y los cinco
tipos de decisión. No se afirma una auditoría formal de accesibilidad.
