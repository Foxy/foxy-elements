import type { Meta, StoryObj } from "@storybook/web-components-vite";
import {
  PAYMENT_CARD_FIELD_ELEMENT_TAG,
  type PaymentCardFieldElement,
} from "@/elements/payment-card-field-element";
import { getRequiredEnvVar } from "../../lib/required-env";
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  getShadcnInputMetrics,
  type ThemeAttributeMapEntry,
} from "./theme-attribute-sync";

const CARD_SECURE_ORIGIN = getRequiredEnvVar("VITE_EMBED_ORIGIN");
const LABEL_TO_FIELD_GAP = "0.375rem";

const CARD_THEME_ATTRIBUTE_MAP: ThemeAttributeMapEntry[] = [
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
  {
    attribute: "theme-background",
    cssVariable: "--background",
    fallback: "#ffffff",
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
  if (container.querySelector("style[data-story-field-interactions='card']")) return;

  const style = document.createElement("style");
  style.setAttribute("data-story-field-interactions", "card");
  style.textContent = `
    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}[data-focused],
    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:focus-within {
      border-color: var(--ring, #94a3b8) !important;
      outline: none !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring, #94a3b8) 35%, transparent) !important;
    }

    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}[data-user-invalid] {
      border-color: var(--destructive, #dc2626) !important;
      outline: 2px solid rgba(220, 38, 38, 0.6) !important;
      outline-offset: 2px;
      box-shadow: none !important;
    }

    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}[data-disabled] {
      background: var(--muted, #f3f4f6) !important;
      opacity: 0.75;
    }
  `;

  container.append(style);
}

function applyCardThemeAttributes(element: PaymentCardFieldElement) {
  const metrics = getShadcnInputMetrics();
  const hostBorderTotalPx = 2;
  const hostedInputHeightPx = Math.max(metrics.outerHeightPx - hostBorderTotalPx, 0);

  element.setAttribute("theme-input-height", `${hostedInputHeightPx}px`);
  element.setAttribute("theme-input-padding-y", metrics.paddingY);
  element.setAttribute("theme-input-padding-x", metrics.paddingX);
  element.setAttribute("theme-input-font-size", metrics.fontSize);
  applyThemeAttributeMap(element, CARD_THEME_ATTRIBUTE_MAP);
}

type CardStoryArgs = {
  mode: "full" | "csc-only";
  disabled: boolean;
  readonly: boolean;
  focused: boolean;
  userInvalid: boolean;
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
    focused: { control: "boolean" },
    userInvalid: { control: "boolean" },
  },
  args: {
    mode: "full",
    disabled: false,
    readonly: false,
    focused: false,
    userInvalid: false,
  },
  render: ({ mode, disabled, readonly, focused, userInvalid }) => {
    const wrapper = document.createElement("div");
    styleShadcnSurface(wrapper);
    injectFieldInteractionStyles(wrapper);

    const group = document.createElement("div");
    group.style.display = "grid";
    group.style.gap = LABEL_TO_FIELD_GAP;

    const fieldLabel = document.createElement("label");
    fieldLabel.textContent = mode === "csc-only" ? "Security code" : "Card details";
    fieldLabel.style.fontSize = "0.875rem";
    fieldLabel.style.fontWeight = "500";

    const note = document.createElement("p");
    note.textContent =
      "Uses hosted iframe at the configured secure origin. In isolated environments, ready/validation signals may not appear.";
    note.style.margin = "0";
    note.style.fontSize = "0.875rem";
    note.style.color = "var(--muted-foreground, #6b7280)";

    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;

    element.mode = mode;
    element.secureOrigin = CARD_SECURE_ORIGIN;
    element.demoMode = mode;
    element.disabled = disabled;
    element.readonly = readonly;
    applyCardThemeAttributes(element);
    bindThemeAttributes(element, applyCardThemeAttributes);
    styleFieldHost(element);

    if (focused) {
      element.setAttribute("data-focused", "");
    } else {
      element.removeAttribute("data-focused");
    }

    if (userInvalid) {
      element.setAttribute("data-user-invalid", "");
    } else {
      element.removeAttribute("data-user-invalid");
    }

    group.append(fieldLabel, element);
    wrapper.append(group, note);
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

export const Focused: Story = {
  args: {
    focused: true,
  },
};

export const UserInvalid: Story = {
  args: {
    userInvalid: true,
  },
};

export const FormValidityFlow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates native form reportValidity and tokenize flow for the modern payment card field element.",
      },
    },
  },
  render: () => {
    const form = document.createElement("form");
    styleShadcnSurface(form);
    injectFieldInteractionStyles(form);

    const group = document.createElement("div");
    group.style.display = "grid";
    group.style.gap = LABEL_TO_FIELD_GAP;

    const label = document.createElement("label");
    label.textContent = "Card details";
    label.style.fontSize = "0.875rem";
    label.style.fontWeight = "500";

    const field = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    field.mode = "full";
    field.secureOrigin = CARD_SECURE_ORIGIN;
    field.demoMode = "full";
    applyCardThemeAttributes(field);
    bindThemeAttributes(field, applyCardThemeAttributes);
    styleFieldHost(field);
    group.append(label, field);

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Submit card form";
    submit.style.height = "40px";
    submit.style.border = "1px solid var(--input, #d1d5db)";
    submit.style.borderRadius = "calc(var(--radius, 0.625rem) - 2px)";
    submit.style.background = "var(--primary, #111827)";
    submit.style.color = "var(--primary-foreground, #ffffff)";
    submit.style.fontSize = "0.875rem";
    submit.style.fontWeight = "500";
    submit.style.padding = "0 0.875rem";
    submit.style.cursor = "pointer";

    const status = document.createElement("p");
    status.style.margin = "0";
    status.style.fontSize = "0.875rem";
    status.style.color = "var(--muted-foreground, #6b7280)";
    status.textContent = "Submit to validate card fields and attempt tokenization.";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const valid = form.reportValidity();
      if (!valid) {
        status.textContent = "Form is invalid. Complete card details.";
        return;
      }

      status.textContent = "Tokenizing...";
      try {
        const result = await field.tokenize();
        status.textContent = `Tokenized successfully: ${result.token}`;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        status.textContent = `Tokenization failed: ${message}`;
      }
    });

    form.append(group, submit, status);
    return form;
  },
};
