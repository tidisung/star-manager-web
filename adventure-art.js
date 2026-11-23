import {HEROES} from './adventure-core.js';
const patterns={
 cat:['..11....11..','..12111121..','..11111111..','.1111111111.','.1131111311.','.1111411111.','..11144111..','...555555...','..55666555..','..55666555..','...55..55...','..555..555..'],
 rabbit:['...11..11...','...12..21...','...12..21...','..11111111..','.1111111111.','.1131111311.','.1111411111.','..11144111..','...555555...','..55666555..','...55..55...','..555..555..'],
 bear:['..111..111..','.1221112211.','.1111111111.','.1131111311.','.1114441111.','..11434111..','...111111...','...555555...','..55666555..','..55666555..','...55..55...','..555..555..'],
 slime:['............','....1111....','...111111...','..11111111..','.1111111111.','.1131111311.','.1131111311.','.1111411111.','.1114441111.','..11111111..','.1111111111.','............'],
 boss:['..66....66..','..666..666..','...666666...','..11111111..','.1111111111.','.1131111311.','.1131111311.','.1114441111.','.1143334111.','..11444111..','.1111111111.','..11....11..']};
function palette(type){return {1:HEROES[type]?.color||(type==='boss'?'#ce8aa7':'#90bfc5'),2:'#f29cae',3:'#272d47',4:'#fff0d7',5:type==='cat'?'#a8bcd2':type==='rabbit'?'#659d8c':'#8067b2',6:'#ffda87'};}
export function spriteSVG(type){const map=patterns[type]||patterns.cat,p=palette(type);return `<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${map.flatMap((row,y)=>[...row].map((n,x)=>n==='.'?'':`<rect x="${x}" y="${y}" width="1" height="1" fill="${p[n]}"/>`)).join('')}</svg>`;}
function sprite(ctx,type,x,y,scale=3){const p=palette(type);(patterns[type]||patterns.cat).forEach((row,j)=>[...row].forEach((n,i)=>{if(n!=='.'){ctx.fillStyle=p[n];ctx.fillRect(Math.round(x+i*scale),Math.round(y+j*scale),scale,scale);}}));}
function tree(ctx,x,y,s){ctx.fillStyle='#293e4a';ctx.fillRect(x-4*s,y,8*s,40*s);ctx.fillStyle='#244750';ctx.fillRect(x-23*s,y-30*s,46*s,20*s);ctx.fillRect(x-18*s,y-46*s,36*s,20*s);ctx.fillRect(x-10*s,y-59*s,20*s,16*s);ctx.fillStyle='#32605b';ctx.fillRect(x-20*s,y-29*s,20*s,6*s);ctx.fillRect(x-14*s,y-43*s,16*s,5*s);}
export function paintBattle(canvas,r,frame,clock=0){
 if(!canvas)return;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
 c.fillStyle='#192c43';c.fillRect(0,0,720,420);
 c.fillStyle='#bfd4cb';c.fillRect(570,25,26,26);c.fillStyle='#192c43';c.fillRect(565,20,20,20);
 for(let i=0;i<25;i++){c.fillStyle=i%3?'#7b9b9d':'#c4dab9';c.fillRect((i*127+35)%720,18+(i*37)%85,i%3?2:3,2);}
 c.fillStyle='#243f48';c.fillRect(0,100,720,320);c.fillStyle='#2e4d4e';c.fillRect(0,128,720,292);
 for(let i=0;i<12;i++)tree(c,20+i*65,110,(i%3)*.2+.75);
 c.fillStyle='#456264';c.fillRect(40,159,680,179);c.fillStyle='#516b6a';c.fillRect(40,172,680,153);
 for(let i=0;i<80;i++){c.fillStyle=i%2?'#587270':'#476460';c.fillRect(70+(i*97)%650,175+(i*53)%145,8+i%5,3);}
 c.fillStyle='#799088';c.fillRect(51,153,3,188);
 // A small castle at the escape line.
 c.fillStyle='#a7b7bd';c.fillRect(8,204,32,75);c.fillRect(0,201,12,84);c.fillRect(36,201,12,84);c.fillStyle='#d2d1cd';for(let i=0;i<5;i++)c.fillRect(i*10,195,6,14);
 c.fillStyle='#273c4c';c.fillRect(16,247,16,32);c.fillStyle='#e6a2b5';c.fillRect(20,165,3,30);c.fillRect(23,165,18,11);
 for(let i=0;i<24;i++){c.fillStyle=i%3===0?'#d1c890':'#719482';c.fillRect((i*83+10)%720,355+(i*29)%55,3,4);c.fillStyle='#426659';c.fillRect((i*83+10)%720,359+(i*29)%55,3,6);}
 const units=r?.battle?.units||r?.displayUnits||[{type:'cat',rank:1,x:150,y:205,id:0}];
 for(const u of units){const attack=frame?.shots.some(s=>s.from===u.id),bob=Math.sin(clock*3+u.id)*1.5;c.fillStyle='#162e3b66';c.fillRect(u.x-17,u.y+31,38,7);sprite(c,u.type,u.x-18+(attack?3:0),u.y+bob,3);c.fillStyle='#ffdf8f';for(let i=0;i<u.rank;i++)c.fillRect(u.x-12+i*7,u.y-9,4,4);}
 for(const e of frame?.enemies||[]){const scale=e.boss?5:3,bob=Math.sin(clock*5+e.id)*2;sprite(c,e.boss?'boss':'slime',e.x-6*scale,e.y-12*scale+bob,scale);c.fillStyle='#223248';c.fillRect(e.x-20,e.y-12*scale-9,40,4);c.fillStyle=e.boss?'#f19bb8':'#d0e6a1';c.fillRect(e.x-20,e.y-12*scale-9,40*e.hp/e.max,4);}
 for(const s of frame?.shots||[]){const u=units[s.from];if(!u)continue;c.strokeStyle=HEROES[s.type].color;c.lineWidth=s.type==='bear'?3:2;c.beginPath();c.moveTo(u.x+9,u.y+18);c.lineTo(s.x,s.y-20);c.stroke();c.fillStyle='#fff2c0';c.fillRect(s.x-4,s.y-24,8,8);}
 if(!r||r.phase==='prepare'){sprite(c,'slime',580,220,3);sprite(c,'slime',630,270,3);}
 if(r?.phase==='won'||r?.phase==='reward')for(let i=0;i<35;i++){c.fillStyle=['#ffd881','#e3a6c3','#a4e9d5'][i%3];c.fillRect((i*71+clock*9)%720,(i*43+clock*24)%400,4,7);}
}
