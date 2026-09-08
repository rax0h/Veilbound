import { assert } from '../core/invariants.js';

export function addEntity(world, entity) {
  assert(entity?.id, 'Entity id is required.');
  assert(!world.entities.some((e) => e.id === entity.id), `Duplicate entity id: ${entity.id}`);
  world.entities.push(entity);
  return entity;
}

export function removeEntity(world, entityId) {
  const i = world.entities.findIndex((e) => e.id === entityId);
  if (i < 0) return false;
  world.entities.splice(i, 1);
  return true;
}

export function nearbyEntities(world, position, radius, predicate = () => true) {
  const r2 = radius * radius;
  return world.entities.filter((entity) => {
    const t = entity.transform;
    if (!t || !predicate(entity)) return false;
    const dx = t.x - position.x;
    const dz = t.z - position.z;
    return dx * dx + dz * dz <= r2;
  });
}
