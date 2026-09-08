# Veilbound — Clean Production Repository

Independent production restart. It does not import the rejected `veilbound1` presentation layer.

## What exists now

The codebase contains the closed simulation, locked semantic/visual contracts, a shared protagonist/NPC character engine, deterministic Confluence generation, the full 20-manifestation structural contract, explicit Awakening-Stone unlock/loadout state, coordinate-based movement/entity queries, basic bounded combat-resource primitives, deterministic world state, input/save boundaries, and hard production-asset gates.

There is deliberately **no placeholder renderer**. Missing production art fails closed rather than falling back to flat geometry, SVG stand-ins, source boards, or the rejected top-down prototype.

The Gold Standard source packs can now be run as the compact Riverford Verge slice. The runtime composes the supplied environment, character, creature, atmosphere, and UI artwork; use `npm start`, then open `http://localhost:4173`. `npm start` safely crops, removes connected black isolation backgrounds, and validates transparent runtime PNGs from the preserved source ZIPs first, keeping binary outputs out of pull-request diffs. Desktop uses keyboard controls; touch layouts expose an analog Pointer Events joystick plus interaction, strike, and manifestation controls.

For exact implemented/not-implemented status, read `docs/IMPLEMENTATION_STATUS.md`.

## Visual rule

`references/` is source material only. Reference boards are never runtime assets. `assets/` is reserved for individual production assets only.

## Verify

```bash
npm test
npm run verify
npm run verify:slice
```

The first visual runtime is allowed only after a real production scene asset bundle passes the asset gate and can be compared against `references/reference-zero.png` without obviously violating the locked visual constitution.
