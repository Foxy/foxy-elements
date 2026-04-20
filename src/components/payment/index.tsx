import type {
  AchHostedFieldsTokenizeErrorCode,
  CardEmbedTokenizeErrorCode,
} from "@foxy.io/sdk/checkout";
import type {
  AchHostedFieldName,
  AchFieldElement,
  AchTokenizationErrorEventDetail,
} from "../../elements/ach-field-element";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type {
  PaymentCardFieldElement,
} from "../../elements/payment-card-field-element";
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
import {
  type HostedFieldStyleAttributes,
  useHostedFieldStyleAttributes,
} from "./style-hooks";
import { StripeCardElementOption } from "./stripe-card-element";
import { StripePaymentElementOption } from "./stripe-payment-element";
import { cn } from "@/lib/utils";
import { defineMessages, useIntl } from "react-intl";
import type { IntlShape, MessageDescriptor } from "react-intl";

const ACH_FIELDS: AchHostedFieldName[] = [
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
  Record<AchHostedFieldName, MessageDescriptor>
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

function ApplePayMarkIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg
      version="1.1"
      id="Artwork"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="165.52107px"
      height="105.9651px"
      viewBox="0 0 165.52107 105.9651"
      enableBackground="new 0 0 165.52107 105.9651"
      xmlSpace="preserve"
      className={className}
    >
      <g>
        <path
          id="XMLID_4_"
          d="M150.69807,0H14.82318c-0.5659,0-1.1328,0-1.69769,0.0033c-0.47751,0.0034-0.95391,0.0087-1.43031,0.0217
    c-1.039,0.0281-2.0869,0.0894-3.1129,0.2738c-1.0424,0.1876-2.0124,0.4936-2.9587,0.9754
    c-0.9303,0.4731-1.782,1.0919-2.52009,1.8303c-0.73841,0.7384-1.35721,1.5887-1.83021,2.52
    c-0.4819,0.9463-0.7881,1.9166-0.9744,2.9598c-0.18539,1.0263-0.2471,2.074-0.2751,3.1119
    c-0.0128,0.4764-0.01829,0.9528-0.0214,1.4291c-0.0033,0.5661-0.0022,1.1318-0.0022,1.6989V91.142
    c0,0.5671-0.0011,1.13181,0.0022,1.69901c0.00311,0.4763,0.0086,0.9527,0.0214,1.4291
    c0.028,1.03699,0.08971,2.08469,0.2751,3.11069c0.1863,1.0436,0.4925,2.0135,0.9744,2.9599
    c0.473,0.9313,1.0918,1.7827,1.83021,2.52c0.73809,0.7396,1.58979,1.3583,2.52009,1.8302
    c0.9463,0.4831,1.9163,0.7892,2.9587,0.9767c1.026,0.1832,2.0739,0.2456,3.1129,0.2737c0.4764,0.0108,0.9528,0.0172,1.43031,0.0194
    c0.56489,0.0044,1.13179,0.0044,1.69769,0.0044h135.87489c0.5649,0,1.13181,0,1.69659-0.0044
    c0.47641-0.0022,0.95282-0.0086,1.4314-0.0194c1.0368-0.0281,2.0845-0.0905,3.11301-0.2737
    c1.041-0.1875,2.0112-0.4936,2.9576-0.9767c0.9313-0.4719,1.7805-1.0906,2.52011-1.8302c0.7372-0.7373,1.35599-1.5887,1.8302-2.52
    c0.48299-0.9464,0.78889-1.9163,0.97429-2.9599c0.1855-1.026,0.2457-2.0737,0.2738-3.11069
    c0.013-0.4764,0.01941-0.9528,0.02161-1.4291c0.00439-0.5672,0.00439-1.1319,0.00439-1.69901V14.8242
    c0-0.5671,0-1.1328-0.00439-1.6989c-0.0022-0.4763-0.00861-0.9527-0.02161-1.4291c-0.02811-1.0379-0.0883-2.0856-0.2738-3.1119
    c-0.18539-1.0432-0.4913-2.0135-0.97429-2.9598c-0.47421-0.9313-1.093-1.7816-1.8302-2.52
    c-0.73961-0.7384-1.58881-1.3572-2.52011-1.8303c-0.9464-0.4818-1.9166-0.7878-2.9576-0.9754
    c-1.0285-0.1844-2.0762-0.2457-3.11301-0.2738c-0.47858-0.013-0.95499-0.0183-1.4314-0.0217C151.82988,0,151.26297,0,150.69807,0
    L150.69807,0z"
        />
        <path
          id="XMLID_3_"
          fill="#FFFFFF"
          d="M150.69807,3.532l1.67149,0.0032c0.4528,0.0032,0.90561,0.0081,1.36092,0.0205
    c0.79201,0.0214,1.71849,0.0643,2.58209,0.2191c0.7507,0.1352,1.38029,0.3408,1.9845,0.6484
    c0.5965,0.3031,1.14301,0.7003,1.62019,1.1768c0.479,0.4797,0.87671,1.0271,1.18381,1.6302
    c0.30589,0.5995,0.51019,1.2261,0.64459,1.9823c0.1544,0.8542,0.1971,1.7832,0.21881,2.5801
    c0.01219,0.4498,0.01819,0.8996,0.0204,1.3601c0.00429,0.5569,0.0042,1.1135,0.0042,1.6715V91.142
    c0,0.558,0.00009,1.1136-0.0043,1.6824c-0.00211,0.4497-0.0081,0.8995-0.0204,1.3501c-0.02161,0.7957-0.0643,1.7242-0.2206,2.5885
    c-0.13251,0.7458-0.3367,1.3725-0.64429,1.975c-0.30621,0.6016-0.70331,1.1484-1.18022,1.6251
    c-0.47989,0.48-1.0246,0.876-1.62819,1.1819c-0.5997,0.3061-1.22821,0.51151-1.97151,0.6453
    c-0.88109,0.157-1.84639,0.2002-2.57339,0.2199c-0.4574,0.0103-0.9126,0.01649-1.37889,0.0187
    c-0.55571,0.0043-1.1134,0.0042-1.6692,0.0042H14.82318c-0.0074,0-0.0146,0-0.0221,0c-0.5494,0-1.0999,0-1.6593-0.0043
    c-0.4561-0.00211-0.9112-0.0082-1.3512-0.0182c-0.7436-0.0201-1.7095-0.0632-2.5834-0.2193
    c-0.74969-0.1348-1.3782-0.3402-1.9858-0.6503c-0.59789-0.3032-1.1422-0.6988-1.6223-1.1797
    c-0.4764-0.4756-0.8723-1.0207-1.1784-1.6232c-0.3064-0.6019-0.5114-1.2305-0.64619-1.9852
    c-0.15581-0.8626-0.19861-1.7874-0.22-2.5777c-0.01221-0.4525-0.01731-0.9049-0.02021-1.3547l-0.0022-1.3279l0.0001-0.3506V14.8242
    l-0.0001-0.3506l0.0021-1.3251c0.003-0.4525,0.0081-0.9049,0.02031-1.357c0.02139-0.7911,0.06419-1.7163,0.22129-2.5861
    c0.1336-0.7479,0.3385-1.3765,0.6465-1.9814c0.3037-0.5979,0.7003-1.1437,1.17921-1.6225
    c0.477-0.4772,1.02309-0.8739,1.62479-1.1799c0.6011-0.3061,1.2308-0.5116,1.9805-0.6465c0.8638-0.1552,1.7909-0.198,2.5849-0.2195
    c0.4526-0.0123,0.9052-0.0172,1.3544-0.0203l1.6771-0.0033H150.69807"
        />
        <g>
          <g>
            <path
              d="M45.1862,35.64053c1.41724-1.77266,2.37897-4.15282,2.12532-6.58506c-2.07464,0.10316-4.60634,1.36871-6.07207,3.14276
        c-1.31607,1.5192-2.4809,3.99902-2.17723,6.3293C41.39111,38.72954,43.71785,37.36345,45.1862,35.64053"
            />
            <path
              d="M47.28506,38.98252c-3.38211-0.20146-6.25773,1.91951-7.87286,1.91951c-1.61602,0-4.08931-1.81799-6.76438-1.76899
        c-3.48177,0.05114-6.71245,2.01976-8.4793,5.15079c-3.63411,6.2636-0.95904,15.55471,2.57494,20.65606
        c1.71618,2.5238,3.78447,5.30269,6.50976,5.20287c2.57494-0.10104,3.58421-1.66732,6.71416-1.66732
        c3.12765,0,4.03679,1.66732,6.76252,1.61681c2.82665-0.05054,4.59381-2.52506,6.30997-5.05132
        c1.96878-2.877,2.77473-5.65498,2.82542-5.80748c-0.0507-0.05051-5.45058-2.12204-5.50065-8.33358
        c-0.05098-5.20101,4.23951-7.6749,4.44144-7.82832C52.3832,39.4881,48.5975,39.08404,47.28506,38.98252"
            />
          </g>
          <g>
            <path
              d="M76.73385,31.94381c7.35096,0,12.4697,5.06708,12.4697,12.44437c0,7.40363-5.22407,12.49704-12.65403,12.49704h-8.13892
        v12.94318h-5.88037v-37.8846H76.73385z M68.41059,51.9493h6.74732c5.11975,0,8.0336-2.75636,8.0336-7.53479
        c0-4.77792-2.91385-7.50845-8.00727-7.50845h-6.77365V51.9493z"
            />
            <path
              d="M90.73997,61.97864c0-4.8311,3.70182-7.79761,10.26583-8.16526l7.56061-0.44614v-2.12639
        c0-3.07185-2.07423-4.90959-5.53905-4.90959c-3.28251,0-5.33041,1.57492-5.82871,4.04313h-5.35574
        c0.31499-4.98859,4.56777-8.66407,11.3941-8.66407c6.69466,0,10.97377,3.54432,10.97377,9.08388v19.03421h-5.43472v-4.54194
        h-0.13065c-1.60125,3.07185-5.09341,5.01441-8.71623,5.01441C94.52078,70.30088,90.73997,66.94038,90.73997,61.97864z
        M108.56641,59.4846v-2.17905l-6.8,0.41981c-3.38683,0.23649-5.30306,1.73291-5.30306,4.09579
        c0,2.41504,1.99523,3.99046,5.04075,3.99046C105.46823,65.81161,108.56641,63.08108,108.56641,59.4846z"
            />
            <path
              d="M119.34167,79.9889v-4.5946c0.4193,0.10483,1.36425,0.10483,1.83723,0.10483c2.6252,0,4.04313-1.10245,4.90908-3.9378
        c0-0.05267,0.49931-1.68025,0.49931-1.70658l-9.97616-27.64562h6.14268l6.98432,22.47371h0.10432l6.98433-22.47371h5.9857
        l-10.34483,29.06304c-2.36186,6.69517-5.0924,8.84789-10.81577,8.84789C121.17891,80.12006,119.76098,80.06739,119.34167,79.9889z"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

function GooglePayMarkIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg
      width="752"
      height="400"
      viewBox="0 0 752 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M552 0H200C90 0 0 90 0 200C0 310 90 400 200 400H552C662 400 752 310 752 200C752 90 662 0 552 0Z"
        fill="white"
      />
      <path
        d="M552 16.2C576.7 16.2 600.7 21.1 623.3 30.7C645.2 40 664.8 53.3 681.8 70.2C698.7 87.1 712 106.8 721.3 128.7C730.9 151.3 735.8 175.3 735.8 200C735.8 224.7 730.9 248.7 721.3 271.3C712 293.2 698.7 312.8 681.8 329.8C664.9 346.7 645.2 360 623.3 369.3C600.7 378.9 576.7 383.8 552 383.8H200C175.3 383.8 151.3 378.9 128.7 369.3C106.8 360 87.2 346.7 70.2 329.8C53.3 312.9 40 293.2 30.7 271.3C21.1 248.7 16.2 224.7 16.2 200C16.2 175.3 21.1 151.3 30.7 128.7C40 106.8 53.3 87.2 70.2 70.2C87.1 53.3 106.8 40 128.7 30.7C151.3 21.1 175.3 16.2 200 16.2H552ZM552 0H200C90 0 0 90 0 200C0 310 90 400 200 400H552C662 400 752 310 752 200C752 90 662 0 552 0Z"
        fill="#3C4043"
      />
      <path
        d="M358.6 214.2V274.7H339.4V125.3H390.3C403.2 125.3 414.2 129.6 423.2 138.2C432.4 146.8 437 157.3 437 169.7C437 182.4 432.4 192.9 423.2 201.4C414.3 209.9 403.3 214.1 390.3 214.1H358.6V214.2ZM358.6 143.7V195.8H390.7C398.3 195.8 404.7 193.2 409.7 188.1C414.8 183 417.4 176.8 417.4 169.8C417.4 162.9 414.8 156.8 409.7 151.7C404.7 146.4 398.4 143.8 390.7 143.8H358.6V143.7Z"
        fill="#3C4043"
      />
      <path
        d="M487.2 169.1C501.4 169.1 512.6 172.9 520.8 180.5C529 188.1 533.1 198.5 533.1 211.7V274.7H514.8V260.5H514C506.1 272.2 495.5 278 482.3 278C471 278 461.6 274.7 454 268C446.4 261.3 442.6 253 442.6 243C442.6 232.4 446.6 224 454.6 217.8C462.6 211.5 473.3 208.4 486.6 208.4C498 208.4 507.4 210.5 514.7 214.7V210.3C514.7 203.6 512.1 198 506.8 193.3C501.5 188.6 495.3 186.3 488.2 186.3C477.5 186.3 469 190.8 462.8 199.9L445.9 189.3C455.2 175.8 469 169.1 487.2 169.1ZM462.4 243.3C462.4 248.3 464.5 252.5 468.8 255.8C473 259.1 478 260.8 483.7 260.8C491.8 260.8 499 257.8 505.3 251.8C511.6 245.8 514.8 238.8 514.8 230.7C508.8 226 500.5 223.6 489.8 223.6C482 223.6 475.5 225.5 470.3 229.2C465 233.1 462.4 237.8 462.4 243.3Z"
        fill="#3C4043"
      />
      <path
        d="M637.5 172.4L573.5 319.6H553.7L577.5 268.1L535.3 172.4H556.2L586.6 245.8H587L616.6 172.4H637.5Z"
        fill="#3C4043"
      />
      <path
        d="M282.23 202C282.23 195.74 281.67 189.75 280.63 183.99H200.15V216.99L246.5 217C244.62 227.98 238.57 237.34 229.3 243.58V264.99H256.89C273 250.08 282.23 228.04 282.23 202Z"
        fill="#4285F4"
      />
      <path
        d="M229.31 243.58C221.63 248.76 211.74 251.79 200.17 251.79C177.82 251.79 158.86 236.73 152.07 216.43H123.61V238.51C137.71 266.49 166.69 285.69 200.17 285.69C223.31 285.69 242.75 278.08 256.9 264.98L229.31 243.58Z"
        fill="#34A853"
      />
      <path
        d="M149.39 200.05C149.39 194.35 150.34 188.84 152.07 183.66V161.58H123.61C117.78 173.15 114.5 186.21 114.5 200.05C114.5 213.89 117.79 226.95 123.61 238.52L152.07 216.44C150.34 211.26 149.39 205.75 149.39 200.05Z"
        fill="#FABB05"
      />
      <path
        d="M200.17 148.3C212.8 148.3 224.11 152.65 233.04 161.15L257.49 136.72C242.64 122.89 223.28 114.4 200.17 114.4C166.7 114.4 137.71 133.6 123.61 161.58L152.07 183.66C158.86 163.36 177.82 148.3 200.17 148.3Z"
        fill="#E94235"
      />
    </svg>
  );
}

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
        <ApplePayMarkIcon className="h-5 w-auto" />
      </span>
    );
  }

  if (option.type === "google-pay") {
    return (
      <span
        className="ml-auto inline-flex h-5 items-center -mr-[0.1em]"
        aria-hidden
      >
        <GooglePayMarkIcon className="h-5 w-auto" />
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
  const elementRef = useRef<PaymentCardFieldElement | null>(null);
  const [error, setError] = useState<CardEmbedTokenizeErrorCode | null>(null);
  const intl = useIntl();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !option.hostedCard) return;

    element.secureOrigin = option.hostedCard.secureOrigin;
    element.mode = option.hostedCard.mode;
    element.templateSetId = option.hostedCard.templateSetId;
    element.demoMode = option.hostedCard.demoMode;
    element.translations = option.hostedCard.translations;
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
      const detail = (event as CustomEvent<{ code: CardEmbedTokenizeErrorCode }>).detail;
      setError(detail.code);
    };

    element.addEventListener("tokenizationsuccess", onTokenizeSuccess);
    element.addEventListener("tokenizationerror", onTokenizeError);
    onControllerReady?.(controller);

    return () => {
      element.removeEventListener("tokenizationsuccess", onTokenizeSuccess);
      element.removeEventListener("tokenizationerror", onTokenizeError);
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
        mode: option.hostedCard.mode,
        "secure-origin": option.hostedCard.secureOrigin,
        "template-set-id": option.hostedCard.templateSetId,
        "demo-mode": option.hostedCard.demoMode,
        className:
          "border-input dark:bg-input/30 data-[focused]:border-ring data-[focused]:ring-ring/50 data-[user-invalid]:border-destructive data-[user-invalid]:ring-destructive/20 dark:data-[user-invalid]:ring-destructive/40 data-[user-invalid]:ring-3 data-[focused]:ring-3 data-[disabled]:bg-input/50 dark:data-[disabled]:bg-input/80 data-[disabled]:opacity-50 rounded-[var(--radius)] border transition-colors block w-full overflow-hidden",
        "theme-background": styleAttributes.inputBackground,
        "theme-input-placeholder-color": styleAttributes.inputPlaceholderColor,
        "theme-input-height": styleAttributes.inputHeight,
        "theme-input-padding": styleAttributes.inputPadding,
        "theme-input-padding-x": styleAttributes.inputPaddingX,
        "theme-input-padding-y": styleAttributes.inputPaddingY,
        "theme-font-sans": styleAttributes.inputFont,
        "theme-input-text-color": styleAttributes.inputTextColor,
        "theme-input-error-text-color": styleAttributes.inputTextColorError,
        "theme-input-font-size": styleAttributes.inputTextSize,
        ref: (node: Element | null) => {
          elementRef.current = node as PaymentCardFieldElement | null;
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
  const refs = useRef<Partial<Record<AchHostedFieldName, AchFieldElement | null>>>({});
  const sessionId = useMemo(
    () => option.hostedFields?.sessionId ?? crypto.randomUUID(),
    [option.hostedFields?.sessionId],
  );

  useEffect(() => {
    const fields = option.hostedFields;
    if (!fields) return;

    for (const fieldName of ACH_FIELDS) {
      const element = refs.current[fieldName];
      if (!element) continue;

      element.secureOrigin = fields.secureOrigin;
      element.sessionId = sessionId;
      element.field = fieldName;
      element.label = fields.labels?.[fieldName];
      element.placeholder = fields.placeholders?.[fieldName];
      element.accountTypeValues =
        fieldName === "account_type" ? fields.accountTypeValues : undefined;
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
      const detail = (event as CustomEvent<AchTokenizationErrorEventDetail>).detail;
      setError(detail.code);
    };

    firstMounted.addEventListener("tokenizationsuccess", onTokenizeSuccess);
    firstMounted.addEventListener("tokenizationerror", onTokenizeError);
    onControllerReady?.(controller);

    return () => {
      firstMounted.removeEventListener(
        "tokenizationsuccess",
        onTokenizeSuccess,
      );
      firstMounted.removeEventListener("tokenizationerror", onTokenizeError);
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
                  "theme-input-height": styleAttributes.inputHeight,
                  "theme-input-padding": styleAttributes.inputPadding,
                  "theme-input-padding-x": styleAttributes.inputPaddingX,
                  "theme-input-padding-y": styleAttributes.inputPaddingY,
                  "theme-input-placeholder-color":
                    styleAttributes.inputPlaceholderColor,
                  "theme-font-sans": styleAttributes.inputFont,
                  "theme-input-text-color": styleAttributes.inputTextColor,
                  "theme-input-error-text-color":
                    styleAttributes.inputTextColorError,
                  "theme-input-font-size": styleAttributes.inputTextSize,
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
