import { indexSemanticDictionary } from './content/semantic-dictionary.js';
import { createCharacter } from './characters/character.js';
import { createWorldState } from './world/state.js';

export function createNewGame({ dictionary, seed, playerName, path, nature, baseEssenceIds }) {
  const semantic = indexSemanticDictionary(dictionary);
  const player = createCharacter({
    id: 'player',
    name: playerName,
    path,
    nature,
    baseEssenceIds,
    semantic,
    importance: 'protagonist',
  });
  const world = createWorldState({ seed, player });
  return { semantic, player, confluence: player.essence.confluence, manifestations: player.essence.manifestations, world };
}
