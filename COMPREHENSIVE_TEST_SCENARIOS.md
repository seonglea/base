# 포괄적 테스트 시나리오 및 절차

## 📋 목차
1. [테스트 환경 설정](#테스트-환경-설정)
2. [레벨 1: 기본 빌드 테스트](#레벨-1-기본-빌드-테스트)
3. [레벨 2: UI/UX 테스트](#레벨-2-uiux-테스트)
4. [레벨 3: 무료 모드 통합 테스트](#레벨-3-무료-모드-통합-테스트)
5. [레벨 4: 유료 모드 통합 테스트](#레벨-4-유료-모드-통합-테스트)
6. [레벨 5: API 엔드포인트 테스트](#레벨-5-api-엔드포인트-테스트)
7. [레벨 6: 보안 테스트](#레벨-6-보안-테스트)
8. [레벨 7: 성능 테스트](#레벨-7-성능-테스트)
9. [회귀 테스트 체크리스트](#회귀-테스트-체크리스트)

---

## 테스트 환경 설정

### 사전 요구사항
```bash
# Node.js 버전 확인
node --version  # v18.0.0 이상

# npm 버전 확인
npm --version   # v9.0.0 이상

# Git 상태 확인
git status
```

### 환경 변수 템플릿

#### 최소 설정 (빌드 테스트용)
```env
# .env.local
NEXT_PUBLIC_ENABLE_PAYMENTS=false
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-min-32-chars-long-abc123
```

#### 무료 모드 전체 테스트용
```env
NEXT_PUBLIC_ENABLE_PAYMENTS=false
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Twitter OAuth (필수)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Farcaster (필수)
NEYNAR_API_KEY=your_neynar_api_key
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_client_id

# Twitter Data (필수)
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=twitter241.p.rapidapi.com

# Caching (필수)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

#### 유료 모드 전체 테스트용
```env
# 위 무료 모드 변수 + 아래 추가
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_CDP_API_KEY=your_coinbase_api_key
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_PAYMENT_AMOUNT=1000000
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
```

---

## 레벨 1: 기본 빌드 테스트

### 목적
- 코드가 정상적으로 컴파일되는지 확인
- 의존성 문제 검증
- 빌드 파일 생성 확인

### 절차

#### 1.1 의존성 설치 테스트
```bash
# 클린 설치
rm -rf node_modules package-lock.json
npm install

# 예상 결과: 에러 없이 완료
# 시간: 1-2분
```

**체크포인트:**
- [ ] `node_modules/` 폴더 생성됨
- [ ] `package-lock.json` 생성됨
- [ ] 에러 메시지 없음
- [ ] 경고만 있어도 OK (peer dependencies)

#### 1.2 TypeScript 컴파일 테스트
```bash
# TypeScript 타입 체크
npx tsc --noEmit

# 예상 결과: 에러 없음
```

**체크포인트:**
- [ ] 타입 에러 없음
- [ ] import 경로 모두 해결됨

#### 1.3 개발 서버 시작 테스트
```bash
# 개발 서버 실행
npm run dev

# 예상 출력:
# ✓ Ready in 3.5s
# ○ Local:    http://localhost:3000
```

**체크포인트:**
- [ ] 서버가 3000 포트에서 시작됨
- [ ] "Ready" 메시지 표시
- [ ] 컴파일 에러 없음

#### 1.4 프로덕션 빌드 테스트
```bash
# 프로덕션 빌드
npm run build

# 예상 출력:
# ✓ Compiled successfully
# ✓ Collecting page data
# ✓ Generating static pages
```

**체크포인트:**
- [ ] `.next/` 폴더 생성됨
- [ ] 빌드 에러 없음
- [ ] 번들 크기 합리적 (< 5MB)
- [ ] Tree-shaking 적용됨

#### 1.5 프로덕션 서버 테스트
```bash
# 프로덕션 모드 실행
npm run start

# localhost:3000 접속
```

**체크포인트:**
- [ ] 페이지 로드됨
- [ ] CSS 정상 적용
- [ ] 이미지 로드됨

---

## 레벨 2: UI/UX 테스트

### 목적
- 사용자 인터페이스 동작 확인
- 반응형 디자인 검증
- 접근성 확인

### 2.1 초기 화면 테스트

**테스트 URL:** `http://localhost:3000`

#### 시나리오: 첫 방문 사용자
```
GIVEN: 사용자가 앱을 처음 방문
WHEN: 홈페이지 로드
THEN: 로그인 화면 표시
```

**체크포인트:**
- [ ] 헤더에 "Find X Friends on Farcaster" 제목 표시
- [ ] 🔍 아이콘 표시
- [ ] "Sign in with Twitter" 버튼 보임 (파란색)
- [ ] "🎉 Completely FREE!" 배지 보임 (무료 모드)
- [ ] "🎉 First query FREE!" 배지 보임 (유료 모드)
- [ ] 그라데이션 배경 (`from-blue-50 via-purple-50 to-pink-50`)
- [ ] 푸터에 Base & Farcaster 링크

**브라우저 콘솔 체크:**
```javascript
// F12 → Console
// 에러 없어야 함
// 경고는 OK (MetaMask SDK 등)
```

#### 시나리오: 반응형 디자인
```
GIVEN: 다양한 화면 크기
WHEN: 화면 크기 변경
THEN: 레이아웃 적절히 조정됨
```

**테스트 크기:**
1. **모바일** (375px × 667px - iPhone SE)
   - [ ] 버튼 터치 가능 크기
   - [ ] 텍스트 읽기 쉬움
   - [ ] 가로 스크롤 없음

2. **태블릿** (768px × 1024px - iPad)
   - [ ] 컨텐츠 중앙 정렬
   - [ ] max-w-4xl 적용됨

3. **데스크톱** (1920px × 1080px)
   - [ ] 컨텐츠 너무 넓지 않음
   - [ ] 여백 적절함

### 2.2 인터랙션 테스트

#### 버튼 호버 효과
```javascript
// 체크할 버튼들
const buttons = [
  "Sign in with Twitter",      // hover:bg-[#1a8cd8]
  "Sign in with Farcaster",    // hover:bg-purple-700
  "Find My X Friends",         // hover:bg-blue-700
  "Search Again",              // hover:text-blue-700
];
```

**체크포인트:**
- [ ] 마우스 오버 시 색상 변경
- [ ] 커서가 포인터로 변경
- [ ] 트랜지션 부드러움 (`transition-colors`)

#### 로딩 상태
```
GIVEN: 데이터 로딩 중
WHEN: 로딩 스피너 표시
THEN: 사용자에게 피드백 제공
```

**체크포인트:**
- [ ] 스피너 애니메이션 (`animate-spin`)
- [ ] "Finding Your Friends..." 메시지
- [ ] 배경 흐림 효과 (선택적)

### 2.3 접근성 테스트

#### 키보드 내비게이션
```bash
# Tab 키로 모든 인터랙티브 요소 접근 가능해야 함
Tab → Tab → Tab → Enter
```

**체크포인트:**
- [ ] Tab으로 버튼 간 이동 가능
- [ ] 포커스 표시 명확함
- [ ] Enter로 버튼 클릭 가능
- [ ] Esc로 모달 닫기 (해당시)

#### 스크린 리더 호환성
```bash
# Chrome DevTools Lighthouse 실행
# F12 → Lighthouse → Accessibility
```

**목표 점수:** 90점 이상

**체크포인트:**
- [ ] alt 텍스트 존재
- [ ] ARIA 레이블 적절
- [ ] 색상 대비 충분 (4.5:1 이상)
- [ ] 헤딩 구조 적절 (h1 → h2 → h3)

---

## 레벨 3: 무료 모드 통합 테스트

### 사전 준비
```bash
# .env.local 설정
NEXT_PUBLIC_ENABLE_PAYMENTS=false
# + Twitter OAuth, Neynar, RapidAPI, Redis 키

# 서버 시작
npm run dev
```

### 3.1 Twitter OAuth 플로우

#### 시나리오: 정상 로그인
```
GIVEN: 유효한 Twitter 계정
WHEN: "Sign in with Twitter" 클릭
THEN: Twitter 인증 페이지로 이동
AND: 인증 후 앱으로 돌아옴
AND: 사용자 정보 표시됨
```

**절차:**
1. `http://localhost:3000` 접속
2. "Sign in with Twitter" 버튼 클릭
3. Twitter 로그인 (필요시)
4. "Authorize app" 클릭
5. 리다이렉트 대기

**예상 결과:**
- [ ] Twitter 인증 페이지 이동 (twitter.com)
- [ ] 앱 권한 설명 표시 (Read following)
- [ ] 인증 후 `http://localhost:3000` 리다이렉트
- [ ] 헤더에 `@username` 표시
- [ ] 콘솔에 에러 없음

**예상 URL 흐름:**
```
http://localhost:3000
→ https://twitter.com/i/oauth2/authorize?...
→ http://localhost:3000/api/auth/callback/twitter?code=...
→ http://localhost:3000 (로그인 완료)
```

#### 시나리오: 로그인 실패
```
GIVEN: 유효하지 않은 OAuth 설정
WHEN: 로그인 시도
THEN: 에러 메시지 표시
```

**테스트 케이스:**
- 잘못된 CLIENT_ID → "Configuration error"
- 네트워크 끊김 → "Network error"
- 사용자 취소 → 로그인 화면 유지

### 3.2 Farcaster 인증 플로우

#### 시나리오: Farcaster SIWF
```
GIVEN: Twitter 로그인 완료
WHEN: "Sign in with Farcaster" 클릭
THEN: Neynar SIWF 페이지로 이동
AND: 인증 후 앱으로 돌아옴
```

**절차:**
1. Twitter 로그인 완료 상태
2. "Sign in with Farcaster" 버튼 클릭
3. Neynar 페이지에서 Warpcast로 QR 스캔
4. 또는 Farcaster 계정으로 로그인
5. 앱으로 돌아오기

**예상 결과:**
- [ ] Neynar SIWF 페이지 이동
- [ ] QR 코드 또는 로그인 폼 표시
- [ ] 인증 후 콜백: `/api/auth/farcaster/callback`
- [ ] 헤더에 `⌐◨-◨ @fc_username` 표시
- [ ] localStorage에 farcaster_user 저장됨

**확인 방법:**
```javascript
// 브라우저 콘솔에서
localStorage.getItem('farcaster_user')
// 예상: {"fid":123,"username":"alice","displayName":"Alice",...}
```

### 3.3 친구 찾기 전체 플로우

#### 시나리오: 성공적인 매칭
```
GIVEN: Twitter + Farcaster 로그인 완료
WHEN: "Find My X Friends (FREE)" 클릭
THEN: Twitter 팔로잉 목록 가져오기
AND: Farcaster 계정과 매칭
AND: 결과 표시
```

**절차:**
1. Twitter + Farcaster 로그인 완료
2. "Find My X Friends (FREE)" 버튼 클릭
3. 로딩 화면 대기 (10-30초)
4. 결과 화면 확인

**예상 단계별 출력 (콘솔):**
```javascript
// 1. Twitter following 요청
POST /api/twitter/following
// Response: { data: ["username1", "username2", ...] }

// 2. Farcaster 매칭 요청
POST /api/farcaster/match
// Request: { twitterHandles: [...] }
// Response: { matches: [...], total_searched: 150 }
```

**결과 화면 체크포인트:**
- [ ] 매칭된 친구 수 표시 (예: "5 friends found")
- [ ] 전체 검색 수 표시 (예: "out of 150 searched")
- [ ] 각 친구 카드에 포함:
  - [ ] 프로필 사진
  - [ ] Farcaster username (@username)
  - [ ] Display name
  - [ ] Bio (있는 경우)
  - [ ] 팔로워 수
  - [ ] "Follow" 버튼
  - [ ] "Message" 버튼
- [ ] "Search Again" 버튼

#### 시나리오: 매칭 결과 없음
```
GIVEN: Twitter 팔로잉 중 Farcaster 사용자 없음
WHEN: 검색 완료
THEN: "No matches found" 메시지
```

**체크포인트:**
- [ ] 빈 결과 메시지 표시
- [ ] 에러로 오해하지 않도록 친절한 문구
- [ ] "Search Again" 버튼 여전히 작동

#### 시나리오: API 에러 처리
```
GIVEN: RapidAPI 크레딧 소진
WHEN: 검색 시도
THEN: 에러 메시지 표시
```

**테스트할 에러:**
1. **RapidAPI 실패**
   - 예상 메시지: "Failed to fetch Twitter data"
   - 상태 코드: 429 (Rate limit)

2. **Neynar API 실패**
   - 예상 메시지: "Failed to match Farcaster users"
   - 상태 코드: 500

3. **Redis 연결 실패**
   - 캐시 없이 계속 진행 (graceful degradation)

**체크포인트:**
- [ ] 에러 메시지가 사용자 친화적
- [ ] 기술적 세부사항 숨겨짐 (콘솔에만)
- [ ] 재시도 옵션 제공

### 3.4 소셜 액션 테스트

#### 시나리오: Follow 버튼
```
GIVEN: 결과 화면에 친구 표시
WHEN: "Follow" 버튼 클릭
THEN: Farcaster에서 팔로우 시도
```

**절차:**
1. 결과 화면에서 친구 선택
2. "Follow" 버튼 클릭
3. API 호출 대기

**예상 동작:**
```javascript
// API 호출
POST /api/farcaster/follow
Body: { targetFid: 12345 }

// 성공 응답
{ success: true, message: "Followed successfully" }

// 버튼 상태 변경
"Follow" → "Following" (disabled)
```

**체크포인트:**
- [ ] 버튼 로딩 상태 표시
- [ ] 성공 시 버튼 비활성화
- [ ] 실패 시 에러 메시지
- [ ] 중복 클릭 방지

#### 시나리오: Message 버튼
```
GIVEN: Farcaster 계정 연결됨
WHEN: "Message" 버튼 클릭
THEN: Warpcast DM 페이지 열림
```

**예상 동작:**
- [ ] 새 탭에서 Warpcast 열림
- [ ] URL: `https://warpcast.com/username` 또는 DM 링크
- [ ] 앱은 그대로 유지

### 3.5 세션 관리 테스트

#### 시나리오: 로그아웃
```
GIVEN: 로그인 완료 상태
WHEN: "Sign Out" 클릭
THEN: 세션 종료 및 초기화
```

**체크포인트:**
- [ ] NextAuth 세션 클리어
- [ ] localStorage 클리어 (farcaster_user)
- [ ] 로그인 화면으로 돌아감
- [ ] 헤더 사용자 정보 사라짐

#### 시나리오: 새로고침 후 세션 유지
```
GIVEN: 로그인 완료 상태
WHEN: F5 (새로고침)
THEN: 로그인 상태 유지
```

**체크포인트:**
- [ ] Twitter 세션 유지 (NextAuth cookie)
- [ ] Farcaster 세션 유지 (localStorage)
- [ ] 사용자 정보 표시 유지

---

## 레벨 4: 유료 모드 통합 테스트

### 사전 준비

#### 환경 변수 전환
```bash
# .env.local
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_CDP_API_KEY=your_coinbase_api_key
# + 기타 Base 관련 변수

# 서버 재시작
npm run dev
```

#### 스마트 컨트랙트 배포 (테스트넷)
```
1. Remix IDE: https://remix.ethereum.org/
2. XFriendsFinder.sol 복사
3. Compile with Solidity 0.8.20
4. Deploy to Base Sepolia
   - Network: Base Sepolia (Chain ID: 84532)
   - Constructor: 0x036CbD53842c5426634e7929541eC2318f3dCF7e (USDC Sepolia)
5. 배포 주소 복사 → NEXT_PUBLIC_CONTRACT_ADDRESS
```

#### 지갑 준비
```
1. MetaMask 설치
2. Base Sepolia 네트워크 추가
   - RPC: https://sepolia.base.org
   - Chain ID: 84532
3. 테스트 ETH 받기
   - Faucet: https://faucet.quicknode.com/base/sepolia
   - 필요량: 0.01 ETH (가스비)
4. 테스트 USDC 받기 (필요시)
```

### 4.1 지갑 연결 플로우

#### 시나리오: 정상 지갑 연결
```
GIVEN: Twitter + Farcaster 로그인 완료
AND: 유료 모드 활성화
WHEN: "Connect Wallet" 버튼 클릭
THEN: OnchainKit 지갑 모달 표시
AND: Base Smart Wallet 또는 MetaMask 연결
```

**절차:**
1. Twitter + Farcaster 로그인 완료
2. "Connect Wallet" 단계 표시 확인
3. "Connect Wallet" 버튼 클릭
4. OnchainKit 모달에서 지갑 선택
5. MetaMask 팝업 승인

**체크포인트:**
- [ ] OnchainKit 모달 표시
- [ ] Base 네트워크 자동 감지/전환
- [ ] 연결 후 지갑 주소 표시 (0x...1234 형식)
- [ ] WalletDropdown에 "Disconnect" 옵션
- [ ] 다음 단계로 자동 이동 (Payment 단계)

#### 시나리오: 잘못된 네트워크
```
GIVEN: Ethereum Mainnet에 연결됨
WHEN: 지갑 연결 시도
THEN: Base로 네트워크 전환 요청
```

**체크포인트:**
- [ ] "Switch to Base" 메시지
- [ ] MetaMask 네트워크 전환 팝업
- [ ] 전환 후 정상 진행

### 4.2 결제 플로우 테스트

#### 시나리오: 첫 무료 쿼리
```
GIVEN: 지갑 연결 완료
AND: 이전 쿼리 기록 없음
WHEN: "Find My X Friends (FREE)" 클릭
THEN: 무료 쿼리 실행
```

**절차:**
1. 지갑 연결 완료 상태
2. 결제 화면에서 "First query is FREE!" 확인
3. "Find My X Friends (FREE)" 버튼 클릭
4. MetaMask 트랜잭션 승인 (가스비만)
5. 트랜잭션 대기

**API 호출 순서:**
```javascript
// 1. 결제 상태 확인
GET /api/payment/check?address=0x123...
Response: { needsPayment: false, queryCount: 0 }

// 2. 스마트 컨트랙트 호출
Contract.freeQuery()
// 이벤트: QueryExecuted(address, 1)

// 3. 데이터 가져오기
POST /api/twitter/following
POST /api/farcaster/match
```

**체크포인트:**
- [ ] 첫 쿼리는 USDC 승인 불필요
- [ ] 가스비만 지불 (~$0.01)
- [ ] 트랜잭션 성공
- [ ] queryCount가 1로 증가
- [ ] 결과 정상 표시

**Basescan 확인:**
```
트랜잭션 확인: https://sepolia.basescan.org/tx/0x...
- Status: Success ✓
- Function: freeQuery()
- Event: QueryExecuted(user, 1)
```

#### 시나리오: 두 번째 유료 쿼리
```
GIVEN: 이미 무료 쿼리 사용
WHEN: 다시 검색 시도
THEN: $1 USDC 결제 요구
```

**절차:**
1. "Search Again" 클릭
2. 결제 화면으로 돌아감
3. "Pay $1 USDC to Search" 버튼 표시
4. 버튼 클릭
5. USDC Approve 트랜잭션 승인
6. payAndQuery 트랜잭션 승인
7. 결과 표시

**API 호출 순서:**
```javascript
// 1. 결제 상태 확인
GET /api/payment/check?address=0x123...
Response: { needsPayment: true, queryCount: 1 }

// 2. USDC Approve
USDC.approve(contractAddress, 1000000) // $1 USDC

// 3. 결제 및 쿼리
Contract.payAndQuery()
// 이벤트:
// - PaymentReceived(address, 1000000, timestamp)
// - QueryExecuted(address, 2)

// 4. 데이터 가져오기
POST /api/twitter/following (with txHash)
POST /api/farcaster/match
```

**체크포인트:**
- [ ] 두 개의 트랜잭션 (Approve + PayAndQuery)
- [ ] USDC 잔액 1 USDC 감소 확인
- [ ] 컨트랙트 owner가 USDC 수령
- [ ] queryCount가 2로 증가
- [ ] 결과 정상 표시

**USDC 잔액 확인:**
```javascript
// 브라우저 콘솔 또는 Etherscan
// 사용자 지갑 USDC 잔액: before - 1
// 컨트랙트 owner 잔액: before + 1
```

#### 시나리오: 결제 실패 처리

**케이스 1: USDC 잔액 부족**
```
GIVEN: USDC 잔액 < $1
WHEN: payAndQuery 호출
THEN: 트랜잭션 실패
```

**체크포인트:**
- [ ] "Insufficient USDC balance" 에러
- [ ] 사용자 친화적 메시지
- [ ] 결제 화면 유지 (결과 화면 아님)

**케이스 2: Approve 거부**
```
GIVEN: 사용자가 Approve 트랜잭션 거부
WHEN: MetaMask에서 "Reject" 클릭
THEN: 결제 취소
```

**체크포인트:**
- [ ] "Transaction rejected" 메시지
- [ ] 결제 화면으로 돌아감
- [ ] 재시도 가능

**케이스 3: 가스비 부족**
```
GIVEN: ETH 잔액 < 가스비
WHEN: 트랜잭션 시도
THEN: MetaMask 에러
```

**체크포인트:**
- [ ] "Insufficient funds for gas" 에러
- [ ] 가스비 확보 안내

### 4.3 결제 검증 테스트

#### 서버 사이드 검증
```
GIVEN: 트랜잭션 완료
WHEN: /api/twitter/following 호출
THEN: 서버가 결제 검증
```

**검증 로직:**
```javascript
// app/api/twitter/following/route.ts
// 1. txHash 파라미터 확인
// 2. 블록체인에서 트랜잭션 조회
// 3. 이벤트 로그에서 QueryExecuted 확인
// 4. 호출자 주소 일치 확인
// 5. 최근 트랜잭션인지 확인 (10분 이내)
```

**테스트 케이스:**
1. **정상 txHash** → 통과
2. **오래된 txHash** → 거부 ("Transaction too old")
3. **다른 사용자의 txHash** → 거부 ("Unauthorized")
4. **존재하지 않는 txHash** → 거부 ("Invalid transaction")

### 4.4 컨트랙트 함수 직접 테스트

#### Remix IDE 또는 Etherscan에서
```solidity
// 1. canQuery 테스트
canQuery(0xYourAddress)
// Expected: (needsPayment: false, queryCount: 0) // 첫 번째
// Expected: (needsPayment: true, queryCount: 1) // 두 번째

// 2. freeQuery 테스트
freeQuery()
// Expected: Success + QueryExecuted 이벤트
// Revert if: "Free query already used"

// 3. payAndQuery 테스트
// 먼저 USDC approve 필요
USDC.approve(contractAddress, 1000000)
// 그 다음
payAndQuery()
// Expected: Success + PaymentReceived + QueryExecuted 이벤트
```

---

## 레벨 5: API 엔드포인트 테스트

### 5.1 Payment Check API

#### 테스트: 첫 번째 쿼리
```bash
curl "http://localhost:3000/api/payment/check?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

**예상 응답:**
```json
{
  "needsPayment": false,
  "queryCount": 0,
  "message": "First query is free!"
}
```

#### 테스트: 두 번째 쿼리
```bash
# 동일 주소로 freeQuery() 실행 후
curl "http://localhost:3000/api/payment/check?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

**예상 응답:**
```json
{
  "needsPayment": true,
  "queryCount": 1,
  "message": "Payment required"
}
```

#### 테스트: 에러 케이스
```bash
# 주소 없음
curl "http://localhost:3000/api/payment/check"
# Expected: 400 Bad Request

# 잘못된 주소
curl "http://localhost:3000/api/payment/check?address=invalid"
# Expected: 400 Bad Request
```

### 5.2 Twitter Following API

#### 테스트: 정상 요청 (무료 모드)
```bash
curl -X POST http://localhost:3000/api/twitter/following \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{}'
```

**예상 응답:**
```json
{
  "data": [
    "username1",
    "username2",
    "username3"
  ],
  "total": 150,
  "cached": false
}
```

#### 테스트: Redis 캐싱
```bash
# 첫 번째 요청 (캐시 미스)
curl ...
# Response: "cached": false

# 두 번째 요청 (캐시 히트)
curl ...
# Response: "cached": true
```

**Redis 확인:**
```bash
# Upstash Console 또는 redis-cli
GET twitter:following:USER_ID
# 캐시된 데이터 확인
```

#### 테스트: 인증 실패
```bash
# 세션 토큰 없이
curl -X POST http://localhost:3000/api/twitter/following
```

**예상 응답:**
```json
{
  "error": "Unauthorized"
}
```

### 5.3 Farcaster Match API

#### 테스트: 정상 매칭
```bash
curl -X POST http://localhost:3000/api/farcaster/match \
  -H "Content-Type: application/json" \
  -d '{
    "twitterHandles": ["vitalik", "punk6529", "dwr"]
  }'
```

**예상 응답:**
```json
{
  "matches": [
    {
      "fid": 5650,
      "username": "vitalik.eth",
      "displayName": "Vitalik Buterin",
      "pfpUrl": "https://...",
      "bio": "Ethereum founder",
      "followerCount": 150000,
      "followingCount": 500,
      "twitterUsername": "vitalik"
    },
    {
      "fid": 3,
      "username": "dwr.eth",
      "displayName": "Dan Romero",
      "pfpUrl": "https://...",
      "bio": "Farcaster founder",
      "followerCount": 200000,
      "followingCount": 1000,
      "twitterUsername": "dwr"
    }
  ],
  "total_searched": 3,
  "cached": false
}
```

#### 테스트: 매칭 없음
```bash
curl -X POST http://localhost:3000/api/farcaster/match \
  -H "Content-Type: application/json" \
  -d '{
    "twitterHandles": ["nonexistent_user_12345"]
  }'
```

**예상 응답:**
```json
{
  "matches": [],
  "total_searched": 1
}
```

### 5.4 Farcaster Follow API

#### 테스트: 팔로우 요청
```bash
curl -X POST http://localhost:3000/api/farcaster/follow \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "targetFid": 5650,
    "signerUuid": "your-signer-uuid"
  }'
```

**예상 응답:**
```json
{
  "success": true,
  "message": "Successfully followed user"
}
```

**체크포인트:**
- [ ] Neynar API 호출 성공
- [ ] signerUuid 검증
- [ ] Farcaster에서 실제 팔로우 확인

### 5.5 Farcaster User API

#### 테스트: FID로 사용자 조회
```bash
curl "http://localhost:3000/api/farcaster/user?fid=3"
```

**예상 응답:**
```json
{
  "user": {
    "fid": 3,
    "username": "dwr.eth",
    "display_name": "Dan Romero",
    "pfp_url": "https://...",
    "bio": "..."
  }
}
```

---

## 레벨 6: 보안 테스트

### 6.1 인증/인가 테스트

#### 테스트: 세션 없이 API 접근
```bash
# Twitter following API (인증 필요)
curl -X POST http://localhost:3000/api/twitter/following
# Expected: 401 Unauthorized
```

#### 테스트: CSRF 보호
```bash
# NextAuth CSRF 토큰 검증
# 잘못된 토큰으로 요청 시도
curl -X POST http://localhost:3000/api/auth/callback/twitter \
  -d "csrfToken=invalid"
# Expected: 403 Forbidden
```

#### 테스트: 다른 사용자의 데이터 접근 시도
```
GIVEN: User A 로그인
WHEN: User B의 txHash로 API 호출
THEN: 거부됨
```

**체크포인트:**
- [ ] 트랜잭션 발신자 검증
- [ ] 세션 사용자와 지갑 주소 일치 확인

### 6.2 입력 검증 테스트

#### SQL Injection 시도 (해당 없음 - NoSQL)
```bash
# 악의적 입력
curl -X POST http://localhost:3000/api/farcaster/match \
  -d '{"twitterHandles": ["'; DROP TABLE users; --"]}'
# Expected: 정상 처리 또는 무시
```

#### XSS 시도
```bash
# 악의적 username
curl -X POST http://localhost:3000/api/farcaster/match \
  -d '{"twitterHandles": ["<script>alert(1)</script>"]}'
# Expected: 이스케이프 처리
```

**체크포인트:**
- [ ] 모든 입력이 sanitize됨
- [ ] React는 기본적으로 XSS 방지
- [ ] API 응답에 HTML 태그 이스케이프

#### Command Injection 시도
```bash
# 시스템 명령어 주입 시도
curl -X POST http://localhost:3000/api/twitter/following \
  -d '{"username": "user; ls -la"}'
# Expected: 정상 처리 (문자열로 취급)
```

### 6.3 환경 변수 노출 테스트

#### 클라이언트에서 접근 시도
```javascript
// 브라우저 콘솔에서
console.log(process.env.TWITTER_CLIENT_SECRET)
// Expected: undefined (서버 전용 변수)

console.log(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)
// Expected: "0x..." (공개 변수만 접근 가능)
```

**체크포인트:**
- [ ] `NEXT_PUBLIC_*` 외 변수는 클라이언트 접근 불가
- [ ] 민감한 키는 서버 전용
- [ ] `.env.local`이 `.gitignore`에 포함됨

### 6.4 Rate Limiting 테스트

#### Neynar API Rate Limit
```bash
# 연속 100번 요청
for i in {1..100}; do
  curl http://localhost:3000/api/farcaster/match -d '{"twitterHandles":["test"]}'
done
# Expected: 일부 요청 429 Too Many Requests
```

**체크포인트:**
- [ ] Redis 캐싱으로 API 호출 최소화
- [ ] Rate limit 에러 우아하게 처리
- [ ] 재시도 로직 (exponential backoff)

### 6.5 스마트 컨트랙트 보안

#### 테스트: Reentrancy 공격 (해당 없음)
- 컨트랙트는 ERC20 transfer만 수행 (안전)

#### 테스트: Integer Overflow (해당 없음)
- Solidity 0.8+ 자동 체크

#### 테스트: Owner 권한 남용 방지
```solidity
// withdraw()는 owner만 호출 가능
// 다른 계정으로 시도 → Revert
```

**체크포인트:**
- [ ] Ownable 제대로 구현
- [ ] updateUsdcAddress는 owner만
- [ ] withdraw는 owner만

---

## 레벨 7: 성능 테스트

### 7.1 페이지 로드 속도

#### Lighthouse 테스트
```bash
# Chrome DevTools
# F12 → Lighthouse → Generate Report
```

**목표 점수:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 80+

**체크포인트:**
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1

### 7.2 번들 크기 분석

```bash
# 프로덕션 빌드 후
npm run build

# 출력 예:
# Route (app)              Size     First Load JS
# ┌ ○ /                    1.2 kB    120 kB
# ├ ○ /api/...             ...
# + First Load JS shared   118 kB
#   ├ chunks/...           ...
```

**목표:**
- [ ] 메인 번들 < 200 KB
- [ ] First Load JS < 150 KB
- [ ] 코드 스플리팅 적용됨

**무료 모드 vs 유료 모드 비교:**
```
무료 모드: ~100 KB (wagmi/viem 제외)
유료 모드: ~150 KB (Web3 라이브러리 포함)
```

### 7.3 API 응답 속도

#### Twitter Following API
```bash
# 캐시 미스
time curl ... /api/twitter/following
# Expected: 2-5초 (RapidAPI 속도 의존)

# 캐시 히트
time curl ... /api/twitter/following
# Expected: < 100ms
```

#### Farcaster Match API
```bash
time curl ... /api/farcaster/match -d '{"twitterHandles": [...]}'
# Expected: 1-3초 (Neynar API 속도 의존)
```

**목표:**
- [ ] 캐시 히트 < 100ms
- [ ] 캐시 미스 < 5초
- [ ] 병렬 처리 활용

### 7.4 Redis 캐싱 효율성

#### 캐시 히트율 측정
```javascript
// 100번 요청 후 통계
const hits = 80;
const misses = 20;
const hitRate = hits / (hits + misses);
// Expected: > 80%
```

**체크포인트:**
- [ ] 동일 사용자 재검색 시 캐시 활용
- [ ] TTL 적절 (24시간?)
- [ ] 메모리 사용량 합리적

---

## 회귀 테스트 체크리스트

### 배포 전 필수 테스트

#### 무료 모드
- [ ] 빌드 성공 (`npm run build`)
- [ ] Twitter 로그인 작동
- [ ] Farcaster 로그인 작동
- [ ] 친구 검색 작동
- [ ] 결과 표시 정상
- [ ] Follow 버튼 작동
- [ ] 로그아웃 작동

#### 유료 모드
- [ ] 위 무료 모드 테스트 전부 +
- [ ] 지갑 연결 작동
- [ ] 첫 무료 쿼리 작동
- [ ] 두 번째 유료 쿼리 작동
- [ ] 결제 검증 작동
- [ ] 에러 처리 정상

#### 크로스 브라우저 테스트
- [ ] Chrome (최신)
- [ ] Firefox (최신)
- [ ] Safari (iOS/macOS)
- [ ] Edge (최신)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

#### 반응형 테스트
- [ ] 모바일 (375px)
- [ ] 태블릿 (768px)
- [ ] 데스크톱 (1920px)
- [ ] 가로 모드 (모바일)

---

## 테스트 자동화 (선택)

### Jest 단위 테스트 예시

```javascript
// __tests__/lib/contract.test.ts
import { describe, it, expect } from '@jest/globals';
import { canQuery } from '@/lib/contract';

describe('Contract Functions', () => {
  it('should check if user needs payment', async () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    const result = await canQuery(address);

    expect(result).toHaveProperty('needsPayment');
    expect(result).toHaveProperty('queryCount');
    expect(typeof result.needsPayment).toBe('boolean');
    expect(typeof result.queryCount).toBe('number');
  });
});
```

### Playwright E2E 테스트 예시

```javascript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('Twitter login flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click sign in button
  await page.click('text=Sign in with Twitter');

  // Should redirect to Twitter
  await expect(page).toHaveURL(/twitter\.com/);

  // Login (requires test account)
  // ...

  // Should redirect back
  await expect(page).toHaveURL('http://localhost:3000');

  // Should show username
  await expect(page.locator('text=@')).toBeVisible();
});
```

---

## 테스트 결과 리포팅

### 테스트 리포트 템플릿

```markdown
# 테스트 실행 결과

**날짜**: 2025-11-26
**테스터**: [이름]
**환경**: [로컬/Vercel Preview/프로덕션]
**모드**: [무료/유료]

## 실행된 테스트

### 레벨 1: 빌드 테스트
- ✅ 의존성 설치
- ✅ TypeScript 컴파일
- ✅ 프로덕션 빌드

### 레벨 2: UI/UX 테스트
- ✅ 초기 화면
- ✅ 반응형 디자인
- ⚠️ 접근성 (89점 - 목표 90점)

### 레벨 3: 무료 모드 통합
- ✅ Twitter OAuth
- ✅ Farcaster SIWF
- ✅ 친구 검색
- ❌ Follow 버튼 (500 에러)

### 발견된 이슈
1. **Follow 버튼 에러**
   - 심각도: 중
   - 재현: Follow 클릭 → 500 Internal Server Error
   - 로그: "Neynar API rate limit exceeded"
   - 해결: API 키 확인 필요

## 총평
- 통과율: 95% (19/20)
- 배포 가능 여부: ⚠️ (이슈 #1 수정 후)
```

---

## 마무리

### 다음 단계
1. 모든 레벨 테스트 통과 확인
2. 이슈 수정
3. 회귀 테스트 재실행
4. Vercel Preview 배포 테스트
5. 프로덕션 배포
6. 모니터링 설정

### 테스트 문서 업데이트
- 새로운 기능 추가 시 테스트 시나리오 추가
- 버그 발견 시 재현 시나리오 문서화
- 정기적 회귀 테스트 (주 1회)

---

**문의사항**: GitHub Issues 또는 README.md 참고
