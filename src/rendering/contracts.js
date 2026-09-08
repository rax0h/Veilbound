import { CAMERA_CONTRACT } from '../world/state.js';

export const VISUAL_CONTRACT = Object.freeze({
  camera: CAMERA_CONTRACT,
  style: 'premium-illustrated-fantasy-realism',
  beautyBeforeDarkness: true,
  requireAtmosphericDepth: true,
  forbidPrimitiveProductionGeometry: true,
  forbidReferenceBoardsAtRuntime: true,
  characterAssetClasses: Object.freeze(['exploration_body', 'battle_body', 'ui_dialogue_portrait']),
});

export class RendererContract {
  async initialize(_canvas, _assetBundle) { throw new Error('Renderer implementation required.'); }
  resize(_width, _height, _pixelRatio) { throw new Error('Renderer implementation required.'); }
  render(_frame) { throw new Error('Renderer implementation required.'); }
  dispose() { throw new Error('Renderer implementation required.'); }
}
