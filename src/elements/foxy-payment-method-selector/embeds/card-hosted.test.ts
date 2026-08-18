import { createElement } from "react";
import { describe, expect, it } from "vitest";

import type { PaymentCardFieldElement } from "../../foxy-payment-card-field/element";
import type { HostedFieldStyleAttributes } from "../stripe/style-hooks";
import type { PaymentController } from "../types";
import CardOptionEmbed from "./card-hosted";
import {
  controllerSink,
  mountEmbed,
  optionWith,
  rejection,
  settled,
} from "./test-utils";

const FULL_FIELD_LABEL = "Card details";
const CSC_FIELD_LABEL = "Security code";
const TOKENIZE_ERROR = "We could not read that card.";

const STYLE_ATTRIBUTES: HostedFieldStyleAttributes = {
  inputBackground: "#ffffff",
  inputPlaceholderColor: "#8a8a8a",
  inputFont: "400 1rem/1.5 Inter, sans-serif",
  inputTextColor: "#111111",
  inputTextColorError: "#cc0000",
};

type EmbedPropOverrides = {
  mode?: "card" | "card_csc";
  templateSetId?: number;
  hostedCard?: false;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
};

function embed(overrides: EmbedPropOverrides = {}) {
  return createElement(CardOptionEmbed, {
    option: optionWith({
      id: "hosted-card",
      hostedCard:
        overrides.hostedCard === false
          ? undefined
          : {
              mode: overrides.mode ?? "card",
              templateSetId: overrides.templateSetId,
            },
    }),
    disabled: overrides.disabled,
    styleAttributes: STYLE_ATTRIBUTES,
    onControllerReady: overrides.onControllerReady,
    fullFieldLabel: FULL_FIELD_LABEL,
    cscFieldLabel: CSC_FIELD_LABEL,
    tokenizeErrorMessage: TOKENIZE_ERROR,
  });
}

function fieldIn(container: HTMLElement): PaymentCardFieldElement {
  const field = container.querySelector<PaymentCardFieldElement>(
    "foxy-payment-card-field",
  );

  if (!field) throw new Error("The hosted card field did not render.");
  return field;
}

/**
 * Replaces the hosted field's `tokenize` with a stub. The real one posts to the
 * embed iframe and waits for it to answer, which never happens here — and the
 * point of these tests is the mapping the embed does around that call, not the
 * hosted field's own protocol (covered by its element test).
 */
function stubTokenize(
  field: PaymentCardFieldElement,
  result: Partial<Awaited<ReturnType<PaymentCardFieldElement["tokenize"]>>>,
): void {
  Object.defineProperty(field, "tokenize", {
    configurable: true,
    value: async () => result,
  });
}

describe("CardOptionEmbed", () => {
  it("renders nothing when the option carries no hosted card config", async () => {
    const mounted = await mountEmbed(embed({ hostedCard: false }));

    expect(
      mounted.container.querySelector("foxy-payment-card-field"),
    ).toBeNull();

    await mounted.unmount();
  });

  it("pushes the option's mode and template set onto the hosted field", async () => {
    const mounted = await mountEmbed(
      embed({ mode: "card_csc", templateSetId: 42 }),
    );

    const field = fieldIn(mounted.container);

    expect(field.mode).toBe("card_csc");
    expect(field.templateSetId).toBe(42);

    await mounted.unmount();
  });

  // The two modes collect different things — a whole card versus three or four
  // digits — so a shopper re-entering a security code must not be asked for
  // "Card details".
  it("labels the field by mode", async () => {
    const mounted = await mountEmbed(embed({ mode: "card" }));

    expect(mounted.container.querySelector("label")?.textContent).toBe(
      FULL_FIELD_LABEL,
    );
    expect(fieldIn(mounted.container).hasAttribute("data-csc-only")).toBe(
      false,
    );

    await mounted.render(embed({ mode: "card_csc" }));

    expect(mounted.container.querySelector("label")?.textContent).toBe(
      CSC_FIELD_LABEL,
    );
    // The width cap is keyed off this attribute rather than the element's own
    // reflected `mode`, which stays absent while the mode is the default.
    expect(fieldIn(mounted.container).getAttribute("data-csc-only")).toBe(
      "true",
    );

    await mounted.unmount();
  });

  it("forwards the disabled state to the hosted field", async () => {
    const mounted = await mountEmbed(embed({ disabled: true }));

    expect(fieldIn(mounted.container).disabled).toBe(true);

    await mounted.unmount();
  });

  it("passes the resolved style attributes through to the hosted field", async () => {
    const mounted = await mountEmbed(embed());

    const field = fieldIn(mounted.container);

    expect(field.getAttribute("theme-background-field")).toBe(
      STYLE_ATTRIBUTES.inputBackground,
    );
    expect(field.getAttribute("theme-color-error")).toBe(
      STYLE_ATTRIBUTES.inputTextColorError,
    );

    await mounted.unmount();
  });

  it("maps a successful tokenization onto the selector's payload shape", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    stubTokenize(fieldIn(mounted.container), {
      token: "tok_123",
      requestId: "req_123",
      cardBrand: "visa",
      last4: "4242",
      expirationMonth: 12,
      expirationYear: 2030,
    });

    await expect(settled(() => sink.get().tokenize())).resolves.toEqual({
      token: "tok_123",
      requestId: "req_123",
      cardBrand: "visa",
      last4: "4242",
      expirationMonth: 12,
      expirationYear: 2030,
    });

    await mounted.unmount();
  });

  // The checkout correlates the submit request with the tokenization by request
  // id. Without one it cannot tell which token belongs to which attempt, so the
  // embed refuses the payload rather than submitting an uncorrelated token.
  it("refuses a tokenization response with no request id", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    stubTokenize(fieldIn(mounted.container), { token: "tok_123" });

    const error = await rejection(() => sink.get().tokenize());

    expect(error.message).toContain("request id");

    await mounted.unmount();
  });

  it("shows the tokenize error message on a tokenizationerror event and clears it on success", async () => {
    const mounted = await mountEmbed(embed());
    const field = fieldIn(mounted.container);

    await settled(() => {
      field.dispatchEvent(
        new CustomEvent("tokenizationerror", {
          detail: { code: "card_declined" },
        }),
      );
    });

    expect(mounted.container.textContent).toContain(TOKENIZE_ERROR);

    await settled(() => {
      field.dispatchEvent(new CustomEvent("tokenizationsuccess", {}));
    });

    expect(mounted.container.textContent).not.toContain(TOKENIZE_ERROR);

    await mounted.unmount();
  });

  it("hands the host a controller on mount and clears it on unmount", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    expect(sink.get().tokenize).toBeTypeOf("function");

    await mounted.unmount();

    expect(sink.latest()).toBeNull();
  });
});
