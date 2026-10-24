import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateRecords, validateDataset, loadDataset, assessAnswer,
  SCENARIOS, createRoster, resolveConsultation, resolveTally,
  sanitizeProgress, readProgress, writeProgress, gameHref, creditsHref, normalizeStory,
  contentPaths, transferExercises,
} from '../web/logic.mjs';

// Deliberately synthetic: never presented as official CCPC observations.
function fixture() {
  const record = (id, geography_name, sv, nv, ns) => ({
    id, geography_name, year: 2024, ln: sv + nv + ns, sv, nv, ns,
    participation_pct: sv + nv ? 100 * sv / (sv + nv) : null,
    unknown_pct: sv + nv + ns ? 100 * ns / (sv + nv + ns) : null,
  });
  return {
    schema_version: '1.0.0', dataset_id: 'ccpc-2024-v1',
    source: { url: 'https://example.org/source.zip', portal_url: 'https://example.org/portal',
      retrieved_at_utc: '2026-10-24T12:00:00Z', sha256: 'a'.repeat(64), dictionary_path: 'dictionary.md' },
    records: [record('national', 'Nacional', 60, 30, 10),
      record('state_01', 'Aguascalientes', 60, 40, 5), record('state_02', 'Baja California', 120, 180, 10)],
    validation: { reconciliation_passed: true },
  };
}

test('participation excludes NS; unknown share uses LN; aggregate sums before dividing', () => {
  const data = fixture();
  const national = aggregateRecords([data.records[0]]);
  assert.equal(national.classified, 90);
  assert.equal(national.participation_pct, 100 * 60 / 90);
  assert.equal(national.unknown_pct, 10);
  const both = aggregateRecords(data.records.slice(1));
  assert.equal(both.participation_pct, 45);
  assert.notEqual(both.participation_pct, 50);
});

test('zero denominators remain null rather than inventing zero rates', () => {
  assert.equal(aggregateRecords([{ ln: 5, sv: 0, nv: 0, ns: 5 }]).participation_pct, null);
  assert.equal(aggregateRecords([{ ln: 0, sv: 0, nv: 0, ns: 0 }]).unknown_pct, null);
});

test('runtime contract rejects inconsistent, duplicate, unsafe, wrong-year and unsupported records', () => {
  assert.equal(validateDataset(fixture()).records.length, 3);
  for (const mutate of [
    d => { d.records[0].ln++; }, d => { d.records[0].sv = -1; },
    d => { d.records[0].year = 2025; }, d => { d.records[0].participation_pct = 10; },
    d => { d.records[1].id = 'national'; }, d => { d.source.url = 'javascript:alert(1)'; },
    d => { d.source.sha256 = 'unverified'; }, d => { d.records[0].ns = NaN; },
    d => { d.records.pop(); }, d => { d.dataset_id = 'other'; },
    d => { d.records[0].sv = Number.MAX_SAFE_INTEGER + 1; },
    d => { d.source.dictionary_path = ''; },
  ]) {
    const data = fixture(); mutate(data);
    assert.throws(() => validateDataset(data));
  }
});

test('accepts the full 33-record bundle while requiring national and the two quest states', () => {
  const data = fixture();
  for (let n = 3; n <= 32; n++) data.records.push({ ...data.records[1], id: `state_${String(n).padStart(2, '0')}` });
  assert.equal(validateDataset(data).records.length, 33);
  data.records[32].id = 'state_99';
  assert.throws(() => validateDataset(data));
});

test('loading uses shared source first and exported content fallback, validates either', async () => {
  const paths = [];
  const data = await loadDataset(async path => {
    paths.push(path);
    return { ok: paths.length > 1, json: async () => fixture() };
  });
  assert.deepEqual(paths, ['../game/content/ccpc.json', './content/ccpc.json']);
  assert.equal(data.dataset_id, 'ccpc-2024-v1');
  const invalid = fixture(); invalid.records[0].ln++;
  await assert.rejects(() => loadDataset(async () => ({ ok: true, json: async () => invalid })), /datos verificados/i);
  await assert.rejects(() => loadDataset(async () => { throw Error('offline'); }), /reintentar/i);
});

test('browser content paths select source only for /web/ and package content everywhere else', async () => {
  for (const file of ['ccpc.json', 'story.json']) {
    for (const path of ['/web/', '/web/index.html']) assert.deepEqual(contentPaths(file, path), [`../game/content/${file}`]);
    for (const path of ['/build/web/', '/build/web/index.html', '/', '/index.html', '/voces/index.html']) {
      assert.deepEqual(contentPaths(file, path), [`./content/${file}`]);
    }
  }
  const paths = [];
  await loadDataset(async path => { paths.push(path); return { ok: true, json: async () => fixture() }; }, '/build/web/');
  assert.deepEqual(paths, ['./content/ccpc.json']);
  const missing = [];
  await assert.rejects(() => loadDataset(async path => { missing.push(path); return { ok: false }; }, '/build/web/'));
  assert.deepEqual(missing, ['./content/ccpc.json']);
});

test('quest explanations and count/rate answers respond to changed shared records', () => {
  const data = fixture();
  assert.equal(assessAnswer('denominator', 'classified', data).correct, true);
  assert.equal(assessAnswer('denominator', 'ln', data).correct, false);
  assert.match(assessAnswer('unknown', 'nv', data).message, /clasificaci/i);
  assert.equal(assessAnswer('more-count', 'state_02', data).correct, true);
  assert.equal(assessAnswer('higher-rate', 'state_01', data).correct, true);
  assert.equal(assessAnswer('combined', 'sum-first', data).correct, true);
  assert.equal(assessAnswer('combined', 'average', data).correct, false);
  data.records[1] = { ...data.records[1], sv: 240, nv: 160, ln: 405 };
  assert.equal(assessAnswer('more-count', 'state_01', data).correct, true);
  assert.equal(assessAnswer('higher-rate', 'state_01', data).correct, true);
  assert.equal(assessAnswer('transfer1', '66.67', data).correct, true);
  assert.equal(assessAnswer('transfer2', '33.33', data).correct, true);
  assert.equal(assessAnswer('limit', 'motives', data).correct, false);
});

test('transfer cases match Godot: classified 60/90 and combined 80/240, not a mean of rates', () => {
  const exercises = transferExercises();
  assert.match(exercises.transfer1.question, /SV = 60, NV = 30, NS = 10 y LN = 100/);
  assert.equal(exercises.transfer1.correctAnswer, '66.67');
  assert.match(exercises.transfer2.question, /SV = 20 y NV = 20/);
  assert.match(exercises.transfer2.question, /SV = 60 y NV = 140/);
  assert.equal(exercises.transfer2.correctAnswer, '33.33');
  assert.equal(assessAnswer('transfer1', '60', fixture()).correct, false);
  assert.equal(assessAnswer('transfer2', '40', fixture()).correct, false);
  assert.match(assessAnswer('transfer2', '33.33', fixture()).message, /80 ÷ 240/);
});

test('optional shared assessment fixtures drive both prompts and accepted answers', () => {
  const assessments = {
    printing: { ln: 25, sv: 12, nv: 8, ns: 5 },
    comparison: [{ ln: 100, sv: 60, nv: 40, ns: 0 }, { ln: 300, sv: 120, nv: 180, ns: 0 }],
  };
  const exercises = transferExercises(assessments);
  assert.equal(exercises.transfer1.correctAnswer, '60');
  assert.equal(exercises.transfer2.correctAnswer, '45');
  assert.equal(assessAnswer('transfer2', '45', fixture(), assessments).correct, true);
  assert.equal(assessAnswer('transfer2', '33.33', fixture(), assessments).correct, false);
  assert.deepEqual(normalizeStory({ schema_version: '1.0.0', assessment_fixtures: assessments }).assessmentFixtures, assessments);
  assert.equal(transferExercises({ printing: { sv: -1 } }).transfer1.correctAnswer, '66.67');
});

test('equal and missing state rates have honest supported answers', () => {
  const data = fixture();
  data.records[2] = { ...data.records[2], sv: 180, nv: 120, ln: 310 };
  assert.equal(assessAnswer('higher-rate', 'equal', data).correct, true);
  data.records[2] = { ...data.records[2], sv: 0, nv: 0, ln: 10 };
  assert.equal(assessAnswer('higher-rate', 'unavailable', data).correct, true);
  assert.equal(assessAnswer('not-a-quest', 'anything', data).correct, false);
});

test('synthetic scenarios use the same deterministic roster of 30 with A12/B10/C8 preferences', () => {
  const roster = createRoster();
  assert.equal(roster.length, 30);
  assert.deepEqual(['A', 'B', 'C'].map(option => roster.filter(n => n.preference === option).length), [12, 10, 8]);
  assert.equal(new Set(roster.map(n => n.id)).size, 30);
  assert.deepEqual(createRoster(), roster);
  assert.deepEqual(Object.values(SCENARIOS).map(s => Object.values(s).reduce((a, b) => a + b)), [16, 25, 25]);
});

test('31st participant may choose any option, leave unmarked or decline without changing NPCs', () => {
  for (const scenario of Object.keys(SCENARIOS)) {
    for (const choice of ['A', 'B', 'C', 'unmarked', 'decline']) {
      const result = resolveConsultation(choice, scenario);
      const base = SCENARIOS[scenario];
      assert.equal(result.population, 31);
      assert.equal(result.participants, Object.values(base).reduce((a, b) => a + b) + (choice === 'decline' ? 0 : 1));
      for (const option of ['A', 'B', 'C']) assert.equal(result.counts[option], base[option] + (choice === option ? 1 : 0));
      assert.equal(result.unmarked, choice === 'unmarked' ? 1 : 0);
      assert.deepEqual(result, resolveConsultation(choice, scenario));
    }
  }
  assert.equal(resolveConsultation('decline', 'base').winner, 'A');
  assert.equal(resolveConsultation('decline', 'more-a').winner, 'A');
  assert.equal(resolveConsultation('decline', 'more-b').winner, 'B');
  assert.throws(() => resolveConsultation('invalid'));
  assert.throws(() => resolveConsultation('A', 'random'));
});

test('ties trigger a second decision rather than automatically favoring A', () => {
  assert.deepEqual(resolveTally({ A: 8, B: 8, C: 3 }), { winner: null, tied: ['A', 'B'], needsSecondDecision: true });
  assert.deepEqual(resolveTally({ A: 0, B: 0, C: 0 }).tied, ['A', 'B', 'C']);
});

test('persistence whitelists chapter completion, settings and hints only, never ballot or revealing outcome', () => {
  const progress = sanitizeProgress({
    version: 1, completedChapters: [1, 1, 3, 9], settings: { textSize: 'large', reducedMotion: true, vote: 'B' },
    hints: ['denominator', 'denominator', 'vote:B'], vote: 'B', outcome: { A: 8, B: 6, C: 3 },
    reflection: 'private', attempts: { B: 1 },
  });
  assert.deepEqual(progress, { version: 1, completedChapters: [1, 3], settings: { textSize: 'large', reducedMotion: true }, hints: ['denominator'] });
  let saved;
  const storage = { setItem: (key, value) => { saved = value; }, getItem: () => saved };
  assert.equal(writeProgress(storage, { ...progress, vote: 'B', outcome: 'B' }), true);
  assert.deepEqual(readProgress(storage), progress);
  assert.equal(saved.includes('outcome'), false);
  assert.equal(saved.includes('vote'), false);
});

test('unavailable, malformed, or old localStorage fails gracefully', () => {
  const unavailable = { getItem() { throw Error('blocked'); }, setItem() { throw Error('quota'); } };
  assert.deepEqual(readProgress(unavailable).completedChapters, []);
  assert.equal(writeProgress(unavailable, {}), false);
  assert.deepEqual(readProgress({ getItem: () => '{broken' }).completedChapters, []);
  assert.deepEqual(readProgress({ getItem: () => JSON.stringify({ version: 0, completedChapters: [1] }) }).completedChapters, []);
  assert.deepEqual(readProgress(null).completedChapters, []);
});

test('Godot link supports the source checkout and packages hosted at root or a subpath', () => {
  assert.equal(gameHref('/web/index.html'), '../build/web/game/index.html');
  assert.equal(gameHref('/web/'), '../build/web/game/index.html');
  assert.equal(gameHref('/build/web/index.html'), './game/index.html');
  assert.equal(gameHref('/index.html'), './game/index.html');
  assert.equal(gameHref('/voces/index.html'), './game/index.html');
  for (const path of ['/web/', '/web/index.html']) assert.equal(creditsHref(path), '../game/THIRD_PARTY_NOTICES.txt');
  for (const path of ['/build/web/', '/build/web/index.html', '/', '/index.html', '/voces/index.html']) {
    assert.equal(creditsHref(path), './licenses/THIRD_PARTY_NOTICES.txt');
  }
});

test('canonical shared story IDs and nested project prose normalize without making content mandatory', () => {
  const story = normalizeStory({ schema_version: '1.0.0', title: 'Voces',
    chapters: [{ id: 'printing', title: 'Archivo', npc: 'Luz', reflection: 'Revisemos la fuente.' },
      { id: 'comparison', question: '¿Qué comparamos?' }, { id: 'consultation', intro: 'Una decisión ficticia.' },
      { id: 'other', title: 'Invalid' }],
    consultation: { projects: [{ id: 'A', name: 'Sombra', benefit: 'Descansar', tradeoff: 'Mantenimiento' }] },
  });
  assert.deepEqual(story.chapters.map(ch => ch.id), [1, 2, 3]);
  assert.equal(story.chapters[0].npc, 'Luz');
  assert.deepEqual(story.projects[0], { id: 'A', title: 'Sombra', description: 'Descansar', tradeoff: 'Mantenimiento' });
  assert.equal(normalizeStory({ schema_version: '2.0.0' }), null);
  assert.equal(normalizeStory(null), null);
  assert.equal(normalizeStory({ schema_version: '1.0.0', chapters: [{ id: 1, title: '' }] }).chapters[0].title, undefined);
});
