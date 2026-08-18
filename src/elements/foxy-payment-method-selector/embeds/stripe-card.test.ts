import { describe, expect, it } from "vitest";

import { StripeCardElementOption } from "../stripe/card-option";
import StripeCardEmbed from "./stripe-card";

/**
 * This file is only a re-export, but it is the module the selector lazy-loads
 * for the Stripe Card Element option (`view.tsx`, `lazy(() => import(...))`).
 * `React.lazy` resolves the module's *default* export and throws at render time
 * if there is none, so dropping or renaming it breaks the option in the browser
 * with no build error — the dynamic import hides the mismatch from the type
 * system.
 */
describe("stripe-card embed module", () => {
  it("default-exports the Stripe Card Element option", () => {
    expect(StripeCardEmbed).toBe(StripeCardElementOption);
  });

  it("default-exports something React.lazy can render", () => {
    expect(StripeCardEmbed).toBeTypeOf("function");
  });
});
