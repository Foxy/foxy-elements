import type { AchFieldElementConfig } from "../ach-field-element";
import type { CardEmbedElementConfig } from "../card-embed-element";

export type PaymentMethodSelectorOption = {
  id: string;
  type?: string;
  label: string;
  description?: string;
  gateway?: string;
  disabled?: boolean;
  acceptedBrands?: string[];
  hostedCard?: CardEmbedElementConfig;
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
    secureOrigin: AchFieldElementConfig["secureOrigin"];
    embedPath: AchFieldElementConfig["embedPath"];
    merchantOrigin?: AchFieldElementConfig["merchantOrigin"];
    sessionId?: AchFieldElementConfig["sessionId"];
    labels?: Partial<Record<AchFieldElementConfig["field"], string>>;
    placeholders?: Partial<Record<AchFieldElementConfig["field"], string>>;
    accountTypeValues?: AchFieldElementConfig["accountTypeValues"];
  };
};
