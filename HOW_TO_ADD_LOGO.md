# 로고 추가 방법

## 🚀 빠른 가이드

로고를 만들었다면 다음 단계를 따르세요:

### 1단계: 로고 파일 준비

필요한 로고 파일들:

- **logo.png** - 메인 로고 (512x512px 이상, PNG 투명 배경 권장)
- **logo-icon.png** - 앱 아이콘 (192x192px, 정사각형)
- **favicon.ico** - 브라우저 탭 아이콘 (32x32px)
- **apple-touch-icon.png** - iOS 홈화면 (180x180px)
- **og-image.png** - 소셜 미디어 공유 (1200x630px)

### 2단계: 파일을 public/ 폴더에 복사

```bash
# 프로젝트 루트에서 실행
cp /path/to/your/logo.png ./public/logo.png
cp /path/to/your/logo-icon.png ./public/logo-icon.png
cp /path/to/your/favicon.ico ./public/favicon.ico
cp /path/to/your/apple-touch-icon.png ./public/apple-touch-icon.png
cp /path/to/your/og-image.png ./public/og-image.png
```

또는 VS Code에서 `public/` 폴더에 파일을 드래그 앤 드롭하세요.

### 3단계: 개발 서버 재시작 (이미 실행 중이라면)

```bash
# Ctrl+C로 기존 서버 종료 후
npm run dev
```

### 4단계: 확인

브라우저에서 http://localhost:3000 을 열고:
- ✅ 헤더에 로고가 표시되는지 확인
- ✅ 브라우저 탭에 favicon이 표시되는지 확인

## 📁 현재 설정 상태

다음 파일들이 이미 로고를 사용하도록 설정되어 있습니다:

### ✅ app/layout.tsx
- favicon.ico (브라우저 탭 아이콘)
- apple-touch-icon.png (iOS 홈화면)
- manifest.json (PWA 설정)
- og-image.png (Twitter, Facebook 공유 이미지)

### ✅ app/page.tsx
- logo.png (헤더 로고, 40x40px로 표시)
- 로고가 없으면 자동으로 🔍 이모지 표시

### ✅ public/manifest.json
- logo-icon.png (192x192px PWA 아이콘)
- logo.png (512x512px PWA 아이콘)

## 🎨 로고 디자인 팁

### 추천 컬러
- **Base 파란색**: #0052FF
- **Farcaster 보라색**: #855DCD
- **그라디언트**: 파란색에서 보라색으로

### 디자인 아이디어
1. **X + Farcaster 조합**: Twitter 아이콘과 Farcaster 아이콘을 연결
2. **돋보기 + 소셜**: 🔍 + 👥 컨셉
3. **브릿지 컨셉**: 두 플랫폼을 연결하는 다리

### 가독성 체크
- 32x32px에서도 명확하게 보이는지 확인
- 밝은 배경과 어두운 배경 모두에서 테스트
- 모바일 화면에서도 확인

## 🔧 로고가 없을 때

로고 파일이 없어도 앱은 정상 작동합니다:
- 헤더에 🔍 이모지가 표시됩니다
- 기본 favicon이 사용됩니다
- 나중에 언제든지 로고를 추가할 수 있습니다

## ⚡ 온라인 로고 제작 도구

로고를 직접 만들고 싶다면:

1. **Canva** - https://www.canva.com
   - 무료 템플릿 제공
   - 다양한 크기로 다운로드 가능

2. **Figma** - https://www.figma.com
   - 프로페셔널 디자인 툴
   - 무료 플랜 사용 가능

3. **Favicon Generator** - https://favicon.io
   - 텍스트나 이미지로 favicon 자동 생성
   - 모든 크기 한번에 생성

## 📝 체크리스트

- [ ] logo.png 파일을 public/ 폴더에 추가
- [ ] 개발 서버에서 헤더 로고 확인
- [ ] favicon.ico 추가 (선택사항)
- [ ] apple-touch-icon.png 추가 (선택사항)
- [ ] og-image.png 추가 (선택사항)
- [ ] 다양한 화면 크기에서 테스트
- [ ] 밝은/어두운 배경에서 확인

## 💡 다음 단계

로고 추가 후:
1. 변경사항 커밋: `git add public/ && git commit -m "Add logo files"`
2. API 키 설정 (LOGO_GUIDE.md 참고)
3. 기능 테스트
4. 배포 (Vercel)

---

**도움이 필요하시면 제게 알려주세요!**
로고 파일 경로를 알려주시면 제가 직접 추가해드릴 수 있습니다.
