// Actual UI recording. Run --plan/--self-test now; --record only after main's final export notification.
import assert from 'node:assert/strict';
import { chromium } from '../.tools/browser/node_modules/playwright/index.mjs';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, rename, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessActivity, aggregateRecords, normalizeStory, validateDataset, PROGRESS_KEY } from '../web/logic.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const encoder = require('../.tools/browser/node_modules/ffmpeg-static');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8765';
const webURL = new URL('/build/web/', `${base}/`);
const dimensions = { width: 1280, height: 800 };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const relative = filename => path.relative(root, filename);

export function subtitleStamp(seconds, ass = false) {
  const scale = ass ? 100 : 1000;
  const ticks = Math.round(seconds * scale);
  const hours = Math.floor(ticks / (3600 * scale));
  const minutes = Math.floor(ticks / (60 * scale)) % 60;
  const whole = Math.floor(ticks / scale) % 60;
  const fraction = ticks % scale;
  return `${String(hours).padStart(ass ? 1 : 2, '0')}:${String(minutes).padStart(2, '0')}:${String(whole).padStart(2, '0')}${ass ? '.' : ','}${String(fraction).padStart(ass ? 2 : 3, '0')}`;
}

export function captionLines(text, width = 82) {
  const lines = [''];
  for (const word of text.split(/\s+/)) {
    assert.ok(word.length <= width, 'A caption word exceeds the readable line width');
    const index = lines.length - 1;
    if (lines[index] && lines[index].length + word.length + 1 > width) lines.push(word);
    else lines[index] += `${lines[index] ? ' ' : ''}${word}`;
  }
  assert.ok(lines.length <= 2, `Caption exceeds two lines: ${text}`);
  return lines;
}

export function validateTimeline(cues, duration) {
  assert.ok(duration >= 105 && duration <= 145, `Measured ${duration.toFixed(2)}s is outside 105–145s; preserve the previous MP4`);
  assert.ok(duration <= 180);
  let previousEnd = 0;
  for (const cue of cues) {
    assert.ok(cue.start >= previousEnd - 0.001 && cue.end > cue.start && cue.end <= duration + 0.1, 'Overlapping or invalid caption timing');
    assert.ok(cue.text.length / (cue.end - cue.start) <= 23, `Caption needs more reading time: ${cue.id}`);
    captionLines(cue.text);
    previousEnd = cue.end;
  }
}

export function defaultIconWarning(message, url) {
  return url === new URL('/favicon.ico', webURL).href &&
    message === 'Failed to load resource: the server responded with a status of 404 (File not found)';
}

export function makePlan(data) {
  const national = aggregateRecords([data.records.find(r => r.id === 'national')]);
  const rate = national.participation_pct;
  assert.ok(rate !== null, 'The final recording needs the verified national finding');
  return [
    ['opening', 5.5, 'Equipo Latas presenta Voces de la Plaza, una aventura de educación cívica para bachillerato y personas adultas.'],
    ['plaza', 4, 'Villa Brisa prepara una reunión. Luz, Mateo e Inés nos reciben en tres casas.'],
    ['door', 4.5, 'Caminamos con WASD y cruzamos la puerta del archivo de Mateo. Las tres casas abren desde el inicio.'],
    ['html', 4.5, 'La ruta HTML cuenta la misma historia con texto ampliable, gráficas y controles de teclado.'],
    ['printshop', 3.5, 'Primera misión: preparar un boletín que diga qué sabemos.'],
    ['participation-reading', 6, `INE, CCPC federal 2024: cerca de ${Math.round(rate)} de cada 100 registros con información conocida muestran participación.`],
    ['reading-feedback', 3.5, 'Leemos las barras. No necesitamos hacer divisiones para avanzar.'],
    ['source', 5, 'El boletín conserva conteos exactos, fuente y año. Los registros sin información se muestran aparte.'],
    ['unknown', 5, 'Si falta información, no afirmamos que alguien no participó. Pedir apoyo se distingue de responder sin ayuda.'],
    ['unknown-transfer', 4, 'Otro caso: 60 participaron, 30 no y 10 no se sabe. Este ejemplo es inventado.'],
    ['bulletin', 3.5, 'Publicamos el boletín con su fuente. Queda disponible para volver a leerlo.'],
    ['archive', 4, 'En el archivo de Mateo revisamos un cartel que confunde cantidades y porcentajes.'],
    ['more-count', 4.5, 'Segunda misión: corregir el cartel. Baja California tiene más registros con participación.'],
    ['higher-rate', 5, 'De cada 100 registros con información, Aguascalientes tiene mayor proporción. Las bases son distintas.'],
    ['comparison-transfer', 4.5, 'En otro ejemplo inventado, una cantidad mayor puede representar una parte menor del grupo.'],
    ['poster', 5, 'Corregimos el cartel: más registros y mayor proporción no son lo mismo. Podemos revisar ambas medidas.'],
    ['workshop', 5, 'Ahora creamos nuestro cartel: elegimos dos estados, qué comparar y una pregunta para la reunión.'],
    ['authored-poster', 6, 'Nuestro cartel cambia con los datos elegidos. Conserva fuente, bases y límites; podemos revisarlo antes de publicarlo.'],
    ['poster-meeting', 5, 'Inés recibe nuestro cartel y la pregunta. La evidencia abre la conversación; no decide por quién votar.'],
    ['hall', 5, 'Con Inés escuchamos tres proyectos. La consulta y sus cifras son inventadas, separadas del CCPC.'],
    ['ballot', 5, 'Elegir A, B o C, dejar sin marca o no participar permite el mismo final. Ninguna preferencia se califica.'],
    ['result', 4, 'Este resultado es inventado. Las necesidades que no ganan siguen mereciendo atención.'],
    ['followup', 5, 'Después de decidir podemos preguntar qué se hizo con el presupuesto y cuándo revisaremos los avances.'],
    ['ending', 5, 'Regresamos a la plaza con el boletín y el cartel. La elección ficticia y su resultado no se guardan.'],
    ['classroom', 4.5, 'Hay una guía para facilitar la actividad de forma individual, en parejas o con proyector.'],
    ['handout', 5, 'La hoja para imprimir reúne datos, fuentes y preguntas para conversar sin recoger preferencias políticas.'],
    ['closing', 5, 'Demostración automatizada y sin audio. El pilotaje con docentes y estudiantes sigue pendiente.'],
  ].map(([id, seconds, text]) => ({ id, seconds, text }));
}

async function content() {
  const data = validateDataset(JSON.parse(await readFile(path.join(root, 'game/content/ccpc.json'), 'utf8')));
  const story = normalizeStory(JSON.parse(await readFile(path.join(root, 'game/content/story.json'), 'utf8')));
  assert.ok(story, 'Canonical classroom story must be complete schema 2');
  return { data, story };
}

async function preflight() {
  const receipts = [];
  // Compare served bytes, not only version labels: refuse an export older than current approved sources.
  for (const [source, served] of [
    ...['index.html', 'app.mjs', 'logic.mjs', 'views.mjs', 'poster.mjs', 'poster-workshop.mjs', 'styles.css'].map(name => [`web/${name}`, name]),
    ...['story.json', 'ccpc.json'].map(name => [`game/content/${name}`, `content/${name}`]),
    ...['classroom.html', 'classroom-handout.html', 'classroom-handout.pdf'].map(name => [`submission/${name}`, name]),
  ]) {
    const expected = await readFile(path.join(root, source));
    const response = await fetch(new URL(served, webURL), { cache: 'no-store' });
    assert.equal(response.status, 200, `Final export is missing ${served}`);
    const actual = Buffer.from(await response.arrayBuffer());
    assert.equal(sha(actual), sha(expected), `Stale final export: ${served}. Wait for main to export.`);
    receipts.push({ source, url: new URL(served, webURL).href, sha256: sha(actual), bytes: actual.length });
  }
  for (const file of ['content/story.json', 'scripts/main.gd', 'scripts/interface_theme.gd', 'scripts/interface_shell.gd', 'scripts/civic_rules.gd', 'scripts/room.gd', 'scripts/poster_view.gd', 'scripts/poster_card.gd', 'scripts/poster_workshop.gd', 'scenes/room.tscn']) {
    assert.equal(sha(await readFile(path.join(root, 'build/staging-web', file))), sha(await readFile(path.join(root, 'game', file))), `Stale Godot staging: ${file}`);
  }
  const pack = path.join(root, 'build/web/game/index.pck');
  const manifest = JSON.parse(await readFile(path.join(root, 'build/staging-web/assets/export_manifest.json'), 'utf8'));
  assert.equal(manifest.asset_set, 'original', 'Record the final original asset set');
  const packTime = (await stat(pack)).mtimeMs;
  for (const file of ['scripts/main.gd', 'scripts/interface_theme.gd', 'scripts/interface_shell.gd', 'scripts/civic_rules.gd', 'scripts/room.gd', 'scripts/poster_view.gd', 'scripts/poster_card.gd', 'scripts/poster_workshop.gd', 'content/story.json']) {
    assert.ok(packTime >= (await stat(path.join(root, 'game', file))).mtimeMs, `Godot PCK predates ${file}`);
  }
  receipts.push({ source: relative(pack), sha256: sha(await readFile(pack)), bytes: (await stat(pack)).size });
  return receipts;
}

function encode(args) {
  const result = spawnSync(encoder, args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  return result.stderr;
}

function assDocument(cues, duration) {
  const escape = text => text.replaceAll('\\', '\\\\').replaceAll('{', '\\{').replaceAll('}', '\\}');
  return `[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Caption,DejaVu Sans,38,&H00FFFFFF,&H00FFFFFF,&H0021220E,&H0021220E,0,0,0,0,100,100,0,0,1,1,0,2,100,100,30,1\nStyle: Label,DejaVu Sans,24,&H00C7DBC4,&H00C7DBC4,&H0021220E,&H0021220E,0,0,0,0,100,100,0,0,1,0,0,2,100,100,148,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,${subtitleStamp(duration, true)},Label,,0,0,0,,DEMOSTRACIÓN AUTOMATIZADA · VIDEO SIN AUDIO\n` +
    cues.map(cue => `Dialogue: 1,${subtitleStamp(cue.start, true)},${subtitleStamp(cue.end, true)},Caption,,0,0,0,,${captionLines(cue.text).map(escape).join('\\N')}`).join('\n') + '\n';
}

async function record(data, story, plan, receipts, rehearsal = false) {
  const run = path.join(root, 'build/pitch-recording', new Date().toISOString().replaceAll(':', '-'));
  await mkdir(run, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || '/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
    args: ['--no-sandbox', '--enable-unsafe-swiftshader'], headless: true });
  const context = await browser.newContext({ viewport: dimensions,
    ...(rehearsal ? {} : { recordVideo: { dir: run, size: dimensions } }) });
  const origin = performance.now();
  const page = await context.newPage();
  const video = page.video();
  const errors = [];
  const warnings = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const detail = { message: message.text(), url: message.location().url };
    // The default browser icon is outside the captured page. Preserve this known
    // cosmetic warning; every other console error remains fatal.
    (defaultIconWarning(detail.message, detail.url) ? warnings : errors).push(detail);
  });
  const cues = [];
  let doorProbe;
  const elapsed = () => (performance.now() - origin) / 1000;
  const hold = async (id, showQuestion, during) => {
    const scene = plan.find(item => item.id === id);
    assert.ok(scene, `Unknown scene ${id}`);
    const start = elapsed();
    console.log(`${rehearsal ? 'Rehearsing' : 'Recording'} ${String(cues.length + 1).padStart(2, '0')}/${plan.length}: ${id} (${rehearsal ? 'no video' : `${scene.seconds}s`})`);
    await page.screenshot({ path: path.join(run, `${String(cues.length + 1).padStart(2, '0')}-${id}.png`) });
    if (during) await during();
    if (showQuestion) {
      const firstHalf = (rehearsal ? 0.1 : scene.seconds / 2) - (elapsed() - start);
      if (firstHalf > 0) await page.waitForTimeout(firstHalf * 1000);
      await showQuestion();
      await page.screenshot({ path: path.join(run, `${String(cues.length + 1).padStart(2, '0')}-${id}-question.png`) });
    }
    const remaining = (rehearsal ? 0.15 : scene.seconds) - (elapsed() - start);
    if (remaining > 0) await page.waitForTimeout(remaining * 1000);
    cues.push({ id, text: scene.text, start, end: elapsed(), question_preview: Boolean(showQuestion) });
  };
  const focusView = async selector => {
    const node = page.locator(selector).first();
    await node.waitFor({ state: 'visible' });
    // Scroll the real page without changing its content or simulating a result.
    await node.evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(120);
  };
  const enter = async (house, chapter) => {
    await page.locator(`[data-house="${house}"]`).click();
    await page.locator(`#house-title-${house}`).waitFor({ state: 'visible' });
    if (chapter) await page.locator(`[data-start="${chapter}"]`).click();
  };
  const activity = id => story.activities.find(item => item.id === id);
  const answer = async id => {
    const item = activity(id);
    assert.equal(await page.locator(`.activity[data-activity="${id}"] legend`).innerText(), item.prompt);
    const choice = item.choices.find(option => assessActivity(item, option.id, data, story).correct);
    assert.ok(choice, `No valid canonical interpretation for ${id}`);
    await page.locator(`input[name="${id}"][value="${choice.id}"]`).check();
    await page.locator(`.activity[data-activity="${id}"] button[type=submit]`).click();
    await page.locator(`#feedback-${id}.correct, #feedback-${id}.supported`).waitFor();
  };
  const next = chapter => page.locator(`#activities-${chapter} [data-next-activity]`).click();
  const walk = async (key, milliseconds) => {
    await page.keyboard.down(key);
    try { await page.waitForTimeout(milliseconds); }
    finally { await page.keyboard.up(key); }
    await page.waitForTimeout(120);
  };
  try {
    await page.goto(new URL('game/index.html', webURL).href);
    await page.locator('#status').waitFor({ state: 'hidden', timeout: 90000 });
    await page.waitForTimeout(700);
    await hold('opening');
    await page.keyboard.press('Escape');
    const exterior = await page.screenshot({ clip: { x: 48, y: 158, width: 8, height: 8 } });
    await hold('plaza', null, async () => {
      // The fresh plaza spawn faces Mateo's doorway. Show that short actual
      // walk during the plaza caption and observe the visible room transition.
      for (let attempt = 0; attempt < 12; attempt++) {
        await walk('w', 350);
        if (sha(await page.screenshot({ clip: { x: 48, y: 158, width: 8, height: 8 } })) !== sha(exterior)) break;
      }
    });
    const interior = await page.screenshot({ clip: { x: 48, y: 158, width: 8, height: 8 } });
    assert.notEqual(sha(interior), sha(exterior), 'Walking through the doorway must visibly change the plaza into a room');
    doorProbe = { exterior_sha256: sha(exterior), interior_sha256: sha(interior), input: 'W from the fresh plaza spawn through Mateo’s doorway, with visible room feedback; no teleport controls' };
    await hold('door');
    await page.keyboard.press('Escape');
    await page.goto(webURL.href);
    await page.locator('#data-status').filter({ hasText: 'Archivo CCPC 2024 e historia compartida cargados' }).waitFor();
    assert.equal(await page.locator('[data-house]').count(), 3);
    await hold('html');
    await page.locator('.settings summary').click(); await page.locator('#text-size').selectOption('large');
    await page.locator('.settings summary').click();
    await enter('printshop'); await focusView('#house-title-printshop'); await hold('printshop');
    await page.locator('[data-start="printing"]').click();
    await focusView('#activity-title-participation-reading');
    await hold('participation-reading', () => focusView('#activities-printing fieldset'));
    await answer('participation-reading'); await focusView('#feedback-participation-reading'); await hold('reading-feedback');
    await page.locator('#activities-printing .source-details summary').click();
    await focusView('#activities-printing .source-details'); await hold('source');
    await next('printing'); await focusView('#activity-title-unknown');
    await page.locator('#activities-printing [data-assist]').click();
    assert.equal(await page.locator('#feedback-unknown.correct').count(), 0);
    await focusView('#activities-printing fieldset'); await hold('unknown');
    await next('printing'); await focusView('#activity-title-unknown-transfer');
    await hold('unknown-transfer', () => focusView('#activities-printing fieldset'));
    await answer('unknown-transfer'); await page.locator('#complete-printing').click();
    await focusView('#artifact-printing'); await hold('bulletin');
    await page.keyboard.press('Escape');
    await enter('archive'); await focusView('#house-title-archive'); await hold('archive');
    await page.locator('[data-start="comparison"]').click(); await focusView('#activity-title-more-count');
    assert.ok((await page.locator('#activities-comparison').innerText()).includes(story.comparison_artifact.before));
    await hold('more-count', () => focusView('#activities-comparison fieldset'));
    await answer('more-count'); await next('comparison');
    await focusView('#activity-title-higher-rate'); await hold('higher-rate', () => focusView('#activities-comparison fieldset'));
    await answer('higher-rate'); await next('comparison');
    await focusView('#activity-title-comparison-transfer'); await hold('comparison-transfer', () => focusView('#activities-comparison fieldset'));
    await answer('comparison-transfer'); await page.locator('#complete-comparison').click();
    await focusView('#artifact-comparison');
    assert.match(await page.locator('#artifact-comparison').innerText(), /Titular corregido con datos/);
    await hold('poster');
    await page.locator('#open-poster-workshop').click();
    await page.locator('#poster-first').selectOption('state_19');
    await page.locator('#poster-question').selectOption('voices');
    await focusView('#poster-workshop-title'); await hold('workshop');
    await page.locator('#preview-poster').click();
    const countFinding = await page.locator('#poster-preview-title').innerText();
    await page.locator('#poster-metric').selectOption('rate');
    await page.locator('#preview-poster').click();
    assert.notEqual(await page.locator('#poster-preview-title').innerText(), countFinding);
    await focusView('#poster-preview'); await hold('authored-poster');
    await page.locator('#carry-poster').click();
    await focusView('#poster-meeting'); await hold('poster-meeting');
    assert.match(await page.locator('#poster-meeting').innerText(), /quienes todavía no han hablado/);
    await focusView('#consultation-bridge'); await hold('hall');
    await page.locator('[data-start="consultation"]').click(); await focusView('#ballot'); await hold('ballot');
    await page.locator('#ballot input[value="decline"]').check(); await page.locator('#ballot button[type=submit]').click();
    await focusView('#consultation-result'); await hold('result');
    await focusView('#reflection'); await hold('followup');
    await page.locator('#reflection-form input[value="budget"]').check(); await page.locator('#reflection-form button[type=submit]').click();
    await focusView('#ending'); await hold('ending');
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), PROGRESS_KEY);
    assert.deepEqual(saved.completedChapters, ['printing', 'comparison', 'consultation']);
    assert.deepEqual(Object.keys(saved).sort(), ['assisted', 'completedChapters', 'hints', 'legacyCompleted', 'settings', 'version']);
    assert.deepEqual(saved.assisted, ['unknown']);
    await page.goto(new URL('classroom.html', webURL).href); await hold('classroom');
    await page.goto(new URL('classroom-handout.html', webURL).href); await hold('handout');
    // PDF was required and hashed by preflight; capture the actual HTML handout for reliable readable video.
    await page.goto(webURL.href); await page.locator('#ending').waitFor({ state: 'visible' });
    await focusView('#ending'); await hold('closing');
    assert.deepEqual(errors, []);
    // Chromium starts its video clock after page creation. Keep the final real
    // frame alive beyond the wall-clock cues; encoding trims this capture tail.
    // This preserves the full last caption without relaxing timing validation.
    if (!rehearsal) await page.waitForTimeout(1000);
  } catch (error) {
    await page.screenshot({ path: path.join(run, 'failure.png') }).catch(() => {});
    await writeFile(path.join(run, 'failure.json'), JSON.stringify({ message: error.message, cues, errors, warnings }, null, 2));
    throw error;
  } finally {
    await context.close(); await browser.close();
  }
  if (rehearsal) {
    await writeFile(path.join(run, 'rehearsal.json'), JSON.stringify({ mode: 'control rehearsal; no video or final outputs',
      phases: cues.map(cue => cue.id), physical_door_probe: doorProbe, errors, warnings }, null, 2));
    console.log(`Control rehearsal passed. Screenshots: ${relative(run)}. Final export fingerprint check remains mandatory for --record.`);
    return;
  }
  const source = await video.path();
  assert.deepEqual(await preflight(), receipts, 'The final export changed during recording; record one stable candidate');
  const trimStart = cues[0].start;
  const duration = cues.at(-1).end - trimStart;
  const timeline = cues.map(cue => ({ ...cue, start: cue.start - trimStart, end: cue.end - trimStart }));
  validateTimeline(timeline, duration);
  // Stage the entire deliverable set. A failed capture/encode never overwrites the previous draft.
  const subtitles = path.join(run, 'pitch_subtitulos.srt');
  await writeFile(subtitles, timeline.map((cue, i) => `${i + 1}\n${subtitleStamp(cue.start)} --> ${subtitleStamp(cue.end)}\n${captionLines(cue.text).join('\n')}\n`).join('\n'));
  const transcript = path.join(run, 'pitch_transcripcion.txt');
  await writeFile(transcript, 'Voces de la Plaza · Equipo Latas · Revisión de aula\nDemostración automatizada, silenciosa y subtitulada. No contiene narración ni grabación de estudiantes.\n\n' +
    timeline.map(cue => `${subtitleStamp(cue.start)} — ${subtitleStamp(cue.end)}\n${cue.text}`).join('\n\n') +
    '\n\nFuente: INE, CCPC federal 2024. Conteos exactos y bases en el boletín y el cartel. Villa Brisa, los casos de transferencia y la consulta son ficción educativa.\nEl pilotaje con docentes y estudiantes no se ha realizado. Esta demostración no prueba aprendizaje ni efectos electorales.\n');
  const ass = path.join(run, 'captions.ass'); await writeFile(ass, assDocument(timeline, duration));
  const output = path.join(run, 'voces_pitch_borrador.mp4');
  console.log(`Encoding ${duration.toFixed(2)}s of actual UI at 1920×1080, H.264, silent, burned-in captions.`);
  const log = encode(['-y', '-ss', String(trimStart), '-i', source, '-t', String(duration), '-vf',
    `scale=1408:880:flags=lanczos,pad=1920:1080:(ow-iw)/2:0:color=0x0e2221,subtitles=${relative(ass)}`,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', '-an', output]);
  const inspection = spawnSync(encoder, ['-hide_banner', '-i', output], { encoding: 'utf8' }).stderr;
  const time = inspection.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  assert.ok(time, 'Encoded duration must be measurable');
  const measured = Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3]);
  validateTimeline(timeline, measured);
  assert.match(inspection, /Video: h264/); assert.match(inspection, /1920x1080/); assert.match(inspection, /yuv420p/); assert.match(inspection, /30 fps/);
  assert.doesNotMatch(inspection, /Audio:/);
  encode(['-v', 'error', '-i', output, '-f', 'null', '-']);
  for (const [index, cue] of timeline.entries()) {
    const image = path.join(run, `encoded-${String(index + 1).padStart(2, '0')}-${cue.id}.png`);
    encode(['-y', '-ss', String(cue.start + (cue.end - cue.start) * (cue.question_preview ? 0.25 : 0.5)), '-i', output, '-frames:v', '1', image]);
    if (cue.question_preview) encode(['-y', '-ss', String(cue.start + (cue.end - cue.start) * 0.75), '-i', output, '-frames:v', '1', image.replace('.png', '-question.png')]);
  }
  const evidence = { recorded_at_utc: new Date().toISOString(), team: 'Latas', product: 'Voces de la Plaza', browser: browser.version(), url: webURL.href,
    automated_operator: true, audio: 'none; silent captioned demonstration', participant_pilot: 'not performed',
    duration_seconds: measured, width: 1920, height: 1080, codec: 'H.264', pixel_format: 'yuv420p', fps: 30,
    source_video: relative(source), trimmed_loading_seconds: trimStart, raw_capture_size: dimensions, cues: timeline,
    inputs: receipts, physical_door_probe: doorProbe, output_sha256: sha(await readFile(output)), visual_frames: relative(run),
    limitations: ['Human visual review of extracted frames required', 'Automated recording is not a classroom or accessibility evaluation'], errors, warnings };
  await mkdir(path.join(root, 'build/evidence'), { recursive: true });
  await writeFile(path.join(root, 'build/evidence/pitch-encoding.log'), `${log}\n${inspection}`);
  await writeFile(path.join(root, 'build/evidence/pitch-encoding.json'), JSON.stringify(evidence, null, 2) + '\n');
  for (const filename of ['voces_pitch_borrador.mp4', 'pitch_subtitulos.srt', 'pitch_transcripcion.txt']) {
    await rename(path.join(run, filename), path.join(root, 'submission', filename));
  }
  console.log(`Recorded and encoded ${measured.toFixed(2)}s. Review all ${timeline.length} encoded frames in ${relative(run)}.`);
}

function selfTest(plan, story) {
  assert.equal(subtitleStamp(59.9996), '00:01:00,000');
  assert.equal(subtitleStamp(3599.9996), '01:00:00,000');
  assert.equal(subtitleStamp(59.996, true), '0:01:00.00');
  assert.deepEqual(captionLines('Una frase corta'), ['Una frase corta']);
  assert.throws(() => captionLines('x'.repeat(90)));
  assert.equal(new Set(plan.map(scene => scene.id)).size, plan.length);
  for (const activity of story.activities) assert.equal(plan.filter(scene => scene.id === activity.id).length, 1);
  let elapsed = 0;
  const timeline = plan.map(scene => { const start = elapsed; elapsed += scene.seconds; return { ...scene, start, end: elapsed }; });
  validateTimeline(timeline, elapsed);
  assert.throws(() => validateTimeline(timeline, 181));
  assert.throws(() => validateTimeline([{ id: 'cut-tail', start: 123.751, end: 130.251, text: 'La última frase debe quedar completa.' }], 130.03));
  assert.throws(() => validateTimeline([{ id: 'bad', start: 5, end: 4, text: 'Tiempo inválido' }], 120));
  assert.match(assDocument(timeline, elapsed), /PlayResX: 1920/);
  assert.match(assDocument(timeline, elapsed), /VIDEO SIN AUDIO/);
  const iconMessage = 'Failed to load resource: the server responded with a status of 404 (File not found)';
  assert.equal(defaultIconWarning(iconMessage, new URL('/favicon.ico', webURL).href), true);
  assert.equal(defaultIconWarning(iconMessage, new URL('content/ccpc.json', webURL).href), false);
  assert.equal(defaultIconWarning('Server error 500', new URL('/favicon.ico', webURL).href), false);
  console.log(`Recorder self-tests passed: ${plan.length} scenes, six canonical activities, ${elapsed.toFixed(1)}s of readable holds; no browser or final outputs touched.`);
}

async function main() {
  const mode = process.argv[2] || '--plan';
  assert.ok(['--plan', '--self-test', '--preflight', '--rehearse', '--record'].includes(mode), 'Use --plan, --self-test, --preflight, --rehearse or --record');
  const { data, story } = await content();
  const plan = makePlan(data);
  selfTest(plan, story);
  if (mode === '--plan') {
    console.log(JSON.stringify({ mode: 'plan only; no recording', target_seconds: [105, 145], scenes: plan }, null, 2));
  } else if (mode === '--preflight') {
    console.log(JSON.stringify({ status: 'final export matches current sources', inputs: await preflight() }, null, 2));
  } else if (mode === '--record') {
    await record(data, story, plan, await preflight());
  } else if (mode === '--rehearse') {
    await record(data, story, plan, [], true);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
