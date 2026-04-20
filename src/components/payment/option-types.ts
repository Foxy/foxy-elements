import type {
  AchAccountTypeValue,
  AchHostedFieldName,
} from "../../elements/ach-field-element";
import type { PaymentCardFieldOption } from "../../elements/payment-card-field-element";

export type PaymentMethodSelectorOption = {
  id: string;
  type?: string;
  label: string;
  description?: string;
  gateway?: string;
  disabled?: boolean;
  savedPaymentMethodId?: string;
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
    secureOrigin: string;
    sessionId?: string;
    labels?: Partial<Record<AchHostedFieldName, string>>;
    placeholders?: Partial<Record<AchHostedFieldName, string>>;
    accountTypeValues?: AchAccountTypeValue[];
  };
};
