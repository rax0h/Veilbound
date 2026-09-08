# Production Asset Inventory

`assets/production-asset-manifest.json` is the machine-readable authority for the Riverford Verge runtime set. It records each asset's source archive, canonical installed path, dimensions, PNG format, alpha-channel metadata, production class, and reference lineage. The inventory is derived from the archives that are committed under `assets/`; it does not rely on a fixed package or asset count.

Run `npm run assets:materialize` to validate every archive member against the manifest and atomically install the runtime files. Materialization rejects traversal, links, encryption, duplicate paths, missing files, unexpected PNGs, archive/source mismatches, malformed PNG headers, and metadata drift. Runtime directories are generated and ignored by Git.

The renderer consumes PNG transparency directly with normal canvas alpha compositing. No black-key conversion or screen-blend isolation workflow is supported. Consequently, a transparent production upload must declare `hasAlphaChannel: true`; the materializer will fail if the PNG's actual metadata disagrees.

## Current archive inventory

| Archive | Runtime families |
|---|---|
| `veilbound-gs-pack1-environment.zip` | terrain, water, vegetation, architecture, ruins, infrastructure, rocks, and props |
| `veilbound-gs-pack2-characters-ui.zip` | player/NPC art, creatures, atmosphere, and interface frames |

For the complete per-file inventory, inspect the manifest or run:

```bash
node -e "const m=require('./assets/production-asset-manifest.json'); console.table(m.assets.map(({path,width,height,format,hasAlphaChannel,sourceZip})=>({path,width,height,format,hasAlphaChannel,sourceZip})))"
```
