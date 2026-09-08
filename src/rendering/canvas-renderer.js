import { RendererContract } from './contracts.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;

async function loadImage(path){
  const image=new Image();
  image.decoding='async';
  image.src=path;
  await image.decode();
  return image;
}

function keyBlack(image){
  const canvas=document.createElement('canvas');
  canvas.width=image.naturalWidth; canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(image,0,0);
  const data=ctx.getImageData(0,0,canvas.width,canvas.height);
  const p=data.data;
  for(let i=0;i<p.length;i+=4){
    const max=Math.max(p[i],p[i+1],p[i+2]);
    const min=Math.min(p[i],p[i+1],p[i+2]);
    const luminance=(p[i]+p[i+1]+p[i+2])/3;
    const chroma=max-min;
    const alpha=clamp((luminance-6)*5 + chroma*1.4,0,255);
    p[i+3]=Math.min(p[i+3],alpha);
  }
  ctx.putImageData(data,0,0);
  return canvas;
}

export class RiverfordCanvasRenderer extends RendererContract {
  constructor(){
    super();
    this.canvas=null; this.ctx=null; this.images=new Map(); this.camera={x:0,z:-5};
    this.width=1; this.height=1; this.dpr=1;
  }

  async initialize(canvas,assetBundle){
    this.canvas=canvas;
    this.ctx=canvas.getContext('2d',{alpha:false});
    if(!this.ctx) throw new Error('2D canvas renderer unavailable.');
    const unique=[...new Set(assetBundle)];
    await Promise.all(unique.map(async path=>{
      const image=await loadImage(path);
      this.images.set(path,keyBlack(image));
    }));
    this.resize(innerWidth,innerHeight,devicePixelRatio||1);
  }

  resize(width,height,pixelRatio=1){
    this.width=Math.max(1,width); this.height=Math.max(1,height); this.dpr=clamp(pixelRatio,1,2);
    this.canvas.width=Math.floor(this.width*this.dpr);
    this.canvas.height=Math.floor(this.height*this.dpr);
    this.canvas.style.width=this.width+'px'; this.canvas.style.height=this.height+'px';
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    this.ctx.imageSmoothingEnabled=true;
  }

  project(x,z,y=0){
    const rx=x-this.camera.x, rz=z-this.camera.z;
    const depth=rz+12;
    const horizon=this.height*0.28;
    const scale=clamp(760/(depth*5.2),0.32,2.2);
    return {x:this.width*0.5+rx*44*scale,y:horizon+this.height*0.62-(rz*17+y*54)*scale,scale,depth};
  }

  drawBackdrop(time){
    const c=this.ctx,w=this.width,h=this.height;
    const sky=c.createLinearGradient(0,0,0,h*.62);
    sky.addColorStop(0,'#718b91'); sky.addColorStop(.42,'#b7ac82'); sky.addColorStop(1,'#26382b');
    c.fillStyle=sky;c.fillRect(0,0,w,h);
    const sun=c.createRadialGradient(w*.72,h*.08,0,w*.72,h*.08,h*.38);
    sun.addColorStop(0,'rgba(255,234,166,.52)'); sun.addColorStop(1,'rgba(255,234,166,0)');
    c.fillStyle=sun;c.fillRect(0,0,w,h*.58);
    c.fillStyle='#17251a';c.fillRect(0,h*.52,w,h*.48);
    c.globalAlpha=.18+.02*Math.sin(time*.0002);
    c.fillStyle='#d7dfc9';c.fillRect(0,h*.46,w,h*.16);c.globalAlpha=1;
  }

  drawGround(){
    const c=this.ctx,w=this.width,h=this.height;
    const floor=this.images.get('assets/environment/terrain/forest_floor_01.png');
    if(floor){
      for(let i=0;i<18;i++){
        const t=i/18, y=lerp(h*.49,h*1.04,t*t), band=lerp(38,120,t);
        c.globalAlpha=lerp(.22,.62,t);
        c.drawImage(floor,-w*.12,y,w*1.24,band);
      }
      c.globalAlpha=1;
    }
    this.drawWorldStrip('assets/environment/terrain/dirt_path_01.png',-1.5,22,4.6,58,.70);
    this.drawWorldStrip('assets/environment/water/river_shallow_01.png',10,24,8.5,60,.64);
  }

  drawWorldStrip(path,x,z,width,length,alpha){
    const img=this.images.get(path); if(!img)return;
    const c=this.ctx;
    for(let i=0;i<18;i++){
      const z0=z+i*length/18,z1=z+(i+1)*length/18;
      const a=this.project(x-width/2,z0),b=this.project(x+width/2,z0),d=this.project(x-width/2,z1),e=this.project(x+width/2,z1);
      const left=Math.min(a.x,d.x),right=Math.max(b.x,e.x),top=Math.min(d.y,e.y),bottom=Math.max(a.y,b.y);
      if(bottom<0||top>this.height)continue;
      c.save();c.globalAlpha=alpha;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(d.x,d.y);c.closePath();c.clip();
      c.drawImage(img,left,top,Math.max(1,right-left),Math.max(1,bottom-top));c.restore();
    }
  }

  drawSprite(path,x,z,size,{y=0,alpha=1,flip=false,bob=0,flash=0}={}){
    const img=this.images.get(path); if(!img)return;
    const p=this.project(x,z,y+bob); if(p.depth<1)return;
    const targetH=size*p.scale*58;
    const ratio=img.width/img.height; const targetW=targetH*ratio;
    const c=this.ctx;c.save();c.globalAlpha=alpha;
    c.translate(p.x,p.y); if(flip)c.scale(-1,1);
    c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=12*p.scale;c.shadowOffsetY=7*p.scale;
    c.drawImage(img,-targetW/2,-targetH,targetW,targetH);
    if(flash>0){c.globalCompositeOperation='screen';c.globalAlpha=flash*.65;c.fillStyle='#eaffd1';c.fillRect(-targetW/2,-targetH,targetW,targetH)}
    c.restore();
  }

  drawAtmosphere(time){
    const c=this.ctx,w=this.width,h=this.height;
    const mist=this.images.get('assets/atmosphere/mist_near_01.png');
    if(mist){c.save();c.globalAlpha=.13;c.drawImage(mist,-w*.1,h*.63,w*1.2,h*.42);c.restore()}
    c.save();c.globalCompositeOperation='screen';c.globalAlpha=.08;
    for(let i=0;i<24;i++){const x=(i*173+time*.012)%(w+120)-60;const y=h*.28+((i*97)%Math.floor(h*.62));c.fillStyle='#f0e5bd';c.beginPath();c.arc(x,y,1+(i%3)*.6,0,Math.PI*2);c.fill()}
    c.restore();
  }

  drawFx(frame,time){
    const fx=frame.fx||{};const c=this.ctx;
    if(fx.aegisUntil>time){
      const p=this.project(frame.player.transform.x,frame.player.transform.z,.2),r=65*p.scale*(1+.08*Math.sin(time*.012));
      const g=c.createRadialGradient(p.x,p.y-r*.25,0,p.x,p.y-r*.25,r);g.addColorStop(0,'rgba(198,255,151,.34)');g.addColorStop(.55,'rgba(92,173,91,.15)');g.addColorStop(1,'rgba(92,173,91,0)');
      c.fillStyle=g;c.beginPath();c.arc(p.x,p.y-r*.25,r,0,Math.PI*2);c.fill();
      c.strokeStyle='rgba(187,235,138,.6)';c.lineWidth=2;c.beginPath();c.ellipse(p.x,p.y,r*.7,r*.19,0,0,Math.PI*2);c.stroke();
    }
    if(fx.slashUntil>time&&frame.wolf.alive){
      const a=this.project(frame.player.transform.x,frame.player.transform.z,.9),b=this.project(frame.wolf.transform.x,frame.wolf.transform.z,.8);
      c.save();c.globalCompositeOperation='screen';c.strokeStyle='rgba(238,244,206,.8)';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y-30);c.quadraticCurveTo((a.x+b.x)/2,b.y-70,b.x,b.y-24);c.stroke();c.restore();
    }
  }

  render(frame){
    const time=frame.time??performance.now();
    this.camera.x=lerp(this.camera.x,frame.player.transform.x,.055);
    this.camera.z=lerp(this.camera.z,frame.player.transform.z-5,.055);
    this.drawBackdrop(time);this.drawGround();
    const sprites=[];
    for(const s of frame.scenery)sprites.push({...s,kind:'scenery'});
    for(const a of [frame.farmer,frame.dog,frame.wolf,frame.player])if(a.alive!==false)sprites.push({kind:'actor',actor:a});
    sprites.sort((a,b)=>(b.kind==='actor'?b.actor.transform.z:b.z)-(a.kind==='actor'?a.actor.transform.z:a.z));
    for(const item of sprites){
      if(item.kind==='scenery')this.drawSprite(item.path,item.x,item.z,item.size,{alpha:item.alpha??1,flip:item.flip});
      else{
        const a=item.actor,moving=Math.hypot(a.velocity?.x||0,a.velocity?.z||0)>.05;
        const bob=moving?Math.sin(time*.013+a.id.length)*.05:0;
        this.drawSprite(a.sprite,a.transform.x,a.transform.z,a.size,{bob,flip:(a.velocity?.x||0)<-.01,flash:(a.hitUntil||0)>time?.75:0});
      }
    }
    this.drawFx(frame,time);this.drawAtmosphere(time);
  }

  dispose(){this.images.clear();this.canvas=null;this.ctx=null;}
}
