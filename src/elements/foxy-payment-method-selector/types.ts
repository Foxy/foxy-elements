import type {
  AchAccountTypeValue,
  AchHostedFieldName,
} from "../foxy-ach-field/element";
import type { PaymentCardFieldOption } from "../foxy-payment-card-field/element";

export type PaymentMethodSelectorKlarnaCategory = {
  identifier: string;
  name: string;
  asset_urls: {
    descriptive: string;
    standard: string;
  };
};

export type PaymentMethodSelectorKlarnaConfig = {
  sessionId: string;
  category: PaymentMethodSelectorKlarnaCategory;
};

export type PaymentMethodSelectorSezzleConfig = {
  publicKey: string;
};

export type PaymentMethodSelectorAdyenEmbeddedPaymentMethod = {
  type: string;
  name?: string;
  brands?: string[];
  [key: string]: unknown;
};

export type PaymentMethodSelectorAdyenEmbeddedConfig = {
  sessionData: string;
  environment: string;
  clientKey: string;
  paymentMethodType: string;
  paymentMethod: PaymentMethodSelectorAdyenEmbeddedPaymentMethod;
  componentName: string;
};

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

export type PaymentMethodSelectorKlarnaTokenizePayload = {
  authorizationToken: string;
  sessionId: string;
  paymentMethodCategory: string;
};

export type PaymentMethodSelectorSezzleTokenizePayload = {
  sezzle: PaymentMethodSelectorSezzleConfig;
};

export type PaymentMethodSelectorAdyenEmbeddedTokenizePayload = {
  adyenEmbedded: {
    paymentMethodType: string;
    paymentMethod: PaymentMethodSelectorAdyenEmbeddedPaymentMethod;
    result: Record<string, unknown>;
  };
};

export type PaymentMethodSelectorSquareUpConfig = {
  applicationId: string;
  locationId: string;
  environment: "sandbox" | "production";
};

export type PaymentMethodSelectorSquareUpTokenizePayload = {
  squareUp: {
    nonce: string;
    methodType: string;
  };
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
  | PaymentMethodSelectorKlarnaTokenizePayload
  | PaymentMethodSelectorSezzleTokenizePayload
  | PaymentMethodSelectorAdyenEmbeddedTokenizePayload
  | PaymentMethodSelectorSquareUpTokenizePayload
  | PaymentMethodSelectorPayPalPlatformTokenizePayload
  | PaymentMethodSelectorApplePayTokenizePayload
  | PaymentMethodSelectorGooglePayTokenizePayload
  | PaymentMethodSelectorGenericTokenizePayload;

export type PaymentController = {
  tokenize: (
    requestId?: string,
  ) => Promise<PaymentMethodSelectorTokenizePayload | Record<string, unknown>>;
};

export type PaymentMethodSelectorOption = {
  id: string;
  type?: string;
  label: string;
  description?: string;
  gateway?: string;
  disabled?: boolean;
  klarna?: PaymentMethodSelectorKlarnaConfig;
  sezzle?: PaymentMethodSelectorSezzleConfig;
  adyenEmbedded?: PaymentMethodSelectorAdyenEmbeddedConfig;
  squareUp?: PaymentMethodSelectorSquareUpConfig;
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
