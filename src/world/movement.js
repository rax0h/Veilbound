import { assert } from '../core/invariants.js';

export function moveCharacter(character, input, deltaSeconds, speed = 4.5) {
  assert(deltaSeconds >= 0 && Number.isFinite(deltaSeconds), 'deltaSeconds must be non-negative.');
  const magnitude = Math.hypot(input.x, input.y);
  if (magnitude === 0) {
    character.velocity.x = 0;
    character.velocity.z = 0;
    return character.transform;
  }
  const nx = input.x / Math.max(1, magnitude);
  const nz = input.y / Math.max(1, magnitude);
  character.velocity.x = nx * speed;
  character.velocity.z = nz * speed;
  character.transform.x += character.velocity.x * deltaSeconds;
  character.transform.z += character.velocity.z * deltaSeconds;
  character.transform.yaw = Math.atan2(character.velocity.x, character.velocity.z);
  return character.transform;
}
