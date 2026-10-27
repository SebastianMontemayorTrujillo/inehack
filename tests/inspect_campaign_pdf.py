"""Strict, independent PDF inspection for the campaign writer tests (pypdf)."""
import io
import json
import re
import sys

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
    rectangles = [list(map(float, args)) for args, operator in page.get_contents().operations if operator == b"re"]
    return {"text": " ".join(page.extract_text().split()), "fonts": fonts,
            "links": links, "rectangles": rectangles, "bytes": len(data)}


if __name__ == "__main__":
    print(json.dumps(inspect_pdf(sys.stdin.buffer.read()), ensure_ascii=False))
