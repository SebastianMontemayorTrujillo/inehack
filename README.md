# Voces de la Plaza · Equipo Latas · INEhack, Reto 3

Aventura educativa creada en Godot para clases introductorias de ética y formación cívica en México. La persona recorre Villa Brisa, conversa con Luz, Mateo e Inés y transforma datos de los Conteos Censales de Participación Ciudadana del INE (elección federal de 2024) en un cartel ciudadano. La consulta del pueblo es ficticia.

**Esta entrega contiene el juego de Godot para navegador y Linux x86_64.** Los materiales y la demostración corresponden a ese juego. La aventura está diseñada para 10–15 minutos; ese tiempo y sus resultados educativos todavía requieren observación con participantes.

## Para el jurado: jugar en un minuto

1. Extraer **todo** el ZIP; conservar las carpetas.
2. Elegir una opción:

| Equipo | Cómo iniciar |
| --- | --- |
| Windows con Python 3 | Doble clic en `JUGAR_WINDOWS.cmd`, o ejecutar `py -3 JUGAR.py` en la carpeta extraída. |
| Linux o macOS con Python 3 | Ejecutar `python3 JUGAR.py`. También se puede usar `bash JUGAR_WEB.sh`. |
| Linux x86_64, sin Python ni Internet | Ejecutar `bash JUGAR_LINUX.sh`. Mantener juntos el ejecutable y `build/linux/voces-de-la-plaza.pck`. |

El iniciador web abre el navegador y muestra el enlace en la terminal. Usa únicamente Python estándar: no instala paquetes ni requiere el editor Godot. Mantener la ventana abierta; **Ctrl+C** cierra el servidor. Si el navegador no se abre, copiar el enlace mostrado. Python 3 es una dependencia del iniciador local; un juego ya publicado se abre directamente por su URL.

Para las instrucciones Python de esta entrega, utilizar **Python 3.11 o posterior**. La alternativa nativa Linux no lo necesita.

El navegador necesita **WebAssembly y WebGL 2.0**, teclado y una computadora de escritorio. La documentación de Godot explica estos [requisitos de exportación web](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html). El entorno efectivamente comprobado y sus límites se detallan en la [verificación final](docs/verificacion_final_godot_es.md). Las instrucciones de Windows/macOS no equivalen a afirmar pruebas realizadas en esos sistemas.

Alternativa manual:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory build/web
```

Abrir **http://127.0.0.1:8765/**. El enlace lleva a `game/index.html`, la exportación de Godot. No abrir los archivos con `file://`.

## Controles y recorrido recomendado

| Acción | Control |
| --- | --- |
| Caminar y cruzar puertas | **W A S D** |
| Hablar o usar el objetivo cercano indicado | **E**, **Enter** o botón contextual |
| Mover el foco y activar controles | **Tab**, **Mayús+Tab**, **Enter** o **Espacio** |
| Cerrar un panel | **Escape** |
| Abrir el diario | **J** |

Ir con **Luz, a la izquierda → Mateo, al centro → Inés, a la derecha → prensa de Luz, a la izquierda → FIN**. Todas las casas se pueden visitar; los personajes indican la primera actividad pendiente. La prensa se utiliza para el cartel final.

Hay seis preguntas breves y apoyo opcional. En el archivo de Mateo se puede elegir una pareja entre las 32 entidades, cantidad o proporción y una pregunta para conversar. Inés recibe el diseño de esa sesión o el ejemplo guiado. Al regresar a la prensa, **Imprimir cartel** completa la aventura. La revelación se puede omitir con E/Enter; movimiento reducido abre FIN directamente.

En FIN se puede **descargar el PDF Carta**, **ampliar el cartel** o **seguir explorando**. La impresión dentro del juego marca el final; la descarga es voluntaria y no requiere una impresora física. Ajustes ofrece texto grande, movimiento reducido, volumen, silencio y reinicio. Para evaluar desde el principio, reiniciar la partida desde Ajustes.

El progreso y los ajustes son locales. No se guarda la decisión de la consulta, el diseño elegido, el encargo ni los bytes del PDF. El progreso del navegador pertenece a la misma dirección y puerto: para retomarlo, conservarlos. El iniciador usa 8765; si está ocupado, muestra otro puerto. Se puede fijar uno con `python3 JUGAR.py --puerto 8766`.

## Materiales de evaluación y presentación

- [Plan de presentación, tiempos, diapositivas y preguntas del jurado](docs/presentacion_final_es.md).
- [Guion y storyboard del video de Godot](docs/guion_video_godot_es.md).
- [Revisión humana recomendada antes del envío](docs/revision_humana_final_es.md).
- [Narrativa y propuesta de difusión](submission/voces_narrativa_y_difusion.pdf).
- [Presentación de diez diapositivas](submission/voces_presentacion.pdf).
- [Video de demostración de Godot](submission/voces_demo_godot.mp4), [subtítulos](submission/demo_godot.srt) y [transcripción](submission/demo_godot_transcripcion.txt).
- [Guía para facilitar la clase](docs/facilitator.md), [guía en PDF](submission/classroom.pdf) y [hoja imprimible](submission/classroom-handout.pdf).
- [Ejemplo real del cartel ciudadano](submission/cartel_ciudadano_ejemplo.pdf).
- [Verificación final](docs/verificacion_final_godot_es.md), [revisión independiente](docs/revision_final_godot_es.md) y [manifiesto de archivos](submission/release_manifest.json).

La demostración es una captura automatizada y editada del juego real, con los cortes identificados. No representa una sesión con estudiantes. Este video es **sin audio**, con subtítulos en español, y queda preparado para una locución humana posterior. El juego conserva su música libre y sus controles de volumen.

## Despliegue para los organizadores

1. Copiar **todo el contenido de `build/web/`**, incluidas las carpetas `game/` y `licenses/`, al directorio público de un alojamiento estático.
2. Conservar los nombres y la ubicación relativa de `game/index.html`, `index.js`, `index.wasm`, `index.pck`, imágenes y módulos de audio. Godot requiere que los archivos mantengan los nombres del export.
3. Servir por **HTTPS** en Internet. Para una prueba local se admite HTTP en `localhost`/`127.0.0.1`. Servir `.wasm` como `application/wasm`, JavaScript con su MIME correspondiente y `.pck` como `application/octet-stream`.
4. Esta exportación usa Compatibility y un solo hilo. No necesita las cabeceras de aislamiento de la exportación multihilo. No hay PWA ni caché sin conexión; la alternativa desconectada es Linux.
5. Después de subir, abrir la URL publicada en una sesión nueva y comprobar: carga del pueblo, WASD/puertas, conversaciones, preguntas, música tras una interacción y descarga del PDF. Revisar consola y red: los recursos deben responder 200; un archivo inexistente debe responder 404.
6. Tras actualizar, recargar sin caché y comprobar que `.pck` y `.wasm` pertenecen a la misma entrega. Evitar una regla de aplicación de página única que devuelva `index.html` al pedir un recurso inexistente.

Estas condiciones se basan en la [guía oficial de publicación web de Godot](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html). La entrega incluye [un ejemplo de configuración Nginx](deploy/nginx_godot.conf) para un servidor estático detrás de HTTPS. Adaptar el dominio, la ruta y la terminación TLS a la infraestructura del organizador y ejecutar `nginx -t` antes de recargar su servicio. El archivo de ejemplo no configura certificados.

Las directivas de la plantilla están documentadas por Nginx: [resolución de archivos y respuesta 404](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files) y [tipos MIME](https://nginx.org/en/docs/http/ngx_http_core_module.html#types). La configuración del servidor de destino requiere su propia validación; la comprobación local de esta entrega utiliza el iniciador Python.

No hace falta publicar el repositorio completo, los formularios ni las herramientas: basta `build/web/`. No se ha realizado una publicación pública desde este proyecto.

## Si algo no abre

- **Faltan archivos:** volver a extraer el ZIP completo; no separar el ejecutable Linux de su PCK.
- **Página negra o aviso de funciones ausentes:** usar la URL HTTP/HTTPS, comprobar WebGL 2.0 y WebAssembly; revisar la consola. Probar el ejecutable Linux incluido.
- **Puerto ocupado:** usar el enlace alternativo que muestra el iniciador o `--puerto 0`.
- **Sin música:** interactuar primero con el juego y revisar silencio/volumen del navegador y del juego.
- **Descarga bloqueada:** pulsar de nuevo Descargar cartel PDF y permitir la descarga solicitada. Cancelar el guardado conserva FIN.
- **Partida ya terminada:** usar Reiniciar en Ajustes para un recorrido nuevo.

## Datos, créditos y alcance de la revisión

Se conservan los datos CCPC de la elección federal de 2024, la fuente oficial, las bases y las limitaciones. Se suman conteos antes de dividir. La participación clasificada se calcula como SV/(SV+NV); NS representa clasificación desconocida y se presenta aparte, no como abstención. La consulta de Villa Brisa usa cifras ficticias identificadas.

El arte y los efectos son originales. La música **Sunset Walk, de KiluaBoy**, es CC0 y se acredita por separado. Las fuentes Atkinson Hyperlegible tienen licencia OFL; Godot se distribuye con sus avisos MIT y de terceros. Los avisos originales se conservan en `game/`, `build/web/licenses/` y `build/linux/licenses/`.

La retirada de la antigua ruta narrativa semántica limita las alternativas de acceso. Texto grande, teclado y movimiento reducido no acreditan compatibilidad con lectores de pantalla. Las observaciones históricas sobre aquella ruta y la valoración interna de 95/100 del 27 de octubre no certifican esta entrega. No hay pilotaje con participantes, aprendizaje medido, certificación de accesibilidad ni conformidad PDF/UA del cartel.

Las cartas oficiales están en `submission/forms/`; requieren la revisión y firmas reales del equipo. El ZIP final es `submission/Latas_Reto_3.zip`. Su comprobación exacta se registra fuera del propio archivo para evitar un hash recursivo. Firma, alojamiento y envío son acciones pendientes del equipo.

## Para revisar el código

Las siguientes órdenes se dirigen al repositorio de trabajo con sus dependencias de desarrollo. Las capturas brutas y los históricos usados para producir los medios se conservan allí y se excluyen del ZIP del jurado; la reconstrucción audiovisual y del paquete requiere esos originales.

Abrir `game/project.godot` en Godot **4.7.2** con sus plantillas verificadas, o usar el entorno del repositorio:

```sh
python3 tools/bootstrap.py
python3 tools/assets.py fetch
./tools/godot --editor --path game
python3 tools/verify.py --browser
python3 tools/export_game.py --target web --asset-set original
python3 tools/export_game.py --target linux --asset-set original
python3 tools/package_candidate.py
python3 tools/check_candidate.py
```

Las pruebas de desarrollo requieren las dependencias de `tools/browser-package.json` y `tools/pdf-requirements.txt`, además de Pillow, Poppler y, para la revisión gráfica Linux, Xvfb/xdotool. No son necesarias para jugar los exports. Los originales de investigación y la implementación retirada se conservan en el repositorio; la entrega al jurado contiene únicamente Godot y los materiales actuales.
