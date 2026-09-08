import test from 'node:test';
import assert from 'node:assert/strict';
import { VISUAL_CONTRACT } from '../src/rendering/contracts.js';
import { verifyProductionAssetManifest } from '../src/rendering/asset-gate.js';

test('camera contract matches locked Reference Zero framing', () => {
  assert.equal(VISUAL_CONTRACT.camera.mode, 'elevated-forward-three-quarter');
  assert.equal(VISUAL_CONTRACT.camera.playerScreenHeightMin, 0.10);
  assert.equal(VISUAL_CONTRACT.camera.playerScreenHeightMax, 0.14);
  assert.equal(VISUAL_CONTRACT.camera.orthographicAllowed, false);
  assert.equal(VISUAL_CONTRACT.camera.worldDominatesFrame, true);
});

test('asset gate refuses reference boards, SVG placeholders and incomplete character sets', () => {
  assert.throws(() => verifyProductionAssetManifest({ status: 'production', assets: [{ id: 'bad', path: 'references/reference-zero.png', class: 'environment', status: 'production', referenceLineage: ['references/reference-zero.png'] }] }));
  assert.throws(() => verifyProductionAssetManifest({ status: 'production', assets: [{ id: 'bad', path: 'assets/bad.svg', class: 'environment', status: 'production', referenceLineage: ['references/reference-zero.png'] }] }));
  assert.throws(() => verifyProductionAssetManifest({ status: 'production', assets: [{ id: 'hero', path: 'assets/hero.webp', class: 'exploration_body', characterId: 'hero', status: 'production', referenceLineage: ['references/reference-zero.png'] }] }));
});
