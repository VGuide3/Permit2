import { FormEvent, useMemo, useState } from 'react';
import { isAddress, maxUint256, parseUnits, type Address, type Hex } from 'viem';
import {
  useAccount,
  useChainId,
  useReadContract,
  useSignTypedData,
  useSwitchChain,
  useWriteContract,
} from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { PERMIT2_ADDRESS, TARGET_CHAIN_ID, TOKEN_ADDRESS } from '../config/env';
import { explorerTxUrl } from '../config/explorer';
import {
  buildPermitTransferTypedData,
  erc20Abi,
  permit2Abi,
} from '../config/permit2';
import { config } from '../config/wagmi';
import { StatusMessage, type TxStatus } from './StatusMessage';

function defaultDeadline(): number {
  return Math.floor(Date.now() / 1000) + 3600;
}

export default function Permit2Transfer() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const [tokenAddress, setTokenAddress] = useState(TOKEN_ADDRESS ?? '');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [nonce, setNonce] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [spender, setSpender] = useState('');
  const [status, setStatus] = useState<TxStatus>('idle');
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState<Hex>();

  const token = parseOptionalAddress(tokenAddress);
  const recipientAddress = parseOptionalAddress(recipient);
  const spenderAddress = parseOptionalAddress(spender) ?? address;
  const wrongNetwork = isConnected && chainId !== TARGET_CHAIN_ID;

  const { data: tokenDecimals } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'decimals',
    query: { enabled: Boolean(token) },
  });

  const { data: tokenSymbol } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'symbol',
    query: { enabled: Boolean(token) },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, PERMIT2_ADDRESS] : undefined,
    query: { enabled: Boolean(address && token) },
  });

  const decimals = tokenDecimals ?? 18;
  const parsedAmount = useMemo(() => {
    if (!amount) {
      return undefined;
    }
    try {
      return parseUnits(amount, decimals);
    } catch {
      return undefined;
    }
  }, [amount, decimals]);

  const needsApproval =
    parsedAmount !== undefined &&
    allowance !== undefined &&
    allowance < parsedAmount;

  const busy = isWriting || isSwitching || status === 'loading';
  const txUrl = txHash ? explorerTxUrl(chainId, txHash) : undefined;

  async function handleSwitchNetwork() {
    await switchChainAsync({ chainId: TARGET_CHAIN_ID });
  }

  async function handleApprove() {
    if (!token || !address) {
      return;
    }

    setStatus('loading');
    setMessage('Approve Permit2 to spend this token...');
    setTxHash(undefined);

    try {
      if (wrongNetwork) {
        await handleSwitchNetwork();
      }

      const hash = await writeContractAsync({
        address: token,
        abi: erc20Abi,
        functionName: 'approve',
        args: [PERMIT2_ADDRESS, maxUint256],
      });
      setTxHash(hash);
      setMessage('Waiting for approval confirmation...');
      await waitForTransactionReceipt(config, { hash });
      await refetchAllowance();
      setStatus('success');
      setMessage('Permit2 is approved for this token. You can sign and transfer.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Approval failed');
    }
  }

  async function handlePermitTransfer(event: FormEvent) {
    event.preventDefault();

    if (!address || !token || !recipientAddress || parsedAmount === undefined || !spenderAddress) {
      setStatus('error');
      setMessage('Connect a wallet and fill token, amount, and recipient.');
      return;
    }

    if (!isAddress(recipient) || parsedAmount <= 0n) {
      setStatus('error');
      setMessage('Enter a valid recipient and amount.');
      return;
    }

    if (spenderAddress.toLowerCase() !== address.toLowerCase()) {
      setStatus('error');
      setMessage(
        'This demo submits permitTransferFrom from your connected wallet, so spender must match that address (or leave it blank).',
      );
      return;
    }

    setStatus('loading');
    setTxHash(undefined);

    try {
      if (wrongNetwork) {
        setMessage(`Switching to chain ${TARGET_CHAIN_ID}...`);
        await handleSwitchNetwork();
      }

      if (needsApproval) {
        setStatus('error');
        setMessage('Approve Permit2 for this token before transferring.');
        return;
      }

      const typedData = buildPermitTransferTypedData({
        chainId: TARGET_CHAIN_ID,
        permit2Address: PERMIT2_ADDRESS,
        token,
        amount: parsedAmount,
        spender: spenderAddress,
        nonce: BigInt(nonce || '0'),
        deadline: BigInt(deadline),
      });

      setMessage('Sign the Permit2 EIP-712 typed data in your wallet...');
      const signature = await signTypedDataAsync(typedData);

      if (!signature || signature === '0x') {
        throw new Error('Wallet returned an empty signature');
      }

      setMessage('Submitting permitTransferFrom...');
      const hash = await writeContractAsync({
        address: PERMIT2_ADDRESS,
        abi: permit2Abi,
        functionName: 'permitTransferFrom',
        args: [
          {
            permitted: {
              token,
              amount: parsedAmount,
            },
            nonce: BigInt(nonce || '0'),
            deadline: BigInt(deadline),
          },
          {
            to: recipientAddress,
            requestedAmount: parsedAmount,
          },
          address,
          signature,
        ],
      });

      setTxHash(hash);
      setMessage('Waiting for confirmation...');
      await waitForTransactionReceipt(config, { hash });
      setStatus('success');
      setMessage('Permit2 transfer confirmed.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Transfer failed');
    }
  }

  return (
    <div className="permit2-container">
      <div className="permit2-card">
        <div className="permit2-header">
          <h1>Permit2 Transfer</h1>
          <p className="subtitle">
            Sign Uniswap Permit2 <code>permitTransferFrom</code> typed data, then submit the
            signature on-chain. The signature itself is off-chain; submitting still uses gas
            unless you add a relayer.
          </p>
        </div>

        <div className={`wallet-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? (
            <>
              <div className="status-badge">Connected</div>
              <p className="wallet-address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              {wrongNetwork ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleSwitchNetwork();
                  }}
                  className="btn-switch-network"
                  disabled={isSwitching}
                >
                  Switch to chain {TARGET_CHAIN_ID}
                </button>
              ) : (
                <p className="wallet-address">Chain {chainId}</p>
              )}
            </>
          ) : (
            <p className="not-connected">Connect a wallet to continue</p>
          )}
        </div>

        <form className="permit2-form" onSubmit={handlePermitTransfer}>
          <div className="form-group">
            <label className="form-label" htmlFor="token-address">
              Token address
            </label>
            <input
              id="token-address"
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(event) => setTokenAddress(event.target.value)}
              disabled={!isConnected}
              className="form-input"
            />
            <p className="field-hint">
              Permit2: {PERMIT2_ADDRESS}
              {tokenSymbol ? ` · Token: ${tokenSymbol}` : ''}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="amount">
              Amount to transfer
            </label>
            <div className="input-wrapper">
              <input
                id="amount"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={!isConnected}
                className="form-input"
              />
              <span className="input-unit">{tokenSymbol ?? 'TOKEN'}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="recipient">
              Recipient address
            </label>
            <input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              disabled={!isConnected}
              className="form-input"
            />
          </div>

          <details className="advanced-options">
            <summary>Advanced options</summary>
            <div className="advanced-fields">
              <div className="form-group">
                <label className="form-label" htmlFor="nonce">
                  Permit2 nonce (unordered; must be unused)
                </label>
                <input
                  id="nonce"
                  type="number"
                  value={nonce}
                  onChange={(event) => setNonce(event.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="deadline">
                  Deadline (unix timestamp)
                </label>
                <input
                  id="deadline"
                  type="number"
                  value={deadline}
                  onChange={(event) => setDeadline(Number(event.target.value))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="spender">
                  Spender (must be msg.sender of permitTransferFrom)
                </label>
                <input
                  id="spender"
                  type="text"
                  placeholder={address ?? 'Connected wallet (default)'}
                  value={spender}
                  onChange={(event) => setSpender(event.target.value)}
                  className="form-input"
                />
                <p className="field-hint">
                  Defaults to your connected address so this demo can submit the transfer itself.
                </p>
              </div>
            </div>
          </details>

          <StatusMessage status={status} message={message} txUrl={txUrl} />

          {needsApproval ? (
            <button
              type="button"
              disabled={!isConnected || busy}
              className="btn-submit btn-secondary"
              onClick={() => {
                void handleApprove();
              }}
            >
              {busy ? 'Processing...' : 'Approve Permit2'}
            </button>
          ) : null}

          <button type="submit" disabled={!isConnected || busy || needsApproval} className="btn-submit">
            {busy ? 'Processing...' : 'Sign & transfer'}
          </button>
        </form>
      </div>
    </div>
  );
}

function parseOptionalAddress(value: string): Address | undefined {
  const trimmed = value.trim();
  return isAddress(trimmed) ? trimmed : undefined;
}
