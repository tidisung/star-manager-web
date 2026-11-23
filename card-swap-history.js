import {pokerLabel} from './poker.js?v=76';
import {shiftHistoryDate} from './award-history.js?v=74';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tiers={poop:'똥카드',silver:'은카드',gold:'금카드'};
const time=at=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit'}).format(at);
export function cardSwapHistory(logs,cards,player,day){
 const byId=new Map(cards.map(c=>[c.id,c]));
 return logs.filter(l=>l.kind==='card'&&l.data?.player===player&&typeof l.data.old==='string'&&typeof l.data.new==='string'&&Number.isSafeInteger(l.data.cost)&&l.data.cost>0&&Number.isFinite(l.at)&&(!day||new Date(l.at+9*3600000).toISOString().slice(0,10)===day)).map(l=>{
  const d=l.data,old=byId.get(d.old),next=byId.get(d.new);
  return {id:l.id,at:l.at,cost:d.cost,from:(d.oldName||old?.name||'이전 카드')+(d.oldPoker?' · '+pokerLabel(d.oldPoker):''),to:(d.newName||next?.name||'새 카드')+(d.newPoker?' · '+pokerLabel(d.newPoker):''),tier:d.tier||old?.tier||next?.tier};
 }).sort((a,b)=>b.at-a.at);
}
export function cardSwapHistoryHTML(logs,cards,player,name,day,today=day){
 const entries=cardSwapHistory(logs,cards,player,day),total=entries.reduce((sum,e)=>sum+e.cost,0);
 return `<section class="card-swap-history" data-swap-history-player="${player}" aria-label="${esc(name)} 카드 교체 내역"><div class="award-history-heading"><h3>카드 교체 내역</h3><span>${day?'선택일':'전체'} ${entries.length}건</span></div>${day?`<div class="award-history-date"><label for="swap-history-date-${player}">조회 날짜</label><button type="button" class="small" data-act="swapHistoryStep:${player}:-1" aria-label="${esc(name)} 카드 교체 이전날" ${shiftHistoryDate(day,-1,today)?'':'disabled'}>이전날</button><input id="swap-history-date-${player}" type="date" data-swap-history-date="${player}" aria-label="${esc(name)} 카드 교체 조회 날짜" value="${esc(day)}" max="${esc(today)}"><button type="button" class="small" data-act="swapHistoryStep:${player}:1" aria-label="${esc(name)} 카드 교체 다음날" ${shiftHistoryDate(day,1,today)?'':'disabled'}>다음날</button><button type="button" class="small" data-act="swapHistoryToday:${player}" ${day===today?'disabled':''}>오늘</button></div>`:''}<p class="swap-history-total">교체에 쓴 별 <strong>${total}개</strong></p>${entries.length?`<div class="swap-history-scroll" tabindex="0" role="region" aria-label="${esc(name)} 카드 교체 목록"><ol>${entries.map(e=>`<li><div class="swap-history-meta"><span>${esc(tiers[e.tier]||'카드 교체')}</span><strong>별 ${e.cost}개 사용</strong></div><dl><div><dt>이전 카드</dt><dd>${esc(e.from)}</dd></div><div><dt>새 카드</dt><dd>${esc(e.to)}</dd></div></dl><time datetime="${new Date(e.at).toISOString()}">${time(e.at)}</time></li>`).join('')}</ol></div>`:`<p class="award-history-empty">${day?'선택한 날짜에 교체한 카드가 없어요.':'아직 교체한 카드가 없어요.'}</p>`}</section>`;
}
