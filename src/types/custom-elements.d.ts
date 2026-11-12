import type { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react";
import type { AchFieldElement } from "@/elements/foxy-ach-field/element";
import type { CustomerPortalElement } from "@/elements/foxy-customer-portal/element";
import type { PortalVariant } from "@/elements/foxy-customer-portal/types";
import type { PaymentCardFieldElement } from "@/elements/foxy-payment-card-field/element";
import type { PaymentMethodSelectorElement } from "@/elements/foxy-payment-method-selector/element";
import type { ProductCollectionElement } from "@/elements/foxy-product-collection/element";
import type { ProductFormElement } from "@/elements/foxy-product-form/element";
import type { ProductLinkElement } from "@/elements/foxy-product-link/element";
import type { ProductPageElement } from "@/elements/foxy-product-page/element";
import type { ProductTileElement } from "@/elements/foxy-product-tile/element";
import type {
  SideCartTriggerElement,
  SideCartTriggerLayout,
} from "@/elements/foxy-side-cart-trigger/element";
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
  // INTERIM: forwarded to the embed so it can fetch its gateway_id. Removed
  // when card token vaulting lands.
  templateSetId?: number;
  "template-set-id"?: string | number;
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
  disabled?: boolean;
  createsAccount?: boolean;
  "creates-account"?: boolean;
  hiddenGateways?: string[];
  "hidden-gateways"?: string;
  hiddenMethods?: string[];
  "hidden-methods"?: string;
} & SharedThemeProps;

type CustomerPortalElementProps = Omit<
  DetailedHTMLProps<
    HTMLAttributes<CustomerPortalElement>,
    CustomerPortalElement
  >,
  "style"
> & {
  style?: CSSProperties & Record<`--${string}`, string | number>;
  storeDomain?: string;
  "store-domain"?: string;
  templateSetId?: string;
  "template-set-id"?: string;
  skipPasswordReset?: boolean;
  "skip-password-reset"?: boolean;
  urlSync?: boolean;
  "url-sync"?: boolean;
  variant?: PortalVariant;
  lang?: string;
} & SharedThemeProps;

type SideCartTriggerElementProps = DetailedHTMLProps<
  HTMLAttributes<SideCartTriggerElement>,
  SideCartTriggerElement
> & {
  layout?: SideCartTriggerLayout;
};

type ProductElementSharedProps = {
  sku?: string;
  store?: string;
  currency?: string;
  "currency-cookie"?: string;
  font?: string;
  "text-color"?: string;
  "button-color"?: string;
  "button-text-color"?: string;
  "button-radius"?: number | string;
  "accent-color"?: string;
};

type ProductLinkElementProps = DetailedHTMLProps<
  HTMLAttributes<ProductLinkElement>,
  ProductLinkElement
> &
  ProductElementSharedProps & {
    quantity?: number | string;
    label?: string;
    checkout?: boolean;
    showPrice?: boolean;
    "show-price"?: boolean | "false";
    appearance?: "button" | "text";
  };

type ProductFormElementProps = Omit<
  DetailedHTMLProps<HTMLAttributes<ProductFormElement>, ProductFormElement>,
  "value"
> &
  ProductElementSharedProps & {
    value?: string;
    label?: string;
    headingLevel?: number;
    "heading-level"?: number | string;
    showQuantity?: boolean;
    "show-quantity"?: boolean;
  };

type ProductPageElementProps = Omit<
  DetailedHTMLProps<HTMLAttributes<ProductPageElement>, ProductPageElement>,
  "value"
> &
  ProductElementSharedProps & {
    value?: string;
    label?: string;
    headingLevel?: number;
    "heading-level"?: number | string;
    skuParam?: string;
    "sku-param"?: string;
  };

type ProductTileElementProps = DetailedHTMLProps<
  HTMLAttributes<ProductTileElement>,
  ProductTileElement
> &
  ProductElementSharedProps & {
    href?: string;
    quickAdd?: "auto" | "never";
    "quick-add"?: "auto" | "never";
    headingLevel?: number;
    "heading-level"?: number | string;
  };

type ProductCollectionElementProps = DetailedHTMLProps<
  HTMLAttributes<ProductCollectionElement>,
  ProductCollectionElement
> &
  Omit<ProductElementSharedProps, "sku"> & {
    collection?: string;
    tag?: string;
    "in-stock"?: boolean | "true" | "false";
    sort?: string;
    limit?: number | string;
    productHref?: string;
    "product-href"?: string;
    "quick-add"?: "auto" | "never";
    "heading-level"?: number | string;
    variantPrices?: boolean;
    "variant-prices"?: boolean;
    showCount?: boolean;
    "show-count"?: boolean;
    showSort?: boolean;
    "show-sort"?: boolean;
  };

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
      "foxy-customer-portal": CustomerPortalElementProps;
      "foxy-payment-card-field": CardEmbedElementProps;
      "foxy-payment-method-selector": PaymentMethodSelectorElementProps;
      "foxy-side-cart-trigger": SideCartTriggerElementProps;
      "foxy-product-link": ProductLinkElementProps;
      "foxy-product-form": ProductFormElementProps;
      "foxy-product-page": ProductPageElementProps;
      "foxy-product-tile": ProductTileElementProps;
      "foxy-product-collection": ProductCollectionElementProps;
      "apple-pay-button": ApplePayButtonElementProps;
      "google-pay-button": GooglePayButtonElementProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "foxy-ach-field": AchFieldElementProps;
      "foxy-customer-portal": CustomerPortalElementProps;
      "foxy-payment-card-field": CardEmbedElementProps;
      "foxy-payment-method-selector": PaymentMethodSelectorElementProps;
      "foxy-side-cart-trigger": SideCartTriggerElementProps;
      "foxy-product-link": ProductLinkElementProps;
      "foxy-product-form": ProductFormElementProps;
      "foxy-product-page": ProductPageElementProps;
      "foxy-product-tile": ProductTileElementProps;
      "foxy-product-collection": ProductCollectionElementProps;
      "apple-pay-button": ApplePayButtonElementProps;
      "google-pay-button": GooglePayButtonElementProps;
    }
  }
}
