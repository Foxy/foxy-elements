import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";

import type { PaymentMethodSelectorKlarnaConfig } from "../types";
import KlarnaOptionEmbed from "./klarna";
import { flush, mountEmbed, optionWith } from "./test-utils";

const LOADING_MESSAGE = "Loading Klarna…";
const UNAVAILABLE_MESSAGE = "Klarna is not available for this order.";
const LOAD_ERROR_MESSAGE = "Klarna could not be loaded.";

const KLARNA_CONFIG: PaymentMethodSelectorKlarnaConfig = {
  sessionId: "session-1",
  category: {
    identifier: "pay_later",
    name: "Pay later",
    asset_urls: { descriptive: "", standard: "" },
  },
};

type KlarnaLoadResult = {
  show_form: boolean;
  error?: { [key: string]: unknown };
};
type KlarnaLoadCallback = (result: KlarnaLoadResult) => void;

let restoreClient: (() => void) | null = null;

/**
 * Swaps the SDK singleton's `klarna` instance for the duration of one test.
 * Mirrors the override helper the element test uses — the embed reads the
 * instance off the shared client at effect time, so there is nothing to inject
 * through props.
 */
function useKlarnaInstance(klarna: unknown): void {
  const descriptor = Object.getOwnPropertyDescriptor(checkoutClient, "klarna");

  Object.defineProperty(checkoutClient, "klarna", {
    configurable: true,
    value: klarna,
  });

  restoreClient = () => {
    if (descriptor) {
      Object.defineProperty(checkoutClient, "klarna", descriptor);
    } else {
      delete (checkoutClient as unknown as Record<string, unknown>).klarna;
    }
  };
}

/** A Klarna SDK stub whose `Payments.load` is resolved by the test. */
function klarnaStub() {
  const calls: { container: HTMLElement; category: string }[] = [];
  let respond: KlarnaLoadCallback | null = null;

  return {
    calls,
    instance: {
      Payments: {
        load(
          options: { container: HTMLElement; payment_method_category: string },
          _data: unknown,
          callback: KlarnaLoadCallback,
        ) {
          calls.push({
            container: options.container,
            category: options.payment_method_category,
          });
          respond = callback;
        },
      },
    },
    async resolveWith(result: KlarnaLoadResult): Promise<void> {
      if (!respond) throw new Error("Klarna's load was never called.");
      respond(result);
      await flush();
    },
  };
}

function embed(
  overrides: {
    klarna?: false;
    disabled?: boolean;
    onAvailabilityChange?: (category: string, available: boolean) => void;
  } = {},
) {
  return createElement(KlarnaOptionEmbed, {
    option: optionWith({
      id: "klarna",
      klarna: overrides.klarna === false ? undefined : KLARNA_CONFIG,
    }),
    disabled: overrides.disabled,
    onAvailabilityChange: overrides.onAvailabilityChange,
    loadingMessage: LOADING_MESSAGE,
    unavailableMessage: UNAVAILABLE_MESSAGE,
    loadErrorMessage: LOAD_ERROR_MESSAGE,
  });
}

function widgetIn(container: HTMLElement): HTMLElement {
  const widget = container.querySelector<HTMLElement>(
    '[data-klarna-widget="true"]',
  );

  if (!widget) throw new Error("The Klarna widget container did not render.");
  return widget;
}

afterEach(() => {
  restoreClient?.();
  restoreClient = null;
});

describe("KlarnaOptionEmbed", () => {
  it("renders nothing when the option carries no Klarna config", async () => {
    const klarna = klarnaStub();
    useKlarnaInstance(klarna.instance);

    const mounted = await mountEmbed(embed({ klarna: false }));

    expect(
      mounted.container.querySelector('[data-klarna-widget="true"]'),
    ).toBeNull();
    expect(klarna.calls).toHaveLength(0);

    await mounted.unmount();
  });

  it("shows the loading message and asks Klarna for the option's category", async () => {
    const klarna = klarnaStub();
    useKlarnaInstance(klarna.instance);

    const mounted = await mountEmbed(embed());

    expect(widgetIn(mounted.container).dataset.klarnaWidgetStatus).toBe(
      "loading",
    );
    expect(mounted.container.textContent).toContain(LOADING_MESSAGE);
    // Klarna renders one widget per category, so the wrong identifier here
    // silently renders a different payment method than the shopper picked.
    expect(klarna.calls).toEqual([
      {
        container: widgetIn(mounted.container),
        category: KLARNA_CONFIG.category.identifier,
      },
    ]);

    await mounted.unmount();
  });

  it("goes ready and reports the category as available when the form shows", async () => {
    const klarna = klarnaStub();
    useKlarnaInstance(klarna.instance);

    const availability: [string, boolean][] = [];
    const mounted = await mountEmbed(
      embed({
        onAvailabilityChange: (category, available) =>
          availability.push([category, available]),
      }),
    );
    await klarna.resolveWith({ show_form: true });

    expect(widgetIn(mounted.container).dataset.klarnaWidgetStatus).toBe(
      "ready",
    );
    expect(mounted.container.textContent).not.toContain(LOADING_MESSAGE);
    expect(mounted.container.textContent).not.toContain(UNAVAILABLE_MESSAGE);
    // The selector hides categories reported unavailable, so this callback is
    // what keeps a dead Klarna option out of the list.
    expect(availability).toEqual([[KLARNA_CONFIG.category.identifier, true]]);

    await mounted.unmount();
  });

  // Klarna answers `show_form: false` when it declines the order, which is a
  // normal outcome rather than a failure — the shopper needs to be told the
  // option is unusable so they can pick another one.
  it("goes unavailable when Klarna declines to show the form", async () => {
    const klarna = klarnaStub();
    useKlarnaInstance(klarna.instance);

    const availability: [string, boolean][] = [];
    const mounted = await mountEmbed(
      embed({
        onAvailabilityChange: (category, available) =>
          availability.push([category, available]),
      }),
    );
    await klarna.resolveWith({
      show_form: false,
      error: { invalid_fields: ["billing_address.postal_code"] },
    });

    expect(widgetIn(mounted.container).dataset.klarnaWidgetStatus).toBe(
      "unavailable",
    );
    expect(mounted.container.textContent).toContain(UNAVAILABLE_MESSAGE);
    expect(availability).toEqual([[KLARNA_CONFIG.category.identifier, false]]);

    await mounted.unmount();
  });

  // The SDK instance is created during checkout initialization. If it never
  // arrived, the embed has nothing to render into and says so instead of
  // sitting on the loading message forever.
  it("goes to the error state when the SDK instance is missing", async () => {
    useKlarnaInstance(null);

    const mounted = await mountEmbed(embed());

    expect(widgetIn(mounted.container).dataset.klarnaWidgetStatus).toBe(
      "error",
    );
    expect(mounted.container.textContent).toContain(LOAD_ERROR_MESSAGE);
    expect(mounted.container.textContent).not.toContain(LOADING_MESSAGE);

    await mounted.unmount();
  });

  it("goes to the error state when the SDK instance carries no Payments API", async () => {
    useKlarnaInstance({});

    const mounted = await mountEmbed(embed());

    expect(widgetIn(mounted.container).dataset.klarnaWidgetStatus).toBe(
      "error",
    );
    expect(mounted.container.textContent).toContain(LOAD_ERROR_MESSAGE);

    await mounted.unmount();
  });

  it("goes to the error state when Klarna's load throws", async () => {
    useKlarnaInstance({
      Payments: {
        load() {
          throw new Error("Klarna SDK exploded.");
        },
      },
    });

    const mounted = await mountEmbed(embed());
    await flush();

    expect(widgetIn(mounted.container).dataset.klarnaWidgetStatus).toBe(
      "error",
    );
    expect(mounted.container.textContent).toContain(LOAD_ERROR_MESSAGE);

    await mounted.unmount();
  });

  // Klarna injects its iframe into the container it was handed. Leaving that
  // behind on teardown would show a stale widget when the shopper comes back
  // to the option, on top of whatever Klarna renders next.
  it("empties the widget container on teardown", async () => {
    const klarna = klarnaStub();
    useKlarnaInstance(klarna.instance);

    const mounted = await mountEmbed(embed());
    const widget = widgetIn(mounted.container);
    widget.append(document.createElement("iframe"));

    await klarna.resolveWith({ show_form: true });
    expect(widget.childElementCount).toBe(1);

    await mounted.render(embed({ klarna: false }));

    expect(widget.childElementCount).toBe(0);

    await mounted.unmount();
  });

  it("marks the widget aria-disabled while the option is disabled", async () => {
    const klarna = klarnaStub();
    useKlarnaInstance(klarna.instance);

    const mounted = await mountEmbed(embed({ disabled: true }));

    expect(widgetIn(mounted.container).getAttribute("aria-disabled")).toBe(
      "true",
    );

    await mounted.unmount();
  });
});
