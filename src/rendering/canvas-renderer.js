import { RendererContract } from './contracts.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;

async function loadImage(path){
  const image=new Image();image.decoding='async';image.src=path;await image.decode();return image;
}

export class RiverfordCanvasRenderer extends RendererContract {
  constructor(){super();this.canvas=null;this.ctx=null;this.images=new Map();this.camera={x:0,z:-5};this.width=1;this.height=1;this.dpr=1;}

  async initialize(canvas,assetBundle){
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});if(!this.ctx)throw new Error('2D canvas renderer unavailable.');
    await Promise.all([...new Set(assetBundle)].map(async path=>this.images.set(path,await loadImage(path))));
    this.resize(innerWidth,innerHeight,devicePixelRatio||1);
  }

  resize(width,height,pixelRatio=1){
    this.width=Math.max(1,width);this.height=Math.max(1,height);this.dpr=clamp(pixelRatio,1,2);
    this.canvas.width=Math.floor(this.width*this.dpr);this.canvas.height=Math.floor(this.height*this.dpr);this.canvas.style.width=this.width+'px';this.canvas.style.height=this.height+'px';
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='high';
  }

  project(x,z,y=0){
    const rx=x-this.camera.x,rz=z-this.camera.z,depth=rz+12;
    const horizon=this.height*(this.width<700?.31:.27);
    const scale=clamp(15/Math.max(6,depth),.28,1.22);
    const lateral=clamp(this.width*.105,34,64);
    const vertical=clamp(this.height*.023,15,24);
    return{x:this.width*.5+rx*lateral*scale,y:horizon+this.height*.57-(rz*vertical+y*52)*scale,scale,depth};
  }

  drawBackdrop(time){
    const c=this.ctx,w=this.width,h=this.height;
    const sky=c.createLinearGradient(0,0,0,h*.72);sky.addColorStop(0,'#657d84');sky.addColorStop(.38,'#b4a77d');sky.addColorStop(.7,'#43553b');sky.addColorStop(1,'#172419');c.fillStyle=sky;c.fillRect(0,0,w,h);
    const sun=c.createRadialGradient(w*.72,h*.08,0,w*.72,h*.08,h*.42);sun.addColorStop(0,'rgba(255,236,177,.5)');sun.addColorStop(.45,'rgba(221,201,143,.16)');sun.addColorStop(1,'rgba(255,234,166,0)');c.fillStyle=sun;c.fillRect(0,0,w,h*.62);
    const shafts=this.images.get('assets/atmosphere/sunshaft_forest_01.png');if(shafts){c.save();c.globalAlpha=.09;c.drawImage(shafts,w*.36,-h*.03,w*.7,h*.76);c.restore()}
    c.fillStyle='#17261a';c.fillRect(0,h*.56,w,h*.44);
    const distant=this.images.get('assets/atmosphere/mist_distance_01.png');if(distant){c.save();c.globalAlpha=.1;c.drawImage(distant,-w*.08,h*.39,w*1.16,h*.24);c.restore()}
    c.globalAlpha=.055+.01*Math.sin(time*.0002);c.fillStyle='#edf0dc';c.fillRect(0,h*.49,w,h*.08);c.globalAlpha=1;
  }

  drawGround(){
    const c=this.ctx,w=this.width,h=this.height,floor=this.images.get('assets/environment/terrain/forest_floor_01.png');
    const groundTop=h*.52;
    const ground=c.createLinearGradient(0,groundTop,0,h);ground.addColorStop(0,'#263526');ground.addColorStop(.45,'#18251a');ground.addColorStop(1,'#0c1510');c.fillStyle=ground;c.fillRect(0,groundTop,w,h-groundTop);
    if(floor){c.save();c.globalAlpha=.28;c.drawImage(floor,-w*.08,groundTop,w*1.16,h-groundTop);c.restore()}
    this.drawWorldStrip('assets/environment/terrain/dirt_path_01.png',-1.1,5,5.2,62,.5);
    this.drawWorldStrip('assets/environment/water/river_shallow_01.png',10.5,10,8.2,61,.46);
  }

  drawWorldStrip(path,x,z,width,length,alpha){
    const img=this.images.get(path);if(!img)return;
    const c=this.ctx,a=this.project(x-width/2,z),b=this.project(x+width/2,z),d=this.project(x-width/2,z+length),e=this.project(x+width/2,z+length);
    const left=Math.min(a.x,b.x,d.x,e.x),right=Math.max(a.x,b.x,d.x,e.x),top=Math.min(a.y,b.y,d.y,e.y),bottom=Math.max(a.y,b.y,d.y,e.y);
    if(bottom<0||top>this.height)return;
    c.save();c.globalAlpha=alpha;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(d.x,d.y);c.closePath();c.clip();c.drawImage(img,left,top,Math.max(1,right-left),Math.max(1,bottom-top));c.restore();
  }

  drawSprite(path,x,z,size,{y=0,alpha=1,flip=false,bob=0,flash=0}={}){
    const img=this.images.get(path);if(!img)return;const p=this.project(x,z,y+bob);if(p.depth<1)return;
    const unit=clamp(this.height*.045,34,52),targetH=size*p.scale*unit,ratio=img.width/img.height,targetW=targetH*ratio,c=this.ctx;
    c.save();c.globalAlpha=alpha;c.translate(p.x,p.y);if(flip)c.scale(-1,1);
    c.shadowColor='rgba(0,0,0,.38)';c.shadowBlur=7*p.scale;c.shadowOffsetY=4*p.scale;c.drawImage(img,-targetW/2,-targetH,targetW,targetH);
    if(flash>0){c.globalAlpha=flash*.22;c.fillStyle='rgba(235,255,214,.72)';c.fillRect(-targetW/2,-targetH,targetW,targetH)}c.restore();
  }

  drawAtmosphere(time){
    const c=this.ctx,w=this.width,h=this.height,mist=this.images.get('assets/atmosphere/mist_near_01.png');
    if(mist){c.save();c.globalAlpha=.065;c.drawImage(mist,-w*.12,h*.64,w*1.24,h*.28);c.restore()}
    const leaf=this.images.get('assets/atmosphere/leaf_shadow_01.png');if(leaf){c.save();c.globalAlpha=.035;c.drawImage(leaf,0,0,w,h);c.restore()}
    const motes=this.images.get('assets/atmosphere/floating_motes_01.png');if(motes){c.save();c.globalAlpha=.045;c.drawImage(motes,0,h*.15,w,h*.62);c.restore()}
    c.save();c.globalAlpha=.1;for(let i=0;i<12;i++){const x=(i*191+time*.01)%(w+120)-60,y=h*.34+((i*83)%Math.max(1,Math.floor(h*.48)));c.fillStyle='#efe4bd';c.beginPath();c.arc(x,y,1+(i%3)*.35,0,Math.PI*2);c.fill()}c.restore();
  }

  drawFx(frame,time){
    const fx=frame.fx||{},c=this.ctx;
    if(fx.aegisUntil>time){const p=this.project(frame.player.transform.x,frame.player.transform.z,.2),r=56*p.scale*(1+.08*Math.sin(time*.012)),g=c.createRadialGradient(p.x,p.y-r*.25,0,p.x,p.y-r*.25,r);g.addColorStop(0,'rgba(207,255,165,.4)');g.addColorStop(.55,'rgba(92,173,91,.18)');g.addColorStop(1,'rgba(92,173,91,0)');c.fillStyle=g;c.beginPath();c.arc(p.x,p.y-r*.25,r,0,Math.PI*2);c.fill();c.strokeStyle='rgba(199,239,151,.72)';c.lineWidth=2;c.beginPath();c.ellipse(p.x,p.y,r*.72,r*.2,0,0,Math.PI*2);c.stroke()}
    if(fx.slashUntil>time&&frame.wolf.alive){const a=this.project(frame.player.transform.x,frame.player.transform.z,.9),b=this.project(frame.wolf.transform.x,frame.wolf.transform.z,.8);c.save();c.strokeStyle='rgba(245,247,216,.9)';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y-20);c.quadraticCurveTo((a.x+b.x)/2,b.y-48,b.x,b.y-18);c.stroke();c.restore()}
    if(fx.impactUntil>time){c.save();c.globalAlpha=(fx.impactUntil-time)/180*.14;c.fillStyle='#fff4cf';c.fillRect(0,0,this.width,this.height);c.restore()}
  }

  render(frame){
    const time=frame.time??performance.now(),kick=(frame.fx?.cameraKickUntil||0)>time?Math.sin(time*.09)*3:0;
    this.camera.x=lerp(this.camera.x,frame.player.transform.x,.06);this.camera.z=lerp(this.camera.z,frame.player.transform.z-6.5,.06);
    const c=this.ctx;c.save();c.translate(kick,kick*.35);this.drawBackdrop(time);this.drawGround();
    const sprites=[];for(const s of frame.scenery)sprites.push({...s,kind:'scenery'});for(const a of [frame.farmer,frame.dog,frame.wolf,frame.player])if(a.alive!==false)sprites.push({kind:'actor',actor:a});
    sprites.sort((a,b)=>(b.kind==='actor'?b.actor.transform.z:b.z)-(a.kind==='actor'?a.actor.transform.z:a.z));
    for(const item of sprites){
      if(item.kind==='scenery')this.drawSprite(item.path,item.x,item.z,item.size,{alpha:item.alpha??1,flip:item.flip});
      else{const a=item.actor,moving=Math.hypot(a.velocity?.x||0,a.velocity?.z||0)>.05,bob=moving?Math.sin(time*.013+a.id.length)*.04:0;this.drawSprite(a.sprite,a.transform.x,a.transform.z,a.size,{bob,flip:(a.velocity?.x||0)<-.01,flash:(a.hitUntil||0)>time?0.75:0})}
    }
    this.drawFx(frame,time);this.drawAtmosphere(time);c.restore();
  }

  dispose(){this.images.clear();this.canvas=null;this.ctx=null;}
}
