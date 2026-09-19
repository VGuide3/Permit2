# Custom smart contract tab

The Custom Contract view uses the same Wagmi v2 + RainbowKit provider as the Permit2 tab. The address and ABI shipped here are placeholders.

## 1. Set the address

In `.env.local`:

```bash
VITE_CUSTOM_CONTRACT_ADDRESS=0xYourDeployedContract
VITE_CUSTOM_CONTRACT_CHAIN_ID=1
```

Or edit `src/config/customContract.ts`.

## 2. Replace the ABI

Paste the verified ABI from Etherscan (or your compiler output) into `CUSTOM_CONTRACT_ABI` in `src/config/customContract.ts`.

The stub ABI exposes:

```solidity
function transferTokens(address token, address to, uint256 amount) external
```

The form calls that function. If your contract uses different names or arguments, update both the ABI and `src/components/CustomContractDapp.tsx`.

## 3. Run the app

```bash
npm install
npm run dev
```

Connect a wallet, switch to the contract's chain if prompted, then submit.

Until a valid `VITE_CUSTOM_CONTRACT_ADDRESS` is set, the Execute button stays disabled so you cannot send a transaction to a fake address.
