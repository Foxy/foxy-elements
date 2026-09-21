// @vitest-environment jsdom
// src/elements/foxy-side-cart-trigger/element.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sideCart } from "@foxy.io/sdk/checkout/side-cart";
import "./element";

function mount(): HTMLElement {
  const element = document.createElement("foxy-side-cart-trigger");
  document.body.appendChild(element);
  return element;
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 10));
}

describe("foxy-side-cart-trigger", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("renders no badge while the count is unknown", async () => {
    // The getter lives on the class, not the singleton, so spy on the
    // prototype — `vi.spyOn(sideCart, …)` has no own descriptor to replace.
    vi.spyOn(Object.getPrototypeOf(sideCart), "itemCount", "get").mockReturnValue(null);
    const element = mount();
    await settle();

    // A cold start has no cached count. Rendering a zero would be a claim we
    // cannot make, and a number that later jumps is worse than no number.
    expect(element.shadowRoot?.textContent).not.toMatch(/\d/);
  });

  it("renders the count once one is known", async () => {
    vi.spyOn(Object.getPrototypeOf(sideCart), "itemCount", "get").mockReturnValue(3);
    const element = mount();
    await settle();

    expect(element.shadowRoot?.textContent).toContain("3");
  });

  it("opens the sidecart on click", async () => {
    const show = vi.spyOn(sideCart, "show").mockImplementation(() => undefined);
    const element = mount();
    await settle();

    element.shadowRoot?.querySelector("button")?.click();
    expect(show).toHaveBeenCalledTimes(1);
  });

  it("announces a change only after a count is already on screen", async () => {
    // A settable value, not a queue: `#render` reads the getter again on every
    // render, so a shifting array would hand out a different count to the
    // render than to the change handler.
    let current: number | null = null;
    vi.spyOn(Object.getPrototypeOf(sideCart), "itemCount", "get").mockImplementation(
      () => current,
    );

    const element = mount();
    await settle();

    // null -> 2 is the cache catching up, which the shopper did not cause.
    current = 2;
    sideCart.dispatchEvent(new Event("itemcountchange"));
    await settle();
    expect(element.shadowRoot?.querySelector("[aria-live]")?.textContent).toBe("");

    // 2 -> 5 is the shopper's own change, so it is announced.
    current = 5;
    sideCart.dispatchEvent(new Event("itemcountchange"));
    await settle();
    expect(element.shadowRoot?.querySelector("[aria-live]")?.textContent).toContain("5");
  });
});
