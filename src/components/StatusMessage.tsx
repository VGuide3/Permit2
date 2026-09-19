import { assertNever } from '../lib/assertNever';

export type TxStatus = 'idle' | 'loading' | 'success' | 'error';

function statusIcon(status: Exclude<TxStatus, 'idle'>): string {
  switch (status) {
    case 'loading':
      return '⏳';
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    default:
      return assertNever(status);
  }
}

export function StatusMessage({
  status,
  message,
  txUrl,
}: {
  status: TxStatus;
  message: string;
  txUrl?: string;
}) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className={`status-message status-${status}`}>
      <span className="status-icon">{statusIcon(status)}</span>
      <div className="status-content">
        <p>{message}</p>
        {txUrl ? (
          <a href={txUrl} target="_blank" rel="noopener noreferrer" className="tx-link">
            View transaction
          </a>
        ) : null}
      </div>
    </div>
  );
}
