import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "@foxy.io/design-system/theme";

import type { PaymentController, PaymentMethodSelectorOption } from "../types";

/**
 * Embed tests render the React component directly instead of driving it through
 * `foxy-payment-method-selector`. The element test already covers the happy
 * paths end to end; what it cannot reach cheaply are the per-embed branches
 * (missing SDK instance, teardown, prop fallbacks), which need control over the
 * props the selector normally computes for itself.
 *
 * The `unit` vitest project only picks up `src/**\/*.test.ts`, so there is no
 * JSX in these files — `createElement` throughout.
 */

// React only allows `act` outside a test renderer when this is set, and warns
// on every update otherwise.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

export type MountedEmbed = {
  container: HTMLDivElement;
  /** Re-renders a different tree inside the same root. */
  render: (node: ReactNode) => Promise<void>;
  unmount: () => Promise<void>;
};

function withTheme(node: ReactNode): ReactNode {
  return createElement(
    ThemeProvider,
    { theme: { tokens: defaultTheme } },
    node,
  );
}

/**
 * Mounts `node` under a `ThemeProvider` in a container attached to the
 * document. Attached rather than detached because the embeds mount custom
 * elements, which only upgrade once they are connected.
 */
export async function mountEmbed(node: ReactNode): Promise<MountedEmbed> {
  const container = document.createElement("div");
  document.body.append(container);

  const root: Root = createRoot(container);

  await act(async () => {
    root.render(withTheme(node));
  });

  return {
    container,
    render: async (next: ReactNode) => {
      await act(async () => {
        root.render(withTheme(next));
      });
    },
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });

      container.remove();
    },
  };
}

/** Lets queued microtasks and the effects they schedule settle. */
export async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

/**
 * Runs `work` and settles the React updates it causes. Anything that touches a
 * mounted embed from outside React — dispatching an input event, calling a
 * controller's `tokenize()` — goes through here, or React logs an "update was
 * not wrapped in act(...)" error for every resulting state change.
 */
export async function settled<T>(work: () => T | Promise<T>): Promise<T> {
  let result: T;

  await act(async () => {
    result = await work();
  });

  return result!;
}

/**
 * Like {@link settled}, but for a call that is expected to reject: returns the
 * rejection so the test can assert on it. `expect(...).rejects` cannot be used
 * directly here because the rejection has to be caught inside `act`.
 */
export async function rejection(work: () => Promise<unknown>): Promise<Error> {
  let caught: unknown;

  await act(async () => {
    try {
      await work();
    } catch (error) {
      caught = error;
    }
  });

  if (!(caught instanceof Error)) {
    throw new Error(`Expected a rejection, got: ${String(caught)}`);
  }

  return caught;
}

/**
 * Sets an input's value the way a shopper would. React reads the value off its
 * own descriptor, so a plain `input.value = x` is invisible to the controlled
 * component and its state never updates.
 */
export async function typeInto(
  input: HTMLInputElement,
  value: string,
): Promise<void> {
  await settled(() => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/**
 * Collects what an embed passes to `onControllerReady`. The embeds hand the
 * controller out from an effect and replace it with `null` on teardown, so a
 * plain variable would be null by the time a test wants to call it.
 */
export function controllerSink() {
  let current: PaymentController | null = null;
  let last: PaymentController | null | undefined;

  return {
    onControllerReady(next: PaymentController | null) {
      last = next;
      current = next ?? current;
    },
    /** The last controller handed out, or a failure if there was none. */
    get(): PaymentController {
      if (!current) throw new Error("The embed handed out no controller.");
      return current;
    },
    /** The most recent value, including the `null` passed on teardown. */
    latest(): PaymentController | null | undefined {
      return last;
    },
  };
}

export function optionWith(
  overrides: Partial<PaymentMethodSelectorOption>,
): PaymentMethodSelectorOption {
  return { id: "test-option", label: "Test option", ...overrides };
}
