import type {
  AchAccountTypeValue,
  AchHostedFieldName,
} from "../foxy-ach-field/element";
import type { PaymentCardFieldOption } from "../foxy-payment-card-field/element";

export type PaymentMethodSelectorBillingField = {
  id: string;
  label: string;
  type: "text" | "tel" | "select";
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: string }>;
};

export type PaymentMethodSelectorBillingAddress = {
  useDefaultShippingAddress?: "yes-by-default" | "no-by-default";
  fields: PaymentMethodSelectorBillingField[];
};

export type PaymentMethodSelectorBillingPayload = {
  useShippingAddress: boolean;
  values: Record<string, string>;
};

export type PaymentMethodSelectorBillingError = {
  message?: string;
};

type PaymentMethodSelectorCardTokenizeDetails = {
  cardBrand: string | undefined;
  last4: string | undefined;
  expirationMonth: number | undefined;
  expirationYear: number | undefined;
};

type PaymentMethodSelectorOptionalHostedCardTokenizePayload = {
  token: string | undefined;
  requestId: string | undefined;
};

type PaymentMethodSelectorRequiredHostedCardTokenizePayload = {
  token: string;
  requestId: string;
};

type PaymentMethodSelectorOptionalCardTokenizeDetails = {
  cardBrand?: string;
  last4?: string;
  expirationMonth?: number;
  expirationYear?: number;
};

export type PaymentMethodSelectorSavedCardTokenizePayload =
  PaymentMethodSelectorOptionalHostedCardTokenizePayload &
    PaymentMethodSelectorCardTokenizeDetails;

export type PaymentMethodSelectorNewCardTokenizePayload =
  PaymentMethodSelectorRequiredHostedCardTokenizePayload &
    PaymentMethodSelectorCardTokenizeDetails;

export type PaymentMethodSelectorAchTokenizePayload = {
  token: string;
  requestId: string;
};

export type PaymentMethodSelectorStripeCardElementTokenizePayload = {
  paymentMethodId: string;
} & PaymentMethodSelectorCardTokenizeDetails;

export type PaymentMethodSelectorStripePaymentElementTokenizePayload = {
  paymentMethodId: string;
  paymentMethodType: string;
} & PaymentMethodSelectorOptionalCardTokenizeDetails;

export type PaymentMethodSelectorPurchaseOrderTokenizePayload = {
  purchaseOrderNumber: string;
};

export type PaymentMethodSelectorPayPalPlatformFlow =
  | "buttons"
  | "card-fields"
  | "apple-pay"
  | "google-pay";

export type PaymentMethodSelectorPayPalPlatformFundingSource =
  | "paypal"
  | "paylater"
  | "credit"
  | "venmo"
  | "sepa"
  | "bancontact"
  | "eps"
  | "blik"
  | "ideal"
  | "p24";

export type PaymentMethodSelectorPayPalPlatformConfig = {
  clientId: string;
  flow: PaymentMethodSelectorPayPalPlatformFlow;
  fundingSources?: PaymentMethodSelectorPayPalPlatformFundingSource[];
};

export type PaymentMethodSelectorPayPalMessage = {
  amount?: string;
  currencyCode?: string;
  buyerCountry?: string;
  locale?: string;
};

export type PaymentMethodSelectorPayPalPlatformTokenizePayload = {
  paypalPlatform: PaymentMethodSelectorPayPalPlatformConfig;
};

export type PaymentMethodSelectorApplePayTokenizePayload = Record<
  string,
  never
>;

export type PaymentMethodSelectorGooglePayTokenizePayload = Record<
  string,
  never
>;

export type PaymentMethodSelectorGenericTokenizePayload = Record<string, never>;

export type PaymentMethodSelectorTokenizePayload =
  | PaymentMethodSelectorSavedCardTokenizePayload
  | PaymentMethodSelectorNewCardTokenizePayload
  | PaymentMethodSelectorAchTokenizePayload
  | PaymentMethodSelectorStripeCardElementTokenizePayload
  | PaymentMethodSelectorStripePaymentElementTokenizePayload
  | PaymentMethodSelectorPurchaseOrderTokenizePayload
  | PaymentMethodSelectorPayPalPlatformTokenizePayload
  | PaymentMethodSelectorApplePayTokenizePayload
  | PaymentMethodSelectorGooglePayTokenizePayload
  | PaymentMethodSelectorGenericTokenizePayload;

export type PaymentController = {
  tokenize: (
    requestId?: string,
  ) => Promise<PaymentMethodSelectorTokenizePayload>;
};

export type PaymentMethodSelectorOption = {
  id: string;
  type?: string;
  label: string;
  description?: string;
  gateway?: string;
  disabled?: boolean;
  paypalPlatform?: PaymentMethodSelectorPayPalPlatformConfig;
  paypalMessage?: PaymentMethodSelectorPayPalMessage;
  savedPaymentMethodId?: string;
  cardBrand?: string;
  last4?: string;
  expirationMonth?: number;
  expirationYear?: number;
  acceptedBrands?: string[];
  hostedCard?: PaymentCardFieldOption;
  stripeCardElement?: {
    publishableKey: string;
    locale?: string;
    appearance?: Record<string, unknown>;
    cardElementOptions?: Record<string, unknown>;
  };
  stripePaymentElement?: {
    publishableKey: string;
    locale?: string;
    appearance?: Record<string, unknown>;
    paymentElementOptions?: Record<string, unknown>;
  };
  hostedFields?: {
    group?: string;
    labels?: Partial<Record<AchHostedFieldName, string>>;
    placeholders?: Partial<Record<AchHostedFieldName, string>>;
    accountTypeValues?: AchAccountTypeValue[];
  };
};
