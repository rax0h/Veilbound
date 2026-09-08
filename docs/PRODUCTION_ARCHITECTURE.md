# Production Architecture v0.1

This repository separates **game truth** from **presentation** so a rejected renderer can never become the game by inertia.

## Layers

- `canon/` — locked semantic and visual contracts.
- `simulation/` — closed long-horizon world simulation and verification history.
- `src/core/` — invariants and deterministic utilities.
- `src/content/` — semantic dictionary indexing and content access.
- `src/gameplay/` — Essence, Confluence and manifestation rules.
- `src/world/` — live player/world state.
- `src/runtime/` — input and save boundaries.
- `src/rendering/` — renderer contracts and production-asset gates only until real art is available.
- `assets/` — actual production assets only. Empty is preferable to placeholders.
- `references/` — visual source material; never imported at runtime.

## Rendering rule

There is deliberately **no primitive fallback renderer**. If the production environment/character asset set is not present, the renderer does not substitute colored geometry, SVG stand-ins, contact sheets, or reference boards.

## Character-generation path

Character creation resolves three base Essences, generates one semantic Confluence, and creates a 20-slot manifestation blueprint with four Binding manifestations and sixteen Awakening slots. The engine enforces one Aura across the final set.

## Next production boundary

The first actual visual scene must enter through a production asset manifest that passes `src/rendering/asset-gate.js`. That manifest must point only to individual runtime assets under `assets/`, and every asset must declare lineage back to the approved references.
