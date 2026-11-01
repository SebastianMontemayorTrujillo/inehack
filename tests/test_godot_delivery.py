"""La entrega web debe contener el juego Godot sin otra ruta jugable."""
from pathlib import Path
import tempfile
import unittest
from threading import Thread
from urllib.error import HTTPError
from urllib.request import urlopen
from unittest.mock import patch

from JUGAR import crear_servidor
from tools import export_game


class GodotDeliveryTests(unittest.TestCase):
    def test_launcher_serves_wasm_without_exposing_the_project(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            public = root / "carpeta con espacios"
            public.mkdir()
            (public / "index.html").write_text('<html lang="es">Jugar</html>')
            (public / "juego.wasm").write_bytes(b"\x00asm")
            (root / "privado.txt").write_text("no debe publicarse")
            with crear_servidor(public) as server:
                thread = Thread(target=server.serve_forever, daemon=True)
                thread.start()
                origin = f"http://127.0.0.1:{server.server_port}"
                try:
                    with urlopen(origin + "/juego.wasm") as response:
                        self.assertEqual(response.headers.get_content_type(), "application/wasm")
                        self.assertEqual(response.read(), b"\x00asm")
                    for path in ["/privado.txt", "/../privado.txt", "/app.mjs"]:
                        with self.assertRaises(HTTPError) as missing:
                            urlopen(origin + path)
                        self.assertEqual(missing.exception.code, 404)
                        missing.exception.close()
                finally:
                    server.shutdown()
                    thread.join()

    def test_reexport_removes_retired_html_without_removing_godot(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for name, text in {
                "tools/godot": "",
                "tools/godot_web_shell_es.html": '<html lang="es">$GODOT_CONFIG</html>',
                "tools/pagina_inicio_es.html": '<html lang="es"><a href="game/index.html">Jugar</a></html>',
                "tools/LEEME_WEB_es.md": '[Jugar](game/index.html)',
                "README.md": "Instrucciones en español",
                "build/staging-web/export_presets.cfg": 'html/custom_html_shell=""',
                "build/web/game/index.html": "exportación Godot",
                "build/web/game/index.pck": "paquete Godot",
                "build/web/app.mjs": "ruta retirada",
                "build/web/content/story.json": "ruta retirada",
                "web/index.html": "otra historia interactiva",
                "web/app.mjs": "ruta retirada",
                "submission/classroom.html": "guía",
                "submission/classroom-handout.html": "hoja",
                "submission/classroom-handout.pdf": "hoja",
            }.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(text)
            with patch.object(export_game, "stage_project", return_value=root / "build/staging-web"), \
                    patch.object(export_game, "run_godot"):
                export_game.export(root, "web", "original")
            self.assertFalse((root / "build/web/app.mjs").exists())
            self.assertFalse((root / "build/web/content").exists())
            self.assertEqual((root / "build/web/game/index.pck").read_text(), "paquete Godot")
            self.assertIn("game/index.html", (root / "build/web/index.html").read_text())
            self.assertIn("game/index.html", (root / "build/web/LEEME.md").read_text())


if __name__ == "__main__":
    unittest.main()
