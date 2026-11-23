const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seoulDate=at=>new Date(at+9*3600000).toISOString().slice(0,10);
const clock=at=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',hour:'numeric',minute:'2-digit'}).format(at);
const label=log=>log.data?.schedule?.category==='quote'?(log.data.reason||'명언 복습'):(log.data?.schedule?.labels?.join(', ')||log.data?.reason||'별 지급');
export function shiftHistoryDate(day,offset,today){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||![1,-1].includes(offset))return null;
 const at=Date.parse(day+'T00:00:00Z');
 if(!Number.isFinite(at)||new Date(at).toISOString().slice(0,10)!==day)return null;
 const next=new Date(at+offset*86400000).toISOString().slice(0,10);
 return next>='0001-01-01'&&next<=today?next:null;
}
export function todayAwardHistory(logs,player,day){
 if(!day)return {entries:[],given:0,recovered:0,net:0};
 const byId=new Map(logs.map(l=>[l.id,l]));
 const entries=logs.filter(l=>Number.isFinite(l.at)&&seoulDate(l.at)===day&&l.data?.player===player).flatMap(l=>{
  const d=l.data;
  if(l.kind==='star'&&Number.isSafeInteger(d.amount)&&d.amount>0&&d.after>d.before)return [{id:l.id,at:l.at,kind:'award',amount:d.amount,title:label(l),actor:l.actor,revoked:!!d.reversedAt,reversedBy:d.reversedBy||'',reversedAt:d.reversedAt}];
  if(l.kind==='admin'&&Number.isSafeInteger(d.before)&&Number.isSafeInteger(d.after)&&d.before>d.after){
   const original=(d.reversedAwards||[]).map(id=>byId.get(id)).filter(Boolean);
   return [{id:l.id,at:l.at,kind:d.reversedAwards?'undo':'correction',amount:d.before-d.after,title:original.length?original.map(label).join(' + '):(d.reason||'별 오지급 정정'),actor:l.actor}];
  }
  return [];
 }).sort((a,b)=>b.at-a.at);
 const given=entries.filter(e=>e.kind==='award').reduce((s,e)=>s+e.amount,0),recovered=entries.filter(e=>e.kind!=='award').reduce((s,e)=>s+e.amount,0);
 return {entries,given,recovered,net:given-recovered};
}
export function historyWeekStart(day){
 const at=Date.parse(day+'T00:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(at)||new Date(at).toISOString().slice(0,10)!==day)return null;
 return new Date(at-((new Date(at).getUTCDay()+6)%7)*86400000).toISOString().slice(0,10);
}
export function shiftHistoryWeek(day,offset,today){
 const start=historyWeekStart(day),current=historyWeekStart(today);
 if(!start||!current||![1,-1].includes(offset))return null;
 const next=new Date(Date.parse(start+'T00:00:00Z')+offset*7*86400000).toISOString().slice(0,10);
 return /^\d{4}-\d{2}-\d{2}$/.test(next)&&next>='0001-01-01'&&next<=current?next:null;
}
export function weeklyAwardTotals(logs,player,today,selectedWeek=today){
 const monday=historyWeekStart(selectedWeek),current=historyWeekStart(today);
 if(!monday||!current||monday>current)return {start:'',end:'',given:0,recovered:0,net:0};
 const start=Date.parse(monday+'T00:00:00Z');
 const end=Math.min(start+6*86400000,Date.parse(today+'T00:00:00Z'));
 let given=0,recovered=0;
 for(let at=start;at<=end;at+=86400000){
  const day=todayAwardHistory(logs,player,new Date(at).toISOString().slice(0,10));
  given+=day.given;recovered+=day.recovered;
 }
 return {start:new Date(start).toISOString().slice(0,10),end:new Date(end).toISOString().slice(0,10),given,recovered,net:given-recovered};
}
export function historyMonthStart(day){
 return historyWeekStart(day)?day.slice(0,7)+'-01':null;
}
export function shiftHistoryMonth(day,offset,today){
 const start=historyMonthStart(day),current=historyMonthStart(today);
 if(!start||!current||![1,-1].includes(offset))return null;
 const date=new Date(start+'T00:00:00Z');date.setUTCMonth(date.getUTCMonth()+offset);
 const next=date.toISOString().slice(0,10);
 return /^\d{4}-\d{2}-\d{2}$/.test(next)&&next>='0001-01-01'&&next<=current?next:null;
}
export function monthlyAwardTotals(logs,player,today,selectedMonth=today){
 const start=historyMonthStart(selectedMonth),current=historyMonthStart(today);
 if(!start||!current||start>current)return {start:'',end:'',given:0,recovered:0,net:0};
 const last=new Date(start+'T00:00:00Z');last.setUTCMonth(last.getUTCMonth()+1);last.setUTCDate(0);
 const end=start===current?today:last.toISOString().slice(0,10);
 let given=0,recovered=0;
 for(const l of logs){
  if(!Number.isFinite(l.at)||l.data?.player!==player)continue;
  const day=seoulDate(l.at);if(day<start||day>end)continue;
  const d=l.data;
  if(l.kind==='star'&&Number.isSafeInteger(d.amount)&&d.amount>0&&d.after>d.before)given+=d.amount;
  if(l.kind==='admin'&&Number.isSafeInteger(d.before)&&Number.isSafeInteger(d.after)&&d.before>d.after)recovered+=d.before-d.after;
 }
 return {start,end,given,recovered,net:given-recovered};
}
export function awardHistoryHTML(logs,player,name,day,today=day,selectedWeek=today,mode='week',selectedMonth=today){
 const monthly=mode==='month',unit=monthly?'달':'주',prefix=monthly?'historyMonth':'historyWeek',shift=monthly?shiftHistoryMonth:shiftHistoryWeek;
 const w=monthly?monthlyAwardTotals(logs,player,today,selectedMonth):weeklyAwardTotals(logs,player,today,selectedWeek),isCurrentWeek=w.start===(monthly?historyMonthStart(today):historyWeekStart(today)),weekHeading=monthly?(isCurrentWeek?'이번 달 별 합계':'월간 별 합계'):isCurrentWeek?'이번 주 별 합계':'주간 별 합계';
 const h=todayAwardHistory(logs,player,day),isToday=day===today,heading=isToday?'오늘 별 내역':'별 내역';
 return `<section class="award-history" data-history-player="${player}" aria-label="${esc(name)} ${heading}"><div class="award-week-summary" role="region" aria-label="${esc(name)} ${weekHeading}"><div class="award-period-mode" role="group" aria-label="${esc(name)} 합계 조회 단위"><button type="button" data-act="historyMode:${player}:week" aria-pressed="${!monthly}">주간</button><button type="button" data-act="historyMode:${player}:month" aria-pressed="${monthly}">월간</button></div><div class="award-week-heading"><h3>${weekHeading}</h3><span>${esc(w.start)} ~ ${esc(w.end)}</span></div><div class="award-week-nav"><button type="button" class="small" data-act="${prefix}Step:${player}:-1" aria-label="${esc(name)} 이전 ${unit}" ${shift(w.start,-1,today)?'':'disabled'}>이전 ${unit}</button><button type="button" class="small" data-act="${prefix}Step:${player}:1" aria-label="${esc(name)} 다음 ${unit}" ${shift(w.start,1,today)?'':'disabled'}>다음 ${unit}</button><button type="button" class="small" data-act="${prefix}Today:${player}" ${isCurrentWeek?'disabled':''}>이번 ${unit}</button></div><div class="award-week-totals"><div><span>받은 별</span><strong>+${w.given}<small>개</small></strong></div><div><span>취소·회수된 별</span><strong>${w.recovered?'−'+w.recovered:'0'}<small>개</small></strong></div></div><p>${monthly?(isCurrentWeek?'1일부터 오늘까지':'1일부터 말일까지'):(isCurrentWeek?'월요일부터 오늘까지':'월요일부터 일요일까지')} · 지급·취소가 발생한 날짜 기준</p></div><div class="award-history-heading"><h3>${esc(name)} · ${heading}</h3><span>${h.entries.length}건</span></div><div class="award-history-date"><label for="history-date-${player}">조회 날짜</label><button type="button" class="small" data-act="historyStep:${player}:-1" aria-label="${esc(name)} 이전날" ${shiftHistoryDate(day,-1,today)?'':'disabled'}>이전날</button><input id="history-date-${player}" type="date" data-history-date="${player}" aria-label="${esc(name)} 별 내역 조회 날짜" value="${esc(day)}" max="${esc(today)}"><button type="button" class="small" data-act="historyStep:${player}:1" aria-label="${esc(name)} 다음날" ${shiftHistoryDate(day,1,today)?'':'disabled'}>다음날</button><button type="button" class="small" data-act="historyToday:${player}" ${isToday?'disabled':''}>오늘</button></div><div class="award-history-totals"><span>지급 <b>+${h.given}</b></span><span>취소·회수 <b>${h.recovered?'−'+h.recovered:'0'}</b></span><span>합계 <b>${h.net>0?'+':''}${h.net}</b></span></div>${h.entries.length?`<div class="award-history-scroll" tabindex="0" role="region" aria-label="${esc(name)} ${esc(day)} 지급과 취소 목록"><ol>${h.entries.map(e=>`<li class="${e.kind} ${e.revoked?'revoked':''}"><div class="award-history-row"><span class="award-history-badge">${e.kind==='award'?(e.revoked?'지급 · 취소됨':'지급'):e.kind==='undo'?'완료 취소':'정정 회수'}</span><strong>${e.kind==='award'?'+':'−'}${e.amount}<small>개</small></strong></div><p class="award-history-title">${esc(e.title)}</p><div class="award-history-meta"><span>${esc(e.actor||'시스템')}${e.kind==='award'?' 지급':' 취소·회수'}</span><time datetime="${new Date(e.at).toISOString()}">${clock(e.at)}</time></div>${e.revoked?`<div class="award-history-reversal">${esc(e.reversedBy||'관리자')} 취소${e.reversedAt?' · '+(seoulDate(e.reversedAt)!==day?seoulDate(e.reversedAt)+' ':'')+clock(e.reversedAt):''}</div>`:''}</li>`).join('')}</ol></div>`:`<p class="award-history-empty">${isToday?'오늘':'선택한 날짜에'} 지급하거나 취소한 별이 없어요.</p>`}</section>`;
}
