# Required Assets for Base Mini App

## Image Assets (must be placed in `/public/`)

| File | Size | Format | Description |
|------|------|--------|-------------|
| `icon.png` | 1024x1024 | PNG | App icon (no transparent background) |
| `splash.png` | 200x200 | PNG | Loading splash screen image |
| `hero.png` | 1200x630 | PNG/JPG | Hero image for app page (1.91:1 ratio) |
| `og-image.png` | 1200x630 | PNG/JPG | Open Graph image for social sharing |
| `screenshot-1.png` | 1284x2778 | PNG | App screenshot (portrait) |
| `screenshot-2.png` | 1284x2778 | PNG | App screenshot (portrait) |
| `favicon.ico` | 32x32 | ICO | Browser favicon |
| `apple-touch-icon.png` | 180x180 | PNG | iOS home screen icon |
| `logo-icon.png` | 192x192 | PNG | PWA manifest icon |
| `logo.png` | 512x512 | PNG | PWA manifest icon (large) |

## Asset Generator Tool

Use the official Mini App Assets Generator:
**https://www.miniappassets.com/**

## Color Theme

Current splash background color: `#6366f1` (Indigo)

## After Creating Assets

1. Place all files in `/public/` directory
2. Update URLs in `farcaster.json` manifest:
   - Replace `https://your-app-url.vercel.app` with your actual domain
3. Deploy to Vercel
4. Sign manifest at https://www.base.dev/preview

## Manifest Signing Steps

1. Deploy app to Vercel
2. Go to https://www.base.dev/preview?tab=account
3. Enter your app URL
4. Click "Verify" and sign with wallet
5. Copy `accountAssociation` values to `farcaster.json`
6. Add your wallet address to `baseBuilder.ownerAddress`
7. Redeploy

## Testing

After deployment:
1. Preview at https://www.base.dev/preview
2. Check "Account association" tab
3. Check "Metadata" tab for missing fields
4. Remove `"noindex": true` when ready for production
