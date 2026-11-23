// A self-contained 30-second choreography sandbox. No family data or rewards.
export const DURATION=30;
export const SKILLS={dash:{name:'번개 돌진',cooldown:5,key:'1'},volley:{name:'화살비',cooldown:6,key:'2'},meteor:{name:'별똥별',cooldown:8,key:'3'}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>1-Math.pow(1-clamp(t,0,1),3);
export class ActionBattle{
 constructor(seed=42){this.seed=seed;this.time=0;this.phase='ready';this.heroes=[
  {id:'cat',x:310,y:478,home:310,hp:100,phase:'idle',clock:0,cool:0,flash:0,knock:0},
  {id:'rabbit',x:205,y:515,home:205,hp:100,phase:'idle',clock:0,cool:.7,flash:0,knock:0},
  {id:'bear',x:132,y:590,home:132,hp:100,phase:'idle',clock:0,cool:1.1,flash:0,knock:0}];
  this.enemies=[];this.projectiles=[];this.particles=[];this.effects=[];this.texts=[];this.events=[];this.cooldowns={dash:0,volley:0,meteor:0};this.kills=0;this.hits=0;this.combo=0;this.comboAt=0;this.damage=0;this.nextSpawn=.35;this.serial=0;this.bossSpawned=false;this.shake=0;this.freeze=0;this.finisher=false;this.skillsUsed=0;
 }
 rand(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/4294967296;}
 start(){if(this.phase==='ready')this.phase='playing';}
 emit(type,extra={}){this.events.push({type,...extra});}
 takeEvents(){return this.events.splice(0);}
 spawn(boss=false){const i=this.serial++;const e={id:i,x:boss?1110:1120+(i%2)*90,y:boss?490:450+(i%3)*48,hp:boss?850:65,max:boss?850:65,boss,alive:true,flash:0,stagger:0,vx:0,z:0,vz:0,spin:0,angle:0,deadTime:0,clock:0,attack:0,nextAttack:boss?1.8:1.5};this.enemies.push(e);this.burst(e.x,e.y,12,'dust');if(boss){this.bossSpawned=true;this.effects.push({type:'banner',text:'장난꾸러기 왕 등장!',life:2.1,max:2.1});this.emit('boss');}return e;}
 burst(x,y,n,type='hit',color){for(let i=0;i<n;i++){const a=this.rand()*Math.PI*2,s=80+this.rand()*220;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(type==='dust'?0:80),life:.25+this.rand()*.55,max:.8,size:3+this.rand()*7,type,color:color||['#ffe39d','#fff9dd','#ffae77'][i%3],angle:this.rand()*6});}}
 hit(e,amount,force=140,kind='slash'){
  if(!e?.alive)return;
  e.hp=Math.max(0,e.hp-amount);e.flash=.13;e.stagger=e.boss?.12:.32;e.vx=force*(e.boss?.3:1);e.z=Math.max(e.z,e.boss?4:10);e.vz=e.boss?40:120;
  this.hits++;this.combo=this.time-this.comboAt<2?this.combo+1:1;this.comboAt=this.time;this.damage+=amount;this.shake=Math.max(this.shake,kind==='meteor'?15:kind==='slash'?6:3);this.freeze=Math.max(this.freeze,kind==='meteor'?.08:.035);
  this.texts.push({x:e.x,y:e.y-100-e.z,text:String(amount),color:kind==='meteor'?'#ffb7ed':'#fff1a4',life:.8,max:.8,size:kind==='meteor'?40:27});
  this.effects.push({type:'impact',x:e.x,y:e.y-58-e.z,life:.22,max:.22,large:kind==='meteor'});this.burst(e.x,e.y-60,kind==='meteor'?22:7);this.emit('hit',{kind});
  if(e.hp===0){e.alive=false;e.vx=force+130;e.vz=e.boss?450:520;e.spin=4+this.rand()*4;e.deadTime=0;this.kills++;this.burst(e.x,e.y-60,12,'star','#ffe486');this.emit('kill');}
 }
 area(x,radius,amount,kind='meteor'){for(const e of this.enemies)if(e.alive&&Math.abs(e.x-x)<radius)this.hit(e,amount,kind==='meteor'?430:260,kind);}
 skill(id){
  if(this.phase!=='playing'||this.cooldowns[id]>0||!SKILLS[id])return false;
  this.cooldowns[id]=SKILLS[id].cooldown;this.skillsUsed++;
  const targets=this.enemies.filter(e=>e.alive).sort((a,b)=>a.x-b.x);
  if(id==='dash'){const h=this.heroes[0];h.phase='special';h.clock=0;h.origin=h.x;h.destination=clamp(targets[0]?.x-65||750,350,1020);h.struck=false;this.emit('charge');}
  if(id==='volley'){for(let i=0;i<9;i++)this.projectiles.push({type:'rain',x:400+i*80,y:-120-i*40,tx:400+i*80,ty:480,age:-i*.055,duration:.65+ i*.025,done:false});this.heroes[1].phase='cast';this.heroes[1].clock=0;this.emit('bow');}
  if(id==='meteor'){const x=targets.find(e=>e.boss)?.x||targets[Math.floor(targets.length/2)]?.x||800;this.projectiles.push({type:'meteor',x:x-280,y:-150,tx:x,ty:495,age:0,duration:.9,done:false});this.heroes[2].phase='cast';this.heroes[2].clock=0;this.effects.push({type:'rune',x,y:500,life:1,max:1});this.emit('magic');}
  return true;
 }
 update(delta){
  if(this.phase!=='playing')return;
  const real=clamp(delta,0,.05);this.time=Math.min(DURATION,this.time+real);
  for(const k in this.cooldowns)this.cooldowns[k]=Math.max(0,this.cooldowns[k]-real);
  const dt=this.freeze>0?real*.12:real;this.freeze=Math.max(0,this.freeze-real);this.shake=Math.max(0,this.shake-real*25);
  if(this.time<16&&this.time>=this.nextSpawn){this.spawn();this.nextSpawn+=1.6;}
  if(this.time>=16&&!this.bossSpawned)this.spawn(true);
  if(this.time>=20&&this.time<25&&this.time>=this.nextSpawn){this.spawn();this.nextSpawn=this.time+2;}
  if(this.time>=28&&!this.finisher){this.finisher=true;const boss=this.enemies.find(e=>e.alive&&e.boss);if(boss){this.effects.push({type:'banner',text:'함께하는 마지막 일격!',life:1.3,max:1.3});this.projectiles.push({type:'final',x:boss.x-300,y:-120,tx:boss.x,ty:boss.y,age:0,duration:.6,done:false});this.emit('magic');}}
  for(const h of this.heroes){
   h.clock+=dt;h.cool-=dt;h.flash=Math.max(0,h.flash-dt);h.knock*=Math.exp(-9*dt);
   const target=this.enemies.filter(e=>e.alive).sort((a,b)=>a.x-b.x)[0];
   if(h.id==='cat'){
    if(h.phase==='special'||h.phase==='attack'){
     const special=h.phase==='special',t=h.clock;
     if(t<.14)h.x=h.origin-t*40;
     else if(t<.36)h.x=h.origin+(h.destination-h.origin)*ease((t-.14)/.22);
     if(t>=.34&&!h.struck){h.struck=true;const x=h.x+72;this.effects.push({type:'slash',x:x-25,y:h.y-60,life:.28,max:.28,large:special});this.area(x,special?270:125,special?100:34,'slash');this.emit('sword');this.burst(h.x-25,h.y,12,'dust');if(special)this.texts.push({x:h.x,y:h.y-130,text:'번개 돌진!',color:'#ffe39d',life:1,max:1,size:32});}
     if(special&&t>.4)h.x=h.destination-(h.destination-Math.min(820,h.destination))*ease((t-.4)/.25);
     if(t>.65){h.phase='idle';h.clock=0;h.cool=.38;}
    }else if(target){
     if(target.x-h.x>125){h.phase=h.x<820?'run':'idle';h.x=Math.min(820,h.x+Math.min(target.x-h.x-110,dt*290));if(this.rand()<dt*18)this.burst(h.x-20,h.y,1,'dust');}
     else if(h.cool<=0){h.phase='attack';h.clock=0;h.origin=h.x;h.destination=clamp(target.x-70,160,875);h.struck=false;}
     else h.phase='idle';
    }else{h.phase=h.x>h.home+5?'return':'idle';h.x-=Math.min(Math.max(0,h.x-h.home),dt*160);}
   }else{
    if(h.phase==='cast'&&h.clock>.5)h.phase='idle';
    if(target&&h.cool<=0){h.phase='cast';h.clock=0;h.cool=h.id==='rabbit'?1.05:2.1;
     this.projectiles.push({type:h.id==='rabbit'?'arrow':'orb',sx:h.x+35,sy:h.y-70,x:h.x+35,y:h.y-70,tx:target.x,ty:target.y-55,targetId:target.id,age:0,duration:h.id==='rabbit'?.48:.85,done:false});this.emit(h.id==='rabbit'?'bow':'magic');}
   }
  }
  for(const e of this.enemies){
   e.clock+=dt;e.flash=Math.max(0,e.flash-dt);e.stagger=Math.max(0,e.stagger-dt);e.x+=e.vx*dt;e.vx*=Math.exp(-5*dt);
   e.z=Math.max(0,e.z+e.vz*dt);e.vz-=1100*dt;if(e.z===0)e.vz=0;
   if(!e.alive){e.deadTime+=dt;e.angle+=e.spin*dt;continue;}
   e.x=clamp(e.x,460,1250);e.nextAttack-=dt;
   const h=this.heroes[0];
   if(e.stagger===0&&e.attack===0){if(e.x-h.x>105)e.x-=dt*(e.boss?75:95);else if(e.nextAttack<=0){e.attack=.55;e.nextAttack=e.boss?2.8:2;}}
   if(e.attack>0){const before=e.attack;e.attack=Math.max(0,e.attack-dt);if(before>.2&&e.attack<=.2){h.flash=.2;h.knock=45;h.hp=Math.max(25,h.hp-(e.boss?16:4));h.x=Math.max(140,h.x-(e.boss?65:22));this.shake=e.boss?10:4;this.burst(h.x,h.y-65,10,'hit','#d5eaff');this.effects.push({type:'shock',x:e.x,y:e.y,life:.35,max:.35});this.emit('thump');}}
  }
  for(const p of this.projectiles){
   p.age+=dt;if(p.age<0)continue;const t=clamp(p.age/p.duration,0,1);
   if(p.type==='arrow'||p.type==='orb'){const e=this.enemies.find(e=>e.id===p.targetId&&e.alive);if(e){p.tx=e.x;p.ty=e.y-55-e.z;}p.x=p.sx+(p.tx-p.sx)*t;p.y=p.sy+(p.ty-p.sy)*t-Math.sin(t*Math.PI)*(p.type==='orb'?100:45);}
   else if(p.type==='rain'){p.x=p.tx-130*(1-t);p.y=-200+(p.ty+200)*t;}
   else{p.x=p.tx-300*(1-t);p.y=-150+(p.ty+150)*t;}
   if(t===1){p.done=true;if(p.type==='arrow'){const e=this.enemies.find(e=>e.id===p.targetId&&e.alive);if(e)this.hit(e,23,110,'arrow');}
    else if(p.type==='rain'){this.area(p.tx,100,35,'arrow');this.burst(p.tx,p.ty,5,'dust');}
    else{this.area(p.tx,p.type==='orb'?135:380,p.type==='orb'?42:p.type==='final'?2000:180,'meteor');this.effects.push({type:'explosion',x:p.tx,y:p.ty-35,life:.65,max:.65,large:p.type!=='orb'});this.burst(p.tx,p.ty-50,30,'star','#d9a6ff');this.emit('boom');}}
  }
  for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.type==='dust'?25:500;p.angle+=dt*4;}
  for(const p of this.texts){p.life-=dt;p.y-=dt*55;}
  for(const p of this.effects)p.life-=dt;
  this.projectiles=this.projectiles.filter(p=>!p.done);this.enemies=this.enemies.filter(e=>e.alive||e.deadTime<1.2);this.particles=this.particles.filter(p=>p.life>0).slice(-500);this.texts=this.texts.filter(p=>p.life>0).slice(-50);this.effects=this.effects.filter(p=>p.life>0);
  if(this.time>=DURATION){this.phase='complete';this.emit('complete');}
 }
}
