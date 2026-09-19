import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { ALCHEMY_API_KEY, WALLETCONNECT_PROJECT_ID } from './env';

function alchemyRpcUrl(chainId: number): string | undefined {
  if (!ALCHEMY_API_KEY) {
    return undefined;
  }

  if (chainId === mainnet.id) {
    return `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
  }

  if (chainId === sepolia.id) {
    return `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
  }

  return undefined;
}

// WalletConnect requires a 32-char project ID. A zeroed fallback lets the app boot
// so injected wallets still work; set VITE_WALLETCONNECT_PROJECT_ID for WalletConnect.
const walletConnectProjectId =
  WALLETCONNECT_PROJECT_ID || '00000000000000000000000000000000';

export const config = getDefaultConfig({
  appName: 'Permit2 Dapp',
  projectId: walletConnectProjectId,
  chains: [mainnet, sepolia],
  ssr: false,
  transports: {
    [mainnet.id]: http(alchemyRpcUrl(mainnet.id)),
    [sepolia.id]: http(alchemyRpcUrl(sepolia.id)),
  },
});
