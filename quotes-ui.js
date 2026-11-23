const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const quoteDate=day=>day==null?'완료':new Intl.DateTimeFormat('ko-KR',{timeZone:'UTC',month:'numeric',day:'numeric'}).format(new Date(day*86400000));
const practice=new Map();
export function setQuotePractice(id,mode){practice.set(id,mode);}
export function quoteCards(view,{parent=false,player='',name=''}={}){
 if(!view)return '<p>명언을 불러오고 있어요.</p>';
 const items=[...view.items].sort((a,b)=>Number(a.complete)-Number(b.complete)||Number(b.due)-Number(a.due)||a.startDay-b.startDay);
 return `<section class="quote-page"><header class="quote-heading"><span class="quote-eyebrow">하루 3분 · 마음에 담는 한 문장</span><h1>${parent?`${escape(name)}의 명언`:'명언 별 모으기'}</h1><p>${parent?'읽고, 가리고, 다시 떠올려요. 부모님이 확인하면 별 1개!':'한 문장씩 기억하고, 다섯 개의 별을 모아봐요.'}</p></header>
 <div class="quote-guide"><strong>읽기 · 가리고 말하기 · 부모님 확인</strong><p>첫날 → 다음 날 → 3일 뒤 → 7일 뒤 → 14일 뒤</p><p>힌트를 받아도 괜찮아요. 늦어져도 별은 그대로! 시작한 날 기준 0·1·3·7·14일에 복습해요. 놓친 복습은 완료할 때까지 남고, 같은 명언은 하루 한 번만 별을 받아요.</p></div>
 ${parent?`<div class="quote-add"><button class="primary" data-act="quoteNew:${player}" ${view.canAssign?'':'disabled'}>새 명언 고르기</button><span>${view.canAssign?'일주일에 한 문장씩 시작해요.':`다음 새 명언은 ${quoteDate(view.nextNewDay)}부터`}</span></div>`:''}
 ${items.length?`<div class="quote-grid">${items.map(row=>{
 const step=row.reviews.length,mode=practice.get(row.id)||'read',q=row.quote;
 const status=row.complete?'다섯 별 완성!':row.pending?'부모님 확인 기다리는 중':row.due?'오늘 떠올려요':`${quoteDate(row.dueDay)}에 다시 만나요`;
 const instructions=step>=4?'안 보고 말하고, 생활 속 예 하나를 이야기해요.':step>=3?'안 보고 말하고, 무슨 뜻인지 이야기해요.':'함께 읽은 뒤 가리고 말해봐요.';
 return `<article class="quote-card ${row.complete?'quote-complete':''}"><div class="quote-card-top"><span class="quote-status">${status}</span><span>${step} / 5</span></div>
 <div class="quote-stars" aria-label="별 5개 중 ${step}개 완료">${Array.from({length:5},(_,i)=>`<span class="${i<step?'earned':''}" aria-hidden="true">${i<step?'★':'☆'}</span>`).join('')}</div>
 <div class="quote-memory" aria-live="polite">${parent||mode==='read'?`<blockquote>“${escape(q.text)}”</blockquote><p class="quote-author">${escape(q.author)}</p>`:mode==='hint'?`<p class="quote-hint">첫말 힌트</p><blockquote>“${escape(q.text.split(' ').slice(0,2).join(' '))} …”</blockquote>`:'<p class="quote-covered">문장을 가렸어요.<br>천천히 떠올려 말해봐요.</p>'}</div>
 ${parent||mode==='read'?`<p class="quote-meaning">${escape(q.meaning)}</p>`:''}<p>${escape(instructions)}</p>
 ${step>=3||row.complete?`<p class="quote-question">이야기 나누기 · ${escape(q.prompt)}</p>`:''}
 <ol class="quote-schedule">${row.schedule.map((day,i)=>`<li class="${i<step?'done':''}"><strong>${i+1}회</strong><span>${quoteDate(day)}</span><small>${i<step?(row.reviews[i].mode==='effort'?'약속한 연습 완료':row.reviews[i].mode==='hint'?'힌트 후 완료':'스스로 완료'):i===step?'다음 복습':'예정'}</small></li>`).join('')}</ol>
 <div class="quote-buttons">${parent?(!row.complete&&row.due?`<button class="primary" data-act="quoteReview:${player}:${row.id}">${row.pending?'확인 요청 보기':'함께 확인하기'} · 별 1개</button>`:''): `<button data-act="quotePractice:${row.id}:${mode==='read'?'hide':'read'}">${mode==='read'?'가리고 말하기':'다시 읽기'}</button>${mode!=='read'?`<button data-act="quotePractice:${row.id}:hint">첫말 힌트</button>`:''}${row.due?`<button class="primary" data-act="quoteRequest:${row.id}:${step}" ${row.pending?'disabled':''}>${row.pending?'확인 요청했어요':'부모님께 확인 요청'}</button>`:''}`}</div>
 ${row.complete?'<p class="quote-praise">끝까지 다시 떠올렸어요. 언제든 다시 연습해도 좋아요!</p>':''}</article>`;
 }).join('')}</div>`:'<div class="quote-empty"><span aria-hidden="true">☆</span><h2>첫 문장을 기다리고 있어요</h2><p>부모님이 명언을 골라주면 여기서 함께 시작해요.</p></div>'}
 <p class="quote-footnote">문장은 아이들이 이해하기 쉽게 뜻을 살려 옮겼어요. 같은 명언은 회차마다 별 1개, 모두 5개를 받아요.</p></section>`;
}

const bannerBacks=new Set();
export function flipQuoteBanner(id){
 if(bannerBacks.has(id))bannerBacks.delete(id);else bannerBacks.add(id);
 return bannerBacks.has(id);
}
export function quoteBanner(view){
 const allItems=view?.items||[];
 // Compare persisted award times with the server's Seoul date, not the device clock.
 const items=allItems.filter(row=>row.due&&!row.complete&&!row.reviews.some(review=>Math.floor((review.at+9*3600000)/86400000)===view.today));
 if(!items.length)return '';
 const row=items.find(r=>!r.pending)||items[0];
 const quote=row.quote;
 if(!quote)return '';
 const id=row?.id||'preview',back=bannerBacks.has(id),earned=row?.reviews.length||0;
 const stackDepth=0;
 const layers=Array.from({length:stackDepth},(_,i)=>stackDepth-i).map(depth=>`<span class="quote-stack-layer" style="--stack-index:${depth}" aria-hidden="true"></span>`).join('');
 const stars=`<span class="quote-banner-stars" role="img" aria-label="이 명언으로 받은 별 ${earned}개, 모두 5개">${Array.from({length:5},(_,i)=>`<svg class="quote-progress-star ${i<earned?'earned':''}" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z"/></svg>`).join('')}</span>`;
 return `<div class="quote-banner-wrap" role="group" aria-label="명언 카드 1장" style="--stack-depth:${stackDepth}">${layers}<button type="button" class="quote-banner ${back?'is-back':''}" data-act="quoteFlip:${escape(id)}" aria-pressed="${back}" aria-label="${back?'명언 다시 보기':'명언 카드 뒤집어 가리기'}"><span class="quote-banner-inner"><span class="quote-banner-front" aria-hidden="${back}">${stars}<span class="quote-banner-text">${escape(quote.text)}</span><span class="quote-banner-author">${escape(quote.author)}</span></span><span class="quote-banner-back" aria-hidden="${!back}">${stars}<span class="quote-banner-seal" aria-hidden="true">✦</span></span></span></button></div>`;
}

export function familyQuoteCards(status,{started=true,page=0}={}){
 if(!status)return '<p>명언을 불러오고 있어요.</p>';
 const names={melody:'멜로디',areum:'아름이'},groups=new Map();
 for(const [player,view] of Object.entries(status))for(const row of view.items){
  const key=row.groupId||JSON.stringify([row.quote.text,row.quote.author,row.startDay]);
  if(!groups.has(key))groups.set(key,{quote:row.quote,startDay:row.startDay,children:{}});
  groups.get(key).children[player]=row;
 }
 const list=[...groups.values()].sort((a,b)=>{
  const due=x=>Object.values(x.children).some(r=>r.due),complete=x=>Object.values(x.children).every(r=>r.complete);
  return Number(due(b))-Number(due(a))||Number(complete(a))-Number(complete(b))||a.startDay-b.startDay;
 });
 const selected=Math.max(0,Math.min(page,list.length-1));
 const shown=list.slice(selected,selected+1);
 const today=status.melody.today;
 return `<section class="quote-page"><header class="quote-heading"><span class="quote-eyebrow">같은 문장, 함께 자라는 마음</span><h1>함께 배우는 한 문장</h1><p>명언·속담·사자성어와 시작일은 한 번만 고르고, 두 아이의 복습은 각각 확인해요.</p></header><div class="quote-add"><button class="primary" data-act="quoteWeek" ${started?'':'disabled'}>일주일치 한 번에 고르기</button><button data-act="quoteNew" ${started?'':'disabled'}>한 문장 추가 · 직접 입력</button></div><div class="quote-guide"><strong>첫날 · 1일 후 · 3일 후 · 7일 후 · 14일 후</strong><p>확인할 때마다 해당 아이에게 별 1개를 보내요. 별을 받은 카드는 그 아이 화면에서만 다음 복습일까지 숨겨져요.</p></div>
 ${list.length?`<div class="family-quote-list">${shown.map(group=>`<article class="quote-card"><div class="quote-card-top"><span class="quote-status">${group.quote.kind||'명언'} · ${group.startDay>today?'시작 예약':'함께 배우기'}</span><span>${quoteDate(group.startDay)} 시작</span></div><div class="quote-memory"><blockquote>“${escape(group.quote.text)}”</blockquote><p class="quote-author">${escape(group.quote.author)}</p></div><p class="quote-meaning">${escape(group.quote.meaning)}</p><p class="quote-question">${escape(group.quote.prompt)}</p><div class="family-quote-children">${Object.entries(names).map(([player,name])=>{
  const row=group.children[player];
  if(!row)return `<section class="family-quote-child"><h3>${name}</h3><p class="muted">이전에 개별 배정한 명언으로, 이 아이의 기록은 없어요.</p></section>`;
  const count=row.reviews.length,paidToday=row.reviews.some(r=>Math.floor((r.at+9*3600000)/86400000)===today);
  const label=row.complete?'5회 복습 완료':paidToday?'오늘 확인 완료':row.due?'오늘 확인해 주세요':`${quoteDate(row.dueDay)}에 ${count+1}회차 복습`;
  return `<section class="family-quote-child"><h3>${name}</h3><div class="quote-stars" role="img" aria-label="${name} 별 ${count}개, 모두 5개">${Array.from({length:5},(_,i)=>`<span class="${i<count?'earned':''}" aria-hidden="true">${i<count?'★':'☆'}</span>`).join('')}</div><p class="family-quote-status">${label}</p><ol class="quote-schedule">${row.schedule.map((day,i)=>`<li class="${i<count?'done':''}"><strong>${i+1}회</strong><span>${quoteDate(day)}</span><small>${i<count?(row.reviews[i].mode==='effort'?'약속한 연습 완료':row.reviews[i].mode==='hint'?'힌트 후 완료':'스스로 완료'):'예정'}</small></li>`).join('')}</ol>${row.due?`<button class="primary" data-act="quoteReview:${player}:${row.id}">${name} 확인 · 별 1개</button>`:''}</section>`;
 }).join('')}</div></article>`).join('')}</div>${list.length>1?`<nav class="history-pagination" aria-label="명언 한 장씩 보기"><button data-act="quotePage:${selected-1}" ${selected===0?'disabled':''}>이전 명언</button><span>${selected+1} / ${list.length}</span><button data-act="quotePage:${selected+1}" ${selected===list.length-1?'disabled':''}>다음 명언</button></nav>`:''}`:'<div class="quote-empty"><h2>함께 배울 첫 명언을 골라주세요</h2><p>한 번 고르면 멜로디와 아름이에게 함께 배정돼요.</p></div>'}</section>`;
}
