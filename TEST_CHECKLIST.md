# 테스트 체크리스트 ✅

## 시작하기 전에

### 필수 준비물
- [ ] Node.js 18+ 설치됨
- [ ] npm 설치됨
- [ ] 텍스트 에디터 (VS Code 추천)

## 단계별 테스트

### 1️⃣ 환경 변수 설정 (가장 중요!)

```bash
# .env.local 파일 열기
code .env.local
# 또는
nano .env.local
```

**최소한 이것들은 꼭 채워야 함:**
- `NEXT_PUBLIC_CDP_API_KEY` (필수)
- `NEYNAR_API_KEY` (필수)
- `RAPIDAPI_KEY` (필수)
- `UPSTASH_REDIS_REST_URL` (필수)
- `UPSTASH_REDIS_REST_TOKEN` (필수)

**나중에 채워도 됨:**
- `NEXT_PUBLIC_CONTRACT_ADDRESS` (결제 테스트 시)

### 2️⃣ 의존성 설치

```bash
npm install
```

**예상 시간:** 1-2분

### 3️⃣ 개발 서버 실행

```bash
npm run dev
```

**성공 메시지:**
```
✓ Ready in 3.2s
○ Local:        http://localhost:3000
```

### 4️⃣ 브라우저 테스트

http://localhost:3000 열기

#### 체크포인트 1: 페이지 로딩
- [ ] 페이지가 로드됨
- [ ] "Find X Friends on Farcaster" 제목 보임
- [ ] "Connect Wallet" 버튼 보임
- [ ] 콘솔에 에러 없음 (F12 → Console)

#### 체크포인트 2: 디자인
- [ ] 배경 그라데이션 예쁨
- [ ] 버튼들이 잘 보임
- [ ] 모바일 크기에서도 괜찮음 (F12 → Toggle device toolbar)

### 5️⃣ API 테스트 (컨트랙트 없이)

터미널 새 탭 열어서:

```bash
# Payment Check API 테스트
curl "http://localhost:3000/api/payment/check?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

**기대 결과:**
```json
{
  "needsPayment": false,
  "queryCount": 0,
  "message": "First query is free!"
}
```

### 6️⃣ 스마트 컨트랙트 배포 (선택)

**지금 당장 안 해도 됨!** 
나중에 결제 기능 테스트할 때 하세요.

#### 빠른 배포 (Remix IDE)
1. https://remix.ethereum.org/
2. `contracts/XFriendsFinder.sol` 복사
3. Compile
4. Deploy to Base Sepolia (테스트넷)
   - Network: Base Sepolia
   - Constructor: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (Sepolia USDC)

5. `.env.local`에 추가:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x배포된주소
```

6. 서버 재시작

### 7️⃣ 전체 플로우 테스트

#### 준비물
- [ ] MetaMask 설치
- [ ] Base Sepolia 네트워크 추가
- [ ] 테스트 ETH 받기 (https://faucet.quicknode.com/base/sepolia)

#### 테스트 단계
1. [ ] 페이지 접속
2. [ ] "Connect Wallet" 클릭
3. [ ] MetaMask 연결
4. [ ] Twitter 유저네임 입력 (예: "elonmusk")
5. [ ] "Continue" 클릭
6. [ ] "Find My X Friends (FREE)" 버튼 보임
7. [ ] 버튼 클릭
8. [ ] MetaMask 트랜잭션 승인
9. [ ] "Finding Your Friends..." 로딩 표시
10. [ ] 결과 화면 표시!

## 예상되는 문제들

### 문제: `npm install` 실패
```bash
# 해결: Node 버전 확인
node --version  # 18+ 필요

# 또는 package-lock.json 삭제 후 재시도
rm package-lock.json
npm install
```

### 문제: "CDP API Key invalid"
→ `.env.local`에서 `NEXT_PUBLIC_CDP_API_KEY` 확인
→ https://cloud.coinbase.com/ 에서 키 재발급

### 문제: "Cannot read properties of undefined"
→ 환경 변수가 제대로 로드 안 됨
→ 서버 재시작 (Ctrl+C → `npm run dev`)

### 문제: "CORS error"
→ 정상입니다. API는 서버에서만 호출되므로 CORS 에러 무시

### 문제: "Redis connection failed"
→ Upstash URL과 Token 확인
→ Upstash 대시보드에서 Database가 Active인지 확인

## 성공 기준

### 최소 성공
- [x] 페이지 로드됨
- [x] 지갑 연결됨
- [x] Twitter 유저네임 입력됨

### 부분 성공 (컨트랙트 없이)
- [x] API 호출 성공
- [x] 데이터 가져오기 성공
- [ ] 결제는 나중에

### 완전 성공
- [x] 모든 위 단계
- [x] 스마트 컨트랙트 배포
- [x] 무료 쿼리 트랜잭션 성공
- [x] 결과 표시

## 다음 단계

로컬 테스트 성공 후:
1. [ ] Vercel 계정 만들기
2. [ ] GitHub 연동
3. [ ] 프로덕션 배포
4. [ ] 실제 Base Mainnet 컨트랙트 배포
5. [ ] 친구들에게 자랑하기! 🎉

## 질문이 있으면

1. `QUICKSTART.md` - 빠른 시작
2. `SECURITY.md` - 보안 FAQ
3. `DEPLOYMENT.md` - 배포 가이드
4. `README.md` - 전체 문서
