const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const items=(n,emoji='●')=>`<div class="math-objects">${Array.from({length:Math.min(60,n)},()=>`<span>${emoji}</span>`).join('')}</div>`;
const tag=(n,label)=>`<div class="math-place"><strong>${n}</strong><small>${label}</small></div>`;
const svg=body=>`<svg viewBox="0 0 320 150" aria-hidden="true">${body}</svg>`;
function clock(hour,minute){const a=hour%12*30+minute*.5,b=minute*6;return svg(`<circle cx="160" cy="75" r="68" fill="#fff" stroke="#b9dacf" stroke-width="5"/>${Array.from({length:12},(_,i)=>{const n=i+1,t=n*Math.PI/6;return `<text x="${160+53*Math.sin(t)}" y="${80-53*Math.cos(t)}" text-anchor="middle" font-size="14" fill="#304e48">${n}</text>`;}).join('')}<path d="M160 75 v-33" transform="rotate(${a} 160 75)" stroke="#7657a5" stroke-width="7" stroke-linecap="round"/><path d="M160 75 v-48" transform="rotate(${b} 160 75)" stroke="#eb996d" stroke-width="4" stroke-linecap="round"/><circle cx="160" cy="75" r="5" fill="#304e48"/>`);}
export function mathVisual(q){
 const l=q.level,i=Number(q.bankId?.split('-')[1]||0),n=(q.prompt.match(/\d+/g)||[]).map(Number);let body='',label='문제 그림';
 if(l===1){body=items(i+3,'🟣');label=`점 ${i+3}개`;}
 else if(l===2){body=items(i+4,'🧊')+`<span class="math-operation">${i%2?'−':'+'} 1</span>`;}
 else if(l===3){body=`<div class="math-compare"><div>${items(i+2,'🍓')}</div><div>${items(i+4,'🍇')}</div></div>`;}
 else if(l===4){body=tag(i+5,'모두')+'<span>↙　↘</span>'+`<div class="math-pair">${items(3,'🔵')}${tag('?','주머니')}</div>`;}
 else if(l===5){body=items(i+3,'🐦')+`<span class="math-operation">${i%2?'−':'+'} 🐦 🐦</span>`;}
 else if(l===6){body=`<div class="math-pair">${Array.from({length:n[1]},()=>tag(10,'한 묶음')).join('')}${items(n[2],'🥢')}</div>`;}
 else if(l===7){body=i<3?`<div class="math-big-object">${['⚽','🎲','🥫'][i]}</div>`:i===3?svg('<path d="M60 50h180M60 100h110" stroke="#eaa561" stroke-width="16" stroke-linecap="round"/><path d="M48 30v90" stroke="#527d71" stroke-dasharray="4 4"/>'):svg('<path d="M160 35v100M110 135h100M65 85l190-45" fill="none" stroke="#527d71" stroke-width="5"/><path d="M65 85v23m190-68v23M35 108h60M225 63h60" fill="none" stroke="#eaa561" stroke-width="4"/>');}
 else if(l===8){body=tag(n[0],'사탕')+'<span class="math-operation">→</span>'+tag(10,'한 묶음');}
 else if(l===9){body=`<div class="math-ten-frame">${Array.from({length:10},(_,k)=>`<span class="${k<n[1]?'filled':''}">${k<n[1]?'🥚':''}</span>`).join('')}</div>`;label=`10칸 중 ${n[1]}칸에 달걀`;}
 else if([10,11,15,24,25,30].includes(l)){body=`<div class="math-calculation">${esc(q.prompt.replace('□','?'))}</div>`;}
 else if(l===12){body=clock(i%2?i+2:i+2,i%2?30:0);}
 else if(l===13){body=`<div class="math-pattern">${esc(q.prompt.split('\n')[0])}</div>`;}
 else if(l===14){body=`<div class="math-pair">${tag(n[1],'백')}${tag(n[3],'십')}${tag(n[5],'일')}</div>`;}
 else if(l===16){body=svg(i===0?'<path d="M100 120L160 20l60 100Z" fill="#ffe4b6" stroke="#c39052" stroke-width="4"/>':i===1?'<rect x="90" y="25" width="140" height="95" rx="0" fill="#d5d3f7" stroke="#8673af" stroke-width="4"/>':i===4?'<path d="M20 65l25-45 25 45ZM90 65l25-45 25 45Z" fill="#ffe4b6"/><circle cx="50" cy="110" r="24" fill="#d5eade"/><circle cx="140" cy="110" r="24" fill="#d5eade"/><circle cx="230" cy="110" r="24" fill="#d5eade"/>':'<circle cx="60" cy="75" r="35" fill="#d5eade"/><path d="M125 110l40-70 40 70Z" fill="#ffe4b6"/><rect x="240" y="40" width="65" height="70" fill="#d5d3f7"/>');}
 else if(l===17){body=svg(`<path d="M${25+n[0]*21} 38H${25+n[1]*21}" stroke="#edaa8c" stroke-width="18" stroke-linecap="round"/><path d="M25 70h270v45H25Z" fill="#fff2c9"/>${Array.from({length:13},(_,k)=>`<path d="M${25+k*21} 70v${k%5?12:20}" stroke="#56796c"/><text x="${25+k*21}" y="105" text-anchor="middle" font-size="12">${k}</text>`).join('')}`);}
 else if(l===18){body=`<div class="math-bags">${Array.from({length:i+2},()=>`<div>${items(3,'🍊')}</div>`).join('')}</div>`;}
 else if(l===19){body=`<div class="math-pair">${String(n[0]).split('').map((v,k)=>tag(v,['천','백','십','일'][k])).join('')}</div>`;}
 else if(l===20){body=`<div class="math-array" style="--columns:${n[0]}">${Array.from({length:n[0]*n[1]},()=>'<span>🪑</span>').join('')}</div>`;}
 else if(l===21){body=`<div class="math-pair">${tag(n[0],'m')}${tag(n[1],'cm')}</div>`;}
 else if(l===22){body=`<div class="math-time-pair">${tag(`${n[0]}:${String(n[1]).padStart(2,'0')}`,'시작')}<span>→</span>${tag(`${n[2]}:${String(n[3]).padStart(2,'0')}`,'끝')}</div>`;}
 else if(l===23){body=`<div class="math-votes"><div>🍓 ${items(n[0],'●')}</div><div>🍇 ${items(n[1],'●')}</div></div>`;}
 else if(l===26){body=tag(n[0],'색종이')+'<span>↓ 똑같이 나눠요</span>'+items(n[1],'🧒');}
 else if(l===27){body=svg(i<3?`<defs><marker id="arrowMath" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse"><path d="M0 0L8 4L0 8" fill="#527d71"/></marker></defs><path d="M55 75h210" stroke="#527d71" stroke-width="4" ${i>0?'marker-end="url(#arrowMath)"':''} ${i===2?'marker-start="url(#arrowMath)"':''}/>${i<2?'<circle cx="55" cy="75" r="6" fill="#ebaa77"/>':''}${i===0?'<circle cx="265" cy="75" r="6" fill="#ebaa77"/>':''}`:i===3?'<path d="M80 30h160v90H80Z" fill="#e9e6fc" stroke="#8673af" stroke-width="4"/>':'<path d="M90 25v100h140Z" fill="#e9e6fc" stroke="#8673af" stroke-width="4"/><path d="M90 105h20v20" fill="none" stroke="#8673af"/>');}
 else if(l===28||l===34){body='<div class="math-big-object">'+(l===28?'📏 ⏱️':'🥛 ⚖️')+'</div>';}
 else if(l===29){const total=i<3?[4,5,8][i]:10,filled=i<3?[1,2,3][i]:i===3?3:7;body=`<div class="math-fraction" style="--columns:${total}">${Array.from({length:total},(_,k)=>`<span class="${k<filled?'filled':''}"></span>`).join('')}</div>`;}
 else if(l===31){body=tag(n[0],'연필')+`<span>📦 한 상자에 ${n[1]}자루</span>`;}
 else if(l===32){body=svg(`<circle cx="160" cy="75" r="60" fill="#e8e5fa" stroke="#8571b3" stroke-width="3"/><path d="M100 75h120" stroke="#baa9da" stroke-width="3" stroke-dasharray="6 4"/><path d="M160 75h60" stroke="#df946e" stroke-width="4"/><circle cx="160" cy="75" r="4" fill="#8571b3"/><text x="183" y="64" font-size="17" fill="#4e385f">${n[0]} cm</text>`);}
 else if(l===33){body='<div class="math-big-object">🍕</div><small>똑같이 나눈 조각을 생각해 봐</small>';}
 else if(l===35){body=`<small>● 하나는 ${i+2}명</small>${items(i+2,'●')}`;}
 return `<div class="math-visual" role="img" aria-label="${esc(label)}">${body}</div>`;
}
