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
  hasOptionControls,
  isOneClick,
  optionKey,
  parseChoices,
  settleChoices,
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

  it("replaces a choice the earlier ones rule out with the first available", () => {
    expect(settleChoices(teeParent, {})).toEqual({ color: "Black", size: "S" });
    expect(settleChoices(teeParent, { color: "natural", size: "S" })).toEqual({
      color: "Natural",
      size: "M",
    });
    expect(settleChoices(teeParent, { color: "Moss" })).toEqual({ color: "Moss", size: "S" });
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
