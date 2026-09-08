# Implementation Status — factual only

## Implemented in code

- Semantic dictionary indexing for 62 Essences and 7 Awakening Stones.
- Three-base-Essence selection, deterministic Confluence generation, and the twenty-manifestation character contract.
- Shared character resources, damage/restoration primitives, coordinate movement, nearby-entity queries, deterministic world state, input, and save boundaries.
- Production visual/camera contracts and fail-closed asset rejection gates.

## Riverford Verge playable slice

- A canvas renderer implements `RendererContract` with an elevated forward perspective, world-space projection, camera follow, Y/depth ordering, occlusion through painter ordering, and atmospheric layers.
- Production PNGs use their authored alpha through normal canvas compositing; there is no DOM world compositor, black-key conversion, or asset screen-blending fallback.
- Keyboard exploration, dog following, farmer interaction, save/restore, a continuous in-world dire-wolf encounter, defeat recovery, hit/strike feedback, and Verdant Aegis manifestation effects are wired into the slice.
- HUD and dialogue are DOM accessibility/UI overlays. Terrain, scenery, actors, camera movement, atmosphere, and combat effects remain canvas-owned.
- The committed manifest describes the complete archive-derived runtime set without a fixed-count gate; materialization requires exact archive membership and PNG metadata agreement.

## Not implemented

- Rigged 3D characters, skeletal animation, volumetric meshes/materials, or authored animation sets.
- Authored collision meshes, navigation meshes, audio, gamepad/touch input, or content beyond this compact scene.
- Static production illustrations receive procedural locomotion bob, facing, reaction, and effects only; these are not frame or skeletal animations.

Missing, unexpected, malformed, or metadata-mismatched production art fails closed rather than producing placeholders or loading reference boards at runtime.
