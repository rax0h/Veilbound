import test from 'node:test';
import assert from 'node:assert/strict';
import { frameDelta, readJourney, inRange } from '../src/runtime/slice-state.js';
import { moveWithinScene, walkable, groundHeight, SPAWN, WOLF_HOME, scenery } from '../src/world/riverford.js';
import { moveCharacter } from '../src/world/movement.js';
import { projectPoint, pickGround } from '../src/rendering/canvas-renderer.js';
import { readFileSync } from 'node:fs';

const actor=(x,z)=>({transform:{x,z,y:0,yaw:0},velocity:{x:0,y:0,z:0}});
test('first rAF timestamp before initialization cannot stop the game; long pauses are bounded',()=>{
  assert.equal(frameDelta(101,102),0);assert.equal(frameDelta(2100,100),.25);assert.equal(frameDelta(116,100),.016);
});
test('malformed and unsupported saves fail safely; legacy saves migrate without reviving the wolf',()=>{
  for(const text of ['{','null','[]','{"position":{"x":"1","z":0},"hp":140}','{"version":999,"position":{"x":0,"z":0},"hp":140}'])assert.equal(readJourney(text),null);
  const saved=readJourney(JSON.stringify({position:{x:SPAWN.x,z:SPAWN.z},hp:200,wolfAlive:false}));assert.equal(saved.hp,140);assert.equal(saved.focus,80);assert.equal(saved.wolfAlive,false);
  const unsafe=readJourney(JSON.stringify({position:{x:5.5,z:0},hp:-9}));assert.deepEqual(unsafe.position,SPAWN);assert.equal(unsafe.hp,1);
});
test('river blocks travel away from the crossing, but both banks are connected by a traversable bridge',()=>{
  assert.equal(walkable(5.5,10),false);
  for(let x=0;x<=12;x+=.1)assert.ok(walkable(x,19),`crossing blocked at ${x}`);
  assert.ok(groundHeight(5.5,19)>groundHeight(1,19));
  const c=actor(0,19);for(let i=0;i<180;i++)moveWithinScene(c,{x:1,y:0},1/60,moveCharacter);assert.ok(c.transform.x>12);
  assert.ok(walkable(WOLF_HOME.x,WOLF_HOME.z));
});
test('movement cannot tunnel across the river during bounded frames or walk through the house',()=>{
  const c=actor(0,10);for(let i=0;i<100;i++)moveWithinScene(c,{x:1,y:0},.05,moveCharacter);assert.ok(c.transform.x<3);assert.equal(walkable(-9,35),false);
});
test('farmer, market and encounter are reachable from the same starting road',()=>{
  const c=actor(SPAWN.x,SPAWN.z);
  for(const [x,z] of [[-2,10],[-2,19],[11,19],[12,25],[11,19],[-2,19],[-2,25],[-2,34]]){
    for(let i=0;i<600&&Math.hypot(c.transform.x-x,c.transform.z-z)>.15;i++){
      const dx=x-c.transform.x,dz=z-c.transform.z,d=Math.hypot(dx,dz);moveWithinScene(c,{x:dx/d,y:dz/d},1/60,moveCharacter);
    }
    assert.ok(Math.hypot(c.transform.x-x,c.transform.z-z)<.2,`unreachable ${x},${z}`);
  }
});
test('player framing stays at 12.1 percent across desktop, portrait and landscape; far objects recede',()=>{
  for(const [w,h] of [[1280,800],[390,844],[844,390]]){
    const camera={x:2,z:-20};const foot=projectPoint(2,0,0,camera,w,h),head=projectPoint(2,0,2.2,camera,w,h);const ratio=(foot.y-head.y)/h;
    assert.ok(ratio>=.10&&ratio<=.14);assert.ok(foot.y/h>.6&&foot.y/h<.75);
    assert.ok(projectPoint(2,30,0,camera,w,h).scale<foot.scale);
  }
});
test('combat range is physical, not a menu-only or screen-distance check',()=>{
  assert.ok(inRange(actor(0,0),actor(2,1),3));assert.equal(inRange(actor(0,0),actor(4,0),3),false);
});
test('every authored scenery instance uses a manifest production asset',()=>{
  const m=JSON.parse(readFileSync(new URL('../assets/production-asset-manifest.json',import.meta.url)));const paths=new Set(m.assets.map(a=>a.path));
  for(const s of scenery){assert.ok(paths.has(s.path));assert.ok(Number.isFinite(s.size)&&s.size>0);}
});

test("clicking the raised bridge deck resolves to the crossing, not water farther upstream",()=>{
 const camera={x:-2,z:-1};
 for(const [w,h] of [[1280,800],[390,844],[844,390]]){const screen=projectPoint(5.5,19,groundHeight(5.5,19),camera,w,h);const point=pickGround(screen.x,screen.y,camera,w,h);assert.ok(Math.abs(point.x-5.5)<.01);assert.ok(Math.abs(point.z-19)<.01);assert.ok(walkable(point.x,point.z));}
});
