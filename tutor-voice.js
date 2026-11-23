export function createTutorVoice({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,onStatus=()=>{}}={}){
 let active=null,serial=0;
 function stop(){serial++;active=null;try{synth?.cancel();}catch{}onStatus('idle');}
 function speak(text){
  stop();if(!synth||!Utterance){onStatus('unavailable');return false;}
  try{const id=serial,u=new Utterance(String(text).slice(0,180));active=u;u.lang='ko-KR';u.rate=.87;u.pitch=1.05;const voices=synth.getVoices();const korean=voices.find(v=>v.lang.startsWith('ko')&&v.localService)||voices.find(v=>v.lang.startsWith('ko'));if(korean)u.voice=korean;
   u.onstart=()=>{if(id===serial)onStatus('speaking');};u.onend=()=>{if(id===serial){active=null;onStatus('idle');}};u.onerror=()=>{if(id===serial){active=null;onStatus('unavailable');}};synth.speak(u);return true;
  }catch{onStatus('unavailable');return false;}
 }
 return {speak,stop,get supported(){return !!synth&&!!Utterance;}};
}

// Unlock Web Audio on the tap, before any network work (including on iPad).
export function createLessonVoice({makeContext,fetcher=globalThis.fetch,onStatus=()=>{}}={}){
 let context,source,serial=0,ready;const buffers=new Map();
 function stop(){serial++;if(source){try{source.stop();source.disconnect();}catch{}source=null;}onStatus('idle');}
 function arm(){try{try{if(globalThis.navigator?.audioSession)globalThis.navigator.audioSession.type='playback';}catch{}
  if(!context||context.state==='closed'){const C=globalThis.AudioContext||globalThis.webkitAudioContext;context=makeContext?makeContext():C?new C():null;ready=null;}
  if(!context)return Promise.resolve(false);if(context.state==='running')return Promise.resolve(true);
  if(!ready)ready=Promise.resolve(context.resume()).then(()=>context.state==='running',()=>false).finally(()=>{ready=null;});return ready;
 }catch{return Promise.resolve(false);}}
 async function speak(request){stop();const ticket=serial;onStatus('loading');
  try{
   if(!await arm())throw Error('blocked');if(ticket!==serial)return false;
   const cacheKey=JSON.stringify(request);let buffer=buffers.get(cacheKey);
   if(!buffer){const r=await fetcher('/api/lesson-speech',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(30000),body:JSON.stringify(request)});if(!r.ok)throw Error('unavailable');const bytes=await r.arrayBuffer();if(ticket!==serial)return false;buffer=await context.decodeAudioData(bytes);buffers.set(cacheKey,buffer);while(buffers.size>24)buffers.delete(buffers.keys().next().value);}
   if(ticket!==serial)return false;if(context.state!=='running'&&!await arm())throw Error('blocked');if(ticket!==serial)return false;
   const node=context.createBufferSource();source=node;node.buffer=buffer;node.connect(context.destination);node.onended=()=>{if(ticket===serial){source=null;onStatus('idle');}try{node.disconnect();}catch{}};node.start();onStatus('speaking');return true;
  }catch{if(ticket===serial)onStatus('unavailable');return false;}
 }
 return {arm,speak,stop};
}
