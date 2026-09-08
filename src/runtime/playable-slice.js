import { moveCharacter } from '../world/movement.js';
import { applyDamage } from '../combat/combat.js';
import { RiverfordCanvasRenderer } from '../rendering/canvas-renderer.js';

const $=s=>document.querySelector(s), keys=new Set();
const distance=(a,b)=>Math.hypot(a.transform.x-b.transform.x,a.transform.z-b.transform.z);
const actor=(id,sprite,x,z,hp,size)=>({id,sprite,size,transform:{x,z,y:0,yaw:0},resources:{hp,max:{hp}},alive:true,velocity:{x:0,z:0,y:0},hitUntil:0});
const player=actor('player','assets/characters/player_exploration_base_01.png',0,0,140,2.7);
const dog=actor('dog','assets/creatures/companion_dog_exploration_01.png',-2,-1,40,1.75);
const farmer=actor('farmer','assets/characters/npc_farmer_exploration_01.png',-6,7,90,2.55);
const wolf=actor('wolf','assets/creatures/dire_wolf_exploration_01.png',8,14,72,2.05);
const scenery=[
  ['assets/environment/vegetation/tree_broadleaf_ancient_01.png',-14,28,8.5],['assets/environment/vegetation/tree_broadleaf_mature_01.png',-7,22,6],['assets/environment/vegetation/tree_conifer_01.png',-18,40,7.4],['assets/environment/architecture/riverford_house_01.png',10,33,7.8],['assets/environment/architecture/riverford_market_stall_01.png',4,25,4.8],['assets/environment/ruins/ruin_arch_01.png',14,18,5.2],['assets/environment/infrastructure/stone_bridge_section_01.png',11,28,5.5],['assets/environment/infrastructure/timber_fence_01.png',2,15,3.5],['assets/props/wood_signpost_01.png',-1,11,2.25],['assets/props/barrel_01.png',5,13,1.55],['assets/props/crate_01.png',6.5,14,1.5],['assets/environment/rocks/boulder_moss_01.png',-8,13,3.1],['assets/environment/vegetation/fallen_log_01.png',-12,17,3.2],['assets/environment/vegetation/fern_cluster_01.png',-5,9,2.3],['assets/environment/vegetation/shrub_01.png',13,10,2.6],['assets/environment/vegetation/wildflower_cluster_01.png',-1,7,1.7],['assets/environment/ruins/ruin_wall_01.png',16,34,5.3]
].map(([path,x,z,size])=>({path,x,z,size}));
const assets=[...new Set([...scenery.map(s=>s.path),player.sprite,dog.sprite,farmer.sprite,wolf.sprite,'assets/environment/terrain/forest_floor_01.png','assets/environment/terrain/dirt_path_01.png','assets/environment/water/river_shallow_01.png','assets/atmosphere/mist_near_01.png'])];
const renderer=new RiverfordCanvasRenderer();
await renderer.initialize($('#gameCanvas'),assets);

let inCombat=false,last=performance.now(),enemyTimer=0;const fx={aegisUntil:0,slashUntil:0};
function refreshHud(){
  $('#hpbar').style.width=100*player.resources.hp/player.resources.max.hp+'%';$('#php').textContent=player.resources.hp;$('#whp').textContent=wolf.resources.hp;
  const nearFarmer=distance(player,farmer)<3.5,nearWolf=wolf.alive&&distance(player,wolf)<4;
  $('#prompt').hidden=(!nearFarmer&&!nearWolf)||inCombat;$('#promptText').textContent=nearFarmer?'E · Speak with Elian':'E · Confront the dire wolf';
  $('#combatHud').hidden=!inCombat;
}
function interact(){if(inCombat)return;if(distance(player,farmer)<3.5){$('#dialogue').hidden=false;return}if(wolf.alive&&distance(player,wolf)<4)startCombat()}
function startCombat(){inCombat=true;$('#combatlog').textContent='The dire wolf lowers its head beneath the ruined arch.';enemyTimer=setInterval(()=>{if(!inCombat||!wolf.alive)return;const hit=applyDamage(player,9,'dire-wolf');player.hitUntil=performance.now()+180;$('#combatlog').textContent=hit.defeated?'Aren falls. The Verge restores him at dawn.':`The wolf tears in for ${hit.amount}.`;if(hit.defeated){clearInterval(enemyTimer);setTimeout(()=>{player.alive=true;player.resources.hp=player.resources.max.hp;Object.assign(player.transform,{x:0,z:0});endCombat()},1100)}refreshHud()},1700);refreshHud()}
function strike(power=18){if(!inCombat||!wolf.alive)return;fx.slashUntil=performance.now()+260;const hit=applyDamage(wolf,power,'player');wolf.hitUntil=performance.now()+220;$('#combatlog').textContent=hit.defeated?'The wolf breaks away and vanishes into Wildwood.':`Aren strikes for ${hit.amount}.`;if(hit.defeated){wolf.alive=false;clearInterval(enemyTimer);setTimeout(endCombat,850)}refreshHud()}
function cast(){if(!inCombat)return;fx.aegisUntil=performance.now()+950;$('#combatlog').textContent='Verdant Aegis roots through soil and old stone.';strike(30)}
function endCombat(){inCombat=false;clearInterval(enemyTimer);refreshHud()}
function save(){localStorage.setItem('veilbound.slice.save',JSON.stringify({position:player.transform,hp:player.resources.hp,wolfAlive:wolf.alive}));$('#save').textContent='JOURNEY SAVED';setTimeout(()=>$('#save').textContent='SAVE JOURNEY',1200)}
const saved=JSON.parse(localStorage.getItem('veilbound.slice.save')||'null');if(saved){Object.assign(player.transform,saved.position);player.resources.hp=saved.hp;if(saved.wolfAlive===false)wolf.alive=false}
addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e'){$('#dialogue').hidden?interact():$('#dialogue').hidden=true}if(e.code==='Space'){e.preventDefault();strike()}if(e.key.toLowerCase()==='q')cast();if(e.key==='Escape'){$('#dialogue').hidden=true;endCombat()}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('resize',()=>renderer.resize(innerWidth,innerHeight,devicePixelRatio||1));
$('#closeDialogue').onclick=()=>$('#dialogue').hidden=true;$('#attack').onclick=()=>strike();$('#cast').onclick=cast;$('#flee').onclick=endCombat;$('#save').onclick=save;
function frame(now){
  const dt=Math.min(.04,(now-last)/1000);last=now;
  if(!inCombat&&$('#dialogue').hidden){const x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),y=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);moveCharacter(player,{x,y},dt,4);player.transform.x=Math.max(-15,Math.min(17,player.transform.x));player.transform.z=Math.max(-4,Math.min(19,player.transform.z));dog.transform.x+=(player.transform.x-1.7-dog.transform.x)*dt*2.5;dog.transform.z+=(player.transform.z+1-dog.transform.z)*dt*2.5;dog.velocity.x=player.transform.x-dog.transform.x;dog.velocity.z=player.transform.z-dog.transform.z}
  renderer.render({time:now,player,dog,farmer,wolf,scenery,fx});refreshHud();requestAnimationFrame(frame)
}
refreshHud();requestAnimationFrame(frame);
