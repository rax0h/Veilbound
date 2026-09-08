# Implementation Status — factual only

## Implemented in code

- Semantic dictionary indexing for 62 Essences and 7 Awakening Stones.
- Three-base-Essence selection and deterministic Confluence generation.
- Twenty-manifestation character contract: four Binding, sixteen Awakening, exactly one Aura.
- Shared character engine for protagonist and important NPCs.
- Explicit Awakening-Stone unlock state and five-slot active loadout validation.
- Character resources, path/nature baselines, defeat state, damage and restoration primitives.
- Coordinate-based physical movement and nearby-entity queries.
- Deterministic world clock, save/input boundaries, and world entity collection.
- Production visual/camera contracts and asset rejection gates.

## Playable-slice implementation

- Canvas-owned Riverford Verge renderer implementing `RendererContract` with elevated forward perspective, camera follow, world-space projection, depth ordering, atmosphere, and keyed compositing of the supplied black-isolated Gold Standard artwork.
- Keyboard exploration, companion following, farmer interaction, deterministic save boundary, dire-wolf combat, defeat/continuation, and in-world strike / Binding Aura presentation.
- All 46 files from the two Gold Standard source packages are extracted and mapped; the slice visibly uses a curated subset rather than presenting an asset gallery.
- HUD and dialogue remain DOM overlays; the world, actors, scenery, terrain treatment, and combat effects are rendered on the game canvas.

## Not implemented yet

- Rigged or skeletal 3D characters, true volumetric environment meshes, or authored animation sets; current source packs provide static illustrated representations.
- Character locomotion and combat animation frames beyond procedural movement/bob/hit/FX presentation.
- Authored collision meshes, full navigation, audio, gamepad/touch input, and broader geographic content.
- A final visual-fidelity acceptance pass against the approved Gold Standard target on a live browser build.

Missing production art still fails closed rather than silently producing placeholder geometry or reference-board runtime fallbacks.
