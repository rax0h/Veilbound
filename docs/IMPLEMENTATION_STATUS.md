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

## Not implemented yet

- No production renderer.
- No complete production environment art library.
- No production character body/animation library.
- No production creature art library.
- No production VFX library.
- No finished playable scene.

The absence of a renderer is deliberate: missing art must fail closed rather than silently producing placeholder geometry.
