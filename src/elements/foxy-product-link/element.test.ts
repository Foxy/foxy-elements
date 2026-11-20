import { afterEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_STORE, engravedMug, plainMug, stubCatalog, teeParent, type CatalogStub } from "@/lib/products/fixtures";
import type { CatalogProduct } from "@/lib/products/types";
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

  it("leaves the price out of a button too narrow for it, keeping the label on one line", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<div id="frame" style="width: 420px"><foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" currency="USD" theme="bookshop"></foxy-product-link></div>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-link")!;
    await settle();
    const frame = document.getElementById("frame")!;
    const box = (selector: string) => element.querySelector(selector)!.getBoundingClientRect();
    const lineHeight = () => parseFloat(getComputedStyle(element.querySelector(".foxy-product-label")!).lineHeight);
    const priceShown = () => box(".foxy-product-button-price").top < box(".foxy-product-button-text").bottom;

    expect(priceShown()).toBe(true);
    expect(box(".foxy-product-button-price").top).toBe(box(".foxy-product-label").top);

    frame.style.width = "200px";
    expect(priceShown()).toBe(false);
    expect(box(".foxy-product-label").height).toBeLessThanOrEqual(lineHeight());
    expect(box(".foxy-product-button").width).toBeLessThanOrEqual(200);
    // Still in the link's text, for screen readers.
    expect(link(element)?.textContent).toBe("Add to cart · $16.40 $18.90");

    // Too narrow for the label alone, it wraps rather than being cut off.
    frame.style.width = "100px";
    expect(box(".foxy-product-label").height).toBeGreaterThan(lineHeight());
    expect(box(".foxy-product-button-text").height).toBe(box(".foxy-product-label").height);

    frame.style.width = "420px";
    expect(priceShown()).toBe(true);
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

  it("shows what its quantity costs, as the cart will charge it", async () => {
    stub = stubCatalog();
    // 3 × $16.40 is $49.20; 3 × $18.90, the list price, is $56.70.
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" quantity="3" currency="USD"></foxy-product-link>`);
    await settle();
    expect(link(element)?.textContent).toBe("Add to cart · $49.20 $56.70");

    element.setAttribute("sku", "MUG-ENM-ENGRAVE");
    element.setAttribute("value", "engraving=Jo");
    element.setAttribute("quantity", "2");
    await settle();
    expect(link(element)?.href).toContain("quantity=2");
    expect(link(element)?.textContent).toBe("Add to cart · $55.00 $60.00");
  });

  it("rounds what its quantity costs to the currency's own decimals", async () => {
    const dinars = { ...plainMug.definition, price: "1.235", list_price: undefined, prices: undefined };
    stub = stubCatalog([{ ...plainMug, currency_code: "KWD", definition: dinars }]);
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" quantity="3" lang="en-US"></foxy-product-link>`);
    await settle();
    // 3 × 1.235 is 3.705; rounded to cents first, it would read 3.710.
    const total = new Intl.NumberFormat("en-US", { style: "currency", currency: "KWD" }).format(3.705);
    expect(link(element)?.textContent).toBe(`Add to cart · ${total}`);
  });

  it("shows the price, struck-through list price and currency amount", async () => {
    stub = stubCatalog();
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" show-price currency="EUR" lang="en-US"></foxy-product-link>`);
    await settle();
    // EUR has its own price but no list price there, so only the price shows.
    expect(element.querySelector(".foxy-product-price")?.textContent).toBe("€15.20");
    expect(link(element)?.textContent).toBe("Add to cart · €15.20");

    element.removeAttribute("currency");
    expect(element.querySelector(".foxy-product-price")?.textContent).toBe("$16.40 $18.90");
    expect(element.querySelector("s")?.getAttribute("aria-label")).toBe("Was $18.90");
  });

  it("shows the price in the currency the catalog says it is in, not the one the page wants", async () => {
    stub = stubCatalog();
    // The mug has no GBP price, and the catalog says its price is in USD.
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" currency="GBP"></foxy-product-link>`);
    await settle();
    expect(stub.requests).toEqual(["/s/products/MUG-ENM-WHT"]);
    expect(link(element)?.textContent).toBe("Add to cart · $16.40 $18.90");
  });

  it("shows a plain amount when the catalog doesn't say which currency the price is in", async () => {
    stub = stubCatalog([{ ...plainMug, currency_code: undefined }]);
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" currency="GBP"></foxy-product-link>`);
    await settle();
    expect(link(element)?.textContent).toBe("Add to cart · 16.40 18.90");
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
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-ENGRAVE"><a href="/mug">See the mug</a></foxy-product-link>`);
    await settle();
    expect(link(element)).toBeNull();
    expect(element.textContent).toBe("See the mug");
  });

  it("stays on the page for a parent's SKU when the merchant wrote nothing inside it, saying what to choose", async () => {
    stub = stubCatalog();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="TEE-ORG">
    </foxy-product-link>`);
    await settle();
    expect(link(element)?.textContent).toBe("Choose colour and size");
    expect(link(element)?.hasAttribute("href")).toBe(false);
    expect(link(element)?.getAttribute("aria-disabled")).toBe("true");
    expect(link(element)!.getBoundingClientRect().height).toBeGreaterThan(40);
  });

  it("sends a parent's SKU to the product's page when the store says where that is", async () => {
    stub = stubCatalog();
    stub.look = { product_url: "/products/{sku}" };
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="TEE-ORG"></foxy-product-link>`);
    await settle();
    expect(link(element)?.getAttribute("href")).toBe("/products/TEE-ORG");
    expect(link(element)?.textContent).toBe("Choose colour and size");
    expect(link(element)?.hasAttribute("aria-disabled")).toBe(false);
  });

  describe("a variant with a required modifier", () => {
    // A variant's definition carries its parent's options, which its own
    // option values have already chosen; only the gift box is left.
    const [blackSmall] = teeParent._embedded!.variants!;
    const boxed: CatalogProduct = {
      ...blackSmall,
      definition: {
        ...blackSmall.definition,
        modifiers: [
          { name: "gift_box", label: "Gift box", type: "select", required: true, values: [
            { value: "Kraft" },
            { value: "Black linen", price_mod: "3.75" },
          ] },
        ],
      },
    };
    const mountBoxed = async (attributes = "") => {
      stub = stubCatalog([boxed, engravedMug]);
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="TEE-ORG-BLK-S" currency="USD" ${attributes}></foxy-product-link>`);
      await settle();
      return element;
    };

    it("asks only for what is missing, and goes to the product's page when the store says where that is", async () => {
      stub = stubCatalog([boxed]);
      stub.look = { product_url: "/products/{sku}" };
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="TEE-ORG-BLK-S"></foxy-product-link>`);
      await settle();
      expect(link(element)?.textContent).toBe("Choose a gift box");
      expect(link(element)?.getAttribute("href")).toBe("/products/TEE-ORG-BLK-S");
    });

    it("adds in one click with the modifier preset by value, priced with it", async () => {
      const element = await mountBoxed(`value="gift_box=black linen"`);
      expect(link(element)?.href).toBe(`https://${FIXTURE_STORE}/cart?sku=TEE-ORG-BLK-S&gift_box=Black+linen`);
      expect(link(element)?.textContent).toBe("Add to cart · $28.70");
    });

    it("ignores a preset the cart would refuse", async () => {
      const element = await mountBoxed(`value="gift_box=Velvet&colour=Red"`);
      expect(link(element)?.textContent).toBe("Choose a gift box");
      expect(link(element)?.hasAttribute("href")).toBe(false);
    });

    it("takes a text modifier's preset, within its length", async () => {
      stub = stubCatalog([engravedMug]);
      const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-ENGRAVE" currency="USD" value="engraving=Jo%20%26%20Sam"></foxy-product-link>`);
      await settle();
      expect(link(element)?.href).toBe(`https://${FIXTURE_STORE}/cart?sku=MUG-ENM-ENGRAVE&engraving=Jo+%26+Sam`);
      expect(link(element)?.textContent).toBe("Add to cart · $27.50 $30.00");

      vi.spyOn(console, "warn").mockImplementation(() => {});
      element.setAttribute("value", `engraving=${"x".repeat(21)}`);
      expect(link(element)?.textContent).toBe("Choose an engraving");
    });
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

  it("is the bold theme by default, and dark on any page with theme=\"dark\"", async () => {
    stub = stubCatalog();
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link>`);
    await settle();
    const style = getComputedStyle(link(element)!);
    expect(style.backgroundColor).toBe("rgb(17, 24, 39)");
    expect(style.color).toBe("rgb(255, 255, 255)");
    expect(style.borderRadius).toBe("8px");

    // A light button with an edge, so it shows on a white page too.
    element.setAttribute("theme", "dark");
    expect(style.backgroundColor).toBe("rgb(249, 250, 251)");
    expect(style.color).toBe("rgb(17, 24, 39)");
    expect(style.borderTopWidth).toBe("1px");

    // A text link stands on a dark patch of its own.
    element.setAttribute("appearance", "text");
    const text = getComputedStyle(link(element)!);
    expect(text.backgroundColor).toBe("rgb(17, 24, 39)");
    expect(text.color).toBe("rgb(249, 250, 251)");

    element.setAttribute("theme", "cart");
    expect(getComputedStyle(link(element)!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("uses the store's theme unless it names one of its own, and theme=\"bold\" is the default look", async () => {
    stub = stubCatalog();
    stub.look = { theme: "soft" };
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link>`);
    await vi.waitFor(() => expect(background(element)).toBe("rgb(37, 99, 235)"));
    expect(getComputedStyle(link(element)!).borderRadius).toBe("12px");

    element.setAttribute("theme", "foxy");
    expect(background(element)).toBe("rgb(91, 42, 134)");
    element.setAttribute("theme", "bold");
    expect(background(element)).toBe("rgb(17, 24, 39)");
    expect(getComputedStyle(link(element)!).borderRadius).toBe("8px");
    element.removeAttribute("theme");
    expect(background(element)).toBe("rgb(37, 99, 235)");
  });

  it("takes settings the page gives it, in place and without a request", async () => {
    stub = stubCatalog();
    stub.look = { button_color: "#0057d9" };
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" show-price="false"></foxy-product-link>`);
    await vi.waitFor(() => expect(background(element)).toBe("rgb(0, 87, 217)"));
    const fetched = vi.spyOn(window, "fetch");

    window.dispatchEvent(
      new CustomEvent("foxy-product-settings", {
        detail: {
          store: `https://${FIXTURE_STORE}/`,
          settings: { button_color: "#0b5d3b", button_radius: 2, button_text: "Add to bag", theme: "dark" },
        },
      }),
    );
    expect(background(element)).toBe("rgb(11, 93, 59)");
    expect(getComputedStyle(link(element)!).borderRadius).toBe("2px");
    expect(getComputedStyle(link(element)!).color).toBe("rgb(17, 24, 39)");
    expect(link(element)?.textContent).toBe("Add to bag");

    // What isn't in the new settings goes back to the default; another store's are ignored.
    window.dispatchEvent(new CustomEvent("foxy-product-settings", { detail: { store: FIXTURE_STORE, settings: {} } }));
    window.dispatchEvent(
      new CustomEvent("foxy-product-settings", { detail: { store: "other.foxycart.com", settings: { button_color: "#ff0000" } } }),
    );
    expect(background(element)).toBe("rgb(17, 24, 39)");
    expect(link(element)?.textContent).toBe("Add to cart");

    // An element added later starts from them too.
    const later = document.createElement("foxy-product-link");
    later.setAttribute("store", FIXTURE_STORE);
    later.setAttribute("sku", "MUG-ENM-WHT");
    window.dispatchEvent(
      new CustomEvent("foxy-product-settings", { detail: { store: FIXTURE_STORE, settings: { button_color: "#0b5d3b" } } }),
    );
    document.body.append(later);
    await vi.waitFor(() => expect(background(later)).toBe("rgb(11, 93, 59)"));
    expect(fetched).not.toHaveBeenCalled();
  });

  it("isn't overwritten by a request for the store's settings that answers after the page gave its own", async () => {
    stub = stubCatalog();
    stub.look = { button_color: "#0057d9" };
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link>`);
    window.dispatchEvent(
      new CustomEvent("foxy-product-settings", { detail: { store: FIXTURE_STORE, settings: { button_color: "#0b5d3b" } } }),
    );
    await settle();
    expect(background(element)).toBe("rgb(11, 93, 59)");
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

describe("the themes it publishes", () => {
  it("lists the variables each theme sets, which are the ones the stylesheet uses", async () => {
    const { themes } = customElements.get("foxy-product-link") as unknown as {
      themes: Record<string, Record<string, string>>;
    };
    expect(Object.keys(themes)).toEqual(["bold", "plain", "foxy", "bookshop", "soft", "market", "dark"]);
    expect(themes.market["--foxy-theme-button-color"]).toBe("#B45309");
    expect(themes.bold["--foxy-theme-button-radius"]).toBe("8px");
    expect(Object.keys(themes.dark)).toContain("--foxy-product-backdrop-color");

    stub = stubCatalog();
    const element = mount(`<foxy-product-link theme="market" store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link>`);
    await settle();
    for (const [name, variables] of Object.entries(themes)) {
      element.setAttribute("theme", name);
      const style = getComputedStyle(link(element)!);
      const probe = document.createElement("i");
      probe.style.color = variables["--foxy-theme-button-color"] ?? themes.bold["--foxy-theme-button-color"];
      probe.style.borderRadius = variables["--foxy-theme-button-radius"] ?? themes.bold["--foxy-theme-button-radius"];
      element.append(probe);
      if (name !== "plain") expect(style.backgroundColor).toBe(getComputedStyle(probe).color);
      expect(style.borderTopLeftRadius).toBe(getComputedStyle(probe).borderTopLeftRadius);
      probe.remove();
    }
  });

  it("styles the price and the list price by their own classes and variables", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<style>foxy-product-link { --foxy-product-price-color: rgb(180, 83, 9); --foxy-product-list-price-color: rgb(20, 20, 200); --foxy-product-list-price-size: 11px; }</style><p><foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link></p>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-link")!;
    await settle();
    const was = element.querySelector(".foxy-product-price .foxy-product-list-price")!;
    expect(was.textContent).toBe("$18.90");
    expect(getComputedStyle(was).fontSize).toBe("11px");
    // Inside the link both take the link's own colour, as its text does.
    expect(getComputedStyle(was).color).toBe(getComputedStyle(link(element)!).color);
  });

  it("draws a button's list price in the button's text colour, so it stays readable", async () => {
    stub = stubCatalog();
    stub.look = { button_color: "#0057d9" };
    const element = mount(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" show-price currency="USD"></foxy-product-link>`);
    await settle();
    const was = element.querySelector(".foxy-product-button-price .foxy-product-list-price")!;
    expect(was.textContent).toBe("$18.90");
    expect(getComputedStyle(was).color).toBe(getComputedStyle(link(element)!).color);
    expect(getComputedStyle(was).opacity).toBe("1");
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

describe("foxy-product-link's analytics", () => {
  const added = {
    currency: "USD",
    value: 32.8,
    items: [{ item_id: "MUG-ENM-WHT", item_name: "Enamel Camp Mug, White", item_brand: "Foxy Goods", price: 16.4, quantity: 2 }],
  };

  /** A page with 2.0's foxycart.js, whose cart takes the next add when `takes`. */
  async function withFoxy2(html: string) {
    const handlers: Record<string, () => void> = {};
    window.FC = {
      json: { item_count: 3 },
      client: { on: (event: string, handler: () => void) => (handlers[event] = handler) },
    };
    const element = mount(html);
    element.addEventListener("click", (event) => event.preventDefault());
    await vi.waitFor(() => expect(handlers["cart-submit.done"]).toBeDefined());
    await settle();
    return {
      element,
      async add(takes: boolean) {
        link(element)!.click();
        if (takes) window.FC!.json!.item_count! += 2;
        handlers["cart-submit.done"]();
        await settle();
      },
    };
  }

  afterEach(() => {
    delete window.FC;
    delete window.dataLayer;
    delete window.gtag;
  });

  it("tells the page of an add once the cart took it, and Google only when the store says to", async () => {
    stub = stubCatalog();
    const heard: unknown[] = [];
    document.body.addEventListener("foxy-product:add-to-cart", (event) => heard.push((event as CustomEvent).detail), { once: true });
    const { add } = await withFoxy2(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" quantity="2"></foxy-product-link>`);
    await add(true);
    expect(heard).toEqual([added]);
    expect(window.dataLayer).toBeUndefined();
  });

  it("pushes add_to_cart to the dataLayer, clearing ecommerce first, when the store has analytics on", async () => {
    stub = stubCatalog();
    stub.look = { analytics: true };
    const { add } = await withFoxy2(`<foxy-product-link store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" quantity="2"></foxy-product-link>`);
    await add(false);
    expect(window.dataLayer).toBeUndefined();
    await add(true);
    expect(window.dataLayer).toEqual([{ ecommerce: null }, { event: "add_to_cart", ecommerce: added }]);
  });

  it("goes through gtag instead when the page has Google's own tag, so nothing is counted twice", async () => {
    stub = stubCatalog();
    const gtag = (window.gtag = vi.fn());
    window.dataLayer = [];
    const { add } = await withFoxy2(`<foxy-product-link analytics store="${FIXTURE_STORE}" sku="MUG-ENM-WHT" quantity="2"></foxy-product-link>`);
    await add(true);
    expect(gtag.mock.calls).toEqual([["event", "add_to_cart", added]]);
    expect(window.dataLayer).toEqual([]);
  });

  it("pushes nothing with analytics=\"off\", whatever the store says", async () => {
    stub = stubCatalog();
    stub.look = { analytics: true };
    const heard = vi.fn();
    document.body.addEventListener("foxy-product:add-to-cart", heard, { once: true });
    const { add } = await withFoxy2(`<foxy-product-link analytics="off" store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-link>`);
    await add(true);
    expect(heard).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toBeUndefined();
  });
});
