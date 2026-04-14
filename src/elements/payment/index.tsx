import type {
  AchHostedFieldsTokenizeErrorCode,
  CardEmbedTokenizeErrorCode,
} from "@foxy.io/sdk/checkout";
import type {
  AchFieldElement,
  AchFieldElementConfig,
  AchTokenizeErrorEventDetail,
} from "../ach-field-element";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type {
  CardEmbedElement,
  CardEmbedTokenizeErrorEventDetail,
} from "../card-embed-element";
import type {
  PaymentMethodSelectorBillingAddress,
  PaymentMethodSelectorBillingField,
} from "./billing-address-types";
import type { PaymentMethodSelectorOption } from "./option-types";

import { createElement, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  AmericanExpressFlatRoundedIcon,
  DinersClubFlatRoundedIcon,
  DiscoverFlatRoundedIcon,
  JCBFlatRoundedIcon,
  MaestroFlatRoundedIcon,
  MastercardFlatRoundedIcon,
  UnionPayFlatRoundedIcon,
  VisaFlatRoundedIcon,
} from "react-svg-credit-card-payment-icons";
import { CreditCard, Landmark, Wallet } from "lucide-react";
import applePayMark from "@/assets/payment-marks/apple-pay-mark.svg";
import googlePayMark from "@/assets/payment-marks/google-pay-mark.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { defineAchFieldElement } from "../ach-field-element";
import { defineCardEmbedElement } from "../card-embed-element";
import {
  type HostedFieldStyleAttributes,
  useHostedFieldStyleAttributes,
} from "./style-hooks";
import { StripeCardElementOption } from "./stripe-card-element";
import { StripePaymentElementOption } from "./stripe-payment-element";
import { cn } from "@/lib/utils";
import { defineMessages, useIntl } from "react-intl";
import type { IntlShape, MessageDescriptor } from "react-intl";

const ACH_FIELDS: Array<AchFieldElementConfig["field"]> = [
  "routing_number",
  "account_number",
  "account_type",
  "account_holder_name",
];

const CARD_TYPES = new Set(["new-card", "saved-card", "card"]);
const BILLING_ADDRESS_SUPPORTED_TYPES = new Set([
  "new-card",
  "saved-card",
  "stripe-card-element",
  "stripe-payment-element",
]);

const messages = defineMessages({
  loadingOptions: {
    id: "payment_loading_options",
    defaultMessage: "Loading payment options...",
  },
  paymentMethodsLegend: {
    id: "payment_methods_legend",
    defaultMessage: "Payment methods",
  },
  optionLabelNewCard: {
    id: "payment_option_label_new_card",
    defaultMessage: "New Card",
  },
  optionLabelAch: {
    id: "payment_option_label_ach",
    defaultMessage: "Bank Account (ACH)",
  },
  optionLabelApplePay: {
    id: "payment_option_label_apple_pay",
    defaultMessage: "Apple Pay",
  },
  optionLabelGooglePay: {
    id: "payment_option_label_google_pay",
    defaultMessage: "Google Pay",
  },
  optionLabelRedirect: {
    id: "payment_option_label_redirect",
    defaultMessage: "Continue to Payment Provider",
  },
  optionLabelStripeCardElement: {
    id: "payment_option_label_stripe_card_element",
    defaultMessage: "New Card",
  },
  optionLabelStripePaymentElement: {
    id: "payment_option_label_stripe_payment_element",
    defaultMessage: "New Payment Method",
  },
  optionDescriptionNewCard: {
    id: "payment_option_description_new_card",
    defaultMessage: "Enter your payment card details below.",
  },
  optionDescriptionSavedCard: {
    id: "payment_option_description_saved_card",
    defaultMessage: "Enter your card's security code below.",
  },
  optionDescriptionStripeCardElement: {
    id: "payment_option_description_stripe_card_element",
    defaultMessage: "Enter your payment card details below.",
  },
  optionDescriptionStripePaymentElement: {
    id: "payment_option_description_stripe_payment_element",
    defaultMessage: "Select a payment method and enter your details below.",
  },
  optionDescriptionAch: {
    id: "payment_option_description_ach",
    defaultMessage: "Enter your bank account details below.",
  },
  optionDescriptionApplePay: {
    id: "payment_option_description_apple_pay",
    defaultMessage:
      "Click the Apple Pay button under the order summary to pay.",
  },
  optionDescriptionGooglePay: {
    id: "payment_option_description_google_pay",
    defaultMessage:
      "Click the Google Pay button under the order summary to pay.",
  },
  optionViaGateway: {
    id: "payment_option_via_gateway",
    defaultMessage: "via {gatewayName}",
  },
  savedCardExpiresLabel: {
    id: "payment_saved_card_expires_label",
    defaultMessage: "expires {month}/{year}",
  },
  billingAddressTitle: {
    id: "checkout_billing_address_label",
    defaultMessage: "Billing Address",
  },
  addBillingAddress: {
    id: "payment_add_billing_address",
    defaultMessage: "Add billing address",
  },
  useShippingForBilling: {
    id: "checkout_use_shipping_address_for_billing",
    defaultMessage: "Use shipping address for billing",
  },
  billingFirstName: {
    id: "payment_billing_first_name_label",
    defaultMessage: "First name",
  },
  billingLastName: {
    id: "payment_billing_last_name_label",
    defaultMessage: "Last name",
  },
  billingCompany: {
    id: "payment_billing_company_label",
    defaultMessage: "Company",
  },
  billingAddress1: {
    id: "payment_billing_address1_label",
    defaultMessage: "Address",
  },
  billingAddress2: {
    id: "payment_billing_address2_label",
    defaultMessage: "Address 2",
  },
  billingCity: {
    id: "payment_billing_city_label",
    defaultMessage: "City",
  },
  billingRegion: {
    id: "payment_billing_region_label",
    defaultMessage: "Region",
  },
  billingPostalCode: {
    id: "payment_billing_postal_code_label",
    defaultMessage: "Postal code",
  },
  billingCountry: {
    id: "payment_billing_country_label",
    defaultMessage: "Country",
  },
  billingPhone: {
    id: "payment_billing_phone_label",
    defaultMessage: "Phone",
  },
  achRoutingNumber: {
    id: "payment_ach_routing_number_label",
    defaultMessage: "Routing number",
  },
  achAccountNumber: {
    id: "payment_ach_account_number_label",
    defaultMessage: "Account number",
  },
  achAccountType: {
    id: "payment_ach_account_type_label",
    defaultMessage: "Account type",
  },
  achAccountHolderName: {
    id: "payment_ach_account_holder_name_label",
    defaultMessage: "Name on account",
  },
  cardFieldLabelFull: {
    id: "payment_card_field_label_full",
    defaultMessage: "Card details",
  },
  cardFieldLabelCsc: {
    id: "payment_card_field_label_csc",
    defaultMessage: "Security code",
  },
  tokenizeCardError: {
    id: "payment_tokenize_card_error",
    defaultMessage: "Unable to tokenize card details.",
  },
  tokenizeAchError: {
    id: "payment_tokenize_ach_error",
    defaultMessage: "Unable to tokenize bank details.",
  },
  selectPlaceholder: {
    id: "generic_select_placeholder",
    defaultMessage: "Select",
  },
});

const OPTION_LABEL_BY_TYPE: Partial<Record<string, MessageDescriptor>> = {
  "new-card": messages.optionLabelNewCard,
  ach: messages.optionLabelAch,
  "apple-pay": messages.optionLabelApplePay,
  "google-pay": messages.optionLabelGooglePay,
  generic: messages.optionLabelRedirect,
  "stripe-card-element": messages.optionLabelStripeCardElement,
  "stripe-payment-element": messages.optionLabelStripePaymentElement,
};

const OPTION_DESCRIPTION_BY_TYPE: Partial<Record<string, MessageDescriptor>> = {
  "new-card": messages.optionDescriptionNewCard,
  "saved-card": messages.optionDescriptionSavedCard,
  "stripe-card-element": messages.optionDescriptionStripeCardElement,
  "stripe-payment-element": messages.optionDescriptionStripePaymentElement,
  ach: messages.optionDescriptionAch,
  "apple-pay": messages.optionDescriptionApplePay,
  "google-pay": messages.optionDescriptionGooglePay,
};

const BILLING_FIELD_LABEL_BY_ID: Partial<Record<string, MessageDescriptor>> = {
  "billing-first-name": messages.billingFirstName,
  "billing-last-name": messages.billingLastName,
  "billing-company": messages.billingCompany,
  "billing-address1": messages.billingAddress1,
  "billing-address2": messages.billingAddress2,
  "billing-city": messages.billingCity,
  "billing-region": messages.billingRegion,
  "billing-postal-code": messages.billingPostalCode,
  "billing-country": messages.billingCountry,
  "billing-phone": messages.billingPhone,
};

const ACH_LABEL_BY_FIELD: Partial<
  Record<AchFieldElementConfig["field"], MessageDescriptor>
> = {
  routing_number: messages.achRoutingNumber,
  account_number: messages.achAccountNumber,
  account_type: messages.achAccountType,
  account_holder_name: messages.achAccountHolderName,
};

const GATEWAY_NAME_BY_TYPE: Record<string, string> = {
  // Synced with foxy-sdk checkout PaymentOption gateway types.
  accept_blue: "Accept.blue",
  authorize: "Authorize.NET",
  authorize_cim: "Authorize.NET CIM",
  bambora: "Bambora",
  barclaycard: "Barclaycard",
  beanstream: "Beanstream",
  bluefin: "Bluefin",
  bluepay: "BluePay",
  braintree: "Braintree",
  cardpointe: "CardPointe",
  datacash: "DataCash",
  digitalriver: "Digital River",
  durango: "Durango",
  ems_pay: "EMS Pay",
  epicor_esdm_token: "Epicor ESDM Token",
  eprocessingnetwork: "eProcessingNetwork",
  eway: "eWAY",
  fatzebra: "Fat Zebra",
  firstdata: "First Data",
  firstdata_e4: "First Data E4",
  fosdick: "Fosdick",
  goemerchant: "goEmerchant",
  handepay: "Handepay",
  helcim: "Helcim",
  helcim_commerce: "Helcim Commerce",
  inspire: "Inspire",
  litle: "Litle",
  lucy: "Lucy",
  merchantesolutions: "Merchant e-Solutions",
  migs_anz_egate: "MIGS ANZ eGate",
  migs_commweb: "MIGS CommWeb",
  moneris: "Moneris",
  netbilling: "Netbilling",
  nmi: "NMI",
  nmi_native: "NMI Native",
  orbital_salem: "Orbital Salem",
  orbital_tampa: "Orbital Tampa",
  paperless: "Paperless",
  pawapay: "PawaPay",
  payconex: "PayConex",
  payflowpro: "Payflow Pro",
  paygate: "PayGate",
  payjunction: "PayJunction",
  payleap: "PayLeap",
  payline: "Payline",
  paylinedata: "Payline Data",
  paymentexpress: "Payment Express",
  paymentsense: "Paymentsense",
  paypoint_enterprise: "PayPoint Enterprise",
  paypoint_gateway: "PayPoint Gateway",
  paypoint_metacharge: "PayPoint MetaCharge",
  paytrace: "PayTrace",
  payvector: "PayVector",
  plugnpay: "PlugnPay",
  plugnpay_authnet: "PlugnPay AuthNet",
  propay: "ProPay",
  quantumgateway: "Quantum Gateway",
  quickbook_payments: "QuickBooks Payments",
  quickbooks: "QuickBooks",
  realex: "Realex",
  sagepayments: "Sage Payments",
  securenet: "SecureNet",
  stripe: "Stripe",
  stripe_omnipay: "Stripe OmniPay",
  totalapps: "Total Apps",
  transaction_express: "Transaction Express",
  transfirst: "TransFirst",
  usaepay: "USAePay",
  vanco: "Vanco",
  vantiv_omnipay: "Vantiv OmniPay",
  virtualmerchant: "Virtual Merchant",
  wallee: "Wallee",
  wepay: "WePay",
  westpac: "Westpac",
  xendit: "Xendit",
  accept_blue_ach: "Accept.blue ACH",
  authorize_ach: "Authorize.NET ACH",
  paperless_ach: "Paperless ACH",
  payjunction_ach: "PayJunction ACH",
  vantiv_ach: "Vantiv ACH",
  adyen: "Adyen",
  amazon_fps: "Amazon FPS",
  bitpay: "BitPay",
  cardx: "CardX",
  ccavenue: "CCAvenue",
  coinbase: "Coinbase",
  coinbase_v2: "Coinbase v2",
  comgate: "Comgate",
  curbstone: "Curbstone",
  cybersource_pos: "Cybersource POS",
  cybersource_sa_web: "Cybersource SA Web",
  dibs: "DIBS",
  dwolla: "Dwolla",
  epayments: "ePayments",
  mercadopago: "Mercado Pago",
  migs: "MIGS",
  mollie_omnipay: "Mollie OmniPay",
  ogone: "Ogone",
  paymentexpress_ws: "Payment Express WS",
  payu_omnipay: "PayU OmniPay",
  pesapal: "Pesapal",
  skrill: "Skrill",
  smartscreen: "SmartScreen",
  tazapay: "Tazapay",
  trustcommerce: "TrustCommerce",
  twocheckout: "2Checkout",
  vivawallet_checkout: "Viva Wallet Checkout",
  wigwag: "WigWag",
  worldline_hosted: "Worldline Hosted",
  worldpay_online: "Worldpay Online",
  stripe_connect: "Stripe Connect",
  stripe_connect_charge: "Stripe Connect Charge",
  stripe_v2: "Stripe",
};

const FIELD_STYLE_PROBE_CLASS_NAME =
  "h-8 px-2.5 py-1 text-base font-normal md:text-sm border border-transparent bg-card text-foreground placeholder:text-muted-foreground";

type PaymentController = {
  tokenize: (requestId?: string) => Promise<Record<string, unknown>>;
};

type PaymentProps = {
  options: PaymentMethodSelectorOption[];
  selectedOptionId?: string;
  disabled?: boolean;
  loading?: boolean;
  onSelectionChange?: (
    optionId: string,
    optionType: string | undefined,
  ) => void;
  onControllerReady?: (
    optionId: string,
    controller: PaymentController | null,
  ) => void;
  renderStripeContent?: (params: {
    option: PaymentMethodSelectorOption;
    disabled?: boolean;
    onControllerReady?: (controller: PaymentController | null) => void;
  }) => ReactNode;
  billingAddress?: PaymentMethodSelectorBillingAddress;
  onBillingAddressChange?: (params: {
    optionId: string;
    useShippingAddress: boolean;
    values: Record<string, string>;
  }) => void;
};

function buildInitialBillingValues(
  billingAddress: PaymentMethodSelectorBillingAddress | undefined,
) {
  return Object.fromEntries(
    (billingAddress?.fields ?? []).map((field) => [
      field.id,
      field.value ?? "",
    ]),
  );
}

function getBillingSummaryLines(values: Record<string, string>) {
  const name = [values["billing-first-name"], values["billing-last-name"]]
    .filter(Boolean)
    .join(" ");
  const company = values["billing-company"];
  const address1 = values["billing-address1"];
  const address2 = values["billing-address2"];
  const cityLine = [
    values["billing-city"],
    values["billing-region"],
    values["billing-postal-code"],
    values["billing-country"],
  ]
    .filter(Boolean)
    .join(", ");
  const phone = values["billing-phone"];

  return [name, company, address1, address2, cityLine, phone].filter(Boolean);
}

function getGatewayName(gateway: string): string {
  const normalized = gateway.trim();
  if (!normalized) return "";

  const mappedGateway = GATEWAY_NAME_BY_TYPE[normalized.toLowerCase()];
  return mappedGateway ?? normalized;
}

type PaymentOptionLabel = {
  fullLabel: string;
  baseLabel: string;
  viaLabel?: string;
};

function getBasePaymentOptionLabel(
  option: PaymentMethodSelectorOption,
  intl: IntlShape,
): string {
  const labelDescriptor = option.type
    ? OPTION_LABEL_BY_TYPE[option.type]
    : undefined;
  if (labelDescriptor) {
    return intl.formatMessage(labelDescriptor);
  }

  if (option.type !== "saved-card") {
    return option.label;
  }

  const compactMatch = option.label.match(/^(.*?)\s*••••\s*(\d{4})$/);
  const endingInMatch = option.label.match(/^(.*?)\s+ending\s+in\s+(\d{4})$/i);
  const labelMatch = compactMatch ?? endingInMatch;
  const brandName = labelMatch?.[1]?.trim();
  const last4 = labelMatch?.[2];

  if (!brandName || !last4) {
    return option.label;
  }

  const expiryMatch = option.description?.match(/(\d{1,2})\s*\/\s*(\d{2,4})/);
  if (!expiryMatch) {
    return `${brandName} ••••${last4}`;
  }

  const month = expiryMatch[1].padStart(2, "0");
  const year = expiryMatch[2].slice(-2);
  return `${brandName} ••••${last4}, ${intl.formatMessage(messages.savedCardExpiresLabel, { month, year })}`;
}

function getPaymentOptionLabel(
  option: PaymentMethodSelectorOption,
  typeCounts: Record<string, number>,
  baseLabelCounts: Record<string, number>,
  intl: IntlShape,
): PaymentOptionLabel {
  const baseLabel = getBasePaymentOptionLabel(option, intl);

  const hasDuplicateType = option.type
    ? (typeCounts[option.type] ?? 0) >= 2
    : false;
  const hasDuplicateBaseLabel = (baseLabelCounts[baseLabel] ?? 0) >= 2;

  if (!hasDuplicateType && !hasDuplicateBaseLabel) {
    return { fullLabel: baseLabel, baseLabel };
  }

  if (!option.gateway) {
    return { fullLabel: baseLabel, baseLabel };
  }

  const gatewayName = getGatewayName(option.gateway);
  if (!gatewayName) {
    return { fullLabel: baseLabel, baseLabel };
  }

  const viaLabel = intl.formatMessage(messages.optionViaGateway, {
    gatewayName,
  });
  return {
    fullLabel: `${baseLabel} ${viaLabel}`,
    baseLabel,
    viaLabel,
  };
}

function getPaymentOptionDescription(
  option: PaymentMethodSelectorOption,
  intl: IntlShape,
): string | undefined {
  if (!option.type) return option.description;
  const descriptor = OPTION_DESCRIPTION_BY_TYPE[option.type];
  if (!descriptor) return option.description;
  return intl.formatMessage(descriptor);
}

type CardBrandIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const NEW_CARD_BRAND_ICONS: CardBrandIconComponent[] = [
  VisaFlatRoundedIcon,
  MastercardFlatRoundedIcon,
  AmericanExpressFlatRoundedIcon,
  DiscoverFlatRoundedIcon,
  JCBFlatRoundedIcon,
  DinersClubFlatRoundedIcon,
  UnionPayFlatRoundedIcon,
  MaestroFlatRoundedIcon,
];

const CARD_BRAND_ICON_MAP: Record<string, CardBrandIconComponent> = {
  visa: VisaFlatRoundedIcon,
  mastercard: MastercardFlatRoundedIcon,
  "master card": MastercardFlatRoundedIcon,
  mc: MastercardFlatRoundedIcon,
  "american express": AmericanExpressFlatRoundedIcon,
  amex: AmericanExpressFlatRoundedIcon,
  discover: DiscoverFlatRoundedIcon,
  "diners club": DinersClubFlatRoundedIcon,
  diners: DinersClubFlatRoundedIcon,
  jcb: JCBFlatRoundedIcon,
  unionpay: UnionPayFlatRoundedIcon,
  "union pay": UnionPayFlatRoundedIcon,
  maestro: MaestroFlatRoundedIcon,
};

function getGenericPaymentOptionIcon(icon: ReactNode): ReactNode {
  return (
    <span className="ml-auto inline-flex h-5 items-center" aria-hidden>
      {icon}
    </span>
  );
}

function NewCardBrandCycler({ acceptedBrands }: { acceptedBrands?: string[] }) {
  const icons = useMemo(() => {
    if (!acceptedBrands?.length) return NEW_CARD_BRAND_ICONS;
    const filtered = acceptedBrands
      .map((b) => CARD_BRAND_ICON_MAP[b.toLowerCase()])
      .filter((icon): icon is CardBrandIconComponent => Boolean(icon));
    return filtered.length ? filtered : NEW_CARD_BRAND_ICONS;
  }, [acceptedBrands]);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset to first icon when the brand list changes.
  useEffect(() => {
    setIndex(0);
    setVisible(true);
  }, [icons]);

  useEffect(() => {
    if (icons.length <= 1) return;

    const intervalId = setInterval(() => {
      setVisible(false);
      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % icons.length);
        setVisible(true);
      }, 350);
    }, 2200);

    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [icons]);

  const BrandIcon = icons[index];

  return (
    <span className="ml-auto inline-flex h-5 items-center" aria-hidden>
      <span
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
          display: "inline-flex",
        }}
      >
        <BrandIcon className="h-5 w-auto" />
      </span>
    </span>
  );
}

function getSavedCardBrandIcon(option: PaymentMethodSelectorOption): ReactNode {
  const compactMatch = option.label.match(/^(.*?)\s*••••\s*(\d{4})$/);
  const endingInMatch = option.label.match(/^(.*?)\s+ending\s+in\s+(\d{4})$/i);
  const labelMatch = compactMatch ?? endingInMatch;
  const brandName = labelMatch?.[1]?.trim();
  if (!brandName) return null;

  const BrandIcon = CARD_BRAND_ICON_MAP[brandName.toLowerCase()];
  if (!BrandIcon) return null;

  return (
    <span className="ml-auto inline-flex h-5 items-center" aria-hidden>
      <BrandIcon className="h-5 w-auto" />
    </span>
  );
}

function getPaymentOptionBrandIcon(
  option: PaymentMethodSelectorOption,
): ReactNode {
  if (option.type === "apple-pay") {
    return (
      <span className="ml-auto inline-flex h-5 items-center" aria-hidden>
        <img
          src={applePayMark}
          alt=""
          className="h-5 w-auto"
          loading="lazy"
          decoding="async"
        />
      </span>
    );
  }

  if (option.type === "google-pay") {
    return (
      <span
        className="ml-auto inline-flex h-5 items-center -mr-[0.1em]"
        aria-hidden
      >
        <img
          src={googlePayMark}
          alt=""
          className="h-5 w-auto"
          loading="lazy"
          decoding="async"
        />
      </span>
    );
  }

  if (option.type === "saved-card") {
    return getSavedCardBrandIcon(option);
  }

  if (option.type === "new-card") {
    return <NewCardBrandCycler acceptedBrands={option.acceptedBrands} />;
  }

  if (option.type === "stripe-card-element") {
    return getGenericPaymentOptionIcon(
      <CreditCard className="h-4 w-4 text-muted-foreground" />,
    );
  }

  if (option.type === "ach") {
    return getGenericPaymentOptionIcon(
      <Landmark className="h-4 w-4 text-muted-foreground" />,
    );
  }

  if (option.type === "stripe-payment-element") {
    return getGenericPaymentOptionIcon(
      <Wallet className="h-4 w-4 text-muted-foreground" />,
    );
  }

  return null;
}

function renderBillingField(
  field: PaymentMethodSelectorBillingField,
  disabled: boolean,
  values: Record<string, string>,
  setValues: Dispatch<SetStateAction<Record<string, string>>>,
  intl: IntlShape,
) {
  const value = values[field.id] ?? "";
  const fieldDisabled = disabled || Boolean(field.disabled);

  if (field.type === "select") {
    return (
      <Select
        value={value}
        disabled={fieldDisabled}
        onValueChange={(nextValue) => {
          setValues((prev) => ({ ...prev, [field.id]: nextValue ?? "" }));
        }}
      >
        <SelectTrigger id={field.id} className="w-full">
          <SelectValue
            placeholder={intl.formatMessage(messages.selectPlaceholder)}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={field.type === "tel" ? "tel" : "text"}
      value={value}
      placeholder={field.placeholder}
      disabled={fieldDisabled}
      required={field.required}
      onChange={(event) => {
        const nextValue = event.target.value;
        setValues((prev) => ({ ...prev, [field.id]: nextValue }));
      }}
    />
  );
}

function BillingAddressSection({
  option,
  disabled,
  billingAddress,
  onBillingAddressChange,
}: {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  billingAddress?: PaymentMethodSelectorBillingAddress;
  onBillingAddressChange?: (params: {
    optionId: string;
    useShippingAddress: boolean;
    values: Record<string, string>;
  }) => void;
}) {
  const intl = useIntl();
  const [useShippingAddress, setUseShippingAddress] = useState(
    billingAddress?.useDefaultShippingAddress === "yes-by-default",
  );
  const [showSummaryEditor, setShowSummaryEditor] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialBillingValues(billingAddress),
  );

  const supportsBillingAddress = option.type
    ? BILLING_ADDRESS_SUPPORTED_TYPES.has(option.type)
    : false;

  useEffect(() => {
    setUseShippingAddress(
      billingAddress?.useDefaultShippingAddress === "yes-by-default",
    );
    setShowSummaryEditor(false);
    setValues(buildInitialBillingValues(billingAddress));
  }, [billingAddress, option.id]);

  useEffect(() => {
    if (!supportsBillingAddress || !billingAddress) return;

    onBillingAddressChange?.({
      optionId: option.id,
      useShippingAddress,
      values,
    });
  }, [
    billingAddress,
    onBillingAddressChange,
    option.id,
    supportsBillingAddress,
    useShippingAddress,
    values,
  ]);

  if (
    !billingAddress ||
    !supportsBillingAddress ||
    !billingAddress.fields.length
  ) {
    return null;
  }

  const fieldsMarkup = (
    <FieldSet>
      <FieldGroup>
        {billingAddress.fields.map((field) => {
          const labelDescriptor = BILLING_FIELD_LABEL_BY_ID[field.id];
          const label = labelDescriptor
            ? intl.formatMessage(labelDescriptor)
            : field.label;

          return (
            <Field key={field.id}>
              <FieldLabel htmlFor={field.id}>{label}</FieldLabel>
              {renderBillingField(
                field,
                Boolean(disabled),
                values,
                setValues,
                intl,
              )}
            </Field>
          );
        })}
      </FieldGroup>
    </FieldSet>
  );

  if (option.type === "saved-card") {
    if (showSummaryEditor) {
      return fieldsMarkup;
    }

    const summaryLines = getBillingSummaryLines(values);
    return (
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setShowSummaryEditor(true)}
        className="h-auto w-full items-start justify-start px-3 py-3 text-left"
      >
        <span className="flex flex-col gap-1">
          <span className="font-semibold">
            {intl.formatMessage(messages.billingAddressTitle)}
          </span>
          {summaryLines.length ? (
            summaryLines.map((line) => (
              <span key={line} className="text-sm text-muted-foreground">
                {line}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              {intl.formatMessage(messages.addBillingAddress)}
            </span>
          )}
        </span>
      </Button>
    );
  }

  const hasShippingToggle = Boolean(billingAddress.useDefaultShippingAddress);

  return (
    <div className="flex flex-col gap-2.5">
      {hasShippingToggle ? (
        <Field orientation="horizontal">
          <Checkbox
            id={`use-shipping-address-${option.id}`}
            checked={useShippingAddress}
            disabled={disabled}
            onCheckedChange={(checked) =>
              setUseShippingAddress(Boolean(checked))
            }
            aria-label={intl.formatMessage(messages.useShippingForBilling)}
          />
          <FieldLabel htmlFor={`use-shipping-address-${option.id}`}>
            {intl.formatMessage(messages.useShippingForBilling)}
          </FieldLabel>
        </Field>
      ) : null}

      {(!hasShippingToggle || !useShippingAddress) && fieldsMarkup}
    </div>
  );
}

function CardOptionEmbed({
  option,
  disabled,
  styleAttributes,
  onControllerReady,
}: {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  styleAttributes: HostedFieldStyleAttributes;
  onControllerReady?: (controller: PaymentController | null) => void;
}) {
  const elementRef = useRef<CardEmbedElement | null>(null);
  const [error, setError] = useState<CardEmbedTokenizeErrorCode | null>(null);
  const intl = useIntl();

  useEffect(() => {
    defineCardEmbedElement();
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !option.hostedCard) return;

    element.config = option.hostedCard;
    element.disabled = Boolean(disabled);
    element.readonly = Boolean(disabled);
  }, [disabled, option.hostedCard]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !option.hostedCard) return;

    const controller: PaymentController = {
      tokenize: async (requestId?: string) => {
        const payload = await element.tokenize(requestId);
        return {
          token: payload.token,
          requestId: payload.requestId,
        };
      },
    };

    const onTokenizeSuccess = () => setError(null);
    const onTokenizeError = (event: Event) => {
      const detail = (event as CustomEvent<CardEmbedTokenizeErrorEventDetail>)
        .detail;
      setError(detail.code);
    };

    element.addEventListener("foxy-tokenize-success", onTokenizeSuccess);
    element.addEventListener("foxy-tokenize-error", onTokenizeError);
    onControllerReady?.(controller);

    return () => {
      element.removeEventListener("foxy-tokenize-success", onTokenizeSuccess);
      element.removeEventListener("foxy-tokenize-error", onTokenizeError);
      onControllerReady?.(null);
    };
  }, [onControllerReady, option.hostedCard]);

  if (!option.hostedCard) {
    return null;
  }

  const fieldId = `card-hosted-field-${option.id}`;
  const fieldLabel =
    option.hostedCard.mode === "csc-only"
      ? intl.formatMessage(messages.cardFieldLabelCsc)
      : intl.formatMessage(messages.cardFieldLabelFull);

  return (
    <div className="flex flex-col gap-2">
      <Field>
        <FieldLabel htmlFor={fieldId}>{fieldLabel}</FieldLabel>
      </Field>
      {createElement("foxy-payment-card-field", {
        id: fieldId,
        className:
          "border-input dark:bg-input/30 data-[disabled]:bg-input/50 dark:data-[disabled]:bg-input/80 data-[disabled]:opacity-50 rounded-[var(--radius)] border transition-colors block w-full overflow-hidden",
        "card-input-background": styleAttributes.inputBackground,
        "card-input-placeholder-color": styleAttributes.inputPlaceholderColor,
        "card-input-height": styleAttributes.inputHeight,
        "card-input-padding": styleAttributes.inputPadding,
        "card-input-padding-x": styleAttributes.inputPaddingX,
        "card-input-padding-y": styleAttributes.inputPaddingY,
        "card-input-font": styleAttributes.inputFont,
        "card-input-text-color": styleAttributes.inputTextColor,
        "card-input-text-color-error": styleAttributes.inputTextColorError,
        "card-input-font-size": styleAttributes.inputTextSize,
        ref: (node: Element | null) => {
          elementRef.current = node as CardEmbedElement | null;
        },
      })}
      {error ? (
        <p className="m-0 text-sm text-destructive">
          {intl.formatMessage(messages.tokenizeCardError)}
        </p>
      ) : null}
    </div>
  );
}

function AchOptionEmbed({
  option,
  disabled,
  styleAttributes,
  onControllerReady,
}: {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  styleAttributes: HostedFieldStyleAttributes;
  onControllerReady?: (controller: PaymentController | null) => void;
}) {
  const intl = useIntl();
  const [error, setError] = useState<AchHostedFieldsTokenizeErrorCode | null>(
    null,
  );
  const refs = useRef<
    Partial<Record<AchFieldElementConfig["field"], AchFieldElement | null>>
  >({});
  const sessionId = useMemo(
    () => option.hostedFields?.sessionId ?? crypto.randomUUID(),
    [option.hostedFields?.sessionId],
  );

  useEffect(() => {
    defineAchFieldElement();
  }, []);

  useEffect(() => {
    const fields = option.hostedFields;
    if (!fields) return;

    for (const fieldName of ACH_FIELDS) {
      const element = refs.current[fieldName];
      if (!element) continue;

      element.config = {
        secureOrigin: fields.secureOrigin,
        embedPath: fields.embedPath,
        merchantOrigin: fields.merchantOrigin,
        sessionId,
        field: fieldName,
        label: fields.labels?.[fieldName],
        placeholder: fields.placeholders?.[fieldName],
        ...(fieldName === "account_type"
          ? { accountTypeValues: fields.accountTypeValues }
          : {}),
      };
      element.disabled = Boolean(disabled);
    }
  }, [disabled, option.hostedFields, sessionId]);

  useEffect(() => {
    if (!option.hostedFields) return;

    const firstMounted = ACH_FIELDS.map((field) => refs.current[field]).find(
      Boolean,
    );
    if (!firstMounted) return;

    const controller: PaymentController = {
      tokenize: async (requestId?: string) => {
        const payload = await firstMounted.tokenize(requestId);
        return {
          token: payload.token,
          requestId: payload.requestId,
          last4: payload.last4,
          bankName: payload.bankName,
        };
      },
    };

    const onTokenizeSuccess = () => setError(null);
    const onTokenizeError = (event: Event) => {
      const detail = (event as CustomEvent<AchTokenizeErrorEventDetail>).detail;
      setError(detail.code);
    };

    firstMounted.addEventListener("ach-tokenize-success", onTokenizeSuccess);
    firstMounted.addEventListener("ach-tokenize-error", onTokenizeError);
    onControllerReady?.(controller);

    return () => {
      firstMounted.removeEventListener(
        "ach-tokenize-success",
        onTokenizeSuccess,
      );
      firstMounted.removeEventListener("ach-tokenize-error", onTokenizeError);
      onControllerReady?.(null);
    };
  }, [option.hostedFields, onControllerReady]);

  if (!option.hostedFields) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <FieldSet>
        <FieldGroup>
          {ACH_FIELDS.map((fieldName) => {
            const labelDescriptor = ACH_LABEL_BY_FIELD[fieldName];
            const defaultLabel = labelDescriptor
              ? intl.formatMessage(labelDescriptor)
              : "";
            const label =
              option.hostedFields?.labels?.[fieldName] ?? defaultLabel;

            return (
              <Field key={fieldName}>
                <FieldLabel>{label}</FieldLabel>
                {createElement("foxy-ach-field", {
                  className:
                    "border-input dark:bg-input/30 data-[focused]:border-ring data-[focused]:ring-ring/50 data-[user-invalid]:border-destructive data-[user-invalid]:ring-destructive/20 dark:data-[user-invalid]:ring-destructive/40 data-[user-invalid]:ring-3 data-[focused]:ring-3 data-[disabled]:bg-input/50 dark:data-[disabled]:bg-input/80 data-[disabled]:opacity-50 rounded-lg border transition-colors relative flex w-full min-w-0 items-center overflow-hidden outline-none block min-h-8",
                  style: {
                    "--ach-field-height":
                      styleAttributes.inputHeight ?? "calc(2rem - 2px)",
                  },
                  "ach-input-height": styleAttributes.inputHeight,
                  "ach-input-padding": styleAttributes.inputPadding,
                  "ach-input-padding-x": styleAttributes.inputPaddingX,
                  "ach-input-padding-y": styleAttributes.inputPaddingY,
                  "ach-input-placeholder-color":
                    styleAttributes.inputPlaceholderColor,
                  "ach-input-font": styleAttributes.inputFont,
                  "ach-input-text-color": styleAttributes.inputTextColor,
                  "ach-input-text-color-error":
                    styleAttributes.inputTextColorError,
                  "ach-input-text-size": styleAttributes.inputTextSize,
                  ref: (node: Element | null) => {
                    refs.current[fieldName] = node as AchFieldElement | null;
                  },
                })}
              </Field>
            );
          })}
        </FieldGroup>
      </FieldSet>
      {error ? (
        <p className="m-0 text-sm text-destructive">
          {intl.formatMessage(messages.tokenizeAchError)}
        </p>
      ) : null}
    </div>
  );
}

function PaymentOptionBody({
  option,
  disabled,
  styleAttributes,
  onControllerReady,
  renderStripeContent,
  billingAddress,
  onBillingAddressChange,
}: {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  styleAttributes: HostedFieldStyleAttributes;
  onControllerReady?: (controller: PaymentController | null) => void;
  renderStripeContent?: (params: {
    option: PaymentMethodSelectorOption;
    disabled?: boolean;
    onControllerReady?: (controller: PaymentController | null) => void;
  }) => ReactNode;
  billingAddress?: PaymentMethodSelectorBillingAddress;
  onBillingAddressChange?: (params: {
    optionId: string;
    useShippingAddress: boolean;
    values: Record<string, string>;
  }) => void;
}) {
  const isCard = option.type ? CARD_TYPES.has(option.type) : false;
  const billingSection = (
    <BillingAddressSection
      option={option}
      disabled={disabled}
      billingAddress={billingAddress}
      onBillingAddressChange={onBillingAddressChange}
    />
  );

  if (isCard && option.hostedCard) {
    return (
      <>
        <CardOptionEmbed
          option={option}
          disabled={disabled}
          styleAttributes={styleAttributes}
          onControllerReady={onControllerReady}
        />
        {billingSection}
      </>
    );
  }

  if (option.type === "ach" && option.hostedFields) {
    return (
      <>
        <AchOptionEmbed
          option={option}
          disabled={disabled}
          styleAttributes={styleAttributes}
          onControllerReady={onControllerReady}
        />
        {billingSection}
      </>
    );
  }

  if (option.type === "stripe-card-element" && option.stripeCardElement) {
    if (renderStripeContent) {
      return (
        <>
          {renderStripeContent({ option, disabled, onControllerReady })}
          {billingSection}
        </>
      );
    }

    return (
      <>
        <StripeCardElementOption
          option={option}
          disabled={disabled}
          onControllerReady={onControllerReady}
        />
        {billingSection}
      </>
    );
  }

  if (option.type === "stripe-payment-element" && option.stripePaymentElement) {
    if (renderStripeContent) {
      return (
        <>
          {renderStripeContent({ option, disabled, onControllerReady })}
          {billingSection}
        </>
      );
    }

    return (
      <>
        <StripePaymentElementOption
          option={option}
          disabled={disabled}
          onControllerReady={onControllerReady}
        />
        {billingSection}
      </>
    );
  }

  return billingSection;
}

export function Payment({
  options,
  selectedOptionId,
  disabled,
  loading,
  onSelectionChange,
  onControllerReady,
  renderStripeContent,
  billingAddress,
  onBillingAddressChange,
}: PaymentProps) {
  const intl = useIntl();
  const visibleOptions = options ?? [];
  const hasSingleOption = visibleOptions.length === 1;
  const baseLabelCounts = useMemo(() => {
    return visibleOptions.reduce<Record<string, number>>((counts, option) => {
      const baseLabel = getBasePaymentOptionLabel(option, intl);
      counts[baseLabel] = (counts[baseLabel] ?? 0) + 1;
      return counts;
    }, {});
  }, [intl, visibleOptions]);
  const optionTypeCounts = useMemo(() => {
    return visibleOptions.reduce<Record<string, number>>((counts, option) => {
      if (!option.type) return counts;

      counts[option.type] = (counts[option.type] ?? 0) + 1;
      return counts;
    }, {});
  }, [visibleOptions]);
  const [selection, setSelection] = useState<string>(selectedOptionId ?? "");
  const { probeRef, styleAttributes } = useHostedFieldStyleAttributes();

  // Keep a ref so the notify effect doesn't re-fire just because the parent
  // created a new inline callback reference on every render.
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  // Sync external `selectedOptionId` prop → internal `selection` state.
  // `selection` must NOT be a dep here: adding it would cause the effect to
  // run whenever the user clicks an option, see the stale `selectedOptionId`
  // prop, and immediately revert the selection (the flash).
  useEffect(() => {
    if (!visibleOptions.length) {
      setSelection((prev) => (prev ? "" : prev));
      return;
    }

    if (
      selectedOptionId &&
      visibleOptions.some((option) => option.id === selectedOptionId)
    ) {
      setSelection(selectedOptionId);
      return;
    }

    // Keep the current selection if it is still a valid option; otherwise
    // fall back to the first non-disabled option.
    setSelection((prev) => {
      if (visibleOptions.some((option) => option.id === prev)) return prev;
      const fallback =
        visibleOptions.find((option) => !option.disabled) ?? visibleOptions[0];
      return fallback.id;
    });
  }, [selectedOptionId, visibleOptions]);

  useEffect(() => {
    const selected = visibleOptions.find((option) => option.id === selection);
    if (!selected) return;
    onSelectionChangeRef.current?.(selected.id, selected.type);
  }, [selection, visibleOptions]);

  const [mountedOptionIds, setMountedOptionIds] = useState<Set<string>>(
    () =>
      new Set(
        [selection || selectedOptionId || visibleOptions[0]?.id].filter(
          Boolean,
        ),
      ),
  );

  useEffect(() => {
    if (!selection) return;
    setMountedOptionIds((previous) => {
      if (previous.has(selection)) return previous;
      const next = new Set(previous);
      next.add(selection);
      return next;
    });
  }, [selection]);

  useEffect(() => {
    const validOptionIds = new Set(visibleOptions.map((option) => option.id));
    setMountedOptionIds((previous) => {
      let hasChanges = false;
      const next = new Set<string>();

      previous.forEach((optionId) => {
        if (validOptionIds.has(optionId)) {
          next.add(optionId);
        } else {
          hasChanges = true;
        }
      });

      if (selection && !next.has(selection) && validOptionIds.has(selection)) {
        next.add(selection);
        hasChanges = true;
      }

      return hasChanges ? next : previous;
    });
  }, [selection, visibleOptions]);

  if (!visibleOptions.length) {
    return null;
  }

  if (loading) {
    return (
      <div
        className="flex w-full max-w-[34rem] flex-col gap-2.5"
        aria-live="polite"
      >
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-22 w-full" />
        <p className="m-0 text-sm text-muted-foreground">
          {intl.formatMessage(messages.loadingOptions)}
        </p>
      </div>
    );
  }

  return (
    <FieldSet
      aria-label={intl.formatMessage(messages.paymentMethodsLegend)}
      className="m-0 flex border-0 p-0"
    >
      <FieldLegend className="sr-only">
        {intl.formatMessage(messages.paymentMethodsLegend)}
      </FieldLegend>
      <input
        ref={probeRef}
        tabIndex={-1}
        aria-hidden="true"
        readOnly
        placeholder=""
        value=""
        className={`${FIELD_STYLE_PROBE_CLASS_NAME} pointer-events-none absolute z-[-1] opacity-0`}
      />
      <RadioGroup
        value={selection}
        onValueChange={(value) => setSelection(value)}
        className="w-full"
      >
        {visibleOptions.map((option) => {
          const checked = option.id === selection;
          const mounted = mountedOptionIds.has(option.id);
          const optionDisabled = Boolean(disabled || option.disabled);
          const optionLabel = getPaymentOptionLabel(
            option,
            optionTypeCounts,
            baseLabelCounts,
            intl,
          );
          const optionDescription = getPaymentOptionDescription(option, intl);
          const optionBody = (
            <div className={cn(!hasSingleOption && "px-3 py-3")}>
              <Field orientation="horizontal" data-disabled={optionDisabled}>
                {!hasSingleOption ? (
                  <RadioGroupItem
                    id={`payment-option-${option.id}`}
                    value={option.id}
                    disabled={optionDisabled}
                    aria-label={optionLabel.fullLabel}
                    className="mt-0.5"
                  />
                ) : null}
                <FieldContent className="min-w-0 flex-1 gap-0.5">
                  <FieldLabel
                    htmlFor={`payment-option-${option.id}`}
                    className={cn(
                      "text-sm w-full justify-between",
                      !hasSingleOption &&
                        !checked &&
                        !optionDisabled &&
                        "cursor-pointer",
                    )}
                  >
                    <span>
                      {optionLabel.baseLabel}
                      {optionLabel.viaLabel ? (
                        <span className="text-muted-foreground">
                          {` ${optionLabel.viaLabel}`}
                        </span>
                      ) : null}
                    </span>
                    {!checked && !hasSingleOption
                      ? getPaymentOptionBrandIcon(option)
                      : null}
                  </FieldLabel>
                  {mounted ? (
                    <>
                      {optionDescription ? (
                        <CardDescription
                          className={cn("text-sm", !checked && "hidden")}
                        >
                          {optionDescription}
                        </CardDescription>
                      ) : null}
                      <CardContent
                        className={cn(
                          "flex flex-col gap-3 p-0 empty:hidden",
                          !checked && "hidden",
                          hasSingleOption ? "mt-3" : "mt-3 py-3",
                        )}
                      >
                        <PaymentOptionBody
                          option={option}
                          disabled={optionDisabled}
                          styleAttributes={styleAttributes}
                          onControllerReady={(controller) =>
                            onControllerReady?.(option.id, controller)
                          }
                          renderStripeContent={renderStripeContent}
                          billingAddress={billingAddress}
                          onBillingAddressChange={onBillingAddressChange}
                        />
                      </CardContent>
                    </>
                  ) : null}
                </FieldContent>
              </Field>
            </div>
          );

          if (hasSingleOption) {
            return <div key={option.id}>{optionBody}</div>;
          }

          return (
            <Card
              key={option.id}
              className={cn(
                "gap-0 py-0 transition-colors rounded-[var(--radius)] border border-input ring-0",
                !checked && !optionDisabled && "cursor-pointer hover:bg-muted",
              )}
              data-disabled={optionDisabled}
            >
              {optionBody}
            </Card>
          );
        })}
      </RadioGroup>
    </FieldSet>
  );
}
