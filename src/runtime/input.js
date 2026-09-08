const ZERO = Object.freeze({ moveX: 0, moveY: 0, lookX: 0, lookY: 0, run: false, dodge: false, interact: false });

export class InputState {
  #state = { ...ZERO };
  set(partial) { this.#state = { ...this.#state, ...partial }; }
  snapshot() { return Object.freeze({ ...this.#state }); }
  clearTransient() { this.#state.dodge = false; this.#state.interact = false; }
}

export function normalizeStick(x, y, deadzone = 0.12) {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= deadzone) return { x: 0, y: 0 };
  const scaled = Math.min(1, (magnitude - deadzone) / (1 - deadzone));
  return { x: (x / magnitude) * scaled, y: (y / magnitude) * scaled };
}
