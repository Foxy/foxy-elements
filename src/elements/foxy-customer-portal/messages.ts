import { defineMessages } from "react-intl";

export const messages = defineMessages({
  missingStoreDomain: {
    id: "portal_missing_store_domain",
    defaultMessage: "Set the store-domain attribute to use this element.",
  },
  loading: {
    id: "portal_loading",
    defaultMessage: "Loading...",
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
});
