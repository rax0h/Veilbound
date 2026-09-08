import { access, readFile } from 'node:fs/promises';
import { verifyProductionAssetManifest } from '../src/rendering/asset-gate.js';
const manifest = JSON.parse(await readFile('assets/production-asset-manifest.json', 'utf8'));
verifyProductionAssetManifest(manifest);
for (const asset of manifest.assets) await access(asset.path);
for (const file of ['index.html', 'src/runtime/playable-slice.js', 'src/runtime/slice.css']) await access(file);
if (manifest.assets.length !== 46) throw new Error(`Expected 46 assets, found ${manifest.assets.length}`);
console.log(`Playable slice gate: ${manifest.assets.length} mapped production assets; runtime entry points available.`);
