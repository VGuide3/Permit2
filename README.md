# Permit2 Dapp

Vite + React + TypeScript app for Uniswap Permit2 `permitTransferFrom` and a placeholder custom-contract form. Wallet UX is RainbowKit on Wagmi v2 / viem v2.

## Run

Requires Node.js 18+.

```bash
npm install
cp .env.example .env.local
# fill in at least VITE_WALLETCONNECT_PROJECT_ID for WalletConnect wallets
npm run dev
```

The dev server prints a local URL (typically `http://localhost:5173`).

```bash
npm run build    # typecheck + production build
npm run preview  # serve the production build
```

## Environment variables

Copy `.env.example` to `.env.local`. Vite only exposes variables prefixed with `VITE_`.

| Variable | Purpose |
| --- | --- |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect / Reown Cloud project ID. Injected wallets work without it. Get one at https://cloud.reown.com/ |
| `VITE_ALCHEMY_API_KEY` | Optional Alchemy key. Empty falls back to public RPC. |
| `VITE_CHAIN_ID` | Target chain for Permit2 (`1` mainnet, `11155111` Sepolia). |
| `VITE_TOKEN_ADDRESS` | Optional ERC-20 to prefill the Permit2 form. |
| `VITE_PERMIT2_ADDRESS` | Permit2 contract. Defaults to the canonical Uniswap deployment `0x000000000022D473030F116dFC393057B8271cAA`. |
| `VITE_CUSTOM_CONTRACT_ADDRESS` | Your contract for the Custom Contract tab (placeholder until set). |
| `VITE_CUSTOM_CONTRACT_CHAIN_ID` | Chain for that contract (defaults to `VITE_CHAIN_ID`). |

Do not put private keys or other secrets in `VITE_*` variables — they are bundled into the client.

## What this app does

### Permit2 transfer

1. Connect a wallet with RainbowKit.
2. Approve the ERC-20 for Permit2 if allowance is too low.
3. Sign real EIP-712 typed data (`PermitTransferFrom` / `TokenPermissions`) with the connected wallet.
4. Call Permit2 `permitTransferFrom` with that signature (not a `0x` stub).

Permit2 nonces are unordered bitmap nonces — pick an unused value in Advanced options. The signed `spender` must be `msg.sender` of the `permitTransferFrom` transaction; this demo defaults spender to the connected wallet so it can self-submit.

Signing is off-chain. Submitting `permitTransferFrom` still costs gas unless you add a relayer.

### Custom contract

Same Wagmi provider. The ABI and address are placeholders — replace them in `src/config/customContract.ts` (see `CUSTOM_CONTRACT_SETUP.md`) before sending transactions.

## Layout

```
src/
  main.tsx                 # WagmiProvider + RainbowKitProvider
  App.tsx                  # Connect button + tabs
  components/
    Permit2Transfer.tsx
    CustomContractDapp.tsx
  config/
    wagmi.ts               # RainbowKit getDefaultConfig (Wagmi v2)
    permit2.ts             # Permit2 ABI + EIP-712 types
    customContract.ts      # Placeholder ABI/address
    env.ts
```

Supported chains in `src/config/wagmi.ts`: Ethereum mainnet and Sepolia. Add more there if needed.
