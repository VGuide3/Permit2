// Custom Smart Contract Configuration
// Update these values with YOUR contract details

export const CUSTOM_CONTRACT = {
  address: '0xYourContractAddressHere' as `0x${string}`,
  chainId: 1, // 1=Mainnet, 11155111=Sepolia, 137=Polygon
  name: 'MyCustomContract'
};

// Your Contract ABI - Replace with your actual ABI from Etherscan
export const CUSTOM_CONTRACT_ABI = [
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transferTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' }
    ],
    name: 'swap',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Transfer',
    type: 'event'
  }
];
