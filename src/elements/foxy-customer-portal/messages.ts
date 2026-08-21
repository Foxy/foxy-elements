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
    defaultMessage: "Tax ID: {taxId}",
  },
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
  profileCancel: { id: "portal_profile_cancel", defaultMessage: "Cancel" },
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
  subscriptionPayments: {
    id: "portal_subscription_payments",
    defaultMessage: "Payments",
  },
  subscriptionFrequency: {
    id: "portal_subscription_frequency",
    defaultMessage: "Every {frequency}",
  },
  statusWillStart: {
    id: "portal_status_will_start",
    defaultMessage: "Starts on {start_date}",
  },
  statusWillStartNoStartdate: {
    id: "portal_status_will_start_no_startdate",
    defaultMessage: "Scheduled to start",
  },
  statusWillEnd: {
    id: "portal_status_will_end",
    defaultMessage: "Ends on {end_date}",
  },
  statusWillEndNoEnddate: {
    id: "portal_status_will_end_no_enddate",
    defaultMessage: "Active, scheduled to end",
  },
  statusWillEndAfterPayment: {
    id: "portal_status_will_end_after_payment",
    defaultMessage: "Next payment on {next_transaction_date}, ending {end_date}",
  },
  statusWillEndAfterPaymentNoNextdate: {
    id: "portal_status_will_end_after_payment_no_nextdate",
    defaultMessage: "Active, ending {end_date}",
  },
  statusWillEndAfterPaymentNoEnddate: {
    id: "portal_status_will_end_after_payment_no_enddate",
    defaultMessage: "Next payment on {next_transaction_date}",
  },
  statusNextPayment: {
    id: "portal_status_next_payment",
    defaultMessage: "Next payment on {next_transaction_date}",
  },
  statusNextPaymentNoNextdate: {
    id: "portal_status_next_payment_no_nextdate",
    defaultMessage: "Active",
  },
  statusEnded: {
    id: "portal_status_ended",
    defaultMessage: "Ended on {end_date}",
  },
  statusEndedNoEnddate: {
    id: "portal_status_ended_no_enddate",
    defaultMessage: "Ended",
  },
  statusFailed: {
    id: "portal_status_failed",
    defaultMessage: "Failed on {first_failed_transaction_date}",
  },
  statusFailedAndEnded: {
    id: "portal_status_failed_and_ended",
    defaultMessage:
      "Ended on {end_date} (failed on {first_failed_transaction_date})",
  },
  statusFailedAndEndedNoEnddate: {
    id: "portal_status_failed_and_ended_no_enddate",
    defaultMessage: "Ended (failed on {first_failed_transaction_date})",
  },
  statusInactive: { id: "portal_status_inactive", defaultMessage: "Inactive" },
  subscriptionsHeading: {
    id: "portal_subscriptions_heading",
    defaultMessage: "Subscriptions",
  },
  subscriptionsActive: {
    id: "portal_subscriptions_active",
    defaultMessage: "Active",
  },
  subscriptionsInactive: {
    id: "portal_subscriptions_inactive",
    defaultMessage: "Inactive",
  },
  manageHeading: {
    id: "portal_manage_heading",
    defaultMessage: "Manage subscription",
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
  manageUpdateBilling: {
    id: "portal_manage_update_billing",
    defaultMessage: "Update billing",
  },
  manageId: { id: "portal_manage_id", defaultMessage: "Subscription ID" },
  manageStarted: { id: "portal_manage_started", defaultMessage: "Started" },
  manageEnds: { id: "portal_manage_ends", defaultMessage: "Ends" },
  manageSave: { id: "portal_manage_save", defaultMessage: "Save" },
  manageSaving: { id: "portal_manage_saving", defaultMessage: "Saving..." },
  manageClose: { id: "portal_manage_close", defaultMessage: "Close" },
  manageNextPayment: {
    id: "portal_manage_next_payment",
    defaultMessage: "Next payment date",
  },
  paymentsHeading: {
    id: "portal_payments_heading",
    defaultMessage: "Payments",
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
  orderSummary: {
    id: "portal_order_summary",
    defaultMessage: "#{id} · {summary}",
  },
  orderDetailHeading: {
    id: "portal_order_detail_heading",
    defaultMessage: "Order #{id}",
  },
  orderItemQuantity: {
    id: "portal_order_item_quantity",
    defaultMessage: "Qty {quantity}",
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
  ordersHeading: {
    id: "portal_orders_heading",
    defaultMessage: "Orders",
  },
});
