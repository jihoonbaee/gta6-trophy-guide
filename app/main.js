import { applyFilters } from './filters.js';
import { element, renderGuidePanel } from './guide-panel.js';
import { renderRoadmap } from './roadmap.js';
import { exportProgressJSON, importProgressJSON, loadProgress, saveProgress } from './storage.js';
import { grades, progressCounts, renderChecklist, toggleEarned } from './tracker.js';

const byId = id => document.getElementById(id);
const requestedShot = new URLSearchParams(location.search).get('shot');
const shot = ['cover', 'guide', 'roadmap', 'tracker'].includes(requestedShot) ? requestedShot : null;
// Demo progress shows the first 7 story trophies.
const DEMO_EARNED_COUNT = 7;

async function readData(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

async function boot() {
  const [{ trophies }, { stages }] = await Promise.all([
    readData('./data/trophies.json'), readData('./data/roadmap.json'),
  ]);
  const trophyById = new Map(trophies.map(trophy => [trophy.id, trophy]));
  const manualIds = new Set(trophies.filter(trophy => trophy.grade !== 'platinum').map(trophy => trophy.id));
  const stored = shot ? null : loadProgress(manualIds);
  let earned = shot ? new Set(trophies.filter(trophy => trophy.kind === 'story').slice(0, DEMO_EARNED_COUNT).map(trophy => trophy.id)) : stored.earned;
  let view = shot === 'roadmap' ? 'roadmap' : 'checklist';
  let activeTrophy = shot === 'guide' ? trophies.find(trophy => trophy.missable && trophy.steps?.length) : null;
  const citations = trophies.flatMap(trophy => trophy.sources);
  const distinctUrls = new Set(citations.map(source => source.url));
  byId('citation-audit').textContent = `Guide-level citations: ${citations.length} across ${distinctUrls.size} sources`;

  const checklistButton = byId('show-checklist');
  const roadmapButton = byId('show-roadmap');
  const shield = byId('spoiler-shield');
  const list = byId('trophy-list');
  const panel = byId('guide-panel');
  const status = byId('save-status');
  const search = byId('name-search');
  const kind = byId('kind-filter');
  const earnedFilter = byId('earned-filter');
  const missable = byId('missable-filter');
  const progressFile = byId('progress-file');

  if (shot) document.body.dataset.scene = shot;
  shield.checked = shot === 'tracker';
  const demoStatus = 'Progress saved locally in live view · demo';
  setStatus(shot ? demoStatus : stored.available ? 'Progress saved locally' : 'Local progress unavailable');

  function setStatus(message) {
    status.textContent = message;
  }

  function persistProgress() {
    if (shot) {
      setStatus(demoStatus);
      return;
    }
    setStatus(saveProgress(earned) ? 'Progress saved locally' : 'Could not save locally · export a backup');
  }

  function showGuide(trophy) {
    if (view === 'roadmap') {
      search.value = '';
      kind.value = '';
      earnedFilter.value = '';
      missable.checked = false;
    }
    view = 'checklist';
    activeTrophy = trophy;
    render();
    panel.querySelector('.guide-close')?.focus({ preventScroll: true });
    if (panel.getBoundingClientRect().top < 0 || panel.getBoundingClientRect().top > innerHeight - 100) {
      panel.scrollIntoView({ block: 'start' });
    }
  }

  function focusRow(id, selector) {
    (list.querySelector(`[data-id="${id}"] ${selector}`) ?? search).focus({ preventScroll: true });
  }

  function render() {
    const { checked, counts } = progressCounts(trophies, earned);
    const percentage = Math.round(checked.size / trophies.length * 100);
    const meter = byId('progress-meter');
    meter.max = trophies.length;
    meter.value = checked.size;
    byId('progress-total').replaceChildren(`${checked.size}/${trophies.length}`, element('span', `${percentage}%`));
    byId('grade-counts').replaceChildren(...grades.map(grade =>
      element('span', `${counts[grade].earned}/${counts[grade].total} ${grade}`, `grade-count ${grade}`)));

    const checklist = view === 'checklist';
    checklistButton.setAttribute('aria-pressed', String(checklist));
    roadmapButton.setAttribute('aria-pressed', String(!checklist));
    byId('checklist-view').hidden = !checklist;
    byId('roadmap-view').hidden = checklist;
    byId('shield-state').textContent = shield.checked ? 'ON' : 'OFF';
    if (!checklist) {
      renderRoadmap(byId('roadmap-stages'), stages, trophyById, {
        earned: checked, shield: shield.checked, openGuide: showGuide, overview: shot === 'roadmap',
      });
      return;
    }

    const visible = applyFilters(trophies, checked, {
      kind: kind.value, status: earnedFilter.value, missable: missable.checked,
      search: search.value, shield: shield.checked,
    });
    if (activeTrophy && !visible.includes(activeTrophy)) activeTrophy = null;
    byId('result-count').textContent = `${visible.length} of ${trophies.length} · Select a trophy to read its guide`;
    byId('checklist-layout').classList.toggle('has-guide', Boolean(activeTrophy));
    const rows = shot === 'guide' && activeTrophy
      ? [activeTrophy, ...visible.filter(trophy => trophy !== activeTrophy)]
      : visible;
    renderChecklist(list, rows, {
      total: trophies.length,
      earned: checked, shield: shield.checked, selected: activeTrophy?.id,
      onToggle(trophy) {
        toggleEarned(trophy, earned);
        persistProgress();
        render();
        focusRow(trophy.id, '.trophy-check');
      },
      onSelect: showGuide,
    });
    renderGuidePanel(panel, activeTrophy, {
      earned: checked, shield: shield.checked,
      onClose() {
        const previous = activeTrophy.id;
        activeTrophy = null;
        render();
        focusRow(previous, '.trophy-open');
      },
    });
  }

  for (const [button, nextView] of [[checklistButton, 'checklist'], [roadmapButton, 'roadmap']]) {
    button.addEventListener('click', () => {
      if (view === nextView) return;
      view = nextView;
      render();
      window.scrollTo(0, 0);
    });
  }
  search.addEventListener('input', render);
  for (const control of [kind, earnedFilter, missable, shield]) control.addEventListener('change', render);
  byId('export-progress').addEventListener('click', () => exportProgressJSON(earned));
  byId('import-progress').addEventListener('click', () => progressFile.click());
  progressFile.addEventListener('change', async () => {
    const file = progressFile.files[0];
    if (!file) return;
    try {
      earned = await importProgressJSON(file, manualIds);
      persistProgress();
      render();
    } catch (error) {
      setStatus(error instanceof SyntaxError ? 'Invalid JSON backup' : error.message);
    } finally {
      progressFile.value = '';
    }
  });

  render();
  await document.fonts.ready;
  if (shot) window.scrollTo(0, 0);
  window.__shotReady = true;
  document.documentElement.dataset.renderReady = String(window.__shotReady);
}

boot().catch(error => {
  byId('save-status').textContent = 'Codex unavailable';
  const banner = byId('app-error');
  banner.textContent = `The Codex could not start: ${error.message}`;
  banner.hidden = false;
  console.error(error);
});
