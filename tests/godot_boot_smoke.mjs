// Arranque real del export Godot y comprobación de su envoltorio de publicación.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { chromium } from '../.tools/browser/node_modules/playwright/index.mjs';

const root = process.env.CANDIDATE_ROOT ? resolve(process.env.CANDIDATE_ROOT) : dirname(dirname(fileURLToPath(import.meta.url)));
const evidence = resolve(process.env.EVIDENCE_DIR || join(root, 'build/evidence'));
const base = new URL(process.env.WEB_ROOT || '/', process.env.PREVIEW_URL || 'http://127.0.0.1:8765');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const errors = [];
const warnings = [];
const failures = [];
const report = { status: 'en curso', url: base.href, errors, warnings, request_failures: failures,
  scope: 'Arranque real de Godot, export en español, MIME y ausencia de la ruta retirada; no reemplaza el recorrido completo.' };
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || '/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
  headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
try {
  report.browser = browser.version();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
  for (const [path, type] of [['game/index.wasm', 'application/wasm'], ['game/index.pck', 'application/octet-stream'], ['game/index.js', 'javascript']]) {
    const response = await context.request.head(new URL(path, base).href);
    assert.equal(response.status(), 200, path);
    assert.ok(response.headers()['content-type'].includes(type), `MIME de ${path}`);
  }
  for (const path of ['app.mjs', 'content/story.json', 'classroom.html', 'archivo-inexistente.wasm']) {
    assert.equal((await context.request.get(new URL(path, base).href)).status(), 404, `No debe existir ${path}`);
  }
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); else if (message.type() === 'warning') warnings.push(message.text()); });
  page.on('requestfailed', request => failures.push({ url: request.url(), error: request.failure()?.errorText }));
  const responses = [];
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
    if (response.url() === new URL('game/index.pck', base).href) responses.push(response.body().then(bytes => { report.served_pack_sha256 = sha(bytes); }));
  });
  await page.goto(base.href, { waitUntil: 'domcontentloaded' });
  await page.waitForURL(new URL('game/index.html', base).href);
  assert.equal(await page.locator('html').getAttribute('lang'), 'es');
  await page.locator('#status').waitFor({ state: 'hidden', timeout: 90000 });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const picture = await page.screenshot();
  await writeFile(join(evidence, 'godot-only-plaza.png'), picture);
  const pixels = spawnSync('python3', ['-c',
    'import io,json,sys; from PIL import Image; from tests.native_window_smoke import avatar_position; im=Image.open(io.BytesIO(sys.stdin.buffer.read())).convert("RGB"); print(json.dumps({"avatar":avatar_position(im),"size":im.size}))'],
    { cwd: dirname(dirname(fileURLToPath(import.meta.url))), input: picture, maxBuffer: 1024 * 1024 });
  assert.equal(pixels.status, 0, pixels.stderr?.toString());
  report.world = JSON.parse(pixels.stdout);
  assert.deepEqual(report.world.size, [1280, 800]);
  assert.ok(report.world.avatar && report.world.avatar.every((value, index) => Math.abs(value - [240, 176][index]) < 1), 'Godot debe dibujar la plaza con la persona jugadora');
  await Promise.all(responses);
  assert.equal(report.served_pack_sha256, sha(await readFile(join(root, 'build/web/game/index.pck'))));
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  report.status = 'passed';
  report.lang = 'es';
  report.retired_route = 'ausente';
  report.mime = 'correcto';
} catch (error) {
  report.status = 'failed'; report.error = error.message; throw error;
} finally {
  await browser.close();
  await writeFile(join(evidence, 'godot-only-boot.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log('Arranque Godot aprobado: plaza real, español, recursos correctos y ruta alternativa ausente.');
