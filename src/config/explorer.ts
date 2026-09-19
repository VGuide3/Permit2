import { mainnet, sepolia } from 'wagmi/chains';

export function explorerTxUrl(chainId: number, hash: string): string {
  const chain = [mainnet, sepolia].find((item) => item.id === chainId);
  const base = chain?.blockExplorers.default.url ?? 'https://etherscan.io';
  return `${base}/tx/${hash}`;
}
