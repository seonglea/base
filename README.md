# Find X Friends on Farcaster

A Base Mini App that helps users discover which of their X (Twitter) friends are on Farcaster.

## 🚀 빠른 시작

**로컬에서 테스트하고 싶으시다면:**
- 👉 [QUICK_START.md](./QUICK_START.md) - 5분 만에 시작
- 📖 [LOCAL_SETUP.md](./LOCAL_SETUP.md) - 상세한 설정 가이드

## ✨ Features

- **🆓 무료 모드**: 테스트를 위한 완전 무료 모드 (결제 없음, 지갑 연결 불필요)
- **💰 유료 모드**: 환경 변수 하나로 쉽게 전환 (첫 쿼리 무료, 이후 $1 USDC)
- **🔐 Twitter OAuth**: 안전한 소셜 로그인으로 본인 친구 목록만 조회
- **⚡ Smart Wallet Support**: Base Smart Wallets로 원활한 트랜잭션
- **💬 Social Actions**: Farcaster에서 친구 팔로우 및 메시지 기능
- **📦 Efficient Caching**: Redis를 사용한 API 비용 최적화

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **SDK**: OnchainKit & MiniKit
- **UI**: Tailwind CSS
- **State Management**: React Query

### Blockchain (Base)
- **Network**: Base Mainnet
- **Smart Contract**: Solidity (payment processing)
- **Token**: USDC on Base
- **Wallet**: Base Smart Wallet support

### Backend
- **Database**: Upstash Redis
- **APIs**:
  - Neynar API (Farcaster data)
  - RapidAPI (X/Twitter data)

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── payment/check/          # Check payment status
│   │   ├── twitter/following/      # Fetch X following list
│   │   ├── farcaster/match/        # Match with Farcaster users
│   │   └── farcaster/follow/       # Follow users on Farcaster
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Main page
│   ├── providers.tsx               # OnchainKit providers
│   └── globals.css                 # Global styles
├── components/
│   ├── PaymentGate.tsx             # Payment component
│   ├── FriendsList.tsx             # Results display
│   ├── FollowButton.tsx            # Follow action
│   └── MessageButton.tsx           # DM action
├── contracts/
│   └── XFriendsFinder.sol          # Smart contract
├── lib/
│   ├── contract.ts                 # Contract utilities
│   ├── neynar.ts                   # Neynar API client
│   ├── rapidapi.ts                 # RapidAPI client
│   └── redis.ts                    # Redis utilities
└── public/
    └── .well-known/
        └── farcaster.json          # Farcaster manifest
```

## 🎯 Getting Started

### 로컬 테스트 (무료 모드)

**상세 가이드**: [QUICK_START.md](./QUICK_START.md) 또는 [LOCAL_SETUP.md](./LOCAL_SETUP.md)

1. **프로젝트 클론**
```bash
git clone https://github.com/YOUR_USERNAME/base.git
cd base
npm install
```

2. **환경 변수 설정** (`.env.local` 파일 생성)
```env
# 무료 모드 활성화
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=랜덤_문자열_여기에

# Twitter OAuth (필수!)
TWITTER_CLIENT_ID=발급받은_클라이언트_ID
TWITTER_CLIENT_SECRET=발급받은_클라이언트_시크릿

# API Keys (필수)
NEYNAR_API_KEY=발급받은_키
RAPIDAPI_KEY=발급받은_키
RAPIDAPI_HOST=twitter241.p.rapidapi.com
UPSTASH_REDIS_REST_URL=발급받은_URL
UPSTASH_REDIS_REST_TOKEN=발급받은_토큰
```

3. **실행**
```bash
npm run dev
```

4. **브라우저에서 http://localhost:3000 열기**

### 유료 모드로 전환 (배포 시)

`.env.local`에서 한 줄만 변경:
```env
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```

그리고 다음 추가:
```env
NEXT_PUBLIC_CDP_API_KEY=your_coinbase_api_key
NEXT_PUBLIC_CONTRACT_ADDRESS=배포된_컨트랙트_주소
```

자세한 내용: [MODES.md](./MODES.md)

## Smart Contract Deployment

### Using Remix IDE

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file: `XFriendsFinder.sol`
3. Copy the contract code from `contracts/XFriendsFinder.sol`
4. Compile with Solidity 0.8.20+
5. Deploy to Base Mainnet:
   - Network: Base Mainnet (Chain ID: 8453)
   - Constructor parameter: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC on Base)
6. Verify on [Basescan](https://basescan.org/)
7. Copy the deployed contract address to `NEXT_PUBLIC_CONTRACT_ADDRESS`

### Using Hardhat (Alternative)

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Deploy script
npx hardhat run scripts/deploy.js --network base
```

## 🔑 API Keys Setup

### 1. Twitter OAuth (필수! - 가장 먼저 설정)
**이 설정이 없으면 로그인이 안 됩니다!**

1. https://developer.twitter.com/en/portal/dashboard 방문
2. "Create Project" → "Create App" 클릭
3. **User authentication settings** 설정:
   - App permissions: **Read**
   - Type of App: **Web App**
   - Callback URL: `http://localhost:3000/api/auth/callback/twitter`
   - Website URL: `http://localhost:3000`
4. Client ID와 Client Secret 복사
5. `.env.local`에 추가:
   ```env
   TWITTER_CLIENT_ID=발급받은_클라이언트_ID
   TWITTER_CLIENT_SECRET=발급받은_클라이언트_시크릿
   ```

### 2. Neynar API (Farcaster 데이터)
- Go to [Neynar](https://neynar.com/)
- Sign up and create an API key
- Add to `NEYNAR_API_KEY`

### 3. RapidAPI (Twitter/X)
- Go to [RapidAPI](https://rapidapi.com/)
- Subscribe to a Twitter API (e.g., "Twitter API v2")
- Get your API key and host
- Add to `RAPIDAPI_KEY` and `RAPIDAPI_HOST`

### 4. Upstash Redis (캐싱)
- Go to [Upstash](https://upstash.com/)
- Create a Redis database (Regional)
- Get REST URL and token
- Add to environment variables:
  ```env
  UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
  UPSTASH_REDIS_REST_TOKEN=발급받은_토큰
  ```

### 5. Coinbase Developer Platform (유료 모드에서만 필요)
- Go to [Coinbase Cloud](https://cloud.coinbase.com/)
- Create a new project
- Get your API key
- Add to `NEXT_PUBLIC_CDP_API_KEY`

📚 **자세한 API 설정 가이드**: [LOCAL_SETUP.md](./LOCAL_SETUP.md)

## Deployment to Vercel

1. Push your code to GitHub

2. Import to Vercel:
```bash
npm i -g vercel
vercel
```

3. Set environment variables in Vercel dashboard

4. Deploy:
```bash
vercel --prod
```

5. Update Farcaster manifest:
   - Edit `public/.well-known/farcaster.json`
   - Replace URLs with your Vercel deployment URL
   - Add manifest signing (see Farcaster docs)

## How It Works

1. **User connects wallet** using Base Smart Wallet
2. **Enters X username** to search
3. **Payment gate**:
   - First query: Free (calls `freeQuery()`)
   - Subsequent: $1 USDC (calls `approve()` + `payAndQuery()`)
4. **Fetch X data** via RapidAPI (cached in Redis)
5. **Match with Farcaster** using Neynar API
6. **Display results** with follow/message actions

## Smart Contract Functions

```solidity
// Check if user needs to pay
function canQuery(address user) returns (bool needsPayment, uint256 queryCount)

// Free query (first time only)
function freeQuery() returns (uint256 queryNumber)

// Paid query (subsequent queries)
function payAndQuery() returns (uint256 queryNumber)
```

## API Routes

- `GET /api/payment/check?address=0x...` - Check payment status
- `POST /api/twitter/following` - Fetch X following list
- `POST /api/farcaster/match` - Match with Farcaster users
- `POST /api/farcaster/follow` - Follow a user

## Development Tips

### Testing Payment Flow

Use Base Sepolia testnet for testing:
1. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Deploy contract to Sepolia
3. Update `NEXT_PUBLIC_CHAIN_ID=84532`

### Debugging

```bash
# Check Redis cache
redis-cli -u $UPSTASH_REDIS_REST_URL

# Monitor API calls
# Check Vercel logs or use console.log in API routes
```

## Security Considerations

- Smart contract is non-upgradeable
- Payment validation on-chain and server-side
- API keys stored in environment variables
- Rate limiting on Neynar API calls
- Input validation on all user inputs

## Cost Breakdown

- **First query**: FREE
- **Subsequent queries**: $1 USDC per query
- **Gas fees**: Covered by Paymaster (optional)
- **API costs**: Cached in Redis to minimize

## Troubleshooting

### "Payment verification failed"
- Ensure you have USDC on Base
- Check contract address is correct
- Verify transaction was successful

### "Failed to fetch Twitter data"
- Check RapidAPI key and credits
- Verify username is correct
- Check API rate limits

### "No matches found"
- X friends may not be on Farcaster
- Neynar API might not have indexed users
- Try different matching logic

## Resources

- [OnchainKit Documentation](https://onchainkit.xyz/)
- [Base Documentation](https://docs.base.org/)
- [Neynar API Docs](https://docs.neynar.com/)
- [MiniKit Guide](https://docs.base.org/base-app/build-with-minikit/overview)

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

For issues and questions:
- Open a GitHub issue
- Check documentation links above
