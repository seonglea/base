# Deployment Guide

Complete step-by-step guide to deploy Find X Friends on Farcaster.

## Pre-Deployment Checklist

- [ ] All API keys obtained
- [ ] Smart contract deployed to Base Mainnet
- [ ] Environment variables configured
- [ ] Redis database created
- [ ] Domain/hosting ready (Vercel recommended)

## Step 1: Deploy Smart Contract

### Option A: Using Remix IDE (Recommended for beginners)

1. **Open Remix IDE**
   - Go to https://remix.ethereum.org/

2. **Create Contract File**
   - Create new file: `XFriendsFinder.sol`
   - Copy content from `contracts/XFriendsFinder.sol`

3. **Compile Contract**
   - Click "Solidity Compiler" tab
   - Select compiler version: 0.8.20 or higher
   - Click "Compile XFriendsFinder.sol"

4. **Deploy to Base Mainnet**
   - Click "Deploy & Run Transactions" tab
   - Environment: "Injected Provider - MetaMask"
   - Connect MetaMask to Base Mainnet
     - Network Name: Base Mainnet
     - RPC URL: https://mainnet.base.org
     - Chain ID: 8453
     - Currency: ETH
     - Block Explorer: https://basescan.org

5. **Deploy Contract**
   - Constructor parameter: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC on Base)
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - Wait for confirmation

6. **Verify Contract**
   - Go to https://basescan.org/
   - Find your contract
   - Click "Verify and Publish"
   - Select "Solidity (Single file)"
   - Paste contract code
   - Match compiler settings
   - Verify

7. **Save Contract Address**
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (your deployed address)
   ```

### Option B: Using Hardhat

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Create hardhat.config.js
# (see example below)

# Create deployment script
# (see scripts/deploy.js example below)

# Deploy
npx hardhat run scripts/deploy.js --network base

# Verify
npx hardhat verify --network base DEPLOYED_CONTRACT_ADDRESS "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
```

## Step 2: Set Up External Services

### Upstash Redis

1. Go to https://upstash.com/
2. Sign up / Log in
3. Click "Create Database"
4. Choose "Global" for best performance
5. Name: `find-x-friends`
6. Click "Create"
7. Copy credentials:
   ```
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

### Neynar API

1. Go to https://neynar.com/
2. Sign up for account
3. Dashboard → API Keys
4. Create new API key
5. Copy:
   ```
   NEYNAR_API_KEY=...
   ```

### RapidAPI (Twitter)

1. Go to https://rapidapi.com/
2. Sign up / Log in
3. Search for "Twitter API"
4. Choose a service (e.g., "Twitter API v2")
5. Subscribe to a plan
6. Copy credentials:
   ```
   RAPIDAPI_KEY=...
   RAPIDAPI_HOST=...
   ```

### Coinbase Developer Platform

1. Go to https://cloud.coinbase.com/
2. Sign up / Log in
3. Create new project
4. Copy API key:
   ```
   NEXT_PUBLIC_CDP_API_KEY=...
   ```

## Step 3: Configure Environment Variables

Create `.env.local` (for local) or add to Vercel (for production):

```env
# Farcaster & MiniKit
NEXT_PUBLIC_CDP_API_KEY=your_coinbase_api_key
NEXT_PUBLIC_PROJECT_NAME="Find X Friends"
NEXT_PUBLIC_URL=https://your-app.vercel.app

# Neynar API
NEYNAR_API_KEY=your_neynar_api_key

# RapidAPI (Twitter)
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=twitter241.p.rapidapi.com

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Smart Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_your_deployed_contract
NEXT_PUBLIC_PAYMENT_AMOUNT=1000000
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Chain
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
```

## Step 4: Deploy to Vercel

### Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # First deployment
   vercel

   # Production deployment
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add all variables from `.env.example`

### Using Vercel Dashboard

1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import from GitHub
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `next build`
   - Output Directory: `.next`
5. Add Environment Variables
6. Click "Deploy"

## Step 5: Configure Farcaster Manifest

1. **Update manifest file**
   Edit `public/.well-known/farcaster.json`:
   ```json
   {
     "accountAssociation": {
       "header": "...",
       "payload": "...",
       "signature": "..."
     },
     "frame": {
       "version": "next",
       "name": "Find X Friends",
       "iconUrl": "https://your-app.vercel.app/icon.png",
       "homeUrl": "https://your-app.vercel.app",
       "splashImageUrl": "https://your-app.vercel.app/splash.png"
     }
   }
   ```

2. **Sign the manifest**
   - Follow [Farcaster Manifest Signing Guide](https://docs.farcaster.xyz/developers/guides/accounts/create-account-key)
   - Use your Farcaster account private key
   - Generate header, payload, and signature

3. **Redeploy**
   ```bash
   vercel --prod
   ```

## Step 6: Test Deployment

1. **Test wallet connection**
   - Visit your deployed URL
   - Click "Connect Wallet"
   - Ensure Base Smart Wallet connects

2. **Test free query**
   - Enter a Twitter username
   - Complete free query
   - Verify transaction on Basescan

3. **Test paid query**
   - Try second query
   - Verify USDC payment
   - Check results display

4. **Test social actions**
   - Click "Follow" button
   - Click "Message" button
   - Verify Farcaster intents work

## Step 7: Submit to Base App

1. Go to https://base.org/
2. Submit your Mini App
3. Provide:
   - App URL
   - Manifest URL
   - Description
   - Screenshots

## Post-Deployment

### Monitor Usage

```bash
# Check Vercel logs
vercel logs

# Check Redis
# Use Upstash dashboard

# Check contract
# View on Basescan
```

### Update Contract

If you need to update:
1. Deploy new contract
2. Update `NEXT_PUBLIC_CONTRACT_ADDRESS`
3. Redeploy frontend

### Troubleshooting

**Build fails:**
- Check all environment variables are set
- Ensure dependencies are installed
- Review build logs

**Transactions fail:**
- Verify contract address
- Check user has USDC
- Ensure correct network (Base Mainnet)

**API errors:**
- Verify API keys
- Check rate limits
- Review API documentation

## Security Best Practices

1. **Never commit `.env.local`**
   - Listed in `.gitignore`
   - Use Vercel environment variables

2. **Rotate API keys regularly**

3. **Monitor contract for suspicious activity**

4. **Set up alerts**
   - Vercel deployment alerts
   - Upstash usage alerts
   - Contract event monitoring

## Cost Estimates

### Initial Setup
- Domain (optional): ~$10/year
- Smart contract deployment: ~$5-20 in ETH (gas)

### Ongoing
- Vercel: Free tier (upgrade if needed)
- Upstash Redis: Free tier → $10/month
- Neynar API: Free tier → $29/month
- RapidAPI: Varies by service

### Revenue
- Each paid query: $1 USDC
- Contract owner receives payments

## Support

Need help?
- GitHub Issues
- Base Discord
- Farcaster Help Channel

## Checklist

Deployment complete when:
- [ ] Smart contract deployed and verified
- [ ] All environment variables set
- [ ] App deployed to Vercel
- [ ] Manifest configured
- [ ] Free query tested
- [ ] Paid query tested
- [ ] Social actions working
- [ ] Submitted to Base App directory

Congratulations! Your app is live! 🎉
