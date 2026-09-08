import { normalizeStick } from './input.js';

export class PointerJoystick {
  constructor(radius = 54, deadzone = 0.12) {
    this.radius = radius;
    this.deadzone = deadzone;
    this.pointerId = null;
    this.origin = { x: 0, y: 0 };
    this.value = { x: 0, y: 0 };
  }

  begin(pointerId, clientX, clientY, bounds) {
    this.pointerId = pointerId;
    this.origin = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
    return this.update(pointerId, clientX, clientY);
  }

  update(pointerId, clientX, clientY) {
    if (pointerId !== this.pointerId) return this.value;
    const rawX = (clientX - this.origin.x) / this.radius;
    const rawY = (clientY - this.origin.y) / this.radius;
    this.value = normalizeStick(rawX, rawY, this.deadzone);
    return this.value;
  }

  end(pointerId) {
    if (pointerId !== this.pointerId) return this.value;
    this.pointerId = null;
    this.value = { x: 0, y: 0 };
    return this.value;
  }
}

export function bindPointerJoystick(element, knob, joystick = new PointerJoystick()) {
  const render = () => {
    knob.style.transform = `translate(${joystick.value.x * joystick.radius}px, ${joystick.value.y * joystick.radius}px)`;
  };
  element.addEventListener('pointerdown', (event) => {
    element.setPointerCapture(event.pointerId);
    joystick.begin(event.pointerId, event.clientX, event.clientY, element.getBoundingClientRect());
    render();
    event.preventDefault();
  });
  element.addEventListener('pointermove', (event) => {
    joystick.update(event.pointerId, event.clientX, event.clientY);
    render();
    event.preventDefault();
  });
  const release = (event) => {
    joystick.end(event.pointerId);
    render();
    event.preventDefault();
  };
  element.addEventListener('pointerup', release);
  element.addEventListener('pointercancel', release);
  element.addEventListener('lostpointercapture', release);
  return joystick;
}
