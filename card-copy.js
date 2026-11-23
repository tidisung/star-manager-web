// Display-only wording: keep issued promises and parent-authored records intact.
const friendlyEffects = new Map([
 ['한강에서 카드 주인이 먹을 라면 1개. 추가 간식 제외.', '한강에서 내가 먹을 라면 1개를 골라요. 다른 간식은 따로예요.'],
 ['다이소 장난감 구매 합계 1만 원 이하. 차액 반환·합산 불가.', '다이소에서 모두 합쳐 1만 원까지 장난감을 골라요. 남은 돈은 받을 수 없고, 다른 카드와 합쳐 쓸 수 없어요.'],
 ['트레이더스 먹거리 구매 합계 2만 원 이하. 차액 반환·합산 불가.', '트레이더스에서 모두 합쳐 2만 원까지 먹고 싶은 걸 골라요. 남은 돈은 받을 수 없고, 다른 카드와 합쳐 쓸 수 없어요.'],
 ['카드 주인에게 현금 5만 원 지급.', '내가 쓸 수 있는 용돈 5만 원을 받아요.'],
 ['장난감 한 개 7만 원 이하. 용돈 보태기·차액 반환 불가.', '7만 원까지 장난감 하나를 골라요. 내 용돈을 더해 살 수 없고, 남은 돈은 받을 수 없어요.'],
 ['카드 주인 한 명의 기본 이용 2시간. 별도 유료 체험 제외.', '내가 키즈카페에서 2시간 놀아요. 돈을 따로 내는 체험은 안 돼요.'],
]);
export function friendlyCardEffect(effect){return friendlyEffects.get(effect)??effect;}
export function marketRemaining(nextRefresh,now=Date.now()){
 if(!Number.isFinite(nextRefresh)||nextRefresh<=0)return '새 카드를 준비하고 있어요';
 const remaining=nextRefresh-now;
 if(remaining<=0)return '곧 새 카드가 나와요';
 const hours=Math.floor(remaining/3600000),days=Math.floor(hours/24);
 if(days)return `${days}일 ${hours%24}시간 남음`;
 if(hours)return `${hours}시간 남음`;
 return `${Math.ceil(remaining/60000)}분 남음`;
}
