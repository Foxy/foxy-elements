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
});
