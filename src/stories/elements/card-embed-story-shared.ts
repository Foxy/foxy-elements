import { action } from "storybook/actions";
import type { CardEmbedTokenizeErrorCode, CardValidationField } from "@foxy.io/sdk/checkout";
import {
  PAYMENT_CARD_FIELD_ELEMENT_TAG,
  type PaymentCardFieldElement,
} from "@/elements/payment-card-field-element";
import { getRequiredEnvVar } from "@/lib/required-env";
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  getShadcnInputMetrics,
  type ThemeAttributeMapEntry,
} from "./theme-attribute-sync";

export const CARD_SECURE_ORIGIN = getRequiredEnvVar("VITE_EMBED_ORIGIN");

export const CARD_MODE_OPTIONS = ["full", "csc-only"] as const;

export const CARD_TOKENIZE_ERROR_OPTIONS: CardEmbedTokenizeErrorCode[] = [
  "invalid_state",
  "invalid_config",
  "tokenization_failed",
];

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
  element.style.background = "var(--card, #ffffff)";
  element.style.color = "var(--card-foreground, #111827)";

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
  note.style.color = "var(--muted-foreground, #6b7280)";
  return note;
}

export function createButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.style.height = "40px";
  button.style.width = "fit-content";
  button.style.border = "1px solid var(--input, #d1d5db)";
  button.style.borderRadius = "calc(var(--radius, 0.625rem) - 2px)";
  button.style.background = "var(--primary, #111827)";
  button.style.color = "var(--primary-foreground, #ffffff)";
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
    fontSize?: string;
    fontSans?: string;
  };
}): { wrapper: HTMLDivElement; field: PaymentCardFieldElement } {
  const wrapper = createStorySection();
  const label = document.createElement("label");
  label.style.fontSize = "0.875rem";
  label.style.fontWeight = "500";
  label.textContent = options.label ?? (options.mode === "csc-only" ? "Security code" : "Card details");
  label.htmlFor = options.id;

  const field = document.createElement(PAYMENT_CARD_FIELD_ELEMENT_TAG) as PaymentCardFieldElement;
  field.id = options.id;
  field.mode = options.mode;
  field.disabled = Boolean(options.disabled);
  field.secureOrigin = CARD_SECURE_ORIGIN;

  if (options.role) {
    field.setAttribute("data-story-role", options.role);
  }

  const applyStoryTheme = (target: PaymentCardFieldElement) => {
    applyCardThemeAttributes(target);

    if (options.theme?.textColor) {
      target.setAttribute("theme-input-text-color", options.theme.textColor);
    }

    if (options.theme?.placeholderColor) {
      target.setAttribute("theme-input-placeholder-color", options.theme.placeholderColor);
    }

    if (options.theme?.errorTextColor) {
      target.setAttribute("theme-input-error-text-color", options.theme.errorTextColor);
    }

    if (options.theme?.background) {
      target.setAttribute("theme-background", options.theme.background);
    }

    if (options.theme?.fontSize) {
      target.setAttribute("theme-input-font-size", options.theme.fontSize);
    }

    if (options.theme?.fontSans) {
      target.setAttribute("theme-font-sans", options.theme.fontSans);
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

export function attachActionLogging(field: PaymentCardFieldElement, label: string): void {
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

      log({ type: event.type, bubbles: event.bubbles, composed: event.composed });
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
    field: CardValidationField;
    valid: boolean;
    message: string | null;
  },
): void {
  dispatchCardPortMessage(field, {
    type: "validation",
    field: payload.field,
    valid: payload.valid,
    message: payload.message,
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
  });
}

export function dispatchTokenizationError(field: PaymentCardFieldElement, requestId: string): void {
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

function injectFieldInteractionStyles(container: HTMLElement): void {
  if (container.querySelector("style[data-story-field-interactions='card']")) {
    return;
  }

  const style = document.createElement("style");
  style.setAttribute("data-story-field-interactions", "card");
  style.textContent = `
    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(focused),
    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:focus-within {
      border-color: var(--ring, #94a3b8) !important;
      outline: none !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring, #94a3b8) 35%, transparent) !important;
    }

    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(user-invalid) {
      border-color: var(--destructive, #dc2626) !important;
      outline: 2px solid rgba(220, 38, 38, 0.6) !important;
      outline-offset: 2px;
      box-shadow: none !important;
    }

    ${PAYMENT_CARD_FIELD_ELEMENT_TAG}:state(disabled) {
      background: var(--muted, #f3f4f6) !important;
      opacity: 0.75;
    }
  `;

  container.append(style);
}

function applyCardThemeAttributes(element: PaymentCardFieldElement): void {
  const metrics = getShadcnInputMetrics();
  const hostBorderTotalPx = 2;
  const hostedInputHeightPx = Math.max(metrics.outerHeightPx - hostBorderTotalPx, 0);

  element.setAttribute("theme-input-height", `${hostedInputHeightPx}px`);
  element.setAttribute("theme-input-padding-y", metrics.paddingY);
  element.setAttribute("theme-input-padding-x", metrics.paddingX);
  element.setAttribute("theme-input-font-size", metrics.fontSize);
  applyThemeAttributeMap(element, CARD_THEME_ATTRIBUTE_MAP);
}
