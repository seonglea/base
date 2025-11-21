# 로고 업로드 및 설정 가이드

## 📁 로고 파일 업로드 위치

로고 파일들을 다음 위치에 업로드하세요:

```
public/
├── logo.png          # 메인 로고 (권장: 512x512px 이상, PNG 투명 배경)
├── logo-icon.png     # 아이콘 형태 (권장: 192x192px, 정사각형)
├── favicon.ico       # 브라우저 탭 아이콘 (32x32px)
├── apple-touch-icon.png  # iOS 홈화면 아이콘 (180x180px)
└── og-image.png      # 소셜 미디어 공유 이미지 (1200x630px)
```

## 🎨 권장 로고 사양

### 1. 메인 로고 (logo.png)
- **크기**: 512x512px 이상 (정사각형 또는 가로형)
- **형식**: PNG (투명 배경 권장)
- **용도**: 헤더, 메인 페이지
- **최대 파일 크기**: 500KB 이하

### 2. 아이콘 로고 (logo-icon.png)
- **크기**: 192x192px (정사각형)
- **형식**: PNG (투명 배경)
- **용도**: PWA 아이콘, 작은 화면
- **최대 파일 크기**: 100KB 이하

### 3. Favicon (favicon.ico)
- **크기**: 32x32px
- **형식**: ICO 또는 PNG
- **용도**: 브라우저 탭 아이콘
- **변환 도구**: https://favicon.io/

### 4. Apple Touch Icon (apple-touch-icon.png)
- **크기**: 180x180px
- **형식**: PNG
- **용도**: iOS 홈 화면에 추가할 때
- **참고**: 모서리가 자동으로 둥글게 처리됨

### 5. Open Graph 이미지 (og-image.png)
- **크기**: 1200x630px (가로형)
- **형식**: PNG 또는 JPG
- **용도**: Twitter, Facebook 등 소셜 미디어 공유
- **텍스트 포함 권장**: "Find X Friends on Farcaster" 등

## 📤 업로드 방법

### 방법 1: 파일 직접 복사
```bash
# 로컬에서 프로젝트 폴더의 public/ 디렉토리에 파일 복사
cp /path/to/your/logo.png ./public/logo.png
```

### 방법 2: 드래그 앤 드롭
- VS Code나 편집기에서 `public/` 폴더에 파일을 드래그 앤 드롭

## 🔧 설정 파일 수정 (자동 적용됨)

로고 파일을 업로드하면 다음 파일들이 자동으로 로고를 사용합니다:

### 1. app/layout.tsx (메타데이터)
```typescript
export const metadata: Metadata = {
  title: 'Find X Friends on Farcaster',
  description: 'Find your X (Twitter) friends on Farcaster',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    images: ['/og-image.png'],
  },
};
```

### 2. app/page.tsx (메인 페이지 로고)
```typescript
<Image
  src="/logo.png"
  alt="Find X Friends Logo"
  width={120}
  height={120}
  className="mx-auto mb-6"
/>
```

## 🚀 빠른 시작

만약 로고 파일이 준비되었다면:

1. **로고 파일을 제공해주세요** (업로드하거나 경로를 알려주세요)
2. 제가 `public/` 폴더에 파일을 추가하고
3. 앱 코드에 로고를 자동으로 통합하겠습니다

## 💡 디자인 팁

### Base 체인 브랜딩
- Base 공식 컬러: 파란색 (#0052FF)
- Farcaster 컬러: 보라색 (#855DCD)
- 두 색상을 조합한 그라디언트 추천

### 아이콘 디자인
- 심플하고 인식하기 쉬운 디자인
- X(Twitter) + Farcaster 아이콘 조합
- 32x32px에서도 명확하게 보여야 함

### 텍스트 로고
- 폰트: 굵고 현대적인 산세리프
- 가독성 최우선
- 모바일에서도 선명하게

## 📋 체크리스트

로고 준비 완료 확인:

- [ ] 메인 로고 PNG (투명 배경)
- [ ] 아이콘 버전 (정사각형)
- [ ] Favicon 생성
- [ ] Apple Touch Icon
- [ ] OG 이미지 (소셜 미디어용)
- [ ] 다양한 크기에서 테스트
- [ ] 밝은 배경/어두운 배경 모두 확인

## 🎬 다음 단계

로고 파일이 준비되면 알려주세요! 제가:
1. ✅ Public 폴더에 파일 추가
2. ✅ Layout 메타데이터 설정
3. ✅ 메인 페이지에 로고 통합
4. ✅ PWA manifest 설정
5. ✅ 다크모드 대응 (필요시)

를 자동으로 처리해드리겠습니다!
