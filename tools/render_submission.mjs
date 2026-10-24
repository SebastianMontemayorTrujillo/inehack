// Local, reproducible print deliverables. Browser layout preserves selectable text.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from '../.tools/browser/node_modules/playwright/index.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'submission');
const deckOnly = process.argv.includes('--deck-only');
await mkdir(output, { recursive: true });
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
function inline(text) {
  return escape(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => /^https:\/\//.test(url) ? `<a href="${url}">${label}</a>` : label).replace(/`([^`]+)`/g, '$1');
}
function markdown(text) {
  const lines = text.split('\n');
  const html = [];
  let paragraph = [];
  const flush = () => { if (paragraph.length) html.push(`<p>${inline(paragraph.join(' '))}</p>`); paragraph = []; };
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n].trim();
    if (line.startsWith('<!--') || line.startsWith('<div')) continue;
    if (!line) { flush(); continue; }
    if (line.startsWith('## ')) { flush(); html.push(`<h1>${inline(line.slice(3))}</h1>`); continue; }
    if (line.startsWith('|')) {
      flush();
      const rows = [];
      while (n < lines.length && lines[n].trim().startsWith('|')) {
        const cells = lines[n].trim().split('|').slice(1, -1).map(x => x.trim());
        if (!cells.every(x => /^:?-+:?$/.test(x))) rows.push(cells);
        n++;
      }
      n--;
      html.push('<table>' + rows.map((cells, i) => `<tr>${cells.map(c => `<${i ? 'td' : 'th'}>${inline(c)}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('') + '</table>');
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return html.join('\n');
}
const narrative = await readFile(path.join(root, 'docs/storyline_and_dissemination_es.md'), 'utf8');
const body = narrative.split('<!-- INICIO DEL CONTENIDO PARA PDF: PÁGINA 1 -->')[1].split('<!-- FIN DEL CONTENIDO PARA PDF -->')[0];
const blocks = body.split(/<div style="page-break-after: always;"><\/div>/);
if (blocks.length !== 4) throw new Error('Expected four narrative sections');
const narrativeHtml = `<!doctype html><html lang="es-MX"><meta charset="utf-8"><title>Voces de la Plaza · Narrativa y difusión</title><style>
@page{size:Letter;margin:14mm}*{box-sizing:border-box}body{color:#173b39;font:11pt/1.25 Arial,sans-serif;margin:0}h1{font:700 19pt/1.16 Georgia,serif;margin:0 0 11pt}p{margin:0 0 6pt}a{color:#225c55;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:11pt;margin:8pt 0}td,th{border:1px solid #b7c6bb;padding:4pt;text-align:left;vertical-align:top}th{background:#e7eddf}section{height:calc(11in - 28mm);position:relative;break-after:page;padding-bottom:30pt}section:last-child{break-after:auto}.running{font-size:9pt;letter-spacing:.1em;color:#697b6a;margin-bottom:10pt}footer{position:absolute;bottom:0;left:0;right:0;font-size:9pt;border-top:1px solid #bcc6b8;padding-top:6pt}</style>${blocks.map((block, i) => `<section><div class="page-content"><div class="running">VOCES DE LA PLAZA · INEHACK 2026 · RETO 3</div>${markdown(block)}</div><footer>${i + 1} / 4 · Narrativa y propuesta de difusión · Revisión del equipo pendiente</footer></section>`).join('')}</html>`;
if (!deckOnly) await writeFile(path.join(output, 'narrativa.html'), narrativeHtml);

const source = 'Fuente: INE, CCPC federal 2024. SV/(SV+NV) y NS/LN tienen denominadores distintos.';
const screenshot = (name, caption) => `<figure><img src="../build/evidence/${name}" alt="${escape(caption)}"><figcaption>${escape(caption)}</figcaption></figure>`;
const slides = [
  { title: 'Voces de la Plaza', kicker: 'INEhack 2026 · Reto 3', body: '<p class="lead">Una aventura para comprender datos de participación y conversar con información.</p>', image: screenshot('godot-plaza.png', 'Villa Brisa · Captura del prototipo Godot'), note: 'Personas adultas principiantes y facilitadoras. Objetivo de duración: 10–15 minutos, pendiente de prueba con participantes.' },
  { title: 'Dos cifras, dos denominadores', kicker: 'Participación nacional · 2024', body: '<div class="stat">59.7%<small>Participación entre registros clasificados<br>SV ÷ (SV + NV)</small></div><div class="stat">6.4%<small>Registros sin clasificación<br>NS ÷ LN</small></div><p>La clasificación desconocida se explica por separado.</p>', note: source },
  { title: 'Una exposición que se construye jugando', kicker: 'La historia', body: '<h2>Luz y la prensa</h2><p>Organizar registros y publicar un boletín con fuente.</p><h2>Mateo y el cartel</h2><p>Comparar lugares sin confundir cantidades con porcentajes.</p><h2>Inés y la plaza</h2><p>Explorar necesidades legítimas y una decisión colectiva ficticia.</p>', note: 'Villa Brisa, sus personajes y la consulta son ficción original del proyecto.' },
  { title: 'La prensa de las voces', kicker: 'Primera misión', body: '<p class="lead">¿Qué registros entran en el denominador?</p><p>SV y NV permiten calcular la participación clasificada. NS conserva lo que todavía desconocemos.</p><p>Una explicación, un reintento y un caso nuevo acompañan la construcción del boletín.</p>', image: screenshot('godot-browser.png', 'La aventura ofrece conversación, navegación y ajustes'), note: source },
  { title: 'Más registros y una tasa mayor', kicker: 'Segunda misión · Mismo año y universo', body: '<table><tr><th>Entidad</th><th>SV</th><th>SV + NV</th><th>Tasa</th></tr><tr><td>Aguascalientes</td><td>626,084</td><td>1,067,306</td><td>58.66%</td></tr><tr><td>Baja California</td><td>1,396,335</td><td>2,968,011</td><td>47.05%</td></tr></table><p class="lead">El conjunto: 50.12%, sumando los conteos antes de dividir.</p><p>Estos agregados describen registros. No explican motivos individuales.</p>', note: source },
  { title: 'Una plaza, varias ideas', kicker: 'Consulta ficticia · Cifras sintéticas', body: '<h2>A · Sombra y bancas</h2><h2>B · Rincón de lectura</h2><h2>C · Jardín comunitario</h2><p>Elegir, dejar sin marcar o no participar permite completar el mismo recorrido.</p><p class="lead">Después de decidir: ¿qué se hizo con los recursos?</p>', note: 'Reglas didácticas visibles. No reproduce todos los procedimientos de una elección constitucional.' },
  { title: 'Dos maneras de recorrer la historia', kicker: 'Acceso', body: '<p class="lead">Godot y una ruta HTML semántica independiente.</p><p>Teclado, texto ampliable, tablas con valores exactos, fuentes y movimiento reducido.</p><p>La aventura agrega silencio y viajes mediante botones.</p>', image: screenshot('html-overview.png', 'Ruta HTML · Vista de escritorio del candidato exportado'), note: 'Pruebas automatizadas de navegador realizadas. Revisión con lector de pantalla y usuarios pendiente.' },
  { title: 'De la fuente a una explicación verificable', kicker: 'Reproducción', body: '<p class="lead">32 CSV · 9,773,730 filas · 33 agregados</p><p>El SHA-256 del ZIP oficial coincide con la referencia documentada.</p><p>48 pruebas: 22 Python · 17 Node · Godot GUT 9/9<br>40 aserciones y cero huérfanos en Godot.</p><p>Godot 4.7.2: exportaciones web y Linux; arranques comprobados.</p>', note: 'La validación aritmética no demuestra unicidad ni exhaustividad de la fuente. Método y límites incluidos.' },
  { title: 'Una actividad para reutilizar y evaluar', kicker: 'Aprovechamiento institucional propuesto', body: '<p class="lead">Talleres cívicos, bibliotecas y espacios educativos.</p><p>Guía para facilitar una conversación y revisar fuentes sin solicitar preferencias políticas.</p><p>Comprobar un hallazgo real, un límite del dato y una pregunta de seguimiento.</p>', note: 'Canales propuestos, sin acuerdos de adopción ni resultados de aprendizaje acreditados.' },
  { title: 'La conversación continúa', kicker: 'Siguiente paso', body: '<p class="lead">Comprender los datos nos ayuda a participar con información.</p><p>El prototipo cuenta con dos rutas y respaldo Linux. Arte y sonidos finales originales; fuentes y licencias visibles.</p><p>Revisión del equipo y evaluación con personas usuarias pendientes.</p><p>Evaluación formal con lector de pantalla pendiente.</p>', note: 'Fuente: portal CCPC del INE y descarga oficial de 2024. No se atribuyen efectos electorales al prototipo.' },
];
const deckHtml = `<!doctype html><html lang="es-MX"><meta charset="utf-8"><title>Voces de la Plaza · Presentación</title><style>
@page{size:13.333333in 7.5in;margin:0}*{box-sizing:border-box}body{margin:0;color:#173b39;background:#f6f0da;font:26px/1.3 Arial,sans-serif}.slide{width:1280px;height:720px;padding:52px 70px 56px;break-after:page;position:relative;overflow:hidden}.slide:last-child{break-after:auto}.kicker{text-transform:uppercase;letter-spacing:.13em;color:#9b4d2d;font-size:17px;margin:0 0 16px}h1{font:46px/1.08 Georgia,serif;margin:0 0 25px;max-width:1100px}h2{font:28px/1.15 Georgia,serif;margin:16px 0 8px}p{margin:0 0 18px}.lead{font-size:31px}.format-note{font-size:22px;color:#536759}.layout{display:flex;gap:32px;align-items:flex-start}.copy{flex:1;min-width:0}.with-image .copy{max-width:450px}.with-image figure{width:630px;height:400px;margin:0}img{width:100%;height:365px;object-fit:contain;object-position:top;display:block}figcaption{font-size:15px;margin-top:10px;color:#536759}footer{position:absolute;bottom:26px;left:70px;right:70px;font-size:15px;border-top:1px solid #bac5b4;padding-top:10px}.folio{float:right}.stat{display:inline-block;width:45%;font:80px/1 Georgia,serif;vertical-align:top;margin:4px 0 30px}.stat small{display:block;font:26px/1.4 Arial,sans-serif;margin-top:16px}table{border-collapse:collapse;width:100%;margin:20px 0 30px;font-size:26px}td,th{border-bottom:1px solid #aabdad;padding:14px 18px;text-align:left}th{font-size:20px;color:#496355}</style>${slides.map((slide, i) => `<section class="slide ${slide.image ? 'with-image' : ''}"><p class="kicker">${slide.kicker}</p><h1>${slide.title}</h1><div class="layout"><div class="copy">${slide.body}</div>${slide.image || ''}</div><footer><span class="folio">${i + 1} / 10</span>${slide.note}</footer></section>`).join('')}</html>`;
await writeFile(path.join(output, 'presentacion.html'), deckHtml);
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || '/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:8765/build/web/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#data-status')?.textContent.includes('Archivo CCPC 2024 cargado.'));
  await page.screenshot({ path: path.join(root, 'build/evidence/html-overview.png'), fullPage: false });
  await page.emulateMedia({ media: 'print' });
  const targets = deckOnly ? [['presentacion', 'voces_presentacion.pdf']] : [['narrativa', 'voces_narrativa_y_difusion.pdf'], ['presentacion', 'voces_presentacion.pdf']];
  for (const [name, filename] of targets) {
    // Match the Letter printable width so checks use the same line wrapping as PDF.
    await page.setViewportSize({ width: name === 'narrativa' ? 710 : 1280, height: name === 'narrativa' ? 1056 : 720 });
    await page.goto(pathToFileURL(path.join(output, `${name}.html`)).href);
    await page.evaluate(() => document.fonts.ready);
    const issues = await page.evaluate(kind => {
      const errors = [];
      for (const [index, section] of [...document.querySelectorAll('section')].entries()) {
        const content = section.querySelector(kind === 'narrativa' ? '.page-content' : '.layout');
        const footer = section.querySelector('footer');
        if (content.getBoundingClientRect().bottom + 10 > footer.getBoundingClientRect().top) errors.push(`Page ${index + 1}: content overlaps footer`);
        for (const image of section.querySelectorAll('img')) {
          if (!image.complete || !image.naturalWidth) errors.push(`Page ${index + 1}: missing image`);
        }
        if (section.scrollWidth > section.clientWidth + 1 || section.scrollHeight > section.clientHeight + 1) errors.push(`Page ${index + 1}: section overflow`);
      }
      return errors;
    }, name);
    if (issues.length) throw new Error(`${name}: ${issues.join('; ')}`);
    await page.pdf({ path: path.join(output, filename), preferCSSPageSize: true, printBackground: true });
    console.log(`Generated submission/${filename}`);
  }
} finally { await browser.close(); }
