export const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export const SUITS=['♠','♥','♦','♣'];
export const SUIT_NAMES={'♠':'스페이드','♥':'하트','♦':'다이아','♣':'클로버'};
export const validPoker=p=>!!p&&RANKS.includes(p.rank)&&SUITS.includes(p.suit);
export const pokerKey=p=>validPoker(p)?p.rank+p.suit:'';
export function randomPoker(randomIndex,excluded=[]){
 const pool=SUITS.flatMap(suit=>RANKS.map(rank=>({rank,suit}))).filter(p=>!excluded.includes(pokerKey(p)));
 return pool[randomIndex(pool.length)];
}
export function pokerLabel(p){return validPoker(p)?`${p.rank} ${p.suit}`:'';}
export function pokerHTML(p){return validPoker(p)?`<span class="poker-mark ${['♥','♦'].includes(p.suit)?'red':'black'}" aria-label="${SUIT_NAMES[p.suit]} ${p.rank}"><span>${p.suit}</span><b>${p.rank}</b></span>`:'';}
export function pokerHand(cards){
 if(cards.length!==5||cards.some(c=>!validPoker(c.poker)))return '';
 const values=cards.map(c=>c.poker.rank==='A'?14:RANKS.indexOf(c.poker.rank)+1).sort((a,b)=>a-b);
 const counts=Object.values(values.reduce((m,v)=>(m[v]=(m[v]||0)+1,m),{})).sort((a,b)=>b-a);
 const flush=cards.every(c=>c.poker.suit===cards[0].poker.suit);
 const straight=new Set(values).size===5&&(values[4]-values[0]===4||values.join(',')==='2,3,4,5,14');
 if(flush&&straight)return values[0]===10?'로열 플러시':'스트레이트 플러시';
 if(counts[0]>=4)return '포카드';
 if(counts[0]===3&&counts[1]===2)return '풀하우스';
 if(flush)return '플러시';
 if(straight)return '스트레이트';
 if(counts[0]===3)return '트리플';
 if(counts[0]===2&&counts[1]===2)return '투페어';
 if(counts[0]===2)return '원페어';
 return '하이카드';
}

export const HAND_ORDER=['하이카드','원페어','투페어','트리플','스트레이트','플러시','풀하우스','포카드','스트레이트 플러시','로열 플러시'];
export function bestPokerHint(cards){
 const usable=cards.filter(c=>c.status==='active'&&c.tier==='poop'&&validPoker(c.poker));
 if(usable.length<5)return null;
 const ranks=new Map(RANKS.map(r=>[r,usable.filter(c=>c.poker.rank===r)]));
 const sequences=[['10','J','Q','K','A'],...Array.from({length:8},(_,i)=>RANKS.slice(8-i,13-i)),['A','2','3','4','5']];
 const straight=pool=>{for(const seq of sequences){const found=seq.map(r=>pool.find(c=>c.poker.rank===r));if(found.every(Boolean))return found;}return null;};
 let chosen=null;
 for(const suit of SUITS){const found=straight(usable.filter(c=>c.poker.suit===suit));if(found&&(!chosen||HAND_ORDER.indexOf(pokerHand(found))>HAND_ORDER.indexOf(pokerHand(chosen))))chosen=found;}
 const groups=[...ranks.values()].filter(g=>g.length).sort((a,b)=>b.length-a.length);
 const fill=(base,n=5)=>[...base,...usable.filter(c=>!base.includes(c))].slice(0,n);
 if(!chosen&&groups[0].length>=4)chosen=fill(groups[0].slice(0,4));
 if(!chosen){const triple=groups.find(g=>g.length>=3);const pair=groups.find(g=>g!==triple&&g.length>=2);if(triple&&pair)chosen=[...triple.slice(0,3),...pair.slice(0,2)];}
 if(!chosen)for(const suit of SUITS){const same=usable.filter(c=>c.poker.suit===suit);if(same.length>=5){chosen=same.slice(0,5);break;}}
 if(!chosen)chosen=straight(usable);
 if(!chosen&&groups[0].length>=3)chosen=fill(groups[0].slice(0,3));
 if(!chosen){const pairs=groups.filter(g=>g.length>=2);if(pairs.length>=2)chosen=fill([...pairs[0].slice(0,2),...pairs[1].slice(0,2)]);else if(pairs.length)chosen=fill(pairs[0].slice(0,2));}
 chosen ||= usable.slice(0,5);
 let comparisons=0;
 if(usable.length<=16){let score=-1;
  for(let a=0;a<usable.length-4;a++)for(let b=a+1;b<usable.length-3;b++)for(let c=b+1;c<usable.length-2;c++)for(let d=c+1;d<usable.length-1;d++)for(let e=d+1;e<usable.length;e++){
   const group=[usable[a],usable[b],usable[c],usable[d],usable[e]],value=HAND_ORDER.indexOf(pokerHand(group));comparisons++;
   if(value>score){score=value;chosen=group;}
  }
 }
 const hand=pokerHand(chosen);
 const clues={하이카드:'같은 숫자나 무늬, 이어지는 숫자를 찾아볼까?',원페어:'같은 숫자가 두 장 보이니?',투페어:'같은 숫자 두 장씩, 두 묶음을 찾을 수 있니?',트리플:'같은 숫자가 세 장 보이니?',스트레이트:'숫자가 다섯 장 연속으로 이어질 수 있니?',플러시:'같은 무늬 다섯 장을 찾아볼까?',풀하우스:'같은 숫자 세 장과 다른 숫자 두 장을 찾아볼까?',포카드:'같은 숫자가 네 장 보이니?','스트레이트 플러시':'같은 무늬로 숫자 다섯 장이 이어질 수 있니?','로열 플러시':'같은 무늬의 10, J, Q, K, A를 찾아볼까?'};
 const reasons={하이카드:'현재 카드에서는 원페어 이상의 조합을 만들 수 없어요. 이 다섯 장으로도 랜덤 은카드 한 장을 받을 수 있어요.',원페어:'같은 숫자가 두 장 있어요.',투페어:'같은 숫자 두 장짜리 묶음이 두 개예요.',트리플:'같은 숫자가 세 장 있어요.',스트레이트:'다섯 숫자가 연속으로 이어져요. A는 1 또는 가장 높은 숫자로 쓸 수 있어요.',플러시:'다섯 장의 무늬가 모두 같아요.',풀하우스:'같은 숫자 세 장과 다른 같은 숫자 두 장을 모았어요.',포카드:'같은 숫자가 네 장 있어요.','스트레이트 플러시':'다섯 장의 무늬가 같고 숫자가 연속으로 이어져요.','로열 플러시':'같은 무늬의 10, J, Q, K, A를 모두 모았어요.'};
 const grouped=[...new Set(chosen.map(c=>c.poker.rank))].map(rank=>({rank,count:chosen.filter(c=>c.poker.rank===rank).length})).sort((a,b)=>b.count-a.count);
 let reason=reasons[hand];
 if(hand==='풀하우스')reason=`${grouped[0].rank} 세 장과 ${grouped[1].rank} 두 장을 모아서 풀하우스야.`;
 else if(hand==='원페어')reason=`${grouped[0].rank} 두 장이 있어서 원페어야.`;
 else if(hand==='투페어')reason=`${grouped[0].rank} 두 장과 ${grouped[1].rank} 두 장을 모아서 투페어야.`;
 else if(hand==='트리플')reason=`${grouped[0].rank} 세 장을 모아서 트리플이야.`;
 else if(hand==='포카드')reason=`${grouped[0].rank} 네 장을 모아서 포카드야.`;
 return {ids:chosen.map(c=>c.id),hand,clue:clues[hand],reason,comparisons};
}
