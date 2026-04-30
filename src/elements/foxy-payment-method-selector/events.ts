import type { PaymentMethodSelectorTokenizePayload } from "./types";

export const paymentMethodSelectorEvents = {
  tokenizationStart: "tokenizationstart",
  tokenizationSuccess: "tokenizationsuccess",
  tokenizationError: "tokenizationerror",
  optionIndexChange: "optionindexchange",
  billingAddressError: "billingaddresserror",
} as const;

export type PaymentMethodSelectorChangeEventDetail = {
  optionIndex: number;
};

export type PaymentMethodSelectorTokenizationStartEventDetail = {
  optionIndex: number;
};

export type PaymentMethodSelectorTokenizationSuccessEventDetail = {
  payload: PaymentMethodSelectorTokenizePayload;
};

export type PaymentMethodSelectorTokenizationErrorEventDetail = {
  error: unknown;
};

export type PaymentMethodSelectorBillingAddressErrorEventDetail = {
  error: unknown;
  optionId: string;
  useShippingAddress: boolean;
  values: Record<string, string>;
};
