const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function weeklyDayComplete(day){return !!day?.tasks?.length&&day.tasks.every(t=>t.done);}
const crown='<svg viewBox="0 0 32 28" aria-hidden="true"><path d="M4 8l6 5 6-10 6 10 6-5-3 16H7z" fill="currentColor"/><circle cx="4" cy="7" r="2" fill="currentColor"/><circle cx="16" cy="3" r="2" fill="currentColor"/><circle cx="28" cy="7" r="2" fill="currentColor"/><path d="M9 20h14" stroke="#fff3b2" stroke-width="2" stroke-linecap="round"/></svg>';
export function weeklyScheduleHTML(view){
 if(!view?.days?.length)return '';
 const days=view.days,range=d=>`${Number(d.slice(5,7))}.${Number(d.slice(8))}`;
 return `<section class="weekly-schedule" aria-label="이번 주 일정"><div class="weekly-heading"><div><span class="weekly-eyebrow">MY WEEK</span><h2>이번 주 약속</h2></div><span>${range(days[0].date)} — ${range(days[6].date)}</span></div><div class="weekly-board">${days.map(day=>{
 const complete=weeklyDayComplete(day),gold=day.today&&complete,earned=gold||(day.past&&(complete||day.bonusReceived));
 return `<section data-week-day="${day.date}" class="weekly-day ${day.past?'is-past':''} ${day.today?'is-today':''} ${gold?'is-golden':''}" aria-label="${day.date} ${day.label}요일${earned?' · 모두 완료':''}">${earned?`<div class="weekly-crown" role="status">${crown}<span>모두 해냈어!</span></div>`:''}<header><b>${day.label}</b><span>${range(day.date)}</span>${day.today?'<em>오늘</em>':''}</header><div class="weekly-tasks">${day.tasks.length?day.tasks.map(task=>`<label class="weekly-task ${task.done?'is-done':''}"><input type="checkbox" data-week-date="${day.date}" data-week-task="${task.id}" aria-label="${day.label}요일 ${esc(task.label)}" ${task.done?'checked':''} disabled><span>${esc(task.label)}</span></label>`).join(''):'<div class="weekly-rest"><span>☀</span>푹 쉬는 날</div>'}</div></section>`;
 }).join('')}</div></section>`;
}

export function weeklyPlanHTML(plans,player,names){
 return `<h1>아이별 주간 일정</h1><p class="lead">미리 약속할 활동과 노력의 기준을 정해 주세요. 예: 일기 15분 쓰기. 길이나 완성도 대신 약속한 시간·노력을 확인하고 별을 주세요.</p><div class="tabs">${Object.keys(names).map(p=>`<button data-act="adminKid:${p}" class="${player===p?'active':''}" aria-pressed="${player===p}">${names[p]}</button>`).join('')}</div><p class="muted">${names[player]}의 일정 · 저장하면 이번 주부터 반영됩니다. 내용을 바꾼 할 일은 새로 체크해요.</p><div class="weekly-plan-grid">${(plans?.[player]||[]).map(d=>`<section class="panel"><div class="row"><h2>${'월화수목금토일'[d.day]}요일</h2><button class="small" data-act="weeklyEdit:${d.day}">${'월화수목금토일'[d.day]}요일 편집</button></div>${d.tasks.length?`<ul>${d.tasks.map(t=>`<li>${esc(t.label)} <small class="schedule-category">${({quote:'명언 복습',diary:'일기',math:'수학',reading:'국어',cleaning:'청소',custom:'직접 입력'})[t.category]||'직접 입력'}</small></li>`).join('')}</ul>`:'<p class="muted">등록된 할 일이 없어요. 쉬는 날이에요.</p>'}</section>`).join('')}</div>`;
}
