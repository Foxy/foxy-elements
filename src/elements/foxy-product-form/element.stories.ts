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
  [...new FormData(canvas.querySelector<HTMLFormElement>("foxy-product-form form")!)].map(([k, v]) => `${k}=${v}`);

const meta = {
  title: "foxy-product-form",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Options, modifiers and quantity for one product. The catalog answers from fixtures: a tee whose Black comes in S, M (sold out) and 2XL, Natural only in M and L, and Moss only in S, sold out.",
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
    await waitFor(() => expect(sent(canvasElement)).toEqual(["sku=TEE-ORG", "color=Black", "size=S", "gift_wrap=No"]));
  },
};

export const Preselected: Story = {
  render: () => render({ sku: "TEE-ORG", value: "color=Natural&size=L" }),
};

export const SoldOutCombination: Story = {
  render: () => render({ sku: "TEE-ORG", value: "color=Moss" }),
};

export const RequiredModifier: Story = {
  render: () => render({ sku: "MUG-ENM-ENGRAVE" }),
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

export const Themed: Story = {
  render: () =>
    render({
      sku: "TEE-ORG",
      "show-quantity": true,
      "theme-background-button-primary": "#0b5d3b",
      "theme-color-primary": "#0b5d3b",
      "theme-border-radius-sm": "999px",
    }),
};
