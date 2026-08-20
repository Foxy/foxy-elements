export const customerPortalEvents = {
  passwordReset: "passwordreset",
  signIn: "signin",
  signOut: "signout",
} as const;

export type PasswordResetEventDetail = { result: "skipped" | "completed" };
