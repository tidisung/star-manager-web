import {syncPoopEffects,applyPoopEffect} from './poop-effects.js';
import {RANKS,SUITS,validPoker,pokerKey} from './poker.js';
export const DECK_TIERS=['poop','silver','gold'];
const names={poop:'똥카드',silver:'은카드',gold:'금카드'};
const uuid=()=>crypto.randomUUID();
function pick(n){const limit=4294967296-4294967296%n;let x;do{x=crypto.getRandomValues(new Uint32Array(1))[0];}while(x>=limit);return x%n;}
export function migrationIssue(s){
 if(s.deckVersion===1)return null;
 const counts=Object.fromEntries(DECK_TIERS.map(t=>[t,{melody:0,areum:0,total:0}]));
 for(const c of s.cards||[])if(c.status==='active'&&counts[c.tier]&&['melody','areum'].includes(c.owner)){counts[c.tier][c.owner]++;counts[c.tier].total++;}
 const over=DECK_TIERS.filter(t=>counts[t].total>52);
 return over.length?{counts,message:'공용 덱 이전을 중단했어요. '+over.map(t=>`${names[t]} ${counts[t].total}장 (멜로디 ${counts[t].melody}장 · 아름이 ${counts[t].areum}장)`).join(', ')+'으로 등급당 52장을 넘어요. 원본 카드와 별은 그대로 보존되어 있어요.'}:null;
}
export function viewCard(c){return {...c,physicalId:c.id,id:c.holding.id,owner:c.location,status:'active',...c.holding};}
export function deckPool(s,tier){return s.deck?s.deck.filter(c=>c.tier===tier&&c.location==='deck'):(s.deckRemaining||[]).filter(c=>c.tier===tier);}
export function hand(s,p){return s.deck?s.deck.filter(c=>c.location===p).map(viewCard):(s.cards||[]).filter(c=>c.owner===p&&c.status==='active');}
export function deckCounts(s){return Object.fromEntries(DECK_TIERS.map(t=>[t,{deck:deckPool(s,t).length,melody:hand(s,'melody').filter(c=>c.tier===t).length,areum:hand(s,'areum').filter(c=>c.tier===t).length}]));}
export function assertDeck(s){
 if(s.deckVersion!==1)return;
 if(s.deck.length!==156||new Set(s.deck.map(c=>c.id)).size!==156)throw Error('공용 카드 수량이 올바르지 않아요.');
 for(const tier of DECK_TIERS){const cards=s.deck.filter(c=>c.tier===tier);if(cards.length!==52||new Set(cards.map(c=>pokerKey(c.poker))).size!==52)throw Error('공용 덱에 중복 카드가 있어요.');}
 const holds=[];for(const c of s.deck){if(c.familyId!==s.familyId||!validPoker(c.poker)||!['deck','melody','areum'].includes(c.location))throw Error('카드 위치가 올바르지 않아요.');if(c.location==='deck'){if(c.holding)throw Error('덱 카드에 소유 기록이 남아 있어요.');}else{if(!c.holding?.id)throw Error('손패 소유 기록이 없어요.');holds.push(c.holding.id);}}
 if(new Set(holds).size!==holds.length)throw Error('카드 사용 식별자가 중복되었어요.');
}
export function ensureSharedDeck(s){
 if(s.deckVersion===1){syncPoopEffects(s);return true;}
 if(migrationIssue(s))return false;
 const legacy=structuredClone(s.cards||[]),active=legacy.filter(c=>c.status==='active');
 if(active.some(c=>!DECK_TIERS.includes(c.tier)||!['melody','areum'].includes(c.owner)))throw Error('이전할 카드의 등급과 소유자를 확인해 주세요.');
 const familyId=s.familyId||uuid(),deck=[];
 for(const tier of DECK_TIERS){const templates=s.catalog.filter(c=>c.tier===tier);if(!templates.length)throw Error('등급별 소원 내용이 필요해요.');for(const [si,suit] of SUITS.entries())for(const [ri,rank] of RANKS.entries()){
 const t=templates[(si*13+ri)%templates.length];deck.push({id:`${familyId}-${tier}-${si}-${rank}`,familyId,tier,poker:{rank,suit},type:t.id,name:t.name,emoji:t.emoji,effect:t.effect,location:'deck',holding:null,stockVersion:0});
 }}
 // Reserve every valid unique legacy face before assigning missing/duplicate faces.
 const assigned=new Map(),used=new Set();
 for(const c of active){if(!validPoker(c.poker))continue;const physical=deck.find(d=>d.tier===c.tier&&pokerKey(d.poker)===pokerKey(c.poker));if(!used.has(physical.id)){assigned.set(c,physical);used.add(physical.id);}}
 for(const c of active)if(!assigned.has(c)){const free=deck.filter(d=>d.tier===c.tier&&!used.has(d.id)),physical=free[pick(free.length)];assigned.set(c,physical);used.add(physical.id);}
 for(const [c,d] of assigned){Object.assign(d,{type:c.type||c.id,name:c.name,emoji:c.emoji,effect:c.effect,location:c.owner,holding:{id:c.id||uuid(),acquired:c.acquired,expires:c.expires},stockVersion:1});}
 for(const card of deck)applyPoopEffect(card,s);
 const next={...s,familyId,deck,deckVersion:1};assertDeck(next);
 s.familyId=familyId;s.deck=deck;s.deckVersion=1;s.legacyCards=legacy;s.cardHistory=[...(s.cardHistory||[]),...legacy.filter(c=>c.status!=='active')];s.cards=[];
 s.legacyMarket=structuredClone(s.market||[]);s.market=[];s.nextRefresh=null;s.swapOffers={};s.fusionOffers={};
 if(s.auction&&!s.auction.physicalId){const a=s.auction,free=deck.filter(c=>c.location==='deck'&&c.tier===a.card.tier&&c.type===a.card.id),c=free.find(c=>pokerKey(c.poker)===pokerKey(a.card.poker))||free[0];a.physicalId=c?.id||null;a.stockVersion=c?.stockVersion;a.card=c?{...c}:a.card;}
 s.purchaseTokens={melody:uuid(),areum:uuid()};
 s.deckMigration={version:1,at:Date.now(),preserved:active.length,reassigned:active.filter(c=>pokerKey(c.poker)!==pokerKey(assigned.get(c).poker)).length};
 return true;
}
export function physicalByHolding(s,id){return s.deck.find(c=>c.holding?.id===id&&c.location!=='deck');}
export function takeCard(s,p,c,now,expires){
 if(!c||c.location!=='deck')throw Error('이 카드는 다른 가족이 먼저 가져갔어요.');
 applyPoopEffect(c,s);c.location=p;c.stockVersion++;c.holding={id:uuid(),acquired:now,expires};return viewCard(c);
}
export function returnCard(s,c,status,now){
 if(!c||c.location==='deck'||!c.holding)throw Error('이미 반환된 카드예요.');
 const snapshot={...viewCard(c),status,returnedAt:now,...(status==='used'?{usedAt:now}:{})};
 s.cardHistory ||= [];s.cardHistory.unshift(snapshot);c.location='deck';c.holding=null;c.stockVersion++;return snapshot;
}
export function validCandidate(s,c){const physical=s.deck.find(d=>d.id===c.id);return physical?.location==='deck'&&physical.stockVersion===c.stockVersion;}
export function refillCandidates(s,old,tier,randomIndex){
 const pool=deckPool(s,tier),kept=(old||[]).filter(c=>c.tier===tier&&validCandidate(s,c));
 const remaining=pool.filter(c=>!kept.some(k=>k.id===c.id));
 while(kept.length<2&&remaining.length)kept.push(structuredClone(remaining.splice(randomIndex(remaining.length),1)[0]));
 return kept;
}
