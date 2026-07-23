import { action } from "storybook/actions";
import type { CardEmbedTokenizeErrorCode } from "@foxy.io/sdk/checkout";
import {
  PAYMENT_CARD_FIELD_ELEMENT_TAG,
  type PaymentCardFieldElement,
} from "@/elements/foxy-payment-card-field/element";
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  createThemeAttributeMap,
  deriveInputMetrics,
} from "../../lib/theme-attribute-sync";
import { defaultTheme } from "@foxy.io/design-system/theme";

export const CARD_MODE_OPTIONS = ["card", "card_csc"] as const;

export const CARD_TOKENIZE_ERROR_OPTIONS: CardEmbedTokenizeErrorCode[] = [
  "invalid_state",
  "invalid_config",
  "tokenization_failed",
];

type EmbedCardValidationField = "cc_number" | "cc_exp" | "cc_csc" | "form";
type EmbedCardValidationCode =
  | "value_missing"
  | "pattern_mismatch"
  | "range_underflow"
  | "card_brand_unsupported"
  | "invalid_state";

const CARD_THEME_ATTRIBUTE_MAP = createThemeAttributeMap([
  {
    attribute: "theme-font-body",
    fallback: defaultTheme.font.body,
  },
  {
    attribute: "theme-color-body",
    fallback: defaultTheme.color.body,
  },
  {
    attribute: "theme-color-secondary",
    fallback: defaultTheme.color.secondary,
  },
  {
    attribute: "theme-color-error",
    fallback: defaultTheme.color.error,
  },
  {
    attribute: "theme-background-field",
    fallback: defaultTheme.background.field,
  },
] as const);

type StoryCardInternals = {
  _handlePortMessage?: (event: MessageEvent<string>) => void;
  _port?: MessagePort | null;
  _ready?: boolean;
};

export function createCardSurface(width = "460px"): HTMLDivElement {
  const element = document.createElement("div");
  element.style.width = width;
  element.style.display = "grid";
  element.style.gap = "0.75rem";
  element.style.padding = "1rem";
  element.style.background = defaultTheme.background.surface;
  element.style.color = defaultTheme.color.body;

  injectFieldInteractionStyles(element);
  return element;
}

export function createStorySection(): HTMLDivElement {
  const section = document.createElement("div");
  section.style.display = "grid";
  section.style.gap = "0.375rem";
  return section;
}

export function createStoryTitle(text: string): HTMLParagraphElement {
  const title = document.createElement("p");
  title.textContent = text;
  title.style.margin = "0";
  title.style.fontSize = "0.875rem";
  title.style.fontWeight = "500";
  return title;
}

export function createStoryNote(text: string): HTMLParagraphElement {
  const note = document.createElement("p");
  note.textContent = text;
  note.style.margin = "0";
  note.style.fontSize = "0.8125rem";
  note.style.color = defaultTheme.color.secondary;
  return note;
}

export function createButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.style.height = "40px";
  button.style.width = "fit-content";
  button.style.border = defaultTheme.border.field;
  button.style.borderRadius = defaultTheme.borderRadius.sm;
  button.style.background = defaultTheme.background.buttonPrimary;
  // Amber CTA needs near-black text (onButtonPrimary); onPrimary is white and
  // fails contrast on amber.
  button.style.color = defaultTheme.color.onButtonPrimary;
  button.style.fontSize = "0.875rem";
  button.style.fontWeight = "500";
  button.style.padding = "0 0.875rem";
  button.style.cursor = "pointer";
  return button;
}

export function createLabeledField(options: {
  id: string;
  mode: (typeof CARD_MODE_OPTIONS)[number];
  disabled?: boolean;
  label?: string;
  note?: string;
  role?: string;
  theme?: {
    textColor?: string;
    placeholderColor?: string;
    errorTextColor?: string;
    background?: string;
    fontBody?: string;
    controlSize?: string;
  };
}): { wrapper: HTMLDivElement; field: PaymentCardFieldElement } {
  const wrapper = createStorySection();
  const label = document.createElement("label");
  label.style.fontSize = "0.875rem";
  label.style.fontWeight = "500";
  label.textContent =
    options.label ??
    (options.mode === "card_csc" ? "Security code" : "Card details");
  label.htmlFor = options.id;

  const field = document.createElement(
    PAYMENT_CARD_FIELD_ELEMENT_TAG,
  ) as PaymentCardFieldElement;
  field.id = options.id;
  field.mode = options.mode;
  field.disabled = Boolean(options.disabled);

  if (options.role) {
    field.setAttribute("data-story-role", options.role);
  }

  const applyStoryTheme = (target: PaymentCardFieldElement) => {
    applyCardThemeAttributes(target);

    if (options.theme?.textColor) {
      target.setAttribute("theme-color-body", options.theme.textColor);
    }

    if (options.theme?.placeholderColor) {
      target.setAttribute(
        "theme-color-secondary",
        options.theme.placeholderColor,
      );
    }

    if (options.theme?.errorTextColor) {
      target.setAttribute("theme-color-error", options.theme.errorTextColor);
    }

    if (options.theme?.background) {
      target.setAttribute(
        "theme-background-field",
        options.theme.background,
      );
    }

    if (options.theme?.controlSize) {
      target.setAttribute("theme-size-control", options.theme.controlSize);
    }

    if (options.theme?.fontBody) {
      target.setAttribute("theme-font-body", options.theme.fontBody);
    }
  };

  bindThemeAttributes(field, applyStoryTheme);
  styleFieldHost(field);

  wrapper.append(label, field);

  if (options.note) {
    wrapper.append(createStoryNote(options.note));
  }

  return { wrapper, field };
}

export function attachActionLogging(
  field: PaymentCardFieldElement,
  label: string,
): void {
  const eventNames = [
    "load",
    "resize",
    "tokenizationsuccess",
    "tokenizationerror",
  ] as const;

  for (const eventName of eventNames) {
    const log = action(`${label}:${eventName}`);
    field.addEventListener(eventName, (event) => {
      if (event instanceof CustomEvent) {
        log(event.detail);
        return;
      }

      log({
        type: event.type,
        bubbles: event.bubbles,
        composed: event.composed,
      });
    });
  }
}

export function ensureCardReady(field: PaymentCardFieldElement): void {
  const internalField = field as unknown as StoryCardInternals;

  if (!internalField._port) {
    internalField._port = {
      close: () => undefined,
      start: () => undefined,
      onmessage: null,
      onmessageerror: null,
      postMessage: () => undefined,
    } as unknown as MessagePort;
  }

  if (!internalField._ready) {
    dispatchCardReady(field);
  }
}

export function dispatchCardReady(field: PaymentCardFieldElement): void {
  dispatchCardPortMessage(field, { type: "ready" });
}

export function dispatchCardFocus(field: PaymentCardFieldElement): void {
  dispatchCardPortMessage(field, { type: "focus" });
}

export function dispatchCardBlur(field: PaymentCardFieldElement): void {
  dispatchCardPortMessage(field, { type: "blur" });
}

export function dispatchCardValidation(
  field: PaymentCardFieldElement,
  payload: {
    field: EmbedCardValidationField;
    valid: boolean;
    code: EmbedCardValidationCode | null;
  },
): void {
  dispatchCardPortMessage(field, {
    type: "validation",
    field: payload.field,
    valid: payload.valid,
    code: payload.code,
  });
}

export function dispatchTokenizationSuccess(
  field: PaymentCardFieldElement,
  token: string,
  requestId: string,
): void {
  dispatchCardPortMessage(field, {
    type: "tokenization_response",
    id: requestId,
    token,
    brand: "visa",
    last4Digits: token.slice(-4).padStart(4, "0"),
  });
}

export function dispatchTokenizationError(
  field: PaymentCardFieldElement,
  requestId: string,
): void {
  dispatchCardPortMessage(field, {
    type: "tokenization_response",
    id: requestId,
    token: "",
  });
}

function dispatchCardPortMessage(
  field: PaymentCardFieldElement,
  payload: Record<string, unknown>,
): void {
  const internalField = field as unknown as StoryCardInternals;
  if (!internalField._handlePortMessage) return;

  internalField._handlePortMessage({
    data: JSON.stringify(payload),
  } as MessageEvent<string>);
}

function styleFieldHost(element: HTMLElement): void {
  const metrics = deriveInputMetrics({
    controlSize: defaultTheme.size.control,
    borderWidth: defaultTheme.size.borderWidth,
    fontBody: defaultTheme.font.body,
  });
  element.style.display = "block";
  element.style.width = "100%";
  element.style.minHeight = `${metrics.heightPx}px`;
  element.style.border = defaultTheme.border.field;
  element.style.borderRadius = defaultTheme.borderRadius.sm;
  element.style.background = defaultTheme.background.field;
  element.style.overflow = "hidden";
  element.style.transition = "border-color 150ms ease, box-shadow 150ms ease";
}

function injectFieldInteractionStyles(container: HTMLElement): void {
  if (container.querySelector("style[data-story-field-interactions='card']")) {
    return;
  }

  const style = document.createElement("style");
  style.setAttribute("data-story-field-interactions", "card");
  style.textContent = `
    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(focused),
    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:focus-within {
      border-color: ${defaultTheme.color.primary} !important;
      outline: none !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, ${defaultTheme.color.primary} 35%, transparent) !important;
    }

    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(user-invalid) {
      border-color: ${defaultTheme.color.error} !important;
      outline: 2px solid color-mix(in srgb, ${defaultTheme.color.error} 60%, transparent) !important;
      outline-offset: 2px;
      box-shadow: none !important;
    }

    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(disabled) {
      background: ${defaultTheme.background.disabledField} !important;
      opacity: 0.75;
    }
  `;

  container.append(style);
}

function applyCardThemeAttributes(element: PaymentCardFieldElement): void {
  applyThemeAttributeMap(element, CARD_THEME_ATTRIBUTE_MAP);
}
