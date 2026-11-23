import {familyFetch} from './pages-client.js?v=85';
import {HEROES,UPGRADES,army,spinCost} from './adventure-core.js';
import {spriteSVG,paintBattle} from './adventure-art.js';
import {adventureAction} from './adventure-rules.js';
import * as E from './engine.js';
const demo=new URLSearchParams(location.search).get('demo')==='1',key='wish-adventure-demo-v1';
const $=s=>document.querySelector(s),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data=null,run=null,local=null,pending=null,busy=false,spinning=false,selectedStars=1,errorText='',lastRevision=-1,offset=0,finishRetry=0;
const now=()=>Date.now()+offset;
const terminal=r=>!r||['won','lost','abandoned'].includes(r.phase);
const button=(label,action,cl='',disabled=false)=>`<button data-action="${action}" class="${cl}" ${disabled||busy?'disabled':''}>${label}</button>`;
function toast(message){$('#message').textContent=message;$('#message').classList.add('visible');setTimeout(()=>$('#message').classList.remove('visible'),6500);}
function demoInit(){try{local=JSON.parse(sessionStorage.getItem(key));}catch{}if(!local||local.version!==1){local=E.initial();local.started=true;local.players.melody.stars=10;E.tick(local);}}
function demoState(){return {connection:'linked',revision:(data?.revision||0)+1,session:{role:'melody'},state:{...local,adventure:local.adventures?.melody||null,adventureNow:Date.now()}};}
function accept(next){if(next.revision<lastRevision)return;lastRevision=next.revision??lastRevision;data=next;run=next.state?.adventure||null;offset=(next.state?.adventureNow||Date.now())-Date.now();}
async function request(body){const response=await familyFetch('/api/'+(body?'action':'state'),{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});const next=await response.json();if(!response.ok)throw Object.assign(Error(next.error||'연결을 확인해 주세요.'),{known:true});return next;}
async function refresh(){if(busy||demo)return;try{const next=await request();const changed=next.revision!==lastRevision||next.connection!==data?.connection||next.session?.role!==data?.session?.role;accept(next);if(changed)render();}catch(e){errorText=e.message;if(!data)render();}}
async function send(type,extra={}){
 if(busy)return;busy=true;errorText='';
 const action={type,runId:run?.id,version:run?.version,...extra};
 if(!pending)pending={requestId:crypto.randomUUID(),action};
 spinning=pending.action.type==='adventureSpin';render();
 try{
  if(demo){const next=structuredClone(local);E.tick(next);adventureAction(next,{...pending.action,player:'melody'},Date.now());local=next;try{sessionStorage.setItem(key,JSON.stringify(local));}catch{}accept(demoState());}
  else{let next;for(let attempt=0;attempt<2;attempt++){try{next=await request(pending);break;}catch(e){if(e.known||attempt)throw e;}}accept(next);}
  pending=null;if(spinning)await new Promise(resolve=>setTimeout(resolve,650));
 }catch(e){errorText=e.message;toast(e.message);if(e.known||demo)pending=null;finishRetry=Date.now()+6000;}
 finally{busy=false;spinning=false;render();}
}
function symbols(type){return HEROES[type]?spriteSVG(type):`<span>${type==='coin'?'●':type==='heart'?'♥':'✦'}</span>`;}
function controls(){
 if(pending&&!busy)return `<h2>연결을 확인해 주세요</h2><p>처리 결과를 확인하면 같은 별이나 코인이 두 번 차감되지 않아요.</p>${button('처리 결과 다시 확인','retry','primary')}`;
 if(terminal(run)){
  const title=run?.phase==='won'?'소원을 찾았어요!':run?.phase==='lost'?'다음 모험에서 다시 만나!':run?.phase==='abandoned'?'모험을 마쳤어요':'작은 별로 시작하는 큰 모험';
  const available=E.available(data.state,data.session.role);
  return `<h2>${title}</h2>${run?.reward?`<div class="reward-card"><span class="reward-art">💩</span><div><b>${demo?'연습 똥카드 획득':'똥카드가 보관함에 도착했어요'}</b><p>${esc(run.reward.effect)}</p></div></div>`:''}<p>${run?.phase==='lost'?`${run.wave===6?'보스':run.wave+'웨이브'}에서 체력을 모두 썼어요. 사용한 별과 이번 판의 코인·친구는 돌아오지 않아요.`:'일반 웨이브 5개와 보스를 돌파하면 똥카드 1장을 받아요.'}</p><div class="start-input"><label for="stars">넣을 별</label><input id="stars" type="number" inputmode="numeric" min="1" max="${Math.min(10,available)}" value="${selectedStars}" ${busy?'disabled':''}><strong id="startCoins">${selectedStars*100}코인</strong></div><div class="control-row">${button(run?'새 모험 시작':'모험 시작','start','primary',available<1)}<p>${demo?'연습용 별이에요. 실제 별·카드는 변하지 않아요.':'별은 시작할 때 사용돼요. 많이 넣을수록 시작 코인이 많아요.'}</p></div>${demo&&available<1?button('연습 별 10개 채우기','refill','quiet small'):''}`;
 }
 const last=run.history.at(-1);
 if(run.phase==='prepare')return `<div class="control-row"><div><h2>${run.wave===6?'보스가 기다리고 있어요':'친구들을 준비해 주세요'}</h2><p>${run.wave===6?'다섯 번의 강화를 모았어요. 마지막 슬롯을 돌리고 보스에게 도전해요.':'슬롯에서 친구를 모으고 준비가 되면 출발해요.'}</p>${last?`<p>지난 전투: ${last.kills}/${last.total} 처치 · 놓친 적 ${last.leaks} · <strong>+${last.coins}코인</strong></p>`:''}</div>${button(run.wave===6?'보스 도전':`${run.wave}웨이브 출발`,'battle','mint')}</div>`;
 if(run.phase==='battle')return `<h2>${run.wave===6?'커다란 장난꾸러기를 막아라!':'친구들이 성을 지키고 있어요'}</h2><p id="battleText">적을 잡으면 코인 획득 · 놓치면 체력 감소</p><div class="progress"><i id="battleProgress"></i></div>`;
 if(run.phase==='upgrade')return `<h2>${last.leaks===0?'완벽하게 막았어요!':'웨이브를 넘었어요!'} 강화 하나를 골라요</h2><p>${last.kills}/${last.total} 처치 · 놓친 적 ${last.leaks} · +${last.coins}코인. 선택한 강화는 이번 판 동안 유지돼요.</p><div class="choices">${run.offers.map(id=>{const u=UPGRADES.find(u=>u.id===id);return button(`<span class="glyph">${u.icon}</span><b>${u.name}</b><small>${u.text}</small>`,'upgrade:'+id,'choice');}).join('')}</div>`;
 if(run.phase==='reward')return `<h2>보스를 물리쳤어요!</h2><p>함께 싸운 친구들 덕분에 소원을 찾았어요. 똥카드 한 장을 열어봐요.</p>${button('똥카드 받기','claim','primary')}`;
 return '';
}
function render(){
 if(!data){$('#game').innerHTML=`<section class="entry"><h1>별빛 모험</h1><p>${esc(errorText||'가족 연결을 확인하고 있어요…')}</p>${errorText?button('다시 연결','refresh','primary'):''}<a href="/star-manager-web/adventure.html?demo=1" class="mint">연습 모드로 해보기</a></section>`;return;}
 if(data.connection!=='linked'||!['melody','areum'].includes(data.session?.role)||!data.state?.started){$('#game').innerHTML=`<section class="entry"><h1>별빛 모험</h1><p>실제 별로 도전하려면 연결된 아이 기기에서 열어 주세요. 부모님이 게임을 시작한 뒤 이용할 수 있어요.</p><a href="/star-manager-web/adventure.html?demo=1" class="mint">연습 모드로 한 판 하기</a><a href="/star-manager-web/">가족 화면으로</a></section>`;return;}
 const grid=run?.grid.length?run.grid:['cat','rabbit','bear','coin','cat','heart','bear','coin','rabbit'];
 const buffs=[...new Set(run?.upgrades||[])],units=run?army(run):[],active=run&&!terminal(run),hp=run?.hp??12;
 const highlighted=new Set(run?.lastSpin?.lines.flat()||[]);
 $('#game').innerHTML=`<header class="top"><div class="brand"><span class="brandmark">✦</span><div><h1>별빛 모험</h1><p>작은 별을 모아, 나만의 소원으로</p></div></div><div class="top-right"><span class="badge">${demo?'연습 모드':esc(E.NAMES[data.session.role])+'의 모험'}</span><span class="stars">★ ${E.available(data.state,data.session.role)}개</span><a href="/star-manager-web/" class="quiet small">가족 화면</a></div></header><nav class="journey" aria-label="웨이브 진행">${[1,2,3,4,5,6].map(w=>`${w>1?'<i></i>':''}<span class="${w===6?'boss ':''}${(run?.wave||0)>w||run?.phase==='won'?'done':run?.wave===w?'current':''}" ${run?.wave===w?'aria-current="step"':''}>${w===6?'♛ 보스':w}</span>`).join('')}</nav><div class="play-layout"><aside class="slot-panel"><div class="section-head"><div><p class="eyebrow">STAR MACHINE</p><h2>친구 소환</h2></div><div class="coins" aria-label="남은 코인">● <span id="coins">${run?.coins??0}</span></div></div><div class="slot-grid ${spinning?'spinning':''}" aria-label="3 곱하기 3 슬롯 결과">${grid.map((type,i)=>`<div class="tile ${highlighted.has(i)?'line':''}" aria-label="${HEROES[type]?.name||(type==='coin'?'코인':'체력')}">${symbols(type)}<small>${HEROES[type]?.mark||(type==='coin'?'+3코인':'+1체력')}</small></div>`).join('')}</div><p class="slot-caption" role="status">${spinning?'어떤 친구가 찾아올까요?':run?.lastSpin?.lines.length?`반짝! ${run.lastSpin.lines.length}줄 완성 · 같은 그림 3개 보너스!`:'그림 3개를 모으면 친구 1명!<br>같은 친구 3명은 자동으로 한 단계 성장해요.'}</p>${button(spinning?'소환 중…':`슬롯 돌리기 · ${run?spinCost(run):30}코인`,'spin','primary spin',!active||run.phase!=='prepare'||run.coins<spinCost(run))}<div class="legend">${Object.entries(HEROES).map(([id,h])=>`<div class="legend-row">${spriteSVG(id)}<span>${h.name}<br><small>${id==='cat'?'가까운 적에게 강한 검':id==='rabbit'?'멀리서 쏘는 화살':'여러 적을 맞히는 마법'}</small></span><b>${run?.shards[id]||0}/3</b></div>`).join('')}</div></aside><section class="screen-panel"><div class="screen-head"><h2>${run?.wave===6?'달빛 숲의 장난꾸러기 왕':'첫 번째 모험 · 달빛 숲'}</h2><div class="health"><span id="hpLabel">♥ ${hp}/12</span><span class="health-track"><i id="hpBar" style="width:${hp/12*100}%"></i></span></div></div><div class="screen-wrap"><span class="screen-label">${!active?'MOONLIGHT FOREST':run.phase==='battle'?'BOSS & FRIENDS · 전투 중':'MOONLIGHT FOREST · 준비 시간'}</span><canvas id="battleCanvas" width="720" height="420" role="img" aria-label="동물 친구들이 오른쪽에서 다가오는 적으로부터 왼쪽 성을 지키는 전장"></canvas><div class="screen-footer"><span id="liveStats">${run?.shield?`◇ 방패 ${run.shield}회`:'성에 도착한 적은 체력을 깎아요'}</span><strong>${run?.wave===6?'보스 보상 · 똥카드 1장':'5웨이브 뒤 보스 등장'}</strong></div></div><section class="control" aria-live="polite">${controls()}</section><div class="loadout"><section><h3>함께하는 친구들 <span class="eyebrow">${units.length}명</span></h3><div class="units">${units.map(u=>`<span class="unit" title="${HEROES[u.type].name} ${u.rank}단계">${spriteSVG(u.type)}<b>${'★'.repeat(u.rank)}</b></span>`).join('')||'<p class="empty-note">모험을 시작하면 고양이 기사가 함께해요.</p>'}</div></section><section><h3>이번 판의 강화 <span class="eyebrow">${run?.upgrades.length||0}/5</span></h3><div class="buffs">${buffs.map(id=>`<span class="buff" title="${UPGRADES.find(u=>u.id===id).text}">${UPGRADES.find(u=>u.id===id).name} ×${run.upgrades.filter(x=>x===id).length}</span>`).join('')||'<p class="empty-note">웨이브를 넘을 때마다<br>세 가지 중 하나를 골라요.</p>'}</div></section></div></section></div><details class="help"><summary>처음이라면 · 모험 방법</summary><ol><li>별 1개는 100코인. 투입한 별은 이번 판의 시작 자금이 돼요.</li><li>슬롯 그림 3개로 친구 1명 소환. 가로·세로·대각선 같은 그림 3개는 추가 그림 3개를 줘요.</li><li>출발하면 자동 전투! 적을 잡아 코인을 벌고, 놓친 적은 체력을 깎아요.</li><li>웨이브마다 강화 하나 선택. 5웨이브 뒤 보스를 잡으면 똥카드 1장!</li><li>체력 0이면 이번 판 종료. ${demo?'연습 결과는 이 탭에만 저장돼요.':'화면을 닫아도 저장된 판을 이어갈 수 있어요.'}</li></ol></details><div class="below"><a href="/star-manager-web/action.html">새로운 2D 액션 체험</a><span>${demo?'<span class="demo-note">연습 모드 · 실제 별과 보상에는 영향이 없어요</span>':'진행 자동 저장 · 실제 별을 사용하는 모험이에요'}</span>${active&&['prepare','upgrade'].includes(run.phase)?button('이번 도전 끝내기','abandon','quiet small'):demo?'<a href="/star-manager-web/adventure.html">실제 모험 열기</a>':''}</div>`;
 paint();
}
function paint(){
 const canvas=$('#battleCanvas');if(!canvas)return;
 const elapsed=run?.battle?Math.max(0,now()-run.battle.startedAt):0;
 const frame=run?.battle?.frames[Math.min(run.battle.frames.length-1,Math.floor(elapsed/200))];
 paintBattle(canvas,run?{...run,displayUnits:army(run)}:null,frame,performance.now()/1000);
 if(frame){$('#hpLabel').textContent=`♥ ${frame.hp}/12`;$('#hpBar').style.width=`${frame.hp/12*100}%`;$('#liveStats').textContent=`처치 ${frame.kills}/${run.battle.total} · 놓침 ${frame.leaks} · 획득 +${frame.coins}코인`;const p=$('#battleProgress');if(p)p.style.width=Math.min(100,elapsed/run.battle.duration*100)+'%';}
}
let lastPaint=0;
function animate(t){if(t-lastPaint>40&&!document.hidden){paint();lastPaint=t;}if(run?.phase==='battle'&&now()>=run.battle.endsAt+250&&!busy&&!pending&&Date.now()>finishRetry){finishRetry=Date.now()+3000;send('adventureFinish');}requestAnimationFrame(animate);}
document.addEventListener('input',e=>{if(e.target.id==='stars'){selectedStars=Number(e.target.value);$('#startCoins').textContent=(selectedStars*100)+'코인';}});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled||busy)return;const [action,id]=b.dataset.action.split(':');
 if(action==='refresh'){await refresh();return;}
 if(action==='retry'){await send(pending.action.type);return;}
 if(action==='refill'){local.players.melody.stars=10;accept(demoState());render();return;}
 if(action==='start'){if(!Number.isSafeInteger(selectedStars)||selectedStars<1||selectedStars>10){toast('별은 1개부터 10개까지 넣어 주세요.');return;}await send('adventureStart',{stars:selectedStars,previousRunId:run?.id||null});return;}
 if(action==='abandon'&&!confirm('이번 도전을 끝낼까요? 사용한 별과 이번 판의 친구·코인은 돌아오지 않아요.'))return;
 const types={spin:'adventureSpin',battle:'adventureBattle',upgrade:'adventureUpgrade',claim:'adventureClaim',abandon:'adventureAbandon'};
 if(types[action])await send(types[action],action==='upgrade'?{upgrade:id}:{});
});
if(demo){demoInit();accept(demoState());render();}else await refresh();
requestAnimationFrame(animate);setInterval(refresh,5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
