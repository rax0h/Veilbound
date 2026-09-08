import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applyDamage } from '../src/combat/combat.js';
import { PointerJoystick } from '../src/runtime/joystick.js';
import { restoreSlice, snapshotSlice } from '../src/runtime/slice-state.js';
import { serializeSave } from '../src/runtime/save.js';

test('pointer joystick supports cardinal, diagonal, deadzone, and release', () => {
  const stick = new PointerJoystick(100, 0.12);
  const bounds = { left: 0, top: 0, width: 200, height: 200 };
  assert.deepEqual(stick.begin(7, 100, 100, bounds), { x: 0, y: 0 });
  assert.deepEqual(stick.update(7, 200, 100), { x: 1, y: 0 });
  const diagonal = stick.update(7, 200, 200);
  assert.ok(Math.abs(diagonal.x - Math.SQRT1_2) < 0.0001);
  assert.ok(Math.abs(diagonal.y - Math.SQRT1_2) < 0.0001);
  assert.deepEqual(stick.end(7), { x: 0, y: 0 });
});

test('wolf authoritative defeat state survives save restoration', () => {
  const makePlayer = () => ({ transform: { x: 4, y: 0, z: 8 }, resources: { hp: 70, max: { hp: 140 } } });
  const wolf = { id: 'wolf', alive: true, resources: { hp: 5, max: { hp: 72 } } };
  applyDamage(wolf, 20, 'player');
  assert.equal(wolf.alive, false);
  const text = serializeSave(snapshotSlice(makePlayer(), [wolf]));
  const restoredPlayer = makePlayer();
  const restoredWolf = { id: 'wolf', alive: true };
  restoreSlice(text, restoredPlayer, [restoredWolf]);
  assert.equal(restoredWolf.alive, false);
  assert.deepEqual(restoredPlayer.transform, { x: 4, y: 0, z: 8 });
  assert.equal(restoredPlayer.resources.hp, 70);
});

test('runtime retains production movement/combat and keyboard/touch actions', async () => {
  const code = await readFile('src/runtime/playable-slice.js', 'utf8');
  assert.match(code, /moveCharacter/);
  assert.match(code, /applyDamage/);
  assert.match(code, /ArrowRight|arrowright/);
  assert.match(code, /touchInteract/);
  assert.match(code, /touchAttack/);
  assert.match(code, /touchCast/);
});
