'use client';

import React, { useState } from 'react';
import { useAccount, useContractWrite, useNetwork, useSwitchNetwork } from 'wagmi';
import { parseEther, formatEther } from 'viem';

interface Permit2Config {
  permit2Address: `0x${string}`;
  tokenAddress: `0x${string}`;
  chainId: number;
}

const PERMIT2_ADDRESS = '0x000000000022D473030F116dFC393057B8271cAA' as const;

const Permit2Gasless: React.FC<Permit2Config> = ({ 
  tokenAddress, 
  chainId = 1 
}) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  // Form State
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [nonce, setNonce] = useState('0');
  const [deadline, setDeadline] = useState(Math.floor(Date.now() / 1000) + 3600);

  // UI State
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState('');

  // Permit2 ABI (Key functions)
  const PERMIT2_ABI = [
    {
      inputs: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint160' },
        { name: 'token', type: 'address' },
        { name: 'expiration', type: 'uint48' },
        { name: 'nonce', type: 'uint48' },
        { name: 'sigDeadline', type: 'uint256' },
        { name: 'sig', type: 'bytes' }
      ],
      name: 'permitTransferFrom',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ];

  // Contract Write Hook
  const { write: permitTransfer, isLoading: isWriteLoading } = useContractWrite({
    address: PERMIT2_ADDRESS,
    abi: PERMIT2_ABI,
    functionName: 'permitTransferFrom',
    onSuccess: (data) => {
      setStatus('success');
      setMessage('Transaction submitted successfully!');
      setTxHash(data.hash || '');
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.message || 'Transaction failed');
    }
  });

  const handleSwitchNetwork = async () => {
    if (chain?.id !== chainId) {
      switchNetwork?.(chainId);
    }
  };

  const handlePermitTransfer = async () => {
    if (!address || !recipient || !amount) {
      setStatus('error');
      setMessage('Fill all fields');
      return;
    }

    if (chain?.id !== chainId) {
      await handleSwitchNetwork();
      return;
    }

    setStatus('loading');
    setMessage('Processing transaction...');

    try {
      const amountInWei = parseEther(amount);
      
      // Create permit data
      const permitData = {
        from: address,
        to: recipient as `0x${string}`,
        amount: amountInWei.toString(),
        token: tokenAddress,
        expiration: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
        nonce: BigInt(nonce),
        sigDeadline: BigInt(deadline),
        sig: '0x' // Placeholder - sign with wallet
      };

      // Execute permit transfer
      permitTransfer({
        args: [
          permitData.from,
          permitData.to,
          permitData.amount,
          permitData.token,
          permitData.expiration,
          permitData.nonce,
          permitData.sigDeadline,
          permitData.sig
        ]
      });
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="permit2-container">
      <div className="permit2-card">
        <div className="permit2-header">
          <h1>Permit2 Gasless Transfer</h1>
          <p className="subtitle">Transfer tokens without gas fees</p>
        </div>

        {/* Wallet Status */}
        <div className={`wallet-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? (
            <>
              <div className="status-badge">✓ Connected</div>
              <p className="wallet-address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              {chain?.id !== chainId && (
                <button 
                  onClick={handleSwitchNetwork}
                  className="btn-switch-network"
                >
                  Switch to Chain {chainId}
                </button>
              )}
            </>
          ) : (
            <p className="not-connected">Connect wallet to continue</p>
          )}
        </div>

        {/* Form */}
        <form className="permit2-form" onSubmit={(e) => { e.preventDefault(); handlePermitTransfer(); }}>
          
          {/* Token Info */}
          <div className="form-group">
            <label className="form-label">Token Address</label>
            <div className="form-field-display">
              {tokenAddress}
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount to Transfer</label>
            <div className="input-wrapper">
              <input
                type="number"
                step="0.001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!isConnected}
                className="form-input"
              />
              <span className="input-unit">TOKEN</span>
            </div>
          </div>

          {/* Recipient */}
          <div className="form-group">
            <label className="form-label">Recipient Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={!isConnected}
              className="form-input"
            />
          </div>

          {/* Advanced Options */}
          <details className="advanced-options">
            <summary>Advanced Options</summary>
            <div className="advanced-fields">
              <div className="form-group">
                <label className="form-label">Nonce</label>
                <input
                  type="number"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline (Unix Timestamp)</label>
                <input
                  type="number"
                  value={deadline}
                  onChange={(e) => setDeadline(Number(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>
          </details>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`status-message status-${status}`}>
              <span className="status-icon">
                {status === 'loading' && '⏳'}
                {status === 'success' && '✓'}
                {status === 'error' && '✕'}
              </span>
              <div className="status-content">
                <p>{message}</p>
                {txHash && (
                  <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="tx-link">
                    View Transaction
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isConnected || isWriteLoading || status === 'loading'}
            className="btn-submit"
          >
            {isWriteLoading || status === 'loading' ? 'Processing...' : 'Send Gasless'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .permit2-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }

        .permit2-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: box-shadow 0.3s ease;
        }

        .permit2-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .permit2-header {
          margin-bottom: 24px;
          text-align: center;
        }

        .permit2-header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .subtitle {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        /* Wallet Status */
        .wallet-status {
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          text-align: center;
        }

        .wallet-status.connected {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border: 1px solid #b1dfbb;
        }

        .wallet-status.disconnected {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
        }

        .status-badge {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .wallet-address {
          margin: 8px 0;
          font-size: 14px;
          color: #333;
          font-weight: 500;
          font-family: 'Courier New', monospace;
        }

        .not-connected {
          margin: 0;
          color: #856404;
          font-size: 14px;
        }

        .btn-switch-network {
          display: block;
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          background: #ffc107;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .btn-switch-network:hover {
          background: #ffb300;
        }

        /* Form */
        .permit2-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }

        .form-input {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .form-input:disabled {
          background: #f5f5f5;
          color: #999;
          cursor: not-allowed;
        }

        .form-field-display {
          padding: 12px;
          background: #f5f5f5;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'Courier New', monospace;
          color: #666;
          word-break: break-all;
        }

        .input-wrapper {
          position: relative;
        }

        .input-unit {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: #999;
          font-weight: 600;
        }

        /* Advanced Options */
        .advanced-options {
          cursor: pointer;
          user-select: none;
        }

        .advanced-options summary {
          font-weight: 600;
          color: #4CAF50;
          font-size: 14px;
          padding: 8px 0;
        }

        .advanced-fields {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Status Message */
        .status-message {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          align-items: flex-start;
        }

        .status-icon {
          font-size: 18px;
          min-width: 20px;
        }

        .status-content {
          flex: 1;
        }

        .status-content p {
          margin: 0 0 8px 0;
        }

        .status-${('success')} {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .status-loading {
          background: #e7f3ff;
          color: #004085;
          border: 1px solid #b8daff;
        }

        .tx-link {
          color: inherit;
          text-decoration: underline;
          font-weight: 600;
        }

        /* Submit Button */
        .btn-submit {
          padding: 14px;
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(76, 175, 80, 0.3);
        }

        .btn-submit:disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default Permit2Gasless;
