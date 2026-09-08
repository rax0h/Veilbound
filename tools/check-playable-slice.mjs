import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { verifyProductionAssetManifest } from '../src/rendering/asset-gate.js';

const manifest = JSON.parse(await readFile('assets/production-asset-manifest.json', 'utf8'));
const declared = new Set(manifest.assets.map((asset) => asset.output.path));
verifyProductionAssetManifest({ ...manifest, assets: manifest.assets.map((asset) => ({ ...asset, path: asset.output.path })) });
if (declared.size !== 46) throw new Error(`Expected 46 unique outputs, found ${declared.size}`);
for (const asset of manifest.assets) {
  await access(asset.source.zip);
  await access(asset.output.path);
  const [x0, y0, x1, y1] = asset.source.crop;
  if (!(0 <= x0 && x0 < x1 && x1 <= asset.source.width && 0 <= y0 && y0 < y1 && y1 <= asset.source.height)) {
    throw new Error(`Out-of-bounds crop: ${asset.id}`);
  }
  if (asset.output.format !== 'PNG' || asset.output.alpha.required !== true) throw new Error(`Invalid output contract: ${asset.id}`);
}

const runtimeFiles = ['index.html', 'src/runtime/playable-slice.js', 'src/runtime/slice.css'];
const runtimeText = (await Promise.all(runtimeFiles.map((file) => readFile(file, 'utf8')))).join('\n');
const references = [...runtimeText.matchAll(/(?:environment|props|characters|creatures|atmosphere|ui)\/[A-Za-z0-9_\-/.]+\.png/g)].map((match) => `.runtime/assets/${match[0]}`);
for (const reference of references) if (!declared.has(reference)) throw new Error(`Undeclared runtime art: ${reference}`);
if (/mix-blend-mode\s*:\s*screen/.test(runtimeText)) throw new Error('Screen blending is forbidden for generated runtime art.');
for (const id of ['touchControls', 'joystick', 'touchInteract', 'touchAttack', 'touchCast']) {
  if (!runtimeText.includes(id)) throw new Error(`Missing mobile control: ${id}`);
}

const tracked = execFileSync('git', ['ls-files', '-z', '.runtime', 'assets/atmosphere', 'assets/characters', 'assets/creatures', 'assets/environment', 'assets/props', 'assets/ui'])
  .toString().split('\0').filter(Boolean);
if (tracked.some((path) => /\.(png|jpe?g|webp)$/i.test(path))) throw new Error(`Generated binary is tracked: ${tracked.join(', ')}`);
console.log(`PASS — slice gate verified ${declared.size} generated assets, ${references.length} runtime references, touch controls, and zero tracked generated binaries.`);
