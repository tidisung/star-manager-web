// Shared, deterministic combat rules. Only the server commits outcomes/rewards.
export const SPIN_COST = 30;
export const HEROES = {
 cat: {name:'고양이 기사',color:'#ffbf69',mark:'검',damage:10,range:190,interval:0.9},
 rabbit: {name:'토끼 궁수',color:'#b4eead',mark:'활',damage:7,range:440,interval:1.1},
 bear: {name:'곰 마법사',color:'#cab6ff',mark:'별',damage:12,range:350,interval:1.8},
};
export const UPGRADES = [
 {id:'might',name:'용감한 마음',text:'모든 친구의 공격력 +25%',icon:'⚔'},
 {id:'haste',name:'바람의 발걸음',text:'모든 친구의 공격 속도 +20%',icon:'»'},
 {id:'arrows',name:'반짝이는 화살',text:'토끼 궁수의 공격력 +60%',icon:'➶'},
 {id:'magic',name:'별빛 폭발',text:'곰 마법사의 공격력 +60%',icon:'✦'},
 {id:'sword',name:'거대한 검',text:'고양이 기사의 공격력 +60%',icon:'⚔'},
 {id:'bounty',name:'행운의 주머니',text:'처치한 적마다 코인 +2',icon:'●'},
 {id:'discount',name:'알뜰한 슬롯',text:'슬롯 비용 −5코인 (최소 15)',icon:'▦'},
 {id:'heal',name:'따뜻한 휴식',text:'체력 5 회복 (최대 12)',icon:'♥'},
 {id:'shield',name:'구름 방패',text:'놓친 적의 피해를 3회 막기',icon:'◇'},
];
export const levelOf=(r,id)=>r.upgrades.filter(x=>x===id).length;
export const spinCost=r=>Math.max(15,SPIN_COST-5*levelOf(r,'discount'));
export function army(r){
 const result=[];
 for(const type of Object.keys(HEROES)){
  let total=r.recruits[type]||0;
  for(let rank=1;rank<=4;rank++){
   const count=rank===4?total:total%3;total=Math.floor(total/3);
   for(let i=0;i<count;i++)result.push({type,rank,power:Math.pow(3,rank-1)});
  }
 }
 return result.map((u,i)=>({...u,id:i,x:125+(i%3)*48,y:118+Math.floor(i/3)*43}));
}
export function rollSlots(r,pick){
 const symbols=['cat','cat','rabbit','rabbit','bear','bear','coin','heart'];
 const grid=Array.from({length:9},()=>symbols[pick(symbols.length)]);
 const gains={cat:0,rabbit:0,bear:0,coin:0,heart:0},lines=[];
 for(const symbol of grid)gains[symbol]++;
 for(const line of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]){
  if(line.every(i=>grid[i]===grid[line[0]])){gains[grid[line[0]]]+=3;lines.push(line);}
 }
 for(const type of Object.keys(HEROES)){
  r.shards[type]+=gains[type];r.recruits[type]+=Math.floor(r.shards[type]/3);r.shards[type]%=3;
 }
 r.coins+=gains.coin*3;r.hp=Math.min(12,r.hp+gains.heart);
 r.grid=grid;r.lastSpin={gains,lines};
 return r.lastSpin;
}
// Fixed 0.2s simulation, bounded to 60s. Enemy motion and attack events are replayed by Canvas.
export function simulateWave(r){
 const boss=r.wave===6,units=army(r),enemies=[],shots=[],frames=[];
 const total=boss?7:6+r.wave*2;
 for(let i=0;i<total;i++){
  const isBoss=boss&&i===total-1;
  enemies.push({id:i,boss:isBoss,lane:i%3,x:640,y:170+(i%3)*64,
   hp:isBoss?5000:140+r.wave*70,max:isBoss?5000:140+r.wave*70,
   speed:isBoss?12:18+r.wave*2+(i%3)*2,spawn:i*(boss?1.8:1.1),alive:true});
 }
 let hp=r.hp,shield=r.shield,kills=0,leaks=0,coins=0,bossKilled=false;
 const ready=units.map(()=>0),dt=.2;
 let time=0;
 for(let step=0;step<=300;step++){
  time=Number((step*dt).toFixed(1));shots.length=0;
  for(const e of enemies)if(e.alive&&time>=e.spawn){
   e.x-=e.speed*dt;
   if(e.x<=55){e.alive=false;leaks++;if(shield>0)shield--;else hp=Math.max(0,hp-(e.boss?12:1));}
  }
  if(hp>0)for(let i=0;i<units.length;i++){
   const u=units[i],def=HEROES[u.type];if(ready[i]>time)continue;
   const targets=enemies.filter(e=>e.alive&&time>=e.spawn&&e.x<=u.x+def.range).sort((a,b)=>a.x-b.x);
   if(!targets.length)continue;
   const target=targets[0],special={cat:'sword',rabbit:'arrows',bear:'magic'}[u.type];
   const damage=def.damage*u.power*(1+.25*levelOf(r,'might')+.6*levelOf(r,special));
   const hit=u.type==='bear'?targets.filter(e=>Math.abs(e.x-target.x)<55):[target];
   shots.push({from:i,to:target.id,type:u.type,x:target.x,y:target.y});
   for(const e of hit){e.hp-=damage;if(e.hp<=0&&e.alive){e.alive=false;kills++;coins+=(e.boss?35:4)+2*levelOf(r,'bounty');if(e.boss)bossKilled=true;}}
   ready[i]=time+def.interval/(1+.2*levelOf(r,'haste'));
  }
  frames.push({t:time,hp,shield,kills,leaks,coins,enemies:enemies.filter(e=>e.alive&&time>=e.spawn).map(e=>({id:e.id,boss:e.boss,x:Math.round(e.x),y:e.y,hp:Math.max(0,Math.ceil(e.hp)),max:e.max})),shots:shots.map(s=>({...s}))});
  if(hp<=0||enemies.every(e=>!e.alive))break;
 }
 return {duration:Math.ceil((time+.4)*1000),units,frames,hp,shield,kills,leaks,coins,bossKilled,total};
}
