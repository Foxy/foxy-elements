import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  engravedMug,
  FIXTURE_STORE,
  stubCatalog,
  teeParent,
  type CatalogStub,
} from "@/lib/products/fixtures";
import { listenLikeFoxy2, settle } from "@/lib/products/foxy2-test-utils";
import { cartFields, livePrice } from "./utils";
import "./element";

let stub: CatalogStub | undefined;

async function mount(attributes: string, inner = ""): Promise<HTMLElement> {
  stub ??= stubCatalog();
  document.body.innerHTML = `<foxy-product-form store="${FIXTURE_STORE}" lang="en-US" currency="USD" ${attributes}>${inner}</foxy-product-form>`;
  const element = document.body.querySelector<HTMLElement>("foxy-product-form")!;
  await vi.waitFor(() => expect(element.shadowRoot!.querySelector("form")).not.toBeNull());
  return element;
}

const shadow = (element: HTMLElement) => element.shadowRoot!;
const cartForm = (element: HTMLElement) => element.querySelector("form")!;
const sent = (element: HTMLElement) => [...new FormData(cartForm(element))].map(([k, v]) => `${k}=${v}`);
const labels = (element: HTMLElement, legend: string) => {
  const set = [...shadow(element).querySelectorAll("fieldset")].find(
    (f) => f.querySelector("legend")?.textContent === legend,
  )!;
  return [...set.querySelectorAll("label")].map((l) => l.textContent);
};
const label = (element: HTMLElement, text: string) =>
  [...shadow(element).querySelectorAll("label")].find((l) => l.textContent === text)!;
const submitButton = (element: HTMLElement) =>
  shadow(element).querySelector<HTMLButtonElement>("button[type=submit]")!;

afterEach(() => {
  stub?.restore();
  stub = undefined;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("foxy-product-form", () => {
  it("shows the merchant's content until the product loads", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<foxy-product-form store="${FIXTURE_STORE}" sku="TEE-ORG"><p>Loading the tee</p></foxy-product-form>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-form")!;
    expect(shadow(element).querySelector("slot")).not.toBeNull();
    await vi.waitFor(() => expect(element.querySelector("form")).not.toBeNull());
    expect(element.querySelector("p")).toBeNull();
    expect(cartForm(element).action).toBe(`https://${FIXTURE_STORE}/cart`);
  });

  it("leaves out missing values and marks sold-out ones", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    expect(labels(element, "Colour")).toEqual(["Black", "Natural (undyed)", "Moss (sold out)"]);
    // With Black chosen: L doesn't exist, M is sold out.
    expect(labels(element, "Size")).toEqual(["S", "M (sold out)", "2XL"]);
    // userEvent won't click a disabled control; a plain click still tries.
    label(element, "M (sold out)").click();
    await settle();
    expect(sent(element)).toContain("size=S");
  });

  it("sends the parent's SKU and the chosen options", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Black", "size=S", "gift_wrap=No"]);

    await userEvent.click(label(element, "Natural (undyed)"));
    await settle();
    // S doesn't come in Natural, so the size moves to the first that does.
    expect(labels(element, "Size")).toEqual(["M", "L"]);
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Natural", "size=M", "gift_wrap=No"]);
  });

  it("starts from preselected values", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=natural&size=L"`);
    expect(sent(element).slice(0, 3)).toEqual(["sku=TEE-ORG", "color=Natural", "size=L"]);
  });

  it("is submitted through 2.0's delegated submit handler", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    const foxy2 = listenLikeFoxy2(FIXTURE_STORE);
    await userEvent.click(label(element, "2XL"));
    await userEvent.click(submitButton(element));
    foxy2.stop();
    expect(foxy2.submitted).toEqual([cartForm(element)]);
    expect(sent(element)).toContain("size=2XL");
  });

  it("shows the chosen variant's price", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    const price = () => shadow(element).querySelector("[part=price]")!.textContent;
    expect(price()).toBe("$24.95");
    await userEvent.click(label(element, "2XL"));
    expect(price()).toBe("$26.95");
  });

  it("can't add a sold-out combination", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=Moss"`);
    expect(submitButton(element).disabled).toBe(true);
    expect(submitButton(element).textContent).toBe("Sold out");
    expect(submitButton(element).getAttribute("part")).toBe("button");
  });

  it("asks for a required modifier before adding", async () => {
    const element = await mount(`sku="MUG-ENM-ENGRAVE"`);
    const foxy2 = listenLikeFoxy2(FIXTURE_STORE);
    await userEvent.click(submitButton(element));
    expect(foxy2.submitted).toEqual([]);
    expect(shadow(element).textContent).toContain("Fill this in to add it to the cart.");

    const input = shadow(element).querySelector<HTMLInputElement>("input[type=text]")!;
    expect(input.maxLength).toBe(20);
    await userEvent.fill(input, "Joey");
    await userEvent.click(submitButton(element));
    foxy2.stop();
    expect(foxy2.submitted).toHaveLength(1);
    expect(sent(element)).toEqual(["sku=MUG-ENM-ENGRAVE", "engraving=Joey", "gift_wrap=No"]);
    expect(shadow(element).querySelector("[part=price]")!.textContent).toBe("$27.50$30.00");
  });

  it("lists a parent's variants by name when it has no options", async () => {
    const element = await mount(`sku="SOCK-WOOL"`);
    expect(sent(element)).toEqual(["sku=SOCK-WOOL-S"]);
    expect(shadow(element).querySelector("[part=price]")!.textContent).toBe("$18.00");
  });

  it("takes theme attributes", async () => {
    const element = await mount(`sku="MUG-ENM-WHT" theme-background-button-primary="rgb(11, 93, 59)"`);
    expect(getComputedStyle(submitButton(element)).backgroundColor).toBe("rgb(11, 93, 59)");
  });

  it("adds a quantity when asked", async () => {
    const element = await mount(`sku="MUG-ENM-WHT" show-quantity`);
    const increase = [...shadow(element).querySelectorAll("button")].find((b) =>
      b.getAttribute("aria-label") === "Increase quantity",
    )!;
    await userEvent.click(increase);
    expect(sent(element)).toEqual(["sku=MUG-ENM-WHT", "quantity=2"]);
  });
});

describe("cartFields and livePrice", () => {
  const state = { choices: { color: "Black", size: "2XL" }, variantSku: null, modifiers: { gift_wrap: "Yes" }, quantity: 1 };

  it("adds modifier amounts in the shopper's currency", () => {
    expect(livePrice(teeParent, state, null)).toEqual({ price: 31.45, listPrice: null });
    expect(livePrice(teeParent, state, "EUR")).toEqual({ price: 29, listPrice: null });
  });

  it("leaves out empty modifiers and a quantity of one", () => {
    expect(cartFields(engravedMug, { ...state, modifiers: { engraving: "  ", gift_wrap: "Yes" } })).toEqual([
      ["sku", "MUG-ENM-ENGRAVE"],
      ["gift_wrap", "Yes"],
    ]);
  });
});
