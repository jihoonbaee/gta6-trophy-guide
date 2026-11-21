import { isSpoilerHidden } from './filters.js';
import { element, sourceLinks } from './guide-panel.js';
import { hiddenTitle } from './tracker.js';

export function renderRoadmap(container, stages, trophyById, { earned, shield, openGuide, overview }) {
  container.replaceChildren();
  const columns = overview ? Array.from({ length: 3 }, () => element('div', '', 'stage-column')) : [];
  if (overview) container.append(...columns);
  for (const stage of [...stages].sort((a, b) => a.stage - b.stage)) {
    const card = element('article', '', 'stage-card');
    card.dataset.stage = stage.stage;
    const heading = element('div', '', 'stage-heading');
    heading.append(element('span', String(stage.stage).padStart(2, '0'), 'stage-number'), element('h3', stage.title));
    card.append(heading);

    const description = element('p', stage.description, 'stage-description');
    if (overview) {
      const details = element('details', '', 'stage-description-toggle');
      details.append(element('summary', 'Read stage plan'), description);
      card.append(details);
    } else {
      card.append(description);
    }

    const trophies = stage.trophyIds.map(id => trophyById.get(id));
    const completed = trophies.filter(trophy => earned.has(trophy.id)).length;
    const targets = element('details', '', 'stage-trophies');
    targets.open = !overview;
    targets.append(element('summary', `Trophies · ${completed}/${trophies.length} earned`));
    const trophyList = element('ul');
    for (const trophy of trophies) {
      const name = isSpoilerHidden(trophy, earned, shield) ? hiddenTitle : trophy.name;
      const button = element('button', name, 'text-button');
      button.type = 'button';
      button.addEventListener('click', () => openGuide(trophy));
      const item = element('li');
      item.append(button);
      if (trophy.missable) item.append(element('span', '◆ Missable', 'missable-flag'));
      trophyList.append(item);
    }
    targets.append(trophyList);
    card.append(targets);

    const cutoffs = element('section', '', 'stage-cutoffs');
    cutoffs.append(element('h4', 'Points of no return', 'section-label'));
    if (stage.pointsOfNoReturn.length) {
      const list = element('ul');
      for (const point of stage.pointsOfNoReturn) list.append(element('li', point));
      cutoffs.append(list);
    } else {
      cutoffs.append(element('p', 'No cutoff documented.'));
    }
    card.append(cutoffs, element('h4', 'Sources', 'section-label'), sourceLinks(stage.sources));
    const column = columns[Math.floor(stage.stage / 2)] ?? container;
    column.append(card);
  }
}
