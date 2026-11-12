import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FIXTURE_STORE,
  listed,
  plainMug,
  stubCatalog,
  teeParent,
  type CatalogStub,
} from "@/lib/products/fixtures";
import { listenLikeFoxy2, settle } from "@/lib/products/foxy2-test-utils";
import "./element";

let stub: CatalogStub | undefined;

async function mount(attributes: string, currency = "USD"): Promise<HTMLElement> {
  stub ??= stubCatalog();
  document.body.innerHTML = `<foxy-product-tile store="${FIXTURE_STORE}" lang="en-US" currency="${currency}" ${attributes}></foxy-product-tile>`;
  const element = document.body.querySelector<HTMLElement>("foxy-product-tile")!;
  await vi.waitFor(() => expect(element.querySelector("article")).not.toBeNull());
  await settle();
  return element;
}

const jsonLd = (element: HTMLElement) =>
  JSON.parse(element.querySelector('script[type="application/ld+json"]')!.textContent!);
const action = (element: HTMLElement) => element.querySelector<HTMLAnchorElement>("a.foxy-product-button");

afterEach(() => {
  stub?.restore();
  stub = undefined;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("foxy-product-tile", () => {
  it("adds a simple product in one click, through 2.0's click handler", async () => {
    const element = await mount(`sku="MUG-ENM-WHT" href="/shop/{sku}"`);
    expect(element.shadowRoot).toBeNull();
    expect(element.querySelector("h3")?.textContent).toBe("Enamel Camp Mug, White");
    expect(element.querySelector(".foxy-product-brand")?.textContent).toBe("Foxy Goods");
    expect(element.querySelector(".foxy-product-note")?.textContent).toBe("Only 3 left");
    expect(element.querySelector("img")?.getAttribute("width")).toBe("1000");
    expect(element.querySelector(".foxy-product-price")?.textContent).toBe("$16.40 $18.90");
    expect(action(element)?.href).toBe(`https://${FIXTURE_STORE}/cart?sku=MUG-ENM-WHT`);
    expect(element.querySelector<HTMLAnchorElement>("h3 a")?.getAttribute("href")).toBe("/shop/MUG-ENM-WHT");

    const foxy2 = listenLikeFoxy2(FIXTURE_STORE);
    action(element)!.click();
    foxy2.stop();
    expect(foxy2.clicked).toEqual([action(element)]);
  });

  it("uses the product's own low-stock threshold over the store's", async () => {
    // The mug has 3 left and the store's threshold is 5.
    stub = stubCatalog([{ ...plainMug, definition: { ...plainMug.definition, low_stock_threshold: 2 } }]);
    const element = await mount(`sku="MUG-ENM-WHT"`);
    expect(element.querySelector(".foxy-product-note")).toBeNull();
  });

  it("links a parent to its page, with its price range", async () => {
    const element = await mount(`sku="TEE-ORG" href="/shop/{sku}"`);
    expect(element.querySelector(".foxy-product-price")?.textContent).toBe("$24.95 – $26.95");
    expect(action(element)?.getAttribute("href")).toBe("/shop/TEE-ORG");
    expect(action(element)?.textContent).toBe("Choose colour and size");
    expect(element.querySelector(`a[href*="/cart"]`)).toBeNull();
  });

  it("links a product with a required modifier to its page instead of adding", async () => {
    const element = await mount(`sku="MUG-ENM-ENGRAVE" href="/shop/{sku}"`);
    expect(action(element)?.getAttribute("href")).toBe("/shop/MUG-ENM-ENGRAVE");
    expect(action(element)?.textContent).toBe("Choose options");
  });

  it("shows a parent given without its variants at its own price, with no request", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<foxy-product-tile store="${FIXTURE_STORE}" currency="USD" href="/shop/{sku}"></foxy-product-tile>`;
    const element = document.body.querySelector("foxy-product-tile")!;
    element.product = listed(teeParent);
    await settle();
    expect(stub.requests).toEqual([]);
    expect(element.querySelector(".foxy-product-price")?.textContent).toBe("$24.95");
    expect(action(element)?.getAttribute("href")).toBe("/shop/TEE-ORG");
  });

  it("says a sold-out product is sold out, with nothing to add and its name still linked", async () => {
    const element = await mount(`sku="COF-HUILA-340" href="/shop/{sku}"`);
    expect(element.querySelector(".foxy-product-note")?.textContent).toBe("Sold out");
    expect(action(element)?.textContent).toBe("Sold out");
    expect(action(element)?.hasAttribute("href")).toBe(false);
    expect(action(element)?.getAttribute("aria-disabled")).toBe("true");
    expect(element.querySelector("h3 a")?.getAttribute("href")).toBe("/shop/COF-HUILA-340");
  });

  it("links instead of adding when quick-add is never", async () => {
    const element = await mount(`sku="MUG-ENM-WHT" href="/shop/{sku}" quick-add="never"`);
    expect(action(element)?.getAttribute("href")).toBe("/shop/MUG-ENM-WHT");
    expect(action(element)?.textContent).toBe("View product");
  });

  it("emits schema.org Product data", async () => {
    const element = await mount(`sku="TEE-ORG" href="https://shop.example.com/p/{sku}"`);
    expect(jsonLd(element)).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Organic Cotton Tee",
      sku: "TEE-ORG",
      image: ["https://images.example.com/tee-black.jpg", "https://images.example.com/tee-black-back.jpg"],
      brand: { "@type": "Brand", name: "Foxy Goods" },
      gtin: "00850006493014",
      url: "https://shop.example.com/p/TEE-ORG",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "24.95",
        highPrice: "26.95",
        offerCount: 6,
        availability: "https://schema.org/InStock",
      },
    });
  });

  it("leaves the offer out when the currency isn't known", async () => {
    const element = await mount(`sku="MUG-ENM-WHT"`, "");
    expect(jsonLd(element).offers).toBeUndefined();
  });

  it("can't close its script with a product's name", async () => {
    stub = stubCatalog([{ ...teeParent, definition: { ...teeParent.definition, name: "</script><b>x" } }]);
    const element = await mount(`sku="TEE-ORG"`);
    expect(element.querySelector("b")).toBeNull();
    expect(jsonLd(element).name).toBe("</script><b>x");
  });
});
