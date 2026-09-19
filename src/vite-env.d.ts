/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_ALCHEMY_API_KEY?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_TOKEN_ADDRESS?: string;
  readonly VITE_PERMIT2_ADDRESS?: string;
  readonly VITE_CUSTOM_CONTRACT_ADDRESS?: string;
  readonly VITE_CUSTOM_CONTRACT_CHAIN_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
