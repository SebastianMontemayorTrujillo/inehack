"""Inspect the PDF actually downloaded by a runtime; never generate its bytes."""
import hashlib
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import subprocess
import sys
import xml.etree.ElementTree as ET

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]


def verify_pdf(path, selection):
    path = Path(path)
    payload = path.read_bytes()
    assert payload.startswith(b'%PDF-') and payload.rstrip().endswith(b'%%EOF'), 'Complete downloaded PDF required'
    reader = PdfReader(path, strict=True)
    assert len(reader.pages) == 1, 'The campaign is a one-page poster'
    page = reader.pages[0]
    assert list(page.mediabox) == [0, 0, 612, 792], page.mediabox
    bundle = json.loads((ROOT/'game/content/ccpc.json').read_text())
    story = json.loads((ROOT/'game/content/story.json').read_text())
    records = [next(record for record in bundle['records'] if record['id'] == selection[key]) for key in ('first', 'second')]
    assert selection['metric'] == 'rate', 'This exported journey chose the rate poster'

    def run(*args):
        result = subprocess.run(args, check=True, capture_output=True, timeout=30)
        assert not result.stderr, result.stderr.decode(errors='replace')
        return result.stdout

    text = run('pdftotext', '-layout', str(path), '-').decode()
    text_path = path.with_suffix('.txt')
    text_path.write_text(text)
    normalized = ' '.join(text.split())
    question = next(item['text'] for item in story['poster_workshop']['questions'] if item['id'] == selection['question'])
    required = ['Tu voto cuenta.', 'Infórmate y participa.', 'Campaña ciudadana por el voto informado.',
                'INE / CCPC', '2024', question, story['poster_workshop']['limit'],
                'SV + NV', 'NS indica clasificación desconocida', 'no se suma a NV']
    rates = []
    for record in records:
        required.append(record['geography_name'])
        for count in [record[key] for key in ('sv', 'nv', 'ns', 'ln')] + [record['sv'] + record['nv']]:
            required.append(f'{int(count):,}')
        rate = (Decimal(record['sv']) * 100 / Decimal(record['sv'] + record['nv'])).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
        required.append(f'{rate} %')
        rates.append(str(rate))
    for token in required:
        assert ' '.join(token.split()) in normalized, f'Downloaded PDF is missing {token!r}'
    winner = max(records, key=lambda record: Decimal(record['sv']) / Decimal(record['sv'] + record['nv']))
    assert f'Mayor proporción: {winner["geography_name"]}.' in normalized, 'The printed finding must match the selected records'
    assert '\ufffd' not in text, 'PDF text contains replacement glyphs'
    links = [str(annotation.get_object()['/A']['/URI']) for annotation in page.get('/Annots', [])]
    assert links == [bundle['source']['portal_url']], links

    bounds = ET.fromstring(run('pdftotext', '-bbox', str(path), '-'))
    words = [element for element in bounds.iter() if element.tag.endswith('}word')]
    assert len(words) > 100, 'PDF must contain extractable text'
    for word in words:
        assert 24 <= float(word.attrib['xMin']) < float(word.attrib['xMax']) <= 588, word.attrib
        assert 24 <= float(word.attrib['yMin']) < float(word.attrib['yMax']) <= 780, word.attrib
    png_path = path.with_suffix('.png')
    run('pdftoppm', '-singlefile', '-scale-to', '1584', '-png', str(path), str(path.with_suffix('')))
    picture = Image.open(png_path).convert('RGB')
    assert picture.size == (1224, 1584), picture.size
    assert len(picture.getcolors(picture.width * picture.height)) > 100, 'Rendered poster cannot be blank'
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(payload).hexdigest(),
            'bytes': len(payload), 'pages': 1, 'page_points': [612, 792], 'text': str(text_path.relative_to(ROOT)),
            'render': str(png_path.relative_to(ROOT)), 'render_sha256': hashlib.sha256(png_path.read_bytes()).hexdigest(),
            'selection': selection, 'rates_percent': rates, 'source_link': links[0], 'bounded_words': len(words),
            'checks': ['PDF structure', 'Spanish searchable text', 'exact selected CCPC counts and independently rounded rates',
                       'finding and neutral question', 'unknown-classification limits', 'official source link',
                       'text inside page bounds', 'Poppler rendering'], 'visual_review': 'pending'}


if __name__ == '__main__':
    print(json.dumps(verify_pdf(sys.argv[1], json.loads(sys.argv[2])), ensure_ascii=False))
