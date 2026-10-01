import { describe, expect, it } from "vitest";

import { StripePaymentElementOption } from "../stripe/payment-option";
import StripePaymentEmbed from "./stripe-payment";

/**
 * This file is only a re-export, but it is the module the selector lazy-loads
 * for the `stripe_v2` option (`view.tsx`, `lazy(() => import(...))`).
 * `React.lazy` resolves the module's *default* export and throws at render time
 * if there is none, so dropping or renaming it breaks the option in the browser
 * with no build error — the dynamic import hides the mismatch from the type
 * system.
 */
describe("stripe-payment embed module", () => {
  it("default-exports the Stripe Payment Element option", () => {
    expect(StripePaymentEmbed).toBe(StripePaymentElementOption);
  });

  it("default-exports something React.lazy can render", () => {
    expect(StripePaymentEmbed).toBeTypeOf("function");
  });
});
