#!/usr/bin/env python3
"""Generate deterministic PDF metrics/maps and embed the existing OFL TTFs.

No font is modified or subsetted. This deliberately reads only the TrueType
tables/formats in our pinned Atkinson files; unsupported fonts fail explicitly.
The runtime needs this JSON, not raw TTF access in an exported Godot PCK.
"""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "game/content/campaign_font.json"


def font_resource(path):
    data = path.read_bytes()
    if data[:4] != b"\x00\x01\x00\x00":
        raise ValueError("Expected TrueType outlines")

    def read(fmt, offset):
        return struct.unpack_from(">" + fmt, data, offset)

    tables = {}
    for index in range(read("H", 4)[0]):
        offset = 12 + index * 16
        name = data[offset:offset + 4].decode("ascii")
        start, size = read("II", offset + 8)
        if start + size > len(data):
            raise ValueError("Truncated TrueType table")
        tables[name] = start
    units = read("H", tables["head"] + 18)[0]
    scale = lambda value: round(value * 1000 / units)
    cmap = tables["cmap"]
    candidates = [read("HHI", cmap + 4 + index * 8) for index in range(read("H", cmap + 2)[0])]
    subtable = next(cmap + offset for platform, encoding, offset in candidates if (platform, encoding) == (3, 1))
    if read("H", subtable)[0] != 4:
        raise ValueError("Expected Unicode BMP format-4 cmap")
    segments = read("H", subtable + 6)[0] // 2
    mapping = {}
    for segment in range(segments):
        end = read("H", subtable + 14 + 2 * segment)[0]
        start = read("H", subtable + 16 + 2 * segments + 2 * segment)[0]
        delta = read("h", subtable + 16 + 4 * segments + 2 * segment)[0]
        location = subtable + 16 + 6 * segments + 2 * segment
        relative = read("H", location)[0]
        for codepoint in range(start, end + 1):
            character = chr(codepoint)
            if not character.isprintable() or codepoint == 0xFFFF:
                continue
            glyph = read("H", location + relative + 2 * (codepoint - start))[0] if relative else codepoint
            if glyph:
                glyph = (glyph + delta) & 0xFFFF
            if glyph:
                mapping[codepoint] = glyph
    name_table = tables["name"]
    name = None
    for index in range(read("H", name_table + 2)[0]):
        platform, _, _, name_id, length, offset = read("HHHHHH", name_table + 6 + index * 12)
        if name_id == 6 and platform == 3:
            start = name_table + read("H", name_table + 4)[0] + offset
            name = data[start:start + length].decode("utf-16-be")
            break
    if not name or not all(char.isascii() and (char.isalnum() or char == "-") for char in name):
        raise ValueError("Unsafe or missing PostScript font name")
    count = read("H", tables["hhea"] + 34)[0]
    characters, widths, glyphs, unicode_lines = {}, [0], [0], []
    for cid, (codepoint, glyph) in enumerate(sorted(mapping.items()), 1):
        width = scale(read("H", tables["hmtx"] + 4 * min(glyph, count - 1))[0])
        characters[chr(codepoint)] = [cid, width]
        widths.append(width)
        glyphs.append(glyph)
        unicode_lines.append(f"<{cid:04x}> <{codepoint:04x}>")
    cmap_lines = ["/CIDInit /ProcSet findresource begin", "12 dict begin", "begincmap",
                  "/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def",
                  "/CMapName /CampaignUnicode def", "/CMapType 2 def",
                  "1 begincodespacerange", "<0000> <ffff>", "endcodespacerange"]
    for index in range(0, len(unicode_lines), 100):
        group = unicode_lines[index:index + 100]
        cmap_lines.extend([f"{len(group)} beginbfchar", *group, "endbfchar"])
    cmap_lines.extend(["endcmap", "CMapName currentdict /CMap defineresource pop", "end", "end", ""])
    return {"name": name, "sha256": hashlib.sha256(data).hexdigest(),
            "ttf_base64": base64.b64encode(data).decode("ascii"),
            "bbox": [scale(value) for value in read("hhhh", tables["head"] + 36)],
            "ascent": scale(read("h", tables["hhea"] + 4)[0]),
            "descent": scale(read("h", tables["hhea"] + 6)[0]),
            "cap_height": scale(read("h", tables["OS/2"] + 88)[0]),
            "characters": characters, "widths": widths,
            "cid_map_base64": base64.b64encode(struct.pack(">" + "H" * len(glyphs), *glyphs)).decode("ascii"),
            "to_unicode": "\n".join(cmap_lines)}


def generate():
    fonts = [font_resource(ROOT / f"game/assets/fonts/AtkinsonHyperlegible-{style}.ttf")
             for style in ("Regular", "Bold")]
    resource = {"schema_version": 1, "license": "SIL Open Font License 1.1; assets/fonts/OFL.txt", "fonts": fonts}
    return json.dumps(resource, ensure_ascii=False, separators=(",", ":")) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail if the generated resource is stale")
    parser.add_argument("--stdout", action="store_true")
    args = parser.parse_args()
    output = generate()
    if args.stdout:
        print(output, end="")
    elif args.check:
        if not DESTINATION.exists() or DESTINATION.read_text(encoding="utf-8") != output:
            raise SystemExit("campaign_font.json is stale; run tools/build_campaign_font.py")
        print("campaign_font.json matches both original Atkinson fonts")
    else:
        DESTINATION.write_text(output, encoding="utf-8")


if __name__ == "__main__":
    main()
