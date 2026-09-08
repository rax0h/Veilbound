import { access, readFile } from 'node:fs/promises';
import { verifyProductionAssetManifest } from '../src/rendering/asset-gate.js';

const manifest=JSON.parse(await readFile('assets/production-asset-manifest.json','utf8'));
verifyProductionAssetManifest(manifest);
if(manifest.scene!=='riverford-verge')throw new Error('Production manifest must identify the Riverford Verge scene.');
if(!Array.isArray(manifest.sourcePackages)||manifest.sourcePackages.length===0)throw new Error('Production archives are not declared.');
for(const asset of manifest.assets){
  await access(asset.path);
  if(asset.format!=='PNG'||!Number.isInteger(asset.width)||!Number.isInteger(asset.height)||asset.hasAlphaChannel!==true)throw new Error(`Transparent PNG metadata incomplete for ${asset.id}.`);
  if(!asset.referenceLineage.every(path=>path.startsWith('references/')))throw new Error(`Invalid lineage for ${asset.id}.`);
}
for(const file of ['index.html','src/runtime/playable-slice.js','src/runtime/slice.css','src/rendering/canvas-renderer.js'])await access(file);

const [html,runtime,renderer,css]=await Promise.all([
  readFile('index.html','utf8'),readFile('src/runtime/playable-slice.js','utf8'),readFile('src/rendering/canvas-renderer.js','utf8'),readFile('src/runtime/slice.css','utf8')
]);
if(!html.includes('<canvas id="gameCanvas"'))throw new Error('Playable slice must render the world through gameCanvas.');
if(html.includes('id="scenery"')||html.includes('id="actors"'))throw new Error('DOM scenery/actor compositor is forbidden.');
if(!runtime.includes('new RiverfordCanvasRenderer()'))throw new Error('Runtime must instantiate RiverfordCanvasRenderer.');
for(const feature of ['extends RendererContract','project(','sprites.sort(','this.camera','drawAtmosphere(','drawFx('])if(!renderer.includes(feature))throw new Error(`Renderer capability missing: ${feature}`);
for(const obsolete of ['keyBlack','getImageData(','globalCompositeOperation=\'screen\'','mix-blend-mode:screen'])if(renderer.includes(obsolete)||css.includes(obsolete))throw new Error(`Obsolete black-background compositor remains: ${obsolete}`);
if(css.includes('.asset,.actor')||css.includes('#world{'))throw new Error('Legacy DOM world compositor CSS remains active.');
for(const gameplay of ['moveCharacter(','dog.transform','interact()','startCombat()','applyDamage(','localStorage.setItem','aegisUntil','slashUntil'])if(!runtime.includes(gameplay))throw new Error(`Playable-slice wiring missing: ${gameplay}`);
console.log(`Playable slice gate: ${manifest.assets.length} transparent manifest assets from ${manifest.sourcePackages.length} archives; canvas perspective/depth renderer and gameplay wiring verified.`);
