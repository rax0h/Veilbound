import { SYSTEM_RULES, assertEssenceSelection, assertManifestationSet } from '../core/invariants.js';

const FORMS = Object.freeze(['technique', 'stance', 'reaction', 'field', 'summon', 'aura']);

function mechanicFor(essence, slot) {
  const functions = essence.suggested_functions?.length ? essence.suggested_functions : ['expression'];
  const domains = essence.suggested_domains?.length ? essence.suggested_domains : ['combat'];
  return Object.freeze({
    primaryFunction: functions[slot % functions.length],
    domain: domains[slot % domains.length],
    semanticAnchor: essence.semantic_core?.[slot % (essence.semantic_core?.length || 1)] ?? essence.name.toLowerCase(),
  });
}

export function buildManifestationBlueprint(index, baseIds, confluence, stones = index.stones) {
  assertEssenceSelection(baseIds);
  const essenceEntries = [...baseIds.map((id) => index.getEssence(id)), confluence];
  const manifestations = [];

  essenceEntries.forEach((essence, i) => {
    manifestations.push(Object.freeze({
      id: `binding:${essence.id}`,
      essenceId: essence.id,
      essenceName: essence.name,
      origin: 'binding',
      form: i === 0 ? 'aura' : FORMS[(i + 1) % (FORMS.length - 1)],
      slot: 0,
      mechanic: mechanicFor(essence, i),
      proseStatus: 'unwritten',
    }));
  });

  let awakeningOrdinal = 0;
  essenceEntries.forEach((essence, essenceIndex) => {
    for (let localSlot = 1; localSlot < SYSTEM_RULES.skillsPerEssence; localSlot += 1) {
      const stone = stones[awakeningOrdinal % stones.length];
      manifestations.push(Object.freeze({
        id: `awakening:${essence.id}:${localSlot}`,
        essenceId: essence.id,
        essenceName: essence.name,
        origin: 'awakening',
        stone,
        form: FORMS[(essenceIndex + localSlot) % (FORMS.length - 1)],
        slot: localSlot,
        mechanic: mechanicFor(essence, localSlot + essenceIndex),
        proseStatus: 'unwritten',
      }));
      awakeningOrdinal += 1;
    }
  });

  assertManifestationSet(manifestations);
  return Object.freeze(manifestations);
}
