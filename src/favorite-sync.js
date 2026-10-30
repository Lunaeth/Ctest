const SYNC_HEADER = 'CtestFavorites-v1';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueIds(ids = []) {
  const seen = new Set();
  const result = [];

  for (const id of ids.map(Number)) {
    if (!Number.isFinite(id) || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }

  return result;
}

function parseNumberList(value) {
  return String(value ?? '')
    .match(/\d+/g)
    ?.map(Number)
    .filter((number) => Number.isInteger(number) && number > 0) ?? [];
}

function getQuestionRows(questions = [], favoriteIds = []) {
  const indexById = new Map(questions.map((question, index) => [Number(question.id), index + 1]));
  const validIds = new Set(indexById.keys());

  return uniqueIds(favoriteIds)
    .filter((id) => validIds.has(id))
    .map((id) => ({
      id,
      number: indexById.get(id),
    }));
}

function parseFields(text) {
  const fields = {};

  for (const line of String(text ?? '').split(/\r?\n/)) {
    const match = line.match(/^\s*([a-zA-Z]+)\s*[:=]\s*(.*?)\s*$/);
    if (!match) continue;
    fields[match[1].toLowerCase()] = match[2];
  }

  return fields;
}

export function buildFavoriteSyncText({
  bankId = '',
  bankLabel = '',
  questions = [],
  favoriteIds = [],
} = {}) {
  const rows = getQuestionRows(questions, favoriteIds);

  return [
    SYNC_HEADER,
    `bank=${bankId}`,
    `label=${bankLabel}`,
    `ids=${rows.map((row) => row.id).join(',')}`,
    `numbers=${rows.map((row) => row.number).join(',')}`,
  ].join('\n');
}

export function parseFavoriteSyncText(text, questions = []) {
  const rawText = String(text ?? '').trim();
  const fields = parseFields(rawText);
  const validIds = new Set(questions.map((question) => Number(question.id)));
  const hasExplicitIds = Boolean(fields.ids || fields.id);
  const explicitIds = parseNumberList(fields.ids ?? fields.id);
  const visibleNumbers = parseNumberList(fields.numbers ?? fields.number ?? rawText);
  const ids = hasExplicitIds
    ? explicitIds.filter((id) => validIds.has(id))
    : visibleNumbers
      .map((number) => questions[number - 1]?.id)
      .filter((id) => id !== undefined);

  return {
    bankId: fields.bank ?? fields.bankid ?? '',
    ids: uniqueIds(ids),
  };
}

export function mergeFavoriteIds(currentFavoriteIds = [], importedFavoriteIds = []) {
  const imported = uniqueIds(importedFavoriteIds);
  const importedSet = new Set(imported);

  return [
    ...imported,
    ...asArray(currentFavoriteIds)
      .map(Number)
      .filter((id) => Number.isFinite(id) && !importedSet.has(id)),
  ];
}

