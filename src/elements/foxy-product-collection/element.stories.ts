import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, waitFor } from "storybook/test";
import { FIXTURE_STORE, stubCatalog } from "@/lib/products/fixtures";
import "./element";

function render(attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement("foxy-product-collection");
  element.setAttribute("store", FIXTURE_STORE);
  element.setAttribute("currency", "USD");
  element.setAttribute("product-href", "#/shop/{sku}");
  element.style.width = "min(100%, 56rem)";
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}

const meta = {
  title: "foxy-product-collection",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A grid of tiles from the catalog's list. The fixtures answer two products a page, so 'Load more' shows.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  beforeEach: () => stubCatalog().restore,
  render: () => render(),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll("foxy-product-tile")).toHaveLength(2));
    canvasElement.querySelector<HTMLButtonElement>(".foxy-product-more button")!.click();
    await waitFor(() => expect(canvasElement.querySelectorAll("foxy-product-tile")).toHaveLength(4));
  },
};

export const Empty: Story = {
  beforeEach: () => stubCatalog([]).restore,
  render: () => render(),
};
