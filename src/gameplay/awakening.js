import { assert } from '../core/invariants.js';

function manifestationById(character, id) {
  return character.essence.manifestations.find((m) => m.id === id);
}

export function awakenManifestation(character, manifestationId, stoneName) {
  const manifestation = manifestationById(character, manifestationId);
  assert(manifestation, `Unknown manifestation: ${manifestationId}`);
  assert(manifestation.origin === 'awakening', 'Binding manifestations are innate and cannot be awakened by stones.');
  assert(manifestation.stone === stoneName, `Manifestation requires ${manifestation.stone}, not ${stoneName}.`);
  assert(!character.essence.awakenedIds.includes(manifestationId), 'Manifestation already awakened.');
  character.essence.awakenedIds.push(manifestationId);
  return manifestation;
}

export function setActiveLoadout(character, manifestationIds) {
  assert(Array.isArray(manifestationIds), 'Loadout must be an array.');
  assert(manifestationIds.length <= 5, 'Active loadout is limited to five manifestations.');
  assert(new Set(manifestationIds).size === manifestationIds.length, 'Loadout manifestations must be unique.');
  for (const id of manifestationIds) {
    const m = manifestationById(character, id);
    assert(m, `Unknown manifestation in loadout: ${id}`);
    assert(m.origin === 'binding' || character.essence.awakenedIds.includes(id), `Awakening manifestation is not yet awakened: ${id}`);
  }
  character.essence.activeLoadout = [...manifestationIds];
  return character.essence.activeLoadout;
}
