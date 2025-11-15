# 빠른 시작 가이드 (로컬 테스트)

## 1단계: 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

그리고 `.env.local` 파일을 열어서 아래 값들을 채워주세요:

### 필수 API 키

#### 1. Coinbase Developer Platform (CDP) API Key
```bash
NEXT_PUBLIC_CDP_API_KEY=
```

**발급 방법:**
1. https://cloud.coinbase.com/ 접속
2. "Sign Up" 또는 로그인
3. "Create Project" 클릭
4. Project 이름: "Find X Friends"
5. API Keys 탭 → "Create API Key"
6. 복사해서 붙여넣기

#### 2. Neynar API Key (Farcaster 데이터)
```bash
NEYNAR_API_KEY=
```

**발급 방법:**
1. https://neynar.com/ 접속
2. "Sign Up" 또는 로그인
3. Dashboard → "API Keys"
4. "Create New Key" 클릭
5. 복사해서 붙여넣기

#### 3. RapidAPI (Twitter/X 데이터)
```bash
RAPIDAPI_KEY=
RAPIDAPI_HOST=twitter-api45.p.rapidapi.com
```

**발급 방법:**
1. https://rapidapi.com/ 접속
2. "Sign Up" 또는 로그인
3. "Twitter API" 검색
4. 아무 Twitter API 서비스 선택 (추천: "Twitter API v2")
5. "Subscribe to Test" 또는 무료 플랜 선택
6. "X-RapidAPI-Key" 복사
7. "X-RapidAPI-Host" 복사

#### 4. Upstash Redis
```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

**발급 방법:**
1. https://upstash.com/ 접속
2. "Sign Up" 또는 로그인
3. "Create Database" 클릭
4. Type: Redis
5. Name: "find-x-friends"
6. Region: 가장 가까운 지역 선택
7. 생성 후 "REST API" 섹션에서:
   - `UPSTASH_REDIS_REST_URL` 복사
   - `UPSTASH_REDIS_REST_TOKEN` 복사

### 선택사항 (나중에 설정 가능)

#### 스마트 컨트랙트 (결제 기능 테스트 시 필요)
```bash
# 아직 배포 안 했으면 비워두세요
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_PAYMENT_AMOUNT=1000000
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

#### 기타
```bash
NEXT_PUBLIC_PROJECT_NAME="Find X Friends"
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
```

## 2단계: 의존성 설치

```bash
npm install
```

## 3단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열기

## 4단계: 테스트 시나리오

### 🧪 테스트 1: UI 확인
- [ ] 페이지가 정상적으로 로드됨
- [ ] "Connect Wallet" 버튼 보임
- [ ] 디자인이 깨지지 않음

### 🧪 테스트 2: API 연결 확인 (스마트 컨트랙트 없이)

API 라우트 직접 테스트:

```bash
# 터미널에서 실행
# 1. Payment Check API
curl http://localhost:3000/api/payment/check?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# 2. Twitter Following API (간단 테스트)
curl -X POST http://localhost:3000/api/twitter/following \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "twitterUsername": "elonmusk"
  }'

# 3. Farcaster Match API
curl -X POST http://localhost:3000/api/farcaster/match \
  -H "Content-Type: application/json" \
  -d '{
    "twitterHandles": ["dwr", "vitalik", "balajis"],
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### 🧪 테스트 3: 전체 플로우 (컨트랙트 필요)

**준비 사항:**
1. MetaMask 설치
2. Base Mainnet 추가
3. 테스트 ETH 확보 (또는 Base Sepolia 사용)

**스마트 컨트랙트 배포:**
1. https://remix.ethereum.org/ 접속
2. `contracts/XFriendsFinder.sol` 복사
3. Compile (0.8.20)
4. Deploy to Base
   - Constructor: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
5. 배포된 주소를 `.env.local`에 추가:
   ```bash
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x여기에_배포된_주소
   ```
6. 서버 재시작:
   ```bash
   # Ctrl+C로 중단 후
   npm run dev
   ```

**테스트:**
1. http://localhost:3000 접속
2. "Connect Wallet" 클릭
3. MetaMask 연결
4. Twitter 유저네임 입력
5. "Find My X Friends (FREE)" 클릭
6. 트랜잭션 승인
7. 결과 확인!

## 5단계: 문제 해결

### 에러: "CDP API Key invalid"
→ Coinbase Cloud에서 키 다시 확인

### 에러: "RAPIDAPI error"
→ RapidAPI 크레딧 확인, 플랜 구독 확인

### 에러: "Redis connection failed"
→ Upstash URL과 Token 다시 확인

### 에러: "Contract not found"
→ 컨트랙트 주소 확인, 올바른 네트워크인지 확인

### 페이지가 안 뜨는 경우
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 포트가 이미 사용중인 경우
```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

## 6단계: 성공 확인

모든 게 잘 작동하면:
- ✅ 지갑 연결 성공
- ✅ Twitter 유저네임 입력 가능
- ✅ 무료 쿼리 트랜잭션 성공
- ✅ X 팔로잉 리스트 가져오기 성공
- ✅ Farcaster 매칭 결과 표시
- ✅ Follow/Message 버튼 작동

## 다음 단계

로컬 테스트 성공 후:
1. Vercel에 배포 (DEPLOYMENT.md 참고)
2. 프로덕션 환경 변수 설정
3. 도메인 연결
4. Farcaster manifest 업데이트
5. Base App에 제출

## 빠른 디버깅

```bash
# 로그 확인
# API 라우트에서 console.log 추가하면 터미널에 표시됨

# 예: app/api/twitter/following/route.ts
console.log('Received request:', { address, twitterUsername });
```

## 도움이 필요하면

1. `SECURITY.md` - 보안 관련
2. `DEPLOYMENT.md` - 배포 가이드
3. `README.md` - 전체 문서
4. GitHub Issues - 문제 보고
