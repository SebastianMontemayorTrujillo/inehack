# Voces de la Plaza · exportación Godot para navegador

Esta carpeta contiene el juego listo para un servidor estático. Conservar `game/`, `licenses/` y todos sus archivos; no cambiar los nombres generados por Godot.

Para probarla localmente, abrir una terminal en esta carpeta y ejecutar:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Abrir http://127.0.0.1:8765/ y [entrar al juego](game/index.html). No usar `file://`. Requiere teclado, WebAssembly y WebGL 2.0. Caminar con WASD, interactuar de cerca con E/Enter, cerrar con Escape y abrir el diario con J. El recorrido es Luz → Mateo → Inés → prensa de Luz → FIN; desde FIN se descarga el cartel PDF.

Para publicar, subir todo el contenido de esta carpeta al directorio público, servir por HTTPS y comprobar `application/wasm` para `.wasm` y `application/octet-stream` para `.pck`. Un recurso inexistente debe devolver 404. El export utiliza un hilo y no necesita cabeceras de aislamiento multihilo. La [documentación oficial de Godot](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html) detalla los requisitos.

La guía completa del jurado, los iniciadores y los materiales de presentación están en el README de la raíz del ZIP. Se incluyen los [avisos de Godot](licenses/GODOT_LICENSE.txt), [terceros](licenses/THIRD_PARTY_NOTICES.txt), [fuentes OFL](licenses/OFL.txt) y [música CC0](licenses/CC0-1.0.txt). La música Sunset Walk es de KiluaBoy.
