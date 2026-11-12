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
    expect(document.activeElement?.closest("li")).toBe(element.querySelectorAll("li")[2]);

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
});
