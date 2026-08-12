# How Custom Smart Contracts Work

## Quick Setup (3 Steps)

### 1. Update customContract.config.ts
```typescript
export const CUSTOM_CONTRACT = {
  address: '0xYourContractAddress', // Your contract address
  chainId: 1,                       // Network ID
  name: 'MyContract'
};

export const CUSTOM_CONTRACT_ABI = [
  // Paste your ABI from Etherscan here
];
```

### 2. Get Contract ABI
- Go to https://etherscan.io
- Search your contract
- Copy ABI from "Contract" tab
- Paste into customContract.config.ts

### 3. Use Component
```tsx
import CustomContractDapp from './CustomContractDapp';

export default function App() {
  return <CustomContractDapp />;
}
```

## How It Works

```
Your Dapp (CustomContractDapp.tsx)
        ↓
Uses Wagmi (useContractWrite)
        ↓
Calls Your Smart Contract
        ↓
Executes Function on Blockchain
        ↓
Shows Result
```

## Function Mapping

Your contract function → Dapp form:

```solidity
// Smart Contract
function transferTokens(address token, address to, uint256 amount) external

// Becomes in Dapp
transferTokens({
  args: [tokenAddress, recipientAddress, amount]
})
```

## Multiple Functions Example

If your contract has multiple functions:

```typescript
// In customContract.config.ts
export const CUSTOM_CONTRACT_ABI = [
  {
    name: 'transferTokens',
    // ...
  },
  {
    name: 'swap',
    // ...
  },
  {
    name: 'stake',
    // ...
  }
];
```

Create separate components for each or extend CustomContractDapp to handle multiple functions.

## Edit & Deploy

Edit `CustomContractDapp.tsx` to:
- Change UI/CSS
- Modify form fields
- Add validation
- Handle custom logic

Then integrate into your website.

---

**Done! Your custom contract is now connected.** 🚀
