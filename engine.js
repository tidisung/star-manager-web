import {applyPoopEffect,editPoopDefinition} from './poop-effects.js';
import {pokerHand} from './poker.js';
import {migrationIssue,ensureSharedDeck,assertDeck,hand,deckPool,viewCard,physicalByHolding,takeCard,returnCard,validCandidate,refillCandidates,deckCounts} from './shared-deck.js';
export {migrationIssue,ensureSharedDeck,assertDeck,deckPool,deckCounts};
export const NAMES={melody:'멜로디',areum:'아름이'};
export const TIERS={poop:'똥카드',silver:'은카드',gold:'금카드'};
export const COST={poop:2,silver:8,gold:24};
export const SWAP_COST={poop:10,silver:null,gold:null};
const DAY=86400000;
export const uid=()=>globalThis.crypto.randomUUID();
export function seedCatalog(){return [
['tissue','휴지 재벌','🧻','부모에게 휴지 한 장을 정중하게 전달받기'],['olive','올리브 구조대','🫒','부모가 올리브 한 개 대신 먹어주기'],['royal','왕실 인사','👑','부모가 “공주님, 안녕하십니까” 하고 인사하기'],['penguin','펭귄 출동','🐧','부모가 펭귄 걸음으로 거실 한 바퀴 돌기'],['clap','10초 스타','👏','부모에게 박수와 환호를 10초 동안 받기'],['mute','아빠 음소거','🤫','아빠가 30초 동안 말하지 않기'],['nickname','이름은 내 마음대로','🎭','부모 한 명을 5분 동안 서로 동의한 웃긴 별명으로 부르기'],['draw','그림의 대가','🎨','부모가 내가 고른 동물을 30초 안에 그려주기'],
['ramen','한강에서 라면','🍜','한강에서 카드 주인이 먹을 라면 1개. 추가 간식 제외.','silver'],['daiso','다이소 장난감','🧸','다이소 장난감 구매 합계 1만 원 이하. 차액 반환·합산 불가.','silver'],['traders','트레이더스 먹거리','🍩','트레이더스 먹거리 구매 합계 2만 원 이하. 차액 반환·합산 불가.','silver'],['cash','현금 5만 원','💵','카드 주인에게 현금 5만 원 지급.','gold'],['toy','큰 장난감','🎁','장난감 한 개 7만 원 이하. 용돈 보태기·차액 반환 불가.','gold'],['cafe','키즈카페','🎪','카드 주인 한 명의 기본 이용 2시간. 별도 유료 체험 제외.','gold']
].map(([id,name,emoji,effect,tier='poop'])=>({id,name,emoji,effect,tier,enabled:true}));}
export function randomIndex(n){if(!n)throw Error('선택 가능한 카드가 없어요.');const range=4294967296,limit=range-range%n;let v;do{v=crypto.getRandomValues(new Uint32Array(1))[0];}while(v>=limit);return v%n;}
export function monthEnd(time,months){const d=new Date(time+9*3600000);const y=d.getUTCFullYear(),m=d.getUTCMonth()+months,day=d.getUTCDate();const last=new Date(Date.UTC(y,m+1,0)).getUTCDate();return Date.UTC(y,m,Math.min(day,last),23,59,59,999)-9*3600000;}
export function nextSaturday(now){const d=new Date(now+9*3600000);let t=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+((6-d.getUTCDay()+7)%7),9)-9*3600000;if(t<=now)t+=7*DAY;return t;}
export function initial(){return {version:1,started:false,players:{melody:{stars:0},areum:{stars:0}},catalog:seedCatalog(),cards:[],market:[],nextRefresh:null,auction:null,history:[],priority:null,logs:[],notices:{melody:[],areum:[]},requests:[]};}
export function log(s,actor,kind,text,data={},now=Date.now()){s.logs.unshift({id:uid(),actor,kind,text,data,at:now});}
function notice(s,p,text,extra={}){s.notices[p].push({id:uid(),text,...extra});}
export function owned(s,p){return hand(s,p);}
export function held(s,p){return s.auction?.bids[p]??0;}
export function available(s,p){return s.players[p].stars-held(s,p);}
export function reservations(){return [];}
export function capacity(){return '';}
export function possible(s,p,tier){return deckPool(s,tier).length?'':`${TIERS[tier]} 공용 덱에 남은 카드가 없어요.`;}
export function swapPool(s,p,c){return deckPool(s,c.tier);}
export function swapError(s,p,c){
 if(!c||c.owner!==p||c.status!=='active')return '현재 교체할 수 없는 카드예요.';
 if(!SWAP_COST[c.tier])return '은·금카드 교체는 가격이 정해지면 열려요.';
 return possible(s,p,c.tier);
}
export function ensurePoker(s){return ensureSharedDeck(s);}
function refreshSwapOffers(s,p){for(const [id,o] of Object.entries(s.swapOffers||{}))if(o.owner===p)delete s.swapOffers[id];}
function prepareSwap(s,p,c){
 s.swapOffers ||= {};const old=s.swapOffers[c.holding.id],candidates=refillCandidates(s,old?.candidates,c.tier,randomIndex);
 const unchanged=old&&JSON.stringify(old.candidates)===JSON.stringify(candidates);
 const offer=unchanged?old:{id:uid(),owner:p,cardId:c.holding.id,candidates};s.swapOffers[c.holding.id]=offer;return offer;
}
function fusionMaterials(s,p,ids){
 if(!Array.isArray(ids))throw Error('합칠 카드를 선택해 주세요.');
 const unique=[...new Set(ids)],cards=unique.map(id=>active(s,p,id)),tier=cards[0]?.tier;
 const target=tier==='poop'?'silver':tier==='silver'?'gold':null,count=tier==='poop'?5:3;
 if(!target||cards.length!==count||cards.some(c=>c.tier!==tier))throw Error('합성 재료의 등급과 수량을 확인해 주세요.');
 return {ids:unique,cards,tier,target,pool:deckPool(s,target),hand:tier==='poop'?pokerHand(cards):null};
}
function prepareFusion(s,p,m){
 if(m.tier!=='poop'||m.hand==='하이카드')return {hand:m.hand,mode:'random'};
 const key=[...m.ids].sort().join('|');s.fusionOffers ||= {};
 const old=s.fusionOffers[p]?.key===key?s.fusionOffers[p]:null,candidates=refillCandidates(s,old?.candidates,m.target,randomIndex);
 if(old&&JSON.stringify(old.candidates)===JSON.stringify(candidates))return old;
 return s.fusionOffers[p]={id:uid(),key,ids:m.ids,hand:m.hand,mode:'choice',candidates};
}
function grant(s,p,c,now,expires=monthEnd(now,3)){return takeCard(s,p,c,now,expires);}
function integer(n,min=1){if(!Number.isSafeInteger(n)||n<min)throw Error('올바른 정수 개수를 입력해 주세요.');}
function spend(s,p,n){integer(n);if(available(s,p)<n)throw Error('사용할 수 있는 별이 부족해요.');s.players[p].stars-=n;}
function card(s,id){const c=physicalByHolding(s,id);if(!c)throw Error('이미 사용·반환되었거나 현재 보유한 카드가 아니에요.');return c;}
function active(s,p,id){const c=card(s,id);if(c.location!==p)throw Error('현재 사용할 수 없는 카드예요.');return c;}
export function settle(s,now){
 const a=s.auction;if(!a||a.ends>now)return;const keys=Object.keys(a.bids);let winner=null,tie=false;
 if(keys.length===1)winner=keys[0];else if(keys.length===2){tie=a.bids.melody===a.bids.areum;winner=tie?s.priority:(a.bids.melody>a.bids.areum?'melody':'areum');}
 const physical=s.deck.find(c=>c.id===a.physicalId),stock=physical?.location==='deck'&&physical.stockVersion===a.stockVersion;
 s.auction=null;const result={...a,winner:stock?winner:null,tie,closed:now,...(!stock?{cancelReason:'공용 덱 재고가 변경되어 비용 없이 종료'}:{})};
 if(winner&&stock){spend(s,winner,a.bids[winner]);grant(s,winner,physical,now);refreshSwapOffers(s,winner);if(tie)s.priority=winner==='melody'?'areum':'melody';notice(s,winner,`${a.card.name} 낙찰 · 별 ${a.bids[winner]}개를 사용했어요.`);}
 for(const p of keys)if(!stock||p!==winner)notice(s,p,'경매가 끝났어요. 맡긴 별을 다시 사용할 수 있어요.');
 s.history.unshift(result);log(s,'시스템','auction',result.winner?`${NAMES[winner]} 경매 낙찰`:'경매 종료 · 별 차감 없음',result,now);
}
export function tick(s,now=Date.now()){
 if(!ensureSharedDeck(s))return;
 for(const c of s.deck)if(c.location!=='deck'&&c.holding.expires<now){const owner=c.location,snapshot=returnCard(s,c,'expired',now);notice(s,owner,'기간이 끝난 카드가 공용 덱으로 돌아갔어요.');log(s,'시스템','card',`${NAMES[owner]} · ${snapshot.name} 만료`,{card:snapshot.id,snapshot},now);}
 settle(s,now);assertDeck(s);
}
export function action(s,a,now=Date.now()){
 tick(s,now);if(a.requestId&&s.requests.includes(a.requestId))return {duplicate:true};let result=null;const p=a.player,actor=a.actor||NAMES[p]||'부모';
 const issue=migrationIssue(s);if(issue&&!['award','correct','gift','dismiss','ackAwards'].includes(a.type))throw Error(issue.message);
 switch(a.type){
 case 'start':if(s.started)throw Error('이미 시작한 게임이에요.');s.started=true;log(s,actor,'admin','게임 시작',{},now);break;
 case 'award':{if(a.reason!==undefined&&(typeof a.reason!=='string'||a.reason.length>200))throw Error('지급 이유는 200자 이내로 적어 주세요.');const reason=(a.reason||'').trim();integer(a.amount);integer(s.players[p].stars+a.amount,0);const before=s.players[p].stars;s.players[p].stars+=a.amount;log(s,actor,'star',`${NAMES[p]}에게 별 ${a.amount}개 지급`,{player:p,amount:a.amount,reason,before,after:s.players[p].stars},now);notice(s,p,`별 ${a.amount}개를 받았어요.`,{kind:'award',amount:a.amount,from:actor});break;}
 case 'correct':{integer(a.amount);if(!a.reason?.trim())throw Error('정정 사유를 입력해 주세요.');const before=s.players[p].stars;spend(s,p,a.amount);log(s,actor,'admin',`${NAMES[p]} 별 ${a.amount}개 오지급 정정`,{player:p,reason:a.reason,before,after:s.players[p].stars},now);break;}
 case 'gift':{if(![1,2,3].includes(a.amount))throw Error('별은 1개, 2개, 3개 중에서 보낼 수 있어요.');const other=p==='melody'?'areum':'melody';integer(s.players[other].stars+a.amount,0);spend(s,p,a.amount);s.players[other].stars+=a.amount;log(s,actor,'star',`${NAMES[p]} → ${NAMES[other]} 별 ${a.amount}개 선물`,{from:p,to:other,amount:a.amount},now);notice(s,other,`${NAMES[p]}에게 별 ${a.amount}개를 받았어요.`);break;}

 case 'buy':throw Error('구매 방식이 바뀌었어요. 시장을 새로 열고 별 25개로 뽑아 주세요.');
 case 'draw':{
  if(a.purchaseToken!==s.purchaseTokens?.[p])throw Error('다른 화면에서 이미 구매했어요. 새로고침 후 다시 확인해 주세요.');
  const pool=deckPool(s,'poop');if(!pool.length)throw Error(possible(s,p,'poop'));
  spend(s,p,25);result=grant(s,p,pool[randomIndex(pool.length)],now);refreshSwapOffers(s,p);s.purchaseTokens[p]=uid();
  log(s,actor,'card',`${NAMES[p]} · ${result.name} 구매 · 별 25개`,{player:p,card:result.id,physicalId:result.physicalId,snapshot:result,cost:25},now);break;
 }
 case 'swapPrepare':{const c=active(s,p,a.id);if(!SWAP_COST[c.tier])throw Error('은·금카드 교체는 준비 중이에요.');const offer=prepareSwap(s,p,c);if(!offer.candidates.length)throw Error(possible(s,p,c.tier));result=offer;break;}
 case 'swap':{
  const c=active(s,p,a.id);if(!SWAP_COST[c.tier])throw Error('은·금카드 교체는 준비 중이에요.');
  const old=s.swapOffers?.[a.id],candidate=old?.candidates.find(c=>c.id===a.candidateId);
  if(!old||old.owner!==p||old.id!==a.offerId||!candidate||!validCandidate(s,candidate)){
   result={conflict:true,message:'후보 재고가 바뀌었어요. 별과 카드는 그대로예요.',offer:prepareSwap(s,p,c)};break;
  }
  const target=s.deck.find(d=>d.id===candidate.id),before=s.players[p].stars,expires=c.holding.expires;
  spend(s,p,10);const previous=returnCard(s,c,'replaced',now);result=grant(s,p,target,now,expires);refreshSwapOffers(s,p);
  log(s,actor,'card',`${NAMES[p]} · ${previous.name} → ${result.name} 교체 · 별 10개`,{player:p,old:previous.id,new:result.id,oldName:previous.name,newName:result.name,oldPoker:previous.poker,newPoker:result.poker,tier:c.tier,cost:10,before,after:s.players[p].stars,oldPhysicalId:c.id,newPhysicalId:target.id},now);break;
 }
 case 'fusePrepare':{const m=fusionMaterials(s,p,a.ids);if(!m.pool.length)throw Error(possible(s,p,m.target));result=prepareFusion(s,p,m);break;}
 case 'fuse':{
  const m=fusionMaterials(s,p,a.ids);let chosen;
  if(m.tier==='poop'&&m.hand!=='하이카드'){
   const old=s.fusionOffers?.[p],candidate=old?.candidates.find(c=>c.id===a.candidateId);
   if(!old||old.key!==[...m.ids].sort().join('|')||old.id!==a.offerId||!candidate||!validCandidate(s,candidate)){
    result={conflict:true,message:'은카드 후보 재고가 바뀌었어요. 재료 카드는 그대로예요.',offer:prepareFusion(s,p,m)};break;
   }
   chosen=s.deck.find(c=>c.id===candidate.id);
  }else{if(!m.pool.length)throw Error(possible(s,p,m.target));chosen=m.pool[randomIndex(m.pool.length)];}
  const materials=m.cards.map(c=>returnCard(s,c,'fused',now));result=grant(s,p,chosen,now);if(s.fusionOffers)delete s.fusionOffers[p];
  log(s,actor,'card',`${NAMES[p]} · ${result.name} 승급`,{player:p,materials,pokerHand:m.hand,result:result.id,snapshot:result},now);break;
 }
 case 'extend':{const c=active(s,p,a.id);if(c.holding.expires-now>14*DAY)throw Error('만료 14일 전부터 연장할 수 있어요.');spend(s,p,COST[c.tier]);const before=c.holding.expires;c.holding.expires=monthEnd(before,1);log(s,actor,'card',`${NAMES[p]} · ${c.name} 1개월 연장`,{before,after:c.holding.expires},now);result=viewCard(c);break;}
 case 'use':{const c=card(s,a.id);result=returnCard(s,c,'used',now);log(s,actor,'card',`${NAMES[result.owner]} · ${result.name} 사용 완료`,{card:result.id,effect:result.effect,snapshot:result},now);break;}
 case 'auction':{
  if(s.auction)throw Error('이미 진행 중인 경매가 있어요.');const t=s.catalog.find(c=>c.id===a.cardId);if(!t||t.tier==='gold')throw Error('똥카드나 은카드를 선택해 주세요.');
  integer(a.minimum);if(!Number.isFinite(a.ends)||a.ends<=now)throw Error('미래의 마감 시간을 정해 주세요.');const pool=deckPool(s,t.tier).filter(c=>c.type===t.id);if(!pool.length)throw Error('공용 덱에 해당 소원 카드가 없어요.');
  const c=pool[randomIndex(pool.length)];if(!s.priority)s.priority=randomIndex(2)?'melody':'areum';s.auction={id:uid(),card:structuredClone(c),physicalId:c.id,stockVersion:c.stockVersion,minimum:a.minimum,ends:a.ends,bids:{},created:now};log(s,actor,'admin',`${t.name} 경매 개설`,{minimum:a.minimum,ends:a.ends},now);break;
 }
 case 'bid':{const au=s.auction;if(!au)throw Error('진행 중인 경매가 없어요.');if(Object.hasOwn(au.bids,p))throw Error('이미 입찰했어요.');integer(a.amount,au.minimum);if(available(s,p)<a.amount)throw Error('별이 부족해요.');if(!s.deck.some(c=>c.id===au.physicalId&&c.location==='deck'&&c.stockVersion===au.stockVersion))throw Error('경매 카드의 재고가 바뀌었어요.');au.bids[p]=a.amount;break;}
 case 'cancelAuction':{if(!s.auction)throw Error('진행 중인 경매가 없어요.');for(const p of Object.keys(s.auction.bids))notice(s,p,'경매가 취소되어 맡긴 별이 반환됐어요.');log(s,actor,'admin','경매 취소',{},now);s.auction=null;break;}
 case 'poopEdit':{const change=editPoopDefinition(s,a,actor,now);log(s,actor,'admin',`${a.suit}${a.rank} 똥카드 문구·검수 상태 수정`,change,now);result=change.after;break;}
 case 'catalog':{const d=a.card;const old=s.catalog.find(c=>c.id===d.id);if(!d.name?.trim()||!d.effect?.trim()||!TIERS[d.tier])throw Error('이름·혜택·등급을 확인해 주세요.');if(s.catalog.some(c=>c.id!==d.id&&c.name===d.name.trim()))throw Error('이미 같은 이름의 카드가 있어요.');if(old&&old.tier!==d.tier)throw Error('등급 변경은 새 종류로 만들어 주세요.');const next={id:old?.id||uid(),name:d.name.trim(),effect:d.effect.trim(),emoji:d.emoji||'🎴',tier:d.tier,enabled:!!d.enabled};const list=old?s.catalog.map(c=>c.id===old.id?next:c):[...s.catalog,next];for(const tier of Object.keys(TIERS))if(list.filter(c=>c.tier===tier&&c.enabled).length<(tier==='poop'?3:1))throw Error('똥카드는 최소 3종, 은·금카드는 최소 1종 공급해야 해요.');s.catalog=list;for(const c of s.deck.filter(c=>c.location==='deck'&&c.type===next.id)){c.name=next.name;c.emoji=next.emoji;c.effect=next.effect;applyPoopEffect(c,s);c.stockVersion++;}log(s,actor,'admin',`${next.name} ${old?'수정':'추가'} · 새 공급부터 적용`,{before:old,after:next},now);break;}

 case 'restore':case 'freeExtend':{
  if(!a.reason?.trim()||!Number.isFinite(a.expires)||a.expires<now)throw Error('사유와 새 만료일을 확인해 주세요.');
  const current=physicalByHolding(s,a.id);if(current){current.holding.expires=a.expires;result=viewCard(current);}else{
   const record=s.cardHistory.find(c=>c.id===a.id);if(!record||!['used','expired'].includes(record.status)||record.restoredAt)throw Error('복구할 수 없는 카드예요.');
   const target=record.physicalId?s.deck.find(c=>c.id===record.physicalId):deckPool(s,record.tier).find(c=>c.type===record.type);
   if(!target||target.location!=='deck')throw Error('해당 카드는 이미 다른 손패에 있어 복구할 수 없어요.');
   result=grant(s,record.owner,target,now,a.expires);record.restoredAt=now;record.restoredAs=result.id;
  }
  log(s,actor,'admin','카드 연장·복구',{reason:a.reason,result:result.id},now);break;
 }
 case 'replace':{
  const c=card(s,a.id),pool=deckPool(s,c.tier).filter(t=>t.type===a.target);if(!pool.length||!a.reason?.trim())throw Error('공용 덱에 있는 같은 등급의 대체 카드와 사유를 확인해 주세요.');
  const owner=c.location,expires=c.holding.expires,old=returnCard(s,c,'replaced',now);result=grant(s,owner,pool[randomIndex(pool.length)],now,expires);refreshSwapOffers(s,owner);log(s,actor,'admin','제공 불가 카드 예외 교체',{old:old.id,new:result.id,reason:a.reason},now);break;
 }
 case 'dismiss':s.notices[p]=s.notices[p].filter(n=>n.kind==='award');break;
 case 'ackAwards':{if(!Array.isArray(a.ids)||a.ids.some(id=>typeof id!=='string'))throw Error('받을 별을 확인해 주세요.');const ids=new Set(a.ids);const found=s.notices[p].filter(n=>n.kind==='award'&&ids.has(n.id));result={amount:found.reduce((sum,n)=>sum+n.amount,0),ids:found.map(n=>n.id)};s.notices[p]=s.notices[p].filter(n=>n.kind!=='award'||!ids.has(n.id));break;}
 default:throw Error('지원하지 않는 동작이에요.');
 }
 assertDeck(s);if(a.requestId)s.requests.push(a.requestId);return result;
}
export function transact(state,a,now=Date.now()){const next=structuredClone(state);const result=action(next,a,now);return {state:next,result};}
