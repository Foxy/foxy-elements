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

function getButton(element: HTMLElement): HTMLButtonElement | null | undefined {
  return element.shadowRoot?.querySelector("button");
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

    // `textContent` never surfaces attribute values, so the badge assertion
    // above would stay green even if the accessible name started lying about
    // the count. Assert the name itself.
    expect(getButton(element)?.getAttribute("aria-label")).toBe("Cart");
  });

  it("renders a zero badge, distinct from the unknown state", async () => {
    vi.spyOn(Object.getPrototypeOf(sideCart), "itemCount", "get").mockReturnValue(0);
    const element = mount();
    await settle();

    expect(element.shadowRoot?.textContent).toContain("0");
    expect(getButton(element)?.getAttribute("aria-label")).toBe("Cart, 0 items");
  });

  it("renders the count once one is known, with correct singular/plural grammar", async () => {
    vi.spyOn(Object.getPrototypeOf(sideCart), "itemCount", "get").mockReturnValue(3);
    const element = mount();
    await settle();

    expect(element.shadowRoot?.textContent).toContain("3");
    expect(getButton(element)?.getAttribute("aria-label")).toBe("Cart, 3 items");
  });

  it("uses singular grammar for a count of exactly one", async () => {
    // "Cart, 1 items" is what a naive `${count} items` template produces --
    // this pins the ICU plural message rather than a manual template.
    vi.spyOn(Object.getPrototypeOf(sideCart), "itemCount", "get").mockReturnValue(1);
    const element = mount();
    await settle();

    expect(getButton(element)?.getAttribute("aria-label")).toBe("Cart, 1 item");
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

  it("resets the announcement on disconnect, so a reconnect cannot resurface a stale one", async () => {
    let current: number | null = 2;
    vi.spyOn(Object.getPrototypeOf(sideCart), "itemCount", "get").mockImplementation(
      () => current,
    );

    const element = mount();
    await settle();

    // Produce a real, on-screen announcement first (2 -> 9 is a change the
    // shopper caused).
    current = 9;
    sideCart.dispatchEvent(new Event("itemcountchange"));
    await settle();
    expect(element.shadowRoot?.querySelector("[aria-live]")?.textContent).toContain("9");

    // Simulate a framework re-parenting the element: remove it, change the
    // count underneath it while it's disconnected, then re-append it.
    element.remove();
    current = 0;
    document.body.appendChild(element);
    await settle();

    // The badge reflects the new, current count...
    expect(getButton(element)?.getAttribute("aria-label")).toBe("Cart, 0 items");
    // ...and the live region must not still be announcing the old one: a
    // stale "Cart, 9 items" next to a "Cart, 0 items" badge is a screen
    // reader being told two different counts at once.
    expect(element.shadowRoot?.querySelector("[aria-live]")?.textContent).toBe("");
  });

  it("does not leak a <style> element across connect/disconnect cycles", async () => {
    const element = mount();
    await settle();

    for (let i = 0; i < 4; i += 1) {
      element.remove();
      document.body.appendChild(element);
      await settle();
    }

    // `root.unmount()` on disconnect tears down the React tree but does not,
    // by itself, remove the `<style>` tag `StyleSheetManager` inserted
    // directly into the shadow root -- left alone, every reconnect adds
    // another one, unbounded, for as long as the element stays on the page.
    const styleCount =
      element.shadowRoot?.querySelectorAll("style[data-styled]").length ?? 0;
    expect(styleCount).toBeLessThanOrEqual(1);
  });

  it("reflects a theme attribute onto the host's CSS custom properties", () => {
    const element = document.createElement("foxy-side-cart-trigger");
    element.setAttribute("theme-color-primary", "#123456");

    expect(element.style.getPropertyValue("--color-primary")).toBe("#123456");
  });

  it("is not re-exported from the elements barrel", async () => {
    // Its module imports `@foxy.io/sdk/checkout/side-cart`, which installs
    // the sidecart as `client`'s cart-mutation transport as an import side
    // effect. Re-exporting it from the barrel would make that side effect
    // fire for anyone importing `@foxy.io/elements` at all, whether or not a
    // trigger is on the page -- it must be reached only through its own
    // subpath.
    const barrel = await import("../index");
    expect("SideCartTriggerElement" in barrel).toBe(false);
  });
});
