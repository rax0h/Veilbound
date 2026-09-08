import { deserializeSave, serializeSave } from './save.js';

export function snapshotSlice(player, persistentActors) {
  return {
    player: { transform: { ...player.transform }, hp: player.resources.hp },
    actors: Object.fromEntries(persistentActors.map((actor) => [actor.id, { alive: actor.alive }])),
  };
}

export function restoreSlice(text, player, persistentActors) {
  const state = deserializeSave(text);
  Object.assign(player.transform, state.player.transform);
  player.resources.hp = Math.max(0, Math.min(player.resources.max.hp, state.player.hp));
  for (const actor of persistentActors) {
    if (state.actors[actor.id]) actor.alive = state.actors[actor.id].alive;
  }
  return state;
}

export function storeSlice(storage, key, player, persistentActors) {
  storage.setItem(key, serializeSave(snapshotSlice(player, persistentActors)));
}
