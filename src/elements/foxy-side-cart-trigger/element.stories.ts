import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, spyOn, userEvent, waitFor } from "storybook/test";
import { sideCart } from "@foxy.io/sdk/checkout/side-cart";
import "./element";
import type { SideCartTriggerElement } from "./element";

/**
 * Stubs the singleton's `itemCount` getter for the story's lifetime. The
 * getter lives on the class (`Object.getPrototypeOf(sideCart)`), not on the
 * instance, so a spy on the instance would have no own descriptor to replace
 * — same reason the element's own unit test spies on the prototype.
 *
 * `beforeEach` returning a function is this repo's convention for story
 * cleanup (see `foxy-payment-method-selector/utils.ts`'s
 * `overrideCheckoutClient`); Storybook calls the returned function after the
 * story tears down.
 */
function stubItemCount(itemCount: number | null): () => void {
  const spy = spyOn(
    Object.getPrototypeOf(sideCart) as { itemCount: number | null },
    "itemCount",
    "get",
  ).mockReturnValue(itemCount);

  return () => spy.mockRestore();
}

function getTrigger(canvasElement: HTMLElement): SideCartTriggerElement {
  return canvasElement.querySelector(
    "[data-story-role='primary']",
  ) as SideCartTriggerElement;
}

function renderTrigger(): SideCartTriggerElement {
  const element = document.createElement("foxy-side-cart-trigger");
  element.setAttribute("data-story-role", "primary");
  return element;
}

const meta = {
  title: "Universal/foxy-side-cart-trigger",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Drop-in trigger for the sidecart: shows the cart's item count and opens the drawer on click. It reads the same public `sideCart` singleton a merchant integration would (`@foxy.io/sdk/checkout/side-cart`), so these stories stub only that singleton's `itemCount` getter — everything else is the real element.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const UnknownCount: Story = {
  name: "Unknown Count",
  parameters: {
    docs: {
      description: {
        story:
          "A cold start: nothing has reported a count yet. `itemCount` is `null`, not `0`, and the element renders no badge at all rather than claim a count it doesn't have.",
      },
    },
  },
  beforeEach: () => stubItemCount(null),
  render: () => renderTrigger(),
  play: async ({ canvasElement }) => {
    const trigger = getTrigger(canvasElement);

    await waitFor(() => {
      expect(trigger.shadowRoot?.querySelector("button")).toBeTruthy();
    });

    expect(trigger.shadowRoot?.textContent).not.toMatch(/\d/);

    // `textContent` never surfaces attribute values, so the assertion above
    // would stay green even if the accessible name started lying about the
    // count. Assert the name itself.
    const button = trigger.shadowRoot?.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe("Cart");
  },
};

export const ZeroCount: Story = {
  name: "Zero Count",
  parameters: {
    docs: {
      description: {
        story:
          "A known count of zero. This is a real answer — an empty cart — and is rendered as a badge reading `0`, distinct from the unknown state above rendering no badge.",
      },
    },
  },
  beforeEach: () => stubItemCount(0),
  render: () => renderTrigger(),
  play: async ({ canvasElement }) => {
    const trigger = getTrigger(canvasElement);

    await waitFor(() => {
      expect(trigger.shadowRoot?.textContent).toContain("0");
    });

    const button = trigger.shadowRoot?.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe("Cart, 0 items");
  },
};

export const KnownCount: Story = {
  name: "Known Count",
  parameters: {
    docs: {
      description: {
        story:
          "A non-zero count renders in the badge, and clicking the trigger opens the sidecart drawer via `sideCart.show()`.",
      },
    },
  },
  beforeEach: () => stubItemCount(3),
  render: () => renderTrigger(),
  play: async ({ canvasElement }) => {
    const trigger = getTrigger(canvasElement);
    const show = spyOn(sideCart, "show").mockImplementation(() => undefined);

    await waitFor(() => {
      expect(trigger.shadowRoot?.textContent).toContain("3");
    });

    const button = trigger.shadowRoot?.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe("Cart, 3 items");

    if (button) await userEvent.click(button);

    expect(show).toHaveBeenCalledTimes(1);
    show.mockRestore();
  },
};
