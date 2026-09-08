import { moveCharacter } from '../world/movement.js';
import { applyDamage } from '../combat/combat.js';
import { RiverfordCanvasRenderer } from '../rendering/canvas-renderer.js';

const $=s=>document.querySelector(s), keys=new Set();
const distance=(a,b)=>Math.hypot(a.transform.x-b.transform.x,a.transform.z-b.transform.z);
const actor=(id,sprite,x,z,hp,size)=>({id,sprite,size,transform:{x,z,y:0,yaw:0},resources:{hp,max:{hp}},alive:true,velocity:{x:0,z:0,y:0},hitUntil:0});
const player=actor('player','assets/characters/player_exploration_base_01.png',0,0,140,2.8);
const dog=actor('dog','assets/creatures/companion_dog_exploration_01.png',-2,-1,40,1.8);
const farmer=actor('farmer','assets/characters/npc_farmer_exploration_01.png',-5.7,7.8,90,2.6);
const wolf=actor('wolf','assets/creatures/dire_wolf_exploration_01.png',9,15.2,72,2.15);
const scenery=[
  ['assets/environment/vegetation/tree_broadleaf_ancient_01.png',-15,29,9.4],['assets/environment/vegetation/tree_broadleaf_mature_01.png',-8.5,24,6.7],['assets/environment/vegetation/tree_conifer_01.png',-18,39,8.2],['assets/environment/vegetation/tree_broadleaf_mature_01.png',16,39,6.8,true],
  ['assets/environment/architecture/riverford_house_01.png',9.8,34,8.6],['assets/environment/architecture/riverford_market_stall_01.png',3.8,25.5,5.1],['assets/environment/ruins/ruin_arch_01.png',13.8,18.6,5.7],['assets/environment/ruins/ruin_wall_01.png',17,34,6.2],['assets/environment/ruins/ruin_stair_01.png',15.5,25.5,4.3],
  ['assets/environment/infrastructure/stone_bridge_section_01.png',10.8,28.5,6.1],['assets/environment/infrastructure/timber_fence_01.png',1.8,15.5,3.9],['assets/environment/infrastructure/timber_fence_01.png',-3.2,16.6,3.6,true],
  ['assets/props/wood_signpost_01.png',-.8,10.8,2.35],['assets/props/barrel_01.png',5.2,13.1,1.6],['assets/props/crate_01.png',6.5,14.1,1.55],['assets/props/barrel_01.png',4.2,14.8,1.35,true],
  ['assets/environment/rocks/boulder_moss_01.png',-8.2,13.1,3.3],['assets/environment/rocks/rock_cluster_01.png',7.6,9.4,2.8],['assets/environment/rocks/rock_cluster_01.png',13.7,21.5,2.4,true],['assets/environment/vegetation/fallen_log_01.png',-12,17.2,3.5],
  ['assets/environment/vegetation/fern_cluster_01.png',-5.2,8.7,2.45],['assets/environment/vegetation/fern_cluster_01.png',-10.8,12.2,2.2,true],['assets/environment/vegetation/fern_01.png',1.8,8.3,1.7],['assets/environment/vegetation/fern_01.png',11.7,11.2,1.8,true],['assets/environment/vegetation/shrub_01.png',13.1,10.2,2.8],['assets/environment/vegetation/shrub_01.png',-13.4,20.4,2.5,true],
  ['assets/environment/vegetation/wildflower_cluster_01.png',-1,6.8,1.8],['assets/environment/vegetation/wildflower_cluster_01.png',2.4,11.7,1.45,true],['assets/environment/terrain/leaf_litter_01.png',-6.8,6.4,2.8],['assets/environment/terrain/leaf_litter_01.png',4.8,8.2,2.6,true],['assets/environment/water/river_bank_01.png',8.7,18.2,5.6],['assets/environment/water/river_bank_01.png',11.4,31,5.2,true]
].map(([path,x,z,size,flip=false])=>({path,x,z,size,flip}));
const ambience=['assets/environment/terrain/forest_floor_01.png','assets/environment/terrain/dirt_path_01.png','assets/environment/water/river_shallow_01.png','assets/atmosphere/mist_near_01.png','assets/atmosphere/mist_distance_01.png','assets/atmosphere/sunshaft_forest_01.png','assets/atmosphere/leaf_shadow_01.png','assets/atmosphere/floating_motes_01.png'];
const assets=[...new Set([...scenery.map(s=>s.path),player.sprite,dog.sprite,farmer.sprite,wolf.sprite,...ambience])];
const renderer=new RiverfordCanvasRenderer();
await renderer.initialize($('#gameCanvas'),assets);

let inCombat=false,last=performance.now(),enemyTimer=0,enemyPhase=0;
const fx={aegisUntil:0,slashUntil:0,impactUntil:0,cameraKickUntil:0};
const touchMove={x:0,y:0};

function refreshHud(){
  $('#hpbar').style.width=100*player.resources.hp/player.resources.max.hp+'%';$('#php').textContent=player.resources.hp;$('#whp').textContent=wolf.resources.hp;
  const nearFarmer=distance(player,farmer)<3.5,nearWolf=wolf.alive&&distance(player,wolf)<4.2;
  $('#prompt').hidden=(!nearFarmer&&!nearWolf)||inCombat;$('#promptText').textContent=nearFarmer?'Speak with Elian':'Confront the dire wolf';
  $('#combatHud').hidden=!inCombat;
}
function interact(){if(inCombat)return;if(distance(player,farmer)<3.5){$('#dialogue').hidden=false;return}if(wolf.alive&&distance(player,wolf)<4.2)startCombat()}
function startCombat(){
  inCombat=true;enemyPhase=performance.now()+700;$('#combatlog').textContent='The dire wolf lowers its head beneath the ruined arch.';
  enemyTimer=setInterval(enemyAttack,1750);refreshHud();
}
function enemyAttack(){
  if(!inCombat||!wolf.alive)return;
  const now=performance.now(),dx=player.transform.x-wolf.transform.x,dz=player.transform.z-wolf.transform.z,d=Math.max(.001,Math.hypot(dx,dz));
  wolf.velocity.x=dx/d*7;wolf.velocity.z=dz/d*7;wolf.transform.x+=wolf.velocity.x*.19;wolf.transform.z+=wolf.velocity.z*.19;enemyPhase=now+320;fx.cameraKickUntil=now+180;
  const hit=applyDamage(player,9,'dire-wolf');player.hitUntil=now+220;fx.impactUntil=now+180;
  $('#combatlog').textContent=hit.defeated?'Aren falls. The Verge restores him at dawn.':`The wolf lunges for ${hit.amount}.`;
  if(hit.defeated){clearInterval(enemyTimer);setTimeout(()=>{player.alive=true;player.resources.hp=player.resources.max.hp;Object.assign(player.transform,{x:0,z:0});Object.assign(wolf.transform,{x:9,z:15.2});endCombat()},1100)}
  refreshHud();
}
function strike(power=18){
  if(!inCombat||!wolf.alive)return;const now=performance.now();fx.slashUntil=now+300;fx.cameraKickUntil=now+120;
  const dx=wolf.transform.x-player.transform.x,dz=wolf.transform.z-player.transform.z,d=Math.max(.001,Math.hypot(dx,dz));
  player.transform.x+=dx/d*.28;player.transform.z+=dz/d*.28;
  const hit=applyDamage(wolf,power,'player');wolf.hitUntil=now+260;wolf.transform.x+=dx/d*.48;wolf.transform.z+=dz/d*.48;
  $('#combatlog').textContent=hit.defeated?'The wolf breaks away and vanishes into Wildwood.':`Aren drives the wolf back for ${hit.amount}.`;
  if(hit.defeated){wolf.alive=false;clearInterval(enemyTimer);setTimeout(endCombat,850)}refreshHud();
}
function cast(){if(!inCombat)return;fx.aegisUntil=performance.now()+1100;$('#combatlog').textContent='Verdant Aegis roots through soil and old stone.';strike(30)}
function endCombat(){inCombat=false;clearInterval(enemyTimer);Object.assign(wolf.velocity,{x:0,z:0});refreshHud()}
function save(){localStorage.setItem('veilbound.slice.save',JSON.stringify({position:player.transform,hp:player.resources.hp,wolfAlive:wolf.alive}));$('#save').textContent='JOURNEY SAVED';setTimeout(()=>$('#save').textContent='SAVE JOURNEY',1200)}
const saved=JSON.parse(localStorage.getItem('veilbound.slice.save')||'null');if(saved){Object.assign(player.transform,saved.position);player.resources.hp=saved.hp;if(saved.wolfAlive===false)wolf.alive=false}

addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e'){$('#dialogue').hidden?interact():$('#dialogue').hidden=true}if(e.code==='Space'){e.preventDefault();strike()}if(e.key.toLowerCase()==='q')cast();if(e.key==='Escape'){$('#dialogue').hidden=true;endCombat()}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('resize',()=>renderer.resize(innerWidth,innerHeight,devicePixelRatio||1));
$('#closeDialogue').onclick=()=>$('#dialogue').hidden=true;$('#attack').onclick=()=>strike();$('#cast').onclick=cast;$('#flee').onclick=endCombat;$('#save').onclick=save;
$('#touchStrike').onclick=()=>strike();$('#touchAegis').onclick=()=>cast();$('#touchInteract').onclick=()=>{$('#dialogue').hidden?interact():$('#dialogue').hidden=true};

const stick=$('#touchStick'),knob=$('#touchStickKnob');
function updateStick(clientX,clientY){
  const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=clientX-cx,dy=clientY-cy,max=r.width*.34,len=Math.hypot(dx,dy)||1,scale=Math.min(1,max/len),px=dx*scale,py=dy*scale;
  knob.style.transform=`translate(calc(-50% + ${px}px),calc(-50% + ${py}px))`;
  const mag=Math.min(1,Math.hypot(px,py)/max);touchMove.x=mag<.12?0:px/max;touchMove.y=mag<.12?0:-py/max;
}
stick.addEventListener('pointerdown',e=>{stick.setPointerCapture(e.pointerId);updateStick(e.clientX,e.clientY)});
stick.addEventListener('pointermove',e=>{if(stick.hasPointerCapture(e.pointerId))updateStick(e.clientX,e.clientY)});
function releaseStick(e){if(stick.hasPointerCapture?.(e.pointerId))stick.releasePointerCapture(e.pointerId);touchMove.x=0;touchMove.y=0;knob.style.transform='translate(-50%,-50%)'}
stick.addEventListener('pointerup',releaseStick);stick.addEventListener('pointercancel',releaseStick);

function frame(now){
  const dt=Math.min(.04,(now-last)/1000);last=now;
  if(!inCombat&&$('#dialogue').hidden){
    const keyX=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),keyY=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
    const x=Math.abs(touchMove.x)>.01?touchMove.x:keyX,y=Math.abs(touchMove.y)>.01?touchMove.y:keyY;
    const before={x:player.transform.x,z:player.transform.z};moveCharacter(player,{x,y},dt,4.25);player.transform.x=Math.max(-15,Math.min(17,player.transform.x));player.transform.z=Math.max(-4,Math.min(19,player.transform.z));
    const blocked=(player.transform.x>7.2&&player.transform.x<13.5&&player.transform.z>29)||(player.transform.x>9.3&&player.transform.z>17&&player.transform.z<33);
    if(blocked){player.transform.x=before.x;player.transform.z=before.z;player.velocity.x=0;player.velocity.z=0}
  }
  dog.transform.x+=(player.transform.x-1.65-dog.transform.x)*dt*3;dog.transform.z+=(player.transform.z+.9-dog.transform.z)*dt*3;dog.velocity.x=player.transform.x-dog.transform.x;dog.velocity.z=player.transform.z-dog.transform.z;
  if(inCombat&&wolf.alive&&now>enemyPhase){wolf.transform.x+=(9-wolf.transform.x)*dt*1.6;wolf.transform.z+=(15.2-wolf.transform.z)*dt*1.6;wolf.velocity.x=(9-wolf.transform.x)*1.6;wolf.velocity.z=(15.2-wolf.transform.z)*1.6}
  renderer.render({time:now,player,dog,farmer,wolf,scenery,fx});refreshHud();requestAnimationFrame(frame)
}
refreshHud();requestAnimationFrame(frame);