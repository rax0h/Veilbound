const SAVE_VERSION = 1;

export function serializeSave(state) {
  return JSON.stringify({ saveVersion: SAVE_VERSION, savedAt: new Date().toISOString(), state });
}

export function deserializeSave(text) {
  const payload = JSON.parse(text);
  if (payload.saveVersion !== SAVE_VERSION) throw new Error(`Unsupported save version: ${payload.saveVersion}`);
  return payload.state;
}
