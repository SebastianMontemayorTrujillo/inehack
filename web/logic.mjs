// Shared, DOM-free rules. Official observations enter only through ccpc.json.
export function aggregateRecords(records) {
  const totals = records.reduce((sum, record) => {
    for (const key of ['ln', 'sv', 'nv', 'ns']) sum[key] += record[key];
    return sum;
  }, { ln: 0, sv: 0, nv: 0, ns: 0 });
  const classified = totals.sv + totals.nv;
  return { ...totals, classified,
    participation_pct: classified ? 100 * totals.sv / classified : null,
    unknown_pct: totals.ln ? 100 * totals.ns / totals.ln : null };
}

export function validateDataset(data) {
  const invalid = () => { throw new Error('El archivo de datos no cumple el contrato CCPC 2024.'); };
  if (!data || data.schema_version !== '1.0.0' || data.dataset_id !== 'ccpc-2024-v1') invalid();
  if (!Array.isArray(data.records) || data.records.length < 3 || !data.validation || typeof data.validation !== 'object') invalid();
  const source = data.source;
  if (!source || !/^[a-f\d]{64}$/i.test(source.sha256) || !Number.isFinite(Date.parse(source.retrieved_at_utc)) ||
      typeof source.dictionary_path !== 'string' || !source.dictionary_path.trim()) invalid();
  for (const key of ['url', 'portal_url']) {
    try { if (new URL(source[key]).protocol !== 'https:') invalid(); } catch { invalid(); }
  }
  const ids = new Set();
  for (const record of data.records) {
    if (!(record.id === 'national' || /^state_(0[1-9]|[12]\d|3[0-2])$/.test(record.id)) || ids.has(record.id) || record.year !== 2024 ||
        typeof record.geography_name !== 'string' || !record.geography_name.trim()) invalid();
    ids.add(record.id);
    for (const key of ['ln', 'sv', 'nv', 'ns']) if (!Number.isSafeInteger(record[key]) || record[key] < 0) invalid();
    if (record.ln !== record.sv + record.nv + record.ns) invalid();
    const calculated = aggregateRecords([record]);
    for (const key of ['participation_pct', 'unknown_pct']) {
      if (calculated[key] === null ? record[key] !== null :
        typeof record[key] !== 'number' || !Number.isFinite(record[key]) || Math.abs(record[key] - calculated[key]) > 0.051) invalid();
    }
  }
  if (!['national', 'state_01', 'state_02'].every(id => ids.has(id))) invalid();
  return data;
}

export function contentPaths(filename, pathname = globalThis.location?.pathname) {
  // Node callers without a location retain the injectable fallback for fixtures.
  if (pathname === undefined) return [`../game/content/${filename}`, `./content/${filename}`];
  return [/^\/web\/(?:index\.html)?$/.test(pathname) ? `../game/content/${filename}` : `./content/${filename}`];
}

export async function loadDataset(fetcher = fetch, pathname = globalThis.location?.pathname) {
  for (const path of contentPaths('ccpc.json', pathname)) {
    try {
      const response = await fetcher(path, { cache: 'no-cache' });
      if (response.ok) return validateDataset(await response.json());
    } catch { /* Try the packaged snapshot, without substituting synthetic observations. */ }
  }
  throw new Error('No pudimos cargar los datos verificados. Revisa que el paquete incluya ccpc.json y vuelve a reintentar. No se muestran cifras sustitutas.');
}

const DEFAULT_ASSESSMENTS = {
  printing: { ln: 100, sv: 60, nv: 30, ns: 10 },
  comparison: [{ ln: 40, sv: 20, nv: 20, ns: 0 }, { ln: 200, sv: 60, nv: 140, ns: 0 }],
};

function normalizeAssessments(value) {
  const record = input => {
    if (!input || typeof input !== 'object') return null;
    const { sv, nv, ns = 0 } = input;
    const ln = input.ln ?? sv + nv + ns;
    return [sv, nv, ns, ln].every(n => Number.isSafeInteger(n) && n >= 0) && ln === sv + nv + ns && sv + nv > 0
      ? { ln, sv, nv, ns } : null;
  };
  const printing = record(value?.printing) || { ...DEFAULT_ASSESSMENTS.printing };
  const comparison = Array.isArray(value?.comparison) && value.comparison.length === 2 ? value.comparison.map(record) : [];
  return { printing, comparison: comparison.length === 2 && comparison.every(Boolean)
    ? comparison : DEFAULT_ASSESSMENTS.comparison.map(item => ({ ...item })) };
}

export function transferExercises(assessmentFixtures) {
  const { printing, comparison } = normalizeAssessments(assessmentFixtures);
  const key = rate => String(Number(rate.toFixed(2)));
  const classified = printing.sv + printing.nv;
  const printingAnswer = key(100 * printing.sv / classified);
  const [a, b] = comparison;
  const total = aggregateRecords(comparison);
  const combinedAnswer = key(total.participation_pct);
  const aRate = aggregateRecords([a]).participation_pct;
  const bRate = aggregateRecords([b]).participation_pct;
  const unique = options => options.filter(([value], i) => options.findIndex(([other]) => value === other) === i);
  return {
    transfer1: {
      question: `Ejemplo inventado: SV = ${printing.sv}, NV = ${printing.nv}, NS = ${printing.ns} y LN = ${printing.ln}. ¿Cuál es la tasa de participación entre los registros clasificados?`,
      options: unique([[key(100 * printing.sv / printing.ln), `${key(100 * printing.sv / printing.ln)} % · ${printing.sv} de ${printing.ln} (LN)`],
        [printingAnswer, `${printingAnswer} % · ${printing.sv} de ${classified} (SV + NV)`],
        [key(100 * classified / printing.ln), `${key(100 * classified / printing.ln)} % · ${classified} de ${printing.ln}`]]),
      correctAnswer: printingAnswer,
      hint: `Suma ${printing.sv} + ${printing.nv} = ${classified}. Después calcula ${printing.sv} ÷ ${classified} × 100. Los ${printing.ns} NS no entran en esa base.`,
      explanation: `En este ejemplo inventado, ${printing.sv} ÷ ${classified} × 100 = ${printingAnswer} %. Los ${printing.ns} registros NS siguen separados.`,
    },
    transfer2: {
      question: `Ejemplo inventado: Lugar A tiene SV = ${a.sv} y NV = ${a.nv}; Lugar B tiene SV = ${b.sv} y NV = ${b.nv}. Al reunirlos, ¿qué tasa de participación se obtiene?`,
      options: unique([[key((aRate + bRate) / 2), `${key((aRate + bRate) / 2)} % · Promedio de ${key(aRate)} % y ${key(bRate)} %`],
        [combinedAnswer, `${combinedAnswer} % · ${total.sv} ÷ ${total.classified} × 100`]]),
      correctAnswer: combinedAnswer,
      hint: `Suma las marcas SV: ${a.sv} + ${b.sv} = ${total.sv}. Suma los clasificados: ${a.sv + a.nv} + ${b.sv + b.nv} = ${total.classified}. Después divide.`,
      explanation: `En el ejemplo inventado, ${total.sv} ÷ ${total.classified} × 100 = ${combinedAnswer} %. Sumamos conteos antes de dividir, sin promediar las tasas de ${key(aRate)} % y ${key(bRate)} %.`,
    },
  };
}

export function assessAnswer(quest, answer, data, assessmentFixtures) {
  const states = ['state_01', 'state_02'].map(id => data.records.find(record => record.id === id));
  const transfers = transferExercises(assessmentFixtures);
  const rules = {
    denominator: ['classified', 'La participación se calcula como 100 × SV ÷ (SV + NV). NS queda fuera de ese denominador porque no conocemos su clasificación.'],
    unknown: ['separate', 'NS significa participación sin especificar: su clasificación es desconocida. No podemos sumarlo a NV ni interpretarlo como votos nulos; su proporción es 100 × NS ÷ LN.'],
    'more-count': [compareRecord(...states, 'count'), 'Compara los registros SV, sin dividir. Un conteo mayor no implica una proporción mayor.'],
    'higher-rate': [compareRecord(...states, 'rate'), 'Compara 100 × SV ÷ (SV + NV) en cada lugar. La base de cada tasa es su propio total clasificado. Si falta una tasa, no podemos ordenar ambas.'],
    combined: ['sum-first', 'Primero suma SV de ambos lugares; después divide entre la suma de sus SV + NV. El promedio simple de tasas da el mismo peso a bases de distinto tamaño.'],
    limit: ['no-motives', 'El dato muestra registros y proporciones de 2024. No revela motivos individuales ni permite juzgar el valor cívico de una comunidad.'],
    transfer1: [transfers.transfer1.correctAnswer, transfers.transfer1.explanation],
    transfer2: [transfers.transfer2.correctAnswer, transfers.transfer2.explanation],
  };
  const rule = rules[quest];
  if (!rule) return { correct: false, message: 'Elige una interpretación de esta pregunta.' };
  const correct = answer === rule[0];
  return { correct, message: `${correct ? 'Bien observado.' : 'Volvamos a mirar.'} ${rule[1]}` };
}

// Only these named rules run. Authored prompts/choices/feedback stay in story.json.
const ACTIVITY_CONTRACT = {
  'participation-reading': ['printing', 'national-participation', 'national', ['sv', 'nv', 'equal'], false],
  unknown: ['printing', 'unknown', 'national', ['separate', 'nv'], false],
  'unknown-transfer': ['printing', 'unknown-transfer', 'printing-fixture', ['unknown', 'nv', 'sv'], true],
  'more-count': ['comparison', 'count', 'count', ['state_01', 'state_02', 'equal'], false],
  'higher-rate': ['comparison', 'rate', 'rate', ['state_01', 'state_02', 'equal'], false],
  'comparison-transfer': ['comparison', 'comparison-transfer', 'comparison-fixture', ['no', 'yes'], true],
};
const CHAPTER_IDS = ['printing', 'comparison', 'consultation'];
const nonempty = text => typeof text === 'string' && Boolean(text.trim());
const validCounts = record => record && ['sv', 'nv', 'ns', 'ln'].every(key =>
  Number.isSafeInteger(record[key]) && record[key] >= 0) && record.ln === record.sv + record.nv + record.ns;
const sameIds = (items, ids) => Array.isArray(items) && items.length === ids.length &&
  new Set(items.map(item => item?.id)).size === ids.length && items.every(item => ids.includes(item?.id));

function validActivity(activity) {
  const contract = activity && Object.hasOwn(ACTIVITY_CONTRACT, activity.id) && ACTIVITY_CONTRACT[activity.id];
  return Boolean(contract && activity.chapter === contract[0] && activity.rule === contract[1] &&
    activity.view === contract[2] && activity.transfer === contract[4] &&
    ['title', 'prompt', 'hint', 'explanation'].every(key => nonempty(activity[key])) &&
    sameIds(activity.choices, contract[3]) && activity.choices.every(choice => nonempty(choice.text)));
}

// One exact comparator for the required quiz, published artifact and optional workshop.
// Returns a record ID, equal, or unavailable; NS never enters the classified base.
export function compareRecord(a, b, metric) {
  if (!['count', 'rate'].includes(metric) || ![a, b].every(validCounts) ||
      !nonempty(a.id) || !nonempty(b.id) || a.id === b.id) return 'unavailable';
  const aBase = BigInt(a.sv) + BigInt(a.nv);
  const bBase = BigInt(b.sv) + BigInt(b.nv);
  if (metric === 'rate' && (!aBase || !bBase)) return 'unavailable';
  const left = BigInt(a.sv) * (metric === 'rate' ? bBase : 1n);
  const right = BigInt(b.sv) * (metric === 'rate' ? aBase : 1n);
  return left === right ? 'equal' : left > right ? a.id : b.id;
}

export function assessActivity(activity, answer, data, story) {
  if (typeof activity === 'string') activity = story?.activities?.find(item => item.id === activity);
  const unavailable = { correct: answer === 'unavailable', available: false,
    message: 'No hay información suficiente para esta lectura. Puedes revisar lo que falta y continuar con apoyo; no cuenta como respuesta independiente.' };
  if (!validActivity(activity)) return { ...unavailable, correct: false };
  const find = id => data?.records?.find(record => record.id === id);
  const national = find('national');
  const records = ['state_01', 'state_02'].map(find);
  let expected;
  switch (activity.rule) {
    case 'national-participation':
      if (!validCounts(national) || national.sv + national.nv === 0) return unavailable;
      expected = national.sv === national.nv ? 'equal' : national.sv > national.nv ? 'sv' : 'nv';
      break;
    case 'unknown':
      expected = 'separate';
      break;
    case 'unknown-transfer':
      expected = 'unknown';
      break;
    case 'count':
    case 'rate': {
      expected = compareRecord(...records, activity.rule);
      if (expected === 'unavailable') return unavailable;
      break;
    }
    case 'comparison-transfer':
      expected = 'no';
      break;
    default: return unavailable;
  }
  const correct = answer === expected;
  return { correct, available: true, message: correct ? `Bien observado. ${activity.explanation}` :
    'Todavía no coincide con esta lectura. Puedes mirar otra vez o ver un ejemplo con apoyo.' };
}

export function comparisonCaption(data, story) {
  const records = ['state_01', 'state_02'].map(id => data.records.find(record => record.id === id));
  return ['count', 'rate'].map(metric => {
    const result = compareRecord(...records, metric);
    const winner = records.find(record => record?.id === result);
    if (winner) return story.comparison_artifact[metric].replace('{place}', winner.geography_name);
    return result === 'equal' ? story.comparison_artifact[`equal_${metric}`] : story.comparison_artifact.unavailable;
  }).join('\n');
}

// Fictional authored roster: never inferred from CCPC data or the player's choice.
export const SCENARIOS = Object.freeze({
  base: Object.freeze({ A: 8, B: 5, C: 3 }),
  'more-a': Object.freeze({ A: 11, B: 8, C: 6 }),
  'more-b': Object.freeze({ A: 8, B: 10, C: 7 }),
});
export function createRoster() {
  return ['A', 'B', 'C'].flatMap((preference, index) =>
    Array.from({ length: [12, 10, 8][index] }, (_, n) => ({ id: `${preference}${n + 1}`, preference })));
}
export function resolveTally(counts) {
  const maximum = Math.max(...Object.values(counts));
  const tied = Object.keys(counts).filter(option => counts[option] === maximum);
  return { winner: tied.length === 1 ? tied[0] : null, tied: tied.length > 1 ? tied : [], needsSecondDecision: tied.length > 1 };
}
export function resolveConsultation(choice, scenario = 'base', story) {
  const shared = story?.consultation?.scenarios.find(item => item.id === scenario);
  const base = story ? shared && Object.fromEntries(['A', 'B', 'C'].map((id, i) => [id, shared.votes[i]])) : SCENARIOS[scenario];
  if (!['A', 'B', 'C', 'unmarked', 'decline'].includes(choice) || !base) throw new Error('Decisión o escenario no válido.');
  const counts = { ...base };
  if (Object.hasOwn(counts, choice)) counts[choice]++;
  const unmarked = choice === 'unmarked' ? 1 : 0;
  return { counts, unmarked, population: story ? story.consultation.roster.eligible_npcs + 1 : 31,
    participants: Object.values(counts).reduce((sum, n) => sum + n, 0) + unmarked,
    ...resolveTally(counts) };
}

// Retain the storage key to migrate existing devices, but never migrate old mastery.
export const PROGRESS_KEY = 'voces-plaza.web.v1';
export function sanitizeProgress(input) {
  const value = input && typeof input === 'object' && [1, 2, 3].includes(input.version) ? input : {};
  const list = key => Array.isArray(value[key]) ? value[key] : [];
  const legacy = value.version === 1;
  const completedChapters = CHAPTER_IDS.filter((id, i) => list('completedChapters').includes(legacy ? i + 1 : id));
  return { version: 3, completedChapters,
    campaign_printed: value.version === 3 && value.campaign_printed === true && completedChapters.length === CHAPTER_IDS.length,
    legacyCompleted: legacy ? [...completedChapters] : completedChapters.filter(id => list('legacyCompleted').includes(id)),
    settings: { textSize: value.settings?.textSize === 'large' ? 'large' : 'normal', reducedMotion: value.settings?.reducedMotion === true,
      muted: value.settings?.muted === true,
      music_volume: Number.isFinite(value.settings?.music_volume) ? Math.max(0, Math.min(1, value.settings.music_volume)) : 0.2 },
    hints: legacy ? [] : Object.keys(ACTIVITY_CONTRACT).filter(id => list('hints').includes(id)),
    assisted: legacy ? [] : Object.keys(ACTIVITY_CONTRACT).filter(id => list('assisted').includes(id)) };
}
export function readProgress(storage) {
  try { return sanitizeProgress(JSON.parse(storage.getItem(PROGRESS_KEY))); }
  catch { return sanitizeProgress(null); }
}
export function writeProgress(storage, progress) {
  try { storage.setItem(PROGRESS_KEY, JSON.stringify(sanitizeProgress(progress))); return true; }
  catch { return false; }
}

export function gameHref(pathname) {
  return /^\/web\/(?:index\.html)?$/.test(pathname)
    ? '../build/web/game/index.html' : './game/index.html';
}

export function creditsHref(pathname) {
  return /^\/web\/(?:index\.html)?$/.test(pathname)
    ? '../game/THIRD_PARTY_NOTICES.txt' : './licenses/THIRD_PARTY_NOTICES.txt';
}

export function musicHref(pathname) {
  return /^\/web\/(?:index\.html)?$/.test(pathname)
    ? '../game/assets/audio/sunset-walk.ogg' : './assets/audio/sunset-walk.ogg';
}

export function normalizeStory(value) {
  if (!value || value.schema_version !== '3.0.0' ||
      !['title', 'exhibit', 'message', 'opening', 'audience', 'fiction_label', 'bridge'].every(key => nonempty(value[key]))) return null;
  if (!['intro', 'review', 'send_label', 'replace_label', 'sent', 'objective', 'press_intro', 'print_label',
    'ending_title', 'ending', 'download_label', 'reload_note', 'completed_reload', 'error'].every(key => nonempty(value.campaign?.[key]))) return null;
  if (!['continue_label', 'close_label', 'before_luz', 'before_mateo', 'revisit', 'luz_queued', 'luz_waiting']
    .every(key => nonempty(value.dialogue?.[key]))) return null;
  if (!sameIds(value.activities, Object.keys(ACTIVITY_CONTRACT)) || !value.activities.every(validActivity)) return null;
  if (!sameIds(value.chapters, CHAPTER_IDS) || !value.chapters.every(chapter =>
    ['title', 'question', 'intro', 'npc', 'reflection'].every(key => nonempty(chapter[key])))) return null;
  const houses = { printshop: 'printing', archive: 'comparison', hall: 'consultation' };
  if (!sameIds(value.houses, Object.keys(houses)) || !value.houses.every(house =>
    house.chapter === houses[house.id] && ['title', 'preview', 'objective', 'artifact'].every(key => nonempty(house[key])))) return null;
  if (!['title', 'known', 'formula', 'combined', 'limit'].every(key => nonempty(value.optional_math?.[key]))) return null;
  if (!['before', 'count', 'rate', 'equal_count', 'equal_rate', 'unavailable'].every(key => nonempty(value.comparison_artifact?.[key]))) return null;
  if (!['count', 'rate'].every(key => value.comparison_artifact[key].includes('{place}'))) return null;
  const workshop = value.poster_workshop;
  if (!['title', 'intro', 'first_label', 'second_label', 'metric_label', 'question_label',
    'count_label', 'rate_label', 'limit', 'memory_note'].every(key => nonempty(workshop?.[key])) ||
      !sameIds(workshop.questions, ['missing', 'voices', 'followup']) ||
      !workshop.questions.every(question => nonempty(question.text))) return null;
  const fixtures = value.assessment_fixtures;
  if (!validCounts(fixtures?.printing) || !Array.isArray(fixtures?.comparison) ||
      fixtures.comparison.length !== 2 || !fixtures.comparison.every(validCounts)) return null;
  const consultation = value.consultation;
  if (!nonempty(consultation?.label) || !sameIds(consultation?.projects, ['A', 'B', 'C']) ||
      !consultation.projects.every(project => ['name', 'benefit', 'tradeoff'].every(key => nonempty(project[key])))) return null;
  const roster = consultation.roster;
  if (!roster || !Number.isSafeInteger(roster.eligible_npcs) || roster.eligible_npcs < 0 ||
      roster.player_is_additional !== true || !Array.isArray(roster.underlying_preferences) ||
      roster.underlying_preferences.length !== 3 || !roster.underlying_preferences.every(n => Number.isSafeInteger(n) && n >= 0) ||
      roster.underlying_preferences.reduce((a, b) => a + b, 0) !== roster.eligible_npcs) return null;
  if (!sameIds(consultation.scenarios, ['baseline', 'more_same_winner', 'more_other_winner']) ||
      !consultation.scenarios.every(scenario => Array.isArray(scenario.votes) && scenario.votes.length === 3 &&
        scenario.votes.every((n, i) => Number.isSafeInteger(n) && n >= 0 && n <= roster.underlying_preferences[i]))) return null;
  return value;
}

export async function loadStory(fetcher = fetch, pathname = globalThis.location?.pathname) {
  for (const path of contentPaths('story.json', pathname)) {
    try {
      const response = await fetcher(path, { cache: 'no-cache' });
      const story = response.ok && normalizeStory(await response.json());
      if (story) return story;
    } catch { /* Required content stays unavailable: no replacement questions. */ }
  }
  throw new Error('No pudimos cargar la historia compartida. Revisa que el paquete incluya story.json versión 2 con sus seis actividades y vuelve a reintentar.');
}
