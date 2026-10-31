import { afterEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_STORE, stubCatalog, type CatalogStub } from "@/lib/products/fixtures";
import { listenLikeFoxy2, settle } from "@/lib/products/foxy2-test-utils";
import "./element";

let stub: CatalogStub | undefined;

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body.querySelector("foxy-product-link")!;
}

function link(element: HTMLElement): HTMLAnchorElement | null {
  return element.querySelector("a.foxy-product-button");
}

afterEach(() => {
  stub?.restore();
  stub = undefined;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("foxy-product-link", () => {
  it("renders a cart link by SKU in light DOM, before the catalog answers", () => {
    stub = stubCatalog();
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link>`);
    expect(element.shadowRoot).toBeNull();
    expect(link(element)?.href).toBe(`https://${FIXTURE_STORE}/cart?sku=MUG-ENM-WHT`);
    expect(link(element)?.rel).toBe("nofollow");
    expect(link(element)?.textContent).toBe("Add to cart");
  });

  it("is picked up by 2.0's delegated click handler", async () => {
    stub = stubCatalog();
    const foxy2 = listenLikeFoxy2(FIXTURE_STORE);
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" show-price></foxy-product-link>`);
    await settle();
    // A click on the price inside the link still reaches the link.
    element.querySelector<HTMLElement>(".foxy-product-price")!.click();
    foxy2.stop();
    expect(foxy2.clicked).toEqual([link(element)]);
  });

  it("would not be, from shadow DOM", () => {
    const foxy2 = listenLikeFoxy2(FIXTURE_STORE);
    const host = document.createElement("div");
    document.body.append(host);
    const shadowLink = document.createElement("a");
    shadowLink.href = `https://${FIXTURE_STORE}/cart?sku=MUG-ENM-WHT`;
    host.attachShadow({ mode: "open" }).append(shadowLink);
    // Keeps the test page from following it.
    shadowLink.addEventListener("click", (event) => event.preventDefault());
    shadowLink.click();
    foxy2.stop();
    expect(foxy2.clicked).toEqual([]);
  });

  it("adds a quantity and goes to checkout when asked", () => {
    stub = stubCatalog();
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="TEE-ORG-BLK-S" quantity="3" checkout label="Buy now"></foxy-product-link>`);
    expect(link(element)?.href).toBe(`https://${FIXTURE_STORE}/cart?sku=TEE-ORG-BLK-S&quantity=3&cart=checkout`);
    expect(link(element)?.textContent).toBe("Buy now");
  });

  it("shows the price, struck-through list price and currency amount", async () => {
    stub = stubCatalog();
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" show-price currency="EUR" lang="en-US"></foxy-product-link>`);
    await settle();
    // EUR has its own price but no list price there, so only the price shows.
    expect(element.querySelector(".foxy-product-price")?.textContent).toBe("€15.20");

    element.removeAttribute("currency");
    expect(element.querySelector(".foxy-product-price")?.textContent).toBe("16.40 18.90");
    expect(element.querySelector("s")?.getAttribute("aria-label")).toBe("Was 18.90");
  });

  it("is sold out without an href, so nothing can add it", async () => {
    stub = stubCatalog();
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="COF-HUILA-340"></foxy-product-link>`);
    await settle();
    expect(link(element)?.hasAttribute("href")).toBe(false);
    expect(link(element)?.getAttribute("aria-disabled")).toBe("true");
    expect(link(element)?.textContent).toBe("Sold out");
  });

  it("keeps the merchant's fallback for a parent, with a warning", async () => {
    stub = stubCatalog();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="TEE-ORG"><a href="/tee">See the tee</a></foxy-product-link>`);
    await settle();
    expect(element.innerHTML).toBe('<a href="/tee">See the tee</a>');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("foxy-product-form"));
  });

  it("treats a required modifier like a parent", async () => {
    stub = stubCatalog();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-ENGRAVE"></foxy-product-link>`);
    await settle();
    expect(link(element)).toBeNull();
  });

  it("keeps the plain link when the catalog can't be read", async () => {
    stub = stubCatalog();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="UNLISTED-1"></foxy-product-link>`);
    await settle();
    expect(link(element)?.href).toBe(`https://${FIXTURE_STORE}/cart?sku=UNLISTED-1`);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("No product"));
  });

  it("takes the store from 2.0's settings when there's no attribute", () => {
    window.FC = { settings: { storedomain: FIXTURE_STORE } };
    stub = stubCatalog();
    const element = mount(`<foxy-product-link sku="MUG-ENM-WHT"></foxy-product-link>`);
    expect(link(element)?.href).toBe(`https://${FIXTURE_STORE}/cart?sku=MUG-ENM-WHT`);
    delete window.FC;
  });

  it("reflects its properties", () => {
    const element = document.createElement("foxy-product-link");
    element.sku = "MUG-ENM-WHT";
    element.quantity = 2;
    element.checkout = true;
    element.showPrice = true;
    expect(element.getAttribute("sku")).toBe("MUG-ENM-WHT");
    expect(element.getAttribute("quantity")).toBe("2");
    expect(element.hasAttribute("checkout")).toBe(true);
    expect(element.hasAttribute("show-price")).toBe(true);
  });
});

describe("foxy-product-link after a 2.0 add", () => {
  it("keeps the shopper's focus, re-rendering only for a new currency", async () => {
    const handlers: Record<string, () => void> = {};
    window.FC = {
      json: { locale_info: { int_curr_symbol: "USD " } },
      client: { on: (event: string, handler: () => void) => (handlers[event] = handler) },
    };
    stub = stubCatalog();
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" show-price></foxy-product-link>`);
    await vi.waitFor(() => expect(handlers["cart-submit.done"]).toBeDefined());
    await settle();
    const before = link(element)!;
    before.focus();

    handlers["cart-submit.done"]();
    expect(link(element)).toBe(before);
    expect(document.activeElement).toBe(before);

    window.FC.json!.locale_info!.int_curr_symbol = "EUR ";
    handlers["cart-submit.done"]();
    expect(element.querySelector(".foxy-product-price")?.textContent).toBe("€15.20");
    delete window.FC;
  });
});
