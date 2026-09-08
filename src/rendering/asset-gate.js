import { assert } from '../core/invariants.js';
import { VISUAL_CONTRACT } from './contracts.js';

const FORBIDDEN_RUNTIME_PREFIXES = Object.freeze(['references/', 'visual/references/']);
const FORBIDDEN_EXTENSIONS = Object.freeze(['.svg']);

export function verifyProductionAssetManifest(manifest) {
  assert(manifest?.status === 'production', 'Asset manifest must be explicitly marked production.');
  assert(Array.isArray(manifest.assets) && manifest.assets.length > 0, 'Production manifest must contain assets.');
  for (const asset of manifest.assets) {
    assert(asset.id && asset.path && asset.class, 'Every production asset requires id, path, and class.');
    assert(asset.status === 'production', `Asset ${asset.id} is not production-approved.`);
    assert(Array.isArray(asset.referenceLineage) && asset.referenceLineage.length > 0, `Asset ${asset.id} lacks reference lineage.`);
    assert(!FORBIDDEN_RUNTIME_PREFIXES.some((prefix) => asset.path.startsWith(prefix)), `Asset ${asset.id} illegally loads a reference-board path.`);
    assert(!FORBIDDEN_EXTENSIONS.some((ext) => asset.path.toLowerCase().endsWith(ext)), `Asset ${asset.id} uses a forbidden placeholder/vector runtime format.`);
  }

  const characterGroups = new Map();
  for (const asset of manifest.assets.filter((a) => a.characterId)) {
    const set = characterGroups.get(asset.characterId) ?? new Set();
    set.add(asset.class);
    characterGroups.set(asset.characterId, set);
  }
  for (const [characterId, classes] of characterGroups) {
    for (const required of VISUAL_CONTRACT.characterAssetClasses) {
      assert(classes.has(required), `Character ${characterId} is missing ${required}.`);
    }
  }
  return true;
}
