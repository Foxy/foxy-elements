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
    defaultMessage: "Continue with Payment Provider",
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
  optionLabelTwint: {
    id: "payment_option_label_twint",
    defaultMessage: "TWINT",
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
  optionDescriptionPurchaseOrder: {
    id: "payment_option_description_purchase_order",
    defaultMessage: "Enter your purchase order number below.",
  },
  optionDescriptionAch: {
    id: "payment_option_description_ach",
    defaultMessage: "Enter your bank account details below.",
  },
  optionViaGateway: {
    id: "payment_option_via_gateway",
    defaultMessage: "via {gatewayName}",
  },
  savedCardExpiresLabel: {
    id: "payment_saved_card_expires_label",
    defaultMessage: "expires {month}/{year}",
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
  noPaymentMethods: {
    id: "payment_no_methods_available",
    defaultMessage: "No payment methods are currently available.",
  },
  noPaymentMethodsDescription: {
    id: "payment_no_methods_available_description",
    defaultMessage:
      "Refresh checkout or choose a different payment flow before continuing.",
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
    twint: messages.optionLabelTwint,
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
};
