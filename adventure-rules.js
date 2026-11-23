import {army,rollSlots,simulateWave,spinCost,UPGRADES} from './adventure-core.js';
import {available,randomIndex,log,NAMES,monthEnd} from './engine.js';
import {deckPool,takeCard} from './shared-deck.js';
const uuid=()=>crypto.randomUUID();
const ended=r=>!r||['won','lost','abandoned'].includes(r.phase);
export function adventureView(game,p){return game.adventures?.[p]||null;}
export function adventureAction(game,a,now=Date.now()){
 const p=a.player;game.adventures ||= {};let r=game.adventures[p];
 if(a.type==='adventureStart'){
  if(!ended(r))throw Error('진행 중인 모험을 먼저 마쳐 주세요.');
  if((r?.id||null)!==(a.previousRunId||null))throw Error('다른 화면에서 모험이 바뀌었어요. 새로고침해 주세요.');
  if(!Number.isSafeInteger(a.stars)||a.stars<1||a.stars>10)throw Error('별은 1개부터 10개까지 넣을 수 있어요.');
  if(available(game,p)<a.stars)throw Error('쓸 수 있는 별이 부족해요.');
  if(!deckPool(game,'poop').length)throw Error('보상 똥카드가 모두 나갔어요. 카드가 돌아오면 도전해 주세요.');
  game.players[p].stars-=a.stars;
  r={id:uuid(),version:0,phase:'prepare',wave:1,hp:12,shield:0,coins:a.stars*100,stars:a.stars,startedAt:now,
   recruits:{cat:1,rabbit:0,bear:0},shards:{cat:0,rabbit:0,bear:0},upgrades:[],grid:[],history:[],offers:[]};
  game.adventures[p]=r;log(game,NAMES[p],'adventure',`${NAMES[p]} · 별 ${a.stars}개로 모험 시작`,{player:p,runId:r.id,stars:a.stars},now);return {runId:r.id};
 }
 if(!r||a.runId!==r.id||a.version!==r.version)throw Error('모험 상태가 바뀌었어요. 최신 화면에서 다시 눌러 주세요.');
 if(a.type==='adventureSpin'){
  if(r.phase!=='prepare')throw Error('준비 시간에만 슬롯을 돌릴 수 있어요.');
  const cost=spinCost(r);if(r.coins<cost)throw Error('슬롯을 돌릴 코인이 부족해요. 전투에서 코인을 모아봐요.');
  r.coins-=cost;rollSlots(r,randomIndex);
 }else if(a.type==='adventureBattle'){
  if(r.phase!=='prepare'||!army(r).length)throw Error('친구를 준비한 뒤 출발해 주세요.');
  r.battle={...simulateWave(r),startedAt:now};r.battle.endsAt=now+r.battle.duration;r.phase='battle';
 }else if(a.type==='adventureFinish'){
  if(r.phase!=='battle'||now<r.battle.endsAt)throw Error('전투가 끝날 때까지 기다려 주세요.');
  const b=r.battle;r.hp=b.hp;r.shield=b.shield;r.coins+=b.coins;
  r.history.push({wave:r.wave,kills:b.kills,leaks:b.leaks,coins:b.coins,total:b.total});
  delete r.battle;
  if(r.hp<=0||(r.wave===6&&!b.bossKilled))r.phase='lost';
  else if(r.wave===6){r.phase='reward';}
  else{r.phase='upgrade';const pool=[...UPGRADES];r.offers=Array.from({length:3},()=>pool.splice(randomIndex(pool.length),1)[0].id);}
 }else if(a.type==='adventureUpgrade'){
  if(r.phase!=='upgrade'||!r.offers.includes(a.upgrade))throw Error('화면에 나온 강화 중 하나를 골라 주세요.');
  r.upgrades.push(a.upgrade);if(a.upgrade==='heal')r.hp=Math.min(12,r.hp+5);if(a.upgrade==='shield')r.shield+=3;
  r.offers=[];r.wave++;r.phase='prepare';
 }else if(a.type==='adventureClaim'){
  if(r.phase!=='reward')throw Error('보스를 처치한 뒤 보상을 받을 수 있어요.');
  const pool=deckPool(game,'poop');if(!pool.length)throw Error('지금은 공용 덱이 비어 있어요. 보상은 보관되니 카드가 돌아오면 다시 받아 주세요.');
  r.reward=takeCard(game,p,pool[randomIndex(pool.length)],now,monthEnd(now,3));r.phase='won';r.finishedAt=now;
  log(game,NAMES[p],'card',`${NAMES[p]} · 보스 처치 보상 ${r.reward.name}`,{player:p,runId:r.id,snapshot:r.reward,card:r.reward.id},now);
 }else if(a.type==='adventureAbandon'){
  if(!['prepare','upgrade'].includes(r.phase))throw Error('준비 시간에만 도전을 끝낼 수 있어요.');
  r.phase='abandoned';r.finishedAt=now;
 }else throw Error('지원하지 않는 모험 동작이에요.');
 r.version++;return {runId:r.id,phase:r.phase};
}
