export function isSpoilerHidden(trophy, earned, shield) {
  return shield && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function applyFilters(trophies, earned, filters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return trophies.filter(trophy => {
    const checked = earned.has(trophy.id);
    if (filters.kind && trophy.kind !== filters.kind) return false;
    if (filters.missable && !trophy.missable) return false;
    if (filters.status && checked !== (filters.status === 'earned')) return false;
    if (!query) return true;
    return !isSpoilerHidden(trophy, earned, filters.shield)
      && trophy.name.toLocaleLowerCase().includes(query);
  });
}
