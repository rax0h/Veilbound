# Veilbound Simulation → Gameplay Integration Blueprint

Status: implementation blueprint grounded in the preserved v7.6–v8.4 simulation contracts and the current Riverford Verge playable slice.

## Why this exists

The simulation is already validated as a closed long-horizon system. The current playable slice is also now functional. What is not yet proven is the bridge between them: whether a player can actually perceive, influence, and revisit simulated consequences through normal gameplay.

This document defines that bridge without rewriting the simulation or flattening it into scripted quest state.

## Current factual baseline

The current Riverford Verge slice already has world-space traversal, NPC interaction, a trader, a villager, companion following, combat, Verdant Aegis, local save/restore, a reachable bridge/ruins area, and a functioning rendered scene.

The preserved simulation contracts include:

- persistent expeditions with intent → intelligence → party → preparation → travel → discovery → decision → return → consequence;
- persistent mission-created or recovered objects with identity, origin, title and history;
- transport, processing, sale/use/inheritance and market circulation of persistent goods;
- object value composed from function, scarcity, condition, quantity and provenance;
- crafted artifacts that preserve parent-material genealogy;
- persistent techniques, apprenticeships, knowledge transmission, descendant variants, authored texts, knowledge loss and emergent craft schools;
- causal culture from event → memory → retelling/record → repeated practice → norm → institution → participation → future memory/practice;
- explicit households, partnerships, marriage migration, widowhood, births and deaths;
- millennium-scale population, missions, surges, objects, inheritance and cultural continuity;
- enterprise formation, profits/losses, property, debt, reputation, reinvestment, dynastic continuity, succession fragmentation and collapse;
- magic access influenced by networks/wealth/prestige without making rank purchasable or automatic;
- relevance scaling that may compress causally equivalent characters but must preserve exact state transitions, ledger effects and tick timing.

## Non-negotiable rule

The simulation must never become invisible background noise.

For every simulated state that matters, there must be at least one gameplay surface through which the player can:

1. notice it,
2. understand enough of it to form intent,
3. interact with it,
4. cause or fail to cause a consequence,
5. encounter that consequence later.

A system is not considered gameplay-integrated merely because its data exists in a save file.

## Architecture: the bridge, not a rewrite

The production game should introduce a thin adapter layer between the preserved simulation and the rendered/runtime game.

Proposed modules:

- `src/simulation/world-sim-adapter.js`
  - stable API between gameplay JS and preserved simulation state;
  - owns translation, not simulation rules.

- `src/simulation/gameplay-projection.js`
  - converts simulation entities/events into relevant local gameplay state;
  - selects what Riverford needs to instantiate now.

- `src/simulation/gameplay-actions.js`
  - converts player actions into simulation intents/events;
  - examples: purchase, sale, expedition support, apprenticeship, inheritance claim, business investment, rescue, refusal, theft, gift, testimony.

- `src/simulation/sim-clock.js`
  - maps game time advancement to simulation ticks while preserving accepted timing semantics.

- `src/simulation/relevance.js`
  - expands locally relevant people/objects/institutions into explicit gameplay entities;
  - allows distant causally equivalent populations to remain compressed under the already-accepted relevance-scaling contract.

- `src/simulation/history-view.js`
  - exposes provenance, ownership history, family history, records, rumors and institutional memory to dialogue/UI/world props.

The adapter must never duplicate or approximate accepted simulation logic inside the renderer/runtime.

## Vertical proof target

Before full-game production, Riverford Verge should prove one complete simulation-to-gameplay loop.

A minimal but sufficient proof is:

**expedition/material → market/person → player decision → ownership/economic consequence → elapsed time → visible changed world state**

The player should be able to perform a normal gameplay action, leave or advance time, and later encounter a changed person/object/business/family/state that exists because the simulation processed the consequence.

## Integration surfaces

### 1. People and households

Simulation state to expose:

- persistent person identity;
- household membership;
- partner/spouse relationship;
- parent/child lineage;
- residence;
- migration history;
- alive/dead/widowed state;
- occupation and relevant role;
- property/enterprise attachment;
- reputation or social standing where supported.

Gameplay presentation:

- named NPCs are not resettable quest props;
- dialogue references actual family and household state;
- household membership changes who is physically present;
- marriage migration can move an NPC to another settlement/household;
- death removes the person and leaves surviving relationships/property consequences;
- widowhood, succession and inheritance can change dialogue, ownership and business continuity;
- children/descendants can later occupy roles formerly held by parents.

First Riverford proof:

Give the existing trader a persistent simulated identity and household/enterprise attachment. After a controlled time advance, verify that at least one household or ownership transition is reflected in who the player meets and what the trader owns/offers.

### 2. Enterprises and wealth

Simulation state to expose:

- enterprise identity;
- founder/owner;
- age;
- capital;
- debt;
- quality/management/reputation;
- profits/losses;
- property;
- succession/closure state.

Gameplay presentation:

- shops exist because an enterprise exists, not because a level designer placed a permanent merchant;
- stock and prices derive from actual circulation state;
- business success can improve premises, stock depth or local reputation;
- debt/failure can reduce inventory, change ownership or close the business;
- a successful ordinary family can eventually become locally prestigious/dynastic;
- old houses can decline rather than being immortal lore fixtures.

First Riverford proof:

Bind the current trader interaction to a small simulated enterprise record. Let one player transaction alter that enterprise ledger. Advance time. Reflect at least one later consequence in stock, dialogue, ownership or business condition.

### 3. Persistent objects and provenance

Simulation state to expose:

- stable object ID;
- object type;
- origin;
- creator/recoverer;
- parent materials;
- ownership chain;
- transformations;
- condition;
- sale/inheritance history;
- terminal consumption when applicable.

Gameplay presentation:

- notable materials and artifacts have inspectable provenance;
- a wolf core, relic, crafted tool or inherited object can remain the same historical object across decades;
- crafting does not erase parent identity;
- consumption ends availability but retains historical record;
- a famous object may later become a cultural memory source.

First Riverford proof:

Create or recover one persistent object from the existing dire-wolf encounter or old-stones area. Give it a stable ID and provenance record. Allow the player to keep, sell or give it away. Advance time and prove that the same object can be found in its resulting ownership/history state.

### 4. Expedition economy

Simulation contract:

intent → intelligence → party → preparation → travel → discovery → decision → return → consequence.

Gameplay presentation:

- expeditions originate from actual needs/opportunities;
- the player can supply intelligence, material, funding, escort or direct participation;
- preparation quality must matter;
- success/failure creates persistent consequences rather than generic reward rolls;
- recovered materials/Essences/Stones/remains enter the same persistent economy.

First proof after the market/object bridge:

Have Riverford generate one expedition need. Let the player contribute one meaningful preparation input. Resolve through the preserved expedition state machine. Surface returned people, casualties/failure, recovered objects and downstream market effects.

### 5. Craft knowledge and traditions

Simulation state to expose:

- technique identity;
- correctness;
- living knowers;
- teacher/student transmission;
- authored texts;
- text accuracy;
- descendant variants;
- reputation;
- tradition/school detection;
- actual loss when no knower/text survives.

Gameplay presentation:

- no menu-spawned “school” simply because the player unlocked tier 3;
- a craft tradition becomes visible because people repeatedly practice/transmit it;
- apprentices know what someone taught them, including potentially incorrect technique;
- books can preserve or distort knowledge;
- a lost technique is genuinely unavailable until rediscovered through surviving evidence, if such evidence exists.

First proof:

Later, bind one Riverford craftsperson to one persistent technique and one apprentice/text. Advance enough time to demonstrate transmission or loss and show the result through available crafting/dialogue/output quality.

### 6. Culture and memory

Simulation contract:

event → memory → retelling/record → repeated practice → norm → institution → participation → future memory/practice.

Gameplay presentation:

- NPC dialogue and rumors derive from actual remembered events;
- different people may carry distorted versions;
- written records preserve claims without guaranteeing truth;
- repeated behavior can eventually alter local expectations and practices;
- institutions emerge from established norms rather than being spawned by quest completion;
- migration can carry culture elsewhere imperfectly.

First Riverford proof:

Treat the current dire-wolf crossing event as a candidate local memory. If the player defeats the wolf, create a memory/record event tied to the actual action. After time advance, allow at least two NPCs to reflect the event differently based on their memory/record path. Do not hardcode “hero reputation +10” as a substitute.

### 7. Demography and succession

Simulation state to expose:

- births;
- deaths;
- partnerships;
- marriage migration;
- widowhood;
- household formation/dissolution;
- inheritance;
- lineage continuity/extinction.

Gameplay presentation:

- the world does not refill itself with anonymous replacements;
- businesses/homes/roles can pass to relatives or fail to continue;
- recognizable families persist while individual people age and die;
- some lines end;
- migration changes settlements.

First proof:

Do not try to demonstrate centuries immediately. Use controlled developer time-skips to show one household ownership/succession transition in Riverford with stable IDs before exposing long skips to normal players.

### 8. Magic, wealth and social access

Simulation contract:

- wealth/prestige may improve access to magical networks;
- magical rank is not purchasable;
- advancement is not mission-count/calendar automatic;
- wealth/rank increase capability, not guaranteed continuity or obedience.

Gameplay presentation:

- wealthy families may gain introductions, teachers, records, artifacts or opportunities;
- none of those should directly buy a magical rank;
- player choices can affect access networks without turning magic into a currency shop.

This must remain compatible with the canonical Essence/Confluence/Awakening character engine.

## Time model required for gameplay

The simulation cannot be tested through gameplay if meaningful time never passes.

We need three time scales:

- **moment-to-moment:** seconds/minutes; movement, combat, dialogue;
- **daily/local:** rest, travel, business inventory, NPC schedules, minor consequences;
- **long-form:** weeks/months/years; households, enterprise outcomes, succession, culture and generational change.

For development, add a clearly marked debug time-advance control that can advance days/months/years while preserving simulation ticks. It must never fake outcomes by directly editing state.

The full game can later decide which long-form advances occur through travel, rest, chapter transitions, downtime, imprisonment, injury recovery, expeditions, seasonal transitions or other diegetic mechanisms.

## Save contract

The current browser save contains local slice state. Simulation integration requires a versioned world save containing at minimum:

- world seed;
- simulation tick/date;
- player stable ID;
- relevant explicit characters;
- compressed distant cohorts as allowed by the existing scaling contract;
- households;
- enterprises;
- persistent objects and ownership/history;
- knowledge/culture records;
- local projected world state;
- player position/resources and presentation state.

The save must not treat the simulation and the rendered world as separate universes.

## Required first implementation milestone: Riverford Living World Proof

This is the next simulation/gameplay acceptance target.

Implement a developer-facing proof inside Riverford Verge with these exact requirements:

1. Load or initialize one deterministic simulation-backed Riverford state.
2. Bind the existing trader to a persistent person + household + enterprise.
3. Bind the dire-wolf encounter to one persistent consequential event.
4. Produce one persistent object with stable ID/provenance from gameplay.
5. Allow the player to keep, transfer or sell that object.
6. Record the resulting ownership/economic event in simulation state.
7. Advance simulation time using a legitimate tick bridge.
8. Reproject Riverford from the new simulation state.
9. Show at least three visible consequences after the advance:
   - one NPC/dialogue/household consequence;
   - one enterprise/market consequence;
   - one object/history consequence.
10. Save, reload and confirm those consequences persist.
11. Repeat from the same seed/actions and confirm deterministic equivalent state.

If these eleven points work, Veilbound will have its first actual proof that the long-horizon simulation survives contact with gameplay.

## Acceptance criteria

The integration passes only if all of the following are true:

- the player can cause a simulation event through ordinary gameplay;
- the preserved simulation, not bespoke quest code, determines the resulting world-state transition;
- the result changes something the player can perceive;
- that result persists through save/reload;
- elapsed time can produce additional consequences without manually scripting them;
- stable identities survive projection/reprojection;
- objects retain provenance;
- household/business ownership remains coherent;
- no generic XP, rarity-color economy or permanent resettable merchant logic replaces the canonical systems;
- no direct mutation is used to fake a time-skip outcome;
- `npm test`, `npm run verify`, and `npm run sim` remain valid.

## What is not required for the first proof

Do not block this milestone on:

- the entire world map;
- thousands of rendered NPCs;
- full character creation;
- every craft school;
- centuries of player-facing time;
- final animation/audio;
- complete economy UI;
- every Essence manifestation.

The proof only needs one small place where simulation causality becomes unmistakably playable.

## Order of work

1. Keep polishing the Gold Standard slice enough that traversal/readability do not interfere with testing.
2. Implement the simulation adapter and deterministic clock bridge.
3. Bind Riverford trader/household/enterprise.
4. Bind one persistent gameplay-created object.
5. Bind wolf encounter to persistent event/memory.
6. Add developer time advance.
7. Reproject the changed Riverford state.
8. Verify save/reload and deterministic replay.
9. Only after this proof, expand toward broader economy/culture/demography gameplay.
10. Character creation can then be integrated as the mechanism that creates the player’s persistent person, household/social origin, Essence/Confluence state and starting relationships inside this same world model.

## Final gate before full production expansion

Veilbound should not scale into full-game content until we have demonstrated all three of these together:

- the Gold Standard visual/gameplay slice is credible enough to represent the game;
- simulation consequences are visible and interactive through gameplay;
- character creation produces a canonical persistent character that enters and participates in that simulated world.

That is the point at which scaling outward stops being faith and becomes repetition of proven production patterns.
