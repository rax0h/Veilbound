// Shared geography: presentation and traversal use the same crossing and banks.
export const BOUNDS = { minX: -18, maxX: 19, minZ: -5, maxZ: 43 };
export const CROSSING = { x: 5.5, z: 19, width: 7.5, halfDepth: 1.8 };
export const SPAWN = { x: -2, z: 1 };
export const WOLF_HOME = { x: 12, z: 25 };
export const roadX = z => -2.6 + Math.sin(z * .10) * 1.1;
export const riverX = z => 5.5 + Math.sin((z - 19) * .065) * .9;
export function groundHeight(x, z) {
  if (Math.abs(z - CROSSING.z) > CROSSING.halfDepth) return 0;
  return Math.max(0, Math.min(1, (x-.3)/1.7, (10.7-x)/1.7)) * 2.55;
}
export function walkable(x, z) {
  if (!Number.isFinite(x) || !Number.isFinite(z) || x < BOUNDS.minX || x > BOUNDS.maxX || z < BOUNDS.minZ || z > BOUNDS.maxZ) return false;
  if (Math.abs(x - riverX(z)) < 2.5 && Math.abs(z - CROSSING.z) > CROSSING.halfDepth) return false;
  // House, stall, ancient oak, and ruin walls have small solid footprints.
  return !solids.some(s => Math.abs(x-s.x)<s.w && Math.abs(z-s.z)<s.d);
}
const solids = [{x:-9,z:35,w:3.6,d:2.5},{x:-6.5,z:27,w:2.3,d:1},{x:-11,z:11,w:1.4,d:1.1},{x:17,z:32,w:1.8,d:1}];
export function moveWithinScene(character, input, dt, moveCharacter, speed=4.6) {
  // Bound collision steps even when a slow frame needs up to 250 ms of catch-up.
  let remaining=dt;
  do {
  const step=Math.min(.05,remaining);
  const before={...character.transform};
  moveCharacter(character,input,step,speed);
  const {x,z}=character.transform;
  if (!walkable(x,before.z)) { character.transform.x=before.x; character.velocity.x=0; }
  if (!walkable(character.transform.x,z)) { character.transform.z=before.z; character.velocity.z=0; }
  character.transform.y=groundHeight(character.transform.x,character.transform.z);
  remaining-=step;
  } while(remaining>1e-8);
}
const env = (family,name) => `assets/environment/${family}/${name}_01.png`;
export const scenery = [];
function place(family,name,x,z,size,extra={}) { scenery.push({path:env(family,name),x,z,size,...extra}); }
// The left road leads to Riverford; the stone crossing leads into the eastern ruins.
place('vegetation','tree_broadleaf_ancient',-17,13,10);
place('vegetation','tree_broadleaf_mature',-14,28,10);
place('architecture','riverford_house',-9,35,8.2);
place('architecture','riverford_house',-16,45,6.3,{flip:true});
place('architecture','riverford_market_stall',-6.5,27,3.9);
place('infrastructure','stone_bridge_section',5.5,18,2.9,{bridge:true});
place('ruins','ruin_arch',12.5,32,5.8);
place('ruins','ruin_wall',17,32,3.6);
place('ruins','ruin_stair',16,37,2.6);
place('infrastructure','timber_fence',-7,19,1.05);
place('infrastructure','timber_fence',-10,21,1.05,{flip:true});
place('infrastructure','timber_fence',-12,30,1.1);
for(const [name,x,z,size] of [['wood_signpost',-3.8,15,1.8],['barrel',-8.8,26,1.2],['crate',-4.2,28,.8],['barrel',-11.2,32,1.05]]) scenery.push({path:`assets/props/${name}_01.png`,x,z,size});
place('rocks','boulder_moss',-8,4,1.7);
place('rocks','rock_cluster',10,13,1.6);
place('rocks','boulder_moss',17,23,2.1);
place('vegetation','fallen_log',-12,5,1.35);
// Irregular forest belts give the valley a distant treeline and parallax depth.
let seed=419;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<95;i++) {
  const z=48+random()*105,x=(random()-.5)*160;
  place('vegetation',i%3?'tree_conifer':'tree_broadleaf_mature',x,z,10+random()*13,{flip:random()>.5,distant:true});
}
for(const [x,z,h] of [[-21,-4,15],[19,-5,16],[-19,18,15],[22,17,13],[-22,39,17],[23,42,15],[15,46,12],[-2,55,14],[8,57,13]]) place('vegetation','tree_broadleaf_mature',x,z,h,{flip:x>0});
// Low plants, stones and exposed banks anchor the full-size trees without hiding the road.
for(let i=0;i<110;i++) {
  const z=-9+random()*66,x=-24+random()*50;
  if(Math.abs(x-roadX(z))<3 || Math.abs(x-riverX(z))<3.3 || (z>16&&z<22&&x>-4&&x<12))continue;
  const names=['fern_cluster','shrub','wildflower_cluster','fern'];
  place('vegetation',names[i%4],x,z,.35+random()*.7,{flip:random()>.5});
}
for(let z=-8;z<62;z+=4.7) for(const side of [-1,1]) {
  const x=riverX(z)+side*(2.7+random()*.3);
  if(Math.abs(z-19)<3)continue;
  place('water','river_bank',x,z,.7+random()*.35,{flip:side<0});
  if(z%2<1)place('rocks','rock_cluster',x+side*.6,z+1,.65+random()*.5);
}
export const atmosphereAssets = ['mist_near_01','mist_distance_01','sunshaft_forest_01','leaf_shadow_01','floating_motes_01'].map(n=>`assets/atmosphere/${n}.png`);
export const groundAssets = [env('terrain','forest_floor'),env('terrain','dirt_path'),env('terrain','leaf_litter'),env('water','river_shallow')];
