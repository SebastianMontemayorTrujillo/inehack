import {
  aggregateRecords, loadDataset, assessAnswer, resolveConsultation,
  readProgress, writeProgress, sanitizeProgress, gameHref, creditsHref, normalizeStory,
  contentPaths, transferExercises,
} from './logic.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const integer = value => new Intl.NumberFormat('es-MX').format(value);
const percent = value => value === null ? 'Sin datos clasificables' : `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(value)} %`;
const PROJECT_NAMES = { A: 'Sombra y bancas', B: 'Rincón de lectura', C: 'Jardín comunitario' };
const CHAPTERS = [
  { title: 'La prensa de las voces', location: 'Archivo', quests: ['denominator', 'unknown', 'transfer1'] },
  { title: 'El mapa que no lo dice todo', location: 'Tablero', quests: ['more-count', 'higher-rate', 'combined', 'limit', 'transfer2'] },
  { title: 'Una plaza, varias ideas', location: 'Plaza', quests: [] },
];
let storage;
try { storage = window.localStorage; } catch { storage = null; }
let progress = readProgress(storage);
let dataset;
let assessmentFixtures;
let chapter = 1;
const answered = new Set();
const attempts = new Map();

// All strings from the content bundle are inserted as text, never as HTML.
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function save() {
  const saved = writeProgress(storage, progress);
  $('#storage-status').textContent = saved
    ? 'Guardado local disponible. Puedes retomar los capítulos terminados.'
    : 'El guardado local no está disponible. Puedes terminar la historia; al cerrar o recargar, se perderá el avance de esta sesión.';
}

function applySettings() {
  document.body.classList.toggle('large-text', progress.settings.textSize === 'large');
  document.body.classList.toggle('reduced-motion', progress.settings.reducedMotion);
  $('#text-size').value = progress.settings.textSize;
  $('#reduced-motion').checked = progress.settings.reducedMotion;
}

function updateNavigation() {
  $$('[data-chapter]').forEach(button => {
    const id = Number(button.dataset.chapter);
    const completed = progress.completedChapters.includes(id);
    const unlocked = id === 1 || progress.completedChapters.includes(id - 1);
    button.disabled = !unlocked;
    if (id === chapter) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
    $(`#stamp-${id}`).textContent = completed ? '✓ Capítulo terminado' : unlocked ? 'Por explorar' : `Después del capítulo ${id - 1}`;
  });
  $('#progress-summary').textContent = `${progress.completedChapters.length} de 3 capítulos terminados`;
}

function clearDecision() {
  $('#ballot').reset();
  $('#reflection-form').reset();
  $('#result-content').replaceChildren();
  for (const id of ['consultation-result', 'reflection', 'ending']) $(`#${id}`).hidden = true;
}

function showChapter(id, focus = true) {
  if (id !== 1 && !progress.completedChapters.includes(id - 1)) return;
  // Neither the route nor persisted progress can reconstruct a ballot outcome.
  if (chapter === 3 && id !== 3) clearDecision();
  chapter = id;
  $('#chapter-number').textContent = `Capítulo 0${id} / ${CHAPTERS[id - 1].location}`;
  $('#chapter-title').textContent = CHAPTERS[id - 1].title;
  for (let n = 1; n <= 3; n++) $(`#chapter-${n}`).hidden = !dataset || n !== id;
  updateNavigation();
  if (focus) $('#chapter-title').focus();
}

function makeTable(caption, headings, rows) {
  const table = element('table');
  table.append(element('caption', caption));
  const head = element('thead');
  const header = element('tr');
  headings.forEach(text => { const th = element('th', text); th.scope = 'col'; header.append(th); });
  head.append(header);
  const body = element('tbody');
  rows.forEach(values => {
    const row = element('tr');
    values.forEach((text, i) => {
      const cell = element(i ? 'td' : 'th', String(text));
      if (!i) cell.scope = 'row';
      row.append(cell);
    });
    body.append(row);
  });
  table.append(head, body);
  return table;
}

function bars(target, rows, maximum) {
  target.replaceChildren();
  rows.forEach(({ label, value, formatted }) => {
    const row = element('div', undefined, 'bar-row');
    row.append(element('span', label, 'bar-label'), element('span', formatted, 'bar-value'));
    const track = element('div', undefined, 'bar-track');
    track.setAttribute('aria-hidden', 'true');
    const fill = element('div', undefined, 'bar-fill');
    fill.style.width = `${maximum && value !== null ? Math.min(100, 100 * value / maximum) : 0}%`;
    track.append(fill); row.append(track); target.append(row);
  });
}

const recordById = id => dataset.records.find(record => record.id === id);
const states = () => ['state_01', 'state_02'].map(recordById);

function renderNational() {
  const record = recordById('national');
  const totals = aggregateRecords([record]);
  const shareMode = $('#national-metric').value === 'shares';
  const labels = { sv: 'SV · Con marca de voto', nv: 'NV · Sin marca de voto', ns: 'NS · Sin clasificación' };
  const rows = ['sv', 'nv', 'ns'].map(key => ({ label: labels[key], value: record[key],
    formatted: shareMode ? record.ln ? percent(100 * record[key] / record.ln) : 'Sin base LN' : `${integer(record[key])} registros` }));
  bars($('#national-chart'), rows, record.ln);
  $('#national-caption').textContent = `${record.geography_name}, ${record.year}. ${shareMode ? 'Las tres proporciones usan LN' : 'Las barras usan una escala común de 0 a LN'}: ${integer(record.ln)} registros. La tasa de participación usa otra base: SV + NV.`;
  $('#national-table').replaceChildren(makeTable(`Registros de ${record.geography_name} · ${record.year}`, ['Clasificación', 'Conteo', '% de LN'],
    ['sv', 'nv', 'ns'].map(key => [labels[key], integer(record[key]), record.ln ? percent(100 * record[key] / record.ln) : 'Sin base LN'])));
  $('#national-finding').textContent = `${percent(totals.participation_pct)} de participación entre ${integer(totals.classified)} registros clasificados (SV + NV). Por separado: ${totals.unknown_pct === null ? 'sin base LN' : percent(totals.unknown_pct)} sin clasificación entre ${integer(record.ln)} registros de LN.`;
}

function renderComparison() {
  const records = states();
  const rates = $('#compare-metric').value === 'rates';
  const values = records.map(record => rates ? aggregateRecords([record]).participation_pct : record.sv);
  const maximum = rates ? 100 : Math.max(...values);
  bars($('#compare-chart'), records.map((record, i) => ({ label: record.geography_name, value: values[i], formatted: rates ? percent(values[i]) : `${integer(values[i])} registros SV` })), maximum);
  $('#compare-caption').textContent = rates
    ? '2024 · Escala de 0 a 100 %. Cada tasa usa SV + NV del lugar correspondiente. No incluye NS.'
    : `2024 · Conteos SV, sin dividir. Escala común de 0 a ${integer(maximum)} registros. Las bases de ambos lugares tienen distinto tamaño.`;
  const [a, b] = values;
  const comparison = a === null || b === null ? 'Falta una tasa clasificable: no podemos ordenar ambos lugares.' :
    a === b ? 'Los dos valores son iguales.' : `${records[a > b ? 0 : 1].geography_name} tiene ${rates ? 'la tasa más alta' : 'el mayor conteo SV'}.`;
  $('#compare-announcement').textContent = `${comparison} Conteo y tasa responden preguntas distintas; no explican motivos individuales.`;
  $('#compare-table').replaceChildren(makeTable('Comparación CCPC 2024 · Conteos y tasas con sus bases', ['Lugar', 'SV', 'NV', 'NS', 'LN', 'SV + NV', 'Participación'], records.map(record => {
    const total = aggregateRecords([record]);
    return [record.geography_name, integer(record.sv), integer(record.nv), integer(record.ns), integer(record.ln), integer(total.classified), percent(total.participation_pct)];
  })));
  const combined = aggregateRecords(records);
  $('#combined-finding').textContent = `Juntos: ${integer(combined.sv)} SV ÷ ${integer(combined.classified)} clasificados × 100 = ${percent(combined.participation_pct)}. Primero sumamos los conteos; después dividimos. Los ${integer(combined.ns)} registros NS se presentan aparte.`;
}

function sourcePanel(slot) {
  const source = dataset.source;
  const records = slot.dataset.records.split(',').map(recordById);
  const details = element('details');
  details.append(element('summary', 'Ficha de fuente, denominadores y límites'));
  const list = element('dl');
  const add = (label, value) => {
    list.append(element('dt', label));
    const description = element('dd');
    description.append(typeof value === 'string' ? document.createTextNode(value) : value);
    list.append(description);
  };
  add('Fuente y año', `${dataset.dataset_id} · Elección federal 2024 · ${records.map(r => r.geography_name).join(', ')}`);
  const links = element('span');
  [['Portal oficial CCPC', source.portal_url], ['Descarga de origen', source.url]].forEach(([label, url], index) => {
    if (index) links.append(document.createTextNode(' · '));
    const link = element('a', label); link.href = url; link.rel = 'noreferrer'; links.append(link);
  });
  add('Consultar el origen', links);
  for (const record of records) {
    add(`Conteos · ${record.geography_name}`, `LN ${integer(record.ln)} · SV ${integer(record.sv)} · NV ${integer(record.nv)} · NS ${integer(record.ns)}`);
    add(`Denominadores · ${record.geography_name}`, `Participación: SV + NV = ${integer(record.sv + record.nv)}. Sin clasificación: LN = ${integer(record.ln)}.`);
  }
  add('Método', 'Participación = 100 × SV ÷ (SV + NV). Sin clasificación = 100 × NS ÷ LN. En grupos se suman los conteos antes de dividir. Una base igual a cero se muestra como no disponible.');
  add('Límites de lectura', 'Son registros históricos agregados. NS no significa abstención ni voto nulo. Estos conteos no revelan preferencias, motivos individuales, causas ni el valor cívico de una comunidad. La consulta de Villa Brisa es una ficción separada.');
  const limitations = dataset.validation.limits;
  if (Array.isArray(limitations) && limitations.some(item => typeof item === 'string')) {
    const items = element('ul');
    limitations.filter(item => typeof item === 'string').forEach(item => items.append(element('li', item)));
    add('Alcance documentado por el paquete', items);
  }
  add('Archivo recuperado (UTC)', source.retrieved_at_utc);
  add('SHA-256 del origen', element('code', source.sha256));
  add('Diccionario de datos incluido', source.dictionary_path);
  details.append(list); slot.replaceChildren(details);
}

function questDefinitions() {
  const transfers = transferExercises(assessmentFixtures);
  const record = recordById('national');
  const combined = aggregateRecords(states());
  const average = states().map(r => aggregateRecords([r]).participation_pct);
  const mean = average.every(r => r !== null) ? (average[0] + average[1]) / 2 : null;
  const places = states().map(r => [r.id, r.geography_name]);
  const comparisons = [...places, ['equal', 'Son iguales'], ['unavailable', 'No se puede comparar: falta una tasa']];
  return [
    { id: 'denominator', chapter: 1, title: '01 · La base del boletín', question: `Para calcular la participación de ${record.geography_name}, ¿qué registros deben estar en el denominador?`,
      options: [['ln', `Toda la lista nominal: ${integer(record.ln)} (LN)`], ['classified', `Solo los clasificados: ${integer(record.sv + record.nv)} (SV + NV)`], ['sv', `Solo quienes tienen marca: ${integer(record.sv)} (SV)`]],
      hint: 'El denominador incluye tanto los registros con marca (SV) como los registros sin marca (NV). NS sigue sin clasificación.' },
    { id: 'unknown', chapter: 1, title: '02 · Un espacio para lo desconocido', question: '¿Qué podemos decir de NS en nuestro boletín?',
      options: [['nv', 'Que todos son registros sin marca de voto'], ['separate', 'Que no conocemos su clasificación y hay que mostrarlos aparte'], ['null-votes', 'Que son votos nulos']],
      hint: 'Un dato que no conocemos no se vuelve un dato negativo. Publica NS por separado, con LN como su propia base.' },
    { ...transfers.transfer1, id: 'transfer1', chapter: 1, title: '03 · Pruébalo en un caso nuevo', transfer: true },
    { id: 'more-count', chapter: 2, title: '01 · Contar las marcas', question: '¿Qué lugar tiene más registros con marca de voto (SV)?',
      options: [...places, ['equal', 'Tienen el mismo conteo SV']], hint: 'Mira la columna SV, sin dividir. Elige el conteo más grande; si son iguales, indícalo.' },
    { id: 'higher-rate', chapter: 2, title: '02 · Comparar las proporciones', question: '¿Qué lugar tiene la mayor tasa de participación entre sus registros clasificados?',
      options: comparisons, hint: 'Cambia la gráfica a tasas. Cada lugar tiene una base propia SV + NV; compara sus porcentajes, no sus conteos.' },
    { id: 'combined', chapter: 2, title: '03 · Juntar sin perder la base', question: 'Si juntamos ambos lugares, ¿cómo publicamos la tasa?',
      options: [['average', `Promediamos las dos tasas: ${percent(mean)}`], ['sum-first', `Sumamos SV y SV + NV antes de dividir: ${percent(combined.participation_pct)}`]],
      hint: `La base conjunta es ${integer(combined.classified)}. Hay ${integer(combined.sv)} registros SV. Dividir esos dos totales conserva el tamaño de cada grupo.` },
    { id: 'limit', chapter: 2, title: '04 · Un titular con su límite', question: '¿Qué explicación podemos sostener con estos datos?',
      options: [['motives', 'La tasa explica por qué votó cada persona'], ['no-motives', 'Podemos describir los registros de 2024; los agregados no explican motivos individuales'], ['worth', 'La tasa permite juzgar quién es mejor ciudadano']],
      hint: 'Un agregado muestra un patrón. Para conocer motivos harían falta otras fuentes, preguntas y métodos; evita juzgar a las personas.' },
    { ...transfers.transfer2, id: 'transfer2', chapter: 2, title: '05 · Otra comparación, otra lectura', transfer: true },
  ];
}

function updateCompletion(id) {
  const complete = progress.completedChapters.includes(id);
  const quests = CHAPTERS[id - 1].quests;
  const ready = quests.every(quest => answered.has(quest));
  const remaining = quests.filter(quest => !answered.has(quest)).length;
  $(`#complete-${id}`).disabled = complete || !ready;
  $(`#completion-${id}`).textContent = complete
    ? '✓ Este capítulo ya está publicado. Puedes revisar sus preguntas y volver a explorar los datos.'
    : ready ? 'Ya puedes publicar tu hallazgo con su fuente y sus límites.'
      : `Antes de publicar, revisa ${remaining} ${remaining === 1 ? 'pregunta pendiente' : 'preguntas pendientes'}. Puedes reintentar y pedir pistas.`;
  $(`[data-next="${id + 1}"]`).hidden = !complete;
}

function renderQuests() {
  $('#quest-1').replaceChildren(); $('#quest-2').replaceChildren();
  for (const definition of questDefinitions()) {
    const { id, chapter: chapterId } = definition;
    const section = element('section', undefined, 'quest');
    const heading = element('h3', definition.title);
    heading.id = `quest-title-${id}`;
    section.setAttribute('aria-labelledby', heading.id);
    section.append(heading);
    if (definition.transfer) section.append(element('p', 'Prueba de transferencia · Datos sintéticos, no CCPC. Intenta responder antes de abrir la pista. Si pides ayuda, podrás terminar con acompañamiento.', 'small-note'));
    const form = element('form'); form.autocomplete = 'off';
    const fieldset = element('fieldset');
    fieldset.append(element('legend', definition.question));
    definition.options.forEach(([value, text], index) => {
      const label = element('label', undefined, 'choice');
      const radio = element('input'); radio.type = 'radio'; radio.name = id; radio.value = value; radio.required = index === 0;
      label.append(radio, document.createTextNode(text)); fieldset.append(label);
    });
    const submit = element('button', 'Comprobar interpretación'); submit.type = 'submit';
    const feedback = element('p', undefined, 'feedback'); feedback.id = `feedback-${id}`; feedback.setAttribute('role', 'status');
    form.append(fieldset, submit, feedback);
    section.append(form);
    const hint = element('details');
    hint.append(element('summary', 'Pedir una pista'), element('p', definition.hint));
    const assisted = element('button', 'Revisar la explicación y completar con acompañamiento', 'quiet'); assisted.type = 'button';
    hint.append(assisted);
    hint.addEventListener('toggle', () => {
      if (hint.open && !progress.hints.includes(id)) { progress.hints.push(id); save(); }
    });
    const showFeedback = result => {
      feedback.textContent = result.message;
      feedback.classList.toggle('correct', result.correct);
      if (result.correct) answered.add(id);
      else answered.delete(id);
      updateCompletion(chapterId);
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      const answer = new FormData(form).get(id);
      attempts.set(id, (attempts.get(id) || 0) + 1);
      const result = assessAnswer(id, answer, dataset, assessmentFixtures);
      showFeedback({ ...result, message: `Intento ${attempts.get(id)}. ${result.message}${result.correct && progress.hints.includes(id) ? ' Revisión realizada con apoyo.' : ''}` });
    });
    assisted.addEventListener('click', () => {
      if (!progress.hints.includes(id)) progress.hints.push(id);
      save();
      const correct = definition.options.find(([value]) => assessAnswer(id, value, dataset, assessmentFixtures).correct);
      if (!correct) return;
      form.elements.namedItem(id).value = correct[0];
      const result = assessAnswer(id, correct[0], dataset, assessmentFixtures);
      showFeedback({ correct: true, message: `Completado con acompañamiento. ${result.message}` });
      hint.open = false;
      submit.focus();
    });
    section.append(hint);
    $(`#quest-${chapterId}`).append(section);
  }
  updateCompletion(1); updateCompletion(2);
}

function renderExhibit() {
  const content = $('#exhibit-content');
  const national = aggregateRecords([recordById('national')]);
  content.replaceChildren(element('h3', 'El dato muestra'),
    element('p', `En ${recordById('national').geography_name}, la participación de 2024 es ${percent(national.participation_pct)} entre ${integer(national.classified)} registros clasificados. NS se presenta aparte: ${integer(national.ns)} registros sin clasificación.`),
    element('h3', 'La comparación necesita una base'),
    element('p', states().map(r => `${r.geography_name}: ${integer(r.sv)} SV de ${integer(r.sv + r.nv)} clasificados, ${percent(aggregateRecords([r]).participation_pct)}`).join('. ') + '.'),
    element('h3', 'No permite saber'), element('p', 'Estos agregados no explican los motivos de cada persona ni preferencias por proyectos.'),
    element('h3', 'Faltan datos'), element('p', 'Para investigar motivos necesitaríamos otras fuentes y métodos, como conversaciones o encuestas con preguntas explícitas. Un patrón agregado no reemplaza escuchar a las personas.'));
}

async function initializeData() {
  $('#retry-data').hidden = true;
  $('#data-status').textContent = 'Cargando el archivo verificado CCPC 2024…';
  $('#data-status').className = '';
  try {
    dataset = await loadDataset();
    renderNational(); renderComparison(); renderQuests(); renderExhibit();
    $$('.source-slot').forEach(sourcePanel);
    $$('.table-wrap').forEach(wrapper => {
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', wrapper.querySelector('caption').textContent + '. Usa las flechas para desplazar la tabla si hace falta.');
    });
    $('#data-status').textContent = 'Archivo CCPC 2024 cargado. Las cifras se calculan desde el paquete compartido.';
    $('#data-status').className = 'small-note';
    showChapter(chapter, false);
  } catch (error) {
    dataset = undefined;
    $('#data-status').textContent = error.message;
    $('#data-status').className = 'error';
    $('#retry-data').hidden = false;
    $$('.chapter').forEach(section => { section.hidden = true; });
  }
}

// Optional provider-authored prose. Core data and calculation rules stay separate.
async function loadStory() {
  for (const path of contentPaths('story.json')) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue;
      const story = normalizeStory(await response.json());
      if (!story) continue;
      assessmentFixtures = story.assessmentFixtures;
      if (typeof story.title === 'string') document.title = `${story.title} · Cuaderno de campo`;
      if (typeof story.exhibit === 'string') $('.introduction .eyebrow').textContent = story.exhibit;
      if (typeof story.message === 'string') $('.ending > p:not(.eyebrow)').textContent = story.message;
      for (const item of Array.isArray(story.chapters) ? story.chapters : []) {
        if (![1, 2, 3].includes(item.id)) continue;
        const section = $(`#chapter-${item.id}`);
        if (typeof item.title === 'string') {
          CHAPTERS[item.id - 1].title = item.title;
          $(`[data-chapter="${item.id}"] > span:last-child`).firstChild.textContent = item.title;
        }
        if (typeof item.question === 'string') section.querySelector('.human-question').textContent = item.question;
        if (typeof item.intro === 'string') section.querySelector('.human-question + p').textContent = item.intro;
        if (typeof item.quote === 'string' && section.querySelector('blockquote')) section.querySelector('blockquote').firstChild.textContent = item.quote;
        if (typeof item.npc === 'string' && section.querySelector('blockquote cite')) section.querySelector('blockquote cite').textContent = item.npc;
        if (typeof item.reflection === 'string') {
          const reflection = element('p', item.reflection, 'finding');
          reflection.classList.add('chapter-reflection');
          if (section.querySelector('.chapter-completion')) section.querySelector('.chapter-completion').before(reflection);
          else section.querySelector('.human-question + p').after(reflection);
        }
      }
      for (const project of Array.isArray(story.projects) ? story.projects : []) {
        if (!Object.hasOwn(PROJECT_NAMES, project.id)) continue;
        const article = $$('.projects article')[['A', 'B', 'C'].indexOf(project.id)];
        if (typeof project.title === 'string') {
          PROJECT_NAMES[project.id] = project.title;
          article.querySelector('h4').textContent = project.title;
          $(`#ballot input[value="${project.id}"]`).parentNode.lastChild.textContent = ` ${project.id} · ${project.title}`;
        }
        if (typeof project.description === 'string') article.querySelector('p').textContent = project.description;
        if (typeof project.tradeoff === 'string') article.querySelector('.tradeoff').textContent = project.tradeoff;
      }
      if (typeof story.ending?.title === 'string') $('#ending-title').textContent = story.ending.title;
      if (typeof story.ending?.body === 'string') $('.ending > p:not(.eyebrow)').textContent = story.ending.body;
      showChapter(chapter, false);
      return;
    } catch { /* Provider prose is optional; the complete semantic story is in HTML. */ }
  }
}

$$('[data-chapter]').forEach(button => button.addEventListener('click', () => showChapter(Number(button.dataset.chapter))));
$$('[data-next]').forEach(button => button.addEventListener('click', () => showChapter(Number(button.dataset.next))));
$('#retry-data').addEventListener('click', initializeData);
$('#text-size').addEventListener('change', event => { progress.settings.textSize = event.target.value; applySettings(); save(); });
$('#reduced-motion').addEventListener('change', event => { progress.settings.reducedMotion = event.target.checked; applySettings(); save(); });
$('#reset-progress').addEventListener('click', () => {
  progress = sanitizeProgress(null); answered.clear(); attempts.clear(); clearDecision();
  applySettings(); save();
  if (dataset) renderQuests();
  $('#national-evidence').hidden = true;
  $('#reveal-national').setAttribute('aria-expanded', 'false');
  $('#reveal-national').textContent = 'Abrir el archivo y revisar los registros ↓';
  $('#scenario').value = 'base';
  $('#national-metric').value = 'counts';
  $('#compare-metric').value = 'counts';
  if (dataset) { renderNational(); renderComparison(); }
  showChapter(1);
});
$('#reveal-national').addEventListener('click', event => {
  const open = event.currentTarget.getAttribute('aria-expanded') !== 'true';
  $('#national-evidence').hidden = !open;
  event.currentTarget.setAttribute('aria-expanded', String(open));
  event.currentTarget.textContent = open ? 'Cerrar el archivo de registros ↑' : 'Abrir el archivo y revisar los registros ↓';
});
$('#national-metric').addEventListener('change', renderNational);
$('#compare-metric').addEventListener('change', renderComparison);
for (const id of [1, 2]) {
  $(`#complete-${id}`).addEventListener('click', () => {
    if (!CHAPTERS[id - 1].quests.every(quest => answered.has(quest))) return;
    if (!progress.completedChapters.includes(id)) progress.completedChapters.push(id);
    save(); updateCompletion(id); updateNavigation();
    $(`[data-next="${id + 1}"]`).focus();
  });
}
$('#ballot').addEventListener('submit', event => {
  event.preventDefault();
  const result = resolveConsultation(new FormData(event.currentTarget).get('decision'), $('#scenario').value);
  // Discard the selection immediately after tallying; no persistence, URL or telemetry.
  event.currentTarget.reset();
  $('#reflection-form').reset(); $('#ending').hidden = true;
  const outcome = result.needsSecondDecision
    ? `Empate entre ${result.tied.map(id => `${id} · ${PROJECT_NAMES[id]}`).join(' y ')}. Hace falta una segunda decisión ficticia. Ningún proyecto gana automáticamente.`
    : `Ganó ${result.winner} · ${PROJECT_NAMES[result.winner]}. Todavía falta revisar cómo se realiza y qué necesidades quedan pendientes.`;
  $('#result-content').replaceChildren(element('p', outcome, 'finding'),
    makeTable('Resultado agregado · Escenario ficticio, no CCPC', ['Proyecto o boleta', 'Marcas o boletas'], [
      ...['A', 'B', 'C'].map(id => [`${id} · ${PROJECT_NAMES[id]}`, result.counts[id]]), ['Boletas sin marca', result.unmarked],
    ]), element('p', `${result.participants} participantes de ${result.population} personas ficticias habilitadas (${percent(100 * result.participants / result.population)}). ${result.population - result.participants} no participaron. Las boletas sin marca cuentan como participación, pero no se asignan a un proyecto.`));
  $('#consultation-result').hidden = false; $('#reflection').hidden = false;
  $('#consultation-result').focus();
});
$('#scenario').addEventListener('change', clearDecision);
$('#reflection-form').addEventListener('submit', event => {
  event.preventDefault();
  event.currentTarget.reset();
  if (!progress.completedChapters.includes(3)) progress.completedChapters.push(3);
  save(); updateNavigation();
  $('#ending').hidden = false; $('#ending').focus();
});
$('#repeat-consultation').addEventListener('click', () => { clearDecision(); $('#scenario').focus(); });
// Prevent back/forward-cache and browser form restoration from retaining a decision.
window.addEventListener('pageshow', () => { $('#ballot').reset(); $('#reflection-form').reset(); });
window.addEventListener('pagehide', clearDecision);

$('#game-link').href = gameHref(window.location.pathname);
$('#credits-link').href = creditsHref(window.location.pathname);
applySettings(); save(); updateNavigation();
// Read optional shared assessments before rendering prompts and answer keys.
await loadStory();
await initializeData();
