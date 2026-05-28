/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EMBED_ORIGIN: string;
  readonly VITE_KLARNA_INIT_RESPONSE?: string;
  readonly VITE_PAYPAL_SANDBOX_CLIENT_ID_US?: string;
  readonly VITE_PAYPAL_SANDBOX_CLIENT_ID_AT?: string;
  readonly VITE_PAYPAL_SANDBOX_CLIENT_ID_BE?: string;
  readonly VITE_PAYPAL_SANDBOX_CLIENT_ID_NL?: string;
  readonly VITE_PAYPAL_SANDBOX_CLIENT_ID_PL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css?inline" {
  const content: string;
  export default content;
}
