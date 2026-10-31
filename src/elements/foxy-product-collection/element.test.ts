import { afterEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_STORE, stubCatalog, type CatalogStub } from "@/lib/products/fixtures";
import { settle } from "@/lib/products/foxy2-test-utils";
import "./element";

let stub: CatalogStub | undefined;

const names = (element: HTMLElement) =>
  [...element.querySelectorAll(".foxy-product-tile-name")].map((h) => h.textContent);

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
