// Local, reproducible print deliverables. Browser layout preserves selectable text.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chromium } from '../.tools/browser/node_modules/playwright/index.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'submission');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const deckOnly = process.argv.includes('--deck-only');
await mkdir(output, { recursive: true });
const handoutOnly = process.argv.includes('--handout-only');
if (process.argv.slice(2).some(arg => !['--deck-only', '--handout-only'].includes(arg))) throw new Error('Supported options: --deck-only or --handout-only');
if (deckOnly && handoutOnly) throw new Error('Use either --deck-only or --handout-only');
const browserExecutable = process.env.BROWSER_EXECUTABLE || '/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const escape = value => String(value).replace(/\p{Dash_Punctuation}/gu, '-').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
function inline(text, links = {}) {
  return escape(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const target = /^https:\/\//.test(url) ? url : links[url];
      return target ? '<a href="' + escape(target) + '">' + label + '</a>' : label;
    }).replace(/\x60([^\x60]+)\x60/g, '<code>$1</code>');
}
function markdown(text, { headingOffset = -1, links = {}, tableRegions = false } = {}) {
  const lines = text.split('\n'), html = [];
  let paragraph = [], heading = 'Datos', comment = false;
  const format = text => inline(text, links);
  const flush = () => { if (paragraph.length) html.push('<p>' + format(paragraph.join(' ')) + '</p>'); paragraph = []; };
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n].trim();
    if (comment || line.startsWith('<!--')) { comment = !line.includes('-->'); continue; }
    if (line.startsWith('<div')) continue;
    if (!line) { flush(); continue; }
    const title = line.match(/^(#{1,3}) (.+)$/);
    if (title) {
      flush(); heading = title[2];
      const level = Math.max(1, title[1].length + headingOffset);
      html.push('<h' + level + '>' + format(heading) + '</h' + level + '>'); continue;
    }
    if (/^_{3,}$/.test(line)) { flush(); html.push('<hr class="answer-line" aria-hidden="true">'); continue; }
    if (/^\d+\. /.test(line)) {
      flush(); const items = [];
      while (n < lines.length && /^\d+\. /.test(lines[n].trim())) items.push('<li>' + format(lines[n++].trim().replace(/^\d+\. /, '')) + '</li>');
      n--; html.push('<ol>' + items.join('') + '</ol>'); continue;
    }
    if (line.startsWith('|')) {
      flush(); const rows = [];
      while (n < lines.length && lines[n].trim().startsWith('|')) {
        const cells = lines[n++].trim().split('|').slice(1, -1).map(x => x.trim());
        if (!cells.every(x => /^:?-+:?$/.test(x))) rows.push(cells);
      }
      n--;
      const header = '<thead><tr>' + rows[0].map(c => '<th scope="col">' + format(c) + '</th>').join('') + '</tr></thead>';
      const body = '<tbody>' + rows.slice(1).map(cells => '<tr>' + cells.map(c => '<td>' + format(c) + '</td>').join('') + '</tr>').join('') + '</tbody>';
      const table = '<table aria-label="' + escape(heading) + '">' + header + body + '</table>';
      html.push(tableRegions ? '<div class="table-wrap" tabindex="0" role="region" aria-label="' + escape(heading) + '">' + table + '</div>' : table);
      continue;
    }
    paragraph.push(line);
  }
  flush(); return html.join('\n');
}
const classroomStyle = [
'@page{size:Letter;margin:14mm}*{box-sizing:border-box}',
':root{--ink:#173b39;--paper:#fff;--canvas:#f6f0da;--line:#b7c6bb;--accent:#225c55}',
'body{margin:0;color:var(--ink);background:var(--canvas);font:18px/1.6 Arial,sans-serif}',
'a{color:var(--accent);text-underline-offset:.18em;overflow-wrap:anywhere}',
'a:focus-visible,button:focus-visible,.table-wrap:focus-visible{outline:3px solid #9b4d2d;outline-offset:4px}',
'.skip{position:absolute;left:16px;top:-100px;padding:8px;background:#fff;z-index:2}.skip:focus{top:8px}',
'.toolbar{max-width:1100px;margin:auto;padding:20px 24px;display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center}',
'.toolbar a,button{font:inherit}button{padding:8px 16px;border:2px solid var(--accent);background:#fff;color:var(--ink);cursor:pointer}',
'main{max-width:1100px;margin:0 auto 40px;padding:32px 40px;background:var(--paper)}',
'h1{font:700 2rem/1.2 Georgia,serif;margin:0 0 24px}h2{font:700 1.45rem/1.25 Georgia,serif;margin:32px 0 12px}',
'p{margin:0 0 16px}li{margin-bottom:12px}code{font:inherit;overflow-wrap:anywhere}',
'.table-wrap{overflow-x:auto;margin:16px 0}table{border-collapse:collapse;width:100%;font-size:1rem}',
'td,th{border:1px solid var(--line);padding:10px;text-align:left;vertical-align:top}th{background:#e7eddf}',
'.answer-line{border:0;border-bottom:1px solid #777;height:24px;margin:0 0 12px}',
'.paper+.paper{border-top:2px solid var(--line);margin-top:32px;padding-top:32px}',
'@media(max-width:600px){body{font-size:16px}.toolbar{padding:16px;gap:12px}main{padding:24px 16px}h1{font-size:1.75rem}td,th{padding:6px}}',
'@media print{body{background:#fff;color:#111;font:11pt/1.17 Arial,sans-serif}.no-print,.skip{display:none!important}',
'main{margin:0;padding:0;max-width:none}a{color:inherit}.table-wrap{overflow:visible;margin:0}',
'table{font-size:11pt;margin:5pt 0}td,th{padding:3pt;border-color:#777}th{background:#eee}',
'p{margin:0 0 5pt}h1{font:700 16pt/1.1 Arial,sans-serif;margin:0 0 6pt}h2{font:700 13pt/1.1 Arial,sans-serif;margin:9pt 0 5pt}',
'.paper{width:calc(8.5in - 28mm);height:calc(11in - 28mm);break-after:page;position:relative}',
'.paper:last-child{break-after:auto}.paper+.paper{border:0;margin:0;padding:0}',
'.paper .page-content{display:flow-root}.paper .page-content>:first-child{margin-top:0}',
'.answer-line{height:12pt;margin:0 0 5pt}li{margin-bottom:5pt}tr{break-inside:avoid}h1,h2{break-after:avoid}}'
].join('\n');
function classroomPage(title, content, handout = false) {
  const navigation = handout
    ? '<a href="./classroom.html">Guía docente</a><a href="./classroom-handout.pdf" download>Descargar hoja en PDF</a><button type="button" id="print-document">Imprimir esta hoja</button>'
    : '<a href="./classroom-handout.html">Abrir e imprimir la hoja</a><a href="./classroom-handout.pdf" download>Descargar hoja en PDF</a><button type="button" id="print-document">Imprimir la guía</button>';
  return '<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escape(title) + '</title><style>' + classroomStyle + '</style></head><body><a class="skip" href="#contenido">Saltar al contenido</a><nav class="toolbar no-print" aria-label="Materiales de aula"><a href="./index.html">Volver a la aventura</a>' + navigation + '</nav><main id="contenido" tabindex="-1">' + content + '</main><script>document.getElementById("print-document").addEventListener("click",()=>window.print());</script></body></html>';
}
function verifyPdfPageCount(filename, expected) {
  const info = execFileSync('pdfinfo', [path.join(output, filename)], { encoding: 'utf8' });
  const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
  if (pages !== expected) throw new Error(filename + ': expected ' + expected + ' PDF pages, found ' + pages);
}
async function buildClassroomResources() {
  const handout = await readFile(path.join(root, 'docs/classroom_handout.md'), 'utf8');
  const pages = handout.split('<div style="page-break-after: always;"></div>');
  if (pages.length !== 2) throw new Error('Expected two handout pages');
  const handoutHtml = classroomPage('Voces de la Plaza · Hoja de trabajo', pages.map(text => '<section class="paper"><div class="page-content">' + markdown(text, { headingOffset: 0, tableRegions: true }) + '</div></section>').join(''), true);
  const facilitator = await readFile(path.join(root, 'docs/facilitator.md'), 'utf8');
  const guideHtml = classroomPage('Voces de la Plaza · Guía docente', markdown(facilitator, { headingOffset: 0, tableRegions: true, links: { 'classroom_handout.md': './classroom-handout.html' } }));
  await writeFile(path.join(output, 'classroom-handout.html'), handoutHtml);
  await writeFile(path.join(output, 'classroom.html'), guideHtml);
  const browser = await chromium.launch({ executablePath: browserExecutable, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 710, height: 1056 } });
    await page.emulateMedia({ media: 'print' });
    await page.goto(pathToFileURL(path.join(output, 'classroom-handout.html')).href);
    await page.evaluate(() => document.fonts.ready);
    const issues = await page.locator('.paper').evaluateAll(pages => pages.flatMap((page, index) => {
      const content = page.querySelector('.page-content').getBoundingClientRect();
      const frame = page.getBoundingClientRect();
      return content.bottom > frame.bottom + 1 || page.scrollWidth > page.clientWidth + 1
        ? ['Handout page ' + (index + 1) + ' overflows'] : [];
    }));
    if (issues.length) throw new Error(issues.join('; '));
    await page.pdf({ path: path.join(output, 'classroom-handout.pdf'), preferCSSPageSize: true, printBackground: true, tagged: true });
    verifyPdfPageCount('classroom-handout.pdf', 2);
  } finally { await browser.close(); }
  console.log('Generated submission/classroom.html, classroom-handout.html and classroom-handout.pdf');
}
// Classroom resources are generated explicitly, then stay stable while exports use them.
if (handoutOnly) {
  await buildClassroomResources();
  process.exit(0);
}
// Final media may only use the current, completed campaign runtime. In particular,
// an older successful receipt must not authenticate freshly overwritten captures.
const renderInputs = [];
async function input(filename) {
  const bytes = await readFile(path.join(root, filename));
  renderInputs.push({ path: filename, sha256: sha(bytes), bytes: bytes.length });
  return bytes;
}
const native = JSON.parse(await input('build/evidence/native-window.json'));
assert.equal(native.status, 'passed', 'Wait for the campaign native journey to pass');
assert.deepEqual(native.runtime_errors, [], 'Native runtime errors must remain fatal');
assert.ok(native.finale_checks?.length && native.checkpoints?.length, 'The native receipt predates the campaign finale');
assert.equal(sha(await input('build/linux/voces-de-la-plaza.pck')), native.pack_sha256, 'Native captures belong to a different PCK');
for (const [filename, expected] of Object.entries(native.source_sha256)) {
  assert.equal(sha(await input(filename)), expected, 'Native source changed after the journey: ' + filename);
}
for (const filename of ['docs/deck_outline_es.md', 'docs/storyline_and_dissemination_es.md', 'tools/render_submission.mjs']) await input(filename);
const narrative = await readFile(path.join(root, 'docs/storyline_and_dissemination_es.md'), 'utf8');
const body = narrative.split('<!-- INICIO DEL CONTENIDO PARA PDF: PÁGINA 1 -->')[1].split('<!-- FIN DEL CONTENIDO PARA PDF -->')[0];
const blocks = body.split(/<div style="page-break-after: always;"><\/div>/);
if (blocks.length !== 4) throw new Error('Expected four narrative sections');
const narrativeHtml = `<!doctype html><html lang="es-MX"><meta charset="utf-8"><title>Voces de la Plaza · Narrativa y difusión</title><style>
@page{size:Letter;margin:14mm}*{box-sizing:border-box}body{color:#173b39;font:11pt/1.25 Arial,sans-serif;margin:0}h1{font:700 19pt/1.16 Georgia,serif;margin:0 0 11pt}p{margin:0 0 6pt}code{font:inherit}a{color:#225c55;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:11pt;margin:8pt 0}td,th{border:1px solid #b7c6bb;padding:4pt;text-align:left;vertical-align:top}th{background:#e7eddf}section{height:calc(11in - 28mm);position:relative;break-after:page;padding-bottom:30pt}section:last-child{break-after:auto}.running{font-size:9pt;letter-spacing:.1em;color:#697b6a;margin-bottom:10pt}footer{position:absolute;bottom:0;left:0;right:0;font-size:9pt;border-top:1px solid #bcc6b8;padding-top:6pt}</style>${blocks.map((block, i) => `<section><div class="page-content"><div class="running">VOCES DE LA PLAZA · INEHACK 2026 · RETO 3</div>${markdown(block)}</div><footer>${i + 1} / 4 · Equipo Latas · Narrativa y propuesta de difusión</footer></section>`).join('')}</html>`;

const outline = await readFile(path.join(root, 'docs/deck_outline_es.md'), 'utf8');
const slides = outline.split(/^## Diapositiva /m).slice(1).map((section, index) => {
  const heading = section.match(/^(\d+) · ([^\n]+)/);
  const screen = section.match(/\*\*Texto en pantalla:\*\* ([^\n]+)/);
  if (!heading || Number(heading[1]) !== index + 1 || !screen) throw new Error('Invalid deck outline section ' + (index + 1));
  const lines = [...screen[1].matchAll(/«([^»]+)»/g)].map(match => match[1]);
  if (lines.length < 3) throw new Error('Missing visible copy on slide ' + (index + 1));
  return { title: heading[2], lines };
});
if (slides.length !== 10) throw new Error('Expected ten slides in the outline');
const ccpc = JSON.parse(await readFile(path.join(root, 'game/content/ccpc.json'), 'utf8'));
const national = ccpc.records.find(record => record.id === 'national');
const number = value => new Intl.NumberFormat('es-MX').format(value);
const portal = 'https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/';
const sourceNote = 'Fuente: <a href="' + portal + '">INE · CCPC federal 2024</a>. Tasas redondeadas; bases indicadas.';
const captures = {
  0: ['native-plaza.png', 'Villa Brisa · Captura real del recorrido Linux'],
  3: ['native-house-1-complete.png', 'Imprenta de Luz · Boletín terminado'],
  4: ['native-poster-archive-before.png', 'Archivo de Mateo · Cartel corregido'],
  5: ['native-consultation-intro.png', 'Inés · Conversación antes de la consulta ficticia'],
  8: ['native-poster-preview.png', 'Archivo de Mateo · Vista previa del cartel opcional'],
  9: ['native-ending.png', 'Prensa de Luz · FIN después de imprimir el cartel'],
};
const figure = (data, caption) => '<figure><img src="data:image/png;base64,' + data.toString('base64') + '" alt="' + escape(caption) + '"><figcaption>' + escape(caption) + '</figcaption></figure>';
const images = Object.fromEntries(await Promise.all(Object.entries(captures).map(async ([index, [filename, caption]]) => {
  const capturePath = 'build/evidence/' + filename;
  const bytes = await input(capturePath);
  const checkpoint = native.checkpoints.find(item => item.path === capturePath);
  assert.equal(sha(bytes), checkpoint?.sha256, 'Capture is not authenticated by the current native run: ' + filename);
  return [index, figure(bytes, caption)];
})));
const footnotes = [
  'Una actividad de educación cívica en español de México · Datos públicos, historia original.',
  'Dos misiones CCPC, consulta ficticia y vuelta a Luz para imprimir. Meta: 10-15 minutos, sin pilotaje.',
  sourceNote + ' SV/(SV+NV) y NS/LN tienen bases distintas.',
  sourceNote + ' Las tarjetas 60/30/10 son un ejemplo inventado.',
  sourceNote + ' Los agregados no explican motivos individuales.',
  'Ficción didáctica. No reproduce todos los procedimientos de una elección constitucional.',
  'La ruta HTML ofrece el mismo contenido sin ejecutar el lienzo Godot.',
  'Tiempo de planeación, sin pilotaje. Prever tiempo adicional si se ofrece el taller opcional.',
  sourceNote + ' Personalizar es opcional; Inés también ofrece el cartel guiado.',
  'Campaña ciudadana sin marcas de equipo ni sello oficial. Fuente histórica INE/CCPC; descarga opcional.',
];
const kickers = ['INEhack 2026 · Reto 3', 'La historia', 'Dato nacional · 2024', 'Primera misión · Imprenta', 'Segunda misión · Archivo', 'Tercer paso · Consulta', 'Acceso y materiales', 'Uso en el aula', 'Taller opcional · Archivo', 'Cuarto paso · Imprimir'];
function slideBody(slide, index) {
  if (index === 1) return '<p class="lead">' + escape(slide.lines[0]) + '</p><div class="journey">' + slide.lines.slice(1).map((line, n) => '<div><p class="step">' + (n + 1) + '</p><h2>' + escape(line.split(':')[0]) + '</h2><p>' + escape(line.split(':').slice(1).join(':').trim()) + '</p></div>').join('') + '</div>';
  if (index === 2) {
    const bases = [national.classified_count, national.ln];
    return '<p>' + escape(slide.lines[0]) + '</p><div class="statistics">' + slide.lines.slice(1, 3).map((line, n) => {
      const value = line.match(/\d+(?:\.\d+)?%/);
      if (!value) throw new Error('Missing national percentage in outline');
      return '<div><p class="stat">' + escape(value[0]) + '</p><p>' + escape(line.replace(' (' + value[0] + ')', '')) + '</p><p class="base">Base: ' + number(bases[n]) + ' registros</p></div>';
    }).join('') + '</div><p class="lead">' + escape(slide.lines[3]) + '. La información desconocida se conserva aparte.</p>';
  }
  if (index === 7) return '<div class="timing">' + slide.lines.slice(0, 3).map(line => '<div><p class="stat">' + escape(line.split(':')[0]) + '</p><p>' + escape(line.split(':').slice(1).join(':').trim()) + '</p></div>').join('') + '</div>' + slide.lines.slice(3).map(line => '<p class="lead">' + escape(line) + '</p>').join('');
  return slide.lines.filter(line => line !== 'INEhack · Reto 3').map((line, n) => '<p class="' + (n === 0 && index !== 5 ? 'lead' : '') + '">' + escape(line) + '</p>').join('');
}
const deckStyle = [
'@page{size:13.333333in 7.5in;margin:0}*{box-sizing:border-box}',
'body{margin:0;color:#173b39;background:#f6f0da;font:26px/1.32 Arial,sans-serif}',
'.slide{width:1280px;height:720px;padding:44px 60px 80px;break-after:page;position:relative}.slide:last-child{break-after:auto}',
'.kicker{text-transform:uppercase;letter-spacing:.12em;color:#8b4328;font-size:17px;margin:0 0 16px}',
'h1{font:44px/1.12 Georgia,serif;margin:0 0 26px}h2{font:31px/1.15 Georgia,serif;margin:0 0 12px}',
'p{margin:0 0 18px}.lead{font-size:29px}.layout{display:flex;gap:28px;align-items:flex-start}.copy{flex:1;min-width:0}',
'.with-image .copy{flex:0 0 420px}.with-image figure{flex:1;min-width:0;margin:0}img{width:100%;height:auto;max-height:418px;object-fit:contain;object-position:top;display:block}',
'figcaption{font-size:16px;margin-top:8px;color:#425f56}.with-image .copy p{font-size:24px}.with-image .copy .lead{font-size:28px}',
'footer{position:absolute;bottom:25px;left:60px;right:60px;border-top:1px solid #a8b9aa;padding-top:10px;font-size:15px;line-height:1.3;display:flex;gap:24px}',
'footer .note{flex:1}footer .folio{white-space:nowrap}a{color:inherit}',
'.journey,.statistics,.timing{display:grid;gap:36px;margin:28px 0 32px}.journey,.timing{grid-template-columns:repeat(3,1fr)}.statistics{grid-template-columns:repeat(2,1fr)}',
'.journey>div,.statistics>div,.timing>div{border-top:3px solid #a8b9aa;padding-top:20px}.step{font:64px/1 Georgia,serif;color:#8b4328;margin-bottom:20px}',
'.stat{font:72px/1 Georgia,serif;margin:0 0 20px}.base{font-size:21px;color:#425f56}.timing .stat{font-size:62px}'
].join('\n');
const browser = await chromium.launch({ executablePath: browserExecutable, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const preview = process.env.PREVIEW_URL || 'http://127.0.0.1:8765/build/web/';
  for (const filename of ['index.html', 'app.mjs', 'logic.mjs', 'styles.css']) {
    const expected = await input('web/' + filename);
    const response = await fetch(new URL(filename, preview));
    assert.equal(response.status, 200, 'Exported HTML resource missing: ' + filename);
    assert.equal(sha(Buffer.from(await response.arrayBuffer())), sha(expected), 'Stale HTML export: ' + filename);
  }
  await page.goto(preview, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => /Archivo CCPC 2024.*cargad/.test(document.querySelector('#data-status')?.textContent || ''));
  const exportedStory = await page.evaluate(async () => {
    const response = await fetch('./content/story.json');
    if (!response.ok) throw new Error('Exported story is unavailable');
    return response.json();
  });
  const canonicalStory = JSON.parse(await readFile(path.join(root, 'game/content/story.json'), 'utf8'));
  assert.equal(canonicalStory.schema_version, '3.0.0', 'Campaign media requires story schema 3');
  if (JSON.stringify(exportedStory) !== JSON.stringify(canonicalStory)) throw new Error('The web export does not match the current shared story');
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); });
  const settings = await page.locator('details.settings').boundingBox();
  if (!settings) throw new Error('The exported HTML overview is unavailable');
  const overviewHeight = Math.ceil(settings.y + settings.height + 16);
  const overview = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: overviewHeight } });
  const overviewPath = 'build/evidence/submission-html-overview.png';
  await writeFile(path.join(root, overviewPath), overview);
  await input(overviewPath);
  images[6] = figure(overview, 'Ruta HTML · Portada del export final');
  const deckHtml = '<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><title>Voces de la Plaza · Presentación</title><style>' + deckStyle + '</style></head><body><main>' + slides.map((slide, i) => '<section class="slide ' + (images[i] ? 'with-image' : '') + '" aria-label="Diapositiva ' + (i + 1) + '"><p class="kicker">' + kickers[i] + '</p><h1>' + escape(slide.title) + '</h1><div class="layout"><div class="copy">' + slideBody(slide, i) + '</div>' + (images[i] || '') + '</div><footer><span class="note">' + footnotes[i] + '</span><span class="folio">' + (i + 1) + ' / 10</span></footer></section>').join('') + '</main></body></html>';
  if (!deckOnly) await writeFile(path.join(output, 'narrativa.html'), narrativeHtml);
  await writeFile(path.join(output, 'presentacion.html'), deckHtml);
  await page.emulateMedia({ media: 'print' });
  const targets = deckOnly ? [['presentacion', 'voces_presentacion.pdf', 10]] : [['narrativa', 'voces_narrativa_y_difusion.pdf', 4], ['presentacion', 'voces_presentacion.pdf', 10]];
  for (const [name, filename, expectedPages] of targets) {
    await page.setViewportSize({ width: name === 'narrativa' ? 710 : 1280, height: name === 'narrativa' ? 1056 : 720 });
    await page.goto(pathToFileURL(path.join(output, name + '.html')).href);
    await page.evaluate(() => document.fonts.ready);
    if (await page.locator('section').count() !== expectedPages) throw new Error(name + ': incorrect section count');
    const issues = await page.evaluate(kind => {
      const errors = [];
      for (const [index, section] of [...document.querySelectorAll('section')].entries()) {
        const content = section.querySelector(kind === 'narrativa' ? '.page-content' : '.layout');
        const footer = section.querySelector('footer');
        if (content.getBoundingClientRect().bottom + 10 > footer.getBoundingClientRect().top) errors.push('Page ' + (index + 1) + ': content overlaps footer');
        for (const image of section.querySelectorAll('img')) if (!image.complete || !image.naturalWidth) errors.push('Page ' + (index + 1) + ': missing image');
        if (section.scrollWidth > section.clientWidth + 1 || section.scrollHeight > section.clientHeight + 1) errors.push('Page ' + (index + 1) + ': section overflow');
      }
      return errors;
    }, name);
    if (issues.length) throw new Error(name + ': ' + issues.join('; '));
    await page.pdf({ path: path.join(output, filename), preferCSSPageSize: true, printBackground: true, tagged: true });
    verifyPdfPageCount(filename, expectedPages);
    console.log('Generated submission/' + filename);
  }
  for (const item of renderInputs) assert.equal(sha(await readFile(path.join(root, item.path))), item.sha256, 'Source changed during rendering: ' + item.path);
  const artifactPaths = targets.flatMap(([name, filename]) => ['submission/' + name + '.html', 'submission/' + filename]);
  const artifacts = await Promise.all(artifactPaths.map(async filename => ({ path: filename, sha256: sha(await readFile(path.join(root, filename))) })));
  await writeFile(path.join(root, 'build/evidence/document-render-inputs.json'), JSON.stringify({
    status: 'rendered; visual review pending', created_at_utc: new Date().toISOString(), story_schema: canonicalStory.schema_version,
    native_pack_sha256: native.pack_sha256, inputs: renderInputs, artifacts,
    limits: ['Rendering and hash checks do not establish a participant pilot or accessibility certification'],
  }, null, 2) + '\n');
} finally { await browser.close(); }
