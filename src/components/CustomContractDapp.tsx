import { FormEvent, useMemo, useState } from 'react';
import { isAddress, parseUnits, type Address, type Hex } from 'viem';
import { useAccount, useChainId, useSwitchChain, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { CUSTOM_CONTRACT, CUSTOM_CONTRACT_ABI } from '../config/customContract';
import { explorerTxUrl } from '../config/explorer';
import { config } from '../config/wagmi';
import { StatusMessage, type TxStatus } from './StatusMessage';

export default function CustomContractDapp() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const [tokenAddress, setTokenAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<TxStatus>('idle');
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState<Hex>();

  const contractAddress = CUSTOM_CONTRACT.address;
  const wrongNetwork = isConnected && chainId !== CUSTOM_CONTRACT.chainId;
  const placeholderContract = !contractAddress;

  const parsedAmount = useMemo(() => {
    if (!amount) {
      return undefined;
    }
    try {
      return parseUnits(amount, 18);
    } catch {
      return undefined;
    }
  }, [amount]);

  const busy = isWriting || isSwitching || status === 'loading';
  const txUrl = txHash ? explorerTxUrl(chainId, txHash) : undefined;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!address || !isAddress(tokenAddress) || !isAddress(recipientAddress) || parsedAmount === undefined) {
      setStatus('error');
      setMessage('Fill token, recipient, and amount with valid values.');
      return;
    }

    if (!contractAddress) {
      setStatus('error');
      setMessage(
        'Set VITE_CUSTOM_CONTRACT_ADDRESS (and the ABI in src/config/customContract.ts) before executing.',
      );
      return;
    }

    setStatus('loading');
    setTxHash(undefined);

    try {
      if (wrongNetwork) {
        setMessage(`Switching to chain ${CUSTOM_CONTRACT.chainId}...`);
        await switchChainAsync({ chainId: CUSTOM_CONTRACT.chainId });
      }

      setMessage('Submitting transferTokens...');
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: CUSTOM_CONTRACT_ABI,
        functionName: 'transferTokens',
        args: [tokenAddress as Address, recipientAddress as Address, parsedAmount],
      });
      setTxHash(hash);
      setMessage('Waiting for confirmation...');
      await waitForTransactionReceipt(config, { hash });
      setStatus('success');
      setMessage('Transaction confirmed.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Transaction failed');
    }
  }

  return (
    <div className="custom-contract-container">
      <div className="card">
        <h1>Custom smart contract</h1>
        <p className="contract-address">
          {contractAddress ?? 'No contract address configured (placeholder)'}
        </p>
        <p className="field-hint">
          This tab shares the same Wagmi + RainbowKit provider. The ABI is a stub
          (`transferTokens`). Point it at your deployed contract before sending real
          transactions — see CUSTOM_CONTRACT_SETUP.md.
        </p>

        <div className={`status-box ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? (
            <>
              <p>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <p>Chain: {chainId}</p>
              {wrongNetwork ? (
                <button
                  type="button"
                  className="btn-switch-network"
                  disabled={isSwitching}
                  onClick={() => {
                    void switchChainAsync({ chainId: CUSTOM_CONTRACT.chainId });
                  }}
                >
                  Switch to chain {CUSTOM_CONTRACT.chainId}
                </button>
              ) : null}
            </>
          ) : (
            <p>Connect wallet</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="custom-token">Token address</label>
            <input
              id="custom-token"
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(event) => setTokenAddress(event.target.value)}
              disabled={!isConnected}
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="custom-recipient">Recipient</label>
            <input
              id="custom-recipient"
              type="text"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(event) => setRecipientAddress(event.target.value)}
              disabled={!isConnected}
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="custom-amount">Amount (18 decimals)</label>
            <input
              id="custom-amount"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={!isConnected}
              className="input"
            />
          </div>

          <StatusMessage status={status} message={message} txUrl={txUrl} />

          <button
            type="submit"
            disabled={!isConnected || busy || placeholderContract}
            className="btn-submit"
          >
            {busy ? 'Processing...' : 'Execute'}
          </button>
        </form>
      </div>
    </div>
  );
}
