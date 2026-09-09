import { RendererContract } from './contracts.js';
import { ASSET_BOUNDS } from './asset-bounds.js';
import { roadX, riverX, groundHeight } from '../world/riverford.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const FLOOR='assets/environment/terrain/forest_floor_01.png';
const PATH='assets/environment/terrain/dirt_path_01.png';
const WATER='assets/environment/water/river_shallow_01.png';
export function projectPoint(x,z,y,camera,width,height) {
  const depth=z-camera.z;
  const scale=20/Math.max(.1,depth);
  return {x:width*.5+(x-camera.x)*height*.055*scale,y:height*.26+height*8.4/Math.max(.1,depth)-y*height*.055*scale,scale,depth};
}
export function pickGround(sx,sy,camera,width,height){
  const ray=level=>{const depth=height*(8.4-level*1.1)/(sy-height*.26);return {x:camera.x+(sx-width*.5)*depth/(height*1.1),z:camera.z+depth};};
  for(let level=2.55;level>.1;level-=.15){const p=ray(level);if(Math.abs(groundHeight(p.x,p.z)-level)<.13)return p;}
  return ray(0);
}
export class RiverfordCanvasRenderer extends RendererContract {
  constructor(){super();this.images=new Map();this.camera={x:-2,z:-19};this.width=1;this.height=1;this.firstFrame=true;}
  async initialize(canvas,assetBundle,onProgress=()=>{}) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});
    if(!this.ctx)throw new Error('Your browser could not start the world renderer.');
    const paths=[...new Set(assetBundle)];let loaded=0;
    await Promise.all(paths.map(async path=>{
      const img=new Image();img.decoding='async';img.src=path+'?art=alpha-repair-1';
      try{await img.decode()}catch{throw new Error(`Unable to load ${path}. Please reload the journey.`)}
      this.images.set(path,img);onProgress(++loaded/paths.length);
    }));
    this.buildTerrain();this.buildDepthArt();this.resize(canvas.clientWidth,canvas.clientHeight,devicePixelRatio||1);
  }
  resize(width,height,pixelRatio=1){
    this.width=Math.max(1,width);this.height=Math.max(1,height);this.dpr=clamp(pixelRatio,1,1.75);
    this.canvas.width=Math.floor(width*this.dpr);this.canvas.height=Math.floor(height*this.dpr);
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.ctx.imageSmoothingEnabled=true;
  }
  pick(sx,sy){return pickGround(sx,sy,this.camera,this.width,this.height)}
  project(x,z,y=0){return projectPoint(x,z,y,this.camera,this.width,this.height)}
  crop(path){const b=ASSET_BOUNDS[path];return [b[0],b[1],b[2]-b[0],b[3]-b[1]]}
  // A single continuous world-space material map. Perspective scanlines sample it;
  // no upright strips, screen-locked floor or stacked terrain bands.
  buildTerrain(){
    const map=document.createElement('canvas');map.width=3072;map.height=4096;
    const c=map.getContext('2d'),sx=map.width/128,sz=map.height/184;
    const px=x=>(x+64)*sx,pz=z=>(160-z)*sz;
    c.fillStyle='#343c27';c.fillRect(0,0,map.width,map.height);
    const texture=(path,size,crop)=>{
      const tile=document.createElement('canvas');tile.width=size;tile.height=size;
      const t=tile.getContext('2d');t.drawImage(this.images.get(path),...crop,0,0,size,size);
      return c.createPattern(tile,'repeat');
    };
    c.fillStyle=texture(FLOOR,105,[330,290,450,210]);c.fillRect(0,0,map.width,map.height);
    // Sparse, overlapping authored leaf patches break material repetition.
    const leaf=this.images.get('assets/environment/terrain/leaf_litter_01.png');
    for(let i=0;i<290;i++){
      const x=((i*977)%map.width),y=((i*1553)%map.height),s=70+(i%7)*17;
      c.globalAlpha=.12+(i%4)*.05;c.drawImage(leaf,x,y,s,s*.6);
    }c.globalAlpha=1;
    // Weathered ruts follow a curved road, then branch across the stone bridge.
    c.save();c.beginPath();
    for(let z=-24;z<=160;z+=1){const x=px(roadX(z)-1.8);z===-24?c.moveTo(x,pz(z)):c.lineTo(x,pz(z));}
    for(let z=160;z>=-24;z-=1)c.lineTo(px(roadX(z)+1.8),pz(z));c.closePath();
    c.rect(px(-3),pz(20.5),17*sx,3*sz);
    c.moveTo(px(10.2),pz(19));c.lineTo(px(10.4),pz(30));c.lineTo(px(11.3),pz(39));c.lineTo(px(13.7),pz(39));c.lineTo(px(13.3),pz(30));c.lineTo(px(13.8),pz(19));c.closePath();c.clip();
    c.fillStyle='#756344';c.fillRect(0,0,map.width,map.height);
    c.globalAlpha=.92;c.fillStyle=texture(PATH,145,[310,290,440,250]);c.fillRect(0,0,map.width,map.height);c.restore();
    // River is cut into this same ground plane; both banks share its coordinates.
    c.save();c.beginPath();
    for(let z=-24;z<=160;z++) {const x=px(riverX(z)-2.65);z===-24?c.moveTo(x,pz(z)):c.lineTo(x,pz(z));}
    for(let z=160;z>=-24;z--)c.lineTo(px(riverX(z)+2.65),pz(z));c.closePath();c.clip();
    c.fillStyle='#3e6065';c.fillRect(0,0,map.width,map.height);
    c.globalAlpha=.9;c.fillStyle=texture(WATER,140,[345,305,420,180]);c.fillRect(0,0,map.width,map.height);c.restore();
    this.terrain=map;
  }
  buildDepthArt(){
    this.depthArt=new Map();
    for(const [path,img] of this.images){
      if(!path.includes('/tree_'))continue;
      const variants=[];
      for(const alpha of [.18,.36,.54]){const cv=document.createElement('canvas');cv.width=Math.min(512,img.width);cv.height=Math.round(img.height*cv.width/img.width);const c=cv.getContext('2d');c.drawImage(img,0,0,cv.width,cv.height);c.globalCompositeOperation='source-atop';c.fillStyle=`rgba(152,178,156,${alpha})`;c.fillRect(0,0,cv.width,cv.height);variants.push(cv);}
      this.depthArt.set(path,variants);
    }
  }
  drawBackdrop(){
    const c=this.ctx,w=this.width,h=this.height;
    const g=c.createLinearGradient(0,0,0,h*.55);g.addColorStop(0,'#7c9da0');g.addColorStop(.5,'#c1cbb6');g.addColorStop(1,'#6a8063');c.fillStyle=g;c.fillRect(0,0,w,h);
    const sun=c.createRadialGradient(w*.71,h*.14,0,w*.71,h*.14,h*.4);sun.addColorStop(0,'#fff4ceaa');sun.addColorStop(1,'#fff4ce00');c.fillStyle=sun;c.fillRect(0,0,w,h*.6);
  }
  drawGround(){
    const c=this.ctx,h=this.height,w=this.width,map=this.terrain;
    for(let y=Math.floor(h*.305);y<h;y+=2){
      const depth=h*8.4/(y-h*.26),z=this.camera.z+depth,scale=20/depth;
      const span=w/(h*.055*scale),left=this.camera.x-span/2;
      const sy=(160-z)/184*map.height,sx=(left+64)/128*map.width,sw=span/128*map.width;
      if(sy<0||sy>=map.height)continue;
      c.drawImage(map,sx,sy,sw,Math.max(1,Math.abs(h*8.4/((y-h*.26)**2))*2/184*map.height),0,y,w,2.5);
    }
    const haze=c.createLinearGradient(0,h*.29,0,h*.56);haze.addColorStop(0,'#a4b9a3');haze.addColorStop(.45,'#a4b9a366');haze.addColorStop(1,'#a4b9a300');c.fillStyle=haze;c.fillRect(0,h*.29,w,h*.29);
  }
  drawSprite(path,x,z,size,{y=0,alpha=1,flip=false,bob=0,actor=false,hit=false}={}) {
    const p=this.project(x,z,y+bob);let img=this.images.get(path);if(this.depthArt.has(path)&&p.depth>48)img=this.depthArt.get(path)[p.depth>100?2:p.depth>70?1:0];if(!img||p.depth<4)return;
    const crop=this.crop(path),sourceScale=img.width/this.images.get(path).width;const sample=crop.map(v=>v*sourceScale),targetH=size*p.scale*this.height*.055,targetW=targetH*crop[2]/crop[3];
    if(p.x+targetW/2<0||p.x-targetW/2>this.width||p.y-targetH>this.height||p.y<0)return;
    const c=this.ctx;
    if(actor){
      const foot=this.project(x,z,y);c.save();c.globalAlpha=.35;const r=Math.max(3,targetW*.4);
      const shadow=c.createRadialGradient(foot.x,foot.y,0,foot.x,foot.y,r);shadow.addColorStop(0,'#070d08');shadow.addColorStop(1,'#070d0800');c.fillStyle=shadow;c.translate(foot.x,foot.y);c.scale(1,.25);c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.restore();
    }
    c.save();c.globalAlpha=alpha;c.translate(p.x,p.y);if(flip)c.scale(-1,1);
    if(actor){c.shadowColor=hit?'#e7ce91':'#c9d7b17a';c.shadowBlur=hit?9:2;}
    c.drawImage(img,...sample,-targetW/2,-targetH,targetW,targetH);
    c.restore();
  }
  drawAtmosphere(time){
    const c=this.ctx,w=this.width,h=this.height;
    const mist=this.images.get('assets/atmosphere/mist_distance_01.png');c.save();c.globalAlpha=.14;c.drawImage(mist,-w*.1,h*.32,w*1.2,h*.15);c.restore();
    const shafts=this.images.get('assets/atmosphere/sunshaft_forest_01.png');c.save();c.globalAlpha=.075;c.drawImage(shafts,w*.36,-h*.15,h*.7,h*.83);c.restore();
    // Only small ambient motes; the scene's surfaces retain their material contrast.
    c.save();for(let i=0;i<13;i++){const x=(i*191+time*.006)%(w+60)-30,y=h*.28+(i*79)%(h*.46);c.globalAlpha=.15+.1*Math.sin(time*.001+i);c.fillStyle='#ffe7a0';c.beginPath();c.arc(x,y,.8,0,Math.PI*2);c.fill()}c.restore();
    const vignette=c.createRadialGradient(w*.5,h*.48,h*.2,w*.5,h*.48,Math.max(w,h)*.72);vignette.addColorStop(0,'#07140c00');vignette.addColorStop(1,'#07140c88');c.fillStyle=vignette;c.fillRect(0,0,w,h);
  }
  drawFx(frame,time){
    const fx=frame.fx||{},c=this.ctx,p=this.project(frame.player.transform.x,frame.player.transform.z,frame.player.transform.y||0);
    if(fx.aegisUntil>time){
      const r=this.height*.065*p.scale,g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'#b2d88866');g.addColorStop(1,'#75a95500');c.fillStyle=g;c.fillRect(p.x-r,p.y-r,r*2,r*2);
      c.save();c.strokeStyle='#bbd393bb';c.lineWidth=1.5;
      for(let i=0;i<8;i++){const a=i*Math.PI/4,s=Math.sin(time*.002+i)*.06;c.beginPath();c.moveTo(p.x+Math.cos(a)*r*.9,p.y+Math.sin(a)*r*.23);c.quadraticCurveTo(p.x+Math.cos(a+s)*r*.42,p.y-r*.32,p.x+Math.cos(a)*r*.22,p.y-r*.8);c.stroke()}c.restore();
    }
    if(fx.slashUntil>time&&frame.wolf.alive){const a=this.project(frame.player.transform.x,frame.player.transform.z,1.1),b=this.project(frame.wolf.transform.x,frame.wolf.transform.z,.7);c.save();c.globalAlpha=clamp((fx.slashUntil-time)/260,0,1);c.strokeStyle='#ffecc5';c.lineWidth=2.5;c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo((a.x+b.x)/2,b.y-22,b.x,b.y);c.stroke();c.restore();}
    if(frame.inCombat&&frame.wolf.alive){const b=this.project(frame.wolf.transform.x,frame.wolf.transform.z,1.65);c.fillStyle='#141a16cc';c.fillRect(b.x-28,b.y-10,56,4);c.fillStyle=frame.windup?'#e3ad68':'#a55745';c.fillRect(b.x-28,b.y-10,56*frame.wolf.resources.hp/frame.wolf.resources.max.hp,4);}
    for(const f of fx.numbers||[]){const age=(time-f.born)/900;if(age>1)continue;const n=this.project(f.x,f.z,1.5+age*.7);c.save();c.globalAlpha=1-age;c.fillStyle=f.color;c.font='bold 16px Georgia';c.textAlign='center';c.shadowColor='#071008';c.shadowBlur=4;c.fillText(f.text,n.x,n.y);c.restore();}
  }
  render(frame){
    const time=frame.time??performance.now(),dt=frame.dt??.016;
    const follow=this.firstFrame?1:1-Math.exp(-dt*7);this.firstFrame=false;
    this.camera.x=lerp(this.camera.x,frame.player.transform.x,follow);this.camera.z=lerp(this.camera.z,frame.player.transform.z-20,follow);
    const c=this.ctx,kick=(frame.fx?.cameraKickUntil||0)>time?Math.sin(time*.08)*1.5:0;c.save();c.translate(kick,0);this.drawBackdrop();this.drawGround();
    const sprites=frame.scenery.map(s=>({...s,kind:'scenery'}));
    for(const a of [frame.farmer,frame.merchant,frame.townsfolk,frame.dog,frame.wolf,frame.player])if(a&&a.alive!==false)sprites.push({kind:'actor',actor:a,z:a.transform.z});
    sprites.sort((a,b)=>(b.z+(b.bridge?4:0))-(a.z+(a.bridge?4:0)));
    for(const item of sprites){
      if(item.kind==='scenery')this.drawSprite(item.path,item.x,item.z,item.size,item);
      else {const a=item.actor,moving=Math.hypot(a.velocity?.x||0,a.velocity?.z||0)>.1;this.drawSprite(a.sprite,a.transform.x,a.transform.z,a.size,{actor:true,y:a.transform.y||0,bob:moving?Math.sin(time*.012)*.025:0,flip:a.facing<0,hit:a.hitUntil>time});}
    }
    this.drawFx(frame,time);this.drawAtmosphere(time);c.restore();
  }
  dispose(){this.images.clear();this.terrain=null;this.canvas=null;this.ctx=null;}
}
