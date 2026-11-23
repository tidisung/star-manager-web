import {ActionBattle,SKILLS,DURATION} from './action-engine.js';
import {renderAction} from './action-render.js';
const $=s=>document.querySelector(s),canvas=$('#scene'),ctx=canvas.getContext('2d');
let game=new ActionBattle(),paused=false,last=0,ambient=0,muted=false,audio=null,bestCombo=0,shownSecond=-1,finished=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;$('#shake').checked=!reduced;
function sound(type){
 if(muted||!audio||audio.state!=='running')return;const at=audio.currentTime;
 function tone(freq,end,duration,volume,wave='sine',delay=0){const o=audio.createOscillator(),g=audio.createGain();o.type=wave;o.frequency.setValueAtTime(freq,at+delay);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+delay+duration);g.gain.setValueAtTime(volume,at+delay);g.gain.exponentialRampToValueAtTime(.001,at+delay+duration);o.connect(g);g.connect(audio.destination);o.start(at+delay);o.stop(at+delay+duration+.02);}
 function noise(duration,volume,frequency){const b=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=frequency;g.gain.value=volume;s.connect(f);f.connect(g);g.connect(audio.destination);s.start();}
 if(type==='sword'||type==='charge'){noise(.16,.06,3500);tone(300,100,.14,.04,'triangle');}
 if(type==='hit'||type==='thump'){tone(125,42,.12,.09,'triangle');noise(.05,.07,1200);}
 if(type==='bow')tone(440,170,.09,.035,'triangle');
 if(type==='magic'){tone(520,980,.25,.025,'sine');tone(780,1400,.2,.02,'sine',.07);}
 if(type==='boom'){noise(.35,.13,900);tone(110,28,.35,.13,'triangle');}
 if(type==='kill')tone(880,1320,.09,.02,'sine');
 if(type==='boss'){tone(130,90,.4,.055,'triangle');tone(100,65,.5,.06,'triangle',.3);}
 if(type==='complete'){[523,659,784,1046].forEach((n,i)=>tone(n,n,.4,.04,'sine',i*.12));}
}
async function unlockSound(){try{audio ||= new (window.AudioContext||window.webkitAudioContext)();await audio.resume();}catch{muted=true;$('#sound').textContent='소리 사용 불가';$('#sound').setAttribute('aria-pressed','false');}}
function setPause(value){if(game.phase!=='playing')return;paused=value;$('#pauseCover').hidden=!paused;$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'계속하기':'일시정지');$('#status').textContent=paused?'잠시 멈췄어요. 계속하기를 누르면 이어져요.':'기술 버튼 또는 키보드 1·2·3으로 함께 공격해요.';updateUI();}
async function start(){await unlockSound();game=new ActionBattle(42);game.start();bestCombo=0;paused=false;finished=false;shownSecond=-1;$('#intro').hidden=true;$('#ending').hidden=true;$('#pauseCover').hidden=true;$('#pause').disabled=false;$('#pause').textContent='Ⅱ';$('#pause').setAttribute('aria-label','일시정지');$('#status').textContent='기술 버튼 또는 키보드 1·2·3으로 함께 공격해요.';$('#stageCaption').textContent='기사의 돌진에 맞춰 기술을 눌러봐요!';sound('magic');last=performance.now();updateUI();}
function useSkill(id){if(paused)return;if(game.skill(id)){$('#stageCaption').textContent=SKILLS[id].name+'!';updateUI();}}
function updateUI(){
 const seconds=Math.ceil(DURATION-game.time);if(seconds!==shownSecond){shownSecond=seconds;$('#clock').textContent=String(seconds).padStart(2,'0');}
 $('#killCount').textContent=game.kills;$('#timeBar').style.width=game.time/DURATION*100+'%';
 const combo=game.time-game.comboAt<2?game.combo:0;bestCombo=Math.max(bestCombo,combo);$('#combo').style.opacity=combo>=2?'1':'0';$('#combo strong').textContent=combo;
 for(const id of Object.keys(SKILLS)){const b=$('#'+id),cool=game.phase==='playing'?game.cooldowns[id]:0;b.disabled=game.phase!=='playing'||paused||cool>0;b.classList.toggle('on-cooldown',cool>0);b.querySelector('.cooldown').textContent=cool>0?Math.ceil(cool)+'초':'';b.setAttribute('aria-label',SKILLS[id].name+(cool>0?`, ${Math.ceil(cool)}초 뒤 사용 가능`:''));}
 if(game.phase==='complete'&&!finished){finished=true;$('#ending').hidden=false;$('#pause').disabled=true;$('#stageCaption').textContent='별빛 원정대 · 액션 체험';$('#results').innerHTML=`<span><b>${game.kills}</b>처치</span><span><b>${bestCombo}</b>최고 콤보</span><span><b>${game.skillsUsed}</b>특수 기술</span>`;$('#status').textContent='전투 완료! 실제 별·카드에는 영향을 주지 않아요.';$('#replay').focus({preventScroll:true});}
}
function tick(timestamp){const dt=last?Math.min((timestamp-last)/1000,.05):0;last=timestamp;if(!document.hidden&&!paused){ambient+=dt;if(game.phase==='playing'){game.update(dt);for(const event of game.takeEvents())sound(event.type);updateUI();}renderAction(ctx,game,ambient,!$('#shake').checked);}requestAnimationFrame(tick);}
$('#start').addEventListener('click',start);$('#replay').addEventListener('click',start);$('#pause').addEventListener('click',()=>setPause(!paused));$('#resume').addEventListener('click',()=>setPause(false));
for(const id of Object.keys(SKILLS))$('#'+id).addEventListener('click',()=>useSkill(id));
$('#sound').addEventListener('click',async()=>{muted=!muted;if(!muted)await unlockSound();$('#sound').textContent=muted?'소리 꺼짐':'소리 켜짐';$('#sound').setAttribute('aria-pressed',String(!muted));});
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.game-shell').requestFullscreen();}catch{$('#status').textContent='이 브라우저에서는 전체 화면을 지원하지 않아요. 가로 화면으로 보면 더 크게 즐길 수 있어요.';}});
document.addEventListener('fullscreenchange',()=>{$('#fullscreen').textContent=document.fullscreenElement?'전체 화면 닫기':'전체 화면';});
document.addEventListener('keydown',e=>{if(e.repeat||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;const id=Object.keys(SKILLS).find(id=>SKILLS[id].key===e.key);if(id){e.preventDefault();useSkill(id);}if(e.code==='Space'&&game.phase==='playing'&&!['BUTTON','A'].includes(e.target.tagName)){e.preventDefault();setPause(!paused);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true);last=performance.now();});
renderAction(ctx,game,0,reduced);requestAnimationFrame(tick);
