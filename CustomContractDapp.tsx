'use client';

import React, { useState } from 'react';
import { useAccount, useContractWrite, useNetwork } from 'wagmi';
import { parseEther } from 'viem';
import { CUSTOM_CONTRACT, CUSTOM_CONTRACT_ABI } from './customContract.config';

const CustomContractDapp: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const [tokenAddress, setTokenAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState('');

  const { write: transferTokens, isLoading } = useContractWrite({
    address: CUSTOM_CONTRACT.address,
    abi: CUSTOM_CONTRACT_ABI,
    functionName: 'transferTokens',
    onSuccess: (data) => {
      setStatus('success');
      setMessage('Transaction submitted!');
      setTxHash(data.hash || '');
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.message || 'Transaction failed');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !tokenAddress || !recipientAddress || !amount) {
      setStatus('error');
      setMessage('Fill all fields');
      return;
    }

    if (chain?.id !== CUSTOM_CONTRACT.chainId) {
      setStatus('error');
      setMessage(`Switch to Chain ${CUSTOM_CONTRACT.chainId}`);
      return;
    }

    setStatus('loading');
    setMessage('Processing...');

    try {
      const amountInWei = parseEther(amount);
      transferTokens({
        args: [tokenAddress as `0x${string}`, recipientAddress as `0x${string}`, amountInWei]
      });
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  return (
    <div className="custom-contract-container">
      <div className="card">
        <h1>Custom Smart Contract</h1>
        <p className="contract-address">{CUSTOM_CONTRACT.address}</p>

        <div className={`status-box ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? (
            <>
              <p>✓ {address?.slice(0, 6)}...{address?.slice(-4)}</p>
              <p>Chain: {chain?.id}</p>
            </>
          ) : (
            <p>Connect wallet</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Token Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              disabled={!isConnected}
              className="input"
            />
          </div>

          <div className="form-group">
            <label>Recipient</label>
            <input
              type="text"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              disabled={!isConnected}
              className="input"
            />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              step="0.001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isConnected}
              className="input"
            />
          </div>

          {status !== 'idle' && (
            <div className={`status-message status-${status}`}>
              <p>{message}</p>
              {txHash && (
                <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                  View TX
                </a>
              )}
            </div>
          )}

          <button type="submit" disabled={!isConnected || isLoading} className="btn-submit">
            {isLoading ? 'Processing...' : 'Execute'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .custom-contract-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
        }

        .card {
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .card h1 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #1a1a1a;
        }

        .contract-address {
          margin: 0;
          font-size: 12px;
          color: #666;
          font-family: monospace;
          word-break: break-all;
        }

        .status-box {
          padding: 12px;
          border-radius: 8px;
          margin: 16px 0;
          font-size: 14px;
          text-align: center;
        }

        .status-box.connected {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }

        .status-box.disconnected {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
        }

        .status-box p {
          margin: 4px 0;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }

        .input {
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .input:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .input:disabled {
          background: #f5f5f5;
          color: #999;
          cursor: not-allowed;
        }

        .status-message {
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        .status-message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .status-message p {
          margin: 0 0 8px 0;
        }

        .status-message a {
          color: inherit;
          text-decoration: underline;
          font-weight: 600;
        }

        .btn-submit {
          padding: 12px;
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(76, 175, 80, 0.3);
        }

        .btn-submit:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default CustomContractDapp;
