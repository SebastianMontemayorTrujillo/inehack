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
  const compare = key => {
    const [a, b] = states.map(record => ({ id: record.id, value: aggregateRecords([record])[key] }));
    return a.value === null || b.value === null ? 'unavailable' : a.value === b.value ? 'equal' : a.value > b.value ? a.id : b.id;
  };
  const transfers = transferExercises(assessmentFixtures);
  const rules = {
    denominator: ['classified', 'La participación se calcula como 100 × SV ÷ (SV + NV). NS queda fuera de ese denominador porque no conocemos su clasificación.'],
    unknown: ['separate', 'NS significa participación sin especificar: su clasificación es desconocida. No podemos sumarlo a NV ni interpretarlo como votos nulos; su proporción es 100 × NS ÷ LN.'],
    'more-count': [compare('sv'), 'Compara los registros SV, sin dividir. Un conteo mayor no implica una proporción mayor.'],
    'higher-rate': [compare('participation_pct'), 'Compara 100 × SV ÷ (SV + NV) en cada lugar. La base de cada tasa es su propio total clasificado. Si falta una tasa, no podemos ordenar ambas.'],
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
export function resolveConsultation(choice, scenario = 'base') {
  if (!['A', 'B', 'C', 'unmarked', 'decline'].includes(choice) || !Object.hasOwn(SCENARIOS, scenario)) throw new Error('Decisión o escenario no válido.');
  const counts = { A: 0, B: 0, C: 0 };
  const remaining = { ...SCENARIOS[scenario] };
  for (const resident of createRoster()) {
    if (remaining[resident.preference] > 0) {
      counts[resident.preference]++;
      remaining[resident.preference]--;
    }
  }
  if (Object.hasOwn(counts, choice)) counts[choice]++;
  const unmarked = choice === 'unmarked' ? 1 : 0;
  return { counts, unmarked, population: 31,
    participants: Object.values(counts).reduce((sum, n) => sum + n, 0) + unmarked,
    ...resolveTally(counts) };
}

const QUESTS = ['denominator', 'unknown', 'more-count', 'higher-rate', 'combined', 'limit', 'transfer1', 'transfer2'];
export const PROGRESS_KEY = 'voces-plaza.web.v1';
export function sanitizeProgress(input) {
  const value = input && typeof input === 'object' && input.version === 1 ? input : {};
  return { version: 1,
    completedChapters: [1, 2, 3].filter(id => Array.isArray(value.completedChapters) && value.completedChapters.includes(id)),
    settings: { textSize: value.settings?.textSize === 'large' ? 'large' : 'normal', reducedMotion: value.settings?.reducedMotion === true },
    hints: QUESTS.filter(id => Array.isArray(value.hints) && value.hints.includes(id)) };
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

export function normalizeStory(value) {
  if (!value || value.schema_version !== '1.0.0') return null;
  const text = field => typeof field === 'string' && field.trim() ? field : undefined;
  const chapterIds = { printing: 1, comparison: 2, consultation: 3 };
  const chapters = (Array.isArray(value.chapters) ? value.chapters : []).filter(item => item &&
    ([1, 2, 3].includes(item.id) || Object.hasOwn(chapterIds, item.id))).map(item => ({
      id: chapterIds[item.id] || item.id,
      ...Object.fromEntries(['title', 'question', 'intro', 'quote', 'npc', 'reflection'].map(key => [key, text(item[key])])),
    }));
  const projects = (Array.isArray(value.consultation?.projects) ? value.consultation.projects :
    Array.isArray(value.projects) ? value.projects : []).filter(item => item && ['A', 'B', 'C'].includes(item.id)).map(item => ({
      id: item.id, title: text(item.name) || text(item.title), description: text(item.benefit) || text(item.description), tradeoff: text(item.tradeoff),
    }));
  return { title: text(value.title), exhibit: text(value.exhibit), message: text(value.message), chapters, projects,
    assessmentFixtures: normalizeAssessments(value.assessment_fixtures),
    ending: { title: text(value.ending?.title), body: text(value.ending?.body) } };
}
