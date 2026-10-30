import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFavoriteSyncText,
  mergeFavoriteIds,
  parseFavoriteSyncText,
} from '../../src/favorite-sync.js';

const questions = [
  { id: 2, stem: 'First' },
  { id: 8, stem: 'Second' },
  { id: 21, stem: 'Third' },
];

test('favorite sync exports stable bank ids and visible question numbers', () => {
  const text = buildFavoriteSyncText({
    bankId: 'core2',
    bankLabel: 'Core 2 English Question Bank',
    questions,
    favoriteIds: [21, 2],
  });

  assert.match(text, /CtestFavorites-v1/);
  assert.match(text, /bank=core2/);
  assert.match(text, /ids=21,2/);
  assert.match(text, /numbers=3,1/);
});

test('favorite sync imports explicit ids for the current bank', () => {
  const parsed = parseFavoriteSyncText('CtestFavorites-v1\nbank=core2\nids=21,999,2', questions);

  assert.deepEqual(parsed, {
    bankId: 'core2',
    ids: [21, 2],
  });
});

test('favorite sync treats plain numbers as visible question numbers', () => {
  const parsed = parseFavoriteSyncText('3, 1, 99', questions);

  assert.deepEqual(parsed.ids, [21, 2]);
});

test('favorite sync merge preserves imported order and existing favorites', () => {
  assert.deepEqual(mergeFavoriteIds([8, 2], [21, 8]), [21, 8, 2]);
});

