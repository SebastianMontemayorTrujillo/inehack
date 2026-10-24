#!/usr/bin/env python3
"""Author deterministic pixel-grid SVG illustrations and synthesized PCM sounds.

No reference pixels, samples, traced geometry, or external raster tools are used.
"""
import argparse
import json
import math
from pathlib import Path
import struct
import wave

ROOT = Path(__file__).resolve().parents[1]
INK = "#283c45"
PAPER = "#fff0cd"
GREEN = "#648a58"
TEAL = "#367c83"
CORAL = "#bf6452"
GOLD = "#dfb256"


def rect(x, y, w, h, color):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"/>'


def svg(width, height, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" shape-rendering="crispEdges">\n{body}\n</svg>\n'


def terrain(kind):
    colors = {"grass": ("#9dbb78", "#83a663"), "path": ("#e3c690", "#c9aa77"), "paving": ("#bdc4b1", "#9da995"), "water": ("#68b4be", "#4497a9")}
    base, detail = colors[kind]
    body = rect(0, 0, 16, 16, base)
    if kind == "paving":
        for y in (0, 8):
            body += rect(0, y, 16, 1, detail)
            for x in ((0, 8) if y == 0 else (4, 12)):
                body += rect(x, y, 1, 8, detail)
    elif kind == "water":
        for x, y in ((1, 3), (9, 7), (3, 12)):
            body += rect(x, y, 5, 1, "#b2dce0") + rect(x + 2, y + 1, 4, 1, detail)
    else:
        for x, y in ((2, 3), (11, 5), (6, 12)):
            body += rect(x, y, 2, 1, detail)
            if kind == "grass":
                body += rect(x + 1, y - 1, 1, 1, detail)
    return svg(16, 16, body)


def building(kind):
    """Warm civic street facades; silhouettes distinguish use without labels."""
    color = {"printshop": CORAL, "archive": TEAL, "hall": "#b89358"}[kind]
    body = rect(4, 58, 56, 4, "#779078")
    body += rect(6, 19, 52, 39, INK) + rect(8, 21, 48, 35, PAPER)
    body += rect(3, 15, 58, 6, INK) + rect(5, 13, 54, 6, color)
    body += rect(9, 9, 46, 4, color) + rect(14, 6, 36, 3, color)
    body += rect(25, 37, 14, 21, INK) + rect(27, 39, 10, 17, "#81654a") + rect(34, 47, 1, 2, GOLD)
    for x in (12, 42):
        body += rect(x, 28, 10, 14, INK) + rect(x + 2, 30, 6, 10, "#9cd2c5")
        body += rect(x + 4, 30, 2, 10, PAPER) + rect(x + 2, 34, 6, 2, PAPER)
    if kind == "printshop":
        body += rect(8, 23, 48, 4, color)
        for x in range(10, 55, 8):
            body += rect(x, 23, 4, 4, GOLD)
        body += rect(27, 13, 10, 6, INK) + rect(29, 12, 6, 3, PAPER) + rect(29, 17, 6, 3, PAPER)
    elif kind == "archive":
        body += rect(24, 12, 16, 8, INK) + rect(26, 13, 5, 5, PAPER) + rect(33, 13, 5, 5, PAPER)
        body += rect(17, 45, 5, 11, color) + rect(42, 45, 5, 11, color)
    else:
        for x in (9, 20, 42, 53):
            body += rect(x, 27, 3, 29, "#d0bc91")
        body += rect(30, 0, 2, 10, INK) + rect(32, 1, 9, 5, TEAL)
        body += rect(23, 57, 18, 2, "#d4c7a7") + rect(20, 59, 24, 2, "#d4c7a7")
    return svg(64, 64, body)


def prop(kind):
    size = {"tree": (32, 40), "bench": (32, 20), "printer": (32, 32), "noticeboard": (32, 32), "ballotbox": (16, 24)}[kind]
    if kind == "tree":
        body = rect(14, 21, 5, 18, "#806343") + rect(18, 27, 5, 3, "#806343")
        body += rect(6, 7, 22, 21, INK) + rect(3, 12, 27, 11, GREEN)
        body += rect(8, 4, 17, 23, GREEN) + rect(12, 1, 10, 8, GREEN)
        body += rect(8, 9, 10, 4, "#9abd6e") + rect(5, 15, 8, 3, "#9abd6e") + rect(22, 17, 6, 5, "#4d734a")
    elif kind == "bench":
        body = rect(4, 3, 24, 3, CORAL) + rect(4, 7, 24, 3, CORAL)
        body += rect(2, 11, 28, 4, "#a47650") + rect(5, 15, 3, 5, INK) + rect(24, 15, 3, 5, INK)
        body += rect(3, 2, 2, 10, INK) + rect(27, 2, 2, 10, INK)
    elif kind == "printer":
        body = rect(8, 1, 16, 11, INK) + rect(10, 2, 12, 10, PAPER)
        body += rect(3, 10, 26, 17, INK) + rect(5, 12, 22, 11, TEAL) + rect(23, 14, 2, 2, GOLD)
        body += rect(8, 20, 16, 10, INK) + rect(10, 22, 12, 9, PAPER)
        for y in (24, 27):
            body += rect(12, y, 8, 1, "#8f998d")
    elif kind == "noticeboard":
        body = rect(4, 5, 3, 27, "#806343") + rect(25, 5, 3, 27, "#806343")
        body += rect(1, 2, 30, 24, INK) + rect(3, 4, 26, 20, "#bd915c")
        for x, y, w, h in ((5, 6, 9, 12), (17, 9, 9, 12)):
            body += rect(x, y, w, h, PAPER) + rect(x + 2, y + 3, w - 4, 1, TEAL) + rect(x + 2, y + 6, w - 4, 1, TEAL)
        body += rect(8, 6, 2, 2, CORAL) + rect(20, 9, 2, 2, CORAL)
    else:
        body = rect(1, 7, 14, 16, INK) + rect(3, 10, 10, 11, GOLD)
        body += rect(0, 6, 16, 4, TEAL) + rect(4, 7, 8, 1, INK)
        body += rect(6, 0, 5, 7, PAPER) + rect(7, 3, 3, 1, TEAL)
        body += rect(6, 14, 4, 4, PAPER)
    return svg(*size, body), size


def icon(kind):
    body = rect(1, 1, 22, 22, INK) + rect(2, 2, 20, 20, PAPER)
    if kind == "shade":
        body += rect(11, 11, 2, 10, "#806343") + rect(5, 6, 14, 8, GREEN) + rect(8, 4, 8, 3, GREEN)
        body += rect(4, 17, 6, 2, CORAL) + rect(5, 19, 1, 2, INK)
    elif kind == "reading":
        body += rect(4, 7, 16, 12, TEAL) + rect(5, 6, 6, 11, "#e4d6a3") + rect(13, 6, 6, 11, "#e4d6a3")
        for y in (9, 12):
            body += rect(6, y, 4, 1, "#9c957a") + rect(14, y, 4, 1, "#9c957a")
    else:
        body += rect(5, 17, 14, 3, "#9e7550") + rect(11, 9, 2, 9, GREEN)
        body += rect(6, 10, 6, 4, GREEN) + rect(13, 7, 5, 4, GREEN)
        body += rect(10, 4, 4, 4, CORAL) + rect(11, 5, 2, 2, GOLD)
    return svg(24, 24, body)


def character(name):
    skin, hair, shirt, accent = {
        "player": ("#c98c66", "#3d3534", TEAL, GOLD),
        "luz": ("#e0ab7b", "#75533d", CORAL, PAPER),
        "mateo": ("#9e674d", "#333b40", "#9aab65", TEAL),
        "ines": ("#d5a58b", "#c4c1ad", "#7b7893", GOLD),
    }[name]
    body = ""
    for row, direction in enumerate(("down", "left", "right", "up")):
        for frame in range(3):
            # Idle, left stride, right stride, with one pixel head bob.
            bob = 1 if frame == 2 else 0
            left, right = ((0, 0), (-1, 1), (1, -1))[frame]
            person = rect(4, 21, 8, 2, "#789080")
            person += rect(5, 16, 3, 5 + left, INK) + rect(9, 16, 3, 5 + right, INK)
            person += rect(4, 9 + bob, 9, 9 - bob, shirt)
            person += rect(3, 11 + bob, 2, 5, skin) + rect(12, 11 + bob, 2, 5, skin)
            person += rect(5, 3 + bob, 7, 7, skin) + rect(4, 2 + bob, 9, 3, hair)
            if direction == "up":
                person += rect(5, 4 + bob, 7, 5, hair) + rect(6, 11 + bob, 5, 4, accent)
            elif direction in ("left", "right"):
                eye = 5 if direction == "left" else 10
                person += rect(eye, 6 + bob, 1, 1, INK)
                person += rect(4 if direction == "right" else 11, 4 + bob, 2, 5, hair)
                person += rect(5, 11 + bob, 2, 4, accent)
            else:
                person += rect(6, 6 + bob, 1, 1, INK) + rect(10, 6 + bob, 1, 1, INK)
                person += rect(7, 9 + bob, 3, 1, accent) + rect(5, 12 + bob, 2, 3, accent)
            if name == "luz":
                person += rect(12, 4 + bob, 2, 5, hair)
            if name == "ines" and direction != "up":
                person += rect(5, 5 + bob, 7, 1, INK)
            body += f'<g transform="translate({frame * 16} {row * 24})">{person}</g>\n'
    return svg(48, 96, body)


SOUNDS = {
    "focus": [(660, .075)],
    "select": [(523.25, .07), (783.99, .10)],
    "journal": [(392, .10), (523.25, .12), (659.25, .16)],
    "corrective": [(392, .14), (349.23, .18)],
    "chapter": [(392, .14), (523.25, .14), (659.25, .18), (783.99, .32)],
}


def sound(path, notes):
    rate = 22050
    samples = bytearray()
    for frequency, duration in notes:
        count = round(rate * duration)
        for i in range(count):
            t = i / rate
            # Gentle sine timbre; raised-cosine attack/release prevents clicks.
            envelope = math.sin(math.pi * i / max(1, count - 1)) ** 2
            value = .21 * envelope * (math.sin(2 * math.pi * frequency * t) + .16 * math.sin(4 * math.pi * frequency * t))
            samples.extend(struct.pack("<h", round(value * 32767)))
    with wave.open(str(path), "wb") as output:
        output.setparams((1, 2, rate, 0, "NONE", "not compressed"))
        output.writeframes(samples)


def generate(root=ROOT):
    directory = root / "game/assets/original"
    directory.mkdir(parents=True, exist_ok=True)
    entries = {}

    def illustration(role, data, size):
        filename = role.replace(".", "_") + ".svg"
        (directory / filename).write_text(data, encoding="utf-8")
        entries[role] = {"path": "res://assets/original/" + filename, "origin": "team-original", "size": list(size), "region": [0, 0, *size], "filter": "nearest"}

    for kind in ("grass", "path", "paving", "water"):
        illustration("terrain." + kind, terrain(kind), (16, 16))
    for kind in ("printshop", "archive", "hall"):
        illustration("building." + kind, building(kind), (64, 64))
    for kind in ("tree", "bench", "printer", "noticeboard", "ballotbox"):
        data, size = prop(kind)
        illustration("prop." + kind, data, size)
    for kind in ("shade", "reading", "garden"):
        illustration("icon." + kind, icon(kind), (24, 24))
    for name in ("player", "luz", "mateo", "ines"):
        role = "character." + name
        illustration(role, character(name), (16, 24))
        entries[role].update({"sheet_size": [48, 96], "frame_size": [16, 24], "fps": 6, "animations": {direction: [[column * 16, row * 24, 16, 24] for column in range(3)] for row, direction in enumerate(("down", "left", "right", "up"))}, "frame_order": ["idle", "walk_1", "walk_2"]})
    for name, notes in SOUNDS.items():
        filename = f"sound_{name}.wav"
        sound(directory / filename, notes)
        entries["sound." + name] = {"path": "res://assets/original/" + filename, "origin": "team-original", "channels": 1, "sample_rate": 22050, "duration_seconds": round(sum(duration for _, duration in notes), 3)}
    for weight in ("regular", "bold"):
        entries["font." + weight] = {"path": f"res://assets/fonts/AtkinsonHyperlegible-{weight.title()}.ttf", "origin": "dependency", "license": "OFL-1.1", "license_path": "res://assets/fonts/OFL.txt"}
    catalog_path = root / "game/assets/catalogs/original.json"
    catalog_path.parent.mkdir(parents=True, exist_ok=True)
    catalog_path.write_text(json.dumps({"schema_version": 1, "asset_set": "original", "assets": entries}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return entries


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    entries = generate()
    # First acquisition installs the font. Later regeneration refreshes checksums.
    if (ROOT / "game/assets/fonts/OFL.txt").is_file():
        if __package__:
            from .assets import record_original
        else:
            from assets import record_original
        record_original(ROOT)
    print(f"Authored {len(entries) - 2} original SVG/WAV roles; 2 OFL font roles.")


if __name__ == "__main__":
    main()
