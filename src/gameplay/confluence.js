import { assertEssenceSelection } from '../core/invariants.js';

function intersectionCount(a, b) {
  const set = new Set(a);
  return b.reduce((count, item) => count + (set.has(item) ? 1 : 0), 0);
}

function pairScore(a, b) {
  return (
    intersectionCount(a.semantic_adjacent ?? [], b.semantic_core ?? []) * 3 +
    intersectionCount(a.semantic_core ?? [], b.semantic_adjacent ?? []) * 3 +
    intersectionCount(a.suggested_functions ?? [], b.suggested_functions ?? []) * 2 +
    intersectionCount(a.suggested_domains ?? [], b.suggested_domains ?? [])
  );
}

export function generateConfluence(index, baseIds) {
  assertEssenceSelection(baseIds);
  const bases = baseIds.map((id) => index.getEssence(id));
  const pairs = [
    [bases[0], bases[1]],
    [bases[0], bases[2]],
    [bases[1], bases[2]],
  ].map(([a, b]) => ({ a, b, score: pairScore(a, b) }))
    .sort((x, y) => y.score - x.score || `${x.a.id}:${x.b.id}`.localeCompare(`${y.a.id}:${y.b.id}`));

  const strongest = pairs[0];
  const core = [...new Set(bases.flatMap((e) => e.semantic_core ?? []))];
  const functions = [...new Set(bases.flatMap((e) => e.suggested_functions ?? []))];
  const domains = [...new Set(bases.flatMap((e) => e.suggested_domains ?? []))];

  return Object.freeze({
    id: `confluence:${[...baseIds].sort().join('+')}`,
    name: `${strongest.a.name}–${strongest.b.name} Confluence`,
    kind: 'confluence',
    baseEssenceIds: Object.freeze([...baseIds]),
    semanticCore: Object.freeze(core),
    suggestedFunctions: Object.freeze(functions),
    suggestedDomains: Object.freeze(domains),
    synthesis: Object.freeze({
      dominantPair: Object.freeze([strongest.a.id, strongest.b.id]),
      pairScore: strongest.score,
      rule: 'Mechanics are derived from semantic overlap before prose or naming.',
    }),
  });
}
