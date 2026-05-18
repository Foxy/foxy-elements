/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EMBED_ORIGIN: string;
  readonly VITE_KLARNA_INIT_RESPONSE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css?inline" {
  const content: string;
  export default content;
}
