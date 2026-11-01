# Verificación final de Godot · Equipo Latas

Edición del 31 de octubre de 2026, hora de Monterrey. Los recibos técnicos usan UTC y pueden mostrar el 1 de noviembre. Esta entrega incluye únicamente Godot para navegador y Linux x86_64; la implementación narrativa independiente queda fuera del producto actual.

## Resultados ejecutados

| Comprobación | Resultado actual | Alcance |
| --- | --- | --- |
| Python | **41 pruebas aprobadas** | Datos, recursos, fuentes, limpieza del exportador y servidor local limitado a la carpeta pública, con MIME WebAssembly y rutas con espacios. |
| Godot/GUT | **73/73**, **2,022 aserciones**, cero huérfanos | Reglas, seis actividades, 496 parejas, guardado, interacción cercana, foco, campaña y modos del final. |
| PCK Linux compilado | Cinco decisiones y modos normal/E/Enter/botón/movimiento reducido aprobados | Es un recorrido de lógica sobre el paquete compilado; no se presenta como cinco partidas físicas. |
| Linux real | **465.678 s**, sin errores de ejecución | 114 comprobaciones de movimiento, preguntas, conversaciones, carteles, prensa, FIN, texto grande, cancelación de guardado y reinicio. |
| Guardado PDF Linux | **149.476 s**, dos guardados reales mediante FileDialog, bytes idénticos | Una página Carta, texto seleccionable, conteos/bases/NS/fuente, límites de página y render revisados. PDF de ejemplo: 132,861 bytes. |
| Godot en navegador | **833.943 s**, sin errores de página, aplicación, solicitudes o referencias | Un recorrido físico de consulta, seis preguntas, taller, encargo, prensa, FIN ampliado, descarga real y reinicio; 136 capturas y 114 comprobaciones de movimiento. |
| Lectura de carteles | Siete comparaciones completas contra las referencias nativas | Se conserva la exigencia F1 ≥ 0.90 y los controles de tinta, scroll, encabezado y acciones fijas. |
| Arranque web | Aprobado en Chromium, `lang="es"`, canvas real y PCK servido idéntico | Se verifican MIME, recursos, entrada HTTP y 404 para rutas retiradas; no equivale a probar cualquier navegador. |

En total son **114 pruebas unitarias**. Las pruebas de la antigua ruta independiente se conservan como histórico del repositorio y no se cuentan en esta entrega. `python3 tools/verify.py --browser` completó sus cinco comandos; el core final identifica **95 fuentes y 23 archivos exportados**. El agregado verifica **426 rutas de artefactos** e incorpora tres recorridos reales ejecutados aparte: ocho comprobaciones en total. No se presenta como una única ejecución monolítica. `godot-only-core-final-2.json` conserva el core final y los recibos anteriores permanecen identificados como intentos previos.

La revelación normal se observó en 2.425 s en Linux, dentro del límite de 2.5 s. El E real del navegador omitió el final en una observación de 0.699 s. El primer FIN con movimiento reducido se observó en 0.543 s; ese tiempo incluye operación y observación del arnés, no una animación de medio segundo. Las cinco decisiones comparten el mismo final. Cuatro avisos de rendimiento WebGL por `ReadPixels` quedan registrados; no son errores ocultados ni una afirmación de consola vacía.

## Identidad de los exports

| Archivo | SHA-256 |
| --- | --- |
| `build/web/game/index.pck` | `7c14ee2fdfb1fecce896953568c36423295aeb1173af2a0e270bac87a5c3a06d` |
| `build/linux/voces-de-la-plaza.pck` | `14b04c34ff196452c582613ea1fa331bc6412eb6ea98ea12d7dc4c927df88373` |
| PDF guardado en Linux y ejemplo ciudadano | `affd8a6f3177450221e1f341e956dc3ce7904b72529bd2cfb625e7abca254d38` |
| PDF personalizado del navegador | `d49099ea7bafeb853cfbe26f6eb8b0cc4cf8e4ec3570a98ca108260c9a8bc0a5` |

El PDF nativo corresponde al ejemplo Aguascalientes/Baja California; el del navegador corresponde a Nuevo León/Baja California. La diferencia es intencional. Los datos CCPC y las reglas del juego permanecen iguales; se actualizan el envoltorio español y el flujo de publicación. No se reutiliza como aceptación el recorrido de otro PCK web.

La revisión visual de la captura de consulta muestra una elección C: el resultado es A:8, B:5, C:4 y cero boletas sin marcar. Algunas descripciones automáticas heredadas del arnés nombran esa ruta como «sin marcar»; esa etiqueta no se utiliza como prueba de la acción concreta. El video final corrigió esa narración. La cobertura de las cinco decisiones se acredita por separado mediante GUT y el PCK compilado, no se deduce de una sola grabación.

## Arranque y material de entrega

El exportador elimina residuos de la aplicación retirada. Una regresión reprodujo primero la copia indebida de `app.mjs` y después aprobó su retirada conservando Godot. El iniciador sirve solo `build/web`, utiliza localhost, comprueba archivos y ofrece un enlace; los tests verifican 404 fuera de la carpeta y `application/wasm`.

Dos intentos del arranque detectaron un favicon ausente y una solicitud de icono cancelada durante la redirección. Se corrigió la entrada con un icono vacío en línea; el icono propio de la página Godot permanece. Los recibos fallidos se conservan como intentos identificados. Las comprobaciones de errores no se relajaron.

El README, los planes de exposición/video, las recomendaciones humanas y las fuentes editoriales están en español. Las licencias, los identificadores del código y los logs técnicos conservan su idioma original. Se revisaron **20 páginas**: presentación 10, narrativa 4, hoja 2 y guía 4. Tras corregir enlaces, los 20 renders conservaron sus bytes visuales; sus PDFs y metadatos finales están identificados por el responsable de medios.

La demostración final dura **135 segundos**, con **20 cortes identificados**, **26 subtítulos** y máximo **21.75 caracteres/s**, dentro de los límites retenidos de 150 segundos y 23 caracteres/s. Se inspeccionaron 42 fotogramas. Es una edición de captura real de Godot, sin audio ni locución; no acelera la lectura ni representa un pilotaje. La sesión bruta incluye pausas de revisión y no mide la duración de un estudiante. Los recibos vigentes son `build/evidence/godot-demo-encoding.json` y `build/media-review-godot-2026-10-31/handoff.json`.

La [revisión independiente](revision_final_godot_es.md) está aprobada sin P1/P2 pendientes. Los dos P2 de empaquetado detectados se corrigieron: la referencia de datos independiente se entrega con huella fijada sin modificar sus bytes ni debilitar sus aserciones, y se incluyen los cinco logs del core. El comprobador del paquete también reproduce las pruebas Python desde el ZIP extraído.

La comprobación del ZIP se registra en `build/evidence/clean-candidate.json`, fuera del propio archivo. Ejecuta los iniciadores desde una carpeta con espacios, verifica CRC/manifiesto, Linux con PCK vecino y arranque Godot por HTTP. Ese recibo identifica el estado y los bytes exactos del candidato; no se incluye un hash recursivo del ZIP dentro de sí mismo.

## Límites de la evidencia

No hay pilotaje con principiantes/docentes, aprendizaje medido ni evaluación universal de equipos. Linux y Chromium son los entornos comprobados; las instrucciones Windows/macOS no se presentan como pruebas realizadas allí. El diálogo nativo y su idioma también dependen del entorno. El despliegue público y la configuración Nginx del organizador no se han ejecutado desde este proyecto.

La retirada de la ruta semántica reduce las alternativas de acceso. Los ajustes de Godot no acreditan lectores de pantalla; no se trasladan Orca, axe ni zoom históricos al canvas. El PDF no tiene conformidad PDF/UA acreditada. La valoración interna de 95/100 del 27 de octubre es histórica y no se anuncia como calificación actual. La [revisión humana propuesta](revision_humana_final_es.md) permite priorizar comprobaciones reales; no se declara que ya las haya realizado el equipo.

Los originales de investigación y los informes previos se conservan en el repositorio. No se hizo commit, firma, publicación ni envío externo. Esas acciones siguen separadas del cierre técnico local.
