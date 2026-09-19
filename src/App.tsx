import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CustomContractDapp from './components/CustomContractDapp';
import Permit2Transfer from './components/Permit2Transfer';
import { TOKEN_ADDRESS, WALLETCONNECT_PROJECT_ID } from './config/env';
import { assertNever } from './lib/assertNever';

type View = 'permit2' | 'custom';

export default function App() {
  const [view, setView] = useState<View>('permit2');

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Wagmi v2 + RainbowKit</p>
          <h1 className="app-title">Permit2 Dapp</h1>
        </div>
        <ConnectButton />
      </header>

      {!WALLETCONNECT_PROJECT_ID ? (
        <p className="banner">
          Set <code>VITE_WALLETCONNECT_PROJECT_ID</code> in <code>.env.local</code> to enable
          WalletConnect. Injected wallets (MetaMask, Rabby, etc.) still work.
        </p>
      ) : null}

      {!TOKEN_ADDRESS ? (
        <p className="banner banner-muted">
          Optional: set <code>VITE_TOKEN_ADDRESS</code> to prefill the Permit2 token field.
        </p>
      ) : null}

      <nav className="tabs" aria-label="Dapp views">
        <button
          type="button"
          className={view === 'permit2' ? 'tab active' : 'tab'}
          onClick={() => setView('permit2')}
        >
          Permit2 transfer
        </button>
        <button
          type="button"
          className={view === 'custom' ? 'tab active' : 'tab'}
          onClick={() => setView('custom')}
        >
          Custom contract
        </button>
      </nav>

      {renderView(view)}
    </div>
  );
}

function renderView(view: View) {
  switch (view) {
    case 'permit2':
      return <Permit2Transfer />;
    case 'custom':
      return <CustomContractDapp />;
    default:
      return assertNever(view);
  }
}
