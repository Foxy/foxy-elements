/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACH_SECURE_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
