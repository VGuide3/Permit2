import type { Address, TypedDataDefinition } from 'viem';

/**
 * Uniswap Permit2 SignatureTransfer.permitTransferFrom
 * https://github.com/Uniswap/permit2/blob/main/src/interfaces/ISignatureTransfer.sol
 */
export const permit2Abi = [
  {
    type: 'function',
    name: 'permitTransferFrom',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'permit',
        type: 'tuple',
        components: [
          {
            name: 'permitted',
            type: 'tuple',
            components: [
              { name: 'token', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
          },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      {
        name: 'transferDetails',
        type: 'tuple',
        components: [
          { name: 'to', type: 'address' },
          { name: 'requestedAmount', type: 'uint256' },
        ],
      },
      { name: 'owner', type: 'address' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
] as const;

export const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

/**
 * EIP-712 types for Permit2 SignatureTransfer.
 * Domain is { name: "Permit2", chainId, verifyingContract } — no version.
 * spender in the signed message must equal msg.sender of permitTransferFrom.
 */
export const permit2Eip712Types = {
  PermitTransferFrom: [
    { name: 'permitted', type: 'TokenPermissions' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
  TokenPermissions: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
} as const;

export function buildPermitTransferTypedData({
  chainId,
  permit2Address,
  token,
  amount,
  spender,
  nonce,
  deadline,
}: {
  chainId: number;
  permit2Address: Address;
  token: Address;
  amount: bigint;
  spender: Address;
  nonce: bigint;
  deadline: bigint;
}): TypedDataDefinition<typeof permit2Eip712Types, 'PermitTransferFrom'> {
  return {
    domain: {
      name: 'Permit2',
      chainId,
      verifyingContract: permit2Address,
    },
    types: permit2Eip712Types,
    primaryType: 'PermitTransferFrom',
    message: {
      permitted: {
        token,
        amount,
      },
      spender,
      nonce,
      deadline,
    },
  };
}
