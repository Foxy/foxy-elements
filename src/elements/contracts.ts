import type { CardEmbedElementConfig } from "@/elements/card-embed-element";
import type { AchFieldElementConfig } from "@/elements/ach-field-element";

export const ELEMENT_CONTRACT_VERSION = "2026-04-09";

export const paymentMethodSelectorEvents = {
  tokenize: "foxy-tokenize",
  methodChange: "foxy-payment-method-change",
} as const;

export type PaymentMethodSelectorOption = {
  id: string;
  type?: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type PaymentMethodSelectorConfig = {
  locale?: string;
  options: PaymentMethodSelectorOption[];
  selectedOptionId?: string;
  loading?: boolean;
};

export interface PaymentMethodSelectorElementContract extends HTMLElement {
  config: PaymentMethodSelectorConfig;
  tokenize(): Promise<Record<string, unknown>>;
}

export const cardEmbedEvents = {
  ready: "foxy-ready",
  validation: "foxy-validation",
  resize: "foxy-resize",
  tokenizeSuccess: "foxy-tokenize-success",
  tokenizeError: "foxy-tokenize-error",
} as const;

export interface CardEmbedElementContract extends HTMLElement {
  config: CardEmbedElementConfig;
  disabled: boolean;
  readonly: boolean;
  clear(): void;
  setDisabled(disabled: boolean): void;
  setReadonly(readonly: boolean): void;
  tokenize(requestId?: string): Promise<{ token: string; requestId?: string }>;
}

export const achFieldEvents = {
  ready: "ach-ready",
  change: "ach-change",
  focus: "ach-focus",
  blur: "ach-blur",
  tokenizeSuccess: "ach-tokenize-success",
  tokenizeError: "ach-tokenize-error",
} as const;

export interface AchFieldElementContract extends HTMLElement {
  config: AchFieldElementConfig;
  disabled: boolean;
  clear(): void;
  setDisabled(disabled: boolean): void;
  tokenize(requestId?: string): Promise<{
    token: string;
    last4: string;
    bankName?: string;
    requestId?: string;
  }>;
}
