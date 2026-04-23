import type { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react";
import type { AchFieldElement } from "@/elements/ach-field-element";
import type { PaymentCardFieldElement } from "@/elements/payment-card-field-element";

type AchFieldElementProps = Omit<
  DetailedHTMLProps<HTMLAttributes<AchFieldElement>, AchFieldElement>,
  "style"
> & {
  style?: CSSProperties & Record<`--${string}`, string | number>;
  type?: "routing-number" | "account-number" | "account-type" | "account-holder-name";
  group?: string;
  placeholder?: string;
  "account-type-values"?: string;
  disabled?: boolean;
  "theme-input-placeholder-color"?: string;
  "theme-input-height"?: string;
  "theme-input-padding"?: string;
  "theme-input-padding-x"?: string;
  "theme-input-padding-y"?: string;
  "theme-font-sans"?: string;
  "theme-input-text-color"?: string;
  "theme-input-error-text-color"?: string;
  "theme-input-font-size"?: string;
};

type CardEmbedElementProps = Omit<
  DetailedHTMLProps<
    HTMLAttributes<PaymentCardFieldElement>,
    PaymentCardFieldElement
  >,
  "style"
> & {
  style?: CSSProperties & Record<`--${string}`, string | number>;
  mode?: "full" | "csc-only";
  "secure-origin"?: string;
  "translation-card-number-label"?: string;
  "translation-card-number-placeholder"?: string;
  "translation-card-expiration-label"?: string;
  "translation-card-expiration-placeholder"?: string;
  "translation-card-csc-label"?: string;
  "translation-card-csc-placeholder"?: string;
  "theme-background"?: string;
  "theme-input-placeholder-color"?: string;
  "theme-input-height"?: string;
  "theme-input-padding"?: string;
  "theme-input-padding-x"?: string;
  "theme-input-padding-y"?: string;
  "theme-font-sans"?: string;
  "theme-input-text-color"?: string;
  "theme-input-error-text-color"?: string;
  "theme-input-font-size"?: string;
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
  existingPaymentMethodRequired?: boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "foxy-ach-field": AchFieldElementProps;
      "foxy-payment-card-field": CardEmbedElementProps;
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
      "apple-pay-button": ApplePayButtonElementProps;
      "google-pay-button": GooglePayButtonElementProps;
    }
  }
}
