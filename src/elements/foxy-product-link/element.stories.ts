import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, waitFor } from "storybook/test";
import { FIXTURE_STORE, stubCatalog } from "@/lib/products/fixtures";
import "./element";

function render(attributes: Record<string, string | true>, fallback = ""): HTMLElement {
  const element = document.createElement("foxy-product-link");
  element.setAttribute("store", FIXTURE_STORE);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value === true ? "" : value);
  }
  element.innerHTML = fallback;
  return element;
}

const meta = {
  title: "foxy-product-link",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A link that adds one product by SKU, as a button or as text. These stories answer the public catalog and the store's look from fixtures; the link itself is the real element.",
      },
    },
  },
  beforeEach: () => stubCatalog().restore,
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => render({ sku: "MUG-ENM-WHT" }),
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector("a")!;
    await expect(link.href).toBe(`https://${FIXTURE_STORE}/cart?sku=MUG-ENM-WHT`);
  },
};

export const WithPrice: Story = {
  render: () => render({ sku: "MUG-ENM-WHT", currency: "USD" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector("s")?.textContent).toBe("$18.90"));
  },
};

export const OwnText: Story = {
  render: () => render({ sku: "MUG-ENM-WHT", label: "Get the mug" }),
};

export const TextLink: Story = {
  render: () => render({ sku: "MUG-ENM-WHT", appearance: "text", label: "Add a mug", "show-price": true, currency: "USD" }),
};

export const OtherCurrency: Story = {
  render: () => render({ sku: "MUG-ENM-WHT", currency: "EUR", lang: "de-DE" }),
};

export const BuyNow: Story = {
  render: () => render({ sku: "TEE-ORG-BLK-S", checkout: true, label: "Buy now", quantity: "2" }),
};

export const SoldOut: Story = {
  render: () => render({ sku: "COF-HUILA-340" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector("a")?.hasAttribute("href")).toBe(false));
  },
};

export const ParentCannotBeAdded: Story = {
  render: () =>
    render({ sku: "TEE-ORG" }, `<a href="#tee">Choose a size and colour</a>`),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector("a")?.getAttribute("href")).toBe("#tee"));
  },
};

export const LookFromAttributes: Story = {
  render: () =>
    render({ sku: "MUG-ENM-WHT", currency: "USD", "button-color": "#0b5d3b", "button-radius": "999", font: "serif" }),
};

export const LookFromTheStore: Story = {
  beforeEach: () => {
    const stub = stubCatalog();
    stub.look = { button_color: "#0057d9", button_radius: 6, button_text: "Add to bag", font: "system" };
    return stub.restore;
  },
  render: () => render({ sku: "MUG-ENM-WHT", currency: "USD" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector(".foxy-product-label")?.textContent).toBe("Add to bag"));
  },
};
