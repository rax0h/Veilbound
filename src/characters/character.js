import { assert, assertEssenceSelection } from '../core/invariants.js';
import { generateConfluence } from '../gameplay/confluence.js';
import { buildManifestationBlueprint } from '../gameplay/manifestations.js';

const PATH_BASE = Object.freeze({
  Vanguard: { hp: 130, focus: 70, stamina: 115 },
  Warden: { hp: 120, focus: 80, stamina: 110 },
  Acolyte: { hp: 100, focus: 120, stamina: 90 },
  Rogue: { hp: 95, focus: 85, stamina: 130 },
  Arcanist: { hp: 90, focus: 140, stamina: 85 },
  Shaper: { hp: 105, focus: 115, stamina: 100 },
});

const NATURE_MOD = Object.freeze({
  Valiant: { hp: 10, focus: 0, stamina: 5 },
  Cunning: { hp: 0, focus: 10, stamina: 5 },
  Ruthless: { hp: 5, focus: 5, stamina: 10 },
});

export function createCharacter({
  id,
  name,
  path,
  nature,
  baseEssenceIds,
  semantic,
  position = { x: 0, y: 0, z: 0, yaw: 0 },
  faction = 'independent',
  importance = 'ordinary',
}) {
  assert(id && typeof id === 'string', 'Character id is required.');
  assert(name && typeof name === 'string', 'Character name is required.');
  assert(PATH_BASE[path], `Unknown path: ${path}`);
  assert(NATURE_MOD[nature], `Unknown nature: ${nature}`);
  assertEssenceSelection(baseEssenceIds);

  const confluence = generateConfluence(semantic, baseEssenceIds);
  const manifestations = buildManifestationBlueprint(semantic, baseEssenceIds, confluence);
  const base = PATH_BASE[path];
  const mod = NATURE_MOD[nature];
  const max = Object.freeze({
    hp: base.hp + mod.hp,
    focus: base.focus + mod.focus,
    stamina: base.stamina + mod.stamina,
  });

  return {
    id,
    name,
    faction,
    importance,
    path,
    nature,
    essence: {
      baseIds: [...baseEssenceIds],
      confluence,
      manifestations: [...manifestations],
      awakenedIds: [],
      activeLoadout: manifestations.slice(0, 5).map((m) => m.id),
    },
    resources: { ...max, max },
    conditions: [],
    transform: { ...position },
    velocity: { x: 0, y: 0, z: 0 },
    alive: true,
  };
}

export function assertCharacterParity(character) {
  assert(character?.essence?.baseIds?.length === 3, 'Every important character uses three base Essences.');
  assert(character?.essence?.confluence?.kind === 'confluence', 'Every important character uses one Confluence.');
  assert(character?.essence?.manifestations?.length === 20, 'Every important character uses the 20-manifestation engine.');
  return true;
}
