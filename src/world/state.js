import { assert } from '../core/invariants.js';

export const CAMERA_CONTRACT = Object.freeze({
  mode: 'elevated-forward-three-quarter',
  playerScreenHeightMin: 0.10,
  playerScreenHeightMax: 0.14,
  orthographicAllowed: false,
  worldDominatesFrame: true,
});

export function createWorldState({ seed, player }) {
  assert(seed !== undefined && seed !== null, 'World seed is required.');
  assert(player?.id, 'Player identity is required.');
  return {
    version: 1,
    seed: String(seed),
    clock: { day: 1, minute: 8 * 60 },
    weather: { kind: 'clear', intensity: 0 },
    player: {
      ...player,
      transform: { x: 0, y: 0, z: 0, yaw: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    },
    region: { id: 'unassigned', loadedScene: null },
    entities: [],
    flags: {},
  };
}

export function advanceClock(state, deltaMinutes) {
  assert(Number.isFinite(deltaMinutes) && deltaMinutes >= 0, 'deltaMinutes must be non-negative.');
  const total = state.clock.minute + deltaMinutes;
  state.clock.day += Math.floor(total / 1440);
  state.clock.minute = total % 1440;
  return state;
}
