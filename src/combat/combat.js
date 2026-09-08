import { assert } from '../core/invariants.js';

export function createCombatState(participants) {
  assert(Array.isArray(participants) && participants.length >= 2, 'Combat requires at least two participants.');
  return {
    round: 1,
    elapsed: 0,
    participants: participants.map((p) => p.id),
    cooldowns: {},
    log: [],
  };
}

export function applyDamage(target, amount, sourceId = null) {
  assert(Number.isFinite(amount) && amount >= 0, 'Damage must be non-negative.');
  const before = target.resources.hp;
  target.resources.hp = Math.max(0, before - amount);
  if (target.resources.hp === 0) target.alive = false;
  return { sourceId, targetId: target.id, amount: before - target.resources.hp, defeated: !target.alive };
}

export function restoreResource(target, resource, amount) {
  assert(['hp', 'focus', 'stamina'].includes(resource), `Unknown resource: ${resource}`);
  assert(Number.isFinite(amount) && amount >= 0, 'Restore amount must be non-negative.');
  const max = target.resources.max[resource];
  const before = target.resources[resource];
  target.resources[resource] = Math.min(max, before + amount);
  return target.resources[resource] - before;
}
