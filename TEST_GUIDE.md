# 테스트 가이드

## 🧪 현재 설정: 무료 모드

`NEXT_PUBLIC_ENABLE_PAYMENTS=false`로 설정되어 있어 지갑 연결 없이 Twitter 로그인만으로 테스트 가능합니다.

## 📝 테스트 전 체크리스트

### 1단계: 환경 변수 설정 (필수)

`.env.local` 파일을 열고 아래 값들을 채워주세요:

#### ✅ 최우선 (Twitter 로그인 테스트)
```bash
TWITTER_CLIENT_ID=여기에입력
TWITTER_CLIENT_SECRET=여기에입력
```

**발급 방법:**
1. https://developer.twitter.com/en/portal/dashboard
2. Create Project → Create App
3. App Settings → User authentication settings → Set up
4. OAuth 2.0 활성화
5. Callback URL: `http://localhost:3000/api/auth/callback/twitter`
6. Client ID와 Secret 복사

#### ⚠️ 나머지 API 키 (전체 기능 테스트)
- `NEYNAR_API_KEY` - Farcaster 데이터
- `RAPIDAPI_KEY` - Twitter following 데이터
- `UPSTASH_REDIS_REST_URL` + `TOKEN` - 캐싱

### 2단계: 의존성 설치

```bash
cd /home/user/base
npm install
```

### 3단계: 개발 서버 실행

```bash
npm run dev
```

## 🎯 테스트 시나리오

### 레벨 1: UI 테스트 (API 키 없이)
```bash
npm run dev
# http://localhost:3000 접속
```

**확인 사항:**
- [ ] 페이지 로드
- [ ] "Sign in with Twitter" 버튼 보임
- [ ] 디자인 정상
- [ ] 콘솔 에러 없음

### 레벨 2: Twitter 로그인 테스트
**필요:** `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`

1. "Sign in with Twitter" 클릭
2. Twitter 인증 화면 이동
3. "Authorize app" 클릭
4. 다시 앱으로 리다이렉트
5. 헤더에 "@username" 표시

### 레벨 3: 전체 플로우 테스트
**필요:** 모든 API 키

1. Twitter 로그인 완료
2. "Find My X Friends (FREE)" 버튼 클릭
3. 로딩 화면
4. 매칭 결과 표시

## 🔍 단계별 테스트 명령어

### 빠른 체크
```bash
# 환경 변수 확인
cat .env.local | grep -v '^#' | grep '='

# 포트 확인
lsof -i :3000 || echo "Port 3000 is free"

# 빌드 테스트
npm run build
```

### API 라우트 직접 테스트
```bash
# 개발 서버 실행 후 다른 터미널에서

# Health check
curl http://localhost:3000/

# Twitter OAuth callback 확인
curl http://localhost:3000/api/auth/providers
```

## ❌ 예상되는 문제들

### 1. "npm install" 실패
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 2. "Port 3000 already in use"
```bash
# 3001 포트로 실행
PORT=3001 npm run dev
```

### 3. "Module not found" 에러
```bash
npm install
# TypeScript 에러면
npm install --save-dev @types/node @types/react
```

### 4. "NEXTAUTH_URL mismatch"
```bash
# .env.local 확인
NEXTAUTH_URL=http://localhost:3000
# 정확히 일치해야 함
```

## 💡 부분 테스트 (API 키 없이)

### Twitter OAuth만 테스트하고 싶다면:
```env
# 이것만 설정
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...
NEXTAUTH_SECRET=임시비밀키32자이상

# 나머지는 비워둠 (에러 나도 로그인은 됨)
```

### UI만 보고 싶다면:
```bash
# 모든 API 키 없이 실행
npm run dev
# localhost:3000 접속
# UI 구조 확인 가능
```

## 🎨 화면별 체크포인트

### 1. 시작 화면
- [x] "Find X Friends on Farcaster" 제목
- [x] 🔍 아이콘
- [x] "Sign in with Twitter" 버튼 (파란색)
- [x] "🎉 Completely FREE!" 배지 (초록색)

### 2. 로그인 후
- [x] 헤더 우측에 "@username" 표시
- [x] "Sign Out" 버튼
- [x] "Find My X Friends (FREE)" 버튼

### 3. 로딩 화면
- [x] 스피너 애니메이션
- [x] "Finding Your Friends..." 메시지

### 4. 결과 화면
- [x] 매칭된 친구 수 표시
- [x] 친구 카드 (프로필 사진, 이름, 팔로워 수)
- [x] "Follow" 버튼
- [x] "Message" 버튼

## 📊 성공 기준

### 최소 성공 (Twitter OAuth)
- ✅ Twitter 로그인 완료
- ✅ 사용자 이름 표시
- ✅ 로그아웃 가능

### 완전 성공 (전체 기능)
- ✅ 위 항목 +
- ✅ X following 데이터 가져오기
- ✅ Farcaster 매칭 결과 표시
- ✅ Follow/Message 버튼 작동

## 🚀 시작하기

```bash
# 1. 환경 변수 설정
code .env.local  # 또는 nano .env.local

# 2. 최소한 Twitter OAuth 키 입력
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...

# 3. 의존성 설치
npm install

# 4. 실행!
npm run dev

# 5. 브라우저
# http://localhost:3000
```

## 📞 문제 발생 시

1. 터미널 에러 메시지 확인
2. 브라우저 Console (F12) 확인
3. `.env.local` 파일 재확인
4. 서버 재시작 (Ctrl+C → npm run dev)

## 다음 단계

테스트 성공 후:
1. Vercel 배포
2. 프로덕션 환경 변수 설정
3. Twitter OAuth 프로덕션 callback URL 추가
4. 공개! 🎉
