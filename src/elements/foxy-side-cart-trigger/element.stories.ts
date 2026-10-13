import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect, spyOn, userEvent, waitFor } from "storybook/test";
import { sideCart } from "@foxy.io/sdk/checkout/side-cart";
import "./element";
import type { SideCartTriggerElement, SideCartTriggerLayout } from "./element";

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

function renderTrigger(layout?: SideCartTriggerLayout): SideCartTriggerElement {
  const element = document.createElement("foxy-side-cart-trigger");
  element.setAttribute("data-story-role", "primary");
  if (layout) element.layout = layout;
  return element;
}

const meta = {
  title: "foxy-side-cart-trigger",
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

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`itemCount` is `null`: nothing has reported a count yet. Each layout shows a spinner in place of the badge until a count arrives.",
      },
    },
  },
  beforeEach: () => stubItemCount(null),
  render: () => {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "display: flex; gap: 1rem; align-items: center;";
    wrapper.append(
      renderTrigger(),
      renderTrigger("icon"),
      renderTrigger("text"),
    );
    return wrapper;
  },
  play: async ({ canvasElement }) => {
    const triggers = [
      ...canvasElement.querySelectorAll<SideCartTriggerElement>("foxy-side-cart-trigger"),
    ];
    expect(triggers.map((trigger) => trigger.layout)).toEqual(["default", "icon", "text"]);

    for (const trigger of triggers) {
      const button = await waitFor(() => {
        const found = trigger.shadowRoot?.querySelector("button");
        expect(found?.querySelector('[part="spinner"]')).toBeTruthy();
        return found!;
      });

      expect(button.getAttribute("aria-label")).toBe("Cart");
    }
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
      expect(trigger.shadowRoot?.querySelector("button")?.textContent).toContain("3");
    });

    const button = trigger.shadowRoot?.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe("Cart, 3 items");

    if (button) await userEvent.click(button);

    expect(show).toHaveBeenCalledTimes(1);
    show.mockRestore();
  },
};

export const IconOnly: Story = {
  name: "Icon Only",
  parameters: {
    docs: {
      description: {
        story:
          "`layout=\"icon\"`: the icon and the badge only. The \"Cart\" text stays in the DOM, visually hidden, and the button's accessible name is unchanged.",
      },
    },
  },
  beforeEach: () => stubItemCount(3),
  render: () => renderTrigger("icon"),
  play: async ({ canvasElement }) => {
    const button = await waitFor(() => {
      const found = getTrigger(canvasElement).shadowRoot?.querySelector("button");
      expect(found?.querySelector('[part="icon"]')).toBeTruthy();
      return found!;
    });

    expect(button.querySelector('[part="label"]')).toBeNull();
    expect(button.getAttribute("aria-label")).toBe("Cart, 3 items");
  },
};

export const TextOnly: Story = {
  name: "Text Only",
  parameters: {
    docs: {
      description: {
        story: "`layout=\"text\"`: the text and the badge, no icon.",
      },
    },
  },
  beforeEach: () => stubItemCount(3),
  render: () => renderTrigger("text"),
  play: async ({ canvasElement }) => {
    const button = await waitFor(() => {
      const found = getTrigger(canvasElement).shadowRoot?.querySelector("button");
      expect(found?.querySelector('[part="label"]')).toBeTruthy();
      return found!;
    });

    expect(button.querySelector('[part="icon"]')).toBeNull();
  },
};
