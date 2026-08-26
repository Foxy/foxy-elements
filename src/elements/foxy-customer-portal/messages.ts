import { defineMessages } from "react-intl";

export const messages = defineMessages({
  missingStoreDomain: {
    id: "portal_missing_store_domain",
    defaultMessage: "Set the store-domain attribute to use this element.",
  },
  signInHeading: { id: "portal_sign_in_heading", defaultMessage: "Sign in" },
  signInEmail: { id: "portal_sign_in_email", defaultMessage: "Email" },
  signInPassword: {
    id: "portal_sign_in_password",
    defaultMessage: "Password",
  },
  signInSubmit: { id: "portal_sign_in_submit", defaultMessage: "Sign in" },
  signInBusy: {
    id: "portal_sign_in_busy",
    defaultMessage: "Signing in...",
  },
  signInRecover: {
    id: "portal_sign_in_recover",
    defaultMessage: "Forgot password?",
  },
  signInCreate: {
    id: "portal_sign_in_create",
    defaultMessage: "Create an account",
  },
  errorUnauthorized: {
    id: "portal_error_unauthorized",
    defaultMessage: "Wrong email or password.",
  },
  errorUnknown: {
    id: "portal_error_unknown",
    defaultMessage: "Something went wrong. Please try again.",
  },
  validationRequired: {
    id: "portal_validation_required",
    defaultMessage: "This field is required.",
  },
  validationMaxLength: {
    id: "portal_validation_max_length",
    defaultMessage: "Must be {max} characters or fewer.",
  },
  validationEmail: {
    id: "portal_validation_email",
    defaultMessage: "Enter a valid email address.",
  },
  recoverHeading: {
    id: "portal_recover_heading",
    defaultMessage: "Recover access",
  },
  recoverHint: {
    id: "portal_recover_hint",
    defaultMessage: "We'll email you a link to get back into your account.",
  },
  recoverSubmit: { id: "portal_recover_submit", defaultMessage: "Send email" },
  recoverBusy: { id: "portal_recover_busy", defaultMessage: "Sending..." },
  recoverDone: {
    id: "portal_recover_done",
    defaultMessage: "If that email is registered, a message is on its way.",
  },
  recoverBack: {
    id: "portal_recover_back",
    defaultMessage: "Back to sign in",
  },
  passwordResetHeading: {
    id: "portal_password_reset_heading",
    defaultMessage: "Choose a new password",
  },
  passwordResetHint: {
    id: "portal_password_reset_hint",
    defaultMessage: "You signed in with a temporary password.",
  },
  passwordNew: { id: "portal_password_new", defaultMessage: "New password" },
  passwordConfirm: {
    id: "portal_password_confirm",
    defaultMessage: "Confirm password",
  },
  passwordMismatch: {
    id: "portal_password_mismatch",
    defaultMessage: "Passwords do not match.",
  },
  passwordSave: { id: "portal_password_save", defaultMessage: "Save password" },
  passwordSaving: { id: "portal_password_saving", defaultMessage: "Saving..." },
  passwordSkip: { id: "portal_password_skip", defaultMessage: "Skip for now" },
  signUpHeading: {
    id: "portal_sign_up_heading",
    defaultMessage: "Create an account",
  },
  signUpFirstName: {
    id: "portal_sign_up_first_name",
    defaultMessage: "First name",
  },
  signUpLastName: {
    id: "portal_sign_up_last_name",
    defaultMessage: "Last name",
  },
  signUpSubmit: {
    id: "portal_sign_up_submit",
    defaultMessage: "Create account",
  },
  signUpBusy: {
    id: "portal_sign_up_busy",
    defaultMessage: "Creating account...",
  },
  signUpBack: {
    id: "portal_sign_up_back",
    defaultMessage: "Back to sign in",
  },
  signUpVerificationPending: {
    id: "portal_sign_up_verification_pending",
    defaultMessage: "Complete the verification challenge to continue.",
  },
  errorEmailTaken: {
    id: "portal_error_email_taken",
    defaultMessage: "That email is already registered.",
  },
  errorInvalidForm: {
    id: "portal_error_invalid_form",
    defaultMessage: "Please check the form and try again.",
  },
  headerEditProfile: {
    id: "portal_header_edit_profile",
    defaultMessage: "Edit profile",
  },
  headerSignOut: { id: "portal_header_sign_out", defaultMessage: "Sign out" },
  headerTaxId: {
    id: "portal_header_tax_id",
    defaultMessage: "Tax ID {taxId}",
  },
  back: { id: "portal_back", defaultMessage: "Back" },
  profileHeading: {
    id: "portal_profile_heading",
    defaultMessage: "Edit profile",
  },
  profileFirstName: {
    id: "portal_profile_first_name",
    defaultMessage: "First name",
  },
  profileLastName: {
    id: "portal_profile_last_name",
    defaultMessage: "Last name",
  },
  profileTaxId: { id: "portal_profile_tax_id", defaultMessage: "Tax ID" },
  profileSave: { id: "portal_profile_save", defaultMessage: "Save" },
  profileSaving: { id: "portal_profile_saving", defaultMessage: "Saving..." },
  profileChangePassword: {
    id: "portal_profile_change_password",
    defaultMessage: "Change password",
  },
  passwordCurrent: {
    id: "portal_password_current",
    defaultMessage: "Current password",
  },
  errorWrongCurrentPassword: {
    id: "portal_error_wrong_current_password",
    defaultMessage: "That is not your current password.",
  },
  accountLoadFailed: {
    id: "portal_account_load_failed",
    defaultMessage: "We couldn't load your account. Please try again.",
  },
  retry: { id: "portal_retry", defaultMessage: "Try again" },
  headerSignOutFailed: {
    id: "portal_header_sign_out_failed",
    defaultMessage: "Sign out failed",
  },
  signUpCheckEmail: {
    id: "portal_sign_up_check_email",
    defaultMessage:
      "Your account is ready. Check your email for the password we generated for you, then sign in.",
  },
  errorSignInAfterSignUp: {
    id: "portal_error_sign_in_after_sign_up",
    defaultMessage:
      "Your account was created, but we couldn't sign you in. Please sign in with your new password.",
  },
  subscriptionManage: {
    id: "portal_subscription_manage",
    defaultMessage: "Manage",
  },
  // The price and its billing period read as one value ("$24.00/mo"), so the
  // period is a suffix on the price rather than a sentence of its own. One
  // message per unit because the plural category applies to that unit's own
  // noun -- a single message could not pluralise "month" and "week" from the
  // same `count`.
  subscriptionPricePerDay: {
    id: "portal_subscription_price_per_day",
    defaultMessage: "{price}/{count, plural, one {day} other {# days}}",
  },
  subscriptionPricePerWeek: {
    id: "portal_subscription_price_per_week",
    defaultMessage: "{price}/{count, plural, one {wk} other {# weeks}}",
  },
  subscriptionPricePerMonth: {
    id: "portal_subscription_price_per_month",
    defaultMessage: "{price}/{count, plural, one {mo} other {# months}}",
  },
  subscriptionPricePerYear: {
    id: "portal_subscription_price_per_year",
    defaultMessage: "{price}/{count, plural, one {yr} other {# years}}",
  },
  // Standalone frequency labels, for the rail's Select and its read-only
  // row. Separate from the `subscriptionPricePer*` set above, which are
  // price SUFFIXES ("$42.00/wk") and read wrongly on their own.
  subscriptionFrequencyDaily: {
    id: "portal_subscription_frequency_daily",
    defaultMessage: "{count, plural, one {Daily} other {Every # days}}",
  },
  subscriptionFrequencyWeekly: {
    id: "portal_subscription_frequency_weekly",
    defaultMessage: "{count, plural, one {Weekly} other {Every # weeks}}",
  },
  subscriptionFrequencyMonthly: {
    id: "portal_subscription_frequency_monthly",
    defaultMessage: "{count, plural, one {Monthly} other {Every # months}}",
  },
  subscriptionFrequencyYearly: {
    id: "portal_subscription_frequency_yearly",
    defaultMessage: "{count, plural, one {Yearly} other {Every # years}}",
  },
  // Foxy's ".5m". Takes no count -- the generic path would say "Every 0.5
  // months", which reads like a bug rather than a billing period.
  subscriptionFrequencyTwiceMonthly: {
    id: "portal_subscription_frequency_twice_monthly",
    defaultMessage: "Twice a month",
  },
  subscriptionLastPayment: {
    id: "portal_subscription_last_payment",
    defaultMessage: "Last payment",
  },
  subscriptionLastPaymentView: {
    id: "portal_subscription_last_payment_view",
    defaultMessage: "View",
  },
  subscriptionStartDate: {
    id: "portal_subscription_start_date",
    defaultMessage: "Start date",
  },
  subscriptionNextPayment: {
    id: "portal_subscription_next_payment",
    defaultMessage: "Next payment",
  },
  subscriptionCancels: {
    id: "portal_subscription_cancels",
    defaultMessage: "Cancels",
  },
  subscriptionEnded: {
    id: "portal_subscription_ended",
    defaultMessage: "Ended",
  },
  subscriptionId: {
    id: "portal_subscription_id",
    defaultMessage: "Subscription ID",
  },
  subscriptionTitleId: {
    id: "portal_subscription_title_id",
    defaultMessage: "(#{id})",
  },
  subscriptionStatusActive: {
    id: "portal_subscription_status_active",
    defaultMessage: "Active",
  },
  subscriptionStatusPastDue: {
    id: "portal_subscription_status_past_due",
    defaultMessage: "Past due",
  },
  subscriptionStatusEnded: {
    id: "portal_subscription_status_ended",
    defaultMessage: "Ended",
  },
  subscriptionStatusScheduled: {
    id: "portal_subscription_status_scheduled",
    defaultMessage: "Scheduled",
  },
  subscriptionEndedNote: {
    id: "portal_subscription_ended_note",
    defaultMessage: "Ended on {date}. No further payments will be taken.",
  },
  // Used when `cart_display_config.show_sub_enddate` is off, the same gate
  // the rail's Ends row and the cancel-scheduled note use. The substance of
  // the note -- it ended, nothing more will be charged -- is what the
  // customer needs; only the date the store chose to hide drops.
  subscriptionEndedNoteNoDate: {
    id: "portal_subscription_ended_note_no_date",
    defaultMessage:
      "This subscription has ended. No further payments will be taken.",
  },
  subscriptionPastDueTitle: {
    id: "portal_subscription_past_due_title",
    defaultMessage: "Payment failed",
  },
  subscriptionPastDueBody: {
    id: "portal_subscription_past_due_body",
    defaultMessage:
      "A payment of {amount} could not be taken. Update your payment method on the portal home page to continue using this subscription.",
  },
  // Used when the API reports a failed payment but no `past_due_amount`.
  // Naming a $0.00 figure there would state a number the store never sent,
  // and the rail's own Past due row already hides itself for exactly that
  // case -- so the alert drops the amount clause rather than the alert.
  subscriptionPastDueBodyNoAmount: {
    id: "portal_subscription_past_due_body_no_amount",
    defaultMessage:
      "A payment could not be taken. Update your payment method on the portal home page to continue using this subscription.",
  },
  // The two above end with spec §6.2's call to action, which only makes
  // sense while the subscription is still running. These two are for
  // `failed_and_ended`: the payment failed, but the subscription is over,
  // so there is nothing to "continue using" and nothing worth fixing. They
  // report what happened and stop -- the header's "No further payments will
  // be taken." note four lines above says the rest.
  subscriptionPastDueEndedBody: {
    id: "portal_subscription_past_due_ended_body",
    defaultMessage:
      "A payment of {amount} could not be taken before this subscription ended.",
  },
  subscriptionPastDueEndedBodyNoAmount: {
    id: "portal_subscription_past_due_ended_body_no_amount",
    defaultMessage:
      "A payment could not be taken before this subscription ended.",
  },
  subscriptionsHeading: {
    id: "portal_subscriptions_heading",
    defaultMessage: "Subscriptions",
  },
  subscriptionsActive: {
    id: "portal_subscriptions_active",
    defaultMessage: "Active ({count})",
  },
  subscriptionsInactive: {
    id: "portal_subscriptions_inactive",
    defaultMessage: "Inactive ({count})",
  },
  manageFrequency: {
    id: "portal_manage_frequency",
    defaultMessage: "Frequency",
  },
  manageCancel: {
    id: "portal_manage_cancel",
    defaultMessage: "Cancel subscription",
  },
  manageModify: { id: "portal_manage_modify", defaultMessage: "Modify items" },
  manageEnds: { id: "portal_manage_ends", defaultMessage: "Ends" },
  manageNextPayment: {
    id: "portal_manage_next_payment",
    defaultMessage: "Next payment date",
  },
  manageNextPaymentEmpty: {
    id: "portal_manage_next_payment_empty",
    defaultMessage: "Choose a date",
  },
  subscriptionItemsHeading: {
    id: "portal_subscription_items_heading",
    defaultMessage: "Items ({count})",
  },
  subscriptionItemWeight: {
    id: "portal_subscription_item_weight",
    defaultMessage: "Weight",
  },
  subscriptionItemCode: {
    id: "portal_subscription_item_code",
    defaultMessage: "Code",
  },
  subscriptionBillingHeading: {
    id: "portal_subscription_billing_heading",
    defaultMessage: "Billing & shipping",
  },
  subscriptionPaymentMethodLabel: {
    id: "portal_subscription_payment_method_label",
    defaultMessage: "Payment method",
  },
  subscriptionPaymentMethodNote: {
    id: "portal_subscription_payment_method_note",
    defaultMessage:
      "Your default payment method is charged for this subscription. Change it on the portal home page.",
  },
  subscriptionShippingLabel: {
    id: "portal_subscription_shipping_label",
    defaultMessage: "Shipping address",
  },
  subscriptionSummaryHeading: {
    id: "portal_subscription_summary_heading",
    defaultMessage: "Summary",
  },
  subscriptionSummaryShipping: {
    id: "portal_subscription_summary_shipping",
    defaultMessage: "Shipping",
  },
  subscriptionSummaryTax: {
    id: "portal_subscription_summary_tax",
    defaultMessage: "Tax",
  },
  subscriptionSummaryTotal: {
    id: "portal_subscription_summary_total",
    defaultMessage: "Recurring total",
  },
  subscriptionSummaryPastDue: {
    id: "portal_subscription_summary_past_due",
    defaultMessage: "Past due",
  },
  subscriptionStarted: {
    id: "portal_subscription_started",
    defaultMessage: "Started",
  },
  subscriptionSaveNote: {
    id: "portal_subscription_save_note",
    defaultMessage: "Changes save immediately and apply to the next payment.",
  },
  // Replaces the note while a write is in flight, in the same slot, so the
  // one line under the controls always says what is going on. The slot is
  // `aria-live`, so this is what a screen reader hears when a change starts.
  subscriptionSaving: {
    id: "portal_subscription_saving",
    defaultMessage: "Saving your change...",
  },
  // Save-specific rather than the generic `errorUnknown`: with no Save button
  // the customer needs telling that the control went back to its old value,
  // which a bare "something went wrong" does not convey.
  subscriptionSaveFailed: {
    id: "portal_subscription_save_failed",
    defaultMessage: "We could not save that change, so it has been undone. Please try again.",
  },
  // Explains why the Cancel link is inert once a cancellation is already
  // queued. Tied to that link by `aria-describedby`, so a screen reader is
  // told the reason and not just "unavailable".
  subscriptionCancelScheduled: {
    id: "portal_subscription_cancel_scheduled",
    defaultMessage: "This subscription is already scheduled to end on {date}.",
  },
  // Used when `cart_display_config.show_sub_enddate` is off. The link is
  // still inert and the customer still needs to know why, so the note stays
  // -- it just cannot name the date the store chose to hide.
  subscriptionCancelScheduledNoDate: {
    id: "portal_subscription_cancel_scheduled_no_date",
    defaultMessage: "This subscription is already scheduled to end.",
  },
  subscriptionAccessUntil: {
    id: "portal_subscription_access_until",
    defaultMessage: "Access continues until {date}.",
  },
  paymentsEmpty: {
    id: "portal_payments_empty",
    defaultMessage: "No payments yet.",
  },
  paymentsReceipt: {
    id: "portal_payments_receipt",
    defaultMessage: "Receipt",
  },
  paymentStatusCompleted: {
    id: "portal_payment_status_completed",
    defaultMessage: "Completed",
  },
  paymentStatusProcessing: {
    id: "portal_payment_status_processing",
    defaultMessage: "Processing",
  },
  paymentStatusPaid: {
    id: "portal_payment_status_paid",
    defaultMessage: "Paid",
  },
  paymentStatusApproved: {
    id: "portal_payment_status_approved",
    defaultMessage: "Approved",
  },
  paymentStatusAuthorized: {
    id: "portal_payment_status_authorized",
    defaultMessage: "Authorized",
  },
  paymentStatusPending: {
    id: "portal_payment_status_pending",
    defaultMessage: "Pending",
  },
  paymentStatusProblem: {
    id: "portal_payment_status_problem",
    defaultMessage: "Payment issue",
  },
  paymentStatusUnderReview: {
    id: "portal_payment_status_under_review",
    defaultMessage: "Under review",
  },
  paymentStatusRejected: {
    id: "portal_payment_status_rejected",
    defaultMessage: "Rejected",
  },
  paymentStatusDeclined: {
    id: "portal_payment_status_declined",
    defaultMessage: "Declined",
  },
  paymentStatusRefunding: {
    id: "portal_payment_status_refunding",
    defaultMessage: "Refund in progress",
  },
  paymentStatusRefunded: {
    id: "portal_payment_status_refunded",
    defaultMessage: "Refunded",
  },
  paymentStatusVoided: {
    id: "portal_payment_status_voided",
    defaultMessage: "Voided",
  },
  paymentStatusVerified: {
    id: "portal_payment_status_verified",
    defaultMessage: "Verified",
  },
  // Payment-history column headings. The order id and the item summary are
  // their own columns now, so the combined "#{id} · {summary}" line the rows
  // used to render has no reader left.
  ordersColumnOrder: {
    id: "portal_orders_column_order",
    defaultMessage: "Order",
  },
  ordersColumnDate: {
    id: "portal_orders_column_date",
    defaultMessage: "Date",
  },
  ordersColumnSummary: {
    id: "portal_orders_column_summary",
    defaultMessage: "Summary",
  },
  ordersColumnAmount: {
    id: "portal_orders_column_amount",
    defaultMessage: "Amount",
  },
  ordersColumnStatus: {
    id: "portal_orders_column_status",
    defaultMessage: "Status",
  },
  orderDetailHeading: {
    id: "portal_order_detail_heading",
    defaultMessage: "Order #{id}",
  },
  // `price` is the item's already-formatted unit price (not a line total --
  // see `order-page.tsx`), so this reads as "2 × $20.00 each" rather than
  // implying the number is what the line cost.
  orderItemQuantity: {
    id: "portal_order_item_quantity",
    defaultMessage: "{quantity} × {price} each",
  },
  orderItemsTotal: {
    id: "portal_order_items_total",
    defaultMessage: "Items",
  },
  orderTax: {
    id: "portal_order_tax",
    defaultMessage: "Tax",
  },
  orderShipping: {
    id: "portal_order_shipping",
    defaultMessage: "Shipping",
  },
  orderTotal: {
    id: "portal_order_total",
    defaultMessage: "Total",
  },
  orderReceipt: {
    id: "portal_order_receipt",
    defaultMessage: "Receipt",
  },
  paymentHistoryHeading: {
    id: "portal_payment_history_heading",
    defaultMessage: "Payment history",
  },
  billingShippingHeading: {
    id: "portal_billing_shipping_heading",
    defaultMessage: "Billing & Shipping",
  },
  savedAddressesHeading: {
    id: "portal_saved_addresses_heading",
    defaultMessage: "Saved addresses",
  },
  billingAddressHeading: {
    id: "portal_billing_address_heading",
    defaultMessage: "Billing address",
  },
  shippingAddressHeading: {
    id: "portal_shipping_address_heading",
    defaultMessage: "Shipping address",
  },
  noBillingAddress: {
    id: "portal_no_billing_address",
    defaultMessage: "No billing address set.",
  },
  noShippingAddress: {
    id: "portal_no_shipping_address",
    defaultMessage: "No shipping address set.",
  },
  addressDefaultBilling: {
    id: "portal_address_default_billing",
    defaultMessage: "Default billing",
  },
  addressDefaultShipping: {
    id: "portal_address_default_shipping",
    defaultMessage: "Default shipping",
  },
  addressEdit: {
    id: "portal_address_edit",
    defaultMessage: "Edit",
  },
  addressEditHeading: {
    id: "portal_address_edit_heading",
    defaultMessage: "Edit address",
  },
  addressLabel: {
    id: "portal_address_label",
    defaultMessage: "Address label",
  },
  addressFirstName: {
    id: "portal_address_first_name",
    defaultMessage: "First name",
  },
  addressLastName: {
    id: "portal_address_last_name",
    defaultMessage: "Last name",
  },
  addressCompany: {
    id: "portal_address_company",
    defaultMessage: "Company",
  },
  addressPhone: {
    id: "portal_address_phone",
    defaultMessage: "Phone",
  },
  addressLine1: {
    id: "portal_address_line1",
    defaultMessage: "Address line 1",
  },
  addressLine2: {
    id: "portal_address_line2",
    defaultMessage: "Address line 2",
  },
  addressCity: {
    id: "portal_address_city",
    defaultMessage: "City",
  },
  addressPostalCode: {
    id: "portal_address_postal_code",
    defaultMessage: "Postal code",
  },
  addressSave: {
    id: "portal_address_save",
    defaultMessage: "Save",
  },
  addressSaving: {
    id: "portal_address_saving",
    defaultMessage: "Saving...",
  },
  addressCountry: {
    id: "portal_address_country",
    defaultMessage: "Country",
  },
  addressRegion: {
    id: "portal_address_region",
    defaultMessage: "Region",
  },
  addressRegionPlaceholder: {
    id: "portal_address_region_placeholder",
    defaultMessage: "Select a region",
  },
  paginationPrevious: {
    id: "portal_pagination_previous",
    defaultMessage: "Previous",
  },
  paginationNext: {
    id: "portal_pagination_next",
    defaultMessage: "Next",
  },
  paymentMethodsHeading: {
    id: "portal_payment_methods_heading",
    defaultMessage: "Payment methods ({count})",
  },
  paymentMethodsEmpty: {
    id: "portal_payment_methods_empty",
    defaultMessage: "No payment method on file.",
  },
  paymentMethodsExpires: {
    id: "portal_payment_methods_expires",
    defaultMessage: "Expires {month}/{year}",
  },
});
