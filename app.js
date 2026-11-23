import {familyFetch,onPages,pagesError,startPagesConnection,finishPagesConnection,pagesConnectionPending,familyHomeURL} from './pages-client.js?v=85';
import {POOP_EFFECTS,REVIEW_STATUSES,poopDefinition} from './poop-effects.js?v=80';
import {pokerHTML,pokerLabel,pokerKey,pokerHand,bestPokerHint} from './poker.js?v=79';
import {cardSwapHistoryHTML} from './card-swap-history.js?v=76';
import {awardHistoryHTML,shiftHistoryDate,historyWeekStart,shiftHistoryWeek,historyMonthStart,shiftHistoryMonth} from './award-history.js?v=74';
const historyDates={melody:'',areum:''};
const swapHistoryDates={melody:'',areum:''};
const historyWeeks={melody:'',areum:''};
const historyMonths={melody:'',areum:''};
const historyModes={melody:'week',areum:'week'};
import {weeklyScheduleHTML,weeklyPlanHTML,weeklyDayComplete} from './weekly-schedule.js?v=77';
let weeklyEditing=null;
import {quoteCards,quoteDate,setQuotePractice,quoteBanner,flipQuoteBanner,familyQuoteCards} from './quotes-ui.js?v=77';
import {eggLessonHTML} from './egg-tutor-ui.js?v=45';
import {createLessonVoice} from './tutor-voice.js?v=45';
import {mathVisual} from './math-visuals.js?v=39';
import {MISSION_LEVELS} from './mission-levels.js?v=39';
import {createMissionSound} from './mission-sound.js?v=40';
import {missionLandmark,missionMascot,missionLandscape,missionConfetti} from './mission-art.js?v=36';
import {starDigitSequences} from './star-digits.js?v=30';
import {friendlyCardEffect,marketRemaining} from './card-copy.js?v=24';
import * as E from './engine.js?v=22';
const $=s=>document.querySelector(s), KEY='wish-deck-prototype-v1', sessionKey='wish-role';
const RESULT_POOL_PREVIEW_ENABLED=false;
let poopFilter='all',poopReviewQueue=[];
const poopFilters=[['all','전체'],['unfinished','검수 미완료'],...REVIEW_STATUSES.map(status=>[status,status])];
function filteredPoop(filter=poopFilter){return POOP_EFFECTS.map(r=>poopDefinition(state,r.suit,r.rank)).filter(c=>filter==='all'||(filter==='unfinished'?c.reviewStatus!=='확정':c.reviewStatus===filter));}
let state=E.initial(),role='',page='cards',adminTab='home',adminKid='melody',fuseTier='poop',selected=[],busy=false,adminUntil=0,lastActivity=Date.now(),failures=0,lockedUntil=0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=t=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric'}).format(t);
const datetime=t=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit'}).format(t);
const isParent=()=>role==='mom'||role==='dad';const actor=()=>role==='mom'?'엄마':role==='dad'?'아빠':E.NAMES[role];
const adminOK=()=>isParent()&&session?.unlocked&&adminUntil>Date.now();
const btn=(text,action,cl='',disabled=false)=>`<button class="${cl}" data-act="${action}" ${disabled?'disabled':''}>${text}</button>`;
const icons={quotes:'<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM13 7a3 3 0 0 1 3-3h5v15h-4a4 4 0 0 0-4 2"/>',profile:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',cards:'<rect x="7" y="3" width="13" height="18" rx="3"/><path d="M4 6v12a3 3 0 0 0 3 3M13.5 8l1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4z"/>',market:'<path d="M3 10h18l-2-6H5zM5 10v10h14V10M9 20v-6h6v6"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',auction:'<rect x="4" y="9" width="16" height="12" rx="3"/><path d="M8 9V6a4 4 0 0 1 8 0v3M12 14v3"/>',fuse:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4zM20 2v4M18 4h4"/>',gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3zm0 0h4a3 3 0 1 0-3-3z"/>',star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',check:'<path d="m5 12 4 4L19 6"/>',back:'<path d="m14 6-6 6 6 6"/>'};
const icon=(name)=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.cards}</svg>`;
let inventoryFilter='all';
const shortDate=t=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric'}).format(t);
const tierMark=t=>({poop:'●',silver:'◆',gold:'✦'})[t];
const field=(label,id,type='text',value='',attrs='')=>`<label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}" ${attrs}>`;
const amount=(id='amount',value='')=>`<div class="amount">${btn('−',`step:${id}:-1`)}<input id="${id}" type="number" inputmode="numeric" min="1" step="1" placeholder="개수" aria-label="별 개수" value="${esc(value)}">${btn('+',`step:${id}:1`)}</div>`;
const num=id=>Number($('#'+id)?.value);const text=id=>$('#'+id)?.value||'';
let reward=null,rewardFlying=false,starSpending=false,rewardDelta=null,rewardResumeAt=0;
const rewardNotices=()=>state.notices[role]?.filter(n=>n.kind==='award'&&Number.isSafeInteger(n.amount)&&n.amount>0)||[];
function shownStars(){const actual=E.available(state,role);return reward&&reward.owner===role&&!rewardFlying?Math.max(0,actual-reward.amount):actual;}
function maybeStarReward(){
 if(rewardFlying||starSpending||(page==='mission'&&(missionSending||missionFeedback)))return;
 if(reward){
  if(connection!=='linked'||role!==reward.owner||reward.ids.some(id=>!rewardNotices().some(n=>n.id===id))){$('#starReward')?.remove();reward=null;render();}
  return;
 }
 if(connection!=='linked'||isParent()||!state.started||busy||document.hidden||$('#modal').open||Date.now()<rewardResumeAt)return;
 const pending=rewardNotices();if(!pending.length)return;
 const special=pending.find(n=>n.rewardType==='dailyComplete'),notices=special?[special]:pending;
 const spy=!!special;
 const ids=notices.map(n=>n.id),amount=notices.reduce((sum,n)=>sum+n.amount,0);
 reward={owner:role,ids,amount,action:{type:'ackAwards',ids},before:Math.max(0,E.available(state,role)-amount)};
 const senders=[...new Set(notices.map(n=>n.from||'부모님'))];
 const senderPortraits=spy?'<img class="spy-cat-portrait" src="/star-manager-web/art/spy-cat.svg" alt="선글라스를 쓴 첩보원 고양이" width="240" height="220">':senders.map(name=>{const person=({'아빠':'dad','엄마':'mom'})[name];return person?`<img class="reward-sender-photo" src="/star-manager-web/art/profiles/${person}-ghibli-v2.jpeg" alt="${esc(name)}가 준 별" width="512" height="512">`:`<span class="reward-sender-photo reward-sender-fallback" role="img" aria-label="${esc(name)}가 준 별">${icon(name==='오늘의 미션'?'star':'profile')}</span>`;}).join('');
 const dialog=document.createElement('dialog');dialog.id='starReward';if(spy)dialog.classList.add('spy-reward');dialog.setAttribute('aria-labelledby','starRewardTitle');
 dialog.innerHTML=`<div class="star-reward-content"><div class="reward-sender">${senderPortraits}</div><h2 id="starRewardTitle">${spy?'오늘 할 일을 다 처리했군.<br>대단해!':'별이 도착했어요!'}</h2>${spy?'<p class="spy-bonus-caption">첩보원 고양이의 특별 보너스 · 별 1개</p>':''}<button class="reward-star-button" data-act="collectStars" aria-label="별 ${amount}개 받기"><span class="reward-orbit" aria-hidden="true"></span><span class="reward-star" aria-hidden="true">${icon('star')}</span><strong>+${amount}</strong></button><p class="reward-hint">별을 톡 눌러 담아봐!</p><p class="reward-error" role="alert"></p></div>`;
 dialog.addEventListener('cancel',e=>e.preventDefault());document.body.append(dialog);render();dialog.showModal();
}
async function spinStarDigits(from,to){
 const header=$('.kid-stars'),number=header?.querySelector('strong');if(!number)return;
 header.setAttribute('aria-label',`쓸 수 있는 별 ${to}개 · 받은 기록 보기`);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){number.textContent=to;return;}
 const sequences=starDigitSequences(from,to);
 number.classList.add('star-reels');
 const reels=sequences.map(sequence=>`<span class="star-reel"><span class="star-strip">${sequence.map(n=>`<span>${n}</span>`).join('')}</span></span>`);
 number.innerHTML=reels.join('');
 await Promise.all([...number.querySelectorAll('.star-strip')].map((strip,i)=>strip.animate([{transform:'translateY(0)'},{transform:'translateY(-20em)'}],{duration:720,delay:i*150,easing:'cubic-bezier(.15,.65,.15,1)',fill:'forwards'}).finished.catch(()=>{})));
 number.classList.remove('star-reels');number.textContent=to;
}
async function collectStars(){
 if(!reward||rewardFlying)return;
 const current=reward,dialog=$('#starReward'),button=dialog.querySelector('button');let acknowledged=false;rewardFlying=true;button.disabled=true;
 try{
  const receipt=await commit(current.action);acknowledged=true;
  if(!receipt?.amount){dialog.remove();reward=null;rewardFlying=false;render();return;}
  dialog.querySelector('.reward-star-button strong').textContent='+'+receipt.amount;
  current.before=Math.max(0,E.available(state,role)-receipt.amount);
  window.scrollTo({top:0,behavior:'instant'});
  const star=dialog.querySelector('.reward-star'),target=$('.kid-stars .icon');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(star&&target&&!reduced){
   const a=star.getBoundingClientRect(),b=target.getBoundingClientRect();
   dialog.classList.add('star-taking-flight');
   const dx=b.left+b.width/2-a.left-a.width/2,dy=b.top+b.height/2-a.top-a.height/2;
   await star.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx*.55}px,${dy*.7-45}px) scale(.65)`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(${b.width/a.width})`,opacity:1}],{duration:800,easing:'cubic-bezier(.3,.05,.35,1)',fill:'forwards'}).finished.catch(()=>{});
  }
  const amount=receipt.amount,until=Date.now()+5000;rewardDelta={amount,until};rewardResumeAt=until;
  const header=$('.kid-stars');if(header){header.classList.add('star-arrived');header.querySelector('.star-plus')?.remove();header.insertAdjacentHTML('beforeend',`<span class="star-plus" aria-hidden="true">+${amount}</span>`);}
  dialog.remove();
  // Keep the page inert until the reels settle, so a render cannot interrupt them.
  $('#app').inert=true;
  setTimeout(()=>{if(rewardDelta?.until===until){rewardDelta=null;$('.star-plus')?.remove();maybeStarReward();}},5000);
  await spinStarDigits(current.before,E.available(state,role));
 }catch(e){
  if(acknowledged){dialog.remove();reward=null;rewardFlying=false;render();return;}
  if(dialog.isConnected){dialog.querySelector('.reward-error').textContent=e.message||'연결을 확인하고 다시 눌러주세요.';button.disabled=false;}
  rewardFlying=false;return;
 }finally{$('#app').inert=false;}
 reward=null;rewardFlying=false;render();
}
async function spendStars(action,after){
 if(starSpending)return;
 const before=shownStars(),button=$('[data-act="confirmAction"]');
 const amount=action.type==='gift'?action.amount:action.type==='draw'?25:state.market.find(m=>m.id===action.id)?.price;
 if(!Number.isSafeInteger(amount)||amount<=0)throw Error('사용할 별 개수를 다시 확인해 주세요.');
 let result;
 starSpending=true;if(button)button.disabled=true;
 try{
  result=await commit(action);
  // Persist the reveal before any animation, so leaving now cannot hide the drawn card.
  if(action.type==='draw')rememberReveal(result.id,true);
  close();
  window.scrollTo({top:0,behavior:'instant'});
  const until=Date.now()+5000;rewardDelta={amount:-amount,until};rewardResumeAt=until;
  const header=$('.kid-stars');if(header){header.querySelector('.star-plus')?.remove();header.insertAdjacentHTML('beforeend',`<span class="star-plus star-minus" aria-hidden="true">-${amount}</span>`);}
  $('#app').inert=true;if($('.nav'))$('.nav').inert=true;
  if(action.type==='gift')toast(`별 ${amount}개를 보냈어요.`,5000);
  setTimeout(()=>{if(rewardDelta?.until===until){rewardDelta=null;$('.star-plus')?.remove();maybeStarReward();}},5000);
  await spinStarDigits(before,E.available(state,role));
 }finally{
  starSpending=false;$('#app').inert=false;if($('.nav'))$('.nav').inert=false;
  if(button?.isConnected)button.disabled=false;render();
 }
 if(after)await after(result);
}
let starHistorySnapshot=[];
function historySenderPhoto(name){const person=({'아빠':'dad','엄마':'mom','멜로디':'melody','아름이':'areum'})[name];return person?`<img class="history-sender-photo" src="/star-manager-web/art/profiles/${person}-ghibli-v2.jpeg" alt="${esc(name)}" width="48" height="48">`:`<span class="history-sender-photo history-sender-fallback" role="img" aria-label="${esc(name||'보낸 사람')}">${icon('profile')}</span>`;}
function starHistory(requestedPage=null){
 if(requestedPage===null)starHistorySnapshot=[...(state.starReceipts||[])].sort((a,b)=>b.at-a.at);
 const entries=starHistorySnapshot,total=Math.max(1,Math.ceil(entries.length/5));
 const page=Math.max(0,Math.min(total-1,Number.isInteger(requestedPage)?requestedPage:0));
 const visible=entries.slice(page*5,page*5+5);
 const when=t=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'medium',timeStyle:'short'}).format(t);
 modal(`<div class="star-history"><h2>받은 별</h2>${entries.length?`<ol class="star-history-list" start="${page*5+1}">${visible.map(n=>`<li><div class="star-history-top">${historySenderPhoto(n.from)}<strong>★ +${n.amount}</strong></div><time datetime="${new Date(n.at).toISOString()}">${when(n.at)}</time><p>${esc(n.reason||'이유 미기록')}</p></li>`).join('')}</ol><nav class="history-pagination" aria-label="받은 별 기록 페이지">${btn('이전',`starHistoryPage:${page-1}`,'small',page===0)}<span id="historyPageStatus" role="status" tabindex="-1" aria-label="${total}페이지 중 ${page+1}페이지">${page+1} / ${total}</span>${btn('다음',`starHistoryPage:${page+1}`,'small',page===total-1)}</nav>`:'<p class="muted">아직 받은 별이 없어요.</p>'}</div>`);
 $('#modal').scrollTop=0;
 if(requestedPage!==null)$('#historyPageStatus')?.focus({preventScroll:true});
}
function toast(message,duration=4500){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').style.display='none',duration);}
function modal(html){const d=$('#modal');delete d.dataset.card;delete d.dataset.liveCard;delete d.dataset.liveEffect;delete d.dataset.liveMode;d.innerHTML=`<button class="close" data-act="close" aria-label="닫기">×</button><div>${html}</div>`;if(!d.open)d.showModal();d.scrollTop=0;}
function close(){if($('.draw-result[data-unopened="true"]'))return;$('#modal').close();queueMicrotask(maybeStarReward);}
function error(e){toast(e.message||String(e));}
let connection='loading',session=null,revision=-1,devices=[],serverTime=0,syncing=false,networkOK=true,needsRender=false;
let enrollToken=new URLSearchParams(location.hash.slice(1)).get('enroll')||sessionStorage.getItem('wish-enroll')||'';
let redeemId=new URLSearchParams(location.hash.slice(1)).get('redeem')||sessionStorage.getItem('wish-redeem')||'';
if(enrollToken)sessionStorage.setItem('wish-enroll',enrollToken);
if(redeemId)sessionStorage.setItem('wish-redeem',redeemId);
if(location.hash)history.replaceState(null,'',location.pathname+location.search);
async function api(path,body){
 const payload=body?JSON.stringify({...body,requestId:body.requestId||E.uid()}):null;
 let response;
 for(let attempt=0;attempt<2;attempt++){
  try{response=await familyFetch('/api/'+path,{method:payload?'POST':'GET',headers:payload?{'Content-Type':'application/json'}:{},body:payload,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});break;}
  catch(e){if(attempt)throw Error('서버 연결을 확인해 주세요. 처리 결과를 확인하기 전 다시 결제하지 마세요.');}
 }
 const data=await response.json();if(!response.ok){if(response.status===401||response.status===423)sync().catch(()=>{});throw Error(data.error||'처리하지 못했어요.');}return data;
}
function accept(data){const oldMissionId=state.todayMission?.run?.id,oldMissionSettings=state.todayMission?.settingsVersion;if(data.revision!==undefined&&data.revision<revision)return;revision=data.revision??revision;connection=data.connection??connection;session=data.session||null;role=session?.role||'';adminUntil=session?.unlockedUntil||0;if(data.state)state=data.state;else if(connection!=='linked'||isParent())state=E.initial();networkOK=true;if(oldMissionId!==state.todayMission?.run?.id||oldMissionSettings!==state.todayMission?.settingsVersion)clearMissionFeedback();}
async function commit(a,pin){if(busy)throw Error('처리 중이에요. 잠시 기다려 주세요.');busy=true;a.requestId ||= E.uid();try{const data=await api('action',{action:a,pin,requestId:a.requestId});accept(data);render();return data.result;}finally{busy=false;}}
async function sync(){if(syncing||busy)return;syncing=true;try{const data=await api('state');const prev=revision,oldConnection=connection,oldUnlock=adminOK(),oldMissionDay=state.todayMission?.day,oldScheduleDay=(state.weeklySchedule||state.weeklyStatus?.melody)?.days.find(d=>d.today)?.date,wasScheduleComplete=weeklyDayComplete(state.weeklySchedule?.days.find(d=>d.today));accept(data);if(oldScheduleDay!==(state.weeklySchedule||state.weeklyStatus?.melody)?.days.find(d=>d.today)?.date||oldMissionDay!==state.todayMission?.day||prev!==revision||oldConnection!==connection||oldUnlock!==adminOK()||!$('#app').children.length)needsRender=true;if(needsRender&&!document.activeElement?.matches('input,textarea,select')){render();needsRender=false;if(!wasScheduleComplete&&weeklyDayComplete(state.weeklySchedule?.days.find(d=>d.today)))$('.weekly-day.is-golden')?.classList.add('just-completed');}
 if(isParent()&&adminOK()&&adminTab==='settings'&&!$('#modal').open){const d=await api('devices');devices=d.devices||[];if(!document.activeElement?.matches('input,textarea,select'))render();}
 if(!$('#modal').open&&redeemId&&connection==='linked'){if(isParent()){if(adminOK()){const id=redeemId;redeemId='';sessionStorage.removeItem('wish-redeem');try{redeem(id);}catch(e){error(e);}}}else{redeemId='';sessionStorage.removeItem('wish-redeem');toast('카드 사용 승인은 등록된 부모 휴대폰에서 해 주세요.');}}
 if(!isParent()&&$('#modal').open&&$('#modal').dataset.liveCard){const d=$('#modal'),c=state.cards.find(c=>c.id===d.dataset.liveCard);if(!c)close();else if(c.effect!==d.dataset.liveEffect){if(d.dataset.liveMode==='qr')qr(c.id);else detail(c.id);}}
 if($('#modal').open&&$('#modal').dataset.card){const c=state.cards.find(c=>c.id===$('#modal').dataset.card);if(!c||c.status!=='active'){close();toast('카드 상태가 변경됐어요. 보관함에 반영했습니다.');}}
 }catch(e){networkOK=false;if(connection==='loading'){connection='error';render();}const indicator=$('#connectionStatus');if(indicator)indicator.textContent='연결이 끊겼어요 · 다시 연결 중';}finally{syncing=false;restoreUnopenedCard();maybeStarReward();}}
const artworkIds=['tissue','olive','royal','penguin','clap','mute','nickname','draw','ramen','daiso','traders','cash','toy','cafe'];
function cardArt(c){const index=artworkIds.indexOf(c.type||c.id);return `<span class="card-picture ${index<0?'custom-picture':''}" aria-hidden="true" ${index>=0?`style="background-position:${index%4*100/3}% ${Math.floor(index/4)*100/3}%"`:''}>${index<0?`<span>${esc(c.emoji)}</span>`:''}</span>`;}
function template(c,body='',click='',options={}){const tag=click?'button':'article';return `<${tag} class="card ${c.tier} ${click?'card-tap':''} ${options.selected?'chosen':''} ${options.sold?'is-sold':''}" ${click?`data-act="${click}" aria-label="${esc(c.name)} · ${pokerLabel(c.poker)} · ${E.TIERS[c.tier]}${options.selectable?' 재료 선택':' 카드 보기'}"`:''} ${options.selectable?`aria-pressed="${!!options.selected}"`:''} ${options.disabled?'disabled':''}><span class="card-top">${pokerHTML(c.poker)}<span class="card-grade" aria-label="${E.TIERS[c.tier]}">${tierMark(c.tier)}</span>${c.quantity?`<span class="quantity" aria-label="${c.quantity}장 보유">×${c.quantity}</span>`:''}${options.selectable?`<span class="select-check">${options.selected?icon('check'):'＋'}</span>`:''}</span><span class="card-face">${cardArt(c)}<span class="card-name">${esc(c.tier==='poop'?c.effect:c.name)}</span></span>${isParent()&&c.tier!=='poop'?`<span class="card-effect">${esc(friendlyCardEffect(c.effect))}</span>`:''}${body?`<span class="card-bottom">${body}</span>`:''}</${tag}>`;}

const flippedCards=new Set();
function flipCard(c,key,content,frontNote='',sold=false){
 const flipped=flippedCards.has(key);
 const soldBadge=sold?'<span class="sold-badge">품절</span>':'';
 const front=template(c,`${frontNote}`,`flip:${key}`).replace('<span class="card-top">',`<span class="card-top">${soldBadge}`).replace('class="card ', 'class="card flip-front ').replace(' 카드 보기',' 뒤집기').replace('<button ',`<button aria-expanded="${flipped}" aria-controls="back-${key}" ${flipped?'inert aria-hidden="true"':''} `);
 return `<div class="flip-shell ${sold?'sold-out':''} ${flipped?'is-flipped':''}" data-flip="${key}"><div class="flip-inner">${front}<section id="back-${key}" class="card flip-back ${c.tier}" data-act="flip:${key}" tabindex="0" ${flipped?'':'inert aria-hidden="true"'} aria-label="${esc(c.name)} 뒷면 · 누르면 그림으로"><div class="back-heading">${soldBadge}<span class="card-grade" aria-label="${E.TIERS[c.tier]}">${tierMark(c.tier)}</span></div><h3>${esc(c.name)}</h3><p class="back-effect">${esc(friendlyCardEffect(c.effect))}</p>${content}</section></div></div>`;
}
function ownedFlip(c){const card=c.instances[0];const face=flipCard(c,'owned-'+card.id,`<p class="back-help">혜택을 받을 때 부모님께 QR을 보여주세요.</p><small class="back-expiry">${shortDate(card.expires)}까지 · 한 번 사용</small><div class="back-actions">${btn('사용하기',`qr:${card.id}`,'primary')}${btn(c.instances.length>1?`${c.instances.length}장 보기 · 교체`:'카드 보기 · 교체',`detail:${card.id}`,'small')}${card.expires-Date.now()<=14*86400000?btn(`1개월 연장 · ★ ${E.COST[c.tier]}`,`extend:${card.id}`,'small'):`<small>만료 14일 전부터 연장 · ★ ${E.COST[c.tier]}</small>`}</div>`,card.expires-Date.now()<14*86400000?'<span class="card-expiry soon">곧 만료</span>':'');const depth=c.instances.length-1,step=depth?Math.min(10,20/depth):0;const layers=Array.from({length:depth},(_,i)=>depth-i).map(i=>`<span class="card stack-layer ${c.tier}" aria-hidden="true" style="--stack-offset:${i*step}px"></span>`).join('');return `<div class="owned-stack" data-stack-count="${c.instances.length}">${layers}${face}</div>`;}
function marketCountdown(){return `<span class="market-restock"><span>새 카드까지</span><b data-market-countdown>${esc(marketRemaining(state.nextRefresh))}</b></span>`;}
function updateMarketCountdown(){document.querySelectorAll('[data-market-countdown]').forEach(el=>{el.textContent=marketRemaining(state.nextRefresh);});}
function marketFlip(m){const err=E.capacity(state,role,m.card.id),short=m.price-E.available(state,role);return flipCard(m.card,'market-'+m.id,`<div class="back-cost"><span>카드 가격</span><b>★ ${m.price}</b></div><p class="back-help">구매한 뒤 혜택을 받을 때<br>부모님께 QR을 보여주세요.</p><small class="back-expiry">한 번 쓸 수 있어요</small><div class="back-actions">${m.buyer?`<span class="sold-label sold-buyer"><img src="/star-manager-web/art/profiles/${m.buyer}-ghibli-v2.jpeg" alt="${esc(E.NAMES[m.buyer])}" width="40" height="40"><span>샀음</span></span>${marketCountdown()}`:btn(short>0?`별 ${short}개 부족`:err?'보관함이 꽉 찼어요':`★ ${m.price} · 구매하기`,`buy:${m.id}`,'primary',short>0||!!err)}${!m.buyer&&err?`<small>${esc(err)}</small>`:''}</div>`,m.buyer?marketCountdown():'',!!m.buyer);}
function toggleCard(key){const shell=[...document.querySelectorAll('[data-flip]')].find(el=>el.dataset.flip===key);if(!shell)return;if(shell.dataset.spin==='waiting'){stopMysterySpin(shell,key);return;}if(shell.dataset.spin==='stopping')return;const flipped=!flippedCards.has(key);if(flipped)flippedCards.add(key);else flippedCards.delete(key);const front=shell.querySelector('.flip-front'),back=shell.querySelector('.flip-back');front.inert=flipped;back.inert=!flipped;front.setAttribute('aria-expanded',String(flipped));front.setAttribute('aria-hidden',String(flipped));back.setAttribute('aria-hidden',String(!flipped));shell.classList.toggle('is-flipped',flipped);(flipped?back:front).focus({preventScroll:true});if(shell.dataset.reveal){if(flipped){forgetReveal();$('.draw-result').dataset.unopened='false';$('.reveal-actions').hidden=false;$('#modal .close').hidden=false;}const info=$('#revealInfo');info.hidden=!flipped;$('#revealTitle').textContent=flipped?'카드를 받았어요!':'어떤 카드일까?';}}
function groups(p){const map={};for(const c of E.owned(state,p)){const key=c.type+':'+pokerKey(c.poker);if(!map[key])map[key]={...c,quantity:0,instances:[]};map[key].quantity++;map[key].instances.push(c);}return Object.values(map).map(g=>({...g,instances:g.instances.sort((a,b)=>a.expires-b.expires)}));}
function notices(){const n=state.notices[role]?.filter(n=>n.kind!=='award');if(!n?.length)return '';return `<div class="notice row"><span>${n.length>2?`새 소식 ${n.length}개 · ${esc(n[n.length-1].text)}`:n.map(x=>esc(x.text)).join('<br>')}</span>${btn('확인','dismiss','small')}</div>`;}
function hero(){return '';}
const missionSound=createMissionSound();
function missionSoundButton(){const on=missionSound.enabled;return `<button class="mission-sound-toggle ${on?'sound-on':''}" data-act="missionSound" aria-pressed="${on}" aria-label="${on?'소리 끄기':'소리 켜기'}"><svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4Z"/>${on?'<path d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>':'<path d="m17 9 5 6m0-6-5 6"/>'}</svg><span>${on?'소리 켬':'소리 끔'}</span></button>`;}
let missionFeedback=null,missionSending=false,missionRetry=null,missionAdvanceTimer=null;
function clearMissionFeedback(){clearTimeout(missionAdvanceTimer);missionFeedback=null;missionRetry=null;}
let eggCoachKey='',eggCoachResult=null,eggMoving=false,eggDrag=null,eggIgnoreClickUntil=0;
let voiceStatus='idle',regularVoiceKey='';
function showVoiceStatus(){for(const el of document.querySelectorAll('[data-voice-status],#eggVoiceStatus'))el.textContent=voiceStatus==='loading'?'목소리를 준비하고 있어요…':voiceStatus==='speaking'?'읽어주는 중…':voiceStatus==='unavailable'?'소리가 안 나면 문제 듣기를 눌러 주세요.':'';}
const tutorVoice=createLessonVoice({fetcher:familyFetch,onStatus:s=>{voiceStatus=s;showVoiceStatus();}});
function readLesson(mode,question){const run=state.todayMission?.run,q=question||run?.question;if(!missionSound.enabled||page!=='mission'||!q||q.concept&&!q.concept.ready)return;return tutorVoice.speak({runId:run.id,questionId:q.id,mode:mode||((q.attempt>0||q.egg?.hints>0)?'hint':'question'),version:q.egg?.version??q.attempt});}
function maybeRegularVoice(){const r=state.todayMission?.run,q=r?.question;if(page!=='mission'||r?.kind==='eggs'||!q||missionFeedback||missionSending||document.hidden)return;const key=r.id+':'+q.id+':'+q.attempt;if(key===regularVoiceKey)return;regularVoiceKey=key;readLesson();}
function currentEggCoach(){const q=state.todayMission?.run?.question;return eggCoachResult?.questionId===q?.id&&eggCoachResult?.version===q?.egg?.version?eggCoachResult.coach:q?.coach;}
async function maybeEggCoach(){
 const run=state.todayMission?.run,q=run?.question;if(page!=='mission'||run?.kind!=='eggs'||!q||missionFeedback||missionSending||eggMoving||busy||document.hidden)return;
 const e=q.egg,key=`${run.id}:${q.id}:${e.phase}:${e.checks}:${e.hints}:${q.attempt}:${q.concept?.ready}:${e.initial+e.slots.length===10}`;if(key===eggCoachKey)return;eggCoachKey=key;
 try{const result=await api('tutor-coach',{runId:run.id,questionId:q.id,version:e.version});if(result.pending){setTimeout(()=>{eggCoachKey='';maybeEggCoach();},2000);return;}if(result.refresh){eggCoachKey='';await sync();return;}const current=state.todayMission?.run?.question;if(page!=='mission'||current?.id!==result.questionId||current.egg.version!==result.version||missionFeedback)return;eggCoachResult=result;render();readLesson();}catch{if(q.concept&&!q.concept.ready){eggCoachKey='';setTimeout(maybeEggCoach,3000);return;}if(page==='mission'&&state.todayMission?.run?.question?.id===q.id)readLesson();}
}
async function moveEgg(type,slot){
 const r=state.todayMission?.run,q=r?.question;if(!q?.egg||eggMoving||busy||missionSending)return;
 eggMoving=true;try{await commit({type,runId:r.id,questionId:q.id,version:q.egg.version,slot,remove:type==='tutorMove'&&q.egg.slots.includes(slot)});}catch(e){error(e);await sync();}finally{eggMoving=false;render();}
}
function nextEggSlot(){const e=state.todayMission?.run?.question?.egg;if(!e)return -1;return Array.from({length:10},(_,i)=>i).find(i=>i>=e.initial&&!e.slots.includes(i))??-1;}

function missionPage(){
 const status=state.todayMission||{},run=status.run,feedback=missionFeedback;
 if(run?.kind==='eggs'&&(run.stage==='playing'||feedback))return eggLessonHTML({run,coach:currentEggCoach(),mascot:missionMascot(feedback?.correct?'happy':'idle'),soundButton:missionSoundButton(),busy:eggMoving||missionSending,feedback});
 const level=run?.currentLevel||status.level||1,unit=MISSION_LEVELS[level-1];
 const head=`<div class="mission-heading"><button class="mission-back" data-act="nav:cards" aria-label="내 카드로 돌아가기">${icon('back')}</button><h2>오늘의 5문제</h2>${missionSoundButton()}<span class="mission-prize">${icon('star')}<b>1</b></span></div>`;
 const wrap=(body,kind='')=>`<section class="math-workbook ${kind}">${head}${run?.question||feedback?`<div class="lesson-listen">${btn('🔊 문제 듣기','lessonListen','small')}<small>AI 선생님 목소리</small><span data-voice-status role="status"></span></div>`:''}${body}</section>`;
 if(!run&&!feedback)return wrap(`<div class="math-welcome"><div class="math-welcome-art" aria-hidden="true">${missionMascot('idle')}<span>5</span></div><span class="math-eyebrow">${esc(E.NAMES[role])}의 수학 연습장</span><h3>오늘은 딱<br><em>다섯 문제!</em></h3><div class="math-unit"><small>${esc(unit?.group)}</small><b>${esc(unit?.name)}</b>${status.mode!=='manual'?btn('다른 단계 고르기','missionPick','text-button'):'<small>부모님이 골라준 단계예요</small>'}</div>${btn(missionSending?'준비 중…':`${status.level}단계 시작하기`,'missionStart','primary math-go',missionSending)}<small>틀려도 괜찮아. 그림을 보고 다시 해 보자!</small></div>`,'welcome');
 if(run?.stage==='complete'&&!feedback)return wrap(`${missionConfetti()}<div class="math-finish"><div class="math-finish-mascot">${missionMascot('happy')}</div><span class="math-eyebrow">오늘도 한 걸음!</span><h3>${run.legacy?'오늘 미션 완료!':'다섯 문제를 해냈어!'}</h3><div class="math-earned">${icon('star')}</div>${run.conceptSummary?`<p>${esc(run.conceptSummary.verdict)}</p><p>이해 확인 ${run.conceptSummary.checks}문제 중 혼자서 ${run.conceptSummary.independent}개</p>`:run.legacy?'':`<p>첫 답에 ${run.firstCorrect}개 · 다시 풀어서 ${5-run.firstCorrect}개</p>`}<div class="math-talk"><b>어떻게 알았어?</b><span>한 문제만 골라 손가락이나 그림으로 보여줘!</span></div>${state.missionTip?`<p class="math-tip">${esc(state.missionTip.message)}</p>`:''}${btn('오늘은 여기까지!','nav:cards','primary math-go')}</div>`,'completed');
 const q=feedback?.question||run?.question;if(!q)return wrap('<p>문제를 불러오고 있어요.</p>');
 const number=feedback?.number??run.mastered+1,correct=feedback?.correct&&!feedback.pending&&!feedback.error,hint=!feedback&&q.hint;
 const dots=Array.from({length:5},(_,i)=>`<span class="${i<number-1?'done':i===number-1?'current':''}">${i<number-1?'✓':i+1}</span>`).join('');
 return wrap(`<div class="math-progress" aria-label="5문제 중 ${number}번째">${dots}<b>${number} / 5</b></div><div class="math-problem ${correct?'is-correct':''}"><span class="math-eyebrow">${esc(MISSION_LEVELS[q.level-1]?.name)}</span>${mathVisual(q)}<h3 class="math-prompt">${esc(q.level===1?q.prompt.replace(/●\s*/g,''):q.prompt)}</h3>${hint?`<div class="math-hint" role="status"><span>💡</span><div><b>같이 생각해 보자!</b><p>${esc(hint)}</p></div></div>`:''}<div class="math-options">${q.options.map((v,i)=>`<button data-act="missionAnswer:${q.id}:${i}" class="math-option ${correct&&v===feedback.answer?'correct':''}" ${feedback||missionSending||q.wrongOptions?.includes(v)?'disabled':''}>${esc(v)}${correct&&v===feedback.answer?' ✓':''}</button>`).join('')}</div><div class="mission-feedback math-feedback" role="status">${feedback?.error?`<p>${esc(feedback.error)}</p>${btn('다시 연결','missionRetry','primary')}${btn('다시 열기','missionOpen','small')}`:feedback?.pending?'<p>확인 중…</p>':correct?`<div class="math-correct-message">${missionMascot('happy')}<b>맞았어!</b></div>${btn(number===5?'다 풀었어요! →':'다음 문제 →','missionContinue','primary math-go')}`:'<small>답을 톡 눌러봐!</small>'}</div></div>`,'playing');
}
function stageOptions(level){let group='';return MISSION_LEVELS.map(l=>{let start='';if(group!==l.group){start=(group?'</optgroup>':'')+`<optgroup label="${esc(l.group)}">`;group=l.group;}return start+`<option value="${l.level}" ${l.level===level?'selected':''}>${l.level}. ${esc(l.name)}</option>`;}).join('')+'</optgroup>';}
function missionPick(){const status=state.todayMission;modal(`<h2>어떤 걸 해 볼까?</h2><label for="kidMissionLevel">연습 단계</label><select id="kidMissionLevel">${stageOptions(status.level)}</select><p class="muted">어느 단계든 다섯 문제씩!</p><div class="actions">${btn('돌아가기','close')}${btn('이 단계로 할래','missionPickSave:'+status.settingsVersion,'primary')}</div>`);}
async function submitMission(action,question=null){
 if(missionSending||busy)return;
 missionSending=true;missionRetry=action;action.requestId ||= E.uid();
 const run=state.todayMission?.run;
 if(question)missionFeedback={question,choice:question.options[action.optionIndex],reviewing:missionFeedback?.reviewing??run.reviewing,number:missionFeedback?.number??run.mastered+1,mastered:missionFeedback?.mastered??run.mastered,pending:true};
 const feedbackAtSubmit=missionFeedback;
 render();
 try{
  const result=await commit(action);missionRetry=null;
  if(question&&page==='mission'&&missionFeedback===feedbackAtSubmit){
   missionFeedback={...missionFeedback,...result,pending:false};if(result.correct)readLesson('correct',question);missionSound.play(result.correct).then(ok=>{if(!ok&&missionSound.enabled&&!document.hidden&&page==='mission')toast('소리 버튼을 껐다 켜 주세요.');});
   if(!result.correct)missionFeedback=null;
  }else missionFeedback=null;
  if(!question&&page==='mission')window.scrollTo({top:0,behavior:'instant'});
 }catch(e){if(question&&page==='mission'&&missionFeedback===feedbackAtSubmit)missionFeedback={...missionFeedback,pending:false,error:e.message};else error(e);}
 finally{missionSending=false;render();if(page==='mission'&&missionFeedback&&!missionFeedback.pending&&!missionFeedback.correct) $('.mission-feedback')?.scrollIntoView({block:'nearest',behavior:'smooth'});}
}

function kidCards(){const g=groups(role),res=E.reservations(state,role);const count=E.owned(state,role).length;const filtered=g.filter(c=>inventoryFilter==='all'||c.tier===inventoryFilter);return hero('나의 소원카드','카드를 톡 눌러 소원을 확인해요.')+notices()+deckSummaryHTML()+weeklyScheduleHTML(state.weeklySchedule)+`<div class="deck-toolbar"><div class="deck-count">${icon('cards')} <b>보관함</b><span>${count}장</span></div><div class="inline">${btn(icon('fuse')+'합성하기','nav:fuse','primary')}${btn(icon('gift')+'별 보내기','gift','secondary')}</div></div>`+(g.length?`<div class="filters" role="group" aria-label="카드 등급 고르기">${[['all','전체'],['poop','똥카드'],['silver','은카드'],['gold','금카드']].map(([t,label])=>`<button data-act="filter:${t}" aria-pressed="${inventoryFilter===t}" class="filter ${inventoryFilter===t?'active':''}">${label}<span>${t==='all'?g.length:g.filter(c=>c.tier===t).length}</span></button>`).join('')}</div><div class="grid inventory">${filtered.map(c=>ownedFlip(c)).join('')}</div>${!filtered.length?'<div class="empty compact"><h2>아직 이 등급의 카드가 없어요</h2><p>다른 카드를 모아 합성해 보세요.</p></div>':''}`:`<div class="empty"><div class="empty-deck" aria-hidden="true"><span>✦</span><span>★</span><span>✦</span></div><h2>첫 소원카드를 기다리고 있어요</h2><p>별을 모아 마음에 드는 카드를 골라요.</p>${btn(icon('market')+'시장 구경하기','nav:market','primary')}</div>`)+(res.length?'<p class="notice reservation">🔒 경매에서 받을 카드 자리를 비워두었어요.</p>':'');}
function deckSummaryHTML(){return state.deckSummary?`<div class="deck-summary" aria-label="가족 공용 덱 잔여 수량">${Object.entries(E.TIERS).map(([tier,name])=>`<span>${name} <b>${state.deckSummary[tier].deck}</b> / 52장</span>`).join('')}</div>`:'';}
function marketPage(){const remaining=E.deckPool(state,'poop').length;return hero('가족 공용 덱','우리 가족이 함께 쓰는 카드예요.')+deckSummaryHTML()+`<div class="draw-panel section"><div class="draw-icon" aria-hidden="true">?</div><div class="draw-copy"><h2>똥카드 한 장 뽑기</h2><p>별 25개 · 공용 덱에 ${remaining}장 남았어요.</p><p>남은 카드마다 나올 확률은 같아요.<br>누군가 가진 숫자·무늬는 다시 나오지 않아요.</p></div>${btn('★ 25 · 한 장 뽑기','draw','primary',E.available(state,role)<25||!remaining)}${!remaining?'<p class="notice">공용 똥덱이 비었어요. 카드가 돌아오면 다시 뽑을 수 있어요.</p>':E.available(state,role)<25?'<p class="notice">사용할 수 있는 별이 25개 필요해요.</p>':''}</div>`;}

function fusePage(){const target=fuseTier==='poop'?'silver':'gold',need=fuseTier==='poop'?5:3;selected=selected.filter(id=>E.owned(state,role).some(c=>c.id===id&&c.tier===fuseTier));const materials=E.owned(state,role).filter(c=>c.tier===fuseTier).sort((a,b)=>a.expires-b.expires);return hero('더 큰 소원 만들기','합칠 카드를 한 장씩 골라주세요.')+`<p class="notice">똥카드 5장은 어떤 족보든 승급할 수 있어요. 하이카드는 랜덤 은카드, 원페어 이상은 공개 후보 중 1장을 골라요.</p><div class="tabs fuse-tabs" role="group" aria-label="만들 카드 등급">${btn('<span>은카드 만들기</span><small>똥카드 5장 → 은카드 1장</small>','tier:poop',fuseTier==='poop'?'active':'')}${btn('<span>금카드 만들기</span><small>은카드 3장 → 금카드 1장</small>','tier:silver',fuseTier==='silver'?'active':'')}</div><div class="fusion-tray"><div class="fusion-slots" aria-label="${need}장 중 ${selected.length}장 선택">${Array.from({length:need},(_,i)=>`<span class="fusion-slot ${selected[i]?'filled':''}" aria-hidden="true">${selected[i]?esc(state.cards.find(c=>c.id===selected[i])?.emoji):'＋'}</span>`).join('')}</div><div class="fusion-controls"><div class="fusion-confirm-row"><b class="progress" role="status" aria-live="polite">${selected.length} / ${need}장 선택</b>${fuseTier==='poop'&&selected.length===5?`<strong class="poker-hand" role="status">${pokerHand(selected.map(id=>state.cards.find(c=>c.id===id)))}</strong>`:''}${btn(icon('fuse')+'합성 확인','fuseConfirm','primary',selected.length!==need)}</div>${btn('결과 후보 보기',`pool:${target}`,'text-button',!RESULT_POOL_PREVIEW_ENABLED)}${fuseTier==='poop'&&materials.length>=5?btn('힌트 보기','pokerHint','secondary'):''}</div></div><div class="grid inventory fusion-grid">${materials.map(c=>template(c,'',`select:${c.id}`,{selectable:true,selected:selected.includes(c.id),disabled:!selected.includes(c.id)&&selected.length>=need})).join('')}</div>${!materials.length?'<div class="empty compact"><h2>먼저 재료 카드를 모아주세요</h2><p>시장에서 카드를 얻을 수 있어요.</p>'+btn('시장 구경하기','nav:market','secondary')+'</div>':''}`;}
function auctionPage(){const a=state.auction;let main;if(!a)main='<div class="empty"><h2>지금은 열린 경매가 없어요</h2><p>부모님이 경매를 열면 참여할 수 있어요.</p></div>';else {const bid=a.bids[role];main=`<div class="split section">${flipCard(a.card,'auction-'+a.id,`<div class="back-cost"><span>최소 입찰</span><b>★ ${a.minimum}</b></div><p class="back-help">낙찰되면 내가 입찰한 별을 내요.<br>혜택을 받을 때 부모님께 QR을 보여주세요.</p><small>한 번 쓸 수 있어요</small>`)}<div class="panel"><h2>${bid!==undefined?'입찰했어요':'얼마를 걸까요?'}</h2><p>최소 입찰가 <b>★ ${a.minimum}</b><br>마감 <b>${datetime(a.ends)}</b><br>동점 우선권 <b>${E.NAMES[state.priority]}</b></p>${bid!==undefined?`<div class="notice">별 ${bid}개로 입찰했어요.<br>마감까지 별과 카드 자리를 확보해 두었어요.</div>`:`${amount('bidAmount')}<div class="section">${btn('입찰 확인하기','bidConfirm','primary')}</div>`}</div></div>`;}return hero('비밀 경매','내가 정한 가격으로 한 번만 입찰해요.')+main+`<section class="section"><h2>최근 경매 결과</h2>${state.history.slice(0,5).map(h=>`<div class="panel" style="margin-bottom:10px"><h3>${esc(h.card.name)}</h3><p>멜로디: ${h.bids.melody===undefined?'참여하지 않음':`별 ${h.bids.melody}개`} · 아름이: ${h.bids.areum===undefined?'참여하지 않음':`별 ${h.bids.areum}개`}</p><b>${h.winner?`${E.NAMES[h.winner]} 낙찰`:'유찰'}</b>${h.tie?' · 동점 우선권 적용':''}</div>`).join('')||'<p class="muted">아직 종료된 경매가 없어요.</p>'}</section>`;}
const awardReasons=[['diary','📔','일기','약속한 시간 동안 일기 쓰기'],['math','🔢','수학','수학 한 페이지'],['reading','📖','국어','독해하기'],['cleaning','🧹','청소','청소하기'],['custom','✏️','직접 입력','']];
const emptyAward=()=>({amount:'',choice:'',custom:'',taskId:'',request:null});
const awardDrafts={melody:emptyAward(),areum:emptyAward()};let awardSending='';
function awardReason(d){return d.choice==='custom'?d.custom.trim():awardReasons.find(r=>r[0]===d.choice)?.[3]||'';}
function awardAlreadyDone(p,category,taskId=''){
 const matches=(state.weeklyStatus?.[p]?.days.find(day=>day.today)?.tasks||[]).filter(t=>t.category===category&&(category!=='custom'||t.id===taskId));
 return matches.length>0&&matches.every(t=>t.done);
}
function awardReady(d,p){const n=Number(d.amount);return !awardAlreadyDone(p,d.choice,d.taskId)&&Number.isSafeInteger(n)&&n>0&&!!awardReason(d)&&awardReason(d).length<=200;}
function updateAwardInput(input){const p=input.id.startsWith('award-reason-')?input.id.slice(13):input.id.startsWith('award-')?input.id.slice(6):'';const d=awardDrafts[p];if(!d)return;if(input.id.startsWith('award-reason-'))d.custom=input.value;else d.amount=input.value;d.request=null;const button=document.querySelector(`[data-act="award:${p}"]`);if(button)button.disabled=!!awardSending||!awardReady(d,p);}
function awardScheduleLink(p,d){
 const tasks=state.weeklyStatus?.[p]?.days.find(day=>day.today)?.tasks||[];
 if(d.choice==='custom')return `<label for="awardTask-${p}">함께 완료할 오늘 할 일</label><select id="awardTask-${p}" data-award-task="${p}"><option value="">연결하지 않고 별만 지급</option>${tasks.filter(t=>t.category==='custom').map(t=>`<option value="${t.id}" ${t.id===d.taskId?'selected':''} ${t.done?'disabled':''}>${esc(t.label)}${t.done?' · 완료됨':''}</option>`).join('')}</select>`;
 if(!d.choice)return '';
 if(awardAlreadyDone(p,d.choice,d.taskId))return '<p class="award-schedule-link">✓ 오늘 이미 완료했어요. 다시 지급할 수 없어요.</p>';
 const matches=tasks.filter(t=>t.category===d.choice);
 return `<p class="award-schedule-link">${matches.length?'오늘 일정 자동 완료: '+matches.map(t=>esc(t.label)+(t.done?' (완료됨)':'')).join(', '):'오늘 연결된 할 일이 없어 별만 지급해요.'}</p>`;
}
function awardTodayProgress(p){
 const day=state.weeklyStatus?.[p]?.days.find(d=>d.today);
 if(!day)return '';
 const total=day.tasks.length,done=day.tasks.filter(t=>t.done).length,all=total>0&&done===total;
 return `<section class="award-today ${all?'all-done':''}" aria-label="${E.NAMES[p]} 오늘 할 일"><div class="award-today-heading"><h3>오늘 할 일</h3><span class="award-today-count">${total?`${done} / ${total} 완료`:'쉬는 날'}</span></div>${total?`<div class="award-today-progress" role="progressbar" aria-label="${E.NAMES[p]} 오늘 완료 개수" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span style="width:${done/total*100}%"></span></div><ul class="award-today-list">${day.tasks.map(t=>{const content=`<span class="award-today-mark" aria-hidden="true">${t.done?'✓':'○'}</span><span class="award-today-label">${esc(t.label)}</span><span class="award-today-status">${t.done?'완료':'남음'}</span>`;return `<li class="${t.done?'done':'remaining'}">${t.done?`${content}<button class="award-undo" data-act="todayUndo:${p}:${t.id}" aria-label="${E.NAMES[p]} ${esc(t.label)} 완료 취소">취소</button>`:`<button class="award-task-shortcut" data-act="todayAward:${p}:${t.id}" aria-label="${E.NAMES[p]} ${esc(t.label)} ${t.category==='quote'?'복습 확인':'별 지급 선택'}" ${awardSending?'disabled':''}>${content}</button>`}</li>`;}).join('')}</ul><p class="award-today-summary">${all?'👑 오늘 할 일을 모두 해냈어요!':`아직 ${total-done}개 남았어요.`}</p>`:'<p class="award-today-empty">오늘은 등록된 할 일이 없어요.</p>'}</section>`;
}
function confirmTodayUndo(player,taskId){
 const task=state.weeklyStatus?.[player]?.days.find(d=>d.today)?.tasks.find(t=>t.id===taskId),info=state.weeklyUndo?.[player]?.[taskId];
 if(!task?.done||!info)throw Error('완료 상태가 바뀌었어요. 다시 확인해 주세요.');
 modal(`<h2>${E.NAMES[player]} · 완료 취소</h2><p><b>${esc(task.label)}</b></p>${info.token?`<p>지급한 별 <b>${info.amount}개</b>${info.bonus?' + 하루 완료 보너스 <b>1개</b>':''}, 총 <b>${info.total}개</b>를 회수합니다.</p><p>${info.labels.map(esc).join(', ')} 항목이 다시 미완료로 돌아갑니다.</p>${info.quoteCount?`<p>오늘 확인한 명언 복습 ${info.quoteCount}건도 되돌려 다시 확인할 수 있어요.</p>`:''}`:''}${info.error?`<p class="notice">${esc(info.error)}</p>`:''}<div class="actions">${btn('돌아가기','close')}${info.canUndo?btn('별 회수하고 완료 취소',`weeklyUndo:${player}:${taskId}`,'danger'):''}</div>`);
 $('#modal').dataset.undoToken=info.token||'';
}
function selectTodayAward(player,taskId){
 if(!adminOK()||awardSending||busy)return;
 const task=state.weeklyStatus?.[player]?.days.find(d=>d.today)?.tasks.find(t=>t.id===taskId);
 if(!task||task.done){toast('이미 완료했거나 일정이 바뀌었어요.');return;}
 if(task.category==='quote'){
  const rows=(state.quoteStatus?.[player]?.items||[]).filter(r=>r.due&&!r.complete).sort((a,b)=>Number(!!b.pending)-Number(!!a.pending)||a.dueDay-b.dueDay||a.startDay-b.startDay);
  if(rows.length){quoteReview(player,rows[0].id);return;}
  adminTab='quotes';render();toast(`${E.NAMES[player]}의 오늘 확인할 명언 복습이 없어요.`);return;
 }
 const d=awardDrafts[player];if(!d)return;
 d.amount='1';
 d.choice=awardReasons.some(r=>r[0]===task.category)?task.category:'custom';d.taskId=d.choice==='custom'?task.id:'';
 if(d.choice==='custom')d.custom=task.label;
 d.request=null;render();$('#award-'+player)?.focus();
}
function historyForPlayer(p){
 const today=state.weeklyStatus?.[p]?.days.find(d=>d.today)?.date;
 return awardHistoryHTML(state.logs||[],p,E.NAMES[p],historyDates[p]||today,today,historyWeeks[p]||today,historyModes[p],historyMonths[p]||today);
}
function changeHistoryDate(p,value){
 const today=state.weeklyStatus?.[p]?.days.find(d=>d.today)?.date;
 if(!Object.hasOwn(historyDates,p))return;
 if(value&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value||value>today)){toast('오늘 또는 지난 날짜를 선택해 주세요.');value=historyDates[p];}
 historyDates[p]=value===today?'':value;
 const section=document.querySelector(`[data-history-player="${p}"]`);
 if(section)section.outerHTML=historyForPlayer(p);
}
function swapHistoryForPlayer(p){
 const today=state.weeklyStatus?.[p]?.days.find(d=>d.today)?.date;
 return cardSwapHistoryHTML(state.logs||[],state.cards||[],p,E.NAMES[p],swapHistoryDates[p]||today,today);
}
function changeSwapHistoryDate(p,value){
 if(!Object.hasOwn(swapHistoryDates,p))return;
 const today=state.weeklyStatus?.[p]?.days.find(d=>d.today)?.date;
 if(value&&(!historyWeekStart(value)||value>today)){toast('오늘 또는 지난 날짜를 선택해 주세요.');value=swapHistoryDates[p];}
 swapHistoryDates[p]=value===today?'':value;
 const section=document.querySelector(`[data-swap-history-player="${p}"]`);
 if(section)section.outerHTML=swapHistoryForPlayer(p);
}
function awardPanel(p){const d=awardDrafts[p];return `<section class="panel award-panel" aria-label="${E.NAMES[p]} 별 지급"><div class="award-kid"><img src="/star-manager-web/art/profiles/${p}-ghibli-v2.jpeg" alt="" width="56" height="56"><div><h2>${E.NAMES[p]}</h2><p>전체 별 ★ ${state.players[p].stars}</p></div></div>${awardTodayProgress(p)}<fieldset ${awardSending?'disabled':''}><label for="award-${p}">별 몇 개?</label>${amount('award-'+p,d.amount)}<div class="award-reasons" role="group" aria-label="별을 주는 이유">${awardReasons.map(([key,emoji,label])=>{const done=awardAlreadyDone(p,key);return `<button class="award-reason ${d.choice===key?'selected':''} ${done?'award-completed':''}" data-act="awardReason:${p}:${key}" aria-pressed="${d.choice===key}" ${done?'disabled':''}><span aria-hidden="true">${emoji}</span><span>${label}</span>${done?'<small>✓ 완료</small>':''}</button>`;}).join('')}</div>${d.choice==='custom'?field('별을 주는 이유','award-reason-'+p,'text',d.custom,'maxlength="200" placeholder="어떤 일을 잘했나요?"'):''}${awardScheduleLink(p,d)}<button class="primary award-submit" data-act="award:${p}" ${!awardReady(d,p)||awardSending?'disabled':''}>${awardSending===p?'별을 보내는 중…':'노력 확인 · 별 주기'}</button></fieldset>${historyForPlayer(p)}${swapHistoryForPlayer(p)}</section>`;}
const missionLevelName=n=>MISSION_LEVELS.find(l=>l.level===n)?.name||'난이도 확인 중';
function missionProgressText(r){if(!r)return '아직 시작 전';if(r.stage==='complete')return '미션 완료';return `${r.totalMastered}/${r.total||5}문제 해결 · 이어서 가능`;}
function missionStats(p){const r=state.missionReports?.[p]||{},status=state.missionStatus?.[p],level=status?.run?.stage==='playing'?status.run.currentLevel:status?.level;return `<div class="mission-parent-stats"><div><small>첫 답 정답률</small><strong>${r.accuracy===null||r.accuracy===undefined?'—':r.accuracy+'%'}</strong><span>${r.answered?`${r.answered}문제 중 ${r.correct}개 정답`:'아직 푼 문제가 없어요'}</span></div><div><small>현재 난이도</small><strong>${level||1}<em>단계</em></strong><span>${esc(missionLevelName(level))}</span><span>${status?.mode==='manual'?'부모가 고정':'자동 조절'}${status?.level!==level?` · 다음 새 문제 ${status.level}단계`:''}</span></div></div>`;}
function adminMissionPanel(){return `<section class="panel section"><h2>수학 미션</h2><p class="notice">달걀 선생님 · ${state.tutorAI?.configured?'AI 문제 생성 연결됨 · 실패 시 준비된 문제 사용':'기본 안내 모드 · 실시간 AI는 API 연결 후 사용'}<br><small>문제와 보기는 AI가 만든 한국어 목소리로 읽어줘요.</small></p><p class="muted">정답률은 저장된 최근 300문제의 첫 답으로 계산해요.</p><div class="mission-parent-grid">${Object.keys(E.NAMES).map(p=>{const r=state.missionStatus?.[p]?.run,report=state.missionReports?.[p];return `<article class="mission-parent-card" aria-label="${E.NAMES[p]} 수학 학습"><div class="mission-parent-child"><img src="/star-manager-web/art/profiles/${p}-ghibli-v2.jpeg" alt="" width="48" height="48"><div><h3>${E.NAMES[p]}</h3><small>${missionProgressText(r)}</small></div></div><div class="mission-parent-progress" role="progressbar" aria-label="미션 진행" aria-valuemin="0" aria-valuemax="${r?.total||5}" aria-valuenow="${r?.totalMastered||0}"><span style="width:${(r?.totalMastered||0)/(r?.total||5)*100}%"></span></div>${missionStats(p)}${report?.concept?`<div class="concept-parent-report"><b>10 만들기 · ${esc(report.concept.verdict)}</b><p>이해 확인: 혼자서 ${report.concept.independent}개 · 도움받아 ${report.concept.assisted}개 / ${report.concept.checks}문제</p><p>${esc(report.concept.next)}</p><small>이번 수업에서 관찰한 결과예요. AI 생성 ${report.concept.generated}문제 / 준비된 ${report.concept.completed}문제 완료</small></div>`:''}<p class="mission-parent-tip">${esc(report?.tip.message||'문제를 풀면 연습할 부분을 알려줄게요.')}</p><div class="mission-parent-actions">${btn('틀린 문제 보기',`missionReport:${p}`,'small')}${btn('난이도 조절',`missionSettings:${p}`,'small secondary')}${btn('미션 다시 열기',`missionReset:${p}`,'small',!r)}</div></article>`;}).join('')}</div><small>미션을 다시 열어주면 완료할 때마다 별 1개를 받아요.</small></section>`;}
function showMissionReport(p,requestedPage=0){
 const report=state.missionReports?.[p];if(!report)return;
 const total=Math.max(1,Math.ceil(report.wrong.length/5)),page=Math.max(0,Math.min(total-1,requestedPage)),rows=report.wrong.slice(page*5,page*5+5);
 modal(`<div class="mission-report"><h2>${E.NAMES[p]} · 학습 보기</h2>${missionStats(p)}<p class="muted">저장된 최근 ${report.answered}문제 · 첫 답 기준</p><div class="mission-report-tip"><b>${esc(report.tip.message)}</b>${report.tip.hint?`<p>${esc(report.tip.hint)}</p>`:''}${report.patterns.length?`<small>${esc(report.patterns[0].name)}: ${report.patterns[0].total}문제 중 ${report.patterns[0].wrong}문제에서 첫 답을 틀렸어요.</small>`:''}</div>${report.frequent.length?`<h3>자주 헷갈린 문제</h3><div class="mission-frequent">${report.frequent.map(q=>`<span><b>${esc(q.prompt||`${q.a} − ${q.b}`)}</b><small>정답: ${esc(q.answer??q.a-q.b)}</small><small>틀린 답 ${q.wrongCount}번</small></span>`).join('')}</div>`:''}<h3>틀렸던 문제 <small>${report.wrong.length}개</small></h3>${rows.length?`<ol class="mission-wrong-list" start="${page*5+1}">${rows.map(q=>`<li><div><b>${esc(q.prompt||`${q.a} − ${q.b}`)}</b><small>정답: ${esc(q.answer??q.a-q.b)}</small><small>처음 고른 답: ${q.firstAnswer===null?'이전 기록 없음':esc(q.firstAnswer)} · 틀린 답 ${q.wrongCount}번</small></div><span class="${q.mastered?'mastered':''}">${q.mastered?'다시 맞혔어요':'다시 연습해요'}</span></li>`).join('')}</ol>`:'<p class="muted">아직 틀린 문제가 없어요.</p>'}${total>1?`<nav class="history-pagination" aria-label="틀린 문제 페이지">${btn('이전',`missionReport:${p}:${page-1}`,'small',page===0)}<span role="status">${page+1} / ${total}</span>${btn('다음',`missionReport:${p}:${page+1}`,'small',page===total-1)}</nav>`:''}<div class="actions">${btn('난이도 조절',`missionSettings:${p}`,'secondary')}${btn('닫기','close')}</div></div>`);
}
function showMissionSettings(p){
 const status=state.missionStatus?.[p];if(!status)return;
 modal(`<h2>${E.NAMES[p]} · 난이도 조절</h2><label for="missionMode">조절 방법</label><select id="missionMode"><option value="manual" ${status.mode==='manual'?'selected':''}>부모가 정한 난이도 유지</option><option value="auto" ${status.mode!=='manual'?'selected':''}>모두 혼자 맞히면 다음 단계</option></select><label for="missionLevel">문제 난이도</label><select id="missionLevel">${stageOptions(status.level)}</select><p class="notice">적용하면 현재 문제부터 선택한 단계로 바로 바뀌어요.<br>맞힌 문제와 오답 기록은 보관해요. 완료한 미션은 새 5문제로 열려요.</p><div class="actions">${btn('돌아가기','close')}${btn('적용하기',`missionSettingsSave:${p}:${status.settingsVersion||0}`,'primary')}</div>`);
}
function adminHome(){return `<h1>부모 관리</h1><p class="lead">별은 미리 약속한 현실 활동에 노력했을 때 지급해요. 예: 일기 15분 쓰기는 길이·완성도와 관계없이 약속한 만큼 노력하면 완료예요.</p><div class="split">${Object.keys(E.NAMES).map(p=>awardPanel(p)).join('')}</div><div class="panel section"><div class="row"><h2>경매</h2>${state.auction?btn('경매 취소','cancelAuction','danger'):btn('경매 열기','newAuction','primary')}</div>${state.auction?`<p>${esc(state.auction.card.name)} · 최소 별 ${state.auction.minimum}개 · ${datetime(state.auction.ends)} 마감</p><small>입찰 금액과 참여 여부는 마감 전 공개되지 않아요.</small>`:'<p class="muted">진행 중인 경매가 없어요.</p>'}</div><div class="panel section"><h2>이번 주 시장</h2><div class="tablewrap"><table><thead><tr><th>카드</th><th>가격</th><th>상태</th></tr></thead><tbody>${state.market.map(m=>`<tr><td>${esc(m.card.name)}</td><td>★ ${m.price}</td><td>${m.buyer?E.NAMES[m.buyer]+' 구매':'판매 중'}</td></tr>`).join('')}</tbody></table></div><p class="muted">다음 교체 ${datetime(state.nextRefresh)}</p></div>`;}
function adminCatalog(){const rows=filteredPoop();return `<h1>카드 관리</h1><section class="poop-admin"><h2>똥카드 52장</h2><p>번호를 누르면 효과와 검수 상태를 수정할 수 있어요. 저장하면 아이들이 가진 카드에도 반영돼요.</p><div class="poop-review-filters" role="group" aria-label="똥카드 검수 상태 필터">${poopFilters.map(([key,label])=>`<button data-act="poopFilter:${key}" aria-pressed="${poopFilter===key}" class="${poopFilter===key?'primary':''}">${label} <b>${filteredPoop(key).length}</b></button>`).join('')}</div><div class="row poop-review-toolbar"><p role="status">${esc(poopFilters.find(([key])=>key===poopFilter)[1])} · ${rows.length}장</p>${btn('하나씩 확인','poopReviewStart','',!rows.length)}</div>${rows.length?'':'<p class="notice">'+(poopFilter==='unfinished'?'검수 미완료 카드가 없어요. 52장 모두 확정됐어요!':'이 상태의 카드가 없어요.')+'</p>'}<div class="poop-admin-suits">${['♥','♦','♣','♠'].filter(suit=>rows.some(c=>c.suit===suit)).map(suit=>`<section><h3 class="${['♥','♦'].includes(suit)?'red':'black'}">${suit} ${({'♥':'하트','♦':'다이아','♣':'클로버','♠':'스페이드'})[suit]}</h3><div class="poop-admin-list">${rows.filter(r=>r.suit===suit).map(row=>{const c=poopDefinition(state,suit,row.rank),owner=state.cards.find(c=>c.tier==='poop'&&c.status==='active'&&c.poker.suit===suit&&c.poker.rank===row.rank)?.owner;return `<button class="poop-admin-card" data-act="poopEdit:${suit}:${row.rank}" aria-label="${suit}${row.rank} 편집"><span class="poop-admin-top"><b class="${['♥','♦'].includes(suit)?'red':'black'}">${suit}${row.rank}</b><span class="review-status">${esc(c.reviewStatus)}</span></span><span class="poop-admin-effect">${esc(c.effect)}</span><small>${owner?E.NAMES[owner]+' 보유':'공용 덱'}</small></button>`;}).join('')}</div></section>`).join('')}</div></section><div class="row section"><h2>은·금카드</h2>${btn('새 카드 만들기','edit:new')}</div><p class="muted">은·금카드의 종류별 수정은 새 공급부터 적용돼요.</p>${['silver','gold'].map(t=>`<h3>${E.TIERS[t]}</h3><div class="grid">${state.catalog.filter(c=>c.tier===t).map(c=>template(c,`<small>자동 공급 ${c.enabled?'켜짐':'꺼짐'}</small>${btn('편집',`edit:${c.id}`)}`)).join('')}</div>`).join('')}`;}
function editPoop(suit,rank){const c=poopDefinition(state,suit,rank);if(!c)throw Error('카드를 찾을 수 없어요.');modal(`<h2>${esc(suit+rank)} 똥카드 편집</h2>${poopReviewQueue.length?`<p class="muted">선택한 목록에서 ${poopReviewQueue.length}장 남았어요.</p>`:''}<label for="poopEffect">효과 문구</label><textarea id="poopEffect" maxlength="1000">${esc(c.effect)}</textarea><label for="poopReview">검수 상태</label><select id="poopReview">${REVIEW_STATUSES.map(status=>`<option ${c.reviewStatus===status?'selected':''}>${status}</option>`).join('')}</select><p class="notice">이미 아이들이 가진 카드와 교체 후보에도 반영돼요. 이전 소원 사용 기록은 그대로 보존돼요.</p><div class="actions">${btn('취소','close')}${btn('저장',`poopSave:${suit}:${rank}:${c.version||0}`,poopReviewQueue.length?'':'primary')}${poopReviewQueue.length?btn(poopReviewQueue.length===1?'확정하고 마치기':'확정하고 다음 카드',`poopReviewNext:${suit}:${rank}:${c.version||0}`,'primary'):''}</div>`);}

function adminInventory(){const cards=state.cards.filter(c=>c.owner===adminKid);return `<h1>아이별 보관함</h1><div class="tabs">${Object.keys(E.NAMES).map(p=>btn(E.NAMES[p],`adminKid:${p}`,adminKid===p?'active':'')).join('')}</div><p class="muted">현재 ${new Set(E.owned(state,adminKid).map(c=>c.type)).size}종 · 경매 예약 ${E.reservations(state,adminKid).length}장</p><div class="grid">${cards.filter(c=>c.status==='active').map(c=>template(c,`<small>${date(c.expires)}까지</small>${btn('관리',`manage:${c.id}`)}`)).join('')||'<p>아직 보유한 카드가 없어요.</p>'}</div><details class="panel section"><summary>만료·사용 기록</summary>${cards.filter(c=>['used','expired'].includes(c.status)).map(c=>`<div class="log row"><span>${esc(c.name)} · ${c.status==='used'?'사용 완료':'만료'}</span>${btn('복구',`restore:${c.id}`,'small')}</div>`).join('')||'<p>기록이 없어요.</p>'}</details>`;}
let logPage=0,logFilter="";
function adminLogs(){return `<h1>운영 기록</h1><p class="lead">최근 기록부터 표시합니다. 진행 중인 입찰은 표시하지 않습니다.</p><label for="logFilter">종류</label><select id="logFilter"><option value="" ${logFilter===''?'selected':''}>전체</option><option value="star" ${logFilter==='star'?'selected':''}>별</option><option value="card" ${logFilter==='card'?'selected':''}>카드</option><option value="auction" ${logFilter==='auction'?'selected':''}>경매</option><option value="admin" ${logFilter==='admin'?'selected':''}>관리 변경</option></select><div id="logList">${logsHTML(logFilter)}</div><div class="panel section"><h2>별 오지급 정정</h2><label for="corKid">아이</label><select id="corKid"><option value="melody">멜로디</option><option value="areum">아름이</option></select>${field('회수할 별','corAmount','number')}${field('정정 사유','corReason')}${btn('정정 내용 확인','correct','danger')}</div>`;}
function logsHTML(filter){const entries=state.logs.filter(l=>!filter||l.kind===filter),total=Math.max(1,Math.ceil(entries.length/15));logPage=Math.max(0,Math.min(logPage,total-1));const rows=entries.slice(logPage*15,(logPage+1)*15).map(l=>`<details class="log"><summary><span class="log-actor">${["아빠","엄마","멜로디","아름이"].includes(l.actor)?historySenderPhoto(l.actor):`<span class="log-system">${esc(l.actor)}</span>`}</span><span class="log-copy"><small>${datetime(l.at)}</small>${esc(l.text)}</span></summary><pre style="white-space:pre-wrap;font-size:12px">${esc(JSON.stringify(l.data,null,2))}</pre></details>`).join('');return (rows||'<p class="muted">아직 기록이 없어요.</p>')+(total>1?`<nav class="history-pagination" aria-label="운영 기록 페이지">${btn('이전',`logPage:${logPage-1}`,'small',logPage===0)}<span id="logPageStatus" role="status" tabindex="-1">${logPage+1} / ${total}</span>${btn('다음',`logPage:${logPage+1}`,'small',logPage===total-1)}</nav>`:'');}
function adminSettings(){return `<h1>가족 기기 연결</h1><p class="lead">부모 휴대폰과 아이패드는 같은 서버 데이터를 사용합니다.</p><div class="panel"><h2>새 기기 연결</h2><p>일회용 QR을 새 기기로 스캔한 뒤, 이 화면에서 연결을 승인해 주세요.</p><label for="inviteRole">연결할 사람</label><select id="inviteRole"><option value="melody">멜로디</option><option value="areum">아름이</option><option value="mom">엄마</option><option value="dad">아빠</option></select>${field('기기 이름','inviteName','text','','placeholder="예: 멜로디 아이패드"')}${btn('일회용 연결 QR 만들기','invite','primary')}</div><div class="panel section"><h2>등록·승인 대기 기기</h2>${devices.map(d=>`<div class="log"><div class="row"><span><b>${esc(d.name)}</b><br><small>${({mom:'엄마',dad:'아빠',...E.NAMES})[d.role]} · ${d.status==='pending'?'승인 대기':'연결됨'}${d.id===session.id?' · 이 기기':''}</small></span><div>${d.status==='pending'?btn('연결 승인',`approve:${d.id}`,'primary'):''}${btn('접근 해제',`revoke:${d.id}`,'danger small')}</div></div></div>`).join('')||'<p>기기 목록을 불러오는 중입니다.</p>'}</div><div class="panel section"><h2>부모 화면 잠금</h2><p>공용 PIN 1986 · 5분 미사용 시 잠금<br>카드 사용 완료 시마다 서버에서 PIN을 확인합니다.</p>${btn('지금 잠그기','lock')}${btn('이 기기 연결 해제','logout','danger')}</div><div class="panel section"><h2>서버 데이터</h2><p>별과 카드는 기기를 바꾸어도 유지됩니다. 열린 화면은 약 3초마다 최신 상태를 확인합니다.</p>${btn('데이터 내려받기','export')}${!state.started&&localStorage.getItem(KEY)?btn('이 브라우저의 기존 데이터 가져오기','importLegacy'):''}</div>`;}
function connectionScreen(){
 if(connection==='loading')return '<div class="empty"><h1>가족 데이터를 불러오고 있어요</h1></div>';
 if(connection==='error')return `<div class="empty"><h1>연결을 확인해 주세요</h1><p>인터넷 연결 후 다시 시도해 주세요.</p>${btn('다시 연결','retry','primary')}</div>`;
 if(connection==='pending')return `<div class="empty"><h1>부모님의 승인을 기다려요</h1><p>${esc(session?.name)}<br>부모 휴대폰의 설정에서 이 기기를 승인하면 자동으로 열립니다.</p></div>`;
 if(enrollToken)return `<div class="panel"><h1>이 기기를 가족에 연결하기</h1><p>연결 요청을 보내면 부모님이 승인할 수 있어요.</p>${field('이 기기의 이름','joinName','text','','placeholder="예: 멜로디 아이패드"')}${btn('연결 요청 보내기','join','primary')}</div>`;
 if(onPages)return `<div class="empty"><div class="symbol">🌱</div><h1>우리 가족의 소원카드</h1><p>아이 기기는 부모가 만든 연결 QR을 스캔해 주세요.</p><div class="panel section"><h2>부모 기기 연결</h2><p>기존 서버에서 부모 인증 후 이 화면으로 돌아와요.<br>이미 등록한 기기도 그대로 연결할 수 있어요.</p>${pagesError()?`<p role="alert">${esc(pagesError())}</p>`:''}${btn('부모 인증하고 연결하기','pagesStart','primary')}</div></div>`;
 return `<div class="empty"><div class="symbol">🌱</div><h1>우리 가족의 소원카드</h1><p>아이패드는 부모 휴대폰에서 만든<br>일회용 연결 QR을 스캔해 주세요.</p><div class="panel section"><h2>처음 연결하는 부모님</h2><p>사이트 소유자의 ChatGPT 계정으로 로그인한 뒤<br>부모 휴대폰을 등록하세요.</p><a href="/signin-with-chatgpt?return_to=%2F" target="_top">ChatGPT로 부모 인증하기</a><label for="bootstrapRole">부모 역할</label><select id="bootstrapRole"><option value="dad">아빠</option><option value="mom">엄마</option></select>${field('휴대폰 이름','bootstrapName','text','부모 휴대폰')}${field('부모 PIN','bootstrapPin','password','','maxlength="4" inputmode="numeric" enterkeyhint="done"')}<div class="section">${btn('인증한 부모 휴대폰 등록','bootstrap','primary')}</div></div></div>`;
}
function render(){if(page==='mission'){page='cards';tutorVoice.stop();clearMissionFeedback();}if(eggDrag){needsRender=true;return;}if(rewardFlying||starSpending){needsRender=true;return;}const parent=isParent();const nav=parent?['home','quotes','schedule','inventory','catalog','logs','settings']:['cards','adventure','market',...(state.auction||state.history.length?['auction']:[])];document.body.classList.toggle('kid-mode',!parent&&connection==='linked');document.body.classList.toggle('parent-mode',parent);document.body.classList.toggle('mission-mode',!parent&&page==='mission');const labels={adventure:'별빛 모험',schedule:'주간 일정',quotes:'명언',home:'별 지급',inventory:'보관함',catalog:'카드 관리',logs:'운영 기록',settings:'설정',cards:'내 카드',market:'시장',auction:'경매'};let body='';if(connection!=='linked')body=connectionScreen();else if(parent&&!adminOK())body=`<div class="empty"><h1>부모 화면이 잠겼어요</h1><p>PIN을 입력하면 가족 데이터와 카드 사용 승인을 확인할 수 있어요.</p>${btn('PIN으로 열기','unlock','primary')}</div>`;else if(state.migrationBlocked)body=`<section class="panel"><h1>공용 덱 이전 확인이 필요해요</h1><p>${esc(state.migrationBlocked.message)}</p><p>별 잔액과 소원 기록, 기존 카드를 변경하지 않았어요.</p></section>`;else if(!state.started&&(!parent||adminTab==='home'))body=`<div class="empty"><div class="symbol">🌱</div><h1>우리의 소원카드</h1><p>조금씩 모으는 별, 함께 자라는 소원.<br>두 아이 모두 별 0개와 카드 0장으로 시작해요.</p>${parent?(adminOK()?btn('게임 시작','start','primary'):btn('부모 PIN 입력','unlock','primary')):'<p>부모님이 게임을 시작하면 시장이 열려요.</p>'}<p class="muted">첫 시장은 바로 열리고, 토요일 오전 9시에 교체돼요.</p></div>`;else if(parent){body=adminOK()?({home:adminHome,schedule:()=>weeklyPlanHTML(state.weeklyPlans,adminKid,E.NAMES),quotes:parentQuotes,inventory:adminInventory,catalog:adminCatalog,logs:adminLogs,settings:adminSettings}[adminTab]||adminHome)():`<div class="empty"><div class="symbol">🔒</div><h1>부모 화면이 잠겼어요</h1><p>등록된 부모 기기에서 PIN으로 열어주세요.</p>${btn('PIN으로 열기','unlock','primary')}</div>`;}else body=({cards:kidCards,market:marketPage,fuse:fusePage,mission:missionPage,auction:auctionPage}[page]||kidCards)();
const childLinked=!parent&&connection==='linked';
$('#app').innerHTML=`${!childLinked?`<div class="connection-note ${networkOK?'online':'offline'}" id="connectionStatus" role="status">${networkOK?'연결됨':'연결이 끊겼어요 · 다시 연결 중'}</div>`:''}<main class="shell">${childLinked?`<header class="kid-header"><div class="kid-profile"><button class="kid-profile-photo ${role}" data-act="profilePhoto" aria-label="${esc(E.NAMES[role])} 프로필 사진 크게 보기"><img src="/star-manager-web/art/profiles/${role}-ghibli-v2.jpeg" alt="" width="512" height="512" decoding="async"></button><h1>${esc(E.NAMES[role])}</h1></div>${quoteBanner(state.quotes)}<button class="kid-stars" data-act="starHistory" aria-label="쓸 수 있는 별 ${E.available(state,role)}개 · 받은 기록 보기"><span aria-hidden="true">${icon('star')}</span><strong aria-hidden="true">${shownStars()}</strong>${rewardDelta&&rewardDelta.until>Date.now()?`<span class="star-plus ${rewardDelta.amount<0?'star-minus':''}" aria-hidden="true">${rewardDelta.amount>0?'+':''}${rewardDelta.amount}</span>`:''}</button></header>`:`<header class="topbar"><a class="small" href="/star-manager-web/adventure.html?demo=1">별빛 모험 연습</a><div class="brand"><span class="brand-mark" aria-hidden="true">${icon('cards')}</span><span>우리의 소원카드</span></div><div class="roles"><span class="profile-badge ${role}">${parent?`<button class="kid-profile-photo parent-profile-photo ${role}" data-act="profilePhoto" aria-label="${role==='mom'?'엄마':'아빠'} 프로필 사진 크게 보기"><img src="/star-manager-web/art/profiles/${role}-ghibli-v2.jpeg" alt="" width="512" height="512"></button>`:`<span class="avatar" aria-hidden="true">${role==='melody'?'🌷':role==='areum'?'🍀':'✦'}</span>`}${esc(childLinked?E.NAMES[role]:session?.name||'가족 연결')}</span>${parent&&adminOK()?btn('잠그기','lock','small'):''}</div></header>`}${pagesConnectionPending()&&connection==='linked'&&(!parent||adminOK())?`<section class="panel"><h2>Pages 화면으로 연결</h2><p>이 기기와 같은 역할로 별관리 화면을 연결합니다.</p>${btn('이 기기로 Pages 연결','pagesFinish','primary')}</section>`:''}${body}${!childLinked?'<footer>소원은 천천히, 선택은 스스로. · 한국 시간 기준</footer>':''}</main>${connection==='linked'&&(state.started||parent)&&(!parent||adminOK())?`<nav class="nav ${parent?'parent-nav':'kid-nav'}" aria-label="주요 메뉴">${nav.map(n=>{const active=(parent?adminTab:(['fuse','mission'].includes(page)?'cards':page))===n;return `<button data-act="${parent?'admin':'nav'}:${n}" class="${active?'active':''}" ${active?'aria-current="page"':''}>${!parent?icon(n):''}<span>${labels[n]}</span></button>`;}).join('')}</nav>`:''}`;queueMicrotask(()=>{restoreUnopenedCard();maybeStarReward();showVoiceStatus();maybeEggCoach();maybeRegularVoice();});}
function weeklyEdit(day){
 const plan=state.weeklyPlans[adminKid][day];weeklyEditing={player:adminKid,day,revision:plan.revision};
 modal(`<h2>${E.NAMES[adminKid]} · ${'월화수목금토일'[day]}요일</h2><p>매주 반복할 할 일을 정해 주세요. 모두 삭제하면 쉬는 날이 됩니다.</p><div id="weeklyEditRows">${plan.tasks.map(t=>weeklyEditRow(t)).join('')}</div>${btn('할 일 추가','weeklyAdd','secondary')}<p class="muted">할 일은 60자, 하루 최대 20개까지 입력할 수 있어요.</p><div class="actions">${btn('취소','close')}${btn('일정 저장','weeklySave','primary')}</div>`);
}
function weeklyEditRow(t={}){return `<div class="weekly-edit-row" data-task-id="${esc(t.id||'')}"><input aria-label="할 일" maxlength="60" value="${esc(t.label||'')}" placeholder="예: 피아노 연습"><select aria-label="연결할 별 지급 종류">${Object.entries({quote:'명언 복습',diary:'일기',math:'수학',reading:'국어',cleaning:'청소',custom:'직접 입력'}).map(([key,label])=>`<option value="${key}" ${(t.category||'custom')===key?'selected':''}>${label}</option>`).join('')}</select><button type="button" class="small danger" data-week-remove aria-label="할 일 삭제">삭제</button></div>`;}
function parentQuotes(){return familyQuoteCards(state.quoteStatus,{started:state.started});}
function quoteNew(){
 const view=state.quoteStatus?.melody;if(!state.started||!view)throw Error('게임을 시작한 뒤 명언을 골라 주세요.');
 const active=Object.values(state.quoteStatus).flatMap(v=>v.items).filter(r=>!r.complete);
 const available=view.library.filter(q=>!active.some(r=>r.quote.text===q.text));
 const today=new Date(view.today*86400000).toISOString().slice(0,10),max=new Date((view.today+365)*86400000).toISOString().slice(0,10);
 modal(`<h2>함께 배울 새 명언</h2><p>멜로디와 아름이에게 같은 명언과 시작일을 배정해요. 복습 확인과 별 지급은 각각 할 수 있어요.</p><label for="quoteChoice">명언·속담·사자성어 고르기</label><select id="quoteChoice">${quoteOptions(available)}<option value="custom">직접 입력하기</option></select><details class="quote-custom"><summary>직접 입력할 명언 작성</summary><p>위 목록에서 ‘직접 입력하기’를 선택해 주세요.</p>${field('명언 (120자 이내)','quoteText','text','','maxlength="120"')}${field('말한 사람 또는 출처','quoteAuthor','text','','maxlength="60"')}${field('아이에게 설명할 뜻','quoteMeaning','text','','maxlength="200"')}${field('함께 나눌 질문 (선택)','quotePrompt','text','','maxlength="200"')}</details>${field('두 아이가 함께 시작할 날짜','quoteStartDate','date',today,`min="${today}" max="${max}"`)}<p>시작한 날 · 1일 후 · 3일 후 · 7일 후 · 14일 후에 각각 복습해요. 한 번 등록하면 두 아이 모두에게 적용됩니다.</p><div class="actions">${btn('돌아가기','close')}${btn('두 아이에게 함께 배정','quoteAssignTogether','primary')}</div>`);
}
function quoteOptions(library,selected=''){
 return ['명언','속담','사자성어'].map(kind=>`<optgroup label="${kind}${kind==='명언'?' · 인성 중심':''}">${library.filter(q=>(q.kind||'명언')===kind).map(q=>`<option value="${q.id}" ${q.id===selected?'selected':''}>[${esc(q.theme||'인성')}] ${esc(q.text)}</option>`).join('')}</optgroup>`).join('');
}
function quoteWeek(){
 const view=state.quoteStatus?.melody;if(!state.started||!view)throw Error('게임을 시작한 뒤 계획을 골라 주세요.');
 const active=Object.values(state.quoteStatus).flatMap(v=>v.items).filter(r=>!r.complete);
 const available=view.library.filter(q=>!active.some(r=>r.quote.text===q.text));
 const suggested=['kindness','proverb-kind','idiom-yeok','courage','proverb-together','different','today'];
 const defaults=suggested.map(id=>available.find(q=>q.id===id)).filter(Boolean);
 for(const q of available)if(defaults.length<7&&!defaults.some(x=>x.id===q.id))defaults.push(q);
 const today=new Date(view.today*86400000).toISOString().slice(0,10),max=new Date((view.today+359)*86400000).toISOString().slice(0,10);
 modal(`<div class="quote-week"><h2>두 아이의 일주일 문장</h2><p>하루에 한 문장씩 함께 시작해요. 각 문장은 0·1·3·7·14일에 복습합니다. 쉬고 싶은 날은 ‘새 문장 없음’을 고르세요.</p>${field('계획 시작일','quoteWeekStart','date',today,`min="${today}" max="${max}"`)}<div class="quote-week-days">${Array.from({length:7},(_,i)=>`<section class="quote-week-day"><label for="quoteDay${i}"><strong>${i+1}일차</strong> <span id="quoteDayDate${i}"></span></label><select id="quoteDay${i}"><option value="" ${defaults[i]?'':'selected'}>새 문장 없음 · 복습만</option>${quoteOptions(available,defaults[i]?.id)}</select><p id="quoteDayMeaning${i}" class="quote-week-meaning"></p></section>`).join('')}</div><p id="quoteWeekSummary" class="notice"></p><div class="actions">${btn('돌아가기','close')}${btn('두 아이에게 계획 배정','quoteWeekSave','primary')}</div></div>`);
 refreshQuoteWeek();
}
function refreshQuoteWeek(){
 if(!$('#quoteWeekStart'))return;
 const base=Date.parse(text('quoteWeekStart')+'T00:00:00Z'),ids=Array.from({length:7},(_,i)=>text('quoteDay'+i)),view=state.quoteStatus.melody;
 ids.forEach((id,i)=>{const q=view.library.find(q=>q.id===id);$('#quoteDayDate'+i).textContent=Number.isFinite(base)?quoteDate(base/86400000+i):'';$('#quoteDayMeaning'+i).textContent=q?`${q.meaning} · ${q.author}`:'새 문장을 추가하지 않아요.';});
 const selected=ids.filter(Boolean),duplicate=new Set(selected).size!==selected.length;
 $('#quoteWeekSummary').textContent=duplicate?'같은 문장이 중복되어 있어요. 서로 다른 문장을 골라 주세요.':`새 문장 ${selected.length}개를 두 아이에게 함께 배정해요. 기존 복습과 겹칠 수 있으며, 하루 한 문장씩 시작하면 복습은 보통 하루 최대 5개가 됩니다.`;
 $('[data-act="quoteWeekSave"]').disabled=duplicate||!selected.length||!Number.isFinite(base);
}
function quoteReview(player,id){
 const row=state.quoteStatus?.[player]?.items.find(r=>r.id===id);if(!row?.due)throw Error('복습할 날짜와 단계를 다시 확인해 주세요.');
 modal(`<h2>${E.NAMES[player]} · ${row.reviews.length+1}번째 복습</h2><blockquote class="quote-review-text">“${esc(row.quote.text)}”</blockquote><p>미리 약속한 복습 시간 동안 노력했는지 확인해 주세요. 막히면 함께 읽거나 힌트를 줘도 좋아요.</p>${row.reviews.length>=3?`<p class="notice">${row.reviews.length===4?'생활 속 예 하나도':'명언의 뜻도'} 함께 이야기해 주세요.<br>${esc(row.quote.prompt)}</p>`:''}<p>정확하게 외웠는지보다 약속한 노력을 기준으로 인정해 주세요. 힌트 사용 자체에는 별을 주지 않아요.</p><label for="quoteMode">어떻게 노력했나요?</label><select id="quoteMode"><option value="effort">약속한 시간만큼 함께 연습했어요</option><option value="independent">스스로 떠올려 말했어요</option><option value="hint">힌트를 보고 다시 말했어요</option></select><div class="actions">${btn('조금 더 연습하기','close')}${btn('노력 확인 · 별 1개',`quoteApprove:${player}:${id}:${row.reviews.length}`,'primary')}</div>`);
}
function confirm(title,body,a,after){const labels={swap:'별을 내고 교체하기',missionReset:'새 미션 열기',buy:'별을 내고 구매하기',draw:'별 25개로 뽑기',fuse:'합성하기',gift:'별 보내기',bid:'입찰하기',extend:'연장하기'};modal(`<h2>${title}</h2>${body}<div class="actions">${btn('돌아가기','close')}${btn(labels[a.type]||'확인','confirmAction','primary')}</div>`);pending=async()=>{if(['gift','buy','draw'].includes(a.type)){await spendStars(a,after);return;}const r=await commit(a);if(r?.conflict){
 if(r.offer?.candidates?.length){if(a.type==='swap')showSwapCandidates(a.id,r.offer);else showFusionCandidates(r.offer);}else modal(`<h2>남은 카드가 없어요</h2><p>${esc(r.message)}</p>${btn('닫기','close','primary')}`);
 toast(r.message);return;
 }close();if(after)await after(r);};}
let pending=null;
function revealEffects(tier){if(tier==='poop')return '';return `<span class="reveal-effects" aria-hidden="true"><span class="reveal-aura"></span><span class="reveal-ring"></span>${[[8,16],[92,12],[2,55],[97,63],[19,91],[84,94],[47,3],[62,98]].map(([x,y],i)=>`<span class="reveal-spark" style="--sx:${x}%;--sy:${y}%;--spark-delay:${320+i*65}ms">✦</span>`).join('')}</span>`;}
const revealKey=()=>`wish-pending-reveal-v2:${role}`;
function rememberReveal(id,spin=false){try{localStorage.setItem(revealKey(),JSON.stringify({id,spin}));localStorage.removeItem(`wish-pending-reveal-v1:${role}`);}catch{}}
function forgetReveal(){try{localStorage.removeItem(revealKey());localStorage.removeItem(`wish-pending-reveal-v1:${role}`);}catch{}}
function restoreUnopenedCard(){
 if(connection!=='linked'||isParent()||reward||rewardFlying||starSpending||$('#modal').open)return;
 let id,spin=false;try{const saved=localStorage.getItem(revealKey())||localStorage.getItem(`wish-pending-reveal-v1:${role}`);if(!saved)return;if(saved.startsWith('{'))({id,spin=false}=JSON.parse(saved));else id=saved;}catch{return;}if(!id)return;
 const c=state.cards.find(c=>c.id===id&&c.status==='active'&&c.owner===role);
 if(c)drawResult(c,{spin});else forgetReveal();
}
function drawResult(c,{spin=false}={}){
 rememberReveal(c.id,spin);
 const key='reveal-'+c.id;flippedCards.delete(key);
 const card=template(c,'',`flip:${key}`).replace('class="card ', 'class="card flip-back ').replace('<button ', '<button inert aria-hidden="true" ');
 modal(`<div class="draw-result" data-unopened="true"><h2 id="revealTitle" aria-live="polite">어떤 카드일까?</h2><div class="detail-card flip-shell draw-reveal reveal-${c.tier}" data-flip="${key}" data-reveal="true"><div class="flip-inner"><button class="card flip-front mystery-card ${c.tier}" data-act="flip:${key}" aria-label="카드를 눌러 공개하기" aria-expanded="false"><span class="mystery-stars" aria-hidden="true">✦ · ✧</span><span class="mystery-seal" aria-hidden="true">?</span><span class="mystery-label">톡! 눌러봐</span></button>${card}</div>${revealEffects(c.tier)}</div><div id="revealInfo" hidden><p>${esc(friendlyCardEffect(c.effect))}</p><p class="muted">보관함에 저장됐어요 · 같은 소원 ${E.owned(state,c.owner).filter(x=>x.type===c.type).length}장<br>${date(c.expires)}까지</p></div><p class="draw-balance">남은 별 ★ ${E.available(state,c.owner)}</p><div class="actions reveal-actions" hidden>${btn('시장으로','resultMarket')}${btn('내 카드로','resultDeck','primary')}</div></div>`);$('#modal .close').hidden=true;if(spin)startMysterySpin(c,key);
}
const mysterySpins=new WeakMap();
function startMysterySpin(c,key){
 const shell=$('.draw-reveal');shell.dataset.spin='waiting';shell.classList.add('is-spinning');
 shell.insertAdjacentHTML('beforeend',`<button class="sealed-spin-trigger shuffle-trigger" data-act="flip:${key}" aria-label="섞이는 카드 더미를 눌러 한 장 공개하기"><span class="shuffle-deck" aria-hidden="true">${Array.from({length:5},()=>`<span class="shuffle-card mystery-card ${c.tier}"><span class="mystery-stars">✦ · ✧</span><span class="mystery-seal">?</span></span>`).join('')}</span></button><p class="spin-instruction">여러 장을 섞는 중… 톡 눌러봐!</p>`);
 const poses=[{transform:'translate(-21%, -5%) rotate(-14deg)',zIndex:1},{transform:'translate(21%, -8%) rotate(12deg)',zIndex:2},{transform:'translate(4%, 4%) rotate(3deg)',zIndex:5},{transform:'translate(-17%, 9%) rotate(-9deg)',zIndex:4},{transform:'translate(18%, 5%) rotate(10deg)',zIndex:3}];
 const animations=[];
 shell.querySelectorAll('.shuffle-card').forEach((card,i)=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){Object.assign(card.style,poses[i]);return;}
  const frames=Array.from({length:6},(_,j)=>({...poses[(i+j)%5],offset:j/5}));
  animations.push(card.animate(frames,{duration:2200,iterations:Infinity,easing:'ease-in-out'}));
 });
 mysterySpins.set(shell,animations);
 shell.querySelector('.flip-inner').inert=true;shell.querySelector('.flip-inner').setAttribute('aria-hidden','true');shell.querySelector('.shuffle-trigger').focus({preventScroll:true});
}
async function stopMysterySpin(shell,key){
 if(shell.dataset.spin!=='waiting')return;
 shell.dataset.spin='stopping';const trigger=shell.querySelector('.shuffle-trigger');trigger.disabled=true;
 shell.querySelector('.spin-instruction').textContent='어느 카드가 나올까…';
 const cards=[...shell.querySelectorAll('.shuffle-card')],animations=mysterySpins.get(shell)||[];
 try{
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const start=performance.now();
   await new Promise(resolve=>{function slow(now){if(!shell.isConnected){resolve();return;}const progress=Math.min(1,(now-start)/1100),rate=1-.88*(1-Math.pow(1-progress,2));animations.forEach(a=>a.updatePlaybackRate(rate));if(progress<1)requestAnimationFrame(slow);else resolve();}requestAnimationFrame(slow);});
   const poses=cards.map(card=>({transform:getComputedStyle(card).transform,zIndex:getComputedStyle(card).zIndex}));
   animations.forEach(a=>a.cancel());cards.forEach((card,i)=>Object.assign(card.style,poses[i]));
   const chosen=cards.reduce((best,card)=>Number(card.style.zIndex)>Number(best.style.zIndex)?card:best,cards[0]);
   chosen.style.zIndex=10;
   const gathered=cards.map((card,i)=>card.animate([{transform:card.style.transform,opacity:1},{transform:card===chosen?'translate(0,0) rotate(0deg) scale(1.31579)':`translate(${(i-2)*3}px,12px) rotate(0deg) scale(.8)`,opacity:card===chosen?1:0}],{duration:650,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'}));
   mysterySpins.set(shell,gathered);await Promise.all(gathered.map(a=>a.finished.catch(()=>{})));
  }
 }finally{
  (mysterySpins.get(shell)||[]).forEach(a=>a.cancel());mysterySpins.delete(shell);
  if(!shell.isConnected||!$('#modal').open)return;
  trigger.remove();shell.querySelector('.spin-instruction').remove();shell.classList.remove('is-spinning');delete shell.dataset.spin;
  shell.querySelector('.flip-inner').inert=false;shell.querySelector('.flip-inner').removeAttribute('aria-hidden');
  requestAnimationFrame(()=>{if(shell.isConnected)toggleCard(key);});
 }
}
function fusionPreview(materials,target){return `<div class="fusion-preview" role="img" aria-label="선택한 ${E.TIERS[materials[0].tier]} ${materials.length}장을 ${E.TIERS[target]} 한 장으로 합쳐요"><div class="fusion-preview-source"><div class="fusion-preview-materials">${materials.map((c,i)=>`<span class="card fusion-preview-card ${c.tier}" style="--material-index:${i}" title="${esc(c.name)}">${pokerHTML(c.poker)}${cardArt(c)}<span class="fusion-mini-name">${esc(c.name)}</span></span>`).join('')}</div><b>${E.TIERS[materials[0].tier]} ${materials.length}장</b></div><span class="fusion-preview-arrow" aria-hidden="true">→</span><div class="fusion-preview-destination"><div class="fusion-target-space"><span class="card fusion-preview-target ${target}" aria-hidden="true"><span>${tierMark(target)}</span><strong>?</strong></span></div><b>${E.TIERS[target]} 1장</b></div></div>`;}
async function fusionResult(c,materials){
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 modal(`<div class="fusion-show"><h2 role="status">카드가 모이고 있어요</h2><div class="fusion-stage" aria-hidden="true">${materials.map((m,i)=>{const angle=(i/materials.length)*Math.PI*2-Math.PI/2;return `<div class="fusion-particle" style="--merge-x:${Math.round(Math.cos(angle)*105)}px;--merge-y:${Math.round(Math.sin(angle)*110)}px;--merge-r:${Math.round(Math.cos(angle)*18)}deg">${template(m)}</div>`;}).join('')}<span class="fusion-flash">✦</span></div></div>`);
 const stage=$('.fusion-show');
 await new Promise(resolve=>setTimeout(resolve,reduced?100:1600));
 if(stage?.isConnected&&$('#modal').open)drawResult(c,{spin:true});
}
function result(c,title){modal(`<div class="result ${c.tier}"><span class="tier-badge">${E.TIERS[c.tier]}</span><h2>${title}</h2><div class="detail-card">${template(c)}</div><p>${esc(friendlyCardEffect(c.effect))}</p><p class="muted">${date(c.expires)}까지 · 같은 소원 ${E.owned(state,c.owner).filter(x=>x.type===c.type).length}장<br>남은 사용 가능 별 ${E.available(state,c.owner)}개</p><div class="actions">${btn('시장으로','resultMarket')}${btn('내 카드에서 보기',`resultCard:${c.id}`,'primary')}</div></div>`);}
function showFusionCandidates(offer){
 modal(`<h2>받고 싶은 은카드를 골라요</h2><div class="poker-hand">${offer.hand}</div><p>남은 은카드 후보 ${offer.candidates.length}장 중 한 장을 골라요.</p><div class="swap-candidates">${offer.candidates.map(c=>`<div>${template(c,'',`fuseChoose:${c.id}`)}<p>${esc(friendlyCardEffect(c.effect))}</p></div>`).join('')}</div>${btn('취소','close','secondary')}`);
}
function showPokerHint(reveal){
 const cards=E.owned(state,role).filter(c=>c.tier==='poop');
 if(cards.length<5)throw Error('똥카드 5장부터 힌트를 볼 수 있어요.');
 const hint=bestPokerHint(cards);
 modal(`<h2>카드 힌트</h2><p>${hint.clue}</p>${reveal?`<div class="poker-hand">${hint.hand}</div><div class="hint-card-grid">${hint.ids.map(id=>template(cards.find(c=>c.id===id))).join('')}</div><p>${hint.reason}</p>${btn('이 다섯 장 선택하기','pokerApply','primary')}`:`<p class="muted">내가 가진 카드 ${cards.length}장에서 찾은 단서예요. 먼저 직접 찾아볼까요?</p>${btn('추천 5장 보기','pokerRecommend','primary')}`}${btn('닫기','close','secondary')}`);
}
function showSwapCandidates(id,offer){
 modal(`<h2>바꾸고 싶은 카드를 골라요</h2><p>남은 후보 ${offer.candidates.length}장 · 확정할 때만 별 10개를 사용해요.</p><div class="swap-candidates">${offer.candidates.map(c=>`<div>${template(c,'',`swapChoose:${id}:${c.id}`)}<p>${esc(friendlyCardEffect(c.effect))}</p></div>`).join('')}</div><p class="muted">아직 공용 덱에 있는 후보는 그대로 보여줘요. 다른 가족이 먼저 가져가면 남은 후보를 다시 보여줘요.</p>${btn('취소','close','secondary')}`);
}
function detail(id){const c=state.cards.find(c=>c.id===id&&c.owner===role&&c.status==='active');if(!c)throw Error('현재 보유한 카드가 아니에요.');const siblings=E.owned(state,role).filter(x=>x.type===c.type).sort((a,b)=>a.expires-b.expires);modal(`<div class="detail-tier ${c.tier}"><span class="tier-badge">${tierMark(c.tier)} ${E.TIERS[c.tier]} · ${siblings.length}장 보유</span></div><div class="detail-card">${template(c)}</div><p>${esc(friendlyCardEffect(c.effect))}</p><p>${date(c.expires)}까지 사용할 수 있어요.</p>${siblings.length>1?`<label for="instance">다른 장 선택</label><select id="instance">${siblings.map(x=>`<option value="${x.id}" ${x.id===id?'selected':''}>${pokerLabel(x.poker)} · ${date(x.expires)} · ${esc(friendlyCardEffect(x.effect))}</option>`).join('')}</select>`:''}<div class="stack section">${btn('부모님께 보여주기 · QR',`qr:${id}`,'primary')}${btn(E.SWAP_COST[c.tier]?`카드 교체 · 별 ${E.SWAP_COST[c.tier]}개`:'카드 교체 · 준비 중',`swap:${id}`,'',!!E.swapError(state,role,c))}${E.swapError(state,role,c)?`<small class="muted">${esc(E.swapError(state,role,c))}</small>`:''}${c.expires-Date.now()<=14*86400000?btn(`1개월 연장 · 별 ${E.COST[c.tier]}개`,`extend:${id}`):''}</div>`);if(c.tier==='poop'){Object.assign($('#modal').dataset,{liveCard:c.id,liveEffect:c.effect,liveMode:'detail'});}}
function qr(id){const c=state.cards.find(c=>c.id===id&&c.status==='active'&&c.owner===role);if(!c)throw Error('현재 사용할 수 없는 카드예요.');const url=new URL(familyHomeURL());url.hash='redeem='+id;const q=window.qrcode(0,'M');q.addData(url.href);q.make();modal(`<h2>${esc(c.name)}</h2><p>혜택을 받을 때 부모 휴대폰의 카메라로 스캔해 주세요.</p><div class="qr">${q.createImgTag(5,10,'카드 사용 QR')}</div><p>${esc(friendlyCardEffect(c.effect))}</p><p class="notice">등록된 부모 휴대폰에서 PIN으로 승인하면 이 카드 한 장이 사용 완료됩니다.</p>`);$('#modal').dataset.card=id;if(c.tier==='poop')Object.assign($('#modal').dataset,{liveCard:c.id,liveEffect:c.effect,liveMode:'qr'});}
function pinScreen(callback,title='부모 PIN 입력'){modal(`<h2>${title}</h2><p class="muted">등록된 부모 휴대폰에서 PIN을 입력해 주세요.</p>${field('4자리 PIN','pin','password','','inputmode="numeric" maxlength="4" autocomplete="off" enterkeyhint="done"')}<p id="pinError" class="error" role="alert"></p><div class="actions">${btn('돌아가기','close')}${btn('확인','pinConfirm','primary')}</div>`);pendingPin=callback;}
let pendingPin=null,pinSubmitting=false;
function redeem(id){if(!isParent()||!adminOK())throw Error('부모 기기에서 PIN으로 먼저 열어주세요.');const c=state.cards.find(c=>c.id===id);if(!c)throw Error('카드를 찾을 수 없어요.');if(c.status!=='active')throw Error('이미 사용했거나 만료된 카드예요.');modal(`<h2>${E.NAMES[c.owner]}의 카드</h2><h3>${esc(c.name)}</h3><p>${esc(friendlyCardEffect(c.effect))}</p><p>${date(c.expires)}까지</p><div class="notice">지금 혜택을 제공하셨나요?<br>완료하면 아이의 보관함에서 이 카드 한 장이 사라집니다.</div>${field('부모 4자리 PIN','pin','password','','maxlength="4" inputmode="numeric" enterkeyhint="done"')}<p id="pinError" class="error" role="alert"></p><div class="actions">${btn('돌아가기','close')}${btn('사용 완료하기','pinConfirm','primary')}</div>`);const operation={type:'use',id};pendingPin=async pin=>{if(!operation.requestId)operation.requestId=E.uid();await commit(operation,pin);modal(`<h2>사용 완료했어요</h2><p>${E.NAMES[c.owner]} · ${esc(c.name)}<br>아이의 화면에도 자동 반영됩니다.</p>${btn('닫기','close','primary')}`);};}
function edit(id){const c=state.catalog.find(c=>c.id===id)||{id:null,name:'',tier:'silver',emoji:'🎴',effect:'',enabled:false};modal(`<h2>${c.id?'카드 편집':'새 카드 만들기'}</h2>${field('이름','editName','text',c.name)}<label for="editTier">등급</label><select id="editTier" ${c.id?'disabled':''}>${['silver','gold'].map(t=>`<option value="${t}" ${t===c.tier?'selected':''}>${E.TIERS[t]}</option>`).join('')}</select>${field('그림 대신 사용할 이모지','editEmoji','text',c.emoji)}<label for="editEffect">혜택과 사용 조건</label><textarea id="editEffect">${esc(c.effect)}</textarea><label for="editEnabled">자동 공급</label><select id="editEnabled"><option value="true" ${c.enabled?'selected':''}>켜짐</option><option value="false" ${!c.enabled?'selected':''}>꺼짐</option></select><p class="notice">기존 카드와 공개된 시장·경매의 약속은 유지됩니다. 기본 카드는 전용 그림을, 새 카드는 선택한 이모지를 사용합니다.</p>${btn('저장 내용 확인',`saveCard:${id}`,'primary')}`);}
function newAuction(){const val=new Date(Date.now()+9*3600000+3600000).toISOString().slice(0,16);modal(`<h2>경매 열기</h2><label for="auctionCard">카드 1장</label><select id="auctionCard">${state.catalog.filter(c=>c.tier!=='gold').map(c=>`<option value="${c.id}">${E.TIERS[c.tier]} · ${esc(c.name)}</option>`).join('')}</select>${field('최소 입찰가','minimum','number',1,'min="1"')}${field('마감 · 한국 시간','ends','datetime-local',val)}<p class="muted">은카드 기준 가치는 별 80개입니다.<br>개설 후에는 조건을 바꿀 수 없어요.</p>${btn('개설 내용 확인','auctionConfirm','primary')}`);}
function manage(id){const c=state.cards.find(c=>c.id===id);modal(`<h2>${esc(c.name)} 관리</h2><p>${E.NAMES[c.owner]} · ${date(c.expires)}까지</p><p>${esc(friendlyCardEffect(c.effect))}</p><div class="stack">${btn('QR 사용 승인',`redeem:${id}`)}${btn('무료 연장',`restore:${id}`)}${btn('제공 불가 · 예외 교체',`replace:${id}`)}</div>`);}
function restore(id){const c=state.cards.find(c=>c.id===id);const value=new Date(E.monthEnd(Math.max(c.expires,Date.now()),1)+9*3600000).toISOString().slice(0,10);modal(`<h2>${c.status==='active'?'무료 연장':'카드 복구'}</h2><p>${esc(c.name)} · ${E.NAMES[c.owner]}</p>${field('새 만료일','restoreDate','date',value)}${field('처리 사유','restoreReason')}<p class="muted">공용 덱에 돌아온 카드만 복구할 수 있어요. 다른 손패에 있으면 복구하지 않아요.</p>${btn('확인 후 처리',`restoreSave:${id}`,'primary')}`);}
function replace(id){const c=state.cards.find(c=>c.id===id);modal(`<h2>제공 불가 카드 교체</h2><p>${esc(c.name)} · 기존 만료일 유지</p><label for="replaceTarget">같은 등급의 대체 카드</label><select id="replaceTarget">${state.catalog.filter(t=>t.tier===c.tier&&E.deckPool(state,c.tier).some(d=>d.type===t.id)).map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select>${field('제공 불가 사유','replaceReason')}${btn('교체 내용 확인',`replaceSave:${id}`,'primary')}`);}
async function handle(action){const [cmd,id,x]=action.split(':');if(/^(mission|egg|tutor)/.test(cmd)){toast('오늘의 미션은 잠시 쉬고 있어요.');return;}if(['nav','admin','missionOpen'].includes(cmd))tutorVoice.stop();
if(['award','newAuction','auctionConfirm','cancelAuction','edit','saveCard','manage','restore','restoreSave','replace','replaceSave','correct','export','missionReset','missionReport','missionSettings','missionSettingsSave'].includes(cmd)&&!adminOK())throw Error('부모 PIN으로 먼저 열어 주세요.');
switch(cmd){
 case 'pagesStart':await startPagesConnection();break;
 case 'pagesFinish':await finishPagesConnection(api);break;
 case 'quoteFlip':{const back=flipQuoteBanner(id),banner=$('.quote-banner');if(banner){banner.classList.toggle('is-back',back);banner.setAttribute('aria-pressed',String(back));banner.setAttribute('aria-label',back?'명언 다시 보기':'명언 카드 뒤집어 가리기');banner.querySelector('.quote-banner-front').setAttribute('aria-hidden',String(back));banner.querySelector('.quote-banner-back').setAttribute('aria-hidden',String(!back));}break;}
 case 'quotePractice':setQuotePractice(id,x);render();break;
 case 'quoteNew':quoteNew(id);break;
 case 'quoteWeek':quoteWeek();break;
 case 'quoteWeekSave':{const r=await commit({type:'quotePlanWeek',startDate:text('quoteWeekStart'),selections:Array.from({length:7},(_,i)=>text('quoteDay'+i))});close();toast(`두 아이의 ${r.count}일치 문장을 예약했어요.`);break;}
 case 'quoteAssignTogether':{await commit({type:'quoteAssignTogether',startDate:text('quoteStartDate'),quoteId:text('quoteChoice'),text:text('quoteText'),author:text('quoteAuthor'),meaning:text('quoteMeaning'),prompt:text('quotePrompt')});close();toast('두 아이에게 같은 명언을 배정했어요.');break;}
 case 'quoteAssign':{await commit({type:'quoteAssign',player:id,quoteId:text('quoteChoice'),text:text('quoteText'),author:text('quoteAuthor'),meaning:text('quoteMeaning'),prompt:text('quotePrompt')});close();toast('새 명언을 시작했어요. 오늘 함께 읽어봐요!');break;}
 case 'quoteRequest':await commit({type:'quoteRequest',id,step:Number(x)});toast('부모님께 확인을 부탁했어요.');break;
 case 'quoteReview':quoteReview(id,x);break;
 case 'quoteApprove':{await commit({type:'quoteApprove',player:id,id:x,step:Number(action.split(':')[3]),mode:text('quoteMode')});close();toast('복습 완료! 별 1개를 보냈어요.');break;}
 case 'close':close();break;
 case 'profilePhoto':{const name=E.NAMES[role]||(role==='mom'?'엄마':role==='dad'?'아빠':'');if(!name)break;const size=Math.round(($('.kid-profile-photo')?.getBoundingClientRect().width||64)*4);modal(`<div class="profile-photo-view" style="--profile-size:${size}px"><h2>${esc(name)}</h2><button class="profile-photo-large" data-act="close" aria-label="사진 닫기"><img src="/star-manager-web/art/profiles/${role}-ghibli-v2.jpeg" alt="${esc(name)} 프로필 사진" width="512" height="512"></button></div>`);break;}
 
 case 'missionOpen':missionSound.arm();if(missionSound.enabled)tutorVoice.arm();eggCoachKey='';regularVoiceKey='';clearMissionFeedback();page='mission';close();render();window.scrollTo({top:0,behavior:'instant'});await sync();render();break;
 case 'missionReport':showMissionReport(id,Number(x)||0);break;
 case 'missionSettings':showMissionSettings(id);break;
 case 'missionSettingsSave':{const button=$('[data-act="'+action+'"]');if(button)button.disabled=true;try{await commit({type:'missionSettings',player:id,mode:text('missionMode'),level:num('missionLevel'),expectedVersion:Number(x)});close();toast('선택한 단계로 문제를 바꿨어요.');}finally{if(button?.isConnected)button.disabled=false;}break;}
 case 'missionReset':{const r=state.missionStatus?.[id]?.run;if(!r)throw Error('오늘 시작한 미션이 없어요.');confirm(`${E.NAMES[id]}의 미션을 다시 열까요?`,`<p>${state.missionStatus?.[id]?.level===9?'9단계 · 달걀로 10 만들기를 다시 시작해요.':'지금 정한 단계의 5문제로 시작해요.'}</p><p>이미 받은 별과 카드, 지금까지 익힌 난이도는 그대로예요.</p><p>다시 완료하면 <b>별 1개</b>를 받아요.</p>${r.stage!=='complete'?'<p class="notice">지금 풀고 있는 미션은 종료돼요.</p>':''}`,{type:'missionReset',player:id,expectedRunId:r.id},()=>toast(`${E.NAMES[id]}의 새 미션을 열었어요.`));break;}
 case 'missionSound':{const on=missionSound.toggle();if(!on)tutorVoice.stop();else tutorVoice.arm();render();if(on)readLesson(missionFeedback?.correct?'correct':'question',missionFeedback?.question);break;}
 case 'missionPick':missionPick();break;
 case 'missionPickSave':await commit({type:'missionChoose',level:num('kidMissionLevel'),expectedVersion:Number(id)});close();render();break;
 case 'eggStart':missionSound.arm();if(missionSound.enabled)tutorVoice.arm();await submitMission(missionRetry||{type:'missionStart',lesson:'eggs'});break;
 case 'eggListen':case 'lessonListen':if(!missionSound.enabled)missionSound.toggle();tutorVoice.arm();render();readLesson(missionFeedback?.correct?'correct':'question',missionFeedback?.question);break;
 case 'eggAdd':{const slot=nextEggSlot();if(slot>=0)await moveEgg('tutorMove',slot);break;}
 case 'eggPlace':case 'eggRemove':await moveEgg('tutorMove',Number(id));break;
 case 'eggCheck':await moveEgg('tutorCheck');break;
 case 'eggHint':await moveEgg('tutorHint');break;
 case 'missionStart':missionSound.arm();if(missionSound.enabled)tutorVoice.arm();await submitMission(missionRetry||{type:'missionStart',...(state.todayMission?.level===9?{lesson:'eggs'}:{})});break;
 case 'missionNext':missionSound.arm();await submitMission(missionRetry||{type:'missionNext',runId:state.todayMission?.run?.id});break;
 case 'missionAnswer':{missionSound.arm();const run=state.todayMission?.run,q=run?.question;if(missionFeedback||!q||q.id!==id)break;await submitMission({type:'missionAnswer',runId:run.id,questionId:q.id,attempt:q.attempt,optionIndex:Number(x)},q);break;}
 case 'missionContinue':tutorVoice.stop();if(missionSound.enabled)tutorVoice.arm();clearMissionFeedback();render();break;
 case 'missionRetry':missionSound.arm();if(missionRetry)await submitMission(missionRetry,missionFeedback?.question);break;
 case 'starHistory':starHistory();break;
 case 'logPage':if(adminOK()&&adminTab==='logs'){logPage=Number(id)||0;$('#logList').innerHTML=logsHTML(logFilter);$('#logPageStatus')?.focus({preventScroll:true});$('#logFilter').scrollIntoView({block:'start'});}break;
 case 'starHistoryPage':starHistory(Number(id));break;
 case 'collectStars':await collectStars();break;
 case 'flip':toggleCard(id);break;
 case 'nav':if(id==='adventure'){location.href='/star-manager-web/adventure.html';break;}clearMissionFeedback();page=id;close();render();window.scrollTo({top:0,behavior:'instant'});break;
 case 'filter':inventoryFilter=id;render();break;
 case 'weeklyEdit':weeklyEdit(Number(id));break;
 case 'weeklyAdd':if($('#weeklyEditRows').children.length>=20)throw Error('하루 최대 20개까지 입력할 수 있어요.');$('#weeklyEditRows').insertAdjacentHTML('beforeend',weeklyEditRow());$('#weeklyEditRows').lastElementChild.querySelector('input').focus();break;
 case 'weeklySave':{const tasks=[...$('#weeklyEditRows').children].map(row=>({id:row.dataset.taskId||undefined,label:row.querySelector('input').value,category:row.querySelector('select').value}));await commit({type:'weeklyPlanSave',...weeklyEditing,tasks});$('#modal').close();toast('주간 일정을 저장했어요.');break;}
 case 'admin':adminTab=id;if(id==='settings'){const data=await api('devices');devices=data.devices||[];}render();break;
 case 'adminKid':adminKid=id;render();break;
 case 'step':{const el=$('#'+id);el.value=Math.max(1,(Number(el.value)||0)+Number(x));updateAwardInput(el);break;}
 case 'unlock':pinScreen(async pin=>{accept(await api('unlock',{pin}));close();render();await sync();});break;
 case 'lock':accept(await api('lock',{}));close();render();break;
 case 'pinConfirm':{if(pinSubmitting||!pendingPin)return;pinSubmitting=true;const button=$('[data-act="pinConfirm"]');if(button)button.disabled=true;try{await pendingPin(text('pin'));}catch(e){if($('#pinError'))$('#pinError').textContent=e.message;else throw e;}finally{pinSubmitting=false;if(button?.isConnected)button.disabled=false;}break;}
 case 'start':if(!adminOK())throw Error('부모 PIN을 확인해 주세요.');confirm('게임을 시작할까요?','<p>별 0개, 카드 0장으로 시작하고 첫 시장 3장을 공개해요.</p>',{type:'start'},()=>toast('첫 시장이 열렸어요.'));break;
 case 'dismiss':await commit({type:'dismiss',player:role});break;
 case 'confirmAction':if(pending){const fn=pending;pending=null;try{await fn();}catch(e){pending=fn;throw e;}}break;
 case 'swapHistoryToday':changeSwapHistoryDate(id,'');break;
 case 'swapHistoryStep':{
  if(!Object.hasOwn(swapHistoryDates,id))break;
  const today=state.weeklyStatus?.[id]?.days.find(d=>d.today)?.date;
  const next=shiftHistoryDate(swapHistoryDates[id]||today,Number(x),today);
  if(next){
   changeSwapHistoryDate(id,next);
   const button=document.querySelector(`[data-act="${action}"]`);
   (button&&!button.disabled?button:document.querySelector(`[data-swap-history-date="${id}"]`))?.focus({preventScroll:true});
  }
  break;
 }
 case 'historyMode':{
  if(!Object.hasOwn(historyModes,id)||!['week','month'].includes(x))break;
  historyModes[id]=x;
  const section=document.querySelector(`[data-history-player="${id}"]`);
  if(section)section.outerHTML=historyForPlayer(id);
  document.querySelector(`[data-act="${action}"]`)?.focus({preventScroll:true});
  break;
 }
 case 'historyMonthToday':
 case 'historyMonthStep':
 case 'historyWeekToday':
 case 'historyWeekStep':{
  const monthly=cmd.startsWith('historyMonth'),dates=monthly?historyMonths:historyWeeks,start=monthly?historyMonthStart:historyWeekStart,shift=monthly?shiftHistoryMonth:shiftHistoryWeek;
  if(!Object.hasOwn(dates,id))break;
  const today=state.weeklyStatus?.[id]?.days.find(d=>d.today)?.date;
  const next=cmd.endsWith('Today')?start(today):shift(dates[id]||today,Number(x),today);
  if(next){
   dates[id]=next===start(today)?'':next;
   const section=document.querySelector(`[data-history-player="${id}"]`);
   if(section)section.outerHTML=historyForPlayer(id);
   const button=document.querySelector(`[data-act="${action}"]`);
   (button&&!button.disabled?button:document.querySelector(`[data-act="${monthly?'historyMonth':'historyWeek'}Step:${id}:-1"]`))?.focus({preventScroll:true});
  }
  break;
 }
 case 'historyStep':{
  if(!Object.hasOwn(historyDates,id))break;
  const today=state.weeklyStatus?.[id]?.days.find(d=>d.today)?.date;
  const next=shiftHistoryDate(historyDates[id]||today,Number(x),today);
  if(next){
   changeHistoryDate(id,next);
   const button=document.querySelector(`[data-act="historyStep:${id}:${x}"]`);
   (button&&!button.disabled?button:document.querySelector(`[data-history-date="${id}"]`))?.focus({preventScroll:true});
  }
  break;
 }
 case 'historyToday':changeHistoryDate(id,'');break;
 case 'todayUndo':confirmTodayUndo(id,x);break;
 case 'weeklyUndo':{const result=await commit({type:'weeklyUndo',player:id,taskId:x,token:$('#modal').dataset.undoToken});close();toast(`완료를 취소하고 별 ${result.recovered}개를 회수했어요.`);break;}
 case 'todayAward':selectTodayAward(id,x);break;
 case 'awardReason':{if(!adminOK()||awardSending)return;const d=awardDrafts[id];if(!d||!awardReasons.some(r=>r[0]===x)||awardAlreadyDone(id,x))return;d.choice=x;d.taskId='';d.request=null;render();if(x==='custom')$('#award-reason-'+id)?.focus();break;}
 case 'award':{if(awardSending||busy)return;const d=awardDrafts[id];if(d&&awardAlreadyDone(id,d.choice,d.taskId))throw Error('오늘 이미 완료한 항목이에요. 별을 다시 지급할 수 없어요.');if(!d||!awardReady(d,id))throw Error('별 개수와 이유를 골라 주세요.');const n=Number(d.amount);d.request ||= {type:'award',player:id,amount:n,reason:awardReason(d),awardCategory:d.choice,scheduleTaskId:d.choice==='custom'?(d.taskId||undefined):undefined,requestId:E.uid()};awardSending=id;render();try{await commit(d.request);awardDrafts[id]=emptyAward();toast(`${E.NAMES[id]}에게 별 ${n}개를 보냈어요.`);}finally{awardSending='';render();}break;}
 case 'gift':modal(`<h2>${role==='melody'?'아름이':'멜로디'}에게 별 보내기</h2><div class="gift-options">${[1,2,3].map(n=>`<button class="gift-option" data-act="giftConfirm:${n}" aria-label="별 ${n}개 보내기" ${n>E.available(state,role)?'disabled':''}><span class="gift-option-stars" aria-hidden="true">${icon('star').repeat(n)}</span></button>`).join('')}</div><div class="actions">${btn('돌아가기','close')}</div>`);break;
 case 'giftConfirm':{const n=Number(id);if(![1,2,3].includes(n)||n>E.available(state,role))throw Error('보낼 수 있는 별 개수를 확인해 주세요.');const recipient=role==='melody'?'areum':'melody';const person=p=>`<div class="gift-person"><img src="/star-manager-web/art/profiles/${p}-ghibli-v2.jpeg" alt="" width="512" height="512"><strong>${esc(E.NAMES[p])}</strong></div>`;confirm('별을 보낼까요?',`<div class="gift-transfer" role="img" aria-label="${esc(E.NAMES[role])}가 ${esc(E.NAMES[recipient])}에게 별 ${n}개 보내기">${person(role)}<div class="gift-flight" aria-hidden="true"><span class="gift-flight-count">${n}개</span><span class="gift-flight-arrow">→</span>${Array.from({length:n},(_,i)=>`<span class="gift-flying-star" style="--gift-i:${i};--gift-count:${n}">${icon('star')}</span>`).join('')}</div>${person(recipient)}</div>`,{type:'gift',player:role,amount:n});break;}
 case 'buy':{const m=state.market.find(m=>m.id===id);confirm(`${esc(m.card.name)}을 살까요?`,`<p>${esc(friendlyCardEffect(m.card.effect))}</p><p>별 ${m.price}개 사용 · 구매 후 ${E.available(state,role)-m.price}개</p>`,{type:'buy',player:role,id},c=>result(c,'카드를 받았어요'));break;}
 case 'swap':{
  const offer=await commit({type:'swapPrepare',id});showSwapCandidates(id,offer);break;
 }
 case 'swapChoose':{
  const c=state.cards.find(c=>c.id===id),offer=state.swapOffers?.[id],candidate=offer?.candidates.find(c=>c.id===x);
  if(!c||!candidate)throw Error('교체 화면을 다시 열어 주세요.');
  confirm('이 카드로 바꿀까요?',`<div class="detail-card">${template(candidate)}</div><p>${pokerLabel(c.poker)} ${esc(c.name)} 한 장을 바꿔요.</p><p>별 <b>10개</b> 사용 · 사용 기한은 ${date(c.expires)}까지 그대로예요.</p>`,{type:'swap',id,offerId:offer.id,candidateId:candidate.id},c=>modal(`<div class="result ${c.tier}"><h2>카드를 바꿨어요</h2><div class="detail-card">${template(c)}</div><p>${esc(friendlyCardEffect(c.effect))}</p><p class="muted">${date(c.expires)}까지 · 남은 별 ${E.available(state,role)}개</p>${btn('내 카드에서 보기',`resultCard:${c.id}`,'primary')}</div>`));break;
 }
 case 'draw':{const err=E.possible(state,role,'poop',[],true);if(err)throw Error(err);confirm('한 장 뽑을까요?',`<p>별 25개 사용 · 뽑은 뒤 ${E.available(state,role)-25}개</p><p>공용 똥덱에 남은 카드 중 한 장을 같은 확률로 받아요.</p>`,{type:'draw',player:role,purchaseToken:state.purchaseTokens?.[role]},c=>drawResult(c,{spin:true}));break;}
 case 'pool':if(!RESULT_POOL_PREVIEW_ENABLED){toast('결과 후보 보기는 준비 중이에요.');break;}modal(`<h2>${E.TIERS[id]} 결과 후보</h2><p>공용 덱에 남은 카드예요. 다른 가족이 먼저 가져가면 재고가 바뀔 수 있어요.</p><div class="detail-list">${E.deckPool(state,id).map(c=>`<div class="detail-item"><b>${esc(c.emoji)} ${esc(c.name)}</b><p>${esc(friendlyCardEffect(c.effect))}</p></div>`).join('')}</div>`);break;
 case 'detail':detail(id);break;
 case 'resultDeck':if($('.draw-result[data-unopened="true"]'))break;page='cards';close();render();break;
 case 'resultMarket':if($('.draw-result[data-unopened="true"]'))break;page='market';close();render();break;
 case 'resultCard':page='cards';render();detail(id);break;
 case 'qr':qr(id);break;
 case 'redeem':redeem(id);break;
 case 'extend':{const c=state.cards.find(c=>c.id===id);confirm('1개월 연장할까요?',`<p>${esc(c.name)}</p><p>${date(c.expires)} → <b>${date(E.monthEnd(c.expires,1))}</b></p><p>별 ${E.COST[c.tier]}개 · 연장 후 ${E.available(state,role)-E.COST[c.tier]}개</p>`,{type:'extend',player:role,id},()=>toast('사용 기간을 연장했어요.'));break;}
 case 'tier':fuseTier=id;selected=[];render();break;
 case 'fuseFrom':{const c=state.cards.find(c=>c.id===id);fuseTier=c.tier;selected=[id];page='fuse';close();render();break;}
 case 'select':{const need=fuseTier==='poop'?5:3;if(!selected.includes(id)&&selected.length>=need)break;selected=selected.includes(id)?selected.filter(x=>x!==id):[...selected,id];render();break;}
 case 'pokerHint':showPokerHint(false);break;
 case 'pokerRecommend':showPokerHint(true);break;
 case 'pokerApply':{
  const cards=E.owned(state,role).filter(c=>c.tier==='poop');if(cards.length<5)throw Error('똥카드 5장부터 힌트를 볼 수 있어요.');
  const hint=bestPokerHint(cards);fuseTier='poop';selected=hint.ids;close();render();break;
 }
 case 'fuseConfirm':{
  const ids=[...selected],list=ids.map(id=>state.cards.find(c=>c.id===id)),target=fuseTier==='poop'?'silver':'gold';
  const offer=await commit({type:'fusePrepare',ids});
  if(offer.mode==='choice'){showFusionCandidates(offer);break;}
  confirm(`${E.TIERS[target]} 한 장으로 합칠까요?`,(offer.hand?`<div class="poker-hand">${offer.hand}</div><p>랜덤 은카드 1장을 받아요.</p>`:'')+fusionPreview(list,target),{type:'fuse',player:role,ids},async c=>{selected=[];render();await fusionResult(c,list);});break;
 }
 case 'fuseChoose':{
  const offer=state.fusionOffers?.[role],candidate=offer?.candidates.find(c=>c.id===id);
  if(!candidate)throw Error('승급 후보를 다시 확인해 주세요.');
  const list=offer.ids.map(id=>state.cards.find(c=>c.id===id));
  if(list.some(c=>!c||c.status!=='active'))throw Error('선택한 카드가 바뀌었어요. 다시 선택해 주세요.');
  confirm('이 은카드를 받을까요?',`<div class="poker-hand">${offer.hand}</div><div class="detail-card">${template(candidate)}</div><p>선택한 똥카드 5장이 은카드 1장으로 바뀌어요.</p>`,{type:'fuse',ids:offer.ids,offerId:offer.id,candidateId:id},async c=>{selected=[];render();result(c,'고른 은카드를 받았어요');});break;
 }
 case 'bidConfirm':{const n=num('bidAmount'),a=state.auction;if(!Number.isSafeInteger(n)||n<a.minimum||n>E.available(state,role))throw Error('최소 입찰가와 사용할 수 있는 별을 확인해 주세요.');const err=E.capacity(state,role,a.card.id);if(err)throw Error(err);confirm(`별 ${n}개를 걸까요?`,`<p>이기면 별 ${n}개를 내고, 지면 돌려받아요.<br>입찰 후 사용할 수 있는 별 ${E.available(state,role)-n}개</p><p class="notice">마감까지 이 별은 사용할 수 없어요. 제출한 금액은 바꿀 수 없어요.</p>`,{type:'bid',player:role,amount:n},()=>toast('비밀 입찰을 제출했어요.'));break;}
 case 'newAuction':newAuction();break;
 case 'auctionConfirm':{const cardId=text('auctionCard'),minimum=num('minimum'),ends=Date.parse(text('ends')+':00+09:00'),c=state.catalog.find(c=>c.id===cardId);if(!Number.isFinite(ends))throw Error('마감 날짜와 시간을 입력해 주세요.');confirm('경매를 열까요?',`<h3>${esc(c.name)}</h3><p>${esc(friendlyCardEffect(c.effect))}</p><p>최소 별 ${minimum}개 · ${datetime(ends)} 마감</p><p>개설 후 조건을 수정할 수 없어요.</p>`,{type:'auction',cardId,minimum,ends},()=>toast('경매를 열었어요.'));break;}
 case 'cancelAuction':confirm('경매를 취소할까요?','<p>입찰한 별과 예약 공간은 모두 반환됩니다.</p>',{type:'cancelAuction'},()=>toast('경매를 취소했어요.'));break;
 case 'edit':edit(id);break;
 case 'poopFilter':if(poopFilters.some(([key])=>key===id)){poopFilter=id;poopReviewQueue=[];render();}break;
 case 'poopReviewStart':poopReviewQueue=filteredPoop().map(c=>({suit:c.suit,rank:c.rank}));if(poopReviewQueue.length)editPoop(poopReviewQueue[0].suit,poopReviewQueue[0].rank);break;
 case 'poopReviewNext':{await commit({type:'poopEdit',suit:id,rank:x,expectedVersion:Number(action.split(':')[3]),effect:text('poopEffect'),reviewStatus:'확정'});poopReviewQueue=poopReviewQueue.filter(c=>!(c.suit===id&&c.rank===x)&&filteredPoop().some(r=>r.suit===c.suit&&r.rank===c.rank));if(poopReviewQueue.length){editPoop(poopReviewQueue[0].suit,poopReviewQueue[0].rank);toast('확정했어요. 다음 카드를 확인해 주세요.');}else{close();toast('선택한 카드 확인을 마쳤어요.');}break;}
 case 'poopEdit':poopReviewQueue=[];editPoop(id,x);break;
 case 'poopSave':await commit({type:'poopEdit',suit:id,rank:x,expectedVersion:Number(action.split(':')[3]),effect:text('poopEffect'),reviewStatus:text('poopReview')});close();toast('저장했어요. 보유 카드에도 반영됐어요.');break;
 case 'saveCard':{const card={id:id==='new'?null:id,name:text('editName'),effect:text('editEffect'),emoji:text('editEmoji'),tier:text('editTier'),enabled:text('editEnabled')==='true'};confirm('카드 내용을 저장할까요?',`<h3>${esc(card.emoji)} ${esc(card.name)}</h3><p>${esc(card.effect)}</p><p class="notice">기존 카드의 약속은 유지돼요. 새 공급부터 적용됩니다.</p>`,{type:'catalog',card},()=>toast('저장했어요.'));break;}
 case 'manage':manage(id);break;
 case 'restore':restore(id);break;
 case 'restoreSave':{const expires=Date.parse(text('restoreDate')+'T23:59:59.999+09:00'),reason=text('restoreReason');if(!Number.isFinite(expires))throw Error('날짜를 입력해 주세요.');confirm('연장·복구할까요?',`<p>새 만료일 ${date(expires)}</p><p>${esc(reason)}</p>`,{type:'restore',id,expires,reason},()=>toast('처리했어요.'));break;}
 case 'replace':replace(id);break;
 case 'replaceSave':{const target=text('replaceTarget'),reason=text('replaceReason'),c=state.catalog.find(c=>c.id===target);if(!c)throw Error('대체 카드를 선택해 주세요.');confirm('카드를 교체할까요?',`<p>대체 카드: ${esc(c.name)}</p><p>${esc(reason)}</p><p>기존 만료일을 유지합니다.</p>`,{type:'replace',id,target,reason},()=>toast('교체했어요.'));break;}
 case 'correct':{const player=text('corKid'),amount=num('corAmount'),reason=text('corReason');confirm('오지급을 정정할까요?',`<p>${E.NAMES[player]} 별 ${amount}개 회수</p><p>${esc(reason)}</p>`,{type:'correct',player,amount,reason},()=>toast('정정 기록을 남겼어요.'));break;}
 case 'bootstrap':{if(pinSubmitting)return;pinSubmitting=true;try{accept(await api('bootstrap',{role:text('bootstrapRole'),name:text('bootstrapName'),pin:text('bootstrapPin')}));render();await sync();}finally{pinSubmitting=false;}break;}
 case 'join':{accept(await api('join',{token:enrollToken,name:text('joinName')}));enrollToken='';sessionStorage.removeItem('wish-enroll');render();break;}
 case 'invite':{const data=await api('invite',{role:text('inviteRole'),name:text('inviteName')});accept(data);const inv=data.result,url=new URL(familyHomeURL());url.hash='enroll='+inv.token;const q=window.qrcode(0,'M');q.addData(url.href);q.make();modal(`<h2>새 기기에서 스캔해 주세요</h2><p>${esc(inv.name)} · ${datetime(inv.expires)}까지 · 한 번만 사용</p><div class="qr">${q.createImgTag(4,8,'기기 연결 QR')}</div><p>스캔한 기기에서 연결 요청을 보낸 뒤 이 창을 닫고 승인해 주세요.</p><label for="inviteLink">연결 링크</label><input id="inviteLink" value="${esc(url.href)}" readonly><p class="muted">가족 기기에만 전달해 주세요.</p>`);break;}
 case 'approve':{accept(await api('approve',{id}));devices=(await api('devices')).devices;render();toast('기기를 승인했어요. 새 기기 화면이 자동으로 열립니다.');break;}
 case 'revoke':{modal(`<h2>기기 접근을 해제할까요?</h2><p>이 기기는 가족 데이터에 접근할 수 없게 됩니다. 별과 카드는 유지됩니다.</p>${btn('해제하기',`revokeConfirm:${id}`,'danger')}`);break;}
 case 'revokeConfirm':{accept(await api('revoke',{id}));close();if(adminOK())devices=(await api('devices')).devices;render();break;}
 case 'logout':{accept(await api('logout',{}));close();render();break;}
 case 'retry':await sync();render();break;
 case 'importLegacy':{modal(`<h2>기존 데이터 가져오기</h2><p>이 브라우저에 남아 있는 프로토타입 데이터를 가족 서버로 옮깁니다. 진행 중이던 경매는 취소합니다. 서버 게임 시작 전에 한 번만 가능합니다.</p>${btn('가져오기','importConfirm','primary')}`);break;}
 case 'importConfirm':{const game=JSON.parse(localStorage.getItem(KEY));accept(await api('import',{game}));close();render();toast('서버에 가져왔어요.');break;}
 case 'export':{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='wish-deck-prototype-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);break;}
}}
document.addEventListener('click',e=>{if(e.target.closest('[data-week-remove]')){e.target.closest('.weekly-edit-row').remove();return;}if(Date.now()<eggIgnoreClickUntil&&e.target.closest('[data-act^=egg]'))return;const b=e.target.closest('[data-act]');if(!b||b.disabled)return;handle(b.dataset.act).catch(error);});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('#pin,#bootstrapPin')){if(e.isComposing)return;e.preventDefault();if(e.repeat||pinSubmitting)return;const action=e.target.id==='pin'?'pinConfirm':'bootstrap';const button=document.querySelector(`[data-act="${action}"]`);if(button&&!button.disabled)button.click();return;}if(e.target.matches('.flip-back[data-act]')&&!e.target.matches('button')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();handle(e.target.dataset.act).catch(error);}});
document.addEventListener('input',e=>updateAwardInput(e.target));
document.addEventListener('change',e=>{if(e.target.matches('[data-swap-history-date]')){changeSwapHistoryDate(e.target.dataset.swapHistoryDate,e.target.value);return;}if(e.target.matches('[data-history-date]')){changeHistoryDate(e.target.dataset.historyDate,e.target.value);return;}if(e.target.matches('[data-award-task]')){const d=awardDrafts[e.target.dataset.awardTask];d.taskId=e.target.value;d.request=null;render();return;}if(e.target.id==='quoteWeekStart'||/^quoteDay[0-6]$/.test(e.target.id))refreshQuoteWeek();if(e.target.id==='missionLevel'&&$('#missionMode'))$('#missionMode').value='manual';if(e.target.id==='instance')detail(e.target.value);if(e.target.id==='logFilter'){logFilter=e.target.value;logPage=0;$('#logList').innerHTML=logsHTML(logFilter);}});
let lastHeartbeat=0;
for(const evt of ['pointerdown','keydown'])document.addEventListener(evt,()=>{lastActivity=Date.now();if(adminOK()&&Date.now()-lastHeartbeat>60000){lastHeartbeat=Date.now();api('heartbeat',{}).then(accept).catch(()=>{});}});
setInterval(()=>{if(!document.hidden){updateMarketCountdown();sync();}},3000);
window.addEventListener('focus',()=>sync());document.addEventListener('visibilitychange',()=>{if(document.hidden){missionSound.stop();tutorVoice.stop();}else sync();});
window.addEventListener('hashchange',()=>{const params=new URLSearchParams(location.hash.slice(1));if(params.get('redeem')){redeemId=params.get('redeem');sessionStorage.setItem('wish-redeem',redeemId);}history.replaceState(null,'',location.pathname+location.search);sync();});
$('#modal').addEventListener('cancel',e=>{if($('.draw-result[data-unopened="true"]'))e.preventDefault();});
$('#modal').addEventListener('close',()=>queueMicrotask(maybeStarReward));
render();sync();

document.addEventListener('pointerdown',e=>{const target=e.target.closest('[data-egg-drag]');if(!target||target.disabled||busy||eggMoving)return;eggDrag={id:e.pointerId,x:e.clientX,y:e.clientY,type:target.dataset.eggDrag,slot:Number(target.dataset.slot),ghost:null};target.setPointerCapture?.(e.pointerId);});
document.addEventListener('pointermove',e=>{if(!eggDrag||e.pointerId!==eggDrag.id)return;if(!eggDrag.ghost&&Math.hypot(e.clientX-eggDrag.x,e.clientY-eggDrag.y)>8){const ghost=document.createElement('span');ghost.className='egg-shape egg-drag-ghost';document.body.append(ghost);eggDrag.ghost=ghost;}if(eggDrag.ghost){e.preventDefault();eggDrag.ghost.style.left=e.clientX+'px';eggDrag.ghost.style.top=e.clientY+'px';}},{passive:false});
document.addEventListener('pointerup',e=>{if(!eggDrag||e.pointerId!==eggDrag.id)return;const drag=eggDrag;eggDrag=null;if(!drag.ghost)return;drag.ghost.remove();eggIgnoreClickUntil=Date.now()+500;const target=document.elementFromPoint(e.clientX,e.clientY);if(drag.type==='add'&&target?.closest('[data-egg-zone="tray"]')){const cell=target.closest('[data-slot]'),slot=cell?Number(cell.dataset.slot):nextEggSlot();const q=state.todayMission?.run?.question;if(slot>=q.egg.initial&&!q.egg.slots.includes(slot))moveEgg('tutorMove',slot);}else if(drag.type==='remove'&&target?.closest('[data-egg-zone="basket"]'))moveEgg('tutorMove',drag.slot);});
document.addEventListener('pointercancel',()=>{eggDrag?.ghost?.remove();eggDrag=null;});
