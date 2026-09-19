import { isAddress, type Address } from 'viem';
import { mainnet, sepolia } from 'wagmi/chains';

export const DEFAULT_PERMIT2_ADDRESS =
  '0x000000000022D473030F116dFC393057B8271cAA' as const;

const PLACEHOLDER_ADDRESS_PREFIXES = ['0x...', '0xyour'];

export function parseAddress(value: string | undefined): Address | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (PLACEHOLDER_ADDRESS_PREFIXES.some((prefix) => trimmed.toLowerCase().startsWith(prefix))) {
    return undefined;
  }

  return isAddress(trimmed) ? trimmed : undefined;
}

function parseChainId(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() ?? '';

export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY?.trim() ?? '';

export const TARGET_CHAIN_ID = parseChainId(import.meta.env.VITE_CHAIN_ID, mainnet.id);

export const TOKEN_ADDRESS = parseAddress(import.meta.env.VITE_TOKEN_ADDRESS);

export const PERMIT2_ADDRESS =
  parseAddress(import.meta.env.VITE_PERMIT2_ADDRESS) ?? DEFAULT_PERMIT2_ADDRESS;

export const CUSTOM_CONTRACT_ADDRESS = parseAddress(
  import.meta.env.VITE_CUSTOM_CONTRACT_ADDRESS,
);

export const CUSTOM_CONTRACT_CHAIN_ID = parseChainId(
  import.meta.env.VITE_CUSTOM_CONTRACT_CHAIN_ID,
  TARGET_CHAIN_ID,
);

export const supportedChains = [mainnet, sepolia] as const;

export function isSupportedChainId(
  chainId: number,
): chainId is (typeof supportedChains)[number]['id'] {
  return supportedChains.some((chain) => chain.id === chainId);
}
