# CODEX HANDOFF — VEILBOUND

## Read this first
This repository is the production home for Veilbound. Do not reconstruct the simulation from chat history and do not revive the rejected `rax0h/veilbound1` prototype.

## Canonical simulation
Preserve the migrated v8.4 closed simulation exactly as source-of-truth material. It contains simulator source, data outputs, closure documentation, state, changelog, and verification scripts. The accepted long-horizon suite reports eight independent 1,000-year worlds, including new-money dynasties in 8/8 worlds, old-house survival in 8/8, collapse of once-wealthy families in 7/8, a 1000-year surviving enterprise, observed maximum wealth 45,909.2, and maximum family magical rank 3 in that economic suite.

Do not replace these systems with a simplified mock. Run the included verification scripts after migration.

## Visual-locked master
Preserve the v8.5 visual constitution, reference set, manifest/schema, state, and anti-drift verifier. `visual/references/reference-zero.png` is the north-star reference and `docs/VISUAL_CONSTITUTION.md` is a contract, not a mood board.

Core rules:
- premium illustrated fantasy realism / stylized realism
- beauty before darkness
- elevated forward-looking three-quarter gameplay camera
- player roughly 10–14% of screen height in standard exploration
- world dominates the frame with foreground/midground/distance
- credible materials, atmospheric depth, warm/cool separation
- restrained ornate fantasy UI
- separate exploration body, battle body, and UI/dialogue portrait
- no flat vector villages, primitive final geometry, chibi/toy proportions, generic mobile-game presentation, giant opaque HUD slabs, portrait-as-sprite shortcuts, or reference boards used as runtime assets

## Semantic dictionary
`data/Veilbound_Semantic_Dictionary_v0.1.json` is canonical source material. Preserve its terminology and constraints.

Locked structural rules from the current production work:
- 3 base Essences + 1 deterministic Confluence
- 5 skills per Essence
- 20 manifestations total: 4 Binding + 16 Awakening
- exactly one Aura
- 7 Awakening Stones: Feast, Eyes, Mercy, Adventure, Stars, Omens, Reaper

## Asset production rules
Non-negotiable:
- one final asset = one file
- no contact sheets/collages as production assets
- no text baked onto generated art unless the asset itself requires text
- reference boards are references only
- composed screenshots are not substitutes for world assets
- isolated runtime assets should be clean and transparent where appropriate
- never call an asset complete unless the file actually exists under `assets/`
- do not silently substitute placeholders or low-resolution crops

The ordered list is in `docs/GOLD_STANDARD_ASSET_MANIFEST.md`.

Current accepted progress:
- GS001 `tree_broadleaf_ancient_01.png` — in progress
- GS002 not started
- GS003 not started

Continue strictly one at a time from GS001 unless the user changes the instruction. After each asset, state what it is and its exact repository path.

## Rejected direction
Do not import/revive the old `rax0h/veilbound1` presentation or its crude browser prototype as the production visual foundation.

## Verification standard
Never use “done,” “production-ready,” “implemented,” or similar language without checking the actual files/tests/state that support the claim.
