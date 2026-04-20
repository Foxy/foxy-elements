import type { Meta, StoryObj } from "@storybook/web-components-vite";
import {
  ACH_FIELD_ELEMENT_TAG,
  type AchFieldElement,
  type AchHostedFieldName,
} from "@/elements/ach-field-element";
import { getRequiredEnvVar } from "../../lib/required-env";
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  getShadcnInputMetrics,
  type ThemeAttributeMapEntry,
} from "./theme-attribute-sync";

const ACH_SECURE_ORIGIN = getRequiredEnvVar("VITE_EMBED_ORIGIN");
const LABEL_TO_FIELD_GAP = "0.375rem";

const ACH_THEME_ATTRIBUTE_MAP: ThemeAttributeMapEntry[] = [
  {
    attribute: "theme-font-sans",
    cssVariable: "--font-sans",
    fallback: "ui-sans-serif, system-ui, sans-serif",
  },
  {
    attribute: "theme-input-text-color",
    cssVariable: "--foreground",
    fallback: "#111827",
  },
  {
    attribute: "theme-input-placeholder-color",
    cssVariable: "--muted-foreground",
    fallback: "#6b7280",
  },
  {
    attribute: "theme-input-error-text-color",
    cssVariable: "--destructive",
    fallback: "#dc2626",
  },
];

function styleShadcnSurface(element: HTMLElement) {
  element.style.width = "420px";
  element.style.display = "grid";
  element.style.gap = "0.75rem";
  element.style.padding = "1rem";
  element.style.border = "1px solid var(--border, #e5e7eb)";
  element.style.borderRadius = "var(--radius, 0.625rem)";
  element.style.background = "var(--card, #ffffff)";
  element.style.color = "var(--card-foreground, #111827)";
  element.style.boxShadow = "var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))";
}

function styleFieldHost(element: HTMLElement) {
  const metrics = getShadcnInputMetrics();
  element.style.display = "block";
  element.style.width = "100%";
  element.style.minHeight = `${metrics.outerHeightPx}px`;
  element.style.border = "1px solid var(--input, #d1d5db)";
  element.style.borderRadius = "calc(var(--radius, 0.625rem) - 2px)";
  element.style.background = "var(--background, #ffffff)";
  element.style.overflow = "hidden";
  element.style.transition = "border-color 150ms ease, box-shadow 150ms ease";
}

function injectFieldInteractionStyles(container: HTMLElement) {
  if (container.querySelector("style[data-story-field-interactions='ach']")) return;

  const style = document.createElement("style");
  style.setAttribute("data-story-field-interactions", "ach");
  style.textContent = `
    ${ACH_FIELD_ELEMENT_TAG}[data-focused] {
      border-color: var(--ring, #94a3b8) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring, #94a3b8) 35%, transparent);
    }

    ${ACH_FIELD_ELEMENT_TAG}[data-user-invalid] {
      border-color: var(--destructive, #dc2626) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--destructive, #dc2626) 20%, transparent);
    }

    ${ACH_FIELD_ELEMENT_TAG}[data-disabled] {
      background: var(--muted, #f3f4f6) !important;
      opacity: 0.75;
    }
  `;

  container.append(style);
}

function applyAchThemeAttributes(element: AchFieldElement) {
  const metrics = getShadcnInputMetrics();
  const hostBorderTotalPx = 2;
  const hostedInputHeightPx = Math.max(metrics.outerHeightPx - hostBorderTotalPx, 0);

  element.setAttribute("theme-input-height", `${hostedInputHeightPx}px`);
  element.setAttribute("theme-input-padding-y", metrics.paddingY);
  element.setAttribute("theme-input-padding-x", metrics.paddingX);
  element.setAttribute("theme-input-font-size", metrics.fontSize);
  applyThemeAttributeMap(element, ACH_THEME_ATTRIBUTE_MAP);
}

type AchStoryArgs = {
  field: AchHostedFieldName;
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
    styleShadcnSurface(wrapper);
    injectFieldInteractionStyles(wrapper);

    const group = document.createElement("div");
    group.style.display = "grid";
    group.style.gap = LABEL_TO_FIELD_GAP;

    const fieldLabel = document.createElement("label");
    fieldLabel.textContent = label ?? "Field";
    fieldLabel.style.fontSize = "0.875rem";
    fieldLabel.style.fontWeight = "500";

    const note = document.createElement("p");
    note.textContent =
      "Preview loads embedded field content from the configured secure origin.";
    note.style.margin = "0";
    note.style.fontSize = "0.875rem";
    note.style.color = "var(--muted-foreground, #6b7280)";

    const element = document.createElement(
      ACH_FIELD_ELEMENT_TAG,
    ) as AchFieldElement;

    element.secureOrigin = ACH_SECURE_ORIGIN;
    element.field = field;
    element.label = label;
    element.placeholder = placeholder;
    element.sessionId = "storybook-ach-session";
    element.disabled = disabled;
    applyAchThemeAttributes(element);
    bindThemeAttributes(element, applyAchThemeAttributes);
    styleFieldHost(element);

    group.append(fieldLabel, element);
    wrapper.append(group, note);
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

export const FormValidityFlow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates native form reportValidity plus ACH tokenization across a shared session.",
      },
    },
  },
  render: () => {
    const sessionId = "storybook-ach-form-session";

    const form = document.createElement("form");
    styleShadcnSurface(form);
    injectFieldInteractionStyles(form);

    const status = document.createElement("p");
    status.style.margin = "0";
    status.style.fontSize = "0.875rem";
    status.style.color = "var(--muted-foreground, #6b7280)";
    status.textContent = "Submit to validate fields and attempt tokenization.";

    const fieldDefs: Array<{
      field: AchHostedFieldName;
      label: string;
      placeholder?: string;
      accountTypeValues?: "checking,savings";
    }> = [
      {
        field: "routing_number",
        label: "Routing number",
        placeholder: "123456789",
      },
      {
        field: "account_number",
        label: "Account number",
        placeholder: "000123456789",
      },
      {
        field: "account_type",
        label: "Account type",
        accountTypeValues: "checking,savings",
      },
      {
        field: "account_holder_name",
        label: "Name on account",
        placeholder: "Jane Doe",
      },
    ];

    let tokenizeSource: AchFieldElement | null = null;

    for (const def of fieldDefs) {
      const group = document.createElement("div");
      group.style.display = "grid";
      group.style.gap = LABEL_TO_FIELD_GAP;

      const label = document.createElement("label");
      label.textContent = def.label;
      label.style.fontSize = "0.875rem";
      label.style.fontWeight = "500";

      const field = document.createElement(
        ACH_FIELD_ELEMENT_TAG,
      ) as AchFieldElement;
      field.secureOrigin = ACH_SECURE_ORIGIN;
      field.sessionId = sessionId;
      field.field = def.field;
      field.label = def.label;
      field.placeholder = def.placeholder;
      if (def.accountTypeValues) {
        field.setAttribute("account-type-values", def.accountTypeValues);
      }
      applyAchThemeAttributes(field);
      bindThemeAttributes(field, applyAchThemeAttributes);
      styleFieldHost(field);

      if (!tokenizeSource) tokenizeSource = field;

      group.append(label, field);
      form.append(group);
    }

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Submit ACH form";
    submit.style.height = "40px";
    submit.style.border = "1px solid var(--input, #d1d5db)";
    submit.style.borderRadius = "calc(var(--radius, 0.625rem) - 2px)";
    submit.style.background = "var(--primary, #111827)";
    submit.style.color = "var(--primary-foreground, #ffffff)";
    submit.style.fontSize = "0.875rem";
    submit.style.fontWeight = "500";
    submit.style.padding = "0 0.875rem";
    submit.style.cursor = "pointer";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const valid = form.reportValidity();
      if (!valid) {
        status.textContent = "Form is invalid. Complete all ACH fields.";
        return;
      }

      if (!tokenizeSource) {
        status.textContent = "No ACH field is available for tokenization.";
        return;
      }

      status.textContent = "Tokenizing...";
      try {
        const result = await tokenizeSource.tokenize();
        status.textContent = `Tokenized successfully: ${result.token}`;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        status.textContent = `Tokenization failed: ${message}`;
      }
    });

    form.append(submit, status);
    return form;
  },
};
