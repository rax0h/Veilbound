# Riverford Verge acceptance record

Date: 2026-09-08. Starting main: 114e7d1fb889e4e33ee24192ebc16c74b2234dbb.

## Baseline findings

All original verification passed, but the deployed slice reproduced a first-frame exception (`deltaSeconds must be non-negative`) and a black world. After repairing the timing bound, desktop and portrait inspection showed upright path/water panels, sparse scene composition, mismatched object scale and a bridge outside the reachable region.

## Changes verified locally

- Continuous perspective terrain, the road/river/crossing layout, foreground framing and distant forest depth.
- Exploration player height within the locked 10–14% range on desktop and portrait/landscape phone-sized viewports.
- Keyboard movement and interaction, pointer walking, farmer dialogue and save/restore.
- Mobile stick movement and release, farmer interaction and responsive dialogue; portrait touch Aegis/strikes through victory, followed by reload with the defeated wolf preserved. Landscape controls visually inspected at 844×390.
- Bridge traversal and physical collision. Raised deck picking and deck/actor draw-order repairs.
- Combat initiation, wind-up, damage, keyboard strike/Aegis and defeat recovery.
- All 46 production PNGs materialize. All 21 tests and repository checks pass; new regression coverage addresses first-frame timing, save corruption/migration, reachable routes, camera scale, the crossing, raised-deck picking and server query/directory handling.
- Closed simulation rerun exactly matches the locked v8.4 acceptance summary.

The browser review harness offers 1280×800 desktop, 390×844 portrait and 844×390 landscape frames, with local or deployed Pages sources. Diagnostics report observed render timing only; they are not a physical-device performance guarantee.

## Source repair — 2026-09-09

The user authorized direct source-alpha repair. Nine character/creature masks now restore opaque clothing, skin and fur from the original preserved RGB. They were inspected against a contrasting blue backdrop; original RGB remains byte-for-byte unchanged across all 46 assets. The source archives are preserved. Fixed, reviewed masks are hash-bound to those originals and applied during materialization. No runtime color keying or generated replacements are used. The deliberately translucent wisp is excluded.

The player, farmer, trader, villager, companion dog and both wolf/player combat bodies now render without the previously extensive see-through interiors. Cache versions request the repaired assets even for returning players. Field notes includes Replay slice with an explicit confirmation so the encounter can be tested again without clearing browser data.

Regression verification compares every materialized image against the archived RGB, verifies unaffected files remain identical and checks body opacity and genuine transparent gaps. The new image decoder dependency is pinned and installed by Pages CI.

The bundled Reference Zero JPEG and truncated reference archive remain unusable for exact image comparison; their original identities are not fabricated or replaced. Written locked visual contracts remain controlling. This reference-source limitation is separate from the repaired runtime art. Browser viewport checks do not certify physical iPhone/Safari performance.
