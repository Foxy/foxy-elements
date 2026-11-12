import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, waitFor } from "storybook/test";
import { FIXTURE_STORE, stubCatalog } from "@/lib/products/fixtures";
import "./element";

function render(attributes: Record<string, string>): HTMLElement {
  const element = document.createElement("foxy-product-page");
  element.setAttribute("store", FIXTURE_STORE);
  element.setAttribute("currency", "USD");
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  const holder = document.createElement("div");
  holder.style.cssText = "padding: 32px 16px; background: #EEEEEE";
  holder.append(element);
  return holder;
}

const button = (canvas: HTMLElement) => canvas.querySelector("button[type=submit]")?.textContent;

const meta = {
  title: "foxy-product-page",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A whole product page. The catalog answers from fixtures; their image URLs don't resolve, so the photo areas show their placeholder background.",
      },
    },
  },
  beforeEach: () => stubCatalog().restore,
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
