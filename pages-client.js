// Public deployment coordinates only. No server secrets or family records.
export const SERVER_URL='https://melody-areum-star-prototype.awakesalamander8.chatgpt.site';
export const PAGES_URL='https://tidisung.github.io/star-manager-web/';
export const onPages=location.origin===new URL(PAGES_URL).origin&&location.pathname.startsWith('/star-manager-web/');
const tokenKey='star-manager-pages-device-v1',flowKey='star-manager-pages-flow-v1',linkKey='star-manager-pages-link-v1';
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
const digest=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),n=>n.toString(16).padStart(2,'0')).join('');
const load=key=>{try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}};
const query=new URLSearchParams(location.search);
if(!onPages&&/^[a-f0-9]{64}$/.test(query.get('pages_challenge')||'')&&/^[a-f0-9]{64}$/.test(query.get('pages_state')||'')){
 sessionStorage.setItem(linkKey,JSON.stringify({challenge:query.get('pages_challenge'),state:query.get('pages_state'),at:Date.now()}));
 query.delete('pages_challenge');query.delete('pages_state');
 history.replaceState(null,'',location.pathname+(query.size?'?'+query:'')+location.hash);
}
let initializationError='';
const callback=new URLSearchParams(location.hash.slice(1));
const ready=(async()=>{
 if(!onPages||!callback.has('pages_code'))return;
 const code=callback.get('pages_code'),state=callback.get('pages_state');
 history.replaceState(null,'',location.pathname+location.search);
 try{
  const flow=load(flowKey);
  if(!flow||flow.state!==state||Date.now()-flow.at>30*60000)throw Error('연결 요청이 만료됐어요. 부모 기기 연결을 다시 눌러 주세요.');
  const r=await fetch(SERVER_URL+'/api/pages-exchange',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',cache:'no-store',body:JSON.stringify({code,verifier:flow.verifier,requestId:flow.requestId}),signal:AbortSignal.timeout(15000)});
  const data=await r.json();if(!r.ok||!data.deviceToken)throw Error(data.error||'기기를 연결하지 못했어요. 다시 연결해 주세요.');
  localStorage.setItem(tokenKey,data.deviceToken);sessionStorage.removeItem(flowKey);
 }catch(e){initializationError=e.message;}
})();
export function pagesError(){return initializationError;}
export async function startPagesConnection(){
 // Fail before navigation when this browser cannot retain the device token.
 localStorage.setItem(tokenKey+'-check','1');localStorage.removeItem(tokenKey+'-check');
 const verifier=random(),state=random();sessionStorage.setItem(flowKey,JSON.stringify({verifier,state,requestId:crypto.randomUUID(),at:Date.now()}));
 const url=new URL('/',SERVER_URL);url.searchParams.set('pages_challenge',await digest(verifier));url.searchParams.set('pages_state',state);location.assign(url.href);
}
export function pagesConnectionPending(){const link=load(linkKey);return !onPages&&link&&Date.now()-link.at<30*60000;}
export async function finishPagesConnection(api){
 const link=load(linkKey);if(!pagesConnectionPending())throw Error('Pages 화면에서 연결을 다시 시작해 주세요.');
 const data=await api('pages-link',{challenge:link.challenge});
 const url=new URL(PAGES_URL);url.hash=new URLSearchParams({pages_code:data.result.code,pages_state:link.state}).toString();
 sessionStorage.removeItem(linkKey);location.assign(url.href);
}
export function familyHomeURL(){return onPages?PAGES_URL:new URL('/',location.origin).href;}
export async function familyFetch(input,init={}){
 await ready;
 if(!onPages)return fetch(input,init);
 const path=String(input);if(!path.startsWith('/api/'))throw Error('지원하지 않는 서버 요청입니다.');
 const headers=new Headers(init.headers),token=localStorage.getItem(tokenKey);
 if(token)headers.set('Authorization','Bearer '+token);
 const result=await fetch(SERVER_URL+path,{...init,headers,credentials:'omit'});
 if(path==='/api/join'&&result.ok){const data=await result.clone().json();if(data.deviceToken)localStorage.setItem(tokenKey,data.deviceToken);}
 if(path==='/api/logout'&&result.ok)localStorage.removeItem(tokenKey);
 return result;
}
