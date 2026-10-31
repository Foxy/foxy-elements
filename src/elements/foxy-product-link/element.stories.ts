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
          "A link styled as a button that adds one product by SKU. These stories answer the public catalog from fixtures; the link itself is the real element.",
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
  render: () => render({ sku: "MUG-ENM-WHT", "show-price": true, currency: "USD" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector("s")?.textContent).toBe("$18.90"));
  },
};

export const OtherCurrency: Story = {
  render: () => render({ sku: "MUG-ENM-WHT", "show-price": true, currency: "EUR", lang: "de-DE" }),
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

export const ParentKeepsFallback: Story = {
  render: () =>
    render({ sku: "TEE-ORG" }, `<a href="#tee">Choose a size and colour</a>`),
};

export const Themed: Story = {
  render: () => {
    const element = render({ sku: "MUG-ENM-WHT", "show-price": true, currency: "USD" });
    element.style.setProperty("--background-button-primary", "#0b5d3b");
    element.style.setProperty("--border-radius-sm", "999px");
    return element;
  },
};
