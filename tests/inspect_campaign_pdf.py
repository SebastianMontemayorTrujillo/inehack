"""Strict, independent PDF inspection for the campaign writer tests (pypdf)."""
import io
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

from pypdf import PdfReader


def inspect_pdf(data):
    reader = PdfReader(io.BytesIO(data), strict=True)
    assert len(reader.pages) == 1
    page = reader.pages[0]
    assert list(page.mediabox) == [0, 0, 612, 792]
    assert not page["/Resources"].get("/XObject"), "The page must remain vector text/geometry"
    fonts = []
    for reference in page["/Resources"]["/Font"].values():
        font = reference.get_object()
        descendant = font["/DescendantFonts"][0].get_object()
        embedded = descendant["/FontDescriptor"]["/FontFile2"].get_data()
        assert len(embedded) > 10000
        assert b"beginbfchar" in font["/ToUnicode"].get_data()
        fonts.append(str(font["/BaseFont"]))
    # Check byte-addressed offsets independently of the parser's recovery logic.
    offset = int(re.search(rb"startxref\s+(\d+)\s+%%EOF", data)[1])
    assert data[offset:offset + 5] == b"xref\n"
    for number, offset in reader.xref[0].items():
        if number:
            assert data[offset:].startswith(f"{number} 0 obj\n".encode())
    links = [str(ref.get_object()["/A"]["/URI"]) for ref in page.get("/Annots", [])]
    operations = page.get_contents().operations
    rectangles = [list(map(float, args)) for args, operator in operations if operator == b"re"]
    colors = [list(map(float, args)) for args, operator in operations if operator == b"rg"]
    sizes = [float(args[1]) for args, operator in operations if operator == b"Tf"]
    # Poppler measures actual rendered words independently of our layout/font JSON.
    bbox = subprocess.run(["pdftotext", "-bbox", "-", "-"], input=data,
                          capture_output=True, check=True)
    assert not bbox.stderr, bbox.stderr.decode()
    words = [{"text": node.text, **{key: float(node.attrib[key]) for key in
              ("xMin", "yMin", "xMax", "yMax")}}
             for node in ET.fromstring(bbox.stdout).iter("{http://www.w3.org/1999/xhtml}word")]
    assert words, "No searchable words"
    for word in words:
        assert 36 <= word["xMin"] < word["xMax"] <= 576.01, word
        assert 36 <= word["yMin"] < word["yMax"] <= 765, word
        for x, y, width, height in rectangles:
            if height > 16:
                continue  # Masthead/discussion backgrounds intentionally contain words.
            overlap_x = min(word["xMax"], x + width) - max(word["xMin"], x)
            overlap_y = min(word["yMax"], 792 - y) - max(word["yMin"], 792 - y - height)
            assert overlap_x <= 0.1 or overlap_y <= 0.1, ("Text overlaps a bar/rule", word)
    for index, first in enumerate(words):
        for second in words[index + 1:]:
            overlap_x = min(first["xMax"], second["xMax"]) - max(first["xMin"], second["xMin"])
            overlap_y = min(first["yMax"], second["yMax"]) - max(first["yMin"], second["yMin"])
            assert overlap_x <= 0.1 or overlap_y <= 0.1, ("Overlapping words", first, second)
    return {"text": " ".join(page.extract_text().split()), "fonts": fonts,
            "links": links, "rectangles": rectangles, "colors": colors,
            "font_sizes": sizes, "word_count": len(words), "bytes": len(data)}


if __name__ == "__main__":
    print(json.dumps(inspect_pdf(sys.stdin.buffer.read()), ensure_ascii=False))
