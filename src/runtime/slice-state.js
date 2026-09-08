import { SPAWN, walkable } from '../world/riverford.js';
export const frameDelta=(now,last)=>Math.max(0,Math.min(.25,(now-last)/1000));
export const inRange=(a,b,range)=>Math.hypot(a.transform.x-b.transform.x,a.transform.z-b.transform.z)<=range;
export function readJourney(text) {
  if(!text)return null;
  try {
    const s=JSON.parse(text);if(!s||typeof s!=='object'||(s.version!==undefined&&s.version!==2))return null;
    const p=s.position;if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.z)||!Number.isFinite(s.hp))return null;
    return {position:walkable(p.x,p.z)?{x:p.x,z:p.z}:{...SPAWN},hp:Math.max(1,Math.min(140,s.hp)),focus:Number.isFinite(s.focus)?Math.max(0,Math.min(80,s.focus)):80,wolfAlive:s.wolfAlive!==false,metFarmer:s.metFarmer===true,visitedMarket:s.visitedMarket===true};
  } catch {return null;}
}
