import { action } from "storybook/actions";
import type { AchHostedFieldsPublicState } from "@foxy.io/sdk/checkout";
import {
  ACH_FIELD_ELEMENT_TAG,
  type AchFieldElement,
  type AchHostedFieldName,
  type AchTokenizationErrorEventDetail,
} from "@/elements/foxy-ach-field/element";
import {
  applyThemeAttributeMap,
  bindThemeAttributes,
  createThemeAttributeMap,
  deriveInputMetrics,
} from "../../lib/theme-attribute-sync";
import { defaultTheme } from "@foxy.io/design-system/theme";

const FIELD_TO_EMBED: Record<AchHostedFieldName, string> = {
  "routing-number": "routing_number",
  "account-number": "account_number",
  "account-type": "account_type",
  "account-holder-name": "account_holder_name",
};

type HostedState = Pick<
  AchHostedFieldsPublicState,
  "empty" | "complete" | "errorCode" | "focused" | "touched"
>;

type ControllerRegistryEntry = {
  controllerIframe: HTMLIFrameElement | null;
};

type StoryFieldInternals = {
  _onWindowMessage?: (event: MessageEvent) => void;
  _secureOrigin?: string;
  _registryEntry?: ControllerRegistryEntry;
};

export const ACH_FIELD_TYPE_OPTIONS: AchHostedFieldName[] = [
  "routing-number",
  "account-number",
  "account-type",
  "account-holder-name",
];

export const ACH_TOKENIZE_ERROR_OPTIONS: AchTokenizationErrorEventDetail["code"][] =
  [
    "invalid_state",
    "validation_failed",
    "collect_timeout",
    "tokenization_network_error",
    "tokenization_timeout",
    "tokenization_failed",
    "unknown_error",
  ];

export const ACH_ACCOUNT_TYPE_VALUES_OPTIONS = [
  "checking,savings",
  "checking",
  "savings",
  "",
] as const;

const ACH_THEME_ATTRIBUTE_MAP = createThemeAttributeMap([
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
] as const);

export function createAchSurface(width = "460px"): HTMLDivElement {
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
  button.style.color = defaultTheme.color.onPrimary;
  button.style.fontSize = "0.875rem";
  button.style.fontWeight = "500";
  button.style.padding = "0 0.875rem";
  button.style.cursor = "pointer";
  return button;
}

export function formatAchFieldLabel(type: AchHostedFieldName): string {
  return type
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function createLabeledField(options: {
  id: string;
  type: AchHostedFieldName;
  group: string;
  placeholder?: string;
  disabled?: boolean;
  accountTypeValues?: string;
  label?: string;
  note?: string;
  theme?: {
    textColor?: string;
    placeholderColor?: string;
    errorTextColor?: string;
    fontBody?: string;
    controlSize?: string;
  };
  role?: string;
}): { wrapper: HTMLDivElement; field: AchFieldElement } {
  const wrapper = createStorySection();
  const label = document.createElement("label");
  label.style.fontSize = "0.875rem";
  label.style.fontWeight = "500";
  label.textContent = options.label ?? formatAchFieldLabel(options.type);
  label.htmlFor = options.id;

  const field = document.createElement(
    ACH_FIELD_ELEMENT_TAG,
  ) as AchFieldElement;
  field.id = options.id;
  field.type = options.type;
  field.group = options.group;
  field.placeholder = options.placeholder;
  field.disabled = Boolean(options.disabled);

  if (options.role) {
    field.setAttribute("data-story-role", options.role);
  }

  const trimmedValues = options.accountTypeValues?.trim();
  if (trimmedValues) {
    field.setAttribute("account-type-values", trimmedValues);
  } else {
    field.removeAttribute("account-type-values");
  }

  const applyStoryTheme = (target: AchFieldElement) => {
    applyAchThemeAttributes(target);

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
  field: AchFieldElement,
  label: string,
): void {
  const eventNames = [
    "load",
    "change",
    "focus",
    "blur",
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

export function dispatchHostedChange(
  field: AchFieldElement,
  states: Partial<Record<AchHostedFieldName, HostedState>>,
  options?: {
    changedFields?: AchHostedFieldName[];
  },
): void {
  const internalField = field as unknown as StoryFieldInternals;
  const onWindowMessage = internalField._onWindowMessage;
  if (!onWindowMessage) return;

  const source = ensureControllerSource(field);
  const secureOrigin = internalField._secureOrigin ?? window.location.origin;
  const origin = new URL(secureOrigin, window.location.origin).origin;

  const fields = Object.entries(states).reduce(
    (result, [publicName, state]) => {
      if (!state) return result;
      const embedName = FIELD_TO_EMBED[publicName as AchHostedFieldName];
      result[embedName] = state;
      return result;
    },
    {} as Record<string, HostedState>,
  );

  const changedFields = options?.changedFields?.map(
    (fieldName) => FIELD_TO_EMBED[fieldName],
  );

  onWindowMessage({
    data: {
      type: "change",
      fields,
      changedFields: changedFields ?? [],
    },
    origin,
    source,
  } as MessageEvent);
}

export function dispatchTokenizationSuccess(
  field: AchFieldElement,
  token: string,
  requestId: string,
): void {
  dispatchControllerMessage(field, {
    type: "tokenization_response",
    id: requestId,
    token,
    last4: token.slice(-4).padStart(4, "0"),
    routingNumber: "021000021",
    accountType: "checking",
  });
}

export function dispatchTokenizationError(
  field: AchFieldElement,
  code: AchTokenizationErrorEventDetail["code"],
  requestId: string,
): void {
  dispatchControllerMessage(field, {
    type: "tokenization_response",
    id: requestId,
    token: null,
    code,
  });
}

export function dispatchHostedReady(
  field: AchFieldElement,
  registeredFields: AchHostedFieldName[],
): void {
  dispatchControllerMessage(field, {
    type: "ready",
    registeredFields: registeredFields.map(
      (fieldName) => FIELD_TO_EMBED[fieldName],
    ),
  });
}

function dispatchControllerMessage(
  field: AchFieldElement,
  payload: Record<string, unknown>,
): void {
  const internalField = field as unknown as StoryFieldInternals;
  const onWindowMessage = internalField._onWindowMessage;
  if (!onWindowMessage) return;

  const source = ensureControllerSource(field);
  const secureOrigin = internalField._secureOrigin ?? window.location.origin;
  const origin = new URL(secureOrigin, window.location.origin).origin;

  onWindowMessage({
    data: payload,
    origin,
    source,
  } as MessageEvent);
}

function ensureControllerSource(field: AchFieldElement): WindowProxy {
  const internalField = field as unknown as StoryFieldInternals;
  const entry = internalField._registryEntry;

  const source = {
    postMessage: () => undefined,
  } as unknown as WindowProxy;

  if (!entry) {
    return source;
  }

  entry.controllerIframe = {
    contentWindow: source,
  } as unknown as HTMLIFrameElement;

  return source;
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
  if (container.querySelector("style[data-story-field-interactions='ach']")) {
    return;
  }

  const style = document.createElement("style");
  style.setAttribute("data-story-field-interactions", "ach");
  style.textContent = `
    ${ACH_FIELD_ELEMENT_TAG}:state(focused) {
      border-color: ${defaultTheme.color.primary} !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, ${defaultTheme.color.primary} 35%, transparent);
    }

    ${ACH_FIELD_ELEMENT_TAG}:state(user-invalid) {
      border-color: ${defaultTheme.color.error} !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, ${defaultTheme.color.error} 20%, transparent);
    }

    ${ACH_FIELD_ELEMENT_TAG}:state(disabled) {
      background: ${defaultTheme.background.disabledField} !important;
      opacity: 0.75;
    }
  `;

  container.append(style);
}

function applyAchThemeAttributes(element: AchFieldElement): void {
  applyThemeAttributeMap(element, ACH_THEME_ATTRIBUTE_MAP);
}
