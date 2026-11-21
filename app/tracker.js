import { isSpoilerHidden } from './filters.js';

export const grades = ['bronze', 'silver', 'gold', 'platinum'];
export const hiddenTitle = '??? — hidden until earned';

export function toggleEarned(trophy, earned) {
  if (trophy.grade === 'platinum') return;
  if (earned.has(trophy.id)) earned.delete(trophy.id);
  else earned.add(trophy.id);
}

export function progressCounts(trophies, earned) {
  const checked = new Set(earned);
  const platinum = trophies.find(trophy => trophy.grade === 'platinum');
  if (platinum) {
    checked.delete(platinum.id);
    if (trophies.every(trophy => trophy === platinum || checked.has(trophy.id))) checked.add(platinum.id);
  }
  const counts = Object.fromEntries(grades.map(grade => [grade, { earned: 0, total: 0 }]));
  for (const trophy of trophies) {
    counts[trophy.grade].total++;
    if (checked.has(trophy.id)) counts[trophy.grade].earned++;
  }
  return { checked, counts };
}

export function gradeBadge(grade) {
  const badge = document.createElement('span');
  badge.className = `grade ${grade}`;
  badge.textContent = grade[0].toUpperCase();
  badge.title = grade;
  badge.setAttribute('aria-label', grade);
  return badge;
}

export function renderChecklist(list, trophies, { total, earned, shield, selected, onToggle, onSelect }) {
  list.replaceChildren();
  if (!trophies.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No trophies match these filters.';
    list.append(empty);
    return;
  }

  for (const trophy of trophies) {
    const hidden = isSpoilerHidden(trophy, earned, shield);
    const platinum = trophy.grade === 'platinum';
    const name = hidden ? hiddenTitle : trophy.name;
    const row = document.createElement('li');
    row.className = 'trophy-row';
    row.dataset.id = trophy.id;
    row.classList.toggle('row-earned', earned.has(trophy.id));
    row.classList.toggle('row-selected', trophy.id === selected);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'trophy-check';
    checkbox.checked = earned.has(trophy.id);
    checkbox.disabled = platinum;
    checkbox.setAttribute('aria-label', `Earned: ${name}`);
    checkbox.addEventListener('change', () => onToggle(trophy));

    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'trophy-open';
    open.setAttribute('aria-controls', 'guide-panel');
    open.setAttribute('aria-expanded', String(trophy.id === selected));
    open.addEventListener('click', () => onSelect(trophy));

    const copy = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = name;
    title.classList.toggle('redacted', hidden);
    copy.append(title);

    if (!hidden) {
      const description = document.createElement('span');
      description.className = 'trophy-description';
      description.textContent = trophy.description;
      copy.append(description);
    }

    const flags = document.createElement('span');
    flags.className = 'row-flags';
    if (trophy.missable) {
      const flag = document.createElement('span');
      flag.className = 'missable-flag';
      flag.textContent = '◆ Missable';
      flags.append(flag);
    }
    flags.append(gradeBadge(trophy.grade));
    open.append(copy, flags);
    if (platinum) {
      const note = document.createElement('span');
      note.className = 'platinum-note';
      note.textContent = `Unlocks when all ${total - 1} others are earned`;
      open.append(note);
    }
    row.append(checkbox, open);
    list.append(row);
  }
}
