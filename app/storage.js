const progressKey = 'vice-city-trophy-codex:progress:v1';

function encodeProgress(earned) {
  const earnedIds = [...earned].sort((left, right) => left - right);
  return JSON.stringify({ version: 1, earnedIds }, null, 2);
}

function decodeProgress(text, allowedIds) {
  const data = JSON.parse(text);
  if (data?.version !== 1 || !Array.isArray(data.earnedIds)
    || data.earnedIds.some(id => !allowedIds.has(id))) {
    throw new Error('This file is not a Codex progress backup.');
  }
  return new Set(data.earnedIds);
}

export function loadProgress(allowedIds) {
  try {
    const stored = localStorage.getItem(progressKey);
    return { earned: stored ? decodeProgress(stored, allowedIds) : new Set(), available: true };
  } catch {
    return { earned: new Set(), available: false };
  }
}

export function saveProgress(earned) {
  try {
    localStorage.setItem(progressKey, encodeProgress(earned));
    return true;
  } catch {
    return false;
  }
}

export function exportProgressJSON(earned) {
  const url = URL.createObjectURL(new Blob([encodeProgress(earned)], { type: 'application/json' }));
  const download = document.createElement('a');
  download.href = url;
  download.download = 'vice-city-codex-progress.json';
  document.body.append(download);
  download.click();
  download.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importProgressJSON(file, allowedIds) {
  if (file.size > 65536) throw new Error('The progress backup is too large.');
  return decodeProgress(await file.text(), allowedIds);
}
