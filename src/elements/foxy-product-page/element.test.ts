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
    expect(element.querySelector<HTMLImageElement>(".foxy-product-hero img")?.src).toBe(teeParent.definition.images![1].src);
    const current = element.querySelectorAll(".foxy-product-thumbs button")[1];
    expect(current.getAttribute("aria-current")).toBe("true");
    expect(document.activeElement).toBe(current);
  });

  it("shows a photo while its thumbnail is hovered or focused", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    const thumbs = [...element.querySelectorAll<HTMLButtonElement>(".foxy-product-thumbs button")];
    thumbs[1].dispatchEvent(new PointerEvent("pointerenter"));
    expect(element.querySelector<HTMLImageElement>(".foxy-product-hero img")?.src).toBe(teeParent.definition.images![1].src);
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

  it("is dark by itself with theme=\"dark\": its own backdrop, dark panels and light text", async () => {
    const element = await mount(`sku="TEE-ORG" theme="dark"`);
    expect(getComputedStyle(element).backgroundColor).toBe("rgb(3, 7, 18)");
    expect(getComputedStyle(element).paddingTop).toBe("24px");
    expect(getComputedStyle(element.querySelector(".foxy-product-main")!).backgroundColor).toBe("rgb(17, 24, 39)");
    expect(getComputedStyle(element.querySelector(".foxy-product-name")!).color).toBe("rgb(249, 250, 251)");
    expect(getComputedStyle(element.querySelector(".foxy-product-details")!).color).toBe("rgb(229, 231, 235)");
  });

  it("keeps the photos and the shopper's choices when its look changes", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    await pick(element, "Colour", "Black");
    const hero = element.querySelector(".foxy-product-hero img");
    const requests = stub!.requests.length;

    element.setAttribute("theme", "market");
    element.setAttribute("button-radius", "0");
    element.setAttribute("label", "Add to basket");
    element.setAttribute("option-style", "rows");

    expect(element.querySelector(".foxy-product-hero img")).toBe(hero);
    expect(element.querySelectorAll(".foxy-product-row").length).toBeGreaterThan(0);
    expect(sent(element)).toContain("color=Black");
    expect(stub!.requests).toHaveLength(requests);
  });

  it("presets the chosen variant's modifiers from value, with its options", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=Black&size=S&gift_wrap=Yes"`);
    expect(addButton(element).textContent).toBe("Add to cart · $29.45");
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Black", "size=S", "gift_wrap=Yes"]);
  });

  it("reports the product as viewed once, however often it re-renders", async () => {
    const viewed: unknown[] = [];
    document.body.addEventListener("foxy-product:view-item", (event) => viewed.push((event as CustomEvent).detail));
    const element = await mount(`sku="MUG-ENM-WHT" analytics`);
    element.setAttribute("heading-level", "2");
    element.setAttribute("value", "x=y");
    await new Promise((resolve) => setTimeout(resolve, 20));
    const detail = {
      currency: "USD",
      value: 16.4,
      items: [{ item_id: "MUG-ENM-WHT", item_name: "Enamel Camp Mug, White", item_brand: "Foxy Goods", price: 16.4, quantity: 1 }],
    };
    expect(viewed).toEqual([detail]);
    expect(window.dataLayer).toEqual([{ ecommerce: null }, { event: "view_item", ecommerce: detail }]);
    delete window.dataLayer;
  });

  it("puts the photos beside what is bought from a medium width of its own, and stacks them below it", async () => {
    document.body.innerHTML = `<div id="frame" style="width: 1180px"></div>`;
    stub = stubCatalog();
    const frame = document.getElementById("frame")!;
    frame.innerHTML = `<foxy-product-page store="${FIXTURE_STORE}" sku="TEE-ORG"></foxy-product-page>`;
    const element = frame.querySelector<HTMLElement>("foxy-product-page")!;
    await vi.waitFor(() => expect(element.querySelector(".foxy-product-hero img")).not.toBeNull());
    const box = (selector: string) => element.querySelector(selector)!.getBoundingClientRect();
    const share = () => box(".foxy-product-gallery").width / (box(".foxy-product-gallery").width + box(".foxy-product-info").width);

    // Wide: about three fifths for the photos, and the photo no taller than its cap.
    expect(box(".foxy-product-info").left).toBeGreaterThan(box(".foxy-product-gallery").right);
    expect(share()).toBeCloseTo(0.6, 1);
    expect(box(".foxy-product-hero").height).toBeLessThanOrEqual(640);
    expect(getComputedStyle(element.querySelector(".foxy-product-info")!).position).toBe("sticky");

    // Medium: half each.
    frame.style.width = "800px";
    expect(box(".foxy-product-info").left).toBeGreaterThan(box(".foxy-product-gallery").right);
    expect(share()).toBeCloseTo(0.5, 1);

    // Narrow: one column, whatever the window's width.
    frame.style.width = "560px";
    expect(box(".foxy-product-info").top).toBeGreaterThan(box(".foxy-product-gallery").bottom);
    expect(box(".foxy-product-info").width).toBe(box(".foxy-product-gallery").width);
    expect(getComputedStyle(element.querySelector(".foxy-product-info")!).position).toBe("static");
  });

  it("shows the main photo at its own shape across the column, with nothing around it, up to its cap", async () => {
    const hero = async (width: number, height: number) => {
      stub?.restore();
      const images = [{ src: "https://images.example.com/mug-shape.jpg", alt: "Enamel camp mug", width, height }];
      stub = stubCatalog([{ ...plainMug, definition: { ...plainMug.definition, images } }]);
      document.body.innerHTML = `<div style="width: 560px"><foxy-product-page store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-page></div>`;
      const element = document.body.querySelector<HTMLElement>("foxy-product-page")!;
      await vi.waitFor(() => expect(element.querySelector(".foxy-product-hero img")).not.toBeNull());
      return element.querySelector<HTMLElement>(".foxy-product-hero")!;
    };

    const wide = await hero(1600, 900);
    const { width } = wide.getBoundingClientRect();
    expect(width).toBe(wide.parentElement!.getBoundingClientRect().width);
    expect(wide.getBoundingClientRect().height).toBeCloseTo((width * 900) / 1600, 0);
    expect(getComputedStyle(wide).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(wide).paddingTop).toBe("0px");

    const square = await hero(1000, 1000);
    expect(square.getBoundingClientRect().height).toBeCloseTo(square.getBoundingClientRect().width, 0);

    // Taller than the cap at the column's width: as tall as the cap, and narrower, centred.
    const tall = await hero(900, 1600);
    const cap = Math.min(innerHeight * 0.7, 640);
    const frame = tall.getBoundingClientRect();
    const column = tall.parentElement!.getBoundingClientRect();
    expect(frame.height).toBeCloseTo(cap, 0);
    expect(frame.width).toBeCloseTo((cap * 900) / 1600, 0);
    expect(frame.left - column.left).toBeCloseTo(column.right - frame.right, 0);
    expect(tall.querySelector("img")!.getBoundingClientRect().height).toBeCloseTo(cap, 0);
  });

  it("lists the details with each label as wide as it needs, its value close beside it, and every other row tinted", async () => {
    const element = await mount(`sku="TEE-ORG" description-layout="none"`);
    const rows = [...element.querySelectorAll<HTMLElement>(".foxy-product-detail-list > div")];
    expect(rows.length).toBeGreaterThan(2);
    for (const row of rows) {
      const term = row.querySelector("dt")!.getBoundingClientRect();
      const value = row.querySelector("dd")!.getBoundingClientRect();
      expect(value.top).toBe(term.top);
      expect(value.left - term.right).toBe(20);
      // "Material", the longest label, sets the column.
      expect(term.width).toBeLessThan(80);
    }
    expect(new Set(rows.map((row) => row.querySelector("dd")!.getBoundingClientRect().left)).size).toBe(1);
    expect(getComputedStyle(rows[0]).backgroundColor).toBe("rgb(243, 244, 246)");
    expect(getComputedStyle(rows[1]).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("shows a product it is handed with no request for it, and again when handed an edited one", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<foxy-product-page store="${FIXTURE_STORE}" lang="en-US" currency="USD"></foxy-product-page>`;
    const element = document.body.querySelector("foxy-product-page")!;
    element.product = { ...plainMug, definition: { ...plainMug.definition, description: "Steel with a glossy enamel coat." } };
    await vi.waitFor(() => expect(element.querySelector(".foxy-product-controls")).not.toBeNull());
    expect(element.sku).toBe("MUG-ENM-WHT");
    expect(text(element, ".foxy-product-description")).toBe("Steel with a glossy enamel coat.");

    element.product = { ...plainMug, definition: { ...plainMug.definition, description: "Glazed by hand in small batches." } };
    expect(text(element, ".foxy-product-description")).toBe("Glazed by hand in small batches.");
    expect(stub.requests.filter((request) => request.includes("MUG-ENM-WHT"))).toEqual([]);
  });

  it("brings back the merchant's content, not a product it was handed before it started", async () => {
    stub = stubCatalog();
    const element = document.createElement("foxy-product-page");
    element.setAttribute("store", FIXTURE_STORE);
    element.setAttribute("lang", "en-US");
    element.innerHTML = "<p>Coming soon</p>";
    element.product = plainMug;
    document.body.append(element);
    await vi.waitFor(() => expect(element.querySelector(".foxy-product-controls")).not.toBeNull());

    element.product = null;
    expect(element.textContent).toBe("Coming soon");
  });

  it("gives what is bought the whole width when the product has no photo", async () => {
    stub = stubCatalog([{ ...plainMug, definition: { ...plainMug.definition, images: [] } }]);
    document.body.innerHTML = `<div style="width: 1180px"><foxy-product-page store="${FIXTURE_STORE}" sku="MUG-ENM-WHT"></foxy-product-page></div>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-page")!;
    await vi.waitFor(() => expect(element.querySelector(".foxy-product-controls")).not.toBeNull());
    const main = element.querySelector(".foxy-product-main")!.getBoundingClientRect();
    const info = element.querySelector(".foxy-product-info")!.getBoundingClientRect();
    expect(getComputedStyle(element.querySelector(".foxy-product-gallery")!).display).toBe("none");
    expect(info.left - main.left).toBeLessThan(40);
    expect(info.width).toBe(560);
  });

  describe("description-layout", () => {
    // Four top-level headings, a short lead before them, and a sub-heading kept inside its section.
    const sectioned = (description: string): CatalogProduct => ({ ...plainMug, definition: { ...plainMug.definition, description } });
    const FOUR = [
      "Steel with a glossy enamel coat.",
      "## Size",
      "Holds 12 oz.",
      "### Lid",
      "Sold apart.",
      "## Care",
      "- Hand wash",
      "## Delivery",
      "Ships in 2 days.",
      "## Returns",
      "Within 30 days.",
    ].join("\n\n");

    async function page(attributes: string, description = FOUR, width = 1100): Promise<HTMLElement> {
      stub = stubCatalog([sectioned(description)]);
      document.body.innerHTML = `<div id="frame" style="width: ${width}px"><foxy-product-page store="${FIXTURE_STORE}" lang="en-US" sku="MUG-ENM-WHT" ${attributes}></foxy-product-page></div>`;
      const element = document.body.querySelector<HTMLElement>("foxy-product-page")!;
      await vi.waitFor(() => expect(element.querySelector(".foxy-product-controls")).not.toBeNull());
      return element;
    }
    const tabs = (element: HTMLElement) => [...element.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const panels = (element: HTMLElement) => [...element.querySelectorAll<HTMLElement>('[role="tabpanel"]')];

    it("makes sections of three or more headings by default", async () => {
      const element = await page("");
      expect((element as HTMLElementTagNameMap["foxy-product-page"]).descriptionLayout).toBe("auto");
      expect(element.querySelector(".foxy-product-sections")?.getAttribute("data-layout")).toBe("tabs");
    });

    it("shows the description as written with none", async () => {
      const element = await page(`description-layout="none"`);
      expect(element.querySelector(".foxy-product-sections")).toBeNull();
      expect([...element.querySelectorAll(".foxy-product-description h2")].map((h) => h.textContent)).toEqual(["Size", "Care", "Delivery", "Returns"]);
      expect(text(element, ".foxy-product-details h2")).toBe("Details");
    });

    it("makes accessible tabs of the top-level headings, with the details last and a short lead by the price", async () => {
      const element = await page(`description-layout="tabs"`);
      expect(tabs(element).map((tab) => tab.textContent)).toEqual(["Size", "Care", "Delivery", "Returns", "Details"]);
      expect(text(element, ".foxy-product-summary .foxy-product-lead")).toBe("Steel with a glossy enamel coat.");
      expect(element.querySelector(".foxy-product-details")).toBeNull();
      // The sub-heading stays inside its section.
      expect(panels(element)[0].querySelector("h3")?.textContent).toBe("Lid");

      const [first, second, , , last] = tabs(element);
      expect(first.getAttribute("aria-selected")).toBe("true");
      expect([first.tabIndex, second.tabIndex]).toEqual([0, -1]);
      expect(panels(element)[0].hasAttribute("hidden")).toBe(false);
      expect(panels(element)[1].getAttribute("hidden")).toBe("until-found");
      expect(panels(element)[1].getAttribute("aria-labelledby")).toBe(second.id);
      expect(second.getAttribute("aria-controls")).toBe(panels(element)[1].id);
      // Kept in the page, so search engines and find in page reach every section.
      expect(panels(element)[4].textContent).toContain("MUG-ENM-WHT");

      first.focus();
      await userEvent.keyboard("{ArrowRight}");
      expect(document.activeElement).toBe(second);
      expect(second.getAttribute("aria-selected")).toBe("true");
      expect(panels(element)[0].getAttribute("hidden")).toBe("until-found");
      await userEvent.keyboard("{End}");
      expect(document.activeElement).toBe(last);
      await userEvent.keyboard("{ArrowRight}");
      expect(document.activeElement).toBe(first);
      await userEvent.keyboard("{ArrowLeft}");
      expect(document.activeElement).toBe(last);
      await userEvent.keyboard("{Home}");
      expect(document.activeElement).toBe(first);

      await userEvent.click(tabs(element)[2]);
      expect(panels(element)[2].hasAttribute("hidden")).toBe(false);
      // A re-render keeps the shopper's section.
      element.setAttribute("label", "Add to bag");
      expect(tabs(element)[2].getAttribute("aria-selected")).toBe("true");
    });

    it("puts the details list in a section of the merchant's that is already called Details", async () => {
      const element = await page(`description-layout="tabs"`, FOUR.replace("## Size", "## Details"));
      expect(tabs(element).map((tab) => tab.textContent)).toEqual(["Details", "Care", "Delivery", "Returns"]);
      expect(panels(element)[0].querySelector("dl")?.textContent).toContain("MUG-ENM-WHT");
    });

    it("shows a hidden tab's text when find in page reaches it", async () => {
      const element = await page(`description-layout="tabs"`);
      panels(element)[3].dispatchEvent(new Event("beforematch"));
      expect(tabs(element)[3].getAttribute("aria-selected")).toBe("true");
    });

    it("makes an accordion of native disclosures, the first open", async () => {
      const element = await page(`description-layout="accordion"`);
      const sections = [...element.querySelectorAll("details.foxy-product-section")] as HTMLDetailsElement[];
      expect(sections.map((section) => section.querySelector("summary h2")?.textContent)).toEqual(["Size", "Care", "Delivery", "Returns", "Details"]);
      expect(sections.map((section) => section.open)).toEqual([true, false, false, false, false]);
    });

    it("leaves the details apart, and the text before the first heading a section, with fewer than three headings", async () => {
      const element = await page(`description-layout="tabs"`, "Steel with a glossy enamel coat.\n\nRolled rim.\n\n## Care\n\nHand wash.");
      expect(tabs(element).map((tab) => tab.textContent)).toEqual(["Description", "Care"]);
      expect(element.querySelector(".foxy-product-lead")).toBeNull();
      expect(text(element, ".foxy-product-details h2")).toBe("Details");
    });

    it("shows a description with nothing to split as written, even when asked for tabs", async () => {
      const element = await page(`description-layout="tabs"`, "Steel with a glossy enamel coat.");
      expect(element.querySelector(".foxy-product-sections")).toBeNull();
      expect(text(element, ".foxy-product-description")).toBe("Steel with a glossy enamel coat.");
    });

    it("with auto, does nothing under three headings, and otherwise switches between tabs and an accordion with its width", async () => {
      const few = await page(`description-layout="auto"`, "Intro.\n\n## Care\n\nHand wash.\n\n## Delivery\n\nTwo days.");
      expect(few.querySelector(".foxy-product-sections")).toBeNull();

      const element = await page(`description-layout="auto"`);
      expect(element.querySelector(".foxy-product-sections")?.getAttribute("data-layout")).toBe("tabs");
      await userEvent.click(tabs(element)[1]);
      document.getElementById("frame")!.style.width = "480px";
      await vi.waitFor(() => expect(element.querySelector(".foxy-product-sections")?.getAttribute("data-layout")).toBe("accordion"));
      // The open section is the one that was chosen.
      expect(element.querySelector<HTMLDetailsElement>("details[open] summary")?.textContent).toBe("Care");
      document.getElementById("frame")!.style.width = "1100px";
      await vi.waitFor(() => expect(element.querySelector(".foxy-product-sections")?.getAttribute("data-layout")).toBe("tabs"));
    });
  });

  it("puts the collections first as chips, then the name, then the brand", async () => {
    stub = stubCatalog([{ ...teeParent, collections: [{ id: 12, name: "Clothing" }, { id: 31, name: "Tees" }] }]);
    const element = await mount(`sku="TEE-ORG"`);
    const order = [...element.querySelector(".foxy-product-summary")!.children].map((child) => child.className);
    expect(order).toEqual(["foxy-product-chips", "foxy-product-name", "foxy-product-brand", "foxy-product-price-row"]);
    expect([...element.querySelectorAll(".foxy-product-chip")].map((chip) => [chip.tagName, chip.textContent])).toEqual([
      ["SPAN", "Clothing"],
      ["SPAN", "Tees"],
    ]);
    expect(parseFloat(getComputedStyle(element.querySelector(".foxy-product-name")!).fontSize)).toBeGreaterThan(
      parseFloat(getComputedStyle(element.querySelector(".foxy-product-brand")!).fontSize),
    );

    element.setAttribute("collection-href", "/shop?collection={id}");
    expect([...element.querySelectorAll<HTMLAnchorElement>("a.foxy-product-chip")].map((chip) => chip.getAttribute("href"))).toEqual([
      "/shop?collection=12",
      "/shop?collection=31",
    ]);
  });

  it("has no chips for a product in no collection", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    expect(element.querySelector(".foxy-product-chips")).toBeNull();
  });
});
