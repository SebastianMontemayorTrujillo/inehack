#!/usr/bin/env python3
"""Abre el juego Godot mediante un servidor local; solo usa Python estándar."""
import argparse
import errno
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import webbrowser


ROOT = Path(__file__).resolve().parent


class ServidorDelJuego(SimpleHTTPRequestHandler):
    extensions_map = SimpleHTTPRequestHandler.extensions_map | {
        ".wasm": "application/wasm", ".pck": "application/octet-stream",
        ".js": "application/javascript",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def crear_servidor(directorio, puerto=0):
    return ThreadingHTTPServer(("127.0.0.1", puerto),
                               partial(ServidorDelJuego, directory=str(directorio)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--puerto", type=int,
                        help="puerto local; por defecto 8765, con alternativa automática si está ocupado; 0 elige uno libre")
    parser.add_argument("--sin-abrir", action="store_true", help="muestra el enlace sin abrir el navegador")
    args = parser.parse_args()
    if args.puerto is not None and not 0 <= args.puerto <= 65535:
        parser.error("el puerto debe estar entre 0 y 65535")
    directorio = ROOT / "build/web"
    if not (directorio / "game/index.pck").is_file() or not (directorio / "index.html").is_file():
        print("No se encontró el juego exportado. Extrae el ZIP completo y vuelve a ejecutar JUGAR.py.", file=sys.stderr)
        return 1
    try:
        servidor = crear_servidor(directorio, 8765 if args.puerto is None else args.puerto)
    except OSError as error:
        if args.puerto is None and error.errno == errno.EADDRINUSE:
            servidor = crear_servidor(directorio, 0)
            print("El puerto 8765 estaba ocupado; se eligió otro puerto local.", flush=True)
        else:
            print(f"No se pudo abrir el servidor local: {error}. Prueba con --puerto 0.", file=sys.stderr)
            return 1
    with servidor:
        url = f"http://127.0.0.1:{servidor.server_port}/"
        print(f"Voces de la Plaza: {url}", flush=True)
        print("Mantén esta ventana abierta mientras juegas. Pulsa Ctrl+C para cerrar el servidor.", flush=True)
        if not args.sin_abrir:
            try:
                webbrowser.open(url)
            except webbrowser.Error:
                print("Abre manualmente el enlace anterior en tu navegador.", flush=True)
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor cerrado.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
