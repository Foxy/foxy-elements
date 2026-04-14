import type { Meta, StoryObj } from "@storybook/web-components-vite";
import {
  CARD_EMBED_ELEMENT_TAG,
  defineCardEmbedElement,
  type CardEmbedElementConfig,
} from "@/elements/card-embed-element";
import { getRequiredEnvVar } from "../../lib/required-env";

defineCardEmbedElement();

const CARD_SECURE_ORIGIN = getRequiredEnvVar("VITE_CARD_SECURE_ORIGIN");
const CARD_MERCHANT_ORIGIN =
  typeof window === "undefined"
    ? "http://localhost:6006"
    : window.location.origin;

type CardStoryArgs = {
  mode: CardEmbedElementConfig["mode"];
  disabled: boolean;
  readonly: boolean;
};

const meta = {
  title: "Elements/Card Embed",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Secure card iframe element. Visual stories focus on configuration states and host-level toggles.",
      },
    },
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["full", "csc-only"] },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
  },
  args: {
    mode: "full",
    disabled: false,
    readonly: false,
  },
  render: ({ mode, disabled, readonly }) => {
    const wrapper = document.createElement("div");
    wrapper.style.width = "420px";
    wrapper.style.display = "grid";
    wrapper.style.gap = "0.75rem";

    const note = document.createElement("p");
    note.textContent =
      "Uses hosted iframe at the configured secure origin. In isolated environments, ready/validation signals may not appear.";
    note.style.margin = "0";
    note.style.fontSize = "0.875rem";
    note.style.color = "var(--muted-foreground, #6b7280)";

    const element = document.createElement(
      CARD_EMBED_ELEMENT_TAG,
    ) as HTMLElement & {
      config: CardEmbedElementConfig;
      disabled: boolean;
      readonly: boolean;
    };

    element.config = {
      secureOrigin: CARD_SECURE_ORIGIN,
      embedPath: "/v2.html",
      mode,
      demoMode: mode,
      merchantOrigin: CARD_MERCHANT_ORIGIN,
    };
    element.disabled = disabled;
    element.readonly = readonly;

    wrapper.append(element, note);
    return wrapper;
  },
} satisfies Meta<CardStoryArgs>;

export default meta;

type Story = StoryObj<CardStoryArgs>;

export const FullMode: Story = {};

export const CscOnlyMode: Story = {
  args: {
    mode: "csc-only",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Readonly: Story = {
  args: {
    readonly: true,
  },
};
