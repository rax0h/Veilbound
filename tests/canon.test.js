import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexSemanticDictionary } from '../src/content/semantic-dictionary.js';
import { generateConfluence } from '../src/gameplay/confluence.js';
import { buildManifestationBlueprint } from '../src/gameplay/manifestations.js';
import { SYSTEM_RULES } from '../src/core/invariants.js';

const dictionary = JSON.parse(await readFile(new URL('../canon/semantic-dictionary-v0.1.json', import.meta.url), 'utf8'));
const semantic = indexSemanticDictionary(dictionary);

test('semantic dictionary preserves the locked system counts', () => {
  assert.equal(dictionary.system_rules.base_essences, SYSTEM_RULES.baseEssences);
  assert.equal(dictionary.system_rules.confluence_essences, SYSTEM_RULES.confluenceEssences);
  assert.equal(dictionary.system_rules.skills_per_essence, SYSTEM_RULES.skillsPerEssence);
  assert.equal(dictionary.system_rules.total_skills, SYSTEM_RULES.totalSkills);
  assert.equal(dictionary.essences.length, 62);
  assert.equal(Object.keys(dictionary.awakening_stones).length, 7);
});

test('character pipeline produces 3 base + 1 confluence and exactly 20 manifestations', () => {
  const baseIds = ['dark', 'blood', 'growth'];
  const confluence = generateConfluence(semantic, baseIds);
  assert.deepEqual(confluence.baseEssenceIds, baseIds);
  const manifestations = buildManifestationBlueprint(semantic, baseIds, confluence);
  assert.equal(manifestations.length, 20);
  assert.equal(manifestations.filter((m) => m.origin === 'binding').length, 4);
  assert.equal(manifestations.filter((m) => m.origin === 'awakening').length, 16);
  assert.equal(manifestations.filter((m) => m.form === 'aura').length, 1);
});
