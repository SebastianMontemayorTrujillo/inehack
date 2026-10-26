# Reutilización propuesta en educación cívica

Voces de la Plaza puede apoyar una sesión introductoria sobre información honesta, comparación justa, pluralidad y seguimiento de acuerdos. Público principal: bachillerato, aproximadamente 15–18 años; también personas adultas que comienzan su formación cívica. No se ha medido aprendizaje, duración con participantes ni adopción institucional. La relación con un programa concreto debe revisarse con quien lo coordina.

## Formatos y requisitos

| Formato | Preparación | Uso propuesto y límite comprobable |
| --- | --- | --- |
| HTML semántico | Servir `build/web/` por HTTP/HTTPS. Mantener sus archivos y `content/` juntos. | Recorrido completo sin cargar Godot; teclado, fuentes, seis actividades, consulta y cierre. Chromium fue comprobado; otros navegadores requieren revisión. No necesita cuentas, servidor de aplicación, API en vivo ni telemetría. |
| Aventura Godot web | El mismo sitio, subcarpeta `game/`; navegador con WebAssembly/WebGL. | Tres interiores originales y las mismas actividades. El archivo WASM ocupa aproximadamente 38 MiB sin comprimir: ofrecer la ruta HTML cuando esa descarga sea inconveniente. No se requiere un alojamiento con hilos compartidos. |
| Linux | Copiar juntos `voces-de-la-plaza.x86_64`, su `.pck` y `licenses/`; dar permiso de ejecución si la copia lo pierde. | Respaldo sin conexión, probado en Ubuntu 26.04.1 x86_64. Binario de unos 71 MiB. No se certifica compatibilidad con cualquier equipo Linux. |
| Papel/proyector | Imprimir `classroom-handout.pdf`, dos caras, y preparar la guía docente. | Datos, seis preguntas y reflexión independientes del dispositivo. Puede leerse en voz alta o ampliarse. Una impresión física en destino sigue siendo una comprobación local. |

La guía propone 20 minutos, incluyendo conversación; es tiempo de planeación. En parejas se alterna la lectura y el manejo. En proyector se anuncia una acción ficticia de demostración sin recoger preferencias del grupo. Cada participante puede pedir apoyo y terminar sin declarar una opción política.

El taller opcional del archivo permite elegir dos de las 32 entidades incluidas y decidir si se cuenta una historia de cantidades o proporciones. No requiere editar el código ni calcular divisiones. La pareja revisa el hallazgo, la fuente y lo que no se sabe; después elige una pregunta neutral para abrir la reunión. El cartel publicado se conserva solo en la sesión actual y no modifica los votos ficticios. Puede omitirse para mantener el recorrido breve.

## Instalación local y mantenimiento

Para una preparación con Python disponible, desde la carpeta del candidato:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory build/web
```

Abrir `http://127.0.0.1:8765/`. Este ejemplo sirve solo al mismo equipo. Una institución puede alojar la misma carpeta como archivos estáticos en su infraestructura; debe comprobar permisos de acceso, MIME de WebAssembly y las políticas de su navegador. Publicación y asignación de un dominio requieren autorización del equipo. La web no implementa caché sin conexión ni garantiza apertura con `file://`; para uso desconectado están Linux y papel.

Una persona mantenedora necesita conocimientos básicos de HTML/JavaScript y Godot/GDScript. El motor, plantillas y dependencias de comprobación están fijados en los archivos de herramientas. Los comandos, hashes y alcance observado están en [verificación](verification.md), sin convertir el número de pruebas en evidencia de aprendizaje.

## Adaptaciones sin perder la trazabilidad

| Cambio | Fuente que se edita | Comprobación antes de distribuir |
| --- | --- | --- |
| Simplificar diálogo o apoyo | `game/content/story.json`; conservar IDs, reglas y separación de ficción. | Validación de esquema, seis actividades en ambas rutas y revisión de lectura con la audiencia. |
| Cambiar entidades o año | Proceso de datos, metadatos y referencias, además del guion que los nombra. | Reproducir conteos, año/universo, bases, desconocidos y límites; actualizar también hoja, narrativa y medios. No reemplazar porcentajes a mano. |
| Cambiar ilustraciones o sonido | Roles de los catálogos y registro de activos. | Procedencia, licencias, resolución de todos los roles y export original sin sustituciones silenciosas. |
| Cambiar consulta ficticia | Proyectos, roster y escenarios canónicos. | Conteos deterministas, empates y cinco acciones equivalentes; no persistir elección ni resultados vinculados a ella. |

Los originales creados para el equipo no se declaran CC0 ni reciben una nueva licencia por este documento. Los avisos del motor y fuentes se incluyen; el registro de activos distingue originales y referencias. La autorización de adaptación/distribución de los originales y las cartas exigidas por la convocatoria deben resolverse con sus titulares. La entrega del código facilita la revisión técnica, pero no sustituye esas autorizaciones.

## Comprobación formativa propuesta

Antes de una incorporación regular, una persona docente puede revisar fuentes, lenguaje, acceso y encaje de la actividad; después, si hay participantes disponibles, observar tiempo, barreras y uso de apoyo. Tres explicaciones orientan la revisión: un hallazgo, un límite del dato y una pregunta de seguimiento. Registrar solo totales anónimos y versión del material, sin identidad ni preferencia política. Una sesión pequeña ayuda a corregir el producto; no acredita eficacia educativa ni efectos electorales.
