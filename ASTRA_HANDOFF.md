# ASTRA HANDOFF — VEILBOUND

## Purpose
You are taking over Veilbound from the current `main` branch. Do not reconstruct this project from chat history. Treat the repository itself as the primary source of truth, verify the current state directly, and continue from there.

Your job is to finish the **Riverford Verge full-art playable slice** to a convincing, coherent, demo-ready standard using the production systems and art already in this repository.

## Authority order
When files disagree, use this order:

1. **Current code, current assets, current manifest, tests, and current `main` branch behavior** for implementation status.
2. **Locked canon and visual contracts** for creative/semantic constraints, especially `docs/VISUAL_CONSTITUTION.md`, the canon files, semantic dictionary, rendering contracts, and reference set.
3. `README.md` and factual status docs for orientation.
4. Historical handoff/migration notes only as background.

Important: `CODEX_HANDOFF.md` and parts of `MIGRATION_STATUS.md` contain stale GS001-era asset progress. Do **not** restart one-at-a-time asset production or assume the production art is missing just because those historical notes say so.

## Current operational state
As of 2026-09-08:

- The production scene is `riverford-verge`.
- `assets/production-asset-manifest.json` points at two Gold Standard source archives.
- The asset materializer currently verifies and materializes **46 transparent production PNGs** from those archives.
- Normal authored alpha is used. Do not reintroduce black-keying, screen blending, fake transparency, reference-board runtime usage, SVG placeholders, or flat primitive fallback art.
- A browser slice exists in `index.html`, `src/runtime/playable-slice.js`, `src/rendering/canvas-renderer.js`, and `src/runtime/slice.css`.
- The slice includes exploration movement, dog following, farmer interaction, a dire-wolf encounter, combat/resource handling, Verdant Aegis effects, save/restore, HUD/dialogue, keyboard controls, and current mobile touch controls.
- GitHub Pages deployment exists at `.github/workflows/deploy-playable-slice.yml` and publishes from `main`.
- The live project URL is `https://rax0h.github.io/Veilbound/`.
- The latest known deployment before this handoff completed successfully after the mobile-control/runtime fixes.

Do not interpret the existence of a passing build as visual acceptance. The current slice has only recently moved from asset-pipeline work into actual visual/gameplay acceptance.

## What the user actually wants
The target is not a technical proof, asset viewer, concept image, mockup, or "working enough" prototype.

The target is a **fully fleshed-out, full-art, playable Riverford Verge demo slice** that immediately reads as a real Veilbound game scene.

The user has repeatedly rejected:

- generated concept images instead of implementation,
- placeholder-looking browser composition,
- flat asset collages,
- giant character cutouts,
- repeated terrain strips,
- crude top-down/mobile-board presentation,
- changing direction away from the locked plan,
- declaring success just because manifests/tests pass.

Do not generate replacement concept art as a substitute for implementing the game. Use the existing production assets and systems first. Only propose new art if a concrete missing asset is proven to block the final scene.

## Locked visual target
Read `docs/VISUAL_CONSTITUTION.md` before changing presentation.

Non-negotiable visual rules include:

- premium illustrated fantasy realism / stylized realism,
- beauty before darkness,
- elevated forward-looking three-quarter gameplay camera,
- perspective-rich world presentation,
- player roughly 10–14% of screen height in standard exploration,
- world dominates the frame,
- readable foreground / midground / distance,
- atmospheric depth and warm/cool separation,
- materially credible terrain, water, stone, timber, foliage, fur, cloth, etc.,
- restrained ornate fantasy UI,
- minimal mobile overlays,
- no primitive final geometry, giant HUD slabs, generic mobile-game look, portrait-as-sprite shortcuts, reference boards at runtime, or single-plane backgrounds.

Use the repository reference material as the visual north star, especially Reference Zero and its locked camera/composition intent.

## First actions
Before redesigning anything:

1. Inspect the entire repository tree and current `main` branch.
2. Read at minimum:
   - `README.md`
   - this file
   - `docs/VISUAL_CONSTITUTION.md`
   - `docs/IMPLEMENTATION_STATUS.md`
   - `assets/production-asset-manifest.json`
   - `src/rendering/contracts.js`
   - `src/world/state.js`
   - `src/rendering/canvas-renderer.js`
   - `src/runtime/playable-slice.js`
   - `src/runtime/slice.css`
   - `.github/workflows/deploy-playable-slice.yml`
   - relevant tests and verification tools
   - canon/reference materials relevant to Riverford and the visual constitution.
3. Run the current verification path before editing:
   - `npm run assets:materialize`
   - `npm run check:slice`
   - `npm test`
   - `npm run verify`
4. Run the slice locally with `npm start` and inspect it visually at both desktop and phone-sized viewports.
5. Inspect the deployed GitHub Pages version as well when useful.

## Current priority
The main remaining problem is **presentation quality and scene construction**, not asset plumbing.

Focus on the actual playable result:

- camera framing and perspective,
- character/creature scale,
- terrain treatment,
- depth and occlusion,
- scene composition,
- environmental density without collage-like stacking,
- architecture placement,
- path/river/bridge readability,
- atmosphere that supports rather than obscures the scene,
- believable spatial relationships,
- combat readability and hit feedback,
- polished HUD/dialogue,
- mobile safe-area behavior and touch controls,
- desktop controls,
- smooth save/interaction loop,
- reliable deployment.

Recent fixes already removed an especially bad repeated terrain-band approach and reduced severe mobile overscaling. Do not revert those problems.

## Preserve these foundations
Unless a failing test or direct inspection proves otherwise, do not rewrite working foundations just for novelty:

- closed simulation/canon,
- Essence/Confluence/manifestation semantics,
- production asset manifest/materializer contract,
- authored PNG alpha pipeline,
- reference-board runtime prohibition,
- `RendererContract` / camera contract intent,
- coordinate-based movement and combat primitives,
- GitHub Pages deployment path.

You may refactor the renderer/runtime when it materially improves the finished slice, but preserve the project contracts and tests.

## Definition of done for this handoff
Do not call the slice finished until all of the following are true:

- It launches cleanly from the repository and from the deployed Pages URL.
- Production art loads with correct transparency and no obvious cutout/background artifacts.
- Standard exploration framing satisfies the visual constitution, including player scale and world-dominant composition.
- The environment reads as one coherent place, not a collection of PNGs placed on a canvas.
- Terrain/path/river/bridge/settlement relationships make spatial sense.
- Foreground, midground, and distance are visually legible.
- Desktop movement/interact/combat/save work.
- Mobile movement/interact/combat work comfortably with safe-area-aware UI.
- The farmer interaction and dire-wolf encounter are understandable and playable.
- Combat feedback and Verdant Aegis feel integrated into the scene rather than pasted on.
- HUD and dialogue are legible, restrained, and do not dominate the world view.
- `npm run check:slice`, `npm test`, and `npm run verify` pass after the final changes.
- The GitHub Pages deployment succeeds on the final commit.
- A real visual inspection of the final deployed slice has been performed before declaring it demo-ready.

## Working style
Make implementation decisions from the repository and the locked visual target instead of asking the user to restate established context. Use best judgment and push through the work. If something is genuinely ambiguous, inspect more repository evidence before asking a question.

Do not report "done" based solely on code changes. Report what was visually verified, what tests passed, and the exact commit/deployment state.

## One-line mission
**Take the current Veilbound repository as-is and finish Riverford Verge into the strongest coherent full-art playable slice the existing production assets and locked Veilbound direction can support.**
