import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createCampaignPDF } from '../web/campaign-pdf.mjs';

const loadResource = async name => JSON.parse(await readFile(new URL(`../game/content/${name}`, import.meta.url), 'utf8'));
const data = await loadResource('ccpc.json');
const story = await loadResource('story.json');
const selection = { first: 'state_01', second: 'state_02', metric: 'count', question: 'voices' };
const create = (bundle = data, chosen = selection, copy = story) => createCampaignPDF(bundle, copy, chosen, { loadResource });
function inspect(bytes) {
  const result = spawnSync('python3', ['tests/inspect_campaign_pdf.py'], { input: bytes, maxBuffer: 1e7 });
  assert.equal(result.status, 0, result.stderr?.toString());
  assert.equal(result.stderr.toString(), '', 'No parser repairs/warnings');
  return JSON.parse(result.stdout);
}
function changed(first, second) {
  const bundle = structuredClone(data);
  for (const [id, counts] of [['state_01', first], ['state_02', second]]) {
    if (!counts) continue;
    const record = bundle.records.find(item => item.id === id);
    Object.assign(record, counts);
    record.ln = record.sv + record.nv + record.ns;
    record.participation_pct = record.sv + record.nv ? 100 * record.sv / (record.sv + record.nv) : null;
    record.unknown_pct = record.ln ? 100 * record.ns / record.ln : null;
  }
  return bundle;
}

test('Carta vector PDF embeds both fonts, Spanish text and official link; bytes repeat', async () => {
  const bytes = await create();
  assert.ok(bytes instanceof Uint8Array);
  assert.deepEqual(bytes, await create());
  const pdf = inspect(bytes);
  assert.equal(pdf.fonts.length, 2);
  for (const text of ['Tu voto cuenta. Infórmate y participa.', 'Campaña ciudadana · Material educativo',
    'Más registros: BAJA CALIFORNIA.', '¿Cómo escuchamos a quienes todavía no han hablado?', '2024', 'SV + NV', 'NS']) {
    assert.ok(pdf.text.includes(text), text);
  }
  for (const record of data.records.slice(1, 3)) {
    for (const value of [record.sv, record.nv, record.ns, record.sv + record.nv]) {
      assert.ok(pdf.text.includes(value.toLocaleString('en-US')), `exact value ${value}`);
    }
  }
  assert.deepEqual(pdf.links, [data.source.portal_url]);
  assert.doesNotMatch(pdf.text, /Latas|INEhack|boleta|votos ficticios/i);
  const bars = pdf.rectangles.filter(([, , , height]) => height === 12);
  const a = BigInt(data.records[1].sv), b = BigInt(data.records[2].sv);
  const expectedWidth = Number((5400000n * a + b / 2n) / b) / 10000;
  assert.deepEqual(bars.map(([, , width]) => width), [540, expectedWidth, 540, 540], 'Exact count geometry on a common scale');
});

test('a two-line official URL stays readable above the Carta bottom margin', async () => {
  const bundle = structuredClone(data);
  bundle.source.portal_url += '?consulta=' + 'a'.repeat(55);
  const pdf = inspect(await create(bundle));
  assert.deepEqual(pdf.links, [bundle.source.portal_url]);
  assert.ok(pdf.text.replace(/\s/g, '').includes(bundle.source.portal_url), 'The entire address remains printed');
});

test('pink citizen hierarchy keeps all evidence at a readable print size', async () => {
  const pdf = inspect(await create());
  const palette = ['B41476', 'FFFFFF', '242124', 'FBEAF3'].map(hex =>
    hex.match(/../g).map(value => Math.round(parseInt(value, 16) / 255 * 10000) / 10000));
  for (const color of palette) assert.ok(pdf.colors.some(value => JSON.stringify(value) === JSON.stringify(color)), `Uses ${color}`);
  assert.ok(pdf.colors.every(color => palette.some(value => JSON.stringify(value) === JSON.stringify(color))), 'Only the approved palette');
  assert.ok(Math.min(...pdf.font_sizes) >= 10.5, 'Sources and counts stay at least 10.5 pt');
  assert.ok(Math.max(...pdf.font_sizes) >= 36, 'The civic invitation is the first visual read');
  assert.ok(pdf.text.indexOf('Tu voto cuenta.') < pdf.text.indexOf('Más registros:'), 'Invitation precedes finding');
  for (const phrase of ['SV: con participación', 'NV: sin participación', 'NS: sin información',
    'clasificación desconocida', 'no se suma a NV', 'Límite:', data.source.portal_url]) {
    assert.ok(pdf.text.includes(phrase), phrase);
  }
});

test('rate uses exact bases, two decimal places and exact fraction comparison', async () => {
  const near = changed({ sv: 1000000000, nv: 1000000001, ns: 3 }, { sv: 1000000001, nv: 1000000002, ns: 4 });
  const pdf = inspect(await create(near, { ...selection, metric: 'rate' }));
  assert.ok(pdf.text.includes('Mayor proporción: BAJA CALIFORNIA.'));
  assert.equal(pdf.text.match(/50\.00 %/g)?.length, 2, 'Display ties do not change the exact finding');
  assert.ok(pdf.text.includes('Porcentajes redondeados a dos decimales'));
  assert.ok(pdf.text.includes('2,000,000,001'));
  assert.ok(pdf.text.includes('Misma escala: 0 a 100%.'));
});

test('unavailable rates omit their bars; zero counts remain valid; ties stay neutral', async () => {
  const none = changed({ sv: 0, nv: 0, ns: 12 }, { sv: 0, nv: 0, ns: 20 });
  const rate = inspect(await create(none, { ...selection, metric: 'rate' }));
  assert.ok(rate.text.includes('Falta información para comparar proporciones.'));
  assert.equal(rate.text.match(/Sin datos clasificables/g)?.length, 2);
  assert.ok(!rate.rectangles.some(([, , , height]) => height === 12), 'No missing rates presented as bars');
  const count = inspect(await create(none));
  assert.ok(count.text.includes('Hay la misma cantidad de registros.'));
  assert.ok(!count.text.includes('NaN'));
});

test('invalid selection, missing story and inconsistent data fail without a partial PDF', async () => {
  for (const value of [null, {}, { ...selection, first: selection.second }, { ...selection, metric: 'ballot' },
    { ...selection, question: 'invalid' }, { ...selection, first: 'national' }]) {
    await assert.rejects(create(data, value));
  }
  await assert.rejects(create(data, selection, {}));
  const invalid = structuredClone(data); invalid.records[1].sv = -1;
  await assert.rejects(create(invalid));
});

test('every bundled state fits in both measures without changing the canonical inputs', async () => {
  const before = JSON.stringify({ data, story });
  for (const record of data.records.filter(record => record.id !== 'national')) {
    for (const metric of ['count', 'rate']) {
      const bytes = await create(data, { ...selection, first: record.id, second: record.id === 'state_01' ? 'state_02' : 'state_01', metric });
      assert.ok(bytes.length > 10000, `${record.id} ${metric}`);
    }
  }
  assert.equal(JSON.stringify({ data, story }), before);
});

test('exact half-up decimal rounding handles carries without altering the underlying counts', async () => {
  const fixture = changed({ sv: 19999, nv: 1, ns: 0 }, { sv: 1, nv: 31, ns: 0 });
  const pdf = inspect(await create(fixture, { ...selection, metric: 'rate' }));
  assert.ok(pdf.text.includes('100.00 %'));
  assert.ok(pdf.text.includes('3.13 %'));
  assert.ok(pdf.text.includes('19,999'));
  assert.ok(pdf.text.includes('20,000'));
});

test('PDF delimiters in text remain text; unsupported glyphs and overflow reject safely', async () => {
  const copy = structuredClone(story);
  copy.poster_workshop.questions[1].text = '¿Qué significa (SV + NV) / NS? \\ <texto> & [datos]';
  const pdf = inspect(await create(data, selection, copy));
  assert.ok(pdf.text.includes(copy.poster_workshop.questions[1].text));
  copy.poster_workshop.questions[1].text = 'No hay glifo: 🗳';
  await assert.rejects(create(data, selection, copy), /tipo de letra/);
  copy.poster_workshop.questions[1].text = 'Texto largo '.repeat(100);
  await assert.rejects(create(data, selection, copy), /no cabe/);
});
