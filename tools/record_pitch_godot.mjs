// Montaje exclusivamente de vídeo Godot real, capturado por el recorrido QA.
// --plan y --self-test no sustituyen los medios de submission.
// --encode --capture=recibo.json --freeze=recibo.json [--edits=plan.json]
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const review = path.join(root, 'build/media-review-godot-2026-10-31');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const rel = filename => path.relative(root, filename);
const absolute = filename => path.resolve(root, filename);
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const ffprobe = process.env.FFPROBE || 'ffprobe';
const args = process.argv.slice(2);
const value = name => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const mode = args.find(arg => ['--plan', '--self-test', '--encode'].includes(arg));
assert.equal(args.filter(arg => ['--plan', '--self-test', '--encode'].includes(arg)).length, 1,
  'Elegir --plan, --self-test o --encode');
assert.ok(args.every(arg => ['--plan', '--self-test', '--encode'].includes(arg) || /^--(capture|freeze|edits)=.+/.test(arg)), 'Opción desconocida');

export function stamp(seconds, ass = false) {
  const scale = ass ? 100 : 1000, ticks = Math.round(seconds * scale);
  return `${String(Math.floor(ticks / (3600 * scale))).padStart(ass ? 1 : 2, '0')}:${String(Math.floor(ticks / (60 * scale)) % 60).padStart(2, '0')}:${String(Math.floor(ticks / scale) % 60).padStart(2, '0')}${ass ? '.' : ','}${String(ticks % scale).padStart(ass ? 2 : 3, '0')}`;
}
export function lines(text, width = 78) {
  const result = [''];
  for (const word of text.split(/\s+/)) {
    assert.ok(word.length <= width, 'Palabra demasiado larga');
    const i = result.length - 1;
    if (result[i] && result[i].length + word.length + 1 > width) result.push(word);
    else result[i] += (result[i] ? ' ' : '') + word;
  }
  assert.ok(result.length <= 2, 'Subtítulo de más de dos líneas: ' + text);
  return result;
}
export function validateCues(cues, duration) {
  assert.ok(duration >= 120 && duration <= 150, 'El montaje debe durar entre 120 y 150 segundos');
  let previous = 0;
  for (const cue of cues) {
    assert.ok(cue.start >= previous && cue.end > cue.start && cue.end <= duration + 0.001, 'Subtítulos fuera de orden o de duración');
    assert.ok([...cue.text].length / (cue.end - cue.start) <= 23, 'Subtítulo supera 23 caracteres/segundo: ' + cue.id);
    lines(cue.text); previous = cue.end;
  }
}
export function godotURL(url) {
  return /\/game\/(?:index\.html)?$/.test(new URL(url).pathname);
}

export function defaultPlan() {
  // Las marcas proceden del driver QA; cada intervalo conserva velocidad real.
  // El montaje puede saltar pruebas técnicas intermedias y lo declara en pantalla.
  return [
    ['plaza', 5, ['Latas presenta Voces de la Plaza, una aventura cívica.', 'Godot web y Linux. Meta: 10–15 minutos, sin pilotaje.']],
    ['prompt-host-1', 7, ['Caminamos con WASD. Las casas están abiertas.', 'E, Enter o el botón cercano permiten interactuar.']],
    ['intro-1', 6, ['Aprendemos con Luz, Mateo e Inés, en orden.', 'La prensa de Luz imprime la campaña final.']],
    ['quest-1-1', 4, ['CCPC federal 2024: cerca de 60 de cada 100 registros clasificados tienen marca de voto.']],
    ['quest-1-2', 4, ['NS significa información desconocida. No sabemos si esas personas participaron.']],
    ['quest-1-3', 4, ['Este caso 60/30/10 es inventado. Practicamos con un ejemplo nuevo.']],
    ['house-1-complete', 6, ['Publicamos un boletín con fuente, año y conteos. NS significa que no sabemos si hubo participación.']],
    ['intro-2', 6, ['Mateo nos invita a comparar cantidad y proporción. Son preguntas diferentes.']],
    ['quest-2-1', 4, ['Baja California tiene más registros con marca de voto.']],
    ['quest-2-2', 4, ['Aguascalientes tiene mayor proporción. Las bases son distintas.']],
    ['quest-2-3', 4, ['Más participantes no implica mayor porcentaje. Los agregados no explican motivos.']],
    ['poster-rate', 7, ['El taller opcional compara dos de 32 entidades, cantidad o proporción y una pregunta neutral.']],
    ['poster-saved', 7, ['El cartel conserva bases, fuente, desconocidos y límites. Cancelar un borrador conserva lo publicado.']],
    ['consultation-intro', 7, ['Inés presenta tres proyectos. La consulta y sus cifras son ficticias, separadas del CCPC.']],
    ['consultation-options', 7, ['Hay cinco acciones, incluso dejar sin marcar o no participar.', 'Ninguna elección se califica ni se guarda.']],
    ['campaign-review', 7, ['Inés revisa el cartel y encarga su impresión a Luz dentro de la historia, sin envío externo.']],
    ['campaign-sent', 7, ['El encargo conserva el diseño de esta sesión. Salimos de Inés y regresamos a Luz.']],
    ['campaign-printshop-return', 12, ['Volvemos caminando a la casa izquierda y nos acercamos a la prensa.', 'Participar también significa conversar con información y dar seguimiento a los acuerdos.']],
    ['campaign-press', 7, ['Imprimir cartel completa la aventura. En esta demo omitimos la revelación con E.']],
    ['ending', 20, ['FIN. La campaña comienza contigo. Ampliar, descargar el PDF o seguir explorando son opcionales.', 'Campaña ciudadana con fuente INE/CCPC. Sin pilotaje ni eficacia educativa demostrada.']],
  ].map(([phase, seconds, captions]) => ({ phase, seconds,
    offset_seconds: ['consultation-options', 'ending'].includes(phase) ? 2 : ['plaza', 'campaign-press'].includes(phase) ? 0 : 3.7 - seconds, captions,
    anchor: ['house-1-complete', 'campaign-printshop-return'].includes(phase) ? 'screenshot' : 'hold' }));
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 24 * 1024 * 1024 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}
function probe(filename) {
  return JSON.parse(run(ffprobe, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', filename]));
}
async function fingerprint(filename) {
  const bytes = await readFile(absolute(filename));
  return { path: rel(absolute(filename)), sha256: sha(bytes), bytes: bytes.length };
}
async function verifyInputs(inputs) {
  for (const item of inputs) assert.equal((await fingerprint(item.path)).sha256, item.sha256, 'Cambió el insumo: ' + item.path);
}
export function resolveEdits(plan, marks, sourceDuration, recording = {}) {
  let position = 0;
  const clips = plan.map((item, index) => {
    assert.ok(Number.isFinite(item.seconds) && item.seconds > 0 && item.seconds <= 20, 'Duración de clip inválida');
    const matching = marks.filter(mark => mark.phase === item.phase);
    const mark = matching[item.occurrence ?? 0];
    assert.ok(mark, 'Falta marca de vídeo: ' + item.phase);
    const hold = recording.holds?.filter(hold => hold.phase === item.phase)[item.occurrence ?? 0];
    const videoTime = item.anchor === 'hold' && hold
      ? hold.elapsed_seconds - recording.page_created_elapsed_seconds
      : mark.video_seconds ?? (mark.elapsed_seconds - recording.page_created_elapsed_seconds);
    assert.ok(Number.isFinite(videoTime) && videoTime >= 0, 'Falta reloj de vídeo: ' + item.phase);
    const start = Math.max(0, videoTime + (item.offset_seconds ?? -1));
    const end = start + item.seconds;
    assert.ok(end <= sourceDuration, 'Clip fuera del WEBM: ' + item.phase);
    const stableEnd = videoTime + (hold?.duration_seconds ?? (item.anchor === 'hold' ? 4 : 0));
    assert.ok(start <= stableEnd && end >= videoTime, 'El clip no contiene la marca o su pausa: ' + item.phase);
    const clip = { ...item, number: index + 1, source_in: start, source_out: end, output_in: position, output_out: position + item.seconds,
      mark_video_seconds: videoTime, mark_screenshot: mark.path, hold: hold || null, speed: 1, kind: 'real-godot-video' };
    position += item.seconds;
    return clip;
  });
  const cues = clips.flatMap(clip => clip.captions.map((text, i) => ({ id: `${clip.phase}-${i + 1}`, text,
    start: clip.output_in + i * clip.seconds / clip.captions.length,
    end: clip.output_in + (i + 1) * clip.seconds / clip.captions.length })));
  validateCues(cues, position);
  return { duration: position, clips, cues };
}
export function assDocument(edit) {
  const safe = text => text.replaceAll('\\', '\\\\').replaceAll('{', '\\{').replaceAll('}', '\\}');
  return `[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nWrapStyle: 2\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Caption,DejaVu Sans,34,&H00FFFFFF,&H00FFFFFF,&H0021220E,&H0021220E,0,0,0,0,100,100,0,0,1,1,0,2,120,120,28,1\nStyle: Label,DejaVu Sans,24,&H00FFFFFF,&H00FFFFFF,&H0021220E,&H0021220E,0,0,0,0,100,100,0,0,1,1,0,8,70,70,12,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n` +
    edit.clips.map(clip => `Dialogue: 0,${stamp(clip.output_in, true)},${stamp(clip.output_out, true)},Label,,0,0,0,,GODOT WEB · MONTAJE CON CORTES · SIN AUDIO · CORTE ${String(clip.number).padStart(2, '0')}/${edit.clips.length}`).join('\n') + '\n' +
    edit.cues.map(cue => `Dialogue: 1,${stamp(cue.start, true)},${stamp(cue.end, true)},Caption,,0,0,0,,${lines(cue.text).map(safe).join('\\N')}`).join('\n') + '\n';
}

async function encode() {
  assert.ok(value('capture') && value('freeze'), 'Se requieren --capture=recibo.json y --freeze=recibo.json');
  const capturePath = absolute(value('capture')), freezePath = absolute(value('freeze'));
  const capture = JSON.parse(await readFile(capturePath, 'utf8'));
  const freeze = JSON.parse(await readFile(freezePath, 'utf8'));
  assert.equal(capture.status, 'passed', 'Esperar el recorrido QA completo');
  for (const key of ['browser_errors', 'page_errors', 'request_failures', 'reference_mismatches']) assert.deepEqual(capture[key], [], 'QA no válido: ' + key);
  assert.equal(freeze.status, 'frozen', 'Esperar freeze documental');
  for (const filename of ['docs/deck_outline_es.md', 'docs/storyline_and_dissemination_es.md', 'docs/facilitator.md', 'docs/classroom_handout.md', 'docs/pitch_script_es.md']) {
    assert.ok(freeze.inputs?.find(item => item.path === filename)?.sha256, 'Freeze incompleto: ' + filename);
  }
  await verifyInputs(freeze.inputs);
  const recording = capture.recording;
  assert.ok(recording?.path && recording.sha256, 'Falta recording.path/sha256 en recibo QA');
  const source = absolute(recording.path);
  assert.equal(path.extname(source).toLowerCase(), '.webm', 'La fuente debe ser vídeo WEBM real, no capturas');
  const sourceIdentity = await fingerprint(source);
  assert.equal(sourceIdentity.sha256, recording.sha256, 'WEBM distinto del capturado por QA');
  assert.equal(capture.environment.includes('Godot canvas'), true, 'La fuente debe ser el canvas Godot');
  assert.ok(godotURL(capture.url), 'La captura debe mostrar Godot');
  const sourceInfo = probe(source), video = sourceInfo.streams.find(stream => stream.codec_type === 'video');
  assert.equal(video?.width, 1280); assert.equal(video?.height, 800);
  assert.ok(Number.isFinite(recording.page_created_elapsed_seconds), 'Falta origen del reloj de captura');
  const runtimeInputs = [];
  for (const [filename, expected] of [
    ['tests/godot_browser_smoke.mjs', capture.test_sha256],
    ['tests/native_window_smoke.py', capture.native_script_sha256],
    ['tests/runtime_pdf_check.py', capture.pdf_checker_sha256],
  ]) {
    const item = await fingerprint(filename);
    assert.equal(item.sha256, expected, 'Driver de QA modificado tras la captura: ' + filename);
    runtimeInputs.push(item);
  }
  for (const [filename, expected] of Object.entries(capture.source_sha256)) {
    const item = await fingerprint(filename);
    assert.equal(item.sha256, expected, 'Fuente Godot modificada tras QA: ' + filename);
    runtimeInputs.push(item);
  }
  for (const [name, expected] of Object.entries(capture.artifacts)) {
    const item = await fingerprint('build/web/game/' + name);
    assert.equal(item.sha256, expected, 'Export modificado tras QA: ' + name);
    runtimeInputs.push(item);
  }
  assert.ok(capture.pdf?.path && capture.pdf.sha256, 'Falta evidencia de descarga PDF real');
  const downloadedPdf = await fingerprint(capture.pdf.path);
  assert.equal(downloadedPdf.sha256, capture.pdf.sha256, 'PDF distinto del descargado durante QA');
  runtimeInputs.push(downloadedPdf);
  const inputs = [await fingerprint(capturePath), await fingerprint(freezePath), sourceIdentity,
    await fingerprint(fileURLToPath(import.meta.url)), ...freeze.inputs, ...runtimeInputs];
  const plan = value('edits') ? JSON.parse(await readFile(absolute(value('edits')), 'utf8')).clips : defaultPlan();
  if (value('edits')) inputs.push(await fingerprint(value('edits')));
  const edit = resolveEdits(plan, capture.screenshots, Number(sourceInfo.format.duration), recording);
  await mkdir(review, { recursive: true });
  const work = path.join(review, 'video-' + new Date().toISOString().replaceAll(':', '-'));
  await mkdir(work, { recursive: true });
  await writeFile(path.join(work, 'edit-decision-list.json'), JSON.stringify({ ...edit, source: sourceIdentity }, null, 2) + '\n');
  await writeFile(path.join(work, 'captions.ass'), assDocument(edit));
  const segmentNames = [];
  for (const clip of edit.clips) {
    const name = `clip-${String(clip.number).padStart(2, '0')}.mp4`;
    console.log(`Corte ${clip.number}/${edit.clips.length}: ${clip.phase}, WEBM ${clip.source_in.toFixed(3)}–${clip.source_out.toFixed(3)}s`);
    run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(clip.source_in), '-i', source, '-t', String(clip.seconds), '-an',
      '-vf', 'scale=1440:900:flags=lanczos,pad=1920:1080:240:46:color=0x0e2221,setsar=1,fps=30:start_time=0',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', path.join(work, name)]);
    const segment = probe(path.join(work, name)).streams.find(stream => stream.codec_type === 'video');
    assert.equal(Number(segment.nb_frames), Math.round(clip.seconds * 30), 'Cantidad de fotogramas incorrecta: ' + name);
    assert.ok(Math.abs(Number(segment.start_time)) < 0.001, 'El clip debe comenzar en cero: ' + name);
    segmentNames.push(name);
  }
  await writeFile(path.join(work, 'concat.txt'), segmentNames.map(name => `file '${name}'`).join('\n') + '\n');
  const joined = path.join(work, 'joined.mp4');
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(work, 'concat.txt'), '-c', 'copy', joined]);
  const staged = path.join(work, 'voces_demo_godot.mp4');
  const subtitleFilter = `subtitles=${path.join(work, 'captions.ass').replaceAll('\\', '/').replaceAll(':', '\\:')}`;
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', joined, '-vf', subtitleFilter,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', staged]);
  const result = probe(staged), stream = result.streams.find(item => item.codec_type === 'video');
  assert.equal(stream.codec_name, 'h264'); assert.equal(stream.width, 1920); assert.equal(stream.height, 1080);
  assert.equal(stream.pix_fmt, 'yuv420p'); assert.equal(stream.r_frame_rate, '30/1');
  assert.ok(Math.abs(Number(result.format.duration) - edit.duration) <= 0.15, 'Duración codificada distinta');
  validateCues(edit.cues, Number(result.format.duration));
  run(ffmpeg, ['-v', 'error', '-i', staged, '-f', 'null', '-']);
  const frames = [];
  for (const clip of edit.clips) {
    for (const [label, time] of [['inicio', clip.output_in + 0.5], ['medio', clip.output_in + clip.seconds / 2]]) {
      const filename = path.join(work, `review-${String(clip.number).padStart(2, '0')}-${label}.png`);
      run(ffmpeg, ['-v', 'error', '-y', '-ss', String(time), '-i', staged, '-frames:v', '1', filename]);
      frames.push({ ...await fingerprint(filename), time_seconds: time, clip: clip.number });
    }
  }
  for (const [name, time] of [
    ['print-action', edit.clips.find(clip => clip.phase === 'campaign-press').output_in + 5.25],
    ['last-frame', edit.duration - 0.1],
  ]) {
    const filename = path.join(work, `review-${name}.png`);
    run(ffmpeg, ['-v', 'error', '-y', '-ss', String(time), '-i', staged, '-frames:v', '1', filename]);
    frames.push({ ...await fingerprint(filename), time_seconds: time, reason: name });
  }
  const srt = edit.cues.map((cue, i) => `${i + 1}\n${stamp(cue.start)} --> ${stamp(cue.end)}\n${lines(cue.text).join('\n')}\n`).join('\n');
  const transcript = 'VOCES DE LA PLAZA · Equipo Latas · Reto 3\nDemostración automatizada de Godot web. Montaje con cortes identificados, a velocidad real.\nVídeo sin audio ni locución. No representa una partida continua ni una sesión de participantes.\n\n' +
    edit.clips.map(clip => `[${stamp(clip.output_in)} – ${stamp(clip.output_out)}] Corte ${clip.number}: ${clip.phase}\nFuente WEBM: ${clip.source_in.toFixed(3)} – ${clip.source_out.toFixed(3)} segundos.\n${clip.captions.join('\n')}\n`).join('\n');
  await writeFile(path.join(work, 'demo_godot.srt'), srt);
  await writeFile(path.join(work, 'demo_godot_transcripcion.txt'), transcript);
  await verifyInputs(inputs);
  const archive = path.join(work, 'history');
  await mkdir(archive, { recursive: true });
  const preserved = [], outputs = [];
  for (const name of ['voces_demo_godot.mp4', 'demo_godot.srt', 'demo_godot_transcripcion.txt', 'voces_pitch_borrador.mp4', 'pitch_subtitulos.srt', 'pitch_transcripcion.txt']) {
    const destination = path.join(root, 'submission', name);
    try {
      const old = await fingerprint(destination);
      await copyFile(destination, path.join(archive, name));
      assert.equal((await fingerprint(path.join(archive, name))).sha256, old.sha256);
      preserved.push({ ...old, archive: rel(path.join(archive, name)) });
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  await writeFile(path.join(archive, 'manifest.json'), JSON.stringify({ artifacts: preserved }, null, 2) + '\n');
  for (const name of ['voces_demo_godot.mp4', 'demo_godot.srt', 'demo_godot_transcripcion.txt']) {
    await copyFile(path.join(work, name), path.join(root, 'submission', name));
    outputs.push(await fingerprint(path.join(root, 'submission', name)));
  }
  const receipt = { status: 'encoded; visual review pending', revision: 'godot-only-2026-10-31', created_at_utc: new Date().toISOString(),
    encoder_version: run(ffmpeg, ['-version']).split('\n')[0], probe_version: run(ffprobe, ['-version']).split('\n')[0],
    inputs, output: outputs.find(item => item.path.endsWith('.mp4')), outputs, source_video: sourceIdentity, downloaded_pdf: downloadedPdf,
    source_probe: sourceInfo, output_probe: result, duration_seconds: Number(result.format.duration),
    clips: edit.clips, cues: edit.cues.map(cue => ({ ...cue, cps: [...cue.text].length / (cue.end - cue.start) })),
    max_cps: Math.max(...edit.cues.map(cue => [...cue.text].length / (cue.end - cue.start))), review_frames: frames,
    history: rel(path.join(archive, 'manifest.json')), edit_decision_list: rel(path.join(work, 'edit-decision-list.json')),
    method: 'Recortes de una grabación WEBM real del canvas Godot, sin imágenes fijas ni cambios de velocidad; cortes declarados en cada clip.',
    limits: ['Captura automatizada, sin pilotaje.', 'Vídeo sin audio ni locución.', 'No acredita eficacia educativa ni certificación de accesibilidad.'] };
  await writeFile(path.join(review, 'pitch-encoding.json'), JSON.stringify(receipt, null, 2) + '\n');
  await writeFile(path.join(root, 'build/evidence/godot-demo-encoding.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ status: receipt.status, duration_seconds: receipt.duration_seconds, max_cps: receipt.max_cps,
    receipt: rel(path.join(review, 'pitch-encoding.json')), review_frames: frames.length }));
}

if (mode === '--self-test') {
  const plan = defaultPlan(), marks = plan.map((clip, i) => ({ phase: clip.phase, video_seconds: 30 + i * 30, path: `marca-${i}.png` }));
  const edit = resolveEdits(plan, marks, 1000);
  assert.equal(edit.duration, 135); assert.equal(edit.clips.length, 20);
  const elapsedMarks = marks.map(({ video_seconds, ...mark }) => ({ ...mark, elapsed_seconds: video_seconds + 8 }));
  const withHolds = resolveEdits(plan, elapsedMarks, 1000, { page_created_elapsed_seconds: 8,
    holds: elapsedMarks.map(mark => ({ phase: mark.phase, elapsed_seconds: mark.elapsed_seconds, duration_seconds: 4 })) });
  assert.deepEqual(withHolds.clips.map(clip => clip.source_in), edit.clips.map(clip => clip.source_in));
  assert.equal(stamp(65.125), '00:01:05,125'); assert.equal(stamp(65.125, true), '0:01:05.13');
  assert.equal(godotURL('http://127.0.0.1:37333/game/index.html'), true);
  assert.equal(godotURL('http://127.0.0.1:37333/build/web/game/'), true);
  assert.equal(godotURL('http://127.0.0.1:37333/index.html'), false);
  assert.throws(() => resolveEdits(plan, [], 1000), /Falta marca/);
  assert.throws(() => resolveEdits(plan, marks, 1), /fuera del WEBM/);
  assert.throws(() => resolveEdits(plan.map(clip => ({ ...clip, offset_seconds: 5 })), marks, 1000), /marca o su pausa/);
  assert.throws(() => validateCues([{ id: 'rápido', start: 0, end: 1, text: 'x'.repeat(24) }], 135), /23 caracteres/);
  assert.throws(() => validateCues([{ id: 'fuera', start: 140, end: 151, text: 'Fuera' }], 135), /fuera de orden/);
  assert.equal(edit.clips.every(clip => clip.speed === 1 && clip.kind === 'real-godot-video'), true);
  assert.ok(assDocument(edit).includes('MONTAJE CON CORTES'));
  console.log('Autocomprobación correcta: 135 s, 20 cortes, reloj QA/holds, marcas ausentes, límites del WEBM y subtítulos ≤23 cps. No se ha generado vídeo.');
} else if (mode === '--plan') {
  await mkdir(review, { recursive: true });
  const clips = defaultPlan();
  const plan = { status: 'planned; requires real QA capture and document freeze', duration_seconds: clips.reduce((sum, clip) => sum + clip.seconds, 0), clips,
    capture_contract: { recording: { path: 'ruta/al/video.webm', sha256: 'SHA-256 al cerrar contexto', page_created_elapsed_seconds: 'origen en reloj QA',
      holds: [{ phase: 'nombre existente', elapsed_seconds: 'inicio de pausa en reloj QA', duration_seconds: 4 }] },
      screenshots: [{ phase: 'nombre existente', elapsed_seconds: 'reloj QA', path: 'captura autenticada' }],
      alignment: 'Tiempo WEBM = elapsed_seconds - page_created_elapsed_seconds. Pausa estable: +0.2 a +3.7; puede incluirse la caminata/transición real previa.' },
    editorial_rule: 'Velocidad real, cortes visibles. No afirmar recorrido continuo. Ninguna captura fija se presenta como juego grabado.' };
  await writeFile(path.join(review, 'edit-plan.json'), JSON.stringify(plan, null, 2) + '\n');
  console.log('Plan de 135 s y contrato mínimo: ' + rel(path.join(review, 'edit-plan.json')));
} else await encode();
