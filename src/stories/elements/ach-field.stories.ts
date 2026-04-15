import type { Meta, StoryObj } from "@storybook/web-components-vite";
import {
  ACH_FIELD_ELEMENT_TAG,
  defineAchFieldElement,
  type AchFieldElementConfig,
} from "@/elements/ach-field-element";
import { getRequiredEnvVar } from "../../lib/required-env";

defineAchFieldElement();

const ACH_SECURE_ORIGIN = getRequiredEnvVar("VITE_EMBED_ORIGIN");
const ACH_MERCHANT_ORIGIN =
  typeof window === "undefined"
    ? "http://localhost:6006"
    : window.location.origin;

type AchStoryArgs = {
  field: AchFieldElementConfig["field"];
  label?: string;
  placeholder?: string;
  disabled: boolean;
};

const meta = {
  title: "Elements/ACH Field",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "ACH hosted field element. The iframe content depends on the configured secure origin and embed path.",
      },
    },
  },
  argTypes: {
    field: {
      control: "select",
      options: [
        "routing_number",
        "account_number",
        "account_type",
        "account_holder_name",
      ],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    field: "routing_number",
    label: "Routing number",
    placeholder: "123456789",
    disabled: false,
  },
  render: ({ field, label, placeholder, disabled }) => {
    const wrapper = document.createElement("div");
    wrapper.style.width = "420px";
    wrapper.style.display = "grid";
    wrapper.style.gap = "0.75rem";

    const note = document.createElement("p");
    note.textContent =
      "Preview loads embedded field content from the configured secure origin.";
    note.style.margin = "0";
    note.style.fontSize = "0.875rem";
    note.style.color = "var(--muted-foreground, #6b7280)";

    const element = document.createElement(
      ACH_FIELD_ELEMENT_TAG,
    ) as HTMLElement & {
      config: AchFieldElementConfig;
      disabled: boolean;
    };

    element.config = {
      secureOrigin: ACH_SECURE_ORIGIN,
      embedPath: "/v2.html",
      field,
      label,
      placeholder,
      merchantOrigin: ACH_MERCHANT_ORIGIN,
    };
    element.disabled = disabled;

    wrapper.append(element, note);
    return wrapper;
  },
} satisfies Meta<AchStoryArgs>;

export default meta;

type Story = StoryObj<AchStoryArgs>;

export const RoutingNumber: Story = {};

export const AccountNumber: Story = {
  args: {
    field: "account_number",
    label: "Account number",
    placeholder: "000123456789",
  },
};

export const AccountType: Story = {
  args: {
    field: "account_type",
    label: "Account type",
    placeholder: undefined,
  },
};

export const AccountHolderName: Story = {
  args: {
    field: "account_holder_name",
    label: "Name on account",
    placeholder: "Jane Doe",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
