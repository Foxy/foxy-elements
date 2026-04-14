/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACH_SECURE_ORIGIN: string;
  readonly VITE_CARD_SECURE_ORIGIN: string;
  readonly VITE_EMBED_ORIGIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css?inline" {
  const content: string;
  export default content;
}
