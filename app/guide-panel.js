import { isSpoilerHidden } from './filters.js';
import { gradeBadge, hiddenTitle } from './tracker.js';

export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function sourceLinks(sources) {
  const list = element('ul', '', 'source-links');
  for (const source of sources) {
    const link = element('a', source.name);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const item = element('li');
    item.append(link);
    list.append(item);
  }
  return list;
}

export function renderGuidePanel(panel, trophy, { earned, shield, onClose }) {
  panel.replaceChildren();
  panel.hidden = !trophy;
  if (!trophy) return;

  const hidden = isSpoilerHidden(trophy, earned, shield);
  const top = element('div', '', 'guide-top');
  const label = element('div', '', 'guide-label');
  label.append(gradeBadge(trophy.grade), element('span', `${trophy.grade} · ${trophy.kind}`, 'eyebrow'));
  const close = element('button', 'Close', 'guide-close');
  close.type = 'button';
  close.addEventListener('click', onClose);
  top.append(label, close);
  panel.append(top, element('h2', hidden ? hiddenTitle : trophy.name));

  if (hidden) {
    panel.append(element('p', 'Turn off the spoiler shield or mark this trophy earned to reveal its guide.'));
    return;
  }

  panel.append(element('p', trophy.description, 'guide-objective'));
  if (trophy.missable) {
    const warning = element('section', '', 'missable-box');
    warning.append(element('h3', '◆ Missable · Point of no return'), element('p', trophy.missableNote));
    panel.append(warning);
  }

  panel.append(element('h3', 'Unlock guide', 'section-label'), element('p', trophy.guide));
  const references = element('div', '', 'guide-references');
  if (trophy.steps?.length) {
    const steps = element('section');
    const list = element('ol', '', 'guide-steps');
    for (const step of trophy.steps) list.append(element('li', step));
    steps.append(element('h3', 'Steps', 'section-label'), list);
    references.append(steps);
  }
  const sources = element('section');
  sources.append(element('h3', 'Sources', 'section-label'), sourceLinks(trophy.sources));
  references.append(sources);
  panel.append(references);
}
