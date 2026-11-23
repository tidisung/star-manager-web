export function starDigitSequences(from,to){
 const width=Math.max(String(from).length,String(to).length),start=String(from).padStart(width,'0'),end=String(to).padStart(width,'0'),direction=to<from?-1:1;
 return [...end].map((digit,i)=>[...Array.from({length:20},(_,j)=>(Number(start[i])+direction*j%10+10)%10),Number(digit)]);
}
