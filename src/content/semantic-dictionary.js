import { assert } from '../core/invariants.js';

export function indexSemanticDictionary(dictionary) {
  assert(dictionary && Array.isArray(dictionary.essences), 'Semantic dictionary is missing essences.');
  assert(dictionary.awakening_stones && typeof dictionary.awakening_stones === 'object', 'Semantic dictionary is missing awakening stones.');
  const essences = new Map(dictionary.essences.map((entry) => [entry.id, Object.freeze({ ...entry })]));
  assert(essences.size === dictionary.essences.length, 'Essence IDs must be unique.');
  return Object.freeze({
    raw: dictionary,
    essences,
    stones: Object.freeze(Array.isArray(dictionary.awakening_stones) ? [...dictionary.awakening_stones] : Object.keys(dictionary.awakening_stones)),
    getEssence(id) {
      const essence = essences.get(id);
      assert(essence, `Unknown Essence: ${id}`);
      return essence;
    },
  });
}
