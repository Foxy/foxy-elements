import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, waitFor } from "storybook/test";
import { FIXTURE_STORE, fieldJacket, fixtureProducts, stubCatalog } from "@/lib/products/fixtures";
import "./element";

function render(attributes: Record<string, string>, maxWidth = ""): HTMLElement {
  const element = document.createElement("foxy-product-page");
  element.setAttribute("store", FIXTURE_STORE);
  element.setAttribute("currency", "USD");
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  element.style.maxWidth = maxWidth;
  const holder = document.createElement("div");
  holder.style.cssText = "padding: 32px 16px; background: #EEEEEE";
  holder.append(element);
  return holder;
}

const button = (canvas: HTMLElement) => canvas.querySelector("button[type=submit]")?.textContent;
const tabs = (canvas: HTMLElement) => [...canvas.querySelectorAll(".foxy-product-tab")].map((tab) => tab.textContent);
const accordion = (canvas: HTMLElement) =>
  [...canvas.querySelectorAll(".foxy-product-section-title")].map((title) => title.textContent);
const jacketSections = ["Features", "Size & fit", "Care", "Shipping & returns", "Details"];

const meta = {
  title: "foxy-product-page",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A whole product page. The catalog answers from fixtures, with placeholder photos. The field jacket has everything filled in: sections, a photo per colour, a sale price in three currencies, modifiers and low stock.",
      },
    },
  },
  beforeEach: () => stubCatalog([...fixtureProducts, fieldJacket]).restore,
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const ParentWithOptions: Story = {
  render: () => render({ sku: "TEE-ORG" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(button(canvasElement)).toBe("Choose a colour"));
  },
};

export const VariantChosen: Story = {
  render: () => render({ sku: "TEE-ORG", value: "color=Natural&size=M" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(button(canvasElement)).toBe("Add to cart · $24.95"));
    await expect(canvasElement.querySelector(".foxy-product-note")?.textContent).toBe("Only 4 left");
  },
};

export const NoOptions: Story = {
  render: () => render({ sku: "MUG-ENM-WHT" }),
};

export const WithModifiers: Story = {
  render: () => render({ sku: "MUG-ENM-ENGRAVE" }),
};

export const SoldOut: Story = {
  render: () => render({ sku: "COF-HUILA-340" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(button(canvasElement)).toBe("Sold out"));
  },
};

export const Look: Story = {
  render: () =>
    render({ sku: "TEE-ORG", "accent-color": "#2B4C7E", "button-color": "#2B4C7E", "button-radius": "8", font: "serif" }),
};

export const DescriptionAsTabs: Story = {
  render: () => render({ sku: "JKT-WAX", "description-layout": "tabs", "collection-href": "#/collections/{id}" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(tabs(canvasElement)).toEqual(jacketSections));
  },
};

export const DescriptionAsAccordion: Story = {
  render: () => render({ sku: "JKT-WAX", "description-layout": "accordion" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(accordion(canvasElement)).toEqual(jacketSections));
  },
};

/** `auto` picks tabs when the page is wide and an accordion when it's narrow, as here. */
export const DescriptionAutoWhenNarrow: Story = {
  render: () => render({ sku: "JKT-WAX" }, "420px"),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(accordion(canvasElement)).toEqual(jacketSections));
  },
};

export const VariantOnSaleRunningLow: Story = {
  render: () => render({ sku: "JKT-WAX", value: "color=Olive&size=M" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(button(canvasElement)).toBe("Add to cart · $189.00"));
    await expect(canvasElement.querySelector(".foxy-product-note")?.textContent).toBe("Only 3 left");
  },
};

export const OtherCurrency: Story = {
  render: () => render({ sku: "JKT-WAX", currency: "GBP", lang: "en-GB", value: "color=Navy&size=XL" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(button(canvasElement)).toBe("Add to cart · £167.50"));
  },
};
