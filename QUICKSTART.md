# 빠른 시작 가이드

## 🚀 5분 안에 로컬 테스트하기

### 1단계: Twitter Developer 계정 설정 (가장 중요!)

#### Twitter OAuth App 생성

1. **Twitter Developer Portal 접속**
   - https://developer.twitter.com/en/portal/dashboard
   - Twitter 계정으로 로그인

2. **새 프로젝트 생성**
   - "Create Project" 클릭
   - 프로젝트 이름: "Find X Friends"
   - Use case: "Making a bot" 또는 "Exploring the API"

3. **App 설정**
   - App name: "Find X Friends Local"
   - App environment: Development

4. **OAuth 2.0 설정** (중요!)
   - App Settings → "User authentication settings" → "Set up"
   - App permissions: "Read"
   - Type of App: "Web App"
   - Callback URL: `http://localhost:3000/api/auth/callback/twitter`
   - Website URL: `http://localhost:3000`
   - "Save" 클릭

5. **키 복사**
   - **Client ID** 복사
   - **Client Secret** 복사 (한 번만 보임!)

### 2단계: 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

`.env.local` 파일을 열어서 아래 값들을 채우세요:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=임시로아무거나32자이상입력하세요

# Twitter OAuth (위에서 복사한 값)
TWITTER_CLIENT_ID=여기에_Client_ID_붙여넣기
TWITTER_CLIENT_SECRET=여기에_Client_Secret_붙여넣기

# Neynar API
NEYNAR_API_KEY=나중에_입력

# RapidAPI
RAPIDAPI_KEY=나중에_입력
RAPIDAPI_HOST=twitter-api45.p.rapidapi.com

# Upstash Redis
UPSTASH_REDIS_REST_URL=나중에_입력
UPSTASH_REDIS_REST_TOKEN=나중에_입력
```

### 3단계: 나머지 API 키 발급 (5분)

#### A. NEXTAUTH_SECRET 생성
```bash
# 터미널에서 실행
openssl rand -base64 32

# 출력된 값을 복사해서 NEXTAUTH_SECRET에 붙여넣기
```

#### B. Neynar API (2분)
1. https://neynar.com/ 접속
2. 회원가입
3. Dashboard → "Create API Key"
4. 복사해서 `NEYNAR_API_KEY`에 붙여넣기

#### C. RapidAPI (2분)
1. https://rapidapi.com/ 접속
2. "Twitter API" 검색
3. 아무 Twitter API 선택 → "Subscribe to Test" (무료)
4. "X-RapidAPI-Key" 복사
5. `RAPIDAPI_KEY`에 붙여넣기

#### D. Upstash Redis (2분)
1. https://upstash.com/ 접속
2. "Create Database" → Redis
3. Name: "find-x-friends"
4. REST API 섹션에서:
   - URL 복사 → `UPSTASH_REDIS_REST_URL`
   - Token 복사 → `UPSTASH_REDIS_REST_TOKEN`

### 4단계: 앱 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 5단계: 테스트

1. **브라우저에서 열기**
   - http://localhost:3000

2. **Twitter 로그인**
   - "Sign in with Twitter" 클릭
   - Twitter 인증 화면에서 "Authorize app"

3. **친구 찾기**
   - "Find My X Friends" 클릭
   - 결과 확인!

## ✅ 성공 기준

### 최소 동작
- [ ] 페이지 로드됨
- [ ] "Sign in with Twitter" 버튼 보임
- [ ] 클릭 시 Twitter 로그인 화면으로 이동

### 완전 성공
- [ ] Twitter 로그인 완료
- [ ] 내 트위터 핸들 표시됨 (헤더 우측 상단)
- [ ] "Find My X Friends" 버튼 클릭
- [ ] 매칭 결과 표시

## 🐛 문제 해결

### "Sign in failed"
```bash
# 확인 사항:
1. TWITTER_CLIENT_ID와 SECRET이 정확한지 확인
2. Twitter Developer Portal에서 OAuth 2.0 활성화 확인
3. Callback URL이 정확히 http://localhost:3000/api/auth/callback/twitter 인지 확인
```

### "Invalid API key"
```bash
# .env.local 파일 확인:
1. 모든 키가 올바르게 입력되었는지
2. 따옴표 없이 입력했는지 (예: NEYNAR_API_KEY=abc123)
3. 공백이 없는지 확인
```

### 서버가 안 뜨는 경우
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📝 다음 단계

로컬 테스트 성공 후:

### 1. Vercel 배포
```bash
npm i -g vercel
vercel
```

### 2. Twitter OAuth 프로덕션 설정
- Twitter Developer Portal 재방문
- Callback URL 추가: `https://your-app.vercel.app/api/auth/callback/twitter`

### 3. Vercel 환경 변수 설정
- Vercel Dashboard → Settings → Environment Variables
- 모든 `.env.local` 값 입력

### 4. 재배포
```bash
vercel --prod
```

## 💡 팁

### 빠른 테스트 (API 키 없이)
첫 로그인만 테스트하고 싶다면:
1. Twitter OAuth만 설정
2. 나머지 API 키는 나중에
3. 로그인까지만 확인

### Twitter OAuth 테스트
- 개발 중에는 localhost:3000 사용
- 배포 전에 프로덕션 URL 추가

### 환경 변수 검증
```bash
# .env.local 확인
cat .env.local | grep -v '^#' | grep '='
```

## 🔐 보안 주의사항

- `.env.local`은 절대 GitHub에 올리지 마세요
- `NEXTAUTH_SECRET`은 프로덕션에서 다시 생성
- Twitter Client Secret은 절대 공개하지 마세요

## 📚 추가 문서

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 상세 배포 가이드
- [SECURITY.md](./SECURITY.md) - 보안 가이드
- [README.md](./README.md) - 전체 문서
