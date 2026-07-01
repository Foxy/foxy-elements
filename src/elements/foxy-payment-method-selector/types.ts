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


export type PaymentMethodSelectorAdyenEmbeddedConfig = {
  paymentMethodsResponse: Record<string, unknown>;
  environment: string;
  clientKey: string;
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

export type PaymentMethodSelectorSavedCardTokenizePayload =
  PaymentMethodSelectorOptionalHostedCardTokenizePayload &
    PaymentMethodSelectorCardTokenizeDetails;

export type PaymentMethodSelectorNewCardTokenizePayload =
  PaymentMethodSelectorRequiredHostedCardTokenizePayload &
    PaymentMethodSelectorCardTokenizeDetails & {
      gateway?: string;
    };

export type PaymentMethodSelectorAchTokenizePayload = {
  token: string;
  requestId: string;
  last4: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
};

export type PaymentMethodSelectorStripeCardElementTokenizePayload = {
  requestId: string;
  card_token_id: string;
};

export type PaymentMethodSelectorStripePaymentElementTokenizePayload =
  | { requestId: string; confirmation_token_id: string }
  | { requestId: string; payment_intent_id: string };

export type PaymentMethodSelectorPurchaseOrderTokenizePayload = {
  requestId: string;
  purchaseOrderNumber: string;
};

export type PaymentMethodSelectorKlarnaTokenizePayload = {
  authorizationToken: string;
  sessionId: string;
  paymentMethodCategory: string;
};


export type PaymentMethodSelectorAdyenEmbeddedTokenizePayload = {
  adyenEmbedded: {
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
  orderId?: string;
};

export type PaymentMethodSelectorPayPalMessage = {
  amount?: string;
  currencyCode?: string;
  buyerCountry?: string;
  locale?: string;
};

export type PaymentMethodSelectorPayPalPlatformTokenizePayload = {
  paypalPlatform: PaymentMethodSelectorPayPalPlatformConfig & {
    orderId?: string;
  };
};

export type PaymentMethodSelectorApplePayTokenizePayload = Record<
  string,
  never
>;

export type PaymentMethodSelectorGooglePayTokenizePayload = Record<
  string,
  never
>;

export type PaymentMethodSelectorRedirectTokenizePayload = {
  requestId: string;
};

export type PaymentMethodSelectorGenericTokenizePayload = Record<string, never>;

export type PaymentMethodSelectorTokenizePayload =
  | PaymentMethodSelectorSavedCardTokenizePayload
  | PaymentMethodSelectorNewCardTokenizePayload
  | PaymentMethodSelectorAchTokenizePayload
  | PaymentMethodSelectorStripeCardElementTokenizePayload
  | PaymentMethodSelectorStripePaymentElementTokenizePayload
  | PaymentMethodSelectorPurchaseOrderTokenizePayload
  | PaymentMethodSelectorKlarnaTokenizePayload
  | PaymentMethodSelectorAdyenEmbeddedTokenizePayload
  | PaymentMethodSelectorSquareUpTokenizePayload
  | PaymentMethodSelectorPayPalPlatformTokenizePayload
  | PaymentMethodSelectorApplePayTokenizePayload
  | PaymentMethodSelectorGooglePayTokenizePayload
  | PaymentMethodSelectorRedirectTokenizePayload
  | PaymentMethodSelectorGenericTokenizePayload;

export type PaymentController = {
  tokenize: (
    requestId?: string,
  ) => Promise<PaymentMethodSelectorTokenizePayload | Record<string, unknown>>;
  /**
   * Optional. Called when the host selects a different (non-Adyen) payment
   * option so the controller can deselect/collapse any internally selected
   * payment method (e.g. the Adyen Drop-in's active payment method).
   */
  deselect?: () => void;
};

export type PaymentMethodSelectorOption = {
  id: string;
  type?: string;
  label: string;
  description?: string;
  gateway?: string;
  disabled?: boolean;
  klarna?: PaymentMethodSelectorKlarnaConfig;
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
    clientSecret?: string;
    returnUrl?: string;
  };
  hostedFields?: {
    group?: string;
    labels?: Partial<Record<AchHostedFieldName, string>>;
    placeholders?: Partial<Record<AchHostedFieldName, string>>;
    accountTypeValues?: AchAccountTypeValue[];
  };
};
