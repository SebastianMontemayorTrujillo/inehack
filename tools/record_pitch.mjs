// Captioned screen recording of the actual local candidate, not a mockup.
import { chromium } from '../.tools/browser/node_modules/playwright/index.mjs';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessAnswer } from '../web/logic.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const encoder = require('../.tools/browser/node_modules/ffmpeg-static');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8765';
const data = JSON.parse(await readFile(path.join(root, 'game/content/ccpc.json'), 'utf8'));
await mkdir(path.join(root, 'build/pitch-recording'), { recursive: true });
await mkdir(path.join(root, 'submission'), { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || '/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: path.join(root, 'build/pitch-recording'), size: { width: 1280, height: 800 } } });
const page = await context.newPage();
const video = page.video();
const origin = Date.now();
const cues = [];
async function hold(text, duration = 4500) {
  const start = (Date.now() - origin) / 1000;
  cues.push({ text, start, end: start + duration / 1000 });
  await page.waitForTimeout(duration);
}
try {
  await page.goto(`${base}/build/web/game/index.html`);
  await page.locator('#status').waitFor({ state: 'hidden', timeout: 90000 });
  await hold('Voces de la Plaza. Un prototipo para traducir datos CCPC en historias accesibles sobre participación democrática.', 6500);
  await page.keyboard.press('Escape');
  await hold('Villa Brisa es ficticia. Luz, Mateo e Inés nos ayudan a construir una exposición con fuentes y límites.', 6000);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(1000); await page.keyboard.up('ArrowRight');
  await page.mouse.click(110, 721);
  await page.waitForTimeout(300);
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
  await hold('La primera misión distingue registros con marca, sin marca y sin clasificación. La evidencia oficial determina la explicación.', 6000);
  await page.goto(`${base}/build/web/`);
  await page.locator('#data-status').filter({ hasText: 'Archivo CCPC 2024 cargado' }).waitFor();
  await hold('La misma historia se puede recorrer en HTML semántico, con controles de teclado, texto ampliable y tablas.', 6000);
  await page.locator('#reveal-national').click();
  await page.locator('#national-chart').scrollIntoViewIfNeeded();
  await hold('CCPC federal 2024: 59.7% entre registros clasificados. El 6.4% sin clasificación usa otra base: la lista nominal analizada.', 7000);
  for (const [number, quests] of [[1, ['denominator', 'unknown', 'transfer1']], [2, ['more-count', 'higher-rate', 'combined', 'limit', 'transfer2']]]) {
    if (number === 2) {
      await page.locator('#compare-metric').selectOption('rates');
      await page.locator('#compare-chart').scrollIntoViewIfNeeded();
      await hold('Aguascalientes tiene una tasa mayor. Baja California tiene más registros con marca. Comparar requiere explicar ambas bases.', 6500);
    }
    for (const quest of quests) {
      const inputs = await page.locator(`input[name="${quest}"]`).evaluateAll(nodes => nodes.map(node => node.value));
      const answer = inputs.find(value => assessAnswer(quest, value, data).correct);
      if (!answer) throw new Error(`No valid interpretation: ${quest}`);
      await page.locator(`input[name="${quest}"][value="${answer}"]`).check();
      await page.locator(`form:has(input[name="${quest}"]) button[type=submit]`).click();
      const captions = {
        denominator: 'La tasa de participación es SV dividido entre SV más NV. La clasificación desconocida se conserva aparte.',
        unknown: 'NS no significa abstención ni voto nulo. Mostrar lo desconocido también forma parte de una historia veraz.',
        transfer1: 'Un ejemplo sintético nuevo permite revisar la idea sin memorizar las cifras oficiales.',
        'more-count': 'La visualización muestra conteos exactos y también una tabla que se puede leer sin depender del color.',
        'higher-rate': 'Un número mayor de registros no implica un porcentaje mayor. Cada tasa tiene su propio denominador.',
        combined: 'Las dos entidades juntas tienen una tasa de 50.12%. Primero sumamos los conteos y después dividimos.',
        limit: 'Los agregados no revelan motivos individuales ni permiten juzgar el valor cívico de una comunidad.',
        transfer2: 'Las pistas, explicaciones y reintentos permiten avanzar. La ayuda se registra por separado de la finalización.',
      };
      await hold(captions[quest], 4500);
    }
    await page.locator(`#complete-${number}`).click();
    await page.locator(`[data-next="${number + 1}"]`).click();
  }
  await page.locator('#ballot').scrollIntoViewIfNeeded();
  await hold('La consulta final es ficticia. Sus preferencias nunca se deducen del CCPC. Las reglas son visibles antes de decidir.', 6000);
  await page.locator('#ballot input[value=decline]').check();
  await page.locator('#ballot button[type=submit]').click();
  await hold('Elegir un proyecto, dejar sin marcar o no participar permite completar la historia con el mismo reconocimiento.', 5500);
  await page.locator('#reflection-form input[value=budget]').check();
  await page.locator('#reflection-form button[type=submit]').click();
  await page.locator('#ending').scrollIntoViewIfNeeded();
  await hold('Participar también invita a preguntar qué se hizo con los recursos y qué necesidades siguen pendientes.', 6000);
  await hold('El prototipo incluye fuentes, respaldo Linux y arte original. La evaluación con personas usuarias y los efectos de aprendizaje están pendientes.', 6500);
  await hold('Demostración automatizada del prototipo. Fuente: INE, CCPC 2024. Revisión del equipo y publicación autorizada pendientes.', 5500);
} finally {
  await context.close();
  await browser.close();
}
const source = await video.path();
const stamp = seconds => {
  const milliseconds = Math.round(seconds * 1000);
  return `${String(Math.floor(milliseconds / 3600000)).padStart(2, '0')}:${String(Math.floor(milliseconds / 60000) % 60).padStart(2, '0')}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')},${String(milliseconds % 1000).padStart(3, '0')}`;
};
const subtitles = path.join(root, 'submission/pitch_subtitulos.srt');
await writeFile(subtitles, cues.map((cue, i) => `${i + 1}\n${stamp(cue.start)} --> ${stamp(cue.end)}\n${cue.text}\n`).join('\n'));
await writeFile(path.join(root, 'submission/pitch_transcripcion.txt'), cues.map(cue => cue.text).join('\n\n') + '\n');
const output = path.join(root, 'submission/voces_pitch_borrador.mp4');
const result = spawnSync(encoder, ['-y', '-i', source, '-vf', `scale=1920:880:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:0:color=0x0e2221,subtitles=${subtitles}:force_style='FontSize=14,Outline=1,MarginV=10'`, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', '-an', output], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
if (result.status !== 0) throw new Error(result.stderr);
await writeFile(path.join(root, 'build/evidence/pitch-encoding.log'), result.stderr);
console.log(`Generated ${output}; recorded caption timeline ends at ${cues.at(-1).end.toFixed(1)} seconds.`);
