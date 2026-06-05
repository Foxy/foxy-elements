import { defineMessages } from "react-intl";
import type { MessageDescriptor } from "react-intl";

export const messages = defineMessages({
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
  optionLabelMollie: {
    id: "payment_option_label_mollie",
    defaultMessage: "Pay via Mollie",
  },
  optionLabelSezzle: {
    id: "payment_option_label_sezzle",
    defaultMessage: "Buy Now, Pay Later with Sezzle",
  },
  optionLabelRedirect: {
    id: "payment_option_label_redirect",
    defaultMessage: "Continue to Payment Provider",
  },
  optionLabelPayPal: {
    id: "payment_option_label_paypal",
    defaultMessage: "PayPal",
  },
  optionLabelPayPalPayLater: {
    id: "payment_option_label_paypal_pay_later",
    defaultMessage: "PayPal Pay Later",
  },
  optionLabelPayPalCredit: {
    id: "payment_option_label_paypal_credit",
    defaultMessage: "PayPal Credit",
  },
  optionLabelVenmo: {
    id: "payment_option_label_venmo",
    defaultMessage: "Venmo",
  },
  optionLabelSepa: {
    id: "payment_option_label_sepa",
    defaultMessage: "SEPA",
  },
  optionLabelBancontact: {
    id: "payment_option_label_bancontact",
    defaultMessage: "Bancontact",
  },
  optionLabelEps: {
    id: "payment_option_label_eps",
    defaultMessage: "EPS",
  },
  optionLabelBlik: {
    id: "payment_option_label_blik",
    defaultMessage: "BLIK",
  },
  optionLabelIdeal: {
    id: "payment_option_label_ideal",
    defaultMessage: "iDEAL",
  },
  optionLabelPrzelewy24: {
    id: "payment_option_label_przelewy24",
    defaultMessage: "Przelewy24",
  },
  optionLabelStripeCardElement: {
    id: "payment_option_label_stripe_card_element",
    defaultMessage: "New Card",
  },
  optionLabelStripePaymentElement: {
    id: "payment_option_label_stripe_payment_element",
    defaultMessage: "New Payment Method",
  },
  optionLabelPurchaseOrder: {
    id: "payment_option_label_purchase_order",
    defaultMessage: "Purchase Order",
  },
  optionLabelOnlineBanking: {
    id: "payment_option_label_online_banking",
    defaultMessage: "Online Banking",
  },
  optionLabelCashApp: {
    id: "payment_option_label_cash_app",
    defaultMessage: "Cash App Pay",
  },
  optionLabelAfterpay: {
    id: "payment_option_label_afterpay",
    defaultMessage: "Afterpay",
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
  optionDescriptionAdyenEmbedded: {
    id: "payment_option_description_adyen_embedded",
    defaultMessage: "Enter your payment details below and click the Submit button below the order summary to submit your order.",
  },
  optionDescriptionPurchaseOrder: {
    id: "payment_option_description_purchase_order",
    defaultMessage: "Enter your purchase order number below.",
  },
  optionDescriptionKlarna: {
    id: "payment_option_description_klarna",
    defaultMessage:
      "Pay now, in 30 days, in 4 payments of {installmentAmount}, or as low as {monthlyAmount}/month. Click Continue with Klarna under the order summary to place your order.",
  },
  optionDescriptionKlarnaDefault: {
    id: "payment_option_description_klarna_default",
    defaultMessage:
      "Click Continue with Klarna under the order summary to place your order.",
  },
  optionDescriptionKlarnaPayLater: {
    id: "payment_option_description_klarna_pay_later",
    defaultMessage:
      "Buy now, pay in 30 days. Click Continue with Klarna under the order summary to place your order.",
  },
  optionDescriptionKlarnaPayInX: {
    id: "payment_option_description_klarna_pay_in_x",
    defaultMessage:
      "4 interest-free payments of {installmentAmount}. Click Continue with Klarna under the order summary to place your order.",
  },
  optionDescriptionKlarnaPayOverTime: {
    id: "payment_option_description_klarna_pay_over_time",
    defaultMessage:
      "As low as {monthlyAmount}/month. Click Continue with Klarna under the order summary to place your order.",
  },
  optionDescriptionKlarnaPayNow: {
    id: "payment_option_description_klarna_pay_now",
    defaultMessage:
      "Pay now. Click Continue with Klarna under the order summary to place your order.",
  },
  optionDescriptionAch: {
    id: "payment_option_description_ach",
    defaultMessage: "Enter your bank account details below.",
  },
  optionDescriptionApplePay: {
    id: "payment_option_description_apple_pay",
    defaultMessage:
      "Click the Apple Pay button under the order summary to submit your order.",
  },
  optionDescriptionGooglePay: {
    id: "payment_option_description_google_pay",
    defaultMessage:
      "Click the Google Pay button under the order summary to submit your order.",
  },
  optionDescriptionMollie: {
    id: "payment_option_description_mollie",
    defaultMessage:
      "Click Continue to Mollie under the order summary to pay.",
  },
  optionDescriptionSezzle: {
    id: "payment_option_description_sezzle",
    defaultMessage:
      "Click the Sezzle button under the order summary to submit your order.",
  },
  optionDescriptionPayPal: {
    id: "payment_option_description_paypal",
    defaultMessage:
      "Click the PayPal button under the order summary to submit your order.",
  },
  optionDescriptionPayPalPayLater: {
    id: "payment_option_description_paypal_pay_later",
    defaultMessage:
      "Click the PayPal Pay Later button under the order summary to submit your order.",
  },
  optionDescriptionPayPalCredit: {
    id: "payment_option_description_paypal_credit",
    defaultMessage:
      "Click the PayPal Credit button under the order summary to submit your order.",
  },
  optionDescriptionVenmo: {
    id: "payment_option_description_venmo",
    defaultMessage:
      "Click the Venmo button under the order summary to submit your order.",
  },
  optionDescriptionSepa: {
    id: "payment_option_description_sepa",
    defaultMessage:
      "Click the SEPA button under the order summary to submit your order.",
  },
  optionDescriptionBancontact: {
    id: "payment_option_description_bancontact",
    defaultMessage:
      "Click the Bancontact button under the order summary to submit your order.",
  },
  optionDescriptionEps: {
    id: "payment_option_description_eps",
    defaultMessage:
      "Click the EPS button under the order summary to submit your order.",
  },
  optionDescriptionBlik: {
    id: "payment_option_description_blik",
    defaultMessage:
      "Click the BLIK button under the order summary to submit your order.",
  },
  optionDescriptionIdeal: {
    id: "payment_option_description_ideal",
    defaultMessage:
      "Click the iDEAL button under the order summary to submit your order.",
  },
  optionDescriptionPrzelewy24: {
    id: "payment_option_description_przelewy24",
    defaultMessage:
      "Click the Przelewy24 button under the order summary to submit your order.",
  },
  optionDescriptionAlipay: {
    id: "payment_option_description_alipay",
    defaultMessage:
      "Click the Alipay button below the order summary to submit your order.",
  },
  optionDescriptionPaysafecard: {
    id: "payment_option_description_paysafecard",
    defaultMessage:
      "Click the Paysafecard button below the order summary to submit your order.",
  },
  optionDescriptionCashApp: {
    id: "payment_option_description_cash_app",
    defaultMessage:
      "Click the Cash App Pay button below the order summary to submit your order.",
  },
  optionDescriptionWeChat: {
    id: "payment_option_description_we_chat",
    defaultMessage:
      "Click the WeChat Pay button below the order summary to submit your order.",
  },
  optionDescriptionBankTransfer: {
    id: "payment_option_description_bank_transfer",
    defaultMessage:
      "Click the bank transfer button below the order summary to submit your order.",
  },
  optionDescriptionBizum: {
    id: "payment_option_description_bizum",
    defaultMessage:
      "Click the Bizum button below the order summary to submit your order.",
  },
  optionDescriptionZip: {
    id: "payment_option_description_zip",
    defaultMessage:
      "Click the Zip button below the order summary to submit your order.",
  },
  optionDescriptionSwish: {
    id: "payment_option_description_swish",
    defaultMessage:
      "Click the Swish button below the order summary to submit your order.",
  },
  optionDescriptionVipps: {
    id: "payment_option_description_vipps",
    defaultMessage:
      "Click the Vipps button below the order summary to submit your order.",
  },
  optionDescriptionZipPos: {
    id: "payment_option_description_zip_pos",
    defaultMessage:
      "Click the Zip POS button below the order summary to submit your order.",
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
  achOwnerConfirmationLabel: {
    id: "payment_ach_owner_confirmation_label",
    defaultMessage: "I'm the owner of this account",
  },
  achOwnerConfirmationError: {
    id: "payment_ach_owner_confirmation_error",
    defaultMessage: "Please confirm that you own this account.",
  },
  purchaseOrderNumberLabel: {
    id: "payment_purchase_order_number_label",
    defaultMessage: "Purchase order number",
  },
  purchaseOrderNumberPlaceholder: {
    id: "payment_purchase_order_number_placeholder",
    defaultMessage: "Enter purchase order number",
  },
  purchaseOrderNumberRequired: {
    id: "payment_purchase_order_number_required",
    defaultMessage: "Purchase order number is required.",
  },
  purchaseOrderNumberTooLong: {
    id: "payment_purchase_order_number_too_long",
    defaultMessage:
      "Purchase order number must be {maxLength} characters or less.",
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
  klarnaLoading: {
    id: "payment_klarna_loading",
    defaultMessage: "Loading Klarna...",
  },
  klarnaUnavailable: {
    id: "payment_klarna_unavailable",
    defaultMessage: "This Klarna option is currently unavailable.",
  },
  klarnaLoadError: {
    id: "payment_klarna_load_error",
    defaultMessage:
      "Unable to load Klarna. Choose a different payment method or try again.",
  },
  klarnaAuthorizeError: {
    id: "payment_klarna_authorize_error",
    defaultMessage:
      "Klarna couldn't authorize this payment. Review your details and try again.",
  },
  klarnaFinalizeError: {
    id: "payment_klarna_finalize_error",
    defaultMessage: "Klarna couldn't finalize this payment. Try again.",
  },
  adyenLoading: {
    id: "payment_adyen_loading",
    defaultMessage: "Loading payment details...",
  },
  adyenUnavailable: {
    id: "payment_adyen_unavailable",
    defaultMessage: "This payment method is currently unavailable.",
  },
  adyenLoadError: {
    id: "payment_adyen_load_error",
    defaultMessage:
      "Unable to load this payment method. Choose a different payment method or try again.",
  },
  adyenSubmitError: {
    id: "payment_adyen_submit_error",
    defaultMessage: "Unable to submit this payment method. Try again.",
  },
  optionDescriptionSquareUpAfterpay: {
    id: "payment_option_description_square_up_afterpay",
    defaultMessage:
      "Click the Afterpay button under the order summary to submit your order.",
  },
  optionDescriptionSquareUpAch: {
    id: "payment_option_description_square_up_ach",
    defaultMessage:
      "Click the Submit button under the order summary to submit your order.",
  },
  squareUpLoading: {
    id: "payment_square_up_loading",
    defaultMessage: "Loading payment details...",
  },
  squareUpLoadError: {
    id: "payment_square_up_load_error",
    defaultMessage:
      "Unable to load this payment method. Choose a different payment method or try again.",
  },
  squareUpSubmitError: {
    id: "payment_square_up_submit_error",
    defaultMessage: "Unable to submit this payment method. Try again.",
  },
  billingAddressUpdateError: {
    id: "payment_billing_update_error",
    defaultMessage: "Unable to update billing address. Try again.",
  },
  noPaymentMethods: {
    id: "payment_no_methods_available",
    defaultMessage: "No payment methods are currently available.",
  },
  noPaymentMethodsDescription: {
    id: "payment_no_methods_available_description",
    defaultMessage:
      "Refresh checkout or choose a different payment flow before continuing.",
  },
  selectPlaceholder: {
    id: "generic_select_placeholder",
    defaultMessage: "Select",
  },
});

export const OPTION_LABEL_BY_TYPE: Partial<Record<string, MessageDescriptor>> =
  {
    "new-card": messages.optionLabelNewCard,
    ach: messages.optionLabelAch,
    "apple-pay": messages.optionLabelApplePay,
    "google-pay": messages.optionLabelGooglePay,
    mollie: messages.optionLabelMollie,
    sezzle: messages.optionLabelSezzle,
    paypal: messages.optionLabelPayPal,
    "paypal-pay-later": messages.optionLabelPayPalPayLater,
    "paypal-credit": messages.optionLabelPayPalCredit,
    venmo: messages.optionLabelVenmo,
    sepa: messages.optionLabelSepa,
    bancontact: messages.optionLabelBancontact,
    eps: messages.optionLabelEps,
    blik: messages.optionLabelBlik,
    ideal: messages.optionLabelIdeal,
    przelewy24: messages.optionLabelPrzelewy24,
    "purchase-order": messages.optionLabelPurchaseOrder,
    generic: messages.optionLabelRedirect,
    "stripe-card-element": messages.optionLabelStripeCardElement,
    "stripe-payment-element": messages.optionLabelStripePaymentElement,
    dragonpay: messages.optionLabelOnlineBanking,
    "online-banking-pl": messages.optionLabelOnlineBanking,
    "online-banking-cz": messages.optionLabelOnlineBanking,
    "online-banking-fi": messages.optionLabelOnlineBanking,
    "online-banking-sk": messages.optionLabelOnlineBanking,
    "online-banking-in": messages.optionLabelOnlineBanking,
    "cash-app": messages.optionLabelCashApp,
    afterpay: messages.optionLabelAfterpay,
  };

export const OPTION_DESCRIPTION_BY_TYPE: Partial<
  Record<string, MessageDescriptor>
> = {
  "new-card": messages.optionDescriptionNewCard,
  "saved-card": messages.optionDescriptionSavedCard,
  "stripe-card-element": messages.optionDescriptionStripeCardElement,
  "stripe-payment-element": messages.optionDescriptionStripePaymentElement,
  "purchase-order": messages.optionDescriptionPurchaseOrder,
  ach: messages.optionDescriptionAch,
  "apple-pay": messages.optionDescriptionApplePay,
  "google-pay": messages.optionDescriptionGooglePay,
  mollie: messages.optionDescriptionMollie,
  sezzle: messages.optionDescriptionSezzle,
  paypal: messages.optionDescriptionPayPal,
  "paypal-pay-later": messages.optionDescriptionPayPalPayLater,
  "paypal-credit": messages.optionDescriptionPayPalCredit,
  venmo: messages.optionDescriptionVenmo,
  sepa: messages.optionDescriptionSepa,
  bancontact: messages.optionDescriptionBancontact,
  eps: messages.optionDescriptionEps,
  blik: messages.optionDescriptionBlik,
  ideal: messages.optionDescriptionIdeal,
  przelewy24: messages.optionDescriptionPrzelewy24,
  alipay: messages.optionDescriptionAlipay,
  paysafecard: messages.optionDescriptionPaysafecard,
  "cash-app": messages.optionDescriptionCashApp,
  swish: messages.optionDescriptionSwish,
  vipps: messages.optionDescriptionVipps,
  "we-chat": messages.optionDescriptionWeChat,
  "we-chat-qr": messages.optionDescriptionWeChat,
  "we-chat-web": messages.optionDescriptionWeChat,
  "we-chat-mini-program": messages.optionDescriptionWeChat,
  "bank-transfer": messages.optionDescriptionBankTransfer,
  bizum: messages.optionDescriptionBizum,
  zip: messages.optionDescriptionZip,
  "zip-pos": messages.optionDescriptionZipPos,
};

export const BILLING_FIELD_LABEL_BY_ID: Partial<
  Record<string, MessageDescriptor>
> = {
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

export const BILLING_SECTION_MESSAGES = {
  billingAddressTitle: messages.billingAddressTitle,
  addBillingAddress: messages.addBillingAddress,
  useShippingForBilling: messages.useShippingForBilling,
  selectPlaceholder: messages.selectPlaceholder,
  billingAddressUpdateError: messages.billingAddressUpdateError,
};
