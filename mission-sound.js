// Small, locally synthesized sounds: no audio downloads or network calls.
export function createMissionSound({storage,makeContext}={}){
 const key='wish-mission-sound-v1';
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
 let enabled=true;try{enabled=storage?.getItem(key)!=='off';}catch{}
 let context=null,ready=null,sequence=0;const voices=new Set();
 const stop=()=>{sequence++;for(const voice of voices){try{voice.oscillator.stop();}catch{}try{voice.oscillator.disconnect();voice.gain.disconnect();}catch{}}voices.clear();};
 // Call synchronously from a tap so iPad Safari can unlock the audio context.
 function arm(){
  if(!enabled)return Promise.resolve(false);
  try{
   // Safari can suspend or interrupt Web Audio after screen lock or app switching.
   // Explicit playback is requested only from a sound-enabled user gesture.
   try{if(globalThis.navigator?.audioSession)globalThis.navigator.audioSession.type='playback';}catch{}
   if(!context||context.state==='closed'){
    const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
    context=makeContext?makeContext():Audio?new Audio():null;ready=null;
   }
   if(!context)return Promise.resolve(false);
   if(context.state==='running')return Promise.resolve(true);
   if(!ready){const target=context;ready=Promise.resolve(target.resume()).then(()=>target.state==='running',()=>false).finally(()=>{ready=null;});}
   return ready;
  }catch{return Promise.resolve(false);}
 }
 function play(correct){
  if(!enabled||!context||globalThis.document?.hidden)return Promise.resolve(false);
  stop();const ticket=sequence,requested=Date.now();
  const deliver=()=>{
   if(ticket!==sequence||!enabled||globalThis.document?.hidden||Date.now()-requested>1500||context?.state!=='running')return false;
   return synthesize(correct);
  };
  if(context.state==='running')return Promise.resolve(deliver());
  // Never drop a response merely because resume() has not settled yet.
  return (ready||arm()).then(deliver);
 }
 function preview(){arm();return play(true);}
 function synthesize(correct){
  if(!enabled||!context||context.state!=='running'||globalThis.document?.hidden)return;
  const notes=correct?[523.25,659.25,783.99]:[392,440];
  try{const base=context.currentTime+.015;
   notes.forEach((frequency,i)=>{
    const oscillator=context.createOscillator(),gain=context.createGain(),start=base+i*(correct?.105:.16),duration=correct?.24:.22;
    oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,start);
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(correct?.095:.065,start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(gain);gain.connect(context.destination);const voice={oscillator,gain};voices.add(voice);
    oscillator.onended=()=>{voices.delete(voice);oscillator.disconnect();gain.disconnect();};oscillator.start(start);oscillator.stop(start+duration+.02);
   });
   return true;
  }catch{stop();return false;}
 }
 function toggle(){enabled=!enabled;try{storage?.setItem(key,enabled?'on':'off');}catch{}if(enabled)arm();else {stop();try{if(globalThis.navigator?.audioSession)globalThis.navigator.audioSession.type='auto';}catch{}}return enabled;}
 return {get enabled(){return enabled;},arm,play,preview,toggle,stop};
}
