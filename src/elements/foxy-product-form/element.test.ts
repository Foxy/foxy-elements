import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  FIXTURE_STORE,
  stubCatalog,
  teeParent,
  type CatalogStub,
} from "@/lib/products/fixtures";
import { listenLikeFoxy2, settle } from "@/lib/products/foxy2-test-utils";
import "./element";

let stub: CatalogStub | undefined;

// Mounted with drop-downs unless `attributes` names another style: the
// parser keeps the first of a repeated attribute.
async function mount(attributes: string, inner = ""): Promise<HTMLElement> {
  stub ??= stubCatalog();
  document.body.innerHTML = `<foxy-product-form store="${FIXTURE_STORE}" lang="en-US" currency="USD" ${attributes} option-style="select">${inner}</foxy-product-form>`;
  const element = document.body.querySelector<HTMLElement>("foxy-product-form")!;
  await vi.waitFor(() => expect(element.querySelector(".foxy-product-controls")).not.toBeNull());
  return element;
}

const cartForm = (element: HTMLElement) => element.querySelector<HTMLFormElement>("form[action]")!;
const sent = (element: HTMLElement) => [...new FormData(cartForm(element))].map(([k, v]) => `${k}=${v}`);
const control = <T extends HTMLElement = HTMLSelectElement>(element: HTMLElement, label: string) => {
  const found = [...element.querySelectorAll("label")].find((l) => l.textContent!.startsWith(label))!;
  return element.querySelector<T>(`#${CSS.escape(found.htmlFor)}`)!;
};
const items = (select: HTMLSelectElement) => [...select.options].map((o) => o.text);
const addButton = (element: HTMLElement) => element.querySelector<HTMLButtonElement>("button[type=submit]")!;
const price = (element: HTMLElement) => element.querySelector(".foxy-product-summary .foxy-product-price")!.textContent;

afterEach(() => {
  stub?.restore();
  stub = undefined;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("foxy-product-form", () => {
  it("shows the merchant's content until the product loads, then renders in light DOM", async () => {
    stub = stubCatalog();
    document.body.innerHTML = `<foxy-product-form store="${FIXTURE_STORE}" sku="TEE-ORG"><p>Loading the tee</p></foxy-product-form>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-form")!;
    expect(element.querySelector("p")?.textContent).toBe("Loading the tee");
    await vi.waitFor(() => expect(cartForm(element)).not.toBeNull());
    expect(element.shadowRoot).toBeNull();
    expect(element.textContent).not.toContain("Loading the tee");
    expect(cartForm(element).action).toBe(`https://${FIXTURE_STORE}/cart`);
    expect(element.querySelector("h2")?.textContent).toBe("Organic Cotton Tee");
    expect(element.querySelector(".foxy-product-brand")?.textContent).toBe("Foxy Goods");
  });

  it("chooses nothing for the shopper, and says what's missing", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    expect(price(element)).toBe("$24.95 – $26.95");
    expect(addButton(element).textContent).toBe("Choose a colour");
    expect(addButton(element).disabled).toBe(true);

    await userEvent.selectOptions(control(element, "Colour"), "Black");
    expect(addButton(element).textContent).toBe("Choose a size");

    await userEvent.selectOptions(control(element, "Size"), "2XL");
    expect(addButton(element).textContent).toBe("Add to cart · $26.95");
    expect(addButton(element).disabled).toBe(false);
    expect(price(element)).toBe("$26.95");
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Black", "size=2XL", "gift_wrap=No"]);
  });

  it("leaves out combinations with no variant and marks sold-out ones, which can't be chosen", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=Black"`);
    expect(items(control(element, "Colour"))).toEqual([
      "Choose a colour",
      "Black",
      "Natural (undyed)",
      "Moss (sold out)",
    ]);
    // With Black chosen: L doesn't exist, M is sold out.
    const size = control(element, "Size");
    expect(items(size)).toEqual(["Choose a size", "S · $24.95", "M (sold out) · $24.95", "2XL · $26.95"]);
    expect(size.options[2].disabled).toBe(true);
    expect(control(element, "Colour").options[3].disabled).toBe(true);
  });

  it("drops a later choice the new one rules out", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=Black&size=S"`);
    expect(sent(element).slice(0, 3)).toEqual(["sku=TEE-ORG", "color=Black", "size=S"]);
    await userEvent.selectOptions(control(element, "Colour"), "Natural");
    // S doesn't come in Natural, so the shopper chooses a size again.
    expect(items(control(element, "Size"))).toEqual(["Choose a size", "M", "L"]);
    expect(control(element, "Size").value).toBe("");
    expect(addButton(element).textContent).toBe("Choose a size");
  });

  it("starts from preselected values, matched without regard to case", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=natural&size=m"`);
    expect(sent(element).slice(0, 3)).toEqual(["sku=TEE-ORG", "color=Natural", "size=M"]);
    expect(element.querySelector(".foxy-product-note")?.textContent).toBe("Only 4 left");
  });

  it("offers the chosen variant's modifiers, not the parent's", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    // Before a variant is chosen: what the parent declares.
    expect(control(element, "Gift wrap")).not.toBeNull();

    await userEvent.selectOptions(control(element, "Colour"), "Natural");
    await userEvent.selectOptions(control(element, "Size"), "L");
    // Natural L has a monogram instead of gift wrap.
    expect([...element.querySelectorAll(".foxy-product-field-label")].map((l) => l.textContent)).toEqual([
      "Colour",
      "Size",
      "Monogram (optional, +$5.00)",
    ]);
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Natural", "size=L"]);

    await userEvent.fill(control<HTMLInputElement>(element, "Monogram"), "JF");
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Natural", "size=L", "monogram=JF"]);
    expect(addButton(element).textContent).toBe("Add to cart · $29.95");
    expect(element.querySelector(".foxy-product-counter")?.textContent).toBe("2 / 3");

    await userEvent.selectOptions(control(element, "Size"), "M");
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Natural", "size=M", "gift_wrap=No"]);
  });

  it("starts an optional choice on its first value and adds no None", async () => {
    const element = await mount(`sku="TEE-ORG"`);
    const giftWrap = control(element, "Gift wrap");
    expect(items(giftWrap)).toEqual(["No thanks", "Wrap it +$4.50"]);
    expect(giftWrap.value).toBe("No");
  });

  it("is submitted through 2.0's delegated submit handler, sending only what the cart allows", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=Black&size=2XL" show-quantity`);
    const foxy2 = listenLikeFoxy2(FIXTURE_STORE);
    await userEvent.selectOptions(control(element, "Gift wrap"), "Yes");
    await userEvent.fill(control<HTMLInputElement>(element, "Quantity"), "2");
    await userEvent.click(addButton(element));
    foxy2.stop();

    expect(foxy2.submitted).toEqual([cartForm(element)]);
    expect(cartForm(element).parentElement).toBe(element);
    expect(cartForm(element).method).toBe("post");
    expect([...cartForm(element).elements].every((field) => (field as HTMLInputElement).type === "hidden")).toBe(true);
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Black", "size=2XL", "gift_wrap=Yes", "quantity=2"]);
    // The visible controls have no action, so nothing of theirs reaches the cart.
    expect(element.querySelector(".foxy-product-controls")!.hasAttribute("action")).toBe(false);
  });

  it("can't add a product that is sold out", async () => {
    stub = stubCatalog([
      {
        ...teeParent,
        is_in_stock: false,
        _embedded: { variants: teeParent._embedded!.variants!.map((v) => ({ ...v, is_in_stock: false })) },
      },
    ]);
    const element = await mount(`sku="TEE-ORG" value="color=Black&size=S"`);
    expect(addButton(element).textContent).toBe("Sold out");
    expect(addButton(element).disabled).toBe(true);
    expect(element.querySelector(".foxy-product-note")?.textContent).toBe("Sold out");
    // The sold-out preselection isn't kept.
    expect(sent(element)).toEqual(["sku=TEE-ORG", "gift_wrap=No"]);
  });

  it("asks for a required modifier before adding", async () => {
    const element = await mount(`sku="MUG-ENM-ENGRAVE"`);
    const foxy2 = listenLikeFoxy2(FIXTURE_STORE);
    const input = control<HTMLInputElement>(element, "Engraving");
    expect(element.querySelector(".foxy-product-field-label")?.textContent).toBe("Engraving (required, +$6.00)");
    expect(input.maxLength).toBe(20);
    expect(input.placeholder).toBe("Up to 20 characters");

    await userEvent.click(addButton(element));
    expect(foxy2.submitted).toEqual([]);
    expect(element.querySelector(".foxy-product-error:not([hidden])")?.textContent).toBe(
      "Fill this in to add it to the cart.",
    );
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(input);

    await userEvent.fill(input, "Joey");
    await userEvent.click(addButton(element));
    foxy2.stop();
    expect(foxy2.submitted).toHaveLength(1);
    expect(sent(element)).toEqual(["sku=MUG-ENM-ENGRAVE", "engraving=Joey", "gift_wrap=No"]);
    expect(price(element)).toBe("$27.50 $30.00");
  });

  it("keeps the shopper's typing and focus while the price follows it", async () => {
    const element = await mount(`sku="MUG-ENM-ENGRAVE"`);
    const input = control<HTMLInputElement>(element, "Engraving");
    await userEvent.type(input, "Jo");
    expect(control<HTMLInputElement>(element, "Engraving")).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(addButton(element).textContent).toBe("Add to cart · $27.50");
  });

  it("lists a parent's variants by name when it has no options", async () => {
    const element = await mount(`sku="SOCK-WOOL"`);
    expect(items(control(element, "Choose one"))).toEqual([
      "Merino Hiking Socks - Small",
      "Merino Hiking Socks - Medium (sold out)",
      "Merino Hiking Socks - Large",
    ]);
    expect(sent(element)).toEqual(["sku=SOCK-WOOL-S"]);
    expect(price(element)).toBe("$18.00");
  });

  it("offers options as buttons with option-style=\"buttons\", with a swatch for each colour", async () => {
    const element = await mount(`sku="TEE-ORG" option-style="buttons"`);
    expect([...element.querySelectorAll("legend")].map((l) => l.textContent!.trim())).toEqual(["Colour", "Size"]);
    const swatches = [...element.querySelectorAll<HTMLElement>(".foxy-product-swatch-dot")];
    expect(swatches.map((dot) => dot.style.backgroundColor)).toContain("rgb(29, 29, 31)");
    await userEvent.click(element.querySelector<HTMLElement>(".foxy-product-swatch")!);
    expect(addButton(element).textContent).toBe("Choose a size");
  });

  it("lists options as rows with option-style=\"rows\", pricing a value once it has one price", async () => {
    const element = await mount(`sku="TEE-ORG" option-style="rows"`);
    const rows = (legend: string) =>
      [...element.querySelectorAll("fieldset")]
        .find((set) => set.querySelector("legend")!.textContent === legend)!
        .querySelectorAll<HTMLLabelElement>(".foxy-product-row");
    await userEvent.click(rows("Colour")[0]);
    const sizes = [...rows("Size")];
    expect(sizes.every((row) => row.querySelector(".foxy-product-row-price"))).toBe(true);
    await userEvent.click(sizes[0]);
    expect(addButton(element).disabled).toBe(false);
    expect(sent(element)[0]).toBe("sku=TEE-ORG");
  });

  it("caps the quantity at what's in stock", async () => {
    const element = await mount(`sku="MUG-ENM-WHT" show-quantity`);
    const quantity = control<HTMLInputElement>(element, "Quantity");
    await userEvent.fill(quantity, "8");
    quantity.dispatchEvent(new Event("change"));
    expect(sent(element)).toEqual(["sku=MUG-ENM-WHT", "quantity=3"]);
    expect(addButton(element).textContent).toBe("Add to cart · $49.20");
    expect(element.querySelector(".foxy-product-note")?.textContent).toBe("Only 3 left");
  });

  it("takes the look from attributes and the button's text from label", async () => {
    const element = await mount(`sku="MUG-ENM-WHT" button-color="rgb(11, 93, 59)" button-radius="6" label="Add to bag"`);
    expect(getComputedStyle(addButton(element)).backgroundColor).toBe("rgb(11, 93, 59)");
    expect(getComputedStyle(addButton(element)).borderRadius).toBe("6px");
    expect(addButton(element).textContent).toBe("Add to bag · $16.40");
  });

  it("changes its look, button text and option style where it stands, without asking the catalog again", async () => {
    const element = await mount(`sku="TEE-ORG" value="color=Black&size=S"`);
    await settle();
    const requests = stub!.requests.length;
    const name = element.querySelector(".foxy-product-name");
    const card = element.querySelector(".foxy-product-form");
    const form = cartForm(element);

    for (const [attribute, value] of [
      ["theme", "dark"],
      ["button-color", "#0b5d3b"],
      ["button-text-color", "#fffbe6"],
      ["button-radius", "2"],
      ["text-color", "#7a1f1f"],
      ["accent-color", "#0057d9"],
      ["font", "serif"],
      ["label", "Add to bag"],
      ["option-style", "buttons"],
    ]) {
      element.setAttribute(attribute, value);
    }
    window.dispatchEvent(
      new CustomEvent("foxy-product-settings", {
        detail: { store: FIXTURE_STORE, settings: { low_stock_threshold: 20, button_text: "Buy" } },
      }),
    );

    const style = getComputedStyle(addButton(element));
    expect(style.backgroundColor).toBe("rgb(11, 93, 59)");
    expect(style.color).toBe("rgb(255, 251, 230)");
    expect(style.borderRadius).toBe("2px");
    expect(getComputedStyle(element).fontFamily).toContain("Georgia");
    expect(getComputedStyle(name!).color).toBe("rgb(122, 31, 31)");
    expect(getComputedStyle(card!).backgroundColor).toBe("rgb(17, 24, 39)");
    expect(addButton(element).textContent).toBe("Add to bag · $24.95");
    expect(element.querySelectorAll(".foxy-product-swatch")).toHaveLength(3);
    // The store's new threshold says so of the 17 left.
    expect(element.querySelector(".foxy-product-note")?.textContent).toBe("Only 17 left");

    // The same nodes, the shopper's choices kept, and no request.
    expect(element.querySelector(".foxy-product-name")).toBe(name);
    expect(element.querySelector(".foxy-product-form")).toBe(card);
    expect(cartForm(element)).toBe(form);
    expect(sent(element)).toEqual(["sku=TEE-ORG", "color=Black", "size=S", "gift_wrap=No"]);
    expect(stub!.requests).toHaveLength(requests);

    element.removeAttribute("label");
    expect(addButton(element).textContent).toBe("Buy · $24.95");
  });

  it("shows every price in the currency the catalog says it is in, not the one the page wants", async () => {
    // The page wants CAD, which no product has a price in; the catalog's prices are in USD.
    document.body.innerHTML = `<div currency="CAD"></div>`;
    stub = stubCatalog();
    document.body.firstElementChild!.innerHTML = `<foxy-product-form store="${FIXTURE_STORE}" lang="en-US" sku="TEE-ORG" option-style="select"></foxy-product-form>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-form")!;
    await vi.waitFor(() => expect(element.querySelector(".foxy-product-controls")).not.toBeNull());
    expect(price(element)).toBe("$24.95 – $26.95");
    await userEvent.selectOptions(control(element, "Colour"), "Black");
    expect(items(control(element, "Size"))).toContain("2XL · $26.95");
    await userEvent.selectOptions(control(element, "Size"), "2XL");
    expect(addButton(element).textContent).toBe("Add to cart · $26.95");
    expect(items(control(element, "Gift wrap"))).toEqual(["No thanks", "Wrap it +$4.50"]);
  });

  it("reports the product as viewed once, and an add with the chosen variant, quantity and value", async () => {
    const handlers: Record<string, () => void> = {};
    window.FC = {
      json: { item_count: 1 },
      client: { on: (event: string, handler: () => void) => (handlers[event] = handler) },
    };
    stub = stubCatalog();
    stub.look = { analytics: true };
    const viewed = vi.fn();
    document.body.addEventListener("foxy-product:view-item", viewed);
    const element = await mount(`sku="TEE-ORG" show-quantity`);
    await vi.waitFor(() => expect(handlers["cart-submit.done"]).toBeDefined());
    await settle();
    expect(window.dataLayer).toEqual([
      { ecommerce: null },
      {
        event: "view_item",
        ecommerce: {
          currency: "USD",
          value: 24.95,
          items: [{ item_id: "TEE-ORG", item_name: "Organic Cotton Tee", item_brand: "Foxy Goods", price: 24.95, quantity: 1 }],
        },
      },
    ]);

    cartForm(element).addEventListener("submit", (event) => event.preventDefault());
    await userEvent.selectOptions(control(element, "Colour"), "Black");
    await userEvent.selectOptions(control(element, "Size"), "2XL");
    await userEvent.selectOptions(control(element, "Gift wrap"), "Yes");
    await userEvent.fill(control<HTMLInputElement>(element, "Quantity"), "2");
    element.setAttribute("label", "Add to bag");
    await userEvent.click(addButton(element));
    // The cart refused it: nothing is reported.
    handlers["cart-submit.done"]();
    await settle();
    expect(window.dataLayer).toHaveLength(2);

    await userEvent.click(addButton(element));
    window.FC.json!.item_count = 3;
    handlers["cart-submit.done"]();
    await settle();
    expect(window.dataLayer!.slice(2)).toEqual([
      { ecommerce: null },
      {
        event: "add_to_cart",
        ecommerce: {
          currency: "USD",
          value: 62.9,
          items: [
            { item_id: "TEE-ORG", item_name: "Organic Cotton Tee", item_variant: "TEE-ORG-BLK-2XL", item_brand: "Foxy Goods", price: 31.45, quantity: 2 },
          ],
        },
      },
    ]);
    // Choosing a variant, and every re-render, left it at one view.
    expect(viewed).toHaveBeenCalledTimes(1);
    document.body.removeEventListener("foxy-product:view-item", viewed);
    delete window.FC;
    delete window.dataLayer;
  });

  it("lets one rule restyle the price and the list price", async () => {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style data-test>foxy-product-form { --foxy-product-price-color: rgb(180, 83, 9); --foxy-product-price-size: 28px; --foxy-product-list-price-color: rgb(20, 20, 200); --foxy-product-list-price-size: 12px; }</style>`,
    );
    const element = await mount(`sku="MUG-ENM-WHT"`);
    const shown = element.querySelector(".foxy-product-summary .foxy-product-price")!;
    const was = shown.querySelector(".foxy-product-list-price")!;
    expect(getComputedStyle(shown).color).toBe("rgb(180, 83, 9)");
    expect(getComputedStyle(shown).fontSize).toBe("28px");
    expect(getComputedStyle(was).color).toBe("rgb(20, 20, 200)");
    expect(getComputedStyle(was).fontSize).toBe("12px");
    document.head.querySelector("style[data-test]")!.remove();
  });

  it("offers a long list of plain values in a drop-down even as buttons", async () => {
    const sizes = ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"];
    const options = [{ name: "size", label: "Size", values: sizes.map((value) => ({ value })) }];
    const variants = sizes.map((size, index) => ({
      ...teeParent._embedded!.variants![0],
      sku: `SHOE-${index}`,
      option_values: { size },
      definition: { ...teeParent._embedded!.variants![0].definition, options },
    }));
    stub = stubCatalog([{ ...teeParent, definition: { ...teeParent.definition, options }, _embedded: { variants } }]);
    document.body.innerHTML = `<foxy-product-form store="${FIXTURE_STORE}" lang="en-US" sku="TEE-ORG" option-style="buttons"></foxy-product-form>`;
    const element = document.body.querySelector<HTMLElement>("foxy-product-form")!;
    await vi.waitFor(() => expect(element.querySelector(".foxy-product-controls")).not.toBeNull());
    expect(items(control(element, "Size"))).toHaveLength(10);
    expect(element.querySelector(".foxy-product-pill")).toBeNull();
  });
});
