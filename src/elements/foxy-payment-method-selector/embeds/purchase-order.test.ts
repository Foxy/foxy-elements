import { createElement } from "react";
import { describe, expect, it } from "vitest";

import type { PaymentController } from "../types";
import PurchaseOrderOptionEmbed from "./purchase-order";
import {
  controllerSink,
  mountEmbed,
  optionWith,
  rejection,
  settled,
  typeInto,
} from "./test-utils";

const LABEL = "Purchase order number";
const PLACEHOLDER = "PO-000000";
const REQUIRED_ERROR = "Enter a purchase order number.";
const TOO_LONG_ERROR = "That purchase order number is too long.";
const MAX_LENGTH = 32;

type EmbedPropOverrides = {
  optionId?: string;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
  maxLength?: number;
};

function embed(overrides: EmbedPropOverrides = {}) {
  return createElement(PurchaseOrderOptionEmbed, {
    option: optionWith({ id: overrides.optionId ?? "purchase-order" }),
    disabled: overrides.disabled,
    onControllerReady: overrides.onControllerReady,
    label: LABEL,
    placeholder: PLACEHOLDER,
    requiredErrorMessage: REQUIRED_ERROR,
    tooLongErrorMessage: TOO_LONG_ERROR,
    maxLength: overrides.maxLength ?? MAX_LENGTH,
  });
}

function inputIn(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(
    '[data-purchase-order-number="true"]',
  );

  if (!input) throw new Error("Purchase order number input did not render.");
  return input;
}

describe("PurchaseOrderOptionEmbed", () => {
  it("renders a labelled, required input wired to the field label", async () => {
    const mounted = await mountEmbed(embed());

    const input = inputIn(mounted.container);
    const label = mounted.container.querySelector("label");

    expect(input.required).toBe(true);
    expect(input.maxLength).toBe(MAX_LENGTH);
    expect(input.placeholder).toBe(PLACEHOLDER);
    expect(label?.textContent).toBe(LABEL);
    expect(label?.getAttribute("for")).toBe(input.id);

    await mounted.unmount();
  });

  it("hands the host a controller on mount and clears it on unmount", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    expect(sink.get().tokenize).toBeTypeOf("function");

    await mounted.unmount();

    // The selector reads a null controller as "this option cannot pay", so a
    // missed teardown leaves it holding a controller for an unmounted field.
    expect(sink.latest()).toBeNull();
  });

  it("rejects tokenization and shows the required error when the field is empty", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    const error = await rejection(() => sink.get().tokenize());

    expect(error.message).toBe(REQUIRED_ERROR);
    expect(mounted.container.textContent).toContain(REQUIRED_ERROR);
    expect(inputIn(mounted.container).getAttribute("aria-invalid")).toBe(
      "true",
    );

    await mounted.unmount();
  });

  // Whitespace only looks filled in. The embed trims before testing for
  // emptiness, so "   " has to fail the same way "" does.
  it("treats a whitespace-only number as empty", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    await typeInto(inputIn(mounted.container), "   ");
    const error = await rejection(() => sink.get().tokenize());

    expect(error.message).toBe(REQUIRED_ERROR);

    await mounted.unmount();
  });

  // The input's own `maxLength` stops a shopper typing past the limit, so the
  // length branch is only reachable through a value the browser did not cap —
  // a paste on some engines, or a host that lowered `maxLength` after the fact.
  it("rejects a number longer than maxLength", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady, maxLength: 4 }),
    );

    await typeInto(inputIn(mounted.container), "PO-12345");
    const error = await rejection(() => sink.get().tokenize());

    expect(error.message).toBe(TOO_LONG_ERROR);
    expect(mounted.container.textContent).toContain(TOO_LONG_ERROR);

    await mounted.unmount();
  });

  it("trims the number and returns a request id once it is valid", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    await typeInto(inputIn(mounted.container), "  PO-123456  ");

    const payload = (await settled(() => sink.get().tokenize())) as {
      requestId: string;
      purchaseOrderNumber: string;
    };

    expect(payload.purchaseOrderNumber).toBe("PO-123456");
    expect(payload.requestId).toBeTypeOf("string");
    expect(payload.requestId.length).toBeGreaterThan(0);

    await mounted.unmount();
  });

  it("clears a shown error as soon as the number becomes valid", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    await rejection(() => sink.get().tokenize());
    expect(mounted.container.textContent).toContain(REQUIRED_ERROR);

    await typeInto(inputIn(mounted.container), "PO-1");

    expect(mounted.container.textContent).not.toContain(REQUIRED_ERROR);
    expect(inputIn(mounted.container).getAttribute("aria-invalid")).toBe(
      "false",
    );

    await mounted.unmount();
  });

  // The selector reuses one embed instance across options, so a number typed
  // for one option must not travel to the next.
  it("resets the number and the error when the option changes", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({
        onControllerReady: sink.onControllerReady,
        optionId: "purchase-order-1",
      }),
    );

    await typeInto(inputIn(mounted.container), "PO-111111");
    await expect(settled(() => sink.get().tokenize())).resolves.toMatchObject({
      purchaseOrderNumber: "PO-111111",
    });

    await mounted.render(
      embed({
        onControllerReady: sink.onControllerReady,
        optionId: "purchase-order-2",
      }),
    );

    expect(inputIn(mounted.container).value).toBe("");
    expect((await rejection(() => sink.get().tokenize())).message).toBe(
      REQUIRED_ERROR,
    );

    await mounted.unmount();
  });

  it("disables the input when the host disables the option", async () => {
    const mounted = await mountEmbed(embed({ disabled: true }));

    expect(inputIn(mounted.container).disabled).toBe(true);

    await mounted.unmount();
  });
});
