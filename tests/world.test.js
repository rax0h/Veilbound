import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorldState, advanceClock } from '../src/world/state.js';
import { normalizeStick } from '../src/runtime/input.js';

test('world clock advances without target feedback or hidden rescue rules', () => {
  const state = createWorldState({ seed: 42, player: { id: 'player', name: 'Aren' } });
  advanceClock(state, 1500);
  assert.equal(state.clock.day, 2);
  assert.equal(state.clock.minute, 540);
});

test('mobile stick normalization respects deadzone and unit range', () => {
  assert.deepEqual(normalizeStick(0.02, 0.02), { x: 0, y: 0 });
  const v = normalizeStick(1, 1);
  assert.ok(Math.hypot(v.x, v.y) <= 1.0000001);
});
