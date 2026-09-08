import { moveCharacter } from '../world/movement.js';
import { applyDamage } from '../combat/combat.js';
import { RiverfordCanvasRenderer } from '../rendering/canvas-renderer.js';
import { scenery, atmosphereAssets, groundAssets, SPAWN, WOLF_HOME, groundHeight, walkable, moveWithinScene } from '../world/riverford.js';
import { frameDelta, inRange, readJourney } from './slice-state.js';

const $=s=>document.querySelector(s),keys=new Set();
const distance=(a,b)=>Math.hypot(a.transform.x-b.transform.x,a.transform.z-b.transform.z);
const actor=(id,sprite,x,z,hp,size)=>({id,sprite,size,transform:{x,z,y:groundHeight(x,z),yaw:0},resources:{hp,max:{hp}},alive:true,velocity:{x:0,z:0,y:0},facing:1,hitUntil:0});
const player=actor('player','assets/characters/player_exploration_base_01.png',SPAWN.x,SPAWN.z,140,2.2);
Object.assign(player.resources,{focus:80});player.resources.max.focus=80;
const dog=actor('dog','assets/creatures/companion_dog_exploration_01.png',SPAWN.x-1,SPAWN.z-.5,40,.92);
const farmer=actor('farmer','assets/characters/npc_farmer_exploration_01.png',-4.6,10,90,2.12);
const merchant=actor('merchant','assets/characters/npc_merchant_exploration_01.png',-5.3,25,90,2.13);
const townsfolk=actor('townsfolk','assets/characters/npc_townsfolk_female_01.png',-3.6,34,90,2.06);
const wolf=actor('wolf','assets/creatures/dire_wolf_exploration_01.png',WOLF_HOME.x,WOLF_HOME.z,72,1.36);
const exploration={player:player.sprite,wolf:wolf.sprite};
const battle={player:'assets/characters/player_battle_base_01.png',wolf:'assets/creatures/dire_wolf_battle_01.png'};
const assets=[...scenery.map(s=>s.path),...groundAssets,...atmosphereAssets,...[player,dog,farmer,merchant,townsfolk,wolf].map(a=>a.sprite),...Object.values(battle)];
const renderer=new RiverfordCanvasRenderer();
const reviewMode=new URLSearchParams(location.search).has('review');
let reviewOutput,reviewFrames=0,reviewSince=0,renderMs=0;
if(reviewMode){reviewOutput=document.createElement('output');reviewOutput.setAttribute('aria-label','Review diagnostics');reviewOutput.style.cssText='position:absolute;left:8px;bottom:4px;z-index:250;font:11px monospace;color:white;background:#14251d';$('#game').append(reviewOutput);}
let inCombat=false,last=0,clock=0,enemyNext=0,windupUntil=0,attackReady=0,aegisReady=0,defeatUntil=0,noticeUntil=0,withdrawUntil=0,autosaveAt=0,paused=false;
let target=null,metFarmer=false,visitedMarket=false,dialogueCallback=null;
const fx={aegisUntil:0,slashUntil:0,cameraKickUntil:0,numbers:[]};
const touchMove={x:0,y:0};
const stick=$('#touchStick'),knob=$('#touchStickKnob');
function say(text,seconds=4){$('#notice').textContent=text;noticeUntil=clock+seconds*1000;}
function log(text){$('#combatlog').textContent=text;}
function number(a,text,color='#f6dfae'){fx.numbers.push({x:a.transform.x,z:a.transform.z,born:clock,text,color});}
function modalOpen(){return !$('#dialogue').hidden||!$('#notes').hidden;}
function stopInput(){keys.clear();target=null;touchMove.x=0;touchMove.y=0;knob.style.transform='translate(-50%,-50%)';player.velocity.x=0;player.velocity.z=0;}
function nearestPerson(){return [farmer,merchant,townsfolk].find(a=>distance(player,a)<3);}
function refreshHud(){
  const hp=Math.ceil(player.resources.hp),focus=Math.floor(player.resources.focus);
  $('#hpbar').style.width=100*hp/140+'%';$('#focusbar').style.width=100*focus/80+'%';$('#php').textContent=hp;$('#focusValue').textContent=focus;$('#whp').textContent=wolf.resources.hp;
  $('.health').setAttribute('aria-valuenow',hp);$('.focus').setAttribute('aria-valuenow',focus);
  const person=nearestPerson(),nearWolf=wolf.alive&&inRange(player,wolf,4.2);
  $('#prompt').hidden=(!person&&!nearWolf)||inCombat||modalOpen()||!player.alive;
  $('#promptText').textContent=person?({farmer:'Speak with Elian',merchant:'Visit the trader',townsfolk:'Speak with a villager'}[person.id]):'Face the dire wolf';
  $('#combatHud').hidden=!inCombat;document.body.classList.toggle('in-combat',inCombat);
  $('#touchStrike').hidden=!inCombat;$('#touchAegis').hidden=!inCombat;$('#touchInteract').hidden=inCombat||modalOpen();$('#touchInteract').disabled=!person&&!nearWolf;
  const strikeDisabled=!player.alive||clock<attackReady||!inRange(player,wolf,3);
  for(const s of ['#attack','#touchStrike'])$(s).disabled=strikeDisabled;
  for(const s of ['#cast','#touchAegis']){$(s).disabled=!player.alive||clock<aegisReady||focus<25;$(s).textContent=clock<aegisReady?`Aegis ${Math.ceil((aegisReady-clock)/1000)}s`:(s==='#cast'?'Verdant Aegis · 25':'Aegis');}
  const z=player.transform.z,x=player.transform.x;
  $('#locationDetail').textContent=x>8?'The old stones':Math.abs(z-19)<3?'The stone crossing':z>23?'Riverford outskirts':z>7?'The ancient oak':'The southern road';
}
function openDialogue(speaker,text,action=null){stopInput();$('#speaker').textContent=speaker;$('#dialogueText').textContent=text;$('#dialogue').hidden=false;$('#dialogueAction').hidden=!action;dialogueCallback=action?.run;if(action)$('#dialogueAction').textContent=action.label;$('#closeDialogue').focus();}
function closeDialogue(){ $('#dialogue').hidden=true;dialogueCallback=null;stopInput();save(false);$('#gameCanvas').focus(); }
function interact(){
  if(inCombat||!player.alive)return;
  const person=nearestPerson();
  if(person===farmer){metFarmer=true;openDialogue('Elian of Riverford',wolf.alive?'“The road north is Riverford. Across the bridge, those old stones belong to the Wildwood now. There’s a wolf there that’s forgotten to fear people. Watch its shoulders. When it lowers them, move.”':'“Heard the quiet before I saw you. The crossing is ours again—for a while, at least. Sit a moment. You and that dog have earned it.”',{label:'Rest by the oak',run:()=>{player.resources.hp=140;player.resources.focus=80;say('Rested by the ancient oak.');closeDialogue();}});}
  else if(person===merchant){visitedMarket=true;openDialogue('Riverford trader','“The mill road’s still open. Old Elian keeps this side of the river decent. Beyond the bridge? I leave that to people with better boots.”',{label:'Refill your waterskin',run:()=>{player.resources.hp=Math.min(140,player.resources.hp+35);say('Cool water. A little strength restored.');closeDialogue();}});}
  else if(person===townsfolk)openDialogue('A Riverford villager',wolf.alive?'“There used to be a bell beyond the river. On still mornings you could hear it from here. Just water and birds now.”':'“Your dog came over the bridge before you. Looked pleased with himself. I suppose somebody ought to.”');
  else if(wolf.alive&&inRange(player,wolf,4.2))startCombat();
}
function startCombat(){
  if(inCombat||clock<withdrawUntil||!wolf.alive||!player.alive)return;
  inCombat=true;target=null;enemyNext=clock+1000;windupUntil=0;
  player.sprite=battle.player;wolf.sprite=battle.wolf;
  log('The wolf stiffens. Stay close to strike; move when it lunges.');refreshHud();
}
function endCombat(){inCombat=false;windupUntil=0;player.sprite=exploration.player;wolf.sprite=exploration.wolf;wolf.velocity.x=0;wolf.velocity.z=0;refreshHud();}
function withdraw(){if(!inCombat)return;endCombat();withdrawUntil=clock+7000;wolf.resources.hp=72;Object.assign(wolf.transform,WOLF_HOME);say('The wolf returns to the stones. Fall back across the bridge.');stopInput();}
function damagePlayer(){
  const guarded=fx.aegisUntil>clock,hit=applyDamage(player,guarded?3:16,'dire-wolf');player.hitUntil=clock+180;fx.cameraKickUntil=clock+140;number(player,guarded?`Guarded −${hit.amount}`:`−${hit.amount}`,guarded?'#c7e8a8':'#edab91');
  log(guarded?'Living roots catch the lunge.':'The wolf connects. Watch for the next wind-up.');
  if(hit.defeated){defeatUntil=clock+1700;stopInput();log('Aren falls. The dog leads him back to the southern road.');}
}
function strike(){
  if(!inCombat||!wolf.alive||!player.alive||clock<attackReady)return;
  if(!inRange(player,wolf,3)){log('Too far. Close the distance or wait for its approach.');return;}
  attackReady=clock+650;fx.slashUntil=clock+260;player.facing=wolf.transform.x<player.transform.x?-1:1;
  const hit=applyDamage(wolf,18,'player');wolf.hitUntil=clock+200;number(wolf,`−${hit.amount}`);
  log(hit.defeated?'The wolf breaks away into the Wildwood.':'The strike drives the wolf back.');
  if(hit.defeated){endCombat();say('The crossing is quiet. Return to Elian, or follow the road into Riverford.',7);save(false);}
}
function cast(){
  if(!inCombat||!player.alive||clock<aegisReady||player.resources.focus<25)return;
  player.resources.focus-=25;aegisReady=clock+6500;fx.aegisUntil=clock+3000;
  log('Verdant Aegis. Roots brace your footing and blunt the next blows.');number(player,'Aegis','#cae8a6');
}
function save(announce=true){
  if(!player.alive||inCombat){if(announce)say('Find a quiet moment before saving.');return;}
  try{localStorage.setItem('veilbound.slice.save',JSON.stringify({version:2,position:player.transform,hp:player.resources.hp,focus:player.resources.focus,wolfAlive:wolf.alive,metFarmer,visitedMarket}));if(announce)say('Journey saved.');}
  catch{if(announce)say('This browser cannot save the journey. You can keep playing.');}
}
function restore(){
  try{const saved=readJourney(localStorage.getItem('veilbound.slice.save'));if(saved){Object.assign(player.transform,saved.position);player.transform.y=groundHeight(player.transform.x,player.transform.z);player.resources.hp=saved.hp;player.resources.focus=saved.focus;wolf.alive=saved.wolfAlive;metFarmer=saved.metFarmer;visitedMarket=saved.visitedMarket;Object.assign(dog.transform,{x:player.transform.x-.9,z:player.transform.z-.5});return true;}}catch{}return false;
}
function openNotes(){if(inCombat){say('Field notes can wait until you’re clear of the wolf.');return;}stopInput();$('#notes').hidden=false;$('#journeyProgress').textContent=wolf.alive?(metFarmer?'Elian warned you about the wolf beyond the bridge. The crossing is east of the signpost. Riverford’s trader is farther up the northern road.':'Elian tends the verge by the ancient oak. The road continues north to Riverford; the bridge leads east to the old stones.'):'The dire wolf has retreated. The bridge is quiet again. Elian is by the ancient oak; the trader has water on the northern road.';$('#closeNotes').focus();}
function closeNotes(){ $('#notes').hidden=true;stopInput();$('#gameCanvas').focus(); }
addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))e.preventDefault();
  if(modalOpen()){if(!e.repeat&&(key==='escape'||key==='e')){$('#dialogue').hidden?closeNotes():closeDialogue();}return;}
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){keys.add(key);target=null;}
  if(e.repeat)return;
  if(key==='e')interact();if(e.code==='Space')strike();if(key==='q')cast();if(key==='r')save();if(key==='escape')inCombat?withdraw():openNotes();
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{paused=true;stopInput();});addEventListener('focus',()=>{paused=false;last=0;});
addEventListener('pagehide',()=>save(false));document.addEventListener('visibilitychange',()=>{paused=document.hidden;stopInput();last=0;});
addEventListener('resize',()=>renderer.resize($('#game').clientWidth,$('#game').clientHeight,devicePixelRatio||1));
$('#closeDialogue').onclick=closeDialogue;$('#dialogueAction').onclick=()=>dialogueCallback?.();$('#attack').onclick=strike;$('#cast').onclick=cast;$('#flee').onclick=withdraw;$('#save').onclick=()=>save();$('#help').onclick=openNotes;$('#closeNotes').onclick=closeNotes;$('#prompt').onclick=interact;
$('#touchStrike').onclick=strike;$('#touchAegis').onclick=cast;$('#touchInteract').onclick=interact;
$('#retry').onclick=()=>location.reload();
function updateStick(clientX,clientY){
  const r=stick.getBoundingClientRect(),dx=clientX-r.left-r.width/2,dy=clientY-r.top-r.height/2,max=r.width*.34,len=Math.hypot(dx,dy)||1,scale=Math.min(1,max/len),px=dx*scale,py=dy*scale;
  target=null;knob.style.transform=`translate(calc(-50% + ${px}px),calc(-50% + ${py}px))`;
  const mag=Math.hypot(px,py)/max;touchMove.x=mag<.12?0:px/max;touchMove.y=mag<.12?0:-py/max;
}
stick.addEventListener('pointerdown',e=>{if(modalOpen())return;stick.setPointerCapture(e.pointerId);updateStick(e.clientX,e.clientY);});
stick.addEventListener('pointermove',e=>{if(stick.hasPointerCapture(e.pointerId))updateStick(e.clientX,e.clientY);});
function releaseStick(){touchMove.x=0;touchMove.y=0;knob.style.transform='translate(-50%,-50%)';}
for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,releaseStick);
$('#gameCanvas').addEventListener('pointerdown',e=>{
  if(modalOpen()||!player.alive)return;$('#gameCanvas').focus();
  const r=e.currentTarget.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top,h=renderer.height;
  if(sy<h*.32)return;
  const {x,z}=renderer.pick(sx,sy);
  if(walkable(x,z))target={x,z};else say('Follow the road. The river is crossed at the stone bridge.',3);
});
function updateCombat(dt){
  if(!inCombat||!wolf.alive||!player.alive)return;
  const d=distance(player,wolf);
  if(d>12){withdraw();return;}
  if(windupUntil){
    wolf.velocity.x=0;wolf.velocity.z=0;
    if(clock>=windupUntil){if(d<3.4)damagePlayer();else log('The lunge misses. There’s your opening.');windupUntil=0;enemyNext=clock+1350;}
  } else if(d>2.3||Math.abs(wolf.transform.x-player.transform.x)<1.5){
    const flank=player.transform.x>15?-2:2;
    const dx=player.transform.x+flank-wolf.transform.x,dz=player.transform.z+.6-wolf.transform.z,approach=Math.max(.01,Math.hypot(dx,dz));
    moveWithinScene(wolf,{x:dx/approach,y:dz/approach},dt,moveCharacter,fx.aegisUntil>clock?1.4:3.25);wolf.facing=dx<0?-1:1;
  } else if(clock>=enemyNext){windupUntil=clock+820;log('The wolf lowers its shoulders — move!');}
}
function frame(now){
  const dt=last===0?0:frameDelta(now,last);last=now;
  if(!paused&&!modalOpen())clock+=dt*1000;
  if(!paused&&!modalOpen()&&player.alive){
    let x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),y=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
    if(Math.hypot(touchMove.x,touchMove.y)>.01){x=touchMove.x;y=touchMove.y;}
    if(target){const dx=target.x-player.transform.x,dz=target.z-player.transform.z,d=Math.hypot(dx,dz);if(d<.2)target=null;else{x=dx/d;y=dz/d;}}
    const before={...player.transform};moveWithinScene(player,{x,y},dt,moveCharacter);
    if(x)player.facing=x<0?-1:1;
    if(target&&Math.hypot(player.transform.x-before.x,player.transform.z-before.z)<.001&&dt>0)target=null;
    if(!inCombat&&wolf.alive&&clock>withdrawUntil&&inRange(player,wolf,3.7))startCombat();
    updateCombat(dt);
    if(!inCombat)player.resources.focus=Math.min(80,player.resources.focus+dt*5);
    // Companion retraces the player's bank/crossing instead of cutting through water.
    const dd=distance(player,dog);if(dd>1.15){const dx=player.transform.x-dog.transform.x,dz=player.transform.z-dog.transform.z;moveWithinScene(dog,{x:dx/dd,y:dz/dd},dt,moveCharacter,Math.min(6,dd*2.8));dog.facing=dx<0?-1:1;}else{dog.velocity.x=0;dog.velocity.z=0;}
    if(dd>8){Object.assign(dog.transform,{...player.transform});}
    if(clock>autosaveAt&&!inCombat){save(false);autosaveAt=clock+20000;}
  }else{player.velocity.x=0;player.velocity.z=0;}
  if(defeatUntil&&clock>=defeatUntil){player.alive=true;player.resources.hp=140;player.resources.focus=80;Object.assign(player.transform,{...SPAWN,y:0});Object.assign(dog.transform,{x:SPAWN.x-1,z:SPAWN.z});wolf.resources.hp=72;Object.assign(wolf.transform,WOLF_HOME);defeatUntil=0;endCombat();renderer.firstFrame=true;say('Back on the southern road. Rest, regroup, and try the crossing again.',6);save(false);}
  if(clock>noticeUntil)$('#notice').textContent='';fx.numbers=fx.numbers.filter(n=>clock-n.born<900);
  if(reviewMode){reviewFrames++;if(now-reviewSince>1000){reviewOutput.textContent=`${Math.round(reviewFrames*1000/(now-reviewSince))} fps / ${renderMs.toFixed(0)} ms draw · x ${player.transform.x.toFixed(1)} z ${player.transform.z.toFixed(1)} · ${inCombat?'combat':'travel'}`;reviewSince=now;reviewFrames=0;}}
  const renderStart=performance.now();renderer.render({time:clock,dt,player,dog,farmer,merchant,townsfolk,wolf,scenery,fx,inCombat,windup:!!windupUntil});renderMs=performance.now()-renderStart;refreshHud();requestAnimationFrame(frame);
}
try{
  const restored=restore();
  await renderer.initialize($('#gameCanvas'),assets,p=>{$('#loadProgress').value=p;$('#loadingText').textContent=`Following the river… ${Math.round(p*100)}%`;});
  $('#loading').hidden=true;say(restored?'Your journey continues.':'Elian is by the ancient oak. Follow the road north.',7);refreshHud();requestAnimationFrame(frame);
}catch(error){$('#loadingText').textContent=error.message;$('#retry').hidden=false;$('#loadProgress').hidden=true;console.error(error);}
