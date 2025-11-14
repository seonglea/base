# Find X Friends on Farcaster

A Base Mini App that helps users discover which of their X (Twitter) friends are on Farcaster.

## Features

- **Free First Query**: Your first search is completely free
- **Paid Queries**: Subsequent queries cost $1 USDC on Base
- **Smart Wallet Support**: Uses Base Smart Wallets for seamless transactions
- **Social Actions**: Follow and message your friends on Farcaster
- **Efficient Caching**: Uses Redis to cache results and reduce API costs

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

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Wallet with Base Mainnet access
- API keys (see Environment Variables)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd base
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Farcaster & MiniKit
NEXT_PUBLIC_CDP_API_KEY=your_coinbase_api_key
NEXT_PUBLIC_PROJECT_NAME="Find X Friends"
NEXT_PUBLIC_URL=http://localhost:3000

# Neynar API
NEYNAR_API_KEY=your_neynar_api_key

# RapidAPI (Twitter)
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=twitter-api45.p.rapidapi.com

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Smart Contract (after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_AMOUNT=1000000
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Chain
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

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

## API Keys Setup

### 1. Coinbase Developer Platform (CDP)
- Go to [Coinbase Cloud](https://cloud.coinbase.com/)
- Create a new project
- Get your API key
- Add to `NEXT_PUBLIC_CDP_API_KEY`

### 2. Neynar API
- Go to [Neynar](https://neynar.com/)
- Sign up and create an API key
- Add to `NEYNAR_API_KEY`

### 3. RapidAPI (Twitter/X)
- Go to [RapidAPI](https://rapidapi.com/)
- Subscribe to a Twitter API (e.g., "Twitter API v2")
- Get your API key and host
- Add to `RAPIDAPI_KEY` and `RAPIDAPI_HOST`

### 4. Upstash Redis
- Go to [Upstash](https://upstash.com/)
- Create a Redis database
- Get REST URL and token
- Add to environment variables

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
