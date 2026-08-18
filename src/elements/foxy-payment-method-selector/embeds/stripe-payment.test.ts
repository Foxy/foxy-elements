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

  // The two Stripe embeds are separate options with separate SDK setups: the
  // Card Element tokenizes a card, `stripe_v2` mounts deferred and confirms an
  // intent the backend creates. A copy-paste in either re-export would point
  // both option types at the same component.
  it("is a different component from the Stripe Card Element embed", async () => {
    const cardEmbed = (await import("./stripe-card")).default;

    expect(StripePaymentEmbed).not.toBe(cardEmbed);
  });
});
