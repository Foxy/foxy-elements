import { afterEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_STORE, stubCatalog, type CatalogStub } from "@/lib/products/fixtures";
import { settle } from "@/lib/products/foxy2-test-utils";
import "./element";

let stub: CatalogStub | undefined;

const names = (element: HTMLElement) =>
  [...element.querySelectorAll(".foxy-product-name")].map((h) => h.textContent);

afterEach(() => {
  stub?.restore();
  stub = undefined;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("foxy-product-collection", () => {
  it("lists tiles a page at a time and loads more", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<foxy-product-collection store="${FIXTURE_STORE}" tag="mugs" sort="-price" product-href="/shop/{sku}" currency="USD"></foxy-product-collection>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-collection")!;
    await vi.waitFor(() => expect(names(element)).toHaveLength(2));
    expect(stub.requests[0]).toBe("/s/products?tag=mugs&sort=-price");
    expect(element.querySelector("foxy-product-tile")?.getAttribute("href")).toBe("/shop/{sku}");
    expect(element.querySelector(".foxy-product-showing")?.textContent).toBe("Showing 2 of 5");

    element.querySelector<HTMLButtonElement>(".foxy-product-more button")!.click();
    await vi.waitFor(() => expect(names(element)).toHaveLength(4));
    expect(stub.requests).toContain("/s/products?cursor=2");
    // Focus moves to the first tile it loaded.
    expect(document.activeElement?.closest(".foxy-product-grid > li")).toBe(element.querySelectorAll(".foxy-product-grid > li")[2]);

    element.querySelector<HTMLButtonElement>(".foxy-product-more button")!.click();
    await vi.waitFor(() => expect(names(element)).toHaveLength(5));
    expect(element.querySelector(".foxy-product-more button")).toBeNull();
    expect(element.getAttribute("aria-busy")).toBe("false");
  });

  it("lists parents without their variants, and makes no request per tile", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<foxy-product-collection store="${FIXTURE_STORE}" currency="USD" product-href="/shop/{sku}"></foxy-product-collection>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-collection")!;
    await vi.waitFor(() => expect(names(element)).toHaveLength(2));
    await settle();
    expect(stub.requests).toEqual(["/s/products"]);
    expect(element.querySelector(".foxy-product-price")?.textContent).toBe("$24.95");
  });

  it("asks for variants with variant-prices, so a parent's tile shows its range", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<foxy-product-collection store="${FIXTURE_STORE}" currency="USD" product-href="/shop/{sku}" variant-prices></foxy-product-collection>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-collection")!;
    await vi.waitFor(() => expect(names(element)).toHaveLength(2));
    await settle();
    expect(stub.requests).toEqual(["/s/products?zoom=variants"]);
    expect(element.querySelector(".foxy-product-price")?.textContent).toBe("$24.95 – $26.95");
  });

  it("shows a count and a sort control when asked", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<foxy-product-collection store="${FIXTURE_STORE}" show-count show-sort></foxy-product-collection>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-collection")!;
    await vi.waitFor(() => expect(names(element)).toHaveLength(2));
    expect(element.querySelector(".foxy-product-count")?.textContent).toBe("5 products");
    const select = element.querySelector<HTMLSelectElement>(".foxy-product-sort select")!;
    expect([...select.options].map((o) => o.text)).toEqual(["Name", "Price, low to high", "Price, high to low", "Newest"]);
    expect(select.value).toBe("-date_created");

    select.value = "price";
    select.dispatchEvent(new Event("change"));
    await settle();
    expect(element.getAttribute("sort")).toBe("price");
    expect(stub.requests.at(-1)).toBe("/s/products?sort=price");
    expect(element.querySelector(".foxy-product-sort select")).toBe(select);
  });

  it("starts over when its query changes", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<foxy-product-collection store="${FIXTURE_STORE}"></foxy-product-collection>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-collection")!;
    await vi.waitFor(() => expect(names(element)).toHaveLength(2));
    element.setAttribute("collection", "12");
    await settle();
    expect(stub.requests.at(-1)).toBe("/s/products?collection=12");
  });

  it("says so when there's nothing to show", async () => {
    stub = stubCatalog([]);
    document.body.innerHTML = `<foxy-product-collection store="${FIXTURE_STORE}"></foxy-product-collection>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-collection")!;
    await vi.waitFor(() =>
      expect(element.querySelector("[role=status]")?.textContent).toBe("No products here yet."),
    );
  });

  it("says so when the catalog can't be read", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    document.body.innerHTML = `<foxy-product-collection store="no-such-store.invalid"></foxy-product-collection>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-collection")!;
    await vi.waitFor(() =>
      expect(element.querySelector("[role=status]")?.textContent).toBe(
        "Products couldn't load. Try again later.",
      ),
    );
  });

  it("gives its tiles the store's product page when it has no product-href, and its own theme", async () => {
    stub = stubCatalog();
    stub.look = { product_url: "/products/{sku}", theme: "soft" };
    document.body.innerHTML = `<foxy-product-collection store="${FIXTURE_STORE}" theme="dark"></foxy-product-collection>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-collection")!;
    await vi.waitFor(() =>
      expect(element.querySelector(".foxy-product-name a")?.getAttribute("href")).toBe("/products/TEE-ORG"),
    );
    // Dark by itself: its own backdrop, dark cards and light names, whatever the page and the store's theme.
    expect(getComputedStyle(element).backgroundColor).toBe("rgb(3, 7, 18)");
    expect(getComputedStyle(element.querySelector(".foxy-product-tile")!).backgroundColor).toBe("rgb(17, 24, 39)");
    expect(getComputedStyle(element.querySelector(".foxy-product-name")!).color).toBe("rgb(249, 250, 251)");

    // Without a theme of its own, the store's.
    const tiles = [...element.querySelectorAll("foxy-product-tile")];
    element.removeAttribute("theme");
    expect(getComputedStyle(element).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(element.querySelector(".foxy-product-tile")!).borderRadius).toBe("18px");
    expect([...element.querySelectorAll("foxy-product-tile")]).toEqual(tiles);
    expect(stub.requests).toHaveLength(1);
  });

  it("reports each page of results once as a list, and a click through to a product with its place in it", async () => {
    stub = stubCatalog();
    stub.look = { analytics: true };
    document.body.innerHTML = `<foxy-product-collection store="${FIXTURE_STORE}" tag="mugs" list-name="Mugs" product-href="/shop/{sku}"></foxy-product-collection>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-collection")!;
    const heard: string[] = [];
    element.addEventListener("foxy-product:view-item-list", (event) =>
      heard.push((event as CustomEvent).detail.items.map((item: { item_id: string }) => item.item_id).join()),
    );
    await vi.waitFor(() => expect(names(element)).toHaveLength(2));
    await settle();
    const list = { item_list_id: "mugs", item_list_name: "Mugs" };
    expect(window.dataLayer).toEqual([
      { ecommerce: null },
      {
        event: "view_item_list",
        ecommerce: {
          currency: "USD",
          value: 46.45,
          ...list,
          items: [
            { item_id: "TEE-ORG", item_name: "Organic Cotton Tee", item_brand: "Foxy Goods", price: 24.95, quantity: 1, index: 0, ...list },
            { item_id: "MUG-ENM-ENGRAVE", item_name: "Engraved Enamel Mug", item_brand: "Foxy Goods", price: 21.5, quantity: 1, index: 1, ...list },
          ],
        },
      },
    ]);

    element.querySelector<HTMLButtonElement>(".foxy-product-more button")!.click();
    await vi.waitFor(() => expect(names(element)).toHaveLength(4));
    await settle();
    expect(heard).toEqual(["TEE-ORG,MUG-ENM-ENGRAVE", "MUG-ENM-WHT,COF-HUILA-340"]);

    element.addEventListener("click", (event) => event.preventDefault());
    element.querySelectorAll<HTMLAnchorElement>(".foxy-product-name a")[2].click();
    await settle();
    const selected = window.dataLayer!.at(-1) as { event: string; ecommerce: { items: Array<Record<string, unknown>> } };
    expect(selected.event).toBe("select_item");
    expect(selected.ecommerce.items).toEqual([
      { item_id: "MUG-ENM-WHT", item_name: "Enamel Camp Mug, White", item_brand: "Foxy Goods", price: 16.4, quantity: 1, index: 2, ...list },
    ]);
    delete window.dataLayer;
  });

  it("pushes nothing to Google with analytics=\"off\", for itself or its tiles", async () => {
    stub = stubCatalog();
    stub.look = { analytics: true };
    document.body.innerHTML = `<foxy-product-collection analytics="off" store="${FIXTURE_STORE}" product-href="/shop/{sku}"></foxy-product-collection>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-collection")!;
    await vi.waitFor(() => expect(names(element)).toHaveLength(2));
    element.addEventListener("click", (event) => event.preventDefault());
    element.querySelector<HTMLAnchorElement>(".foxy-product-name a")!.click();
    await settle();
    expect(window.dataLayer).toBeUndefined();
  });
});
