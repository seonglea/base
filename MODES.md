# 무료/유료 모드 전환 가이드

이 앱은 **환경 변수 하나로** 무료 모드와 유료 모드를 즉시 전환할 수 있습니다.

## 🆓 무료 모드 (기본값)

### 특징
- Twitter OAuth 로그인만 필요
- 지갑 연결 불필요
- 결제 없음
- 100% 무료

### 설정
```env
NEXT_PUBLIC_ENABLE_PAYMENTS=false  # 또는 설정 안 함
```

### 필요한 환경 변수
```env
# 필수
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...
NEYNAR_API_KEY=...
RAPIDAPI_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## 💰 유료 모드

### 특징
- Twitter OAuth + 지갑 연결 필요
- 첫 번째 쿼리: 무료
- 이후 쿼리: $1 USDC (Base 네트워크)
- 스마트 컨트랙트 결제

### 설정
```env
NEXT_PUBLIC_ENABLE_PAYMENTS=true  # 유료 모드 활성화
```

### 추가 환경 변수
```env
# 유료 모드 필수 (무료 모드 환경 변수 + 아래 항목)
NEXT_PUBLIC_CDP_API_KEY=...
NEXT_PUBLIC_CONTRACT_ADDRESS=...
NEXT_PUBLIC_PAYMENT_AMOUNT=1000000
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
```

### 유료 모드 추가 준비사항

1. **스마트 컨트랙트 배포**
   ```bash
   # Remix IDE 사용
   # contracts/XFriendsFinder.sol 배포
   # Base Mainnet에 배포
   # Constructor: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (USDC)
   ```

2. **의존성 설치 확인**
   ```bash
   npm install
   # 자동으로 Web3 라이브러리 포함됨
   ```

## 🔄 모드 전환 방법

### 로컬 개발

**.env.local 파일 수정:**
```bash
# 무료로 전환
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# 유료로 전환
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```

그리고 서버 재시작:
```bash
npm run dev
```

### Vercel 프로덕션

1. **Vercel Dashboard 접속**
   - Project Settings → Environment Variables

2. **변수 추가/수정**
   ```
   NEXT_PUBLIC_ENABLE_PAYMENTS = true
   ```

3. **재배포**
   ```bash
   vercel --prod
   ```

## 📊 모드별 차이점 비교

| 항목 | 무료 모드 | 유료 모드 |
|------|----------|----------|
| **인증** | Twitter OAuth | Twitter OAuth + Wallet |
| **비용** | 완전 무료 | 첫 쿼리 무료, 이후 $1 |
| **지갑** | 불필요 | Base Wallet 필요 |
| **스마트 컨트랙트** | 없음 | 필수 |
| **의존성** | next-auth만 | next-auth + wagmi + OnchainKit |
| **UI** | 간단 | 결제 UI 추가 |

## 🎯 추천 워크플로우

### 1단계: 무료 모드로 테스트
```env
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```
- 빠른 개발
- 기능 테스트
- UI/UX 검증

### 2단계: 유료 모드로 전환
```env
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```
- 스마트 컨트랙트 배포
- Base Sepolia 테스트넷에서 테스트
- 결제 플로우 검증

### 3단계: 프로덕션 배포
- Base Mainnet에 최종 배포
- 환경 변수 설정
- 모니터링 시작

## 🔧 기술적 세부사항

### 코드에서 모드 확인
```typescript
const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';

if (PAYMENTS_ENABLED) {
  // 유료 모드 로직
} else {
  // 무료 모드 로직
}
```

### 조건부 렌더링
- **app/page.tsx**: 단계별 흐름 변경
- **app/providers.tsx**: Web3 프로바이더 조건부 포함
- **components/**: PaymentGate는 유료 모드에서만 사용

### 조건부 의존성
```json
{
  "dependencies": {
    "next-auth": "^4.24.0",  // 항상 필요
    "@coinbase/onchainkit": "^0.30.0",  // 유료 모드에만 사용
    "wagmi": "^2.12.0"  // 유료 모드에만 사용
  }
}
```

## 🐛 문제 해결

### "Wallet not connecting"
→ 유료 모드가 활성화되었는지 확인
```bash
echo $NEXT_PUBLIC_ENABLE_PAYMENTS
# 'true' 여야 함
```

### "Payment component not showing"
→ 환경 변수 확인 후 서버 재시작
```bash
# 환경 변수 수정 후
npm run dev  # 재시작 필수!
```

### 빌드 에러
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 체크리스트

### 무료 모드 배포 체크리스트
- [ ] `NEXT_PUBLIC_ENABLE_PAYMENTS=false` 설정
- [ ] Twitter OAuth 설정 완료
- [ ] Neynar API 키 설정
- [ ] RapidAPI 키 설정
- [ ] Redis 설정
- [ ] 로컬 테스트 완료
- [ ] Vercel 배포

### 유료 모드 배포 체크리스트
- [ ] 무료 모드 체크리스트 모두 완료
- [ ] `NEXT_PUBLIC_ENABLE_PAYMENTS=true` 설정
- [ ] 스마트 컨트랙트 배포 (Base Mainnet)
- [ ] CDP API 키 발급
- [ ] 컨트랙트 주소 설정
- [ ] Base Sepolia에서 테스트
- [ ] 결제 플로우 테스트
- [ ] USDC 잔액 확인 테스트
- [ ] Basescan에서 컨트랙트 verify
- [ ] 프로덕션 배포

## 💡 팁

### 단계별 전환
1. **처음**: 무료 모드로 시작
2. **검증 후**: 유료 모드로 전환
3. **수익화**: 계속 유료 모드 유지

### A/B 테스팅
- 무료 버전: `free.your-app.com`
- 유료 버전: `premium.your-app.com`
- 각각 다른 환경 변수 사용

### 긴급 전환
문제 발생 시 즉시 무료 모드로:
```bash
# Vercel에서
NEXT_PUBLIC_ENABLE_PAYMENTS=false
# 저장 → 자동 재배포
```

## 📞 지원

문제가 있으면:
1. [QUICKSTART.md](./QUICKSTART.md) - 빠른 시작
2. [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
3. [SECURITY.md](./SECURITY.md) - 보안 가이드
4. GitHub Issues
