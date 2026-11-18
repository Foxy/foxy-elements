import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  FIXTURE_STORE,
  plainMug,
  stubCatalog,
  teeParent,
  type CatalogStub,
} from "@/lib/products/fixtures";
import { listenLikeFoxy2 } from "@/lib/products/foxy2-test-utils";
import type { CatalogProduct } from "@/lib/products/types";
import "./element";

let stub: CatalogStub | undefined;

async function mount(attributes: string): Promise<HTMLElement> {
  stub ??= stubCatalog();
  document.body.innerHTML = `<foxy-product-page store="${FIXTURE_STORE}" lang="en-US" currency="USD" ${attributes}><p>Loading</p></foxy-product-page>`;
  const element = document.body.querySelector<HTMLElement>("foxy-product-page")!;
  await vi.waitFor(() => expect(element.querySelector(".foxy-product-controls")).not.toBeNull());
  return element;
}

const cartForm = (element: HTMLElement) => element.querySelector<HTMLFormElement>("form[action]")!;
const sent = (element: HTMLElement) => [...new FormData(cartForm(element))].map(([k, v]) => `${k}=${v}`);
const addButton = (element: HTMLElement) => element.querySelector<HTMLButtonElement>("button[type=submit]")!;
const values = (element: HTMLElement, legend: string) => {
  const set = [...element.querySelectorAll("fieldset")].find((f) => f.querySelector("legend")!.textContent!.startsWith(legend))!;
  return [...set.querySelectorAll("label")];
};
const pick = (element: HTMLElement, legend: string, value: string) =>
  userEvent.click(values(element, legend).find((label) => label.textContent === value)!);
const text = (element: HTMLElement, selector: string) => element.querySelector(selector)?.textContent;
const details = (element: HTMLElement) =>
  [...element.querySelectorAll(".foxy-product-details dt")].map((dt) => `${dt.textContent}: ${dt.nextElementSibling!.textContent}`);

afterEach(() => {
  stub?.restore();
  stub = undefined;
  document.body.innerHTML = "";
  history.replaceState(null, "", location.pathname);
  vi.restoreAllMocks();
});

describe("foxy-product-page", () => {
  it("shows the product in light DOM: photos, brand, name, price range and details", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    expect(element.shadowRoot).toBeNull();
    expect(element.textContent).not.toContain("Loading");
    expect(text(element, "h1")).toBe("Organic Cotton Tee");
    expect(text(element, ".foxy-product-brand")).toBe("Foxy Goods");
    expect(text(element, ".foxy-product-summary .foxy-product-price")).toBe("$24.95 – $26.95");
    expect(element.querySelector(".foxy-product-note")!.hasAttribute("hidden")).toBe(true);
    expect(element.querySelector<HTMLImageElement>(".foxy-product-hero img")?.alt).toBe("Black organic cotton tee");
    expect(details(element)).toEqual([
      "Brand: Foxy Goods",
      "SKU: TEE-ORG",
      "GTIN: 00850006493014",
      "Material: Organic cotton",
      "Made in: Portugal, Spain",
    ]);
    const data = JSON.parse(text(element, 'script[type="application/ld+json"]')!);
    expect(data.offers["@type"]).toBe("AggregateOffer");
  });

  it("switches photos from keyboard-operable thumbnails", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    const thumbs = [...element.querySelectorAll<HTMLButtonElement>(".foxy-product-thumbs button")];
    expect(thumbs.map((b) => b.getAttribute("aria-label"))).toEqual(["Show photo 1", "Show photo 2"]);
    await userEvent.click(thumbs[1]);
    expect(element.querySelector<HTMLImageElement>(".foxy-product-hero img")?.src).toContain("tee-black-back.jpg");
    const current = element.querySelectorAll(".foxy-product-thumbs button")[1];
    expect(current.getAttribute("aria-current")).toBe("true");
    expect(document.activeElement).toBe(current);
  });

  it("shows a photo while its thumbnail is hovered or focused", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    const thumbs = [...element.querySelectorAll<HTMLButtonElement>(".foxy-product-thumbs button")];
    thumbs[1].dispatchEvent(new PointerEvent("pointerenter"));
    expect(element.querySelector<HTMLImageElement>(".foxy-product-hero img")?.src).toContain("tee-black-back.jpg");
    // The thumbnails weren't rebuilt, or the hover would end.
    expect(element.querySelectorAll(".foxy-product-thumbs button")[1]).toBe(thumbs[1]);
    thumbs[0].focus();
    expect(thumbs[0].getAttribute("aria-current")).toBe("true");
  });

  it("offers options as labelled swatches and pills, and says what's missing on the button", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    expect(values(element, "Colour").map((l) => l.textContent)).toEqual(["Black", "Natural (undyed)", "Moss (sold out)"]);
    expect(values(element, "Colour")[0].className).toBe("foxy-product-swatch");
    expect((values(element, "Colour")[2].control as HTMLInputElement).disabled).toBe(true);
    expect(addButton(element).textContent).toBe("Choose a colour");
    expect(addButton(element).disabled).toBe(true);

    await pick(element, "Colour", "Black");
    // L doesn't come in Black, so it isn't there; M is sold out.
    expect(values(element, "Size").map((l) => l.textContent)).toEqual(["S", "M (sold out)", "2XL"]);
    expect(addButton(element).textContent).toBe("Choose a size");
    expect(text(element, "fieldset legend .foxy-product-hint")).toBe("Black");

    await pick(element, "Size", "S");
    expect(addButton(element).textContent).toBe("Add to cart · $24.95");
    expect(text(element, ".foxy-product-note")).toBe("In stock");
    expect(text(element, ".foxy-product-summary .foxy-product-price")).toBe("$24.95");
    expect(details(element)[1]).toBe("SKU: TEE-ORG-BLK-S");
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Black", "size=S", "gift_wrap=No"]);

    await pick(element, "Colour", "Natural (undyed)");
    expect(addButton(element).textContent).toBe("Choose a size");
  });

  it("caps the quantity stepper at the chosen variant's stock", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=Natural&size=M"`);
    expect(text(element, ".foxy-product-note")).toBe("Only 4 left");
    const more = element.querySelector<HTMLButtonElement>('button[aria-label="Increase quantity"]')!;
    for (let i = 0; i < 3; i++) await userEvent.click(more);
    expect(more.disabled).toBe(true);
    expect(sent(element)).toContain("quantity=4");
    expect(addButton(element).textContent).toBe("Add to cart · $99.80");
  });

  it("uses the chosen variant's own low-stock threshold over the store's", async () => {
    const withThreshold = (sku: string, low_stock_threshold: number) => (v: CatalogProduct) =>
      v.sku === sku ? { ...v, definition: { ...v.definition, low_stock_threshold } } : v;
    stub = stubCatalog([
      {
        ...teeParent,
        _embedded: {
          // Natural M has 4 left, Black S has 17; the store's threshold is 5.
          variants: teeParent._embedded!.variants!.map(withThreshold("TEE-ORG-NAT-M", 3)).map(withThreshold("TEE-ORG-BLK-S", 20)),
        },
      },
    ]);
    const element = await mount(`sku="TEE-ORG" value="color=Natural&size=M"`);
    expect(text(element, ".foxy-product-note")).toBe("In stock");
    await pick(element, "Colour", "Black");
    await pick(element, "Size", "S");
    expect(text(element, ".foxy-product-note")).toBe("Only 17 left");
  });

  it("switches to the chosen variant's modifiers", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=Natural&size=M"`);
    expect(sent(element)).toContain("gift_wrap=No");
    await pick(element, "Size", "L");
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Natural", "size=L"]);
    expect(text(element, ".foxy-product-field-label")).toBe("Monogram (optional, +$5.00)");
  });

  it("adds through a light-DOM cart form that 2.0 takes over", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=Black&size=2XL"`);
    const foxy2 = listenLikeFoxy2(FIXTURE_STORE);
    await userEvent.click(addButton(element));
    foxy2.stop();
    expect(foxy2.submitted).toEqual([cartForm(element)]);
    expect(cartForm(element).parentElement).toBe(element);
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Black", "size=2XL", "gift_wrap=No"]);
  });

  it("keeps the shopper's choices when 2.0 moves the page into its sidecart wrapper", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=Black&size=2XL"`);
    const wrapper = document.createElement("div");
    document.body.append(wrapper);
    wrapper.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(addButton(element).textContent).toBe("Add to cart · $26.95");
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Black", "size=2XL", "gift_wrap=No"]);
  });

  it("renders the description as text, never as markup", async () => {
    stub = stubCatalog([
      {
        ...plainMug,
        definition: {
          ...plainMug.definition,
          description:
            'Steel with **enamel**.\n\n<img src="https://x.example/p.png" onerror="alert(1)"><script>alert(1)</script>\n\n[Care](https://shop.example.com/care) and [bad](javascript:alert(1))',
        },
      },
    ]);
    const element = await mount(`sku="MUG-ENM-WHT"`);
    const description = element.querySelector(".foxy-product-description")!;
    expect(description.querySelector("strong")?.textContent).toBe("enamel");
    expect(description.querySelector("img, script")).toBeNull();
    expect([...description.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual([
      "https://shop.example.com/care",
    ]);
    expect(description.textContent).toContain("bad");
  });

  it("renders headings, lists, tables and links from the description", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    const description = element.querySelector(".foxy-product-description")!;
    expect(description.querySelector("h2")?.textContent).toBe("Care");
    expect([...description.querySelectorAll("li")].map((li) => li.textContent)).toEqual(["Machine wash cold", "Hang to dry"]);
    expect([...description.querySelectorAll("th")].map((th) => th.textContent)).toEqual(["Size", "Chest (in)"]);
    expect(description.querySelectorAll("tbody tr")).toHaveLength(2);
  });

  it("works for a product with nothing to choose", async () => {
    const element = await mount(`sku="MUG-ENM-WHT"`);
    expect(element.querySelector("fieldset")).toBeNull();
    expect(text(element, ".foxy-product-summary .foxy-product-price")).toBe("$16.40 $18.90");
    expect(text(element, ".foxy-product-note")).toBe("Only 3 left");
    expect(addButton(element).textContent).toBe("Add to cart · $16.40");
    expect(sent(element)).toEqual(["sku=MUG-ENM-WHT"]);
    expect(element.querySelector(".foxy-product-thumbs")).toBeNull();
  });

  it("works for a product with modifiers", async () => {
    const element = await mount(`sku="MUG-ENM-ENGRAVE"`);
    await userEvent.click(addButton(element));
    expect(text(element, ".foxy-product-error:not([hidden])")).toBe("Fill this in to add it to the cart.");
    await userEvent.fill(element.querySelector<HTMLInputElement>("input[type=text]")!, "Joey");
    expect(sent(element)).toEqual(["sku=MUG-ENM-ENGRAVE", "engraving=Joey", "gift_wrap=No"]);
    expect(addButton(element).textContent).toBe("Add to cart · $27.50");
  });

  it("can't add a sold-out product", async () => {
    const element = await mount(`sku="COF-HUILA-340"`);
    expect(addButton(element).textContent).toBe("Sold out");
    expect(addButton(element).disabled).toBe(true);
    expect(text(element, ".foxy-product-note")).toBe("Sold out");
  });

  it("reads the SKU from the page's address when asked", async () => {
    history.replaceState(null, "", "?product=MUG-ENM-WHT");
    const element = await mount(`sku-param="product"`);
    expect(text(element, "h1")).toBe("Enamel Camp Mug, White");
  });

  it("keeps the merchant's content for an unknown SKU", async () => {
    stub = stubCatalog();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    document.body.innerHTML = `<foxy-product-page store="${FIXTURE_STORE}" sku="NOPE-1"><p>Not here</p></foxy-product-page>`;
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(document.body.querySelector("foxy-product-page")!.innerHTML).toBe("<p>Not here</p>");
  });
});
