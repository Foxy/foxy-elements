import { afterEach, describe, expect, it } from "vitest";
import { fetchProduct, fetchProducts, resolveStoreDomain } from "./catalog";
import {
  engravedMug,
  FIXTURE_STORE,
  legacyParent,
  plainMug,
  stubCatalog,
  teeParent,
  type CatalogStub,
} from "./fixtures";
import {
  cartFields,
  invalidModifiers,
  livePrice,
  modifierValues,
  offeredModifiers,
  quantityBounds,
} from "./choices";
import { stockNote } from "./light-dom";
import { fetchLook, parseLook } from "./look";
import { renderMarkdown } from "./markdown";
import {
  hasOptionControls,
  isOneClick,
  optionKey,
  parseChoices,
  keepOffered,
  valueStates,
  variantFor,
} from "./options";
import {
  amountIn,
  formatPrice,
  priceRange,
  productName,
  productPrice,
  resolveCurrency,
} from "./price";

let stub: CatalogStub | undefined;

afterEach(() => {
  stub?.restore();
  stub = undefined;
  document.body.innerHTML = "";
  document.head.querySelectorAll("script[data-test]").forEach((s) => s.remove());
  delete window.FC;
});

describe("resolveStoreDomain", () => {
  it("prefers the store attribute, without a scheme or trailing slash", () => {
    const element = document.createElement("div");
    element.setAttribute("store", "https://shop.example.com/");
    window.FC = { settings: { storedomain: "other.foxycart.com" } };
    expect(resolveStoreDomain(element)).toBe("shop.example.com");
  });

  it("uses the domain 2.0's foxycart.js was loaded for", () => {
    window.FC = { settings: { storedomain: "demo-goods.foxycart.com" } };
    expect(resolveStoreDomain(document.createElement("div"))).toBe("demo-goods.foxycart.com");
  });

  it("reads the loader.js URL before foxycart.js has loaded", () => {
    const script = document.createElement("script");
    script.dataset.test = "";
    script.type = "text/plain";
    script.src = "https://cdn.foxycart.com/shop.example.com/loader.js";
    document.head.append(script);
    expect(resolveStoreDomain(document.createElement("div"))).toBe("shop.example.com");
  });
});

describe("fetchProduct", () => {
  it("makes one request per SKU however many elements ask", async () => {
    stub = stubCatalog();
    const [a, b] = await Promise.all([
      fetchProduct(FIXTURE_STORE, "TEE-ORG"),
      fetchProduct(FIXTURE_STORE, "TEE-ORG"),
    ]);
    expect(a?.sku).toBe("TEE-ORG");
    expect(b).toBe(a);
    expect(stub.requests).toEqual(["/s/products/TEE-ORG"]);
  });

  it("answers null for an unknown SKU", async () => {
    stub = stubCatalog();
    expect(await fetchProduct(FIXTURE_STORE, "NOPE-1")).toBeNull();
  });

  it("follows the next link the catalog gives", async () => {
    stub = stubCatalog();
    const first = await fetchProducts(FIXTURE_STORE, { tag: "mugs", limit: 2 });
    expect(stub.requests[0]).toBe("/s/products?tag=mugs&limit=2");
    expect(first.next).toBe("/s/products?cursor=2");
    await fetchProducts(FIXTURE_STORE, {}, first.next);
    expect(stub.requests[1]).toBe("/s/products?cursor=2");
  });

  it("asks for each parent's variants when wanted, and remembers a parent that came with them", async () => {
    stub = stubCatalog();
    const page = await fetchProducts(FIXTURE_STORE, { variants: true });
    expect(stub.requests).toEqual(["/s/products?zoom=variants"]);
    expect(page.products[0]._embedded?.variants).toHaveLength(6);
    await fetchProduct(FIXTURE_STORE, "TEE-ORG");
    expect(stub.requests).toHaveLength(1);
  });
});

describe("prices", () => {
  it("uses the currency's own amount when the product sets one", () => {
    expect(amountIn("24.95", { EUR: "22.95" }, "EUR")).toBe(22.95);
    expect(amountIn("24.95", { EUR: "22.95" }, "GBP")).toBe(24.95);
    expect(amountIn(16.4, undefined, null)).toBe(16.4);
  });

  it("keeps a list price only when it's higher", () => {
    expect(productPrice(plainMug, null)).toEqual({ price: 16.4, listPrice: 18.9 });
    expect(productPrice({ ...plainMug, definition: { price: "9.99", list_price: "9.99" } }, null).listPrice).toBeNull();
  });

  it("computes a parent's range from its variants", () => {
    expect(priceRange(teeParent, null)).toEqual({ min: 24.95, max: 26.95 });
    expect(priceRange(teeParent, "EUR")).toEqual({ min: 22.95, max: 24.8 });
    expect(priceRange(plainMug, null)).toEqual({ min: 16.4, max: 16.4 });
  });

  it("formats in the currency, or as a plain amount when none is known", () => {
    expect(formatPrice(1234.5, "EUR", "de-DE")).toBe("1.234,50 €");
    expect(formatPrice(16.4, null, "en-US")).toBe("16.40");
    expect(formatPrice(16.4, "USD", "not a locale!")).toBe("$16.40");
  });

  it("picks the currency from the page, then a cookie, then the 2.0 session", () => {
    const outer = document.createElement("div");
    const element = document.createElement("span");
    outer.append(element);
    document.body.append(outer);
    expect(resolveCurrency(element)).toBeNull();

    window.FC = { json: { locale_info: { int_curr_symbol: "CAD " } } };
    expect(resolveCurrency(element)).toBe("CAD");

    document.cookie = "shop_currency=gbp; path=/";
    outer.setAttribute("currency-cookie", "shop_currency");
    expect(resolveCurrency(element)).toBe("GBP");

    outer.setAttribute("currency", "eur");
    expect(resolveCurrency(element)).toBe("EUR");
    document.cookie = "shop_currency=; max-age=0; path=/";
  });

  it("shows the name in the shopper's language when there's a translation", () => {
    expect(productName(teeParent, "fr-FR")).toBe("T-shirt en coton bio");
    expect(productName(teeParent, "fr-CA")).toBe("T-shirt en coton bio");
    expect(productName(teeParent, "de-DE")).toBe("Organic Cotton Tee");
  });
});

describe("options", () => {
  it("builds the option key the cart builds", () => {
    expect(optionKey({ Size: " M ", color: "Black" })).toBe("color=black&size=m");
    expect(optionKey({ size: "2XL", "color": "Natural (undyed)" })).toBe(
      "color=natural%20(undyed)&size=2xl",
    );
  });

  it("tells missing values from sold-out ones", () => {
    expect(valueStates(teeParent, 0, {})).toEqual(
      new Map([["Black", "available"], ["Natural", "available"], ["Moss", "sold-out"]]),
    );
    expect(valueStates(teeParent, 1, { color: "Black" })).toEqual(
      new Map([["S", "available"], ["M", "sold-out"], ["L", "missing"], ["2XL", "available"]]),
    );
    expect(valueStates(teeParent, 1, { color: "Natural" })).toEqual(
      new Map([["S", "missing"], ["M", "available"], ["L", "available"], ["2XL", "missing"]]),
    );
  });

  it("drops a choice that is ruled out or sold out, and never chooses for the shopper", () => {
    expect(keepOffered(teeParent, {})).toEqual({});
    expect(keepOffered(teeParent, { color: "natural", size: "L" })).toEqual({ color: "Natural", size: "L" });
    // S doesn't come in Natural; M is sold out in Black; Moss is sold out altogether.
    expect(keepOffered(teeParent, { color: "Natural", size: "S" })).toEqual({ color: "Natural" });
    expect(keepOffered(teeParent, { color: "Black", size: "M" })).toEqual({ color: "Black" });
    expect(keepOffered(teeParent, { color: "Moss", size: "S" })).toEqual({ size: "S" });
  });

  it("finds the variant for a full set of choices, case-insensitively", () => {
    expect(variantFor(teeParent, { color: "black", size: "2xl" })?.sku).toBe("TEE-ORG-BLK-2XL");
    expect(variantFor(teeParent, { color: "Black" })).toBeUndefined();
    expect(variantFor(teeParent, { color: "Natural", size: "S" })).toBeUndefined();
  });

  it("parses preselected values", () => {
    expect(parseChoices("color=Natural&size=L")).toEqual({ color: "Natural", size: "L" });
    expect(parseChoices(null)).toEqual({});
  });

  it("offers option controls only when the variants carry option values", () => {
    expect(hasOptionControls(teeParent)).toBe(true);
    expect(hasOptionControls(legacyParent)).toBe(false);
  });

  it("knows what one click can buy", () => {
    expect(isOneClick(plainMug)).toBe(true);
    expect(isOneClick(teeParent._embedded!.variants![0])).toBe(true);
    expect(isOneClick(teeParent)).toBe(false);
    expect(isOneClick(engravedMug)).toBe(false);
    expect(isOneClick({ ...teeParent, variant_count: 0, _embedded: undefined })).toBe(true);
  });
});

describe("choices", () => {
  const state = { choices: { color: "Black", size: "2XL" }, variantSku: null, modifiers: { gift_wrap: "Yes" }, quantity: 1 };
  const naturalLarge = { ...state, choices: { color: "Natural", size: "L" } };
  const names = (modifiers: Array<{ name: string }>) => modifiers.map(({ name }) => name);

  it("offers the parent's modifiers until a variant is chosen, then the variant's", () => {
    expect(names(offeredModifiers(teeParent, { ...state, choices: { color: "Natural" } }))).toEqual(["gift_wrap"]);
    expect(names(offeredModifiers(teeParent, state))).toEqual(["gift_wrap"]);
    expect(names(offeredModifiers(teeParent, naturalLarge))).toEqual(["monogram"]);
  });

  it("never sends a modifier the chosen variant doesn't declare", () => {
    expect(cartFields(teeParent, { ...naturalLarge, modifiers: { gift_wrap: "Yes", monogram: "JF" } })).toEqual([
      ["sku", "TEE-ORG"],
      ["color", "Natural"],
      ["size", "L"],
      ["monogram", "JF"],
    ]);
  });

  it("starts an optional choice on its first value, a required one empty, and keeps what was entered", () => {
    const modifiers = engravedMug.definition.modifiers!;
    expect(modifierValues(modifiers)).toEqual({ gift_wrap: "No" });
    expect(modifierValues(modifiers, { gift_wrap: "Yes", engraving: "Joey", monogram: "JF" })).toEqual({
      engraving: "Joey",
      gift_wrap: "Yes",
    });
    expect(modifierValues([{ ...modifiers[1], required: true }])).toEqual({});
  });

  it("adds modifier amounts in the shopper's currency", () => {
    expect(livePrice(teeParent, state, null)).toEqual({ price: 31.45, listPrice: null });
    expect(livePrice(teeParent, state, "EUR")).toEqual({ price: 29, listPrice: null });
    expect(livePrice(teeParent, { ...state, choices: { color: "Black" } }, null)).toBeNull();
  });

  it("leaves out empty modifiers and a quantity of one", () => {
    expect(cartFields(engravedMug, { ...state, modifiers: { engraving: "  ", gift_wrap: "Yes" } })).toEqual([
      ["sku", "MUG-ENM-ENGRAVE"],
      ["gift_wrap", "Yes"],
    ]);
  });

  it("checks what the cart would refuse", () => {
    expect(invalidModifiers(engravedMug, { ...state, modifiers: {} })).toEqual(new Map([["engraving", "required"]]));
    expect(
      invalidModifiers(engravedMug, { ...state, modifiers: { engraving: "A name longer than twenty" } }),
    ).toEqual(new Map([["engraving", "too-long"]]));
  });

  it("bounds the quantity by the product's limits and its stock", () => {
    expect(quantityBounds(plainMug)).toEqual({ min: 1, max: 3 });
    expect(quantityBounds(engravedMug)).toEqual({ min: 1, max: Infinity });
    expect(
      quantityBounds({ ...plainMug, stock_level: 40, definition: { quantity_min: 2, quantity_max: 12 } }),
    ).toEqual({ min: 2, max: 12 });
  });
});

describe("the store's look", () => {
  it("keeps only values of the shape the contract allows", () => {
    expect(
      parseLook({
        low_stock_threshold: 3,
        text_color: "#1a2737",
        button_color: "#0057d9cc",
        button_text_color: "#FFF",
        button_radius: 999,
        button_text: " Add to bag ",
        font: "system",
        custom_css: "foxy-product-form h2 { letter-spacing: 0.02em; }",
      }),
    ).toEqual({
      lowStockThreshold: 3,
      textColor: "#1a2737",
      buttonColor: "#0057d9cc",
      buttonTextColor: "#FFF",
      buttonRadius: 999,
      buttonText: "Add to bag",
      font: "system",
      customCss: "foxy-product-form h2 { letter-spacing: 0.02em; }",
    });

    const nothing = parseLook(null);
    expect(
      parseLook({
        low_stock_threshold: -1,
        text_color: "red",
        button_color: "var(--x)",
        button_text_color: "#12",
        button_radius: 1000,
        button_text: "Add\tnow",
        font: "toString",
        custom_css: 12,
      }),
    ).toEqual(nothing);
    expect(nothing.lowStockThreshold).toBe(5);
  });

  it("is fetched once per store, from beside its catalog", async () => {
    stub = stubCatalog();
    stub.look = { low_stock_threshold: 2, button_text: "Add to bag" };
    const [a, b] = await Promise.all([fetchLook(FIXTURE_STORE), fetchLook(FIXTURE_STORE)]);
    expect(a).toBe(b);
    expect(a.buttonText).toBe("Add to bag");
    expect(a.lowStockThreshold).toBe(2);
  });
});

describe("stockNote", () => {
  // The mug has 3 left.
  const withThreshold = (low_stock_threshold?: number | null) => ({
    ...plainMug,
    definition: { ...plainMug.definition, low_stock_threshold },
  });
  const said = (product: typeof plainMug, storeThreshold: number) =>
    stockNote(product, storeThreshold, "en-US")?.text ?? null;

  it("uses the store's threshold when the product sets none", () => {
    expect(said(withThreshold(), 5)).toBe("Only 3 left");
    expect(said(withThreshold(null), 5)).toBe("Only 3 left");
    expect(said(withThreshold(), 2)).toBeNull();
  });

  it("lets a product's own threshold win, lower or higher than the store's", () => {
    expect(said(withThreshold(2), 5)).toBeNull();
    expect(said(withThreshold(3), 2)).toBe("Only 3 left");
    // 0 means nothing is low for this product.
    expect(said(withThreshold(0), 5)).toBeNull();
  });

  it("says sold out whatever the threshold", () => {
    expect(said({ ...withThreshold(0), is_in_stock: false, stock_level: 0 }, 0)).toBe("Sold out");
  });
});

describe("renderMarkdown", () => {
  const html = (source: string) => {
    const holder = document.createElement("div");
    holder.append(renderMarkdown(source));
    return holder.innerHTML;
  };

  it("renders the Markdown a description uses", () => {
    expect(html("A **bold** and *soft* `code`.\n\n# Fit\n\n1. One\n2. Two")).toBe(
      "<p>A <strong>bold</strong> and <em>soft</em> <code>code</code>.</p><h2>Fit</h2><ol><li>One</li><li>Two</li></ol>",
    );
  });

  it("drops raw HTML and any link that isn't https", () => {
    expect(html('<b onclick="x()">Hi</b> [a](http://x.example) [b](https://x.example/p) [c](javascript:alert(1))')).toBe(
      '<p>Hi a <a href="https://x.example/p" rel="noopener nofollow">b</a> c</p>',
    );
    expect(html("1 < 2 and <script>alert(1)</script>")).toBe("<p>1 &lt; 2 and alert(1)</p>");
  });
});
