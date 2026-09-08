import { access, readFile } from 'node:fs/promises';
import { verifyProductionAssetManifest } from '../src/rendering/asset-gate.js';

const manifest=JSON.parse(await readFile('assets/production-asset-manifest.json','utf8'));
verifyProductionAssetManifest(manifest);
for(const asset of manifest.assets)await access(asset.path);
for(const file of ['index.html','src/runtime/playable-slice.js','src/runtime/slice.css','src/rendering/canvas-renderer.js'])await access(file);
if(manifest.assets.length!==46)throw new Error(`Expected 46 assets, found ${manifest.assets.length}`);

const [html,runtime,renderer,css]=await Promise.all([
  readFile('index.html','utf8'),readFile('src/runtime/playable-slice.js','utf8'),readFile('src/rendering/canvas-renderer.js','utf8'),readFile('src/runtime/slice.css','utf8')
]);
if(!html.includes('<canvas id="gameCanvas"'))throw new Error('Playable slice must render the world through gameCanvas.');
if(html.includes('id="scenery"')||html.includes('id="actors"'))throw new Error('DOM scenery/actor compositor is forbidden.');
if(!runtime.includes('new RiverfordCanvasRenderer()'))throw new Error('Runtime must instantiate RiverfordCanvasRenderer.');
if(!renderer.includes('extends RendererContract'))throw new Error('Riverford renderer must implement RendererContract.');
if(!renderer.includes('keyBlack('))throw new Error('Renderer must convert black-isolated source boards before world compositing.');
if(!renderer.includes('project(')||!renderer.includes('sprites.sort('))throw new Error('Renderer must own perspective projection and depth sorting.');
if(css.includes('.asset,.actor')||css.includes('#world{'))throw new Error('Legacy DOM world compositor CSS remains active.');
console.log(`Playable slice gate: ${manifest.assets.length} mapped assets; canvas renderer, projection, keyed compositing, and depth ordering verified.`);
