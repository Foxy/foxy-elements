import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "@foxy.io/design-system/theme";
import enUsMessages from "@/locales/en-US.json";
import { ApiProvider, RequestCache } from "@/lib/customer-api";

/**
 * Screen tests render a screen directly instead of driving it through
 * `<foxy-customer-portal>`. The `unit` vitest project picks up both
 * `src/**\/*.test.ts` and `src/**\/*.test.tsx`, but this shared helper module
 * stays a plain `.ts` file, so `createElement` throughout instead of JSX.
 */

// React only allows `act` outside a test renderer when this is set, and warns
// on every update otherwise. Every screen test in this element renders React.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Sets a controlled input's value the way a user would, so React's onChange fires.
 *
 * React tracks each input's last value on the DOM node. A direct
 * `input.value = x` updates that tracker as a side effect, so React concludes
 * nothing changed and skips the change event. Writing through the prototype's
 * own setter leaves the tracker stale, which is what makes React notice.
 */
export function setInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export type MountedScreen = {
  /** The element the screen was rendered into; query it for assertions. */
  host: HTMLDivElement;
  unmount(): void;
};

/**
 * Mounts `node` under the same provider stack `<foxy-customer-portal>` sets up
 * in production: `ThemeProvider` (DS components read theme tokens off it),
 * `IntlProvider` with the real `en-US.json` catalog (a bare `IntlProvider`
 * logs a `MISSING_TRANSLATION` warning for every message, since screens are
 * normally fed the element's resolved catalog, not just `defaultMessage`
 * fallbacks), and `ApiProvider` wrapping the caller's API test double with a
 * fresh `RequestCache`.
 *
 * Each screen takes different props and a different API double, so only the
 * rendered `node` and the `api` it should see are parameters here.
 */
export function mountScreen(node: ReactNode, api: unknown): MountedScreen {
  const host = document.createElement("div");
  document.body.append(host);

  const root: Root = createRoot(host);

  act(() => {
    root.render(
      createElement(
        ThemeProvider,
        { theme: { tokens: defaultTheme } },
        createElement(
          IntlProvider,
          {
            locale: "en-US",
            messages: enUsMessages as Record<string, string>,
          },
          createElement(ApiProvider, {
            api: api as never,
            cache: new RequestCache(),
            children: node,
          }),
        ),
      ),
    );
  });

  return {
    host,
    unmount() {
      act(() => root.unmount());
      host.remove();
    },
  };
}
