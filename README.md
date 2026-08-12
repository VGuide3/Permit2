# Permit2 Gasless Dapp - Complete Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your values:
- `REACT_APP_ALCHEMY_KEY` - Get from https://www.alchemy.com/
- `REACT_APP_WALLET_CONNECT_ID` - Get from https://cloud.walletconnect.com/
- `REACT_APP_TOKEN_ADDRESS` - Your ERC20 token address
- `REACT_APP_CHAIN_ID` - Network ID (1=Mainnet, 11155111=Sepolia)

### 3. Run the App
```bash
npm start
```

## File Structure

```
.
├── permit2-wagmi-complete.tsx   # Main component with all UI & logic
├── wagmi.config.tsx             # Wagmi configuration
├── package.json                 # Dependencies
└── .env.example                 # Environment variables template
```

## Component Features

✅ **Wallet Connect Integration** - MetaMask + WalletConnect  
✅ **Transaction State Management** - Loading, success, error states  
✅ **Advanced Options** - Nonce & deadline customization  
✅ **Fully Editable CSS** - Styled with inline JSX styles  
✅ **Responsive UI** - Works on mobile & desktop  
✅ **Error Handling** - User-friendly error messages  

## Customization

### Edit Colors
Open `permit2-wagmi-complete.tsx` and modify the `style jsx` section:

```tsx
// Change primary color
background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);

// To:
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR_DARK 100%);
```

### Edit Transaction Logic
Modify the `handlePermitTransfer` function to customize:
- Permit data
- Signature handling
- Gas estimation

### Add More Networks
Update `wagmi.config.tsx`:

```tsx
import { polygon, arbitrum } from 'wagmi/chains';

const { chains, publicClient } = configureChains(
  [mainnet, sepolia, polygon, arbitrum],
  [...]
);
```

## Usage Example

```tsx
import App from './wagmi.config';

function MyApp() {
  return <App />;
}
```

## Integrate into Existing Website

Copy all 3 files to your project:

```
your-website/
├── src/
│   ├── components/
│   │   ├── permit2-wagmi-complete.tsx
│   │   └── wagmi.config.tsx
│   └── App.tsx
└── .env.local
```

Then import:

```tsx
import App from './components/wagmi.config';

export default function Page() {
  return <App />;
}
```

## Transaction Flow

1. User connects wallet (MetaMask/WalletConnect)
2. Fills form: amount, recipient, token
3. Clicks "Send Gasless"
4. Component creates permit data
5. Wagmi executes transaction
6. Shows status: loading → success/error
7. Provides etherscan link

## Environment Setup (Step by Step)

### Get Alchemy Key
1. Go to https://www.alchemy.com/
2. Sign up/Login
3. Create new app
4. Copy API key
5. Add to `.env.local`

### Get WalletConnect ID
1. Go to https://cloud.walletconnect.com/
2. Sign up/Login
3. Create new project
4. Copy Project ID
5. Add to `.env.local`

## Debugging

Enable console logs by uncommenting in `permit2-wagmi-complete.tsx`:

```tsx
console.log('Permit Data:', permitData);
console.log('Transaction:', tx);
```

## API Reference

### Component Props

```tsx
<Permit2Gasless 
  tokenAddress="0x..." // ERC20 token address (required)
  chainId={1}          // Network ID (default: 1 - mainnet)
/>
```

### State Variables (Editable)

- `recipient` - Recipient wallet address
- `amount` - Transfer amount in decimals
- `nonce` - Permit nonce (auto: 0)
- `deadline` - Unix timestamp (auto: +1 hour)

### Status States

- `idle` - Default state
- `loading` - Processing transaction
- `success` - Transaction submitted
- `error` - Transaction failed

## Testing

### Test on Sepolia Testnet
1. Set `REACT_APP_CHAIN_ID=11155111`
2. Get testnet tokens from faucet
3. Test without real funds

## Support

- Wagmi Docs: https://wagmi.sh/
- Permit2 Docs: https://permit2.uniswap.io/
- WalletConnect: https://docs.walletconnect.com/

---

**Ready to use! Edit CSS/UI as needed.** ✅
