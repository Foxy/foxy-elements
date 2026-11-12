import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, waitFor } from "storybook/test";
import { FIXTURE_STORE, stubCatalog } from "@/lib/products/fixtures";
import "./element";

function render(attributes: Record<string, string | true>): HTMLElement {
  const element = document.createElement("foxy-product-form");
  element.setAttribute("store", FIXTURE_STORE);
  element.setAttribute("currency", "USD");
  element.style.maxWidth = "26rem";
  element.style.display = "block";
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value === true ? "" : value);
  }
  return element;
}

const sent = (canvas: HTMLElement) =>
  [...new FormData(canvas.querySelector<HTMLFormElement>("foxy-product-form form[action]")!)].map(([k, v]) => `${k}=${v}`);

const meta = {
  title: "foxy-product-form",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Options, modifiers and quantity for one product. The catalog answers from fixtures: a tee whose Black comes in S, M (sold out) and 2XL, Natural only in M and L, and Moss only in S, sold out. Natural L has a monogram in place of the gift wrap the others inherit.",
      },
    },
  },
  beforeEach: () => stubCatalog().restore,
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const ParentWithOptions: Story = {
  render: () => render({ sku: "TEE-ORG", "show-quantity": true }),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector("button[type=submit]")?.textContent).toBe("Choose a colour"),
    );
    await expect(sent(canvasElement)).toEqual(["sku=TEE-ORG", "gift_wrap=No"]);
  },
};

export const Preselected: Story = {
  render: () => render({ sku: "TEE-ORG", value: "color=Black&size=2XL", "show-quantity": true }),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(sent(canvasElement)).toEqual(["sku=TEE-ORG", "color=Black", "size=2XL", "gift_wrap=No"]),
    );
  },
};

export const VariantWithItsOwnModifiers: Story = {
  render: () => render({ sku: "TEE-ORG", value: "color=Natural&size=L" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(sent(canvasElement)).toEqual(["sku=TEE-ORG", "color=Natural", "size=L"]));
  },
};

export const RequiredModifier: Story = {
  render: () => render({ sku: "MUG-ENM-ENGRAVE" }),
};

export const LowStock: Story = {
  render: () => render({ sku: "MUG-ENM-WHT", "show-quantity": true }),
};

export const SoldOut: Story = {
  render: () => render({ sku: "COF-HUILA-340" }),
};

export const OtherCurrency: Story = {
  render: () => render({ sku: "TEE-ORG", currency: "EUR", lang: "de-DE" }),
};

export const VariantsWithoutOptions: Story = {
  render: () => render({ sku: "SOCK-WOOL" }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(sent(canvasElement)).toEqual(["sku=SOCK-WOOL-S"]));
  },
};

export const Look: Story = {
  render: () =>
    render({ sku: "MUG-ENM-WHT", "button-color": "#2B4C7E", "button-radius": "8", "text-color": "#2B4C7E", label: "Add to bag" }),
};
