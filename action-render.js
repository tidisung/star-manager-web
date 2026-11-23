const INK='#333449',TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function ellipse(c,x,y,rx,ry,fill,stroke=INK,w=3){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function path(c,points,fill,stroke=INK,w=3){c.beginPath();for(const [op,...v] of points)c[op](...v);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function line(c,x1,y1,x2,y2,color,w=5){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=w;c.stroke();}
function rr(c,x,y,w,h,r,fill,stroke=INK,lw=3){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function star(c,x,y,r,fill,turn=0){c.save();c.translate(x,y);c.rotate(turn);c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,s=i%2?r*.43:r;i?c.lineTo(Math.cos(a)*s,Math.sin(a)*s):c.moveTo(Math.cos(a)*s,Math.sin(a)*s);}c.closePath();c.fillStyle=fill;c.fill();c.restore();}
function cloud(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);path(c,[['moveTo',-75,8],['bezierCurveTo',-95,-18,-45,-38,-24,-18],['bezierCurveTo',-20,-65,45,-65,51,-20],['bezierCurveTo',84,-38,116,-9,100,14],['bezierCurveTo',50,26,-20,24,-75,8]],'#fff4de',null);c.restore();}
function tree(c,x,y,s,color){c.save();c.translate(x,y);c.scale(s,s);path(c,[['moveTo',-20,0],['quadraticCurveTo',-6,-75,-16,-153],['lineTo',22,-151],['quadraticCurveTo',12,-60,31,0]],'#6d6772','#454554',4);line(c,5,-60,-38,-105,'#454554',5);ellipse(c,-42,-153,61,61,color,'#3d5961',4);ellipse(c,36,-164,74,69,color,'#3d5961',4);ellipse(c,-5,-209,68,61,color,'#3d5961',4);path(c,[['moveTo',-47,-218],['quadraticCurveTo',-30,-250,6,-245]],null,'#ffffff33',9);c.restore();}
export function drawBackground(c,t){
 const sky=c.createLinearGradient(0,0,0,720);sky.addColorStop(0,'#b8cfed');sky.addColorStop(.6,'#f3dbd1');sky.addColorStop(1,'#97bbb3');c.fillStyle=sky;c.fillRect(0,0,1280,720);
 ellipse(c,945,133,55,55,'#fff4d7',null);ellipse(c,945,133,74,74,'#fff1d41a',null);
 cloud(c,180+Math.sin(t*.1)*12,103,.8);cloud(c,655+Math.sin(t*.13)*15,74,.65);cloud(c,1150,190,.55);
 path(c,[['moveTo',0,330],['lineTo',0,225],['quadraticCurveTo',160,110,330,258],['quadraticCurveTo',490,80,700,270],['quadraticCurveTo',880,155,1100,250],['lineTo',1280,210],['lineTo',1280,420],['closePath']],'#8c9fb4',null);
 path(c,[['moveTo',0,335],['quadraticCurveTo',190,223,410,326],['quadraticCurveTo',700,185,900,326],['quadraticCurveTo',1110,250,1280,291],['lineTo',1280,500],['lineTo',0,500],['closePath']],'#789d9d',null);
 for(let i=0;i<14;i++)tree(c,i*107-40,380+(i%3)*12,.55+(i%2)*.15,['#67988b','#79aa98','#88b5a0'][i%3]);
 path(c,[['moveTo',0,390],['quadraticCurveTo',370,345,650,400],['quadraticCurveTo',920,348,1280,380],['lineTo',1280,720],['lineTo',0,720],['closePath']],'#8eae8e','#547b78',4);
 path(c,[['moveTo',-50,468],['bezierCurveTo',280,406,540,446,750,445],['bezierCurveTo',995,418,1120,425,1320,456],['lineTo',1330,610],['bezierCurveTo',900,585,570,638,280,584],['lineTo',-30,599],['closePath']],'#d5c7a9','#a6a58b',4);
 path(c,[['moveTo',-30,570],['bezierCurveTo',330,551,680,603,1290,557]],null,'#f0ddba',9);
 for(let i=0;i<30;i++){const x=(i*193)%1280,y=458+(i*29)%110;ellipse(c,x,y,7+i%4,2,'#adad94',null);}
 // Framing trees and foliage keep the arena open in the middle.
 tree(c,-28,463,1.55,'#477d73');tree(c,1320,453,1.7,'#477d73');
 for(let i=0;i<33;i++){const x=(i*151+19)%1280,y=620+(i*29)%86;line(c,x,y,x+2,y-15,'#507f6c',3);line(c,x+2,y-6,x-6,y-10,'#507f6c',3);if(i%3===0){ellipse(c,x,y-19,5,6,'#eeb3bb',null);ellipse(c,x-5,y-16,5,5,'#f7c8c4',null);ellipse(c,x+5,y-16,5,5,'#f7c8c4',null);ellipse(c,x,y-15,3,3,'#fff0b4',null);}}
 for(const [x,y,s] of [[60,640,1],[1175,639,1.2],[1000,378,.6]]){c.save();c.translate(x,y);c.scale(s,s);path(c,[['moveTo',-22,0],['lineTo',-32,-35],['lineTo',-7,-76],['lineTo',15,-36],['lineTo',9,0]],'#b5a3d5','#6c718d',3);path(c,[['moveTo',-7,-76],['lineTo',-7,-20],['lineTo',9,0]],'#dfc9ec',null);star(c,-3,-80,6,'#fff5cf');c.restore();}
 // A tiny flag marks our side of the arena.
 line(c,78,418,78,310,'#554c59',6);path(c,[['moveTo',81,311],['quadraticCurveTo',113,292,145,313],['lineTo',136,352],['quadraticCurveTo',110,331,81,350]],'#c87892',INK,3);star(c,111,326,10,'#ffe3ad');
}
function sword(c){path(c,[['moveTo',-7,0],['lineTo',-9,-51],['lineTo',0,-70],['lineTo',9,-51],['lineTo',7,0]],'#f1f2df',INK,3);path(c,[['moveTo',0,-63],['lineTo',0,-3],['lineTo',6,-3],['lineTo',6,-50]],'#a8c9cd',null);rr(c,-18,-4,36,9,4,'#f3c06d');rr(c,-5,5,10,20,3,'#81667a');ellipse(c,0,28,7,6,'#efc270');}
function face(c,type,h){const hurt=h.flash>0,attack=['attack','special'].includes(h.phase);const fur={cat:'#f5c28b',rabbit:'#fff4db',bear:'#bba0d9'}[type];
 if(type==='cat'){path(c,[['moveTo',-29,-119],['lineTo',-29,-149],['lineTo',-8,-134]],fur,INK,4);path(c,[['moveTo',12,-134],['lineTo',31,-150],['lineTo',32,-116]],fur,INK,4);path(c,[['moveTo',-23,-132],['lineTo',-23,-141],['lineTo',-15,-134]],'#da93a3',null);}
 if(type==='rabbit'){ellipse(c,-15,-151,10,29,fur,INK,4);ellipse(c,14,-156,10,31,fur,INK,4);ellipse(c,-15,-155,4,17,'#e7a8b6',null);ellipse(c,14,-160,4,18,'#e7a8b6',null);}
 if(type==='bear'){ellipse(c,-26,-126,13,14,fur,INK,4);ellipse(c,27,-126,13,14,fur,INK,4);ellipse(c,-26,-126,6,7,'#e1bbd4',null);}
 ellipse(c,0,-111,33,30,fur,INK,4);
 ellipse(c,-20,-102,7,4,'#e5a1a2',null);ellipse(c,23,-102,7,4,'#e5a1a2',null);
 if(hurt){path(c,[['moveTo',-15,-115],['lineTo',-8,-110],['lineTo',-15,-106]],null,INK,3);path(c,[['moveTo',17,-115],['lineTo',10,-110],['lineTo',17,-106]],null,INK,3);}
 else{ellipse(c,-10,-113,3.6,6,INK,null);ellipse(c,15,-113,3.6,6,INK,null);ellipse(c,-9,-115,1.3,1.7,'white',null);ellipse(c,16,-115,1.3,1.7,'white',null);}
 if(attack){line(c,-17,-125,-6,-121,INK,3);line(c,9,-121,22,-125,INK,3);}
 ellipse(c,3,-103,3.5,2.5,'#6c5264',null);path(c,[['moveTo',-3,-95],['quadraticCurveTo',4,-89,11,-96]],null,INK,2.5);
 if(type==='cat'){line(c,-29,-108,-37,-112,'#a8796d',2);line(c,-28,-100,-36,-99,'#a8796d',2);path(c,[['moveTo',-23,-132],['quadraticCurveTo',0,-149,26,-131]],null,'#6d8b9c',10);star(c,0,-137,9,'#ffe29b');}
 if(type==='bear'){path(c,[['moveTo',-33,-132],['quadraticCurveTo',-7,-155,-8,-186],['quadraticCurveTo',24,-192,31,-160],['lineTo',37,-132]],'#756397',INK,4);ellipse(c,2,-132,43,8,'#8d79ad',INK,4);star(c,10,-161,10,'#ffe29d');}
}
export function drawHero(c,h,time,scale=1){
 const running=h.phase==='run'||h.phase==='return',striking=h.phase==='attack'||h.phase==='special',special=h.phase==='special',cast=h.phase==='cast';
 const gait=running?Math.sin(time*22):Math.sin(time*3)*.08,bob=running?Math.abs(Math.sin(time*22))*7:Math.sin(time*3+h.home)*2;
 const leap=striking?Math.sin(clamp((h.clock-.12)/.48,0,1)*Math.PI)*(special?34:12):0;
 ellipse(c,h.x,h.y+7,38*scale,9,'#3e58542b',null);
 c.save();c.translate(h.x-h.knock*.3,h.y-bob-leap);c.scale(scale,scale);c.rotate(running?.1:striking&&h.clock>.2?.14:0);
 if(h.flash>0){c.shadowColor='#fff';c.shadowBlur=18;}
 const coat={cat:'#72a3b5',rabbit:'#8ba577',bear:'#9a7cba'}[h.id],trim={cat:'#d3e5dc',rabbit:'#e3e3b7',bear:'#ceb2db'}[h.id];
 // Cape and tail have their own follow-through.
 path(c,[['moveTo',-18,-82],['quadraticCurveTo',-43,-63,-58-Math.sin(time*8)*8,-32],['quadraticCurveTo',-25,-22,-10,-38]],h.id==='cat'?'#d98291':h.id==='rabbit'?'#d0aa69':'#796496',INK,4);
 if(h.id==='cat')path(c,[['moveTo',-17,-33],['bezierCurveTo',-52,-20,-62,-53,-47,-59]],null,'#b88a72',13);
 for(const side of [-1,1]){const x=side*13,swing=gait*side;line(c,x,-28,x+swing*15,-6,INK,17);line(c,x,-28,x+swing*15,-6,coat,10);ellipse(c,x+swing*15+3,-1,13,8,'#5e5f73',INK,3);}
 path(c,[['moveTo',-24,-83],['quadraticCurveTo',0,-94,25,-80],['lineTo',29,-29],['quadraticCurveTo',0,-20,-28,-29],['closePath']],coat,INK,4);
 path(c,[['moveTo',-9,-80],['lineTo',10,-80],['lineTo',14,-34],['lineTo',-13,-34],['closePath']],trim,null);line(c,-24,-40,25,-40,'#806b71',7);ellipse(c,1,-40,5,6,'#edca87',INK,2);
 const armSwing=running?gait*.65:0;
 c.save();c.translate(-22,-74);c.rotate(-.35+armSwing);line(c,0,0,-8,26,INK,15);line(c,0,0,-8,26,coat,9);ellipse(c,-8,29,8,8,trim,INK,3);
 if(h.id==='cat'){path(c,[['moveTo',-25,14],['quadraticCurveTo',-8,5,9,14],['lineTo',6,39],['lineTo',-8,49],['lineTo',-22,39],['closePath']],'#d7c088',INK,3);star(c,-8,25,10,'#fff0c2');}c.restore();
 // Front arm, elbow and weapon are articulated around the shoulder.
 c.save();c.translate(22,-74);let angle=h.id==='cat'?(striking?(h.clock<.14?-1.5: -.9+Math.sin(clamp((h.clock-.14)/.25,0,1)*Math.PI/2)*2.7):.25-armSwing):cast?-.6:.1;c.rotate(angle);
 line(c,0,0,16,23,INK,16);line(c,0,0,16,23,coat,10);ellipse(c,18,24,8,8,trim,INK,3);c.translate(20,24);
 if(h.id==='cat'){c.rotate(.35);sword(c);}
 if(h.id==='rabbit'){path(c,[['moveTo',0,-39],['quadraticCurveTo',45,0,0,41]],null,'#765f62',7);path(c,[['moveTo',0,-39],['lineTo',cast?-18:0,0],['lineTo',0,41]],null,'#fff0cc',2);if(cast){line(c,-25,0,32,0,'#f1deb0',4);path(c,[['moveTo',32,-5],['lineTo',45,0],['lineTo',32,5]],'#f2f2dc',INK,1.5);}}
 if(h.id==='bear'){line(c,0,32,0,-54,INK,10);line(c,0,32,0,-54,'#8a6c8e',5);ellipse(c,0,-58,15,16,cast?'#ffe8b4':'#d8b3f0',INK,3);star(c,0,-58,11,'#fff1b0',time);if(cast){c.shadowColor='#dbbcff';c.shadowBlur=25;ellipse(c,0,-58,23,23,'#d8b9ff33',null);}}
 c.restore();face(c,h.id,h);c.restore();
}
function drawEnemy(c,e,time){
 const s=e.boss?1.7:.83,bounce=e.alive?Math.abs(Math.sin(e.clock*8))*7:0,hit=e.stagger>0,squish=hit?.82:1+Math.sin(e.clock*8)*.035;
 ellipse(c,e.x,e.y+7,44*s,11*s,'#3d4f5433',null);
 c.save();c.globalAlpha=e.alive?1:clamp(1-e.deadTime/1.2,0,1);c.translate(e.x,e.y-e.z-bounce);c.rotate(e.angle);c.scale(s*(hit?1.17:1),s*squish);
 const color=e.flash>0?'#fff3de':e.boss?'#b479ab':'#87b9b1',light=e.boss?'#e2a5ba':'#c5dbbb';
 // Little stomping feet, big mittens, soft horns and an expressive face.
 ellipse(c,-22,-3,16,11,'#635a76',INK,4);ellipse(c,22,-3,16,11,'#635a76',INK,4);
 path(c,[['moveTo',-35,-66],['quadraticCurveTo',-57,-91,-40,-109],['quadraticCurveTo',-25,-100,-18,-80]],'#f2d8b2',INK,4);path(c,[['moveTo',24,-82],['quadraticCurveTo',39,-110,48,-101],['quadraticCurveTo',54,-82,37,-66]],'#f2d8b2',INK,4);
 ellipse(c,0,-47,47,51,color,INK,4);ellipse(c,0,-36,31,29,light,null);
 ellipse(c,-18,-63,11,14,'#fff4dc',INK,2.5);ellipse(c,17,-63,11,14,'#fff4dc',INK,2.5);
 if(hit){line(c,-24,-65,-12,-59,INK,4);line(c,11,-59,23,-65,INK,4);}else{ellipse(c,-22,-63,4.5,7,INK,null);ellipse(c,13,-63,4.5,7,INK,null);}
 path(c,[['moveTo',-17,-35],['quadraticCurveTo',0,-20,20,-37]],null,INK,4);path(c,[['moveTo',-13,-33],['lineTo',-8,-22],['lineTo',-3,-28]],'#fff5df',INK,2);
 const punch=e.attack>0?Math.sin((.55-e.attack)/.55*Math.PI)*38:0;
 line(c,-34,-49,-53-punch,-30,INK,18);line(c,-34,-49,-53-punch,-30,color,11);ellipse(c,-58-punch,-30,17,17,color,INK,4);ellipse(c,49,-35,15,16,color,INK,4);
 if(e.boss){path(c,[['moveTo',-28,-91],['lineTo',-34,-124],['lineTo',-13,-111],['lineTo',0,-136],['lineTo',13,-111],['lineTo',33,-124],['lineTo',27,-91],['closePath']],'#e9be71',INK,4);ellipse(c,0,-108,5,7,'#be739f',INK,2);rr(c,-30,-94,60,10,4,'#f4d38e',INK,3);}
 c.restore();
 if(e.alive&&e.hp<e.max&&!e.boss){rr(c,e.x-27,e.y-e.z-110*s,54,6,3,'#4e5661',null);rr(c,e.x-27,e.y-e.z-110*s,Math.max(1,54*e.hp/e.max),6,3,'#e6a6b0',null);}
}
function effect(c,e){const p=1-e.life/e.max;c.save();c.translate(e.x||0,e.y||0);c.globalAlpha=Math.min(1,e.life*5);
 if(e.type==='slash'){c.rotate(-.45);c.scale(e.large?1.6:1,e.large?1.6:1);path(c,[['moveTo',-80,-74],['bezierCurveTo',110,-106,150,64,-20,94],['bezierCurveTo',86,28,76,-52,-80,-74]],'#fff4bf',null);path(c,[['moveTo',-55,-64],['bezierCurveTo',91,-76,117,49,5,80]],null,'#ffc56d',8);}
 if(e.type==='impact'){c.rotate(p*2);star(c,0,0,(e.large?65:37)*(1+p*.6),'#fff9e4');star(c,0,0,(e.large?41:23)*(1+p),'#ffca6e',.3);}
 if(e.type==='explosion'){c.scale(1+p*1.8,1+p*1.8);for(let i=0;i<7;i++){const a=i*TAU/7;ellipse(c,Math.cos(a)*26,Math.sin(a)*22,25,25,'#c69ade',null);}ellipse(c,0,0,34,34,'#fff0bc',null);c.strokeStyle='#fff6d9';c.lineWidth=6;c.beginPath();c.arc(0,0,35+p*65,0,TAU);c.stroke();}
 if(e.type==='rune'||e.type==='shock'){c.scale(1,.3);c.strokeStyle=e.type==='rune'?'#ead8ff':'#fff4d7';c.lineWidth=4;c.beginPath();c.arc(0,0,e.type==='rune'?100:40+p*180,0,TAU);c.stroke();if(e.type==='rune')star(c,0,0,65,'#d2b0ff44',p*2);}
 c.restore();}
export function renderAction(c,g,ambient,reduced=false){
 c.save();const shake=reduced?0:g.shake;c.translate(Math.sin(ambient*90)*shake,Math.cos(ambient*113)*shake*.55);drawBackground(c,ambient);
 for(const e of g.effects.filter(e=>e.type==='rune'||e.type==='shock'))effect(c,e);
 const entities=[...g.heroes.map(h=>({y:h.y,draw:()=>drawHero(c,h,ambient)})),...g.enemies.map(e=>({y:e.y,draw:()=>drawEnemy(c,e,ambient)}))];entities.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
 for(const p of g.projectiles){if(p.age<0)continue;c.save();c.translate(p.x,p.y);if(p.type==='arrow'||p.type==='rain'){
  const angle=p.type==='rain'?1.3:Math.atan2(p.ty-p.sy,p.tx-p.sx);c.rotate(angle);line(c,-56,0,-15,0,'#fff0b688',7);line(c,-28,0,10,0,'#79615e',5);line(c,-28,0,10,0,'#f5dfab',2);path(c,[['moveTo',7,-6],['lineTo',24,0],['lineTo',7,6]],'#f4f0d7',INK,2);line(c,-27,0,-35,-7,'#9cbfaa',3);line(c,-27,0,-35,7,'#9cbfaa',3);
 }else{const big=p.type!=='orb',radius=big?33:15;path(c,[['moveTo',-radius,10],['lineTo',big?-100:-65,-(big?145:55)],['lineTo',radius,-8]],big?'#e8afee77':'#d5b6ff77',null);c.shadowColor='#e3b4ff';c.shadowBlur=20;ellipse(c,0,0,radius,radius,'#efd2ff','#a67dbf',3);star(c,0,0,radius*.9,'#fff3bd',ambient*3);}
 c.restore();}
 for(const e of g.effects.filter(e=>!['rune','shock','banner'].includes(e.type)))effect(c,e);
 for(const p of g.particles){c.save();c.globalAlpha=clamp(p.life/.3,0,1);if(p.type==='star')star(c,p.x,p.y,p.size,p.color,p.angle);else if(p.type==='dust')ellipse(c,p.x,p.y,p.size*(1.2-p.life),p.size*.45,'#f6e2be',null);else{c.translate(p.x,p.y);c.rotate(p.angle);rr(c,-p.size/2,-p.size/2,p.size,p.size,2,p.color,null);}c.restore();}
 for(const p of g.texts){c.save();c.globalAlpha=clamp(p.life/.2,0,1);c.font=`bold ${p.size}px 'Jua', sans-serif`;c.textAlign='center';c.strokeStyle=INK;c.lineWidth=5;c.strokeText(p.text,p.x,p.y);c.fillStyle=p.color;c.fillText(p.text,p.x,p.y);c.restore();}
 if(g.phase==='ready'){drawEnemy(c,{x:830,y:485,z:0,alive:true,clock:ambient,hp:65,max:65,stagger:0,flash:0,angle:0,attack:0},ambient);drawEnemy(c,{x:1070,y:490,z:0,alive:true,clock:ambient,boss:true,hp:850,max:850,stagger:0,flash:0,angle:0,attack:0},ambient);}
 c.restore();
 for(const e of g.effects.filter(e=>e.type==='banner')){c.save();c.globalAlpha=Math.min(1,e.life*3,(e.max-e.life)*5);c.translate(640,215);c.rotate(-.035);rr(c,-285,-33,570,70,10,'#342d49ee','#f4d093',3);c.font="32px 'Jua',sans-serif";c.textAlign='center';c.fillStyle='#ffe7ad';c.fillText(e.text,0,12);c.restore();}
 const boss=g.enemies.find(e=>e.boss&&e.alive);
 if(boss){rr(c,410,154,460,43,10,'#3a3449e8',null);c.font="18px 'Jua',sans-serif";c.fillStyle='#fff0d6';c.textAlign='center';c.fillText('장난꾸러기 왕',640,172);rr(c,425,179,430,8,4,'#5b455e',null);rr(c,425,179,Math.max(1,430*boss.hp/boss.max),8,4,'#ee9eb9',null);}
}
