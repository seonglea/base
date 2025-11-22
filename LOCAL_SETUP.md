# 로컬 컴퓨터에서 테스트하기

## 📋 사전 준비사항

로컬 컴퓨터에 다음이 설치되어 있어야 합니다:
- **Node.js** 18 이상 (https://nodejs.org)
- **Git** (https://git-scm.com)
- **텍스트 에디터** (VS Code 권장)

## 🚀 1단계: 프로젝트 클론

터미널(Windows: PowerShell 또는 CMD)을 열고:

```bash
# 원하는 폴더로 이동
cd ~/Desktop  # 예시: 데스크톱으로 이동

# GitHub에서 프로젝트 클론
git clone [YOUR_GITHUB_REPO_URL]
cd base

# 또는 특정 브랜치 클론
git clone -b claude/farcaster-x-friends-finder-012nRfAqJjbKMTyWPYsVm1EN [YOUR_GITHUB_REPO_URL]
cd base
```

## 📦 2단계: 의존성 설치

```bash
# npm 사용
npm install

# 또는 yarn 사용
yarn install

# 또는 pnpm 사용
pnpm install
```

설치 시간: 약 2-3분 소요

## 🔑 3단계: 환경 변수 설정

### 빠른 설정 (무료 모드로 테스트)

프로젝트 루트에 `.env.local` 파일을 생성하세요:

```bash
# Windows (PowerShell)
New-Item .env.local

# Mac/Linux
touch .env.local
```

`.env.local` 파일에 다음 내용을 복사하세요:

```env
# ====================
# 무료 모드 설정
# ====================
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# ====================
# NextAuth 설정 (필수)
# ====================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-to-random-string

# ====================
# Twitter OAuth (필수)
# ====================
# 👉 https://developer.twitter.com/en/portal/dashboard 에서 발급
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here

# ====================
# Neynar API (Farcaster) (필수)
# ====================
# 👉 https://neynar.com 에서 발급
NEYNAR_API_KEY=your_neynar_api_key_here

# ====================
# RapidAPI (Twitter 데이터) (필수)
# ====================
# 👉 https://rapidapi.com 에서 Twitter API 구독 후 발급
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=twitter241.p.rapidapi.com  # 사용하는 API 서비스에 따라 변경

# ====================
# Upstash Redis (캐싱) (필수)
# ====================
# 👉 https://upstash.com 에서 Redis 데이터베이스 생성 후 발급
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# ====================
# 유료 모드 (선택사항 - 나중에 설정)
# ====================
# NEXT_PUBLIC_ENABLE_PAYMENTS=true로 변경 시 필요
# NEXT_PUBLIC_CDP_API_KEY=your_coinbase_api_key
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### NEXTAUTH_SECRET 생성하기

```bash
# Node.js로 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 온라인 생성기 사용
# https://generate-secret.vercel.app/32
```

## 🔐 4단계: API 키 발급 (필수)

### 1️⃣ Twitter OAuth 설정

**중요: 이 설정이 없으면 로그인이 안 됩니다!**

1. https://developer.twitter.com/en/portal/dashboard 방문
2. "Create Project" → "Create App" 클릭
3. **User authentication settings** 클릭:
   - **App permissions**: Read
   - **Type of App**: Web App
   - **Callback URL**: `http://localhost:3000/api/auth/callback/twitter`
   - **Website URL**: `http://localhost:3000`
4. **Client ID**와 **Client Secret** 복사
5. `.env.local` 파일에 붙여넣기:
   ```env
   TWITTER_CLIENT_ID=발급받은_클라이언트_ID
   TWITTER_CLIENT_SECRET=발급받은_클라이언트_시크릿
   ```

### 2️⃣ Neynar API (Farcaster 데이터)

1. https://neynar.com 방문
2. 회원가입 / 로그인
3. Dashboard → API Keys → Create New Key
4. API Key 복사
5. `.env.local`에 추가:
   ```env
   NEYNAR_API_KEY=발급받은_API_키
   ```

### 3️⃣ RapidAPI (Twitter 데이터)

1. https://rapidapi.com 회원가입 / 로그인
2. Twitter API 검색 (예: "Twitter241" 또는 "Twttr API")
3. 적합한 Twitter API 서비스 구독 (무료 플랜 가능)
4. API Key 복사 (Header에 들어갈 X-RapidAPI-Key)
5. API Host 확인 (예: `twitter241.p.rapidapi.com`)
6. `.env.local`에 추가:
   ```env
   RAPIDAPI_KEY=발급받은_RapidAPI_키
   RAPIDAPI_HOST=twitter241.p.rapidapi.com  # 구독한 서비스의 Host
   ```

### 4️⃣ Upstash Redis (캐싱)

1. https://upstash.com 회원가입 / 로그인
2. Create Database 클릭
3. **Type**: Regional 선택
4. Region: 가까운 지역 선택 (예: Tokyo)
5. REST URL과 REST TOKEN 복사
6. `.env.local`에 추가:
   ```env
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=발급받은_토큰
   ```

## ▶️ 5단계: 개발 서버 실행

```bash
npm run dev
```

성공하면 다음과 같이 표시됩니다:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
✓ Ready in 3.4s
```

## 🌐 6단계: 브라우저에서 테스트

1. 브라우저를 열고 http://localhost:3000 접속
2. "Sign in with Twitter" 버튼 클릭
3. Twitter 인증 완료
4. "Find My X Friends (FREE)" 버튼 클릭
5. 결과 확인!

## ✅ 테스트 체크리스트

- [ ] 프로젝트 클론 완료
- [ ] `npm install` 실행 완료
- [ ] `.env.local` 파일 생성
- [ ] NEXTAUTH_SECRET 생성 및 설정
- [ ] Twitter OAuth 설정 (Client ID, Secret)
- [ ] Neynar API Key 설정
- [ ] RapidAPI Key 설정
- [ ] Upstash Redis 설정
- [ ] `npm run dev` 실행
- [ ] http://localhost:3000 접속 확인
- [ ] Twitter 로그인 테스트
- [ ] 친구 찾기 기능 테스트

## 🐛 문제 해결

### 포트 3000이 이미 사용 중인 경우

```bash
# 다른 포트로 실행
npm run dev -- -p 3001

# 그리고 브라우저에서 http://localhost:3001 접속
# ⚠️ Twitter OAuth Callback URL도 변경 필요!
```

### Twitter OAuth 에러

**에러**: "Callback URL not approved"

**해결**:
1. Twitter Developer Portal 재확인
2. Callback URL이 정확히 `http://localhost:3000/api/auth/callback/twitter`인지 확인
3. 프로토콜(http://)이 정확한지 확인 (https가 아님!)

### 모듈을 찾을 수 없다는 에러

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 환경 변수가 적용되지 않을 때

**해결**: 개발 서버를 재시작하세요
```bash
# Ctrl+C로 서버 종료
# 다시 실행
npm run dev
```

## 🎨 로고 추가 (선택사항)

로고 파일이 있다면:
1. `public/` 폴더에 파일 복사
   - `logo.png` (512x512px)
   - `favicon.ico` (32x32px)
   - `apple-touch-icon.png` (180x180px)
   - `og-image.png` (1200x630px)
2. 개발 서버 재시작
3. 헤더에 로고 자동 표시

자세한 내용: `HOW_TO_ADD_LOGO.md` 참고

## 🔄 무료 모드 → 유료 모드 전환

테스트 완료 후 유료 모드로 전환하려면:

1. `.env.local` 파일 수정:
   ```env
   NEXT_PUBLIC_ENABLE_PAYMENTS=true
   ```

2. 추가 환경 변수 설정:
   ```env
   NEXT_PUBLIC_CDP_API_KEY=your_coinbase_api_key
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (배포된 컨트랙트 주소)
   ```

3. 스마트 컨트랙트 배포 (DEPLOYMENT.md 참고)

4. 개발 서버 재시작

자세한 내용: `MODES.md` 참고

## 📚 추가 자료

- **테스트 가이드**: `TESTING_STATUS.md`
- **로고 추가**: `HOW_TO_ADD_LOGO.md`
- **모드 전환**: `MODES.md`
- **배포 가이드**: `DEPLOYMENT.md`
- **보안 가이드**: `SECURITY.md`

## 💡 팁

### 빠른 테스트 (API 키 없이)

일단 앱이 실행되는지만 확인하려면:
1. `.env.local`에 최소한 다음만 설정:
   ```env
   NEXT_PUBLIC_ENABLE_PAYMENTS=false
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=test-secret-key-change-this
   ```
2. `npm run dev` 실행
3. http://localhost:3000 접속
4. UI만 확인 (로그인은 안 됨)

### 개발 팁

```bash
# 빌드 테스트 (배포 전)
npm run build

# 프로덕션 모드로 실행
npm run build && npm start

# 타입 체크
npm run build  # TypeScript 에러 확인
```

## 🚀 준비 완료!

모든 설정이 완료되었다면:
1. http://localhost:3000 접속
2. Twitter로 로그인
3. "Find My X Friends" 클릭
4. 친구 목록 확인!

문제가 있으면 위의 **문제 해결** 섹션을 참고하세요.

---

**도움이 필요하시면 언제든지 물어보세요!** 🎉
