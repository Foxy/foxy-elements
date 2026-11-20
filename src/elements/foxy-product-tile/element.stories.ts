import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, waitFor } from "storybook/test";
import { FIXTURE_STORE, stubCatalog } from "@/lib/products/fixtures";
import "./element";

function render(attributes: Record<string, string>): HTMLElement {
  const element = document.createElement("foxy-product-tile");
  element.setAttribute("store", FIXTURE_STORE);
  element.setAttribute("currency", "USD");
  element.setAttribute("href", "#/shop/{sku}");
  element.style.width = "16rem";
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}

const meta = {
  title: "foxy-product-tile",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One product in a grid. The catalog answers from fixtures, with placeholder photos.",
      },
    },
  },
  beforeEach: () => stubCatalog().restore,
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const QuickAdd: Story = {
  render: () => render({ sku: "MUG-ENM-WHT" }),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector<HTMLAnchorElement>("a.foxy-product-button")?.href).toBe(
        `https://${FIXTURE_STORE}/cart?sku=MUG-ENM-WHT`,
      ),
    );
  },
};

export const ParentLinksToItsPage: Story = {
  render: () => render({ sku: "TEE-ORG" }),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector(".foxy-product-name a")?.getAttribute("href")).toBe("#/shop/TEE-ORG"),
    );
    expect(canvasElement.querySelector(".foxy-product-button")).toBeNull();
  },
};

export const RequiredModifier: Story = {
  render: () => render({ sku: "MUG-ENM-ENGRAVE" }),
};

export const SoldOut: Story = {
  render: () => render({ sku: "COF-HUILA-340" }),
};

export const Translated: Story = {
  render: () => render({ sku: "TEE-ORG", lang: "fr-FR", currency: "EUR" }),
};
