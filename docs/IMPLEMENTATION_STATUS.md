# Implementation Status — factual only

## Preserved foundations

- Locked semantic dictionary, Essence/Confluence/manifestation engine and closed long-horizon simulation.
- Production manifest and safe archive materializer: 46 PNGs from the two declared Gold Standard archives.
- RendererContract, authored alpha, separate exploration/battle bodies, and prohibition on runtime reference boards.

## Riverford Verge playable slice

- World-space textured terrain projected through a forward perspective camera. The road, river and raised crossing use the same geography as movement and picking.
- World-dominant framing: an exploration player at the settled camera occupies 12.1% of viewport height. Tested mathematically at 1280×800, 390×844 and 844×390.
- Layered forest, depth-tinted distant canopy, ancient oak, reachable settlement/trader, bridge and eastern ruins. Terrain is not an upright strip or screen-locked backdrop.
- Keyboard, click/tap-to-walk and touch-stick movement; pointer-cancel/lost-capture and focus-loss input clearing.
- Farmer dialogue/rest, trader interaction/water, villager dialogue and a following companion.
- In-world combat with range, strike cooldown, telegraphed wolf lunges, movement during combat, withdrawal, defeat recovery, focus cost/cooldown, defensive Verdant Aegis roots, contact light and hit feedback.
- Versioned, validated browser-local saves, legacy save migration, safe malformed-save handling, automatic progress saves and explicit save feedback.
- Compact responsive HUD, loading/progress/error recovery, field notes, accessible buttons, health/focus meters, safe-area offsets and portrait/landscape layouts.
- GitHub Pages deployment remains on main. Build assembly includes build.json with the deployed commit SHA.
- Local browser review harness: tools/visual-review.html. Optional ?review=1 diagnostics are not shown in normal play.

## Limitations and visual acceptance

Passing verification is **not** full-art acceptance. See SLICE_ACCEPTANCE.md.

Several archive PNGs contain interior transparent gaps, especially player_battle_base_01.png, dire_wolf_exploration_01.png and npc_merchant_exploration_01.png. These gaps are visible in the source pixels and show scenery through bodies. The renderer preserves that alpha; it does not invent replacement pixels or key colors. The player portrait has similar damage and is not used as a gameplay sprite. No farmer dialogue portrait is supplied, so farmer dialogue uses text without repurposing his exploration body.

The bundled Reference Zero proxy does not decode as an image, and the packed proxy archive ends before its gzip end marker. Written canon and visual contracts were read; an exact comparison to the original reference image cannot be claimed.

There are no authored animation sets, rigged 3D characters, audio, gamepad input, navigation meshes or content beyond this compact scene. Scene-footprint collision is implemented; it is not an authored mesh. Browser viewport review is not physical iPhone/Safari certification.
