import React from 'react';
import { WagmiConfig, createConfig, configureChains, mainnet, sepolia } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import Permit2Gasless from './permit2-wagmi-complete';

const { chains, publicClient } = configureChains(
  [mainnet, sepolia],
  [
    alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY || '' }),
    publicProvider(),
  ]
);

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.REACT_APP_WALLET_CONNECT_ID || '',
      },
    }),
  ],
  publicClient,
});

export default function App() {
  return (
    <WagmiConfig config={config}>
      <Permit2Gasless 
        tokenAddress="0x..." // Replace with your token
        chainId={1}
      />
    </WagmiConfig>
  );
}
