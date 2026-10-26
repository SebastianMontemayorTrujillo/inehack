import {
  loadDataset, loadStory, assessActivity, resolveConsultation,
  readProgress, writeProgress, sanitizeProgress, gameHref, creditsHref,
} from './logic.mjs';
import { element, table, renderEvidence, artifact, percent } from './views.mjs';
import { createPosterWorkshop } from './poster-workshop.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
// A single mounted generic live region avoids Orca's status-bar mapping and
// competing updates. Visible feedback remains ordinary, browsable text.
const announcer = element('div');
announcer.id = 'story-announcements';
announcer.setAttribute('aria-live', 'polite'); announcer.setAttribute('aria-atomic', 'true');
announcer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;';
document.body.append(announcer);
let announcementTimer;
function clearAnnouncement() {
  clearTimeout(announcementTimer); announcer.textContent = '';
}
function announce(message) {
  clearAnnouncement();
  // Let the empty state reach the accessibility tree, including on an identical
  // retry. Coalesce rapid actions and speak after the controls/focus have settled.
  announcementTimer = setTimeout(() => { announcer.textContent = message; }, 150);
}
function setStatusText(selector, message) {
  const target = $(selector);
  if (target.textContent !== message) target.textContent = message;
}
let storage;
try { storage = window.localStorage; } catch { storage = null; }
let progress = readProgress(storage);
let story;
let dataset;
let posterWorkshop;
let locationId = 'plaza';
let openTask = null;
let hasResult = false;
const answered = new Map();
const attempts = new Map();
const current = { printing: 0, comparison: 0 };
const done = chapter => progress.completedChapters.includes(chapter);
const activities = chapter => story.activities.filter(activity => activity.chapter === chapter);
const unlocked = chapter => chapter === 'printing' || (chapter === 'comparison' ? done('printing') : done('printing') && done('comparison'));

function save() {
  setStatusText('#storage-status', writeProgress(storage, progress)
    ? 'Guardado local disponible. Puedes retomar los capítulos terminados. Las respuestas no se guardan.'
    : 'El guardado local no está disponible. Puedes terminar la historia; al cerrar o recargar se perderá el avance de esta sesión.');
}

function applySettings() {
  document.body.classList.toggle('large-text', progress.settings.textSize === 'large');
  document.body.classList.toggle('reduced-motion', progress.settings.reducedMotion);
  $('#text-size').value = progress.settings.textSize;
  $('#reduced-motion').checked = progress.settings.reducedMotion;
}

function updateNavigation() {
  if (!story) return;
  for (const house of story.houses) {
    const button = $(`[data-house="${house.id}"]`);
    if (locationId === house.id) button.setAttribute('aria-current', 'location');
    else button.removeAttribute('aria-current');
    $(`#stamp-${house.id}`).textContent = done(house.chapter) ? '✓ Trabajo terminado' : 'Puedes entrar';
    if (house.chapter !== 'printing') {
      $(`#blocked-${house.chapter}`).hidden = unlocked(house.chapter);
      $(`[data-start="${house.chapter}"]`).hidden = !unlocked(house.chapter);
    }
  }
  setStatusText('#progress-summary', `${progress.completedChapters.length} de 3 capítulos terminados`);
  $('#next-objective').textContent = !done('printing') ? story.houses.find(h => h.id === 'printshop').objective :
    !done('comparison') ? story.houses.find(h => h.id === 'archive').objective :
      !done('consultation') ? story.houses.find(h => h.id === 'hall').objective : 'Puedes volver a leer los trabajos de la exposición y conversar sobre lo que sigue.';
  $('#legacy-notice').hidden = !progress.legacyCompleted.length;
  $('#legacy-notice').textContent = 'Conservamos tu avance anterior. Ese guardado no evaluó estas actividades nuevas; no demuestra comprensión independiente en esta revisión.';
}

function clearDecision() {
  $('#ballot')?.reset(); $('#reflection-form')?.reset();
  $('#result-content')?.replaceChildren();
  for (const id of ['consultation-result', 'reflection']) if ($(`#${id}`)) $(`#${id}`).hidden = true;
  hasResult = false;
}

function closeTask(focus = true) {
  if (!openTask) return;
  clearAnnouncement();
  const chapter = openTask;
  $(`#task-${chapter}`).hidden = true;
  if (chapter === 'consultation') clearDecision();
  openTask = null;
  if (focus) $(`[data-start="${chapter}"]`).focus();
}

function showLocation(id, focus = true) {
  if (!story || (id !== 'plaza' && !story.houses.some(h => h.id === id))) return;
  clearAnnouncement();
  const previous = locationId;
  posterWorkshop?.close(false);
  closeTask(false);
  if (previous === 'hall') clearDecision();
  locationId = id;
  $('#plaza').hidden = id !== 'plaza';
  for (const house of story.houses) $(`#house-${house.id}`).hidden = id !== house.id;
  $('.skip-link').href = id === 'plaza' ? '#plaza-title' : `#house-title-${id}`;
  updateNavigation();
  if (focus) {
    if (id === 'plaza') ($(`[data-house="${previous}"]`) || $('#plaza-title')).focus();
    else $(`#house-title-${id}`).focus();
  }
}

function startTask(chapter) {
  if (!unlocked(chapter)) return;
  closeTask(false);
  posterWorkshop?.close(false);
  openTask = chapter;
  if (chapter === 'consultation') clearDecision();
  else renderActivity(chapter);
  $(`#task-${chapter}`).hidden = false;
  $(`#task-title-${chapter}`).focus();
}

function markSupport(id, completed = false) {
  if (!answered.has(id) && !progress.hints.includes(id)) progress.hints.push(id);
  if (completed && !progress.assisted.includes(id)) progress.assisted.push(id);
  save();
}

function updateCompletion(chapter) {
  const required = activities(chapter);
  const ready = required.every(activity => answered.has(activity.id));
  const remaining = required.filter(activity => !answered.has(activity.id)).length;
  $(`#complete-${chapter}`).disabled = done(chapter) || !ready;
  setStatusText(`#completion-${chapter}`, done(chapter)
    ? progress.legacyCompleted.includes(chapter) ? 'Trabajo de tu guardado anterior conservado. Las actividades nuevas siguen disponibles para explorar.' : 'Este trabajo ya está publicado. Puedes volver a explorar sus actividades.'
    : ready ? 'Ya puedes publicar el trabajo con su fuente.' : `Faltan ${remaining} de las tres actividades. Puedes volver a mirar o continuar con apoyo.`);
}

function renderActivity(chapter) {
  const definitions = activities(chapter);
  const activity = definitions[current[chapter]];
  const { id } = activity;
  const section = element('section', undefined, 'activity'); section.dataset.activity = id;
  const heading = element('h4', activity.title); heading.id = `activity-title-${id}`; heading.tabIndex = -1;
  section.setAttribute('aria-labelledby', heading.id);
  section.append(element('p', `Actividad ${current[chapter] + 1} de ${definitions.length}`, 'eyebrow'), heading);
  if (activity.transfer) section.append(element('p', 'Otro caso para probar lo que entendiste. Intenta responder antes de abrir el apoyo. No necesitas hacer divisiones.', 'small-note'));
  const evidence = element('div', undefined, 'activity-evidence');
  renderEvidence(evidence, activity.view, dataset, story, () => markSupport(id));
  section.append(evidence);
  const form = element('form'); form.autocomplete = 'off';
  const fieldset = element('fieldset'); fieldset.append(element('legend', activity.prompt));
  for (const choice of activity.choices) {
    const label = element('label', undefined, 'choice');
    const input = element('input'); input.type = 'radio'; input.name = id; input.value = choice.id; input.required = true;
    label.append(input, document.createTextNode(choice.text)); fieldset.append(label);
  }
  const availability = assessActivity(activity, null, dataset, story);
  const submit = element('button', 'Comprobar mi lectura'); submit.type = 'submit';
  const feedback = element('p', undefined, 'feedback'); feedback.id = `feedback-${id}`;
  const retry = element('button', 'Mirar otra vez', 'quiet'); retry.type = 'button'; retry.dataset.retryActivity = ''; retry.hidden = true;
  form.append(fieldset, submit, feedback, retry); section.append(form);
  const hint = element('details', undefined, 'activity-hint');
  hint.append(element('summary', 'Pedir una pista (con apoyo)'), element('p', activity.hint));
  hint.addEventListener('toggle', () => { if (hint.open) markSupport(id); });
  const example = element('button', 'Ver un ejemplo explicado (con apoyo)', 'quiet'); example.type = 'button'; example.dataset.example = '';
  const explanation = element('p', activity.explanation, 'explanation finding'); explanation.hidden = true;
  const assist = element('button', 'Leer la explicación y completar con apoyo', 'quiet'); assist.type = 'button'; assist.dataset.assist = '';
  section.append(hint, example, explanation, assist);
  const supportNote = element('p', 'Pedir una pista, abrir un ejemplo o completar con apoyo se registra como ayuda. No se presenta como una respuesta independiente.', 'small-note');
  section.append(supportNote);
  const next = element('button', 'Siguiente actividad →'); next.type = 'button'; next.dataset.nextActivity = '';
  next.hidden = current[chapter] === definitions.length - 1;
  const back = element('button', '← Actividad anterior', 'quiet'); back.type = 'button'; back.dataset.previousActivity = '';
  back.hidden = current[chapter] === 0;
  const navigation = element('div', undefined, 'activity-navigation'); navigation.append(back, next); section.append(navigation);
  const showResult = (message, status, speak = false) => {
    feedback.textContent = message;
    feedback.classList.toggle('correct', status === 'correct');
    feedback.classList.toggle('supported', status === 'supported');
    retry.hidden = status !== 'retry';
    next.disabled = !answered.has(id);
    updateCompletion(chapter);
    if (speak) announce(`${message} ${$(`#completion-${chapter}`).textContent}`);
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!availability.available) return;
    if (hint.open || evidence.querySelector('.optional-math[open]')) markSupport(id);
    const result = assessActivity(activity, new FormData(form).get(id), dataset, story);
    attempts.set(id, (attempts.get(id) || 0) + 1);
    let note = '';
    if (result.correct) {
      const supported = progress.hints.includes(id) || progress.assisted.includes(id);
      answered.set(id, { supported, message: result.message });
      note = supported ? ' Resuelta con apoyo; no cuenta como respuesta independiente.' :
        attempts.get(id) > 1 ? ' Resuelta tras volver a mirar, sin abrir apoyo.' : ' Resuelta sin abrir apoyo.';
    } else answered.delete(id);
    const status = result.correct ? answered.get(id).supported ? 'supported' : 'correct' : 'retry';
    showResult(result.message + note, status, true);
  });
  retry.addEventListener('click', () => { clearAnnouncement(); form.reset(); feedback.textContent = ''; retry.hidden = true; heading.focus(); });
  example.addEventListener('click', () => { markSupport(id); explanation.hidden = false; example.setAttribute('aria-expanded', 'true'); });
  example.setAttribute('aria-expanded', 'false'); explanation.id = `explanation-${id}`; example.setAttribute('aria-controls', explanation.id);
  assist.addEventListener('click', () => {
    markSupport(id, true); explanation.hidden = false;
    const message = availability.available ? activity.explanation : availability.message;
    answered.set(id, { supported: true, message });
    showResult(`Completado con apoyo. ${message} No cuenta como respuesta independiente.`, 'supported', true);
    (next.hidden ? $(`#complete-${chapter}`) : next).focus();
  });
  const move = delta => {
    clearAnnouncement();
    current[chapter] += delta; renderActivity(chapter);
    $(`#activity-title-${definitions[current[chapter]].id}`).focus();
  };
  next.addEventListener('click', () => { if (answered.has(id)) move(1); });
  back.addEventListener('click', () => move(-1));
  if (!availability.available) {
    fieldset.disabled = true; submit.disabled = true;
    showResult(availability.message, 'unavailable');
  }
  if (answered.has(id)) {
    const response = answered.get(id);
    showResult(`${response.message} ${response.supported ? 'Completado con apoyo.' : 'Resuelta sin abrir apoyo en esta sesión.'}`, response.supported ? 'supported' : 'correct');
  } else next.disabled = true;
  $(`#activities-${chapter}`).replaceChildren(section);
  updateCompletion(chapter);
}

function renderArtifacts() {
  $('#exhibit-content').replaceChildren();
  for (const chapter of ['printing', 'comparison']) {
    const house = story.houses.find(h => h.chapter === chapter);
    const slot = $(`#artifact-${chapter}`); slot.hidden = !done(chapter); slot.replaceChildren();
    const heading = element('h3', house.artifact); heading.id = `artifact-title-${chapter}`; heading.tabIndex = -1;
    slot.append(heading);
    if (!done(chapter)) continue;
    const supported = activities(chapter).some(a => progress.hints.includes(a.id) || progress.assisted.includes(a.id));
    const status = progress.legacyCompleted.includes(chapter) ? 'Guardado anterior: las actividades nuevas no se evaluaron.' :
      supported ? 'Publicado con apoyo. No demuestra comprensión independiente.' : 'Trabajo publicado. La publicación por sí sola no demuestra comprensión independiente.';
    slot.append(element('p', status, 'small-note'), artifact(chapter, dataset, story));
    const exhibit = element('details', undefined, 'exhibit-artifact');
    exhibit.append(element('summary', house.artifact), element('p', status, 'small-note'), artifact(chapter, dataset, story));
    $('#exhibit-content').append(exhibit);
  }
  if (!done('printing') && !done('comparison')) $('#exhibit-content').append(element('p', 'Aquí quedarán el boletín y el cartel que preparemos.'));
  $('#ending').hidden = !done('consultation');
  posterWorkshop?.sync(done('comparison'));
}

function renderHouses() {
  $('#house-navigation').replaceChildren(); $('#houses').replaceChildren();
  for (const [index, house] of story.houses.entries()) {
    const item = element('li'); const enter = element('button'); enter.type = 'button'; enter.dataset.house = house.id;
    const text = element('span', `Entrar a ${house.title}`); const stamp = element('span', 'Puedes entrar', 'chapter-stamp'); stamp.id = `stamp-${house.id}`;
    text.append(stamp); enter.append(element('span', `0${index + 1}`, 'step-number'), text); item.append(enter); $('#house-navigation').append(item);
    enter.addEventListener('click', () => showLocation(house.id));
    const section = element('section', undefined, 'house'); section.id = `house-${house.id}`; section.hidden = true;
    section.setAttribute('aria-labelledby', `house-title-${house.id}`);
    const heading = element('h2', house.title); heading.id = `house-title-${house.id}`; heading.tabIndex = -1;
    const leave = element('button', 'Salir a la plaza', 'quiet'); leave.type = 'button'; leave.dataset.leave = '';
    leave.addEventListener('click', () => showLocation('plaza'));
    const chapter = story.chapters.find(c => c.id === house.chapter);
    section.append(element('p', 'Estás en una casa de Villa Brisa', 'eyebrow'), heading, leave,
      element('p', house.preview), element('p', house.objective, 'finding'));
    if (house.chapter === 'consultation') {
      section.append($('#consultation-template').content.cloneNode(true));
    } else {
      section.append(element('p', `${chapter.npc}: ${chapter.intro}`));
      if (house.chapter === 'comparison') {
        const blocked = element('p', 'Puedes conocer el archivo. Para empezar el cartel, primero publica el boletín con Luz.', 'finding'); blocked.id = 'blocked-comparison';
        section.append(blocked);
      }
      const start = element('button', house.chapter === 'printing' ? 'Revisar el boletín con Luz' : 'Revisar el cartel con Mateo');
      start.type = 'button'; start.dataset.start = house.chapter; section.append(start);
      const published = element('section', undefined, 'artifact'); published.id = `artifact-${house.chapter}`;
      published.setAttribute('aria-labelledby', `artifact-title-${house.chapter}`); published.hidden = true; section.append(published);
      const task = element('div', undefined, 'task'); task.id = `task-${house.chapter}`; task.hidden = true;
      const title = element('h3', chapter.question); title.id = `task-title-${house.chapter}`; title.tabIndex = -1;
      const slot = element('div'); slot.id = `activities-${house.chapter}`;
      const status = element('p'); status.id = `completion-${house.chapter}`;
      const publish = element('button', house.chapter === 'printing' ? 'Publicar el boletín' : 'Publicar el cartel');
      publish.type = 'button'; publish.id = `complete-${house.chapter}`; publish.disabled = true;
      publish.addEventListener('click', () => {
        if (done(house.chapter) || !activities(house.chapter).every(a => answered.has(a.id))) return;
        progress.completedChapters.push(house.chapter); save(); closeTask(false); renderArtifacts(); updateNavigation();
        $(`#artifact-title-${house.chapter}`).focus();
        announce($('#progress-summary').textContent);
      });
      const close = element('button', 'Cerrar tarea', 'quiet'); close.type = 'button'; close.dataset.closeTask = house.chapter;
      const completion = element('div', undefined, 'chapter-completion'); completion.append(status, publish, close);
      task.append(title, slot, completion); section.append(task);
    }
    $('#houses').append(section);
  }
  $$('[data-start]').forEach(button => button.addEventListener('click', () => startTask(button.dataset.start)));
  $$('[data-close-task]').forEach(button => button.addEventListener('click', () => closeTask()));
  posterWorkshop = createPosterWorkshop({ data: dataset, story, archive: $('#house-archive'), meeting: $('#house-hall'), exhibit: $('#exhibit-content'),
    onOpen: () => { clearAnnouncement(); closeTask(false); },
    onCarry: () => { showLocation('hall', false); $('#poster-meeting-title').focus(); }, announce });
  setupConsultation(); renderArtifacts(); updateNavigation();
}

function setupConsultation() {
  const consultation = story.consultation;
  $('#consultation-bridge').textContent = story.bridge;
  $('#consultation-label').textContent = consultation.label;
  for (const project of consultation.projects) {
    const card = element('article'); card.append(element('span', project.id, 'project-letter'),
      element('h4', project.name), element('p', project.benefit), element('p', project.tradeoff, 'tradeoff'));
    $('.projects').append(card);
  }
  for (const [id, text] of [...consultation.projects.map(p => [p.id, `${p.id} · ${p.name}`]),
    ['unmarked', 'Participar con una boleta sin marca'], ['decline', 'No participar en esta consulta']]) {
    const label = element('label', undefined, 'choice'); const input = element('input');
    input.type = 'radio'; input.name = 'decision'; input.value = id; input.required = true;
    label.append(input, document.createTextNode(text)); $('#ballot-options').append(label);
  }
  const roster = consultation.roster;
  $('#roster-description').textContent = `Hay ${roster.eligible_npcs} habitantes inventados con preferencias fijas: ${roster.underlying_preferences.map((n, i) => `${['A', 'B', 'C'][i]}: ${n}`).join(', ')}. Tú eres una persona adicional. El grupo participante se fija antes de elegir.`;
  for (const [index, scenario] of consultation.scenarios.entries()) {
    const count = scenario.votes.reduce((a, b) => a + b, 0);
    const option = element('option', `${index === 0 ? 'Inicial' : `Ejemplo ${index + 1}`}: ${scenario.votes.map((n, i) => `${['A', 'B', 'C'][i]} ${n}`).join(' / ')} · ${count} participantes`);
    option.value = scenario.id; $('#scenario').append(option);
  }
  $('#scenario').addEventListener('change', clearDecision);
  $('#ballot').addEventListener('submit', event => {
    event.preventDefault();
    if (!unlocked('consultation') || openTask !== 'consultation') return;
    const result = resolveConsultation(new FormData(event.currentTarget).get('decision'), $('#scenario').value, story);
    clearDecision(); hasResult = true;
    const name = id => `${id} · ${consultation.projects.find(p => p.id === id).name}`;
    const outcome = result.needsSecondDecision ? `Empate entre ${result.tied.map(name).join(' y ')}. Hace falta otra decisión ficticia; nadie gana automáticamente.` :
      `Ganó ${name(result.winner)} en este ejemplo. Todavía falta revisar cómo se realiza y qué necesidades quedan pendientes.`;
    const counts = table('Resultado agregado · Escenario ficticio, no CCPC', ['Proyecto o boleta', 'Marcas o boletas'], [
      ...['A', 'B', 'C'].map(id => [name(id), result.counts[id]]), ['Boletas sin marca', result.unmarked],
    ]);
    ['A', 'B', 'C'].forEach((id, i) => { counts.tBodies[0].rows[i].cells[1].dataset.count = id; });
    $('#result-content').replaceChildren(element('p', outcome, 'finding'), counts,
      element('p', `${result.participants} participantes de ${result.population} personas inventadas (${percent(100 * result.participants / result.population)}). Las boletas sin marca cuentan como participación y no se asignan a un proyecto.`));
    $('#consultation-result').hidden = false; $('#reflection').hidden = false; $('#consultation-result').focus();
  });
  $('#reflection-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!hasResult || !unlocked('consultation')) return;
    if (!done('consultation')) progress.completedChapters.push('consultation');
    event.currentTarget.reset(); save(); renderArtifacts(); showLocation('plaza', false); $('#ending-title').focus();
    announce($('#progress-summary').textContent);
  });
}

async function initialize() {
  $('#retry-data').hidden = true;
  $('#data-status').textContent = 'Cargando los datos y la historia compartida…'; $('#data-status').className = '';
  try {
    [dataset, story] = await Promise.all([loadDataset(), loadStory()]);
    document.title = `${story.title} · Cuaderno de campo`;
    $('.introduction .eyebrow').textContent = story.exhibit; $('#opening').textContent = story.opening;
    $('#audience').textContent = story.audience; $('#exhibit-title').textContent = story.exhibit;
    $('#ending-message').textContent = story.message;
    renderHouses(); showLocation('plaza', false);
    $('#data-status').textContent = 'Archivo CCPC 2024 e historia compartida cargados.'; $('#data-status').className = 'small-note';
  } catch (error) {
    story = undefined; dataset = undefined;
    $('#houses').replaceChildren(); $('#house-navigation').replaceChildren();
    $('#data-status').textContent = error.message; $('#data-status').className = 'error'; $('#retry-data').hidden = false;
  }
}

$('#retry-data').addEventListener('click', initialize);
$('#text-size').addEventListener('change', event => { progress.settings.textSize = event.target.value; applySettings(); save(); });
$('#reduced-motion').addEventListener('change', event => { progress.settings.reducedMotion = event.target.checked; applySettings(); save(); });
$('#reset-progress').addEventListener('click', () => {
  progress = sanitizeProgress(null); answered.clear(); attempts.clear(); current.printing = 0; current.comparison = 0;
  openTask = null; clearDecision(); applySettings(); save();
  if (story) { renderHouses(); showLocation('plaza', false); $('#plaza-title').focus(); }
});
$('#repeat-consultation').addEventListener('click', () => { showLocation('hall', false); startTask('consultation'); });
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (posterWorkshop?.close()) { event.preventDefault(); clearAnnouncement(); }
  else if (openTask) { event.preventDefault(); closeTask(); }
  else if (locationId !== 'plaza') { event.preventDefault(); showLocation('plaza'); }
});
window.addEventListener('pagehide', () => { clearDecision(); posterWorkshop?.clear(); });
window.addEventListener('pageshow', clearDecision);
$('#game-link').href = gameHref(window.location.pathname);
$('#credits-link').href = creditsHref(window.location.pathname);
applySettings(); save();
await initialize();
