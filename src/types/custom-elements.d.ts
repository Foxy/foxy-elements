import type { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react";
import type { AchFieldElement } from "@/elements/ach-field-element";
import type { CardEmbedElement } from "@/elements/card-embed-element";

type AchFieldElementProps = Omit<
  DetailedHTMLProps<HTMLAttributes<AchFieldElement>, AchFieldElement>,
  "style"
> & {
  style?: CSSProperties & Record<`--${string}`, string | number>;
  "ach-input-height"?: string;
  "ach-input-padding"?: string;
  "ach-input-padding-x"?: string;
  "ach-input-padding-y"?: string;
  "ach-input-placeholder-color"?: string;
  "ach-input-font"?: string;
  "ach-input-text-color"?: string;
  "ach-input-text-color-error"?: string;
  "ach-input-text-size"?: string;
};

type CardEmbedElementProps = Omit<
  DetailedHTMLProps<HTMLAttributes<CardEmbedElement>, CardEmbedElement>,
  "style"
> & {
  style?: CSSProperties & Record<`--${string}`, string | number>;
  "card-input-background"?: string;
  "card-input-placeholder-color"?: string;
  "card-input-height"?: string;
  "card-input-padding"?: string;
  "card-input-padding-x"?: string;
  "card-input-padding-y"?: string;
  "card-input-font"?: string;
  "card-input-text-color"?: string;
  "card-input-text-color-error"?: string;
  "card-input-font-size"?: string;
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
