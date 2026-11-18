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
  return element.querySelector("a.foxy-product-button, a.foxy-product-text-link");
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

  it("shows the price after its text once the catalog answers, unless told not to", async () => {
    stub = stubCatalog();
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="COF-HUILA-340x" currency="USD"></foxy-product-link><foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" currency="USD"></foxy-product-link>`);
    const [, withPrice] = document.querySelectorAll<HTMLElement>("foxy-product-link");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await settle();
    expect(link(withPrice)?.textContent).toBe("Add to cart · $16.40 $18.90");
    // An unknown SKU keeps the plain link, without a price.
    expect(link(element)?.textContent).toBe("Add to cart");

    withPrice.setAttribute("show-price", "false");
    expect(link(withPrice)?.textContent).toBe("Add to cart");
    withPrice.removeAttribute("show-price");
    withPrice.setAttribute("label", "Get the mug");
    expect(link(withPrice)?.textContent).toBe("Get the mug");
  });

  it("can be a plain text link", async () => {
    stub = stubCatalog();
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" appearance="text" label="Add a mug" show-price currency="USD"></foxy-product-link>`);
    await settle();
    expect(link(element)?.className).toBe("foxy-product-text-link");
    expect(link(element)?.textContent).toBe("Add a mug · $16.40 $18.90");
    expect(getComputedStyle(link(element)!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
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
    expect(link(element)?.textContent).toBe("Add to cart · €15.20");

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

  it("can't add a parent's SKU: the merchant's fallback stays, and the console says to name a variant", async () => {
    stub = stubCatalog();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="TEE-ORG"><a href="/tee">See the tee</a></foxy-product-link>`);
    await settle();
    expect(element.innerHTML).toBe('<a href="/tee">See the tee</a>');
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Point the link at one variant's SKU (such as TEE-ORG-BLK-S)"),
    );
    expect(element.querySelector(`a[href*="/cart"]`)).toBeNull();
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
    element.showPrice = false;
    expect(element.getAttribute("show-price")).toBe("false");
  });
});

describe("foxy-product-link's look", () => {
  const background = (element: HTMLElement) => getComputedStyle(link(element)!).backgroundColor;

  it("is the bold theme by default, and the 2.0 cart's with theme=\"cart\"", async () => {
    stub = stubCatalog();
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link>`);
    await settle();
    const style = getComputedStyle(link(element)!);
    expect(style.backgroundColor).toBe("rgb(17, 24, 39)");
    expect(style.color).toBe("rgb(255, 255, 255)");
    expect(style.borderRadius).toBe("8px");

    element.setAttribute("theme", "cart");
    expect(style.backgroundColor).toBe("rgb(63, 138, 46)");
    expect(style.borderRadius).toBe("0px");
    expect(style.fontFamily).toContain("Helvetica Neue");
  });

  it("lets the store's look and an attribute win over a theme", async () => {
    stub = stubCatalog();
    stub.look = { button_color: "#0057d9" };
    const element = mount(`<foxy-product-link theme="foxy" store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link>`);
    await settle();
    await vi.waitFor(() => expect(background(element)).toBe("rgb(0, 87, 217)"));
    element.setAttribute("button-color", "#0b5d3b");
    expect(background(element)).toBe("rgb(11, 93, 59)");
  });

  it("takes the store's saved look, fetched once for every element on the page", async () => {
    stub = stubCatalog();
    stub.look = {
      low_stock_threshold: 5,
      button_color: "#0057d9",
      button_text_color: "#fffbe6",
      button_radius: 6,
      button_text: "Add to bag",
      font: "serif",
      custom_css: ".foxy-product-label { letter-spacing: 2px; }",
    };
    let lookRequests = 0;
    const stubbed = window.fetch;
    window.fetch = (input, init) => {
      if (String(input).endsWith("/s/products/store/settings")) lookRequests++;
      return stubbed(input, init);
    };
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" show-price="false"></foxy-product-link><foxy-product-link store="${FIXTURE_STORE}" sku="TEE-ORG-BLK-S"></foxy-product-link>`);
    await settle();
    const style = getComputedStyle(link(element)!);
    expect(lookRequests).toBe(1);
    expect(style.backgroundColor).toBe("rgb(0, 87, 217)");
    expect(style.color).toBe("rgb(255, 251, 230)");
    expect(style.borderRadius).toBe("6px");
    expect(style.fontFamily).toContain("Georgia");
    expect(link(element)?.textContent).toBe("Add to bag");
    expect(getComputedStyle(element.querySelector(".foxy-product-label")!).letterSpacing).toBe("2px");
  });

  it("lets an attribute, then the page's CSS variable, win over the store's look", async () => {
    stub = stubCatalog();
    stub.look = { button_color: "#0057d9", button_text: "Add to bag" };
    document.body.innerHTML = `
      <div style="--foxy-product-button-color: rgb(120, 30, 90)">
        <foxy-product-link id="page" store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link>
        <foxy-product-link id="attribute" store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" button-color="rgb(11, 93, 59)" label="Buy the mug"></foxy-product-link>
      </div>
      <foxy-product-link id="store" store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link>`;
    await settle();
    const get = (id: string) => document.getElementById(id)!;
    expect(background(get("store"))).toBe("rgb(0, 87, 217)");
    expect(background(get("page"))).toBe("rgb(120, 30, 90)");
    expect(background(get("attribute"))).toBe("rgb(11, 93, 59)");
    expect(link(get("attribute"))?.textContent).toBe("Buy the mug");
  });

  it("treats the store's look as untrusted", async () => {
    stub = stubCatalog();
    stub.look = {
      button_color: "red; background: url(https://x.example/a.png)",
      button_radius: "9px",
      button_text: "<b>Add</b>",
      font: "Comic Sans MS",
      custom_css: "</style><script>window.foxyLookRan = true</script><b id='foxy-look-markup'>x</b>",
    };
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" show-price="false"></foxy-product-link>`);
    await settle();
    expect(background(element)).toBe("rgb(17, 24, 39)");
    expect(getComputedStyle(link(element)!).borderRadius).toBe("8px");
    expect(link(element)?.textContent).toBe("Add to cart");
    // The CSS is the text of a style element, so markup in it is never parsed.
    expect(document.getElementById("foxy-look-markup")).toBeNull();
    expect((window as { foxyLookRan?: boolean }).foxyLookRan).toBeUndefined();
    expect(document.head.querySelector("style[data-foxy-store-css]")?.childElementCount).toBe(0);
  });

  it("keeps the defaults, quietly, when the look can't be fetched", async () => {
    stub = stubCatalog();
    const stubbed = window.fetch;
    window.fetch = (input, init) =>
      String(input).endsWith("/s/products/store/settings")
        ? Promise.reject(new TypeError("Failed to fetch"))
        : stubbed(input, init);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" currency="USD"></foxy-product-link>`);
    await settle();
    expect(background(element)).toBe("rgb(17, 24, 39)");
    expect(link(element)?.textContent).toBe("Add to cart · $16.40 $18.90");
    expect(warn).toHaveBeenCalledTimes(1);
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
