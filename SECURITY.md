# Security Guide

## API 키 보안 설명

### ✅ 절대 노출되지 않는 API 키들

다음 API 키들은 **서버 측에서만** 사용되며, 클라이언트에 절대 노출되지 않습니다:

```env
# 서버 전용 - 클라이언트 접근 불가
NEYNAR_API_KEY=...
RAPIDAPI_KEY=...
RAPIDAPI_HOST=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

**왜 안전한가?**
1. Next.js API 라우트(`app/api/*`)는 서버에서만 실행됩니다
2. 환경 변수가 `NEXT_PUBLIC_` 없이 정의되어 클라이언트 번들에 포함되지 않습니다
3. 브라우저 개발자 도구에서 절대 볼 수 없습니다

### 🌐 의도적으로 노출되는 것들

```env
# NEXT_PUBLIC_ = 클라이언트 접근 가능
NEXT_PUBLIC_CDP_API_KEY=...
NEXT_PUBLIC_CONTRACT_ADDRESS=...
NEXT_PUBLIC_USDC_ADDRESS=...
NEXT_PUBLIC_CHAIN_ID=8453
```

**노출되어도 안전한 이유:**
- **CDP API 키**: 도메인 제한 설정 가능 (Coinbase 대시보드)
- **컨트랙트 주소**: 퍼블릭 블록체인 정보 (누구나 볼 수 있음)
- **USDC 주소**: 퍼블릭 토큰 주소
- **Chain ID**: 공개 정보

## 보안 아키텍처

### 데이터 플로우

```
클라이언트 (브라우저)
    ↓ fetch('/api/twitter/following')

서버 API 라우트
    ├─ 요청 검증
    ├─ Rate limiting 체크
    ├─ 결제 검증 (온체인)
    ↓

외부 API 호출 (서버에서만)
    ├─ RapidAPI (RAPIDAPI_KEY 사용)
    ├─ Neynar API (NEYNAR_API_KEY 사용)
    └─ Redis (REDIS_TOKEN 사용)
    ↓

서버 API 라우트
    ├─ 데이터 가공
    └─ 민감 정보 제거
    ↓

클라이언트 (브라우저)
    └─ 안전한 응답만 받음
```

## 구현된 보안 기능

### 1. Rate Limiting
```typescript
// lib/security.ts
export function rateLimiter(identifier: string): boolean {
  // 사용자당 1분에 10회 제한
}
```

**적용 위치:**
- `/api/twitter/following`
- `/api/farcaster/match`
- `/api/farcaster/follow`

### 2. Origin Verification
```typescript
export function verifyOrigin(request: NextRequest): boolean {
  // 허용된 도메인에서만 요청 가능
}
```

### 3. Input Sanitization
```typescript
// 악성 입력 차단
const sanitizedUsername = twitterUsername
  .replace(/[^a-zA-Z0-9_]/g, '')
  .substring(0, 15);
```

### 4. Payment Verification (On-chain)
```typescript
// 블록체인에서 직접 검증
const isPaymentValid = await verifyPayment(address, txHash);
```

## 추가 보안 강화 방법

### Vercel에서 환경 변수 보호

1. **Vercel Dashboard**에서만 설정
2. `.env.local`은 절대 git에 커밋하지 않기
3. 환경 변수 암호화 활성화

```bash
# .gitignore에 포함되어 있음
.env
.env.local
.env*.local
```

### CDP API 키 도메인 제한

1. Coinbase Cloud 대시보드 접속
2. API Settings → Allowed Domains
3. 프로덕션 도메인만 추가:
   ```
   https://your-app.vercel.app
   https://farcaster.xyz
   ```

### Redis 접근 제한

Upstash 대시보드에서:
1. IP 화이트리스트 설정
2. TLS/SSL 활성화
3. 정기적인 키 로테이션

### API 키 로테이션 일정

| API | 로테이션 주기 | 우선순위 |
|-----|------------|---------|
| RapidAPI | 1개월 | 높음 |
| Neynar | 3개월 | 중간 |
| Redis Token | 3개월 | 중간 |
| CDP API Key | 6개월 | 낮음 |

## 보안 체크리스트

배포 전 확인사항:

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있음
- [ ] Vercel에 모든 환경 변수 설정됨
- [ ] CDP API 키에 도메인 제한 설정됨
- [ ] Rate limiting 테스트 완료
- [ ] Payment verification 테스트 완료
- [ ] CORS 설정 확인
- [ ] API 응답에 민감 정보 없음
- [ ] 에러 메시지에 내부 정보 노출 안 됨

## 취약점 발견 시

보안 취약점을 발견하면:
1. **공개하지 말고** private로 이슈 생성
2. security@your-domain.com으로 이메일
3. 24-48시간 내 응답

## 모니터링

### Vercel 로그 확인
```bash
vercel logs --follow
```

### 의심스러운 활동 감지
- 비정상적으로 많은 API 호출
- 실패한 결제 시도 증가
- 알 수 없는 IP에서의 접근

### 알림 설정

Vercel에서:
1. Settings → Notifications
2. Error rate threshold 설정
3. Slack/Discord 웹훅 연결

## 긴급 대응

### API 키 유출 의심 시

1. **즉시 키 비활성화**
   ```bash
   # Vercel
   vercel env rm RAPIDAPI_KEY

   # RapidAPI 대시보드에서 키 삭제
   ```

2. **새 키 발급**
3. **로그 분석**
4. **영향받은 사용자 확인**

### 스마트 컨트랙트 문제 발견 시

1. Owner로 긴급 출금:
   ```solidity
   function withdraw() external onlyOwner
   ```

2. 새 컨트랙트 배포
3. 사용자 공지

## 베스트 프랙티스

### 개발 시
```bash
# 로컬 개발용 별도 API 키 사용
cp .env.example .env.local

# 프로덕션 키와 다른 테스트 키 사용
RAPIDAPI_KEY=test_key_never_use_in_production
```

### 프로덕션
```bash
# Vercel에서만 실제 키 설정
vercel env add RAPIDAPI_KEY production
```

### Git 커밋 전
```bash
# 환경 변수 파일 체크
git status | grep .env

# .env 파일이 staged되어 있으면 안됨!
```

## 참고 자료

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Security Best Practices](https://vercel.com/docs/security/security-best-practices)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

## 요약

**핵심 원칙:**
1. 서버 측 API 키는 `NEXT_PUBLIC_` 없이 정의
2. 클라이언트는 API 라우트를 통해서만 데이터 접근
3. Rate limiting으로 남용 방지
4. 온체인 검증으로 결제 보장
5. 정기적인 키 로테이션

**결론:** 현재 구현은 이미 안전합니다. API 키는 서버에서만 사용되며, 클라이언트에 절대 노출되지 않습니다.
