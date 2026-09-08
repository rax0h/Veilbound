export const SYSTEM_RULES = Object.freeze({
  baseEssences: 3,
  confluenceEssences: 1,
  skillsPerEssence: 5,
  innateSkillsTotal: 4,
  stoneAwakenedSkillsTotal: 16,
  totalSkills: 20,
  auraTotal: 1,
});

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function assertEssenceSelection(ids) {
  assert(Array.isArray(ids), 'Essence selection must be an array.');
  assert(ids.length === SYSTEM_RULES.baseEssences, 'Exactly three base Essences are required.');
  assert(new Set(ids).size === ids.length, 'Base Essences must be unique.');
}

export function assertManifestationSet(manifestations) {
  assert(Array.isArray(manifestations), 'Manifestations must be an array.');
  assert(manifestations.length === SYSTEM_RULES.totalSkills, 'A complete character must have exactly 20 manifestations.');
  const bindings = manifestations.filter((m) => m.origin === 'binding');
  const awakenings = manifestations.filter((m) => m.origin === 'awakening');
  const auras = manifestations.filter((m) => m.form === 'aura');
  assert(bindings.length === SYSTEM_RULES.innateSkillsTotal, 'Exactly four Binding manifestations are required.');
  assert(awakenings.length === SYSTEM_RULES.stoneAwakenedSkillsTotal, 'Exactly sixteen Awakening manifestations are required.');
  assert(auras.length === SYSTEM_RULES.auraTotal, 'Exactly one Aura is required among the 20 manifestations.');
}
