import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexSemanticDictionary } from '../src/content/semantic-dictionary.js';
import { createCharacter } from '../src/characters/character.js';
import { createWorldState } from '../src/world/state.js';
import { addEntity, nearbyEntities } from '../src/world/entities.js';
import { moveCharacter } from '../src/world/movement.js';
import { applyDamage, restoreResource } from '../src/combat/combat.js';

const dictionary = JSON.parse(await readFile(new URL('../canon/semantic-dictionary-v0.1.json', import.meta.url), 'utf8'));
const semantic = indexSemanticDictionary(dictionary);
const player = createCharacter({ id: 'player', name: 'Aren', path: 'Arcanist', nature: 'Cunning', baseEssenceIds: ['dark', 'blood', 'growth'], semantic });

test('world movement changes physical coordinates without a menu-based traversal abstraction', () => {
  const world = createWorldState({ seed: 88, player });
  const x0 = world.player.transform.x;
  moveCharacter(world.player, { x: 1, y: 0 }, 2, 4);
  assert.equal(world.player.transform.x, x0 + 8);
});

test('world entity proximity is coordinate based', () => {
  const world = createWorldState({ seed: 88, player: structuredClone(player) });
  addEntity(world, { id: 'npc:near', transform: { x: 2, y: 0, z: 1 } });
  addEntity(world, { id: 'npc:far', transform: { x: 30, y: 0, z: 1 } });
  const ids = nearbyEntities(world, world.player.transform, 5).map((e) => e.id);
  assert.deepEqual(ids, ['npc:near']);
});

test('combat resources are bounded and defeat state is explicit', () => {
  const c = structuredClone(player);
  const result = applyDamage(c, 999, 'enemy');
  assert.equal(c.resources.hp, 0);
  assert.equal(c.alive, false);
  assert.equal(result.defeated, true);
  const restored = restoreResource(c, 'hp', 999);
  assert.equal(c.resources.hp, c.resources.max.hp);
  assert.equal(restored, c.resources.max.hp);
});
