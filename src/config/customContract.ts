import { CUSTOM_CONTRACT_ADDRESS, CUSTOM_CONTRACT_CHAIN_ID } from './env';

/**
 * PLACEHOLDER custom contract.
 * Replace `address` (or set VITE_CUSTOM_CONTRACT_ADDRESS) and paste the real ABI
 * from Etherscan / your compiler artifacts before sending transactions.
 */
export const CUSTOM_CONTRACT = {
  address: CUSTOM_CONTRACT_ADDRESS,
  chainId: CUSTOM_CONTRACT_CHAIN_ID,
  name: 'MyCustomContract',
};

export const CUSTOM_CONTRACT_ABI = [
  {
    type: 'function',
    name: 'transferTokens',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'swap',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
  },
] as const;
