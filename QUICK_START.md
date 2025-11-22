# ⚡ 빠른 시작 가이드

## 1️⃣ 프로젝트 다운로드

### GitHub에서 클론:

```bash
# 터미널을 열고 실행
git clone https://github.com/YOUR_USERNAME/base.git
cd base

# 또는 특정 브랜치 클론
git clone -b claude/farcaster-x-friends-finder-012nRfAqJjbKMTyWPYsVm1EN https://github.com/YOUR_USERNAME/base.git
cd base
```

### 또는 ZIP 파일 다운로드:

1. GitHub 리포지토리 페이지에서 "Code" 버튼 클릭
2. "Download ZIP" 클릭
3. 압축 해제
4. 터미널에서 해당 폴더로 이동

## 2️⃣ 설치 (1분)

```bash
npm install
```

## 3️⃣ 환경 변수 설정 (5분)

`.env.local` 파일을 만들고 복사:

```env
# 무료 모드
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# NextAuth (필수)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=여기에_랜덤_문자열_입력

# Twitter OAuth (필수)
TWITTER_CLIENT_ID=Twitter_Developer_Portal에서_발급
TWITTER_CLIENT_SECRET=Twitter_Developer_Portal에서_발급

# Neynar (필수)
NEYNAR_API_KEY=neynar.com에서_발급

# RapidAPI (필수)
RAPIDAPI_KEY=rapidapi.com에서_발급
RAPIDAPI_HOST=twitter-api45.p.rapidapi.com

# Upstash Redis (필수)
UPSTASH_REDIS_REST_URL=upstash.com에서_발급
UPSTASH_REDIS_REST_TOKEN=upstash.com에서_발급
```

**NEXTAUTH_SECRET 생성:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4️⃣ API 키 발급 (15분)

### Twitter OAuth (가장 중요!)
1. https://developer.twitter.com/en/portal/dashboard
2. Create App
3. Settings → User authentication settings
4. Callback URL: `http://localhost:3000/api/auth/callback/twitter`
5. Client ID, Secret 복사

### Neynar
1. https://neynar.com
2. 회원가입
3. API Key 발급

### RapidAPI
1. https://rapidapi.com
2. Twitter API 구독
3. API Key 복사

### Upstash Redis
1. https://upstash.com
2. Create Database (Regional)
3. URL, Token 복사

## 5️⃣ 실행 (즉시!)

```bash
npm run dev
```

## 6️⃣ 테스트

브라우저에서 http://localhost:3000 열기!

---

**자세한 가이드**: `LOCAL_SETUP.md` 참고
**문제 해결**: `LOCAL_SETUP.md`의 "문제 해결" 섹션 참고
