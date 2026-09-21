// src/elements/foxy-side-cart-trigger/element.tsx
import type { Root } from "react-dom/client";

import { createRoot } from "react-dom/client";
import { defaultTheme } from "@foxy.io/design-system/theme";
import { sideCart } from "@foxy.io/sdk/checkout/side-cart";
import { SideCartTriggerView } from "./view";
import { StyleSheetManager, ThemeProvider } from "styled-components";

export class SideCartTriggerElement extends HTMLElement {
  #shadowRoot = this.attachShadow({ mode: "open" });
  #root: Root | null = null;
  #container = document.createElement("div");
  #lastCount: number | null = null;
  #announcement = "";

  #onCountChange = (): void => {
    const next = sideCart.itemCount;
    // Silent for the first count to arrive: that is the cache catching up with
    // the store, not something the shopper did, and announcing a correction
    // nobody asked for is worse than announcing nothing.
    this.#announcement =
      this.#lastCount === null || next === null ? "" : `Cart, ${next} items`;
    this.#lastCount = next;
    this.#render();
  };

  connectedCallback(): void {
    if (!this.#root) {
      this.#shadowRoot.appendChild(this.#container);
      this.#root = createRoot(this.#container);
    }

    this.#lastCount = sideCart.itemCount;
    sideCart.addEventListener("itemcountchange", this.#onCountChange);
    this.#render();
  }

  disconnectedCallback(): void {
    sideCart.removeEventListener("itemcountchange", this.#onCountChange);
    this.#root?.unmount();
    this.#root = null;
  }

  #render(): void {
    this.#root?.render(
      <StyleSheetManager target={this.#shadowRoot}>
        <ThemeProvider theme={{ tokens: defaultTheme }}>
          <SideCartTriggerView
            itemCount={sideCart.itemCount}
            announcement={this.#announcement}
            onClick={() => sideCart.show()}
          />
        </ThemeProvider>
      </StyleSheetManager>,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-side-cart-trigger": SideCartTriggerElement;
  }
}

if (!customElements.get("foxy-side-cart-trigger")) {
  customElements.define("foxy-side-cart-trigger", SideCartTriggerElement);
}
