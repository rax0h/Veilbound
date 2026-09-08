import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexSemanticDictionary } from '../src/content/semantic-dictionary.js';
import { createCharacter, assertCharacterParity } from '../src/characters/character.js';
import { awakenManifestation, setActiveLoadout } from '../src/gameplay/awakening.js';

const dictionary = JSON.parse(await readFile(new URL('../canon/semantic-dictionary-v0.1.json', import.meta.url), 'utf8'));
const semantic = indexSemanticDictionary(dictionary);

function make(id, importance) {
  return createCharacter({ id, name: id, path: 'Warden', nature: 'Valiant', baseEssenceIds: ['dark', 'blood', 'growth'], semantic, importance });
}

test('protagonist and important NPCs use the same Essence/Confluence/manifestation engine', () => {
  const player = make('player', 'protagonist');
  const npc = make('npc:ilyra', 'important');
  assertCharacterParity(player);
  assertCharacterParity(npc);
  assert.equal(player.essence.manifestations.length, npc.essence.manifestations.length);
  assert.equal(player.essence.manifestations.filter((m) => m.form === 'aura').length, 1);
  assert.equal(npc.essence.manifestations.filter((m) => m.form === 'aura').length, 1);
});

test('stone awakening is explicit and loadout rejects locked manifestations', () => {
  const c = make('player', 'protagonist');
  const awakening = c.essence.manifestations.find((m) => m.origin === 'awakening');
  assert.throws(() => setActiveLoadout(c, [awakening.id]));
  awakenManifestation(c, awakening.id, awakening.stone);
  assert.deepEqual(setActiveLoadout(c, [awakening.id]), [awakening.id]);
});
