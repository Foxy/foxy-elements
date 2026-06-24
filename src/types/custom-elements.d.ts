import type { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react";
import type { AchFieldElement } from "@/elements/foxy-ach-field/element";
import type { PaymentCardFieldElement } from "@/elements/foxy-payment-card-field/element";
import type { PaymentMethodSelectorElement } from "@/elements/foxy-payment-method-selector/element";
import type { ThemeAttributeName, ThemePropertyName } from "@/lib/theme-mixin";

type SharedThemeProps = Partial<Record<ThemePropertyName, string>> &
  Partial<Record<ThemeAttributeName, string>>;

type AchFieldElementProps = Omit<
  DetailedHTMLProps<HTMLAttributes<AchFieldElement>, AchFieldElement>,
  "style"
> & {
  style?: CSSProperties & Record<`--${string}`, string | number>;
  type?:
    | "routing-number"
    | "account-number"
    | "account-type"
    | "account-holder-name";
  group?: string;
  placeholder?: string;
  lang?: string;
  accountTypeValues?: ("checking" | "savings")[];
  "account-type-values"?: string;
  disabled?: boolean;
} & SharedThemeProps;

type CardEmbedElementProps = Omit<
  DetailedHTMLProps<
    HTMLAttributes<PaymentCardFieldElement>,
    PaymentCardFieldElement
  >,
  "style"
> & {
  style?: CSSProperties & Record<`--${string}`, string | number>;
  mode?: "card" | "card_csc";
  disabled?: boolean;
  lang?: string;
  translationCardNumberLabel?: string;
  translationCardNumberPlaceholder?: string;
  translationCardExpirationLabel?: string;
  translationCardExpirationPlaceholder?: string;
  translationCardCscLabel?: string;
  translationCardCscPlaceholder?: string;
  "translation-card-number-label"?: string;
  "translation-card-number-placeholder"?: string;
  "translation-card-expiration-label"?: string;
  "translation-card-expiration-placeholder"?: string;
  "translation-card-csc-label"?: string;
  "translation-card-csc-placeholder"?: string;
} & SharedThemeProps;

type PaymentMethodSelectorElementProps = Omit<
  DetailedHTMLProps<
    HTMLAttributes<PaymentMethodSelectorElement>,
    PaymentMethodSelectorElement
  >,
  "style"
> & {
  style?: CSSProperties & Record<`--${string}`, string | number>;
  lang?: string;
  optionIndex?: number;
  "option-index"?: string | number;
} & SharedThemeProps;

type ExpressCheckoutElementProps = Omit<
  DetailedHTMLProps<
    HTMLAttributes<ExpressCheckoutElement>,
    ExpressCheckoutElement
  >,
  "style"
> & {
  lang?: string;
};

type ApplePayButtonElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  buttonstyle?: "black" | "white" | "white-outline";
  type?:
    | "plain"
    | "buy"
    | "pay"
    | "set-up"
    | "donate"
    | "check-out"
    | "book"
    | "subscribe"
    | "reload"
    | "add-money"
    | "top-up"
    | "order"
    | "rent"
    | "support"
    | "contribute"
    | "tip";
  locale?: string;
};

type GooglePayButtonElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  environment: "TEST" | "PRODUCTION";
  paymentRequest: Record<string, unknown>;
  buttonColor?: "default" | "black" | "white";
  buttonType?:
    | "book"
    | "buy"
    | "checkout"
    | "donate"
    | "order"
    | "pay"
    | "plain"
    | "subscribe"
    | "long"
    | "short";
  buttonSizeMode?: "static" | "fill";
  buttonRadius?: number;
  buttonBorderType?: "no_border" | "default_border";
  buttonLocale?: string;
  existingPaymentMethodRequired?: boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "foxy-ach-field": AchFieldElementProps;
      "foxy-payment-card-field": CardEmbedElementProps;
      "foxy-payment-method-selector": PaymentMethodSelectorElementProps;
      "apple-pay-button": ApplePayButtonElementProps;
      "google-pay-button": GooglePayButtonElementProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "foxy-ach-field": AchFieldElementProps;
      "foxy-payment-card-field": CardEmbedElementProps;
      "foxy-payment-method-selector": PaymentMethodSelectorElementProps;
      "apple-pay-button": ApplePayButtonElementProps;
      "google-pay-button": GooglePayButtonElementProps;
    }
  }
}
