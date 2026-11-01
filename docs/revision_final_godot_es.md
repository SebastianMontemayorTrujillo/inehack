# Revisión final independiente · Godot web y Linux

Voces de la Plaza · Equipo Latas · 31 de octubre de 2026, hora de Monterrey. Los recibos usan UTC y pueden mostrar el 1 de noviembre.

**Resultado: aprobado para ensamblar el candidato local. No quedan P1/P2 pendientes en el alcance revisado.** El [recibo de esta revisión](../build/evidence/godot-only-review.json) registra `status: "passed"`, alcance, límites y huellas. Esta aprobación precede al ZIP: no afirma que su construcción o comprobación limpia ya hayan terminado.

## Alcance y método

Se leyeron los contratos vigentes, fuentes y cambios de exportación, iniciadores, empaquetador, comprobador, verificador, README y guías. Se cotejaron recibos y bytes actuales sin repetir suites, exportaciones, renderizados ni recorridos pesados. Las únicas escrituras de esta revisión son este informe y su JSON.

La instrucción del 31 de octubre sustituye la entrega dual: Godot para navegador y Linux x86_64 constituye el producto actual. La aplicación narrativa HTML y sus informes históricos quedan fuera del despliegue y del ZIP. Las licencias originales conservan su idioma.

## Evidencia actual comprobada

| Comprobación | Resultado y límite |
| --- | --- |
| Core final | 41 Python + 73 GUT = **114 pruebas**, 2,022 aserciones y cero huérfanos; **95 fuentes y 23 salidas**, sin discrepancias de huella. |
| Agregado de integración | Ocho comprobaciones, 426 rutas auditadas, sin sustituir fuentes por versiones no probadas. Base inmutable: `build/evidence/godot-only-core-final-2.json`. |
| Auditoría independiente | **496 rutas** confrontadas con sus huellas registradas, incluidos recursos, capturas y medios; cero discrepancias. Se revisaron 79 enlaces locales de los documentos existentes contra la selección del paquete. |
| Linux real | **465.678 s**, sin errores de ejecución; recorrido físico, controles, prensa y FIN. |
| PDF Linux | **149.476 s**, dos guardados reales, bytes idénticos; Carta vertical y conservación de FIN al cancelar. |
| Canvas real | **833.943 s**, 136 capturas y 114 comprobaciones de movimiento; sin errores de aplicación, página, solicitudes ni referencias. Las advertencias WebGL documentadas se conservan. |
| Cinco decisiones | GUT y recorrido del PCK compilado cubren A/B/C, boleta sin marcar y no participar. No se presentan como cinco partidas físicas. |
| Documentos y video | Recibos de revisión aprobados: **20 páginas**, **135 s**, **20 cortes**, **26 subtítulos** y **42 fotogramas**; máximo de 21.75 caracteres/s. Video silencioso. |

El [agregado actual](../build/evidence/verification.json) tiene SHA-256 `8608fba4dfefae9107643f2c3e3c36767496319864c4ae72b6cd4ef952c50f81`; su [base final](../build/evidence/godot-only-core-final-2.json) tiene `a297f31d71697cfea2323803792c8fab824176e0073f4a0b809ab42f9b6a7ef4`. Las ocho comprobaciones reúnen ejecuciones separadas. Los recuentos antiguos de 94 fuentes y el agregado anterior no sustituyen este cierre.

Se cotejaron las huellas de los [documentos](../build/media-review-godot-2026-10-31/document-review.json), [materiales de aula](../build/media-review-godot-2026-10-31/classroom-review.json) y [video](../build/media-review-godot-2026-10-31/video-review.json) con sus artefactos. La inspección visual completa corresponde a esos recibos; esta revisión inspeccionó además el resultado de consulta y una muestra del video.

**Consulta observada: C.** La captura muestra A:8, B:5, C:4, 17 participantes y cero boletas sin marcar. La narración final es neutral respecto de las cinco acciones. La etiqueta descriptiva heredada «sin marcar» del arnés no se usa como prueba de la acción concreta; sus recibos originales no se alteraron.

## Correcciones y flujo de entrega

- El exportador limpia los residuos de la aplicación retirada y conserva Godot, avisos y nombres de recursos. El arranque en español y el icono en línea pasan la comprobación actual; los intentos fallidos permanecen identificados.
- El codificador acepta la URL real `/game/index.html`. El video procede de una captura WEBM del canvas, con cortes declarados y sin cambios de velocidad.
- El empaquetador exige `review.status == "passed"`; incorpora la fixture de datos y los cinco logs del core. La fixture es byteidéntica a `ccpc/verified_ccpc2024.json` del anexo original, SHA-256 `6cb28e8551e5fe5f03aac1edd02376799921f56a3d56cc09846a1a121898e6d9`. Cambiaron su cargador y comprobación de integridad; las aserciones numéricas se mantienen.
- Las guías, fuentes en español, glosario y rúbrica seleccionada resuelven los enlaces revisados. Los antecedentes excluidos se describen como referencias del repositorio.
- Los iniciadores conservan rutas con espacios, servidor limitado a `127.0.0.1` y `build/web`, MIME explícito y alternativa si 8765 está ocupado. El iniciador Linux mantiene el ejecutable junto a su `.pck`. El comprobador contempla extracción limpia, reproducción Python, iniciadores y arranque Godot; **su ejecución sobre el ZIP final aún debe producir su propio recibo**.

Los **69 archivos Godot** contrastados con el registro anterior conservan sus bytes. La aceptación actual procede del core y de los recorridos frescos: WASD, cruces físicos, un único objetivo cercano para indicación E/botón/entrada, ausencia de viajes remotos, orden Luz → Mateo → Inés → prensa → FIN, guardado y descargas voluntarias permanecen. No se persisten decisión, resultados reveladores, borrador, publicación, encargo ni bytes del PDF; se conserva el esquema de guardado Godot 2.

Los avisos MIT de Godot y sus dependencias, OFL y CC0 acompañan ambos exports: diez copias cotejadas con sus originales. Sunset Walk se atribuye a KiluaBoy. CCPC y la consulta ficticia permanecen separados; no se afirma una nueva reproducción de las 9,773,730 filas.

## Identidades principales

| Artefacto | SHA-256 |
| --- | --- |
| PCK web | `7c14ee2fdfb1fecce896953568c36423295aeb1173af2a0e270bac87a5c3a06d` |
| PCK Linux | `14b04c34ff196452c582613ea1fa331bc6412eb6ea98ea12d7dc4c927df88373` |
| PDF ciudadano de ejemplo y guardado Linux | `affd8a6f3177450221e1f341e956dc3ce7904b72529bd2cfb625e7abca254d38` |
| PDF personalizado descargado del navegador | `d49099ea7bafeb853cfbe26f6eb8b0cc4cf8e4ec3570a98ca108260c9a8bc0a5` |
| Video final | `3d2376f930ddb3c7947715eaaec095471c2660dbc68a2d15a114f8e3372ce798` |

El PDF nativo corresponde a Aguascalientes/Baja California; el del navegador, a Nuevo León/Baja California. Son selecciones distintas, no una discrepancia. El JSON fija las demás huellas revisadas.

## Acceso, despliegue y límites

Retirar la ruta semántica reduce las alternativas de acceso. Los ajustes de texto, teclado, silencio y movimiento reducido de Godot no acreditan lectores de pantalla. Orca, axe y zoom de la interfaz retirada son históricos; no se declara conformidad WCAG o PDF/UA.

El README distingue prueba local y alojamiento público, exige conservar los recursos y explica HTTP/HTTPS, WebAssembly, WebGL 2.0 y MIME. Estas condiciones se contrastan con las guías oficiales de Godot para [web](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html) y [Linux](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_linux.html). El arranque real acreditado es local. Nginx, certificados, alojamiento público, Windows/macOS y otros navegadores requieren comprobación en sus entornos.

La grabación bruta incluye QA y pausas; el video de 135 segundos es un montaje. No se infieren tiempos de estudiantes, aprendizaje, adopción ni eficacia electoral. No hay pilotaje o evaluación con personas usuarias acreditados. **Los 95/100 del 27 de octubre son históricos; esta revisión no asigna una calificación nueva.**

El informe y su JSON deben incorporarse antes de construir el candidato. El manifiesto identificará sus bytes; `build/evidence/clean-candidate.json`, externo al ZIP, identificará después el archivo exacto y su comprobación. No se declara realizado ese cierre futuro. No se hizo commit, firma, publicación ni envío.

