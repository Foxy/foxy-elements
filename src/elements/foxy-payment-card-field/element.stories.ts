import type { Meta, StoryObj } from "@storybook/web-components-vite";
import type { CardEmbedTokenizeErrorCode } from "@foxy.io/sdk/checkout";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { PaymentCardFieldElement } from "@/elements/foxy-payment-card-field/element";
import {
  CARD_MODE_OPTIONS,
  CARD_TOKENIZE_ERROR_OPTIONS,
  attachActionLogging,
  createButton,
  createCardSurface,
  createLabeledField,
  createStoryNote,
  dispatchCardBlur,
  dispatchCardFocus,
  dispatchCardValidation,
  dispatchTokenizationError,
  dispatchTokenizationSuccess,
  ensureCardReady,
} from "./utils";

type CardStoryArgs = {
  mode: (typeof CARD_MODE_OPTIONS)[number];
  lang: string;
  disabled: boolean;
  requestId: string;
  token: string;
  errorCode: CardEmbedTokenizeErrorCode;
  themeTextColor: string;
  themePlaceholderColor: string;
  themeErrorTextColor: string;
  themeBackground: string;
  themeFontSize: string;
  themeFontSans: string;
};

const meta = {
  title: "Elements/foxy-payment-card-field",
  parameters: {
    layout: "centered",
    actions: {
      handles: ["load", "resize", "tokenizationsuccess", "tokenizationerror"],
    },
    docs: {
      description: {
        component:
          "Developer diagnostics stories for card embed API semantics, validity transitions, theme propagation, tokenization flow, and language propagation via the lang attribute.",
      },
    },
  },
  args: {
    mode: "card",
    lang: "en-US",
    disabled: false,
    requestId: "card-story-request-1",
    token: "tok_story_card_12345",
    errorCode: "tokenization_failed",
    themeTextColor: "#111827",
    themePlaceholderColor: "#6b7280",
    themeErrorTextColor: "#dc2626",
    themeBackground: "#ffffff",
    themeFontSize: "14px",
    themeFontSans: "ui-sans-serif, system-ui, sans-serif",
  },
} satisfies Meta<CardStoryArgs>;

export default meta;

type Story = StoryObj<CardStoryArgs>;

function getPrimaryField(canvasElement: HTMLElement): PaymentCardFieldElement {
  return canvasElement.querySelector(
    "[data-story-role='primary']",
  ) as PaymentCardFieldElement;
}

export const ApiPlayground: Story = {
  parameters: {
    controls: {
      include: ["mode", "lang", "disabled"],
    },
    docs: {
      description: {
        story:
          "Single-field API control surface for mode, lang, and disabled reflection on the hosted card element. The lang attribute is forwarded via iframe URL params.",
      },
    },
  },
  argTypes: {
    mode: {
      control: "select",
      options: CARD_MODE_OPTIONS,
    },
    lang: {
      control: "text",
      description:
        "Optional BCP 47 locale tag forwarded to the hosted card iframe (for example, en-US).",
    },
    disabled: { control: "boolean" },
  },
  render: ({ mode, lang, disabled }) => {
    const surface = createCardSurface();
    const item = createLabeledField({
      id: "card-api-playground",
      mode,
      disabled,
      role: "primary",
    });
    item.field.lang = lang;

    attachActionLogging(item.field, "api-playground");
    surface.append(
      item.wrapper,
      createStoryNote(
        "Use Controls to verify mode and disabled reflection without depending on live iframe responses.",
      ),
    );

    return surface;
  },
  play: async ({ canvasElement, args }) => {
    const field = getPrimaryField(canvasElement);

    await waitFor(() => {
      expect(field.mode).toBe(args.mode);
      expect(field.disabled).toBe(args.disabled);
    });
  },
};

export const ModeTransitions: Story = {
  parameters: {
    controls: {
      include: [],
    },
    docs: {
      description: {
        story:
          "Play-driven mode transitions that verify property-to-attribute sync when switching between card and card_csc modes.",
      },
    },
  },
  render: () => {
    const surface = createCardSurface();
    const item = createLabeledField({
      id: "card-mode-transitions",
      mode: "card",
      role: "primary",
    });

    attachActionLogging(item.field, "mode-transitions");
    surface.append(
      item.wrapper,
      createStoryNote(
        "Play function toggles mode at runtime to verify reflected attributes and control-plane behavior.",
      ),
    );

    return surface;
  },
  play: async ({ canvasElement }) => {
    const field = getPrimaryField(canvasElement);

    field.mode = "card_csc";
    await waitFor(() => {
      expect(field.mode).toBe("card_csc");
      expect(field.getAttribute("mode")).toBe("card_csc");
    });

    field.mode = "card";
    await waitFor(() => {
      expect(field.mode).toBe("card");
      expect(field.getAttribute("mode")).toBe("card");
    });
  },
};

export const ValidationStates: Story = {
  parameters: {
    controls: {
      include: [],
    },
    docs: {
      description: {
        story:
          "Play-driven validity transitions for invalid and valid states via synthetic hosted validation payloads.",
      },
    },
  },
  render: () => {
    const surface = createCardSurface();
    const item = createLabeledField({
      id: "card-validity-states",
      mode: "card",
      role: "primary",
    });

    attachActionLogging(item.field, "validity-states");
    surface.append(
      item.wrapper,
      createStoryNote(
        "Play function dispatches focus, validation, and blur payloads to verify checkValidity and touched-state transitions.",
      ),
    );

    return surface;
  },
  play: async ({ canvasElement }) => {
    const field = getPrimaryField(canvasElement);

    dispatchCardFocus(field);
    dispatchCardValidation(field, {
      field: "cc_number",
      valid: false,
      code: "pattern_mismatch",
    });
    expect(field.checkValidity()).toBe(false);

    dispatchCardValidation(field, {
      field: "cc_number",
      valid: true,
      code: null,
    });
    dispatchCardValidation(field, {
      field: "cc_exp",
      valid: true,
      code: null,
    });
    dispatchCardValidation(field, {
      field: "cc_csc",
      valid: true,
      code: null,
    });

    dispatchCardBlur(field);
    expect(field.reportValidity()).toBe(true);
  },
};

export const ThemeAttributeControls: Story = {
  parameters: {
    controls: {
      include: [
        "themeTextColor",
        "themePlaceholderColor",
        "themeErrorTextColor",
        "themeBackground",
        "themeFontSize",
        "themeFontSans",
      ],
    },
    docs: {
      description: {
        story:
          "Theme attribute propagation harness for card text, placeholder, error, background, and typography attributes.",
      },
    },
  },
  argTypes: {
    themeTextColor: { control: "color" },
    themePlaceholderColor: { control: "color" },
    themeErrorTextColor: { control: "color" },
    themeBackground: { control: "color" },
    themeFontSize: { control: "text" },
    themeFontSans: { control: "text" },
  },
  render: ({
    mode,
    themeTextColor,
    themePlaceholderColor,
    themeErrorTextColor,
    themeBackground,
    themeFontSize,
    themeFontSans,
  }) => {
    const surface = createCardSurface();
    const item = createLabeledField({
      id: "card-theme-controls",
      mode,
      role: "primary",
      theme: {
        textColor: themeTextColor,
        placeholderColor: themePlaceholderColor,
        errorTextColor: themeErrorTextColor,
        background: themeBackground,
        fontSize: themeFontSize,
        fontSans: themeFontSans,
      },
    });

    attachActionLogging(item.field, "theme-attribute-controls");
    surface.append(
      item.wrapper,
      createStoryNote(
        "Theme controls update host attributes that are forwarded to iframe config style payload.",
      ),
    );

    return surface;
  },
};

export const TokenizeSuccess: Story = {
  parameters: {
    controls: {
      include: ["requestId", "token"],
    },
    docs: {
      description: {
        story:
          "Deterministic tokenize(requestId) success flow with promise resolution and event payload verification.",
      },
    },
  },
  argTypes: {
    requestId: { control: "text" },
    token: { control: "text" },
  },
  render: () => {
    const surface = createCardSurface();
    const item = createLabeledField({
      id: "card-tokenize-success",
      mode: "card",
      role: "primary",
    });

    attachActionLogging(item.field, "tokenize-success");
    surface.append(
      item.wrapper,
      createStoryNote(
        "Play function runs tokenize(requestId) and resolves via a synthetic tokenization_response payload.",
      ),
    );

    return surface;
  },
  play: async ({ canvasElement, args }) => {
    const field = getPrimaryField(canvasElement);
    ensureCardReady(field);

    let eventDetail: { token: string; requestId?: string } | undefined;

    field.addEventListener(
      "tokenizationsuccess",
      (event) => {
        eventDetail = (
          event as CustomEvent<{ token: string; requestId?: string }>
        ).detail;
      },
      { once: true },
    );

    const resultPromise = field.tokenize(args.requestId);
    dispatchTokenizationSuccess(field, args.token, args.requestId);

    await expect(resultPromise).resolves.toEqual({
      token: args.token,
      requestId: args.requestId,
    });

    await waitFor(() => {
      expect(eventDetail).toEqual({
        token: args.token,
        requestId: args.requestId,
      });
    });
  },
};

export const TokenizeErrorMatrix: Story = {
  parameters: {
    controls: {
      include: ["requestId", "errorCode"],
    },
    docs: {
      description: {
        story:
          "Control-selected tokenization failure replay with deterministic promise rejection and tokenizationerror payload checks.",
      },
    },
  },
  argTypes: {
    requestId: { control: "text" },
    errorCode: {
      control: "select",
      options: CARD_TOKENIZE_ERROR_OPTIONS,
    },
  },
  render: () => {
    const surface = createCardSurface();
    const item = createLabeledField({
      id: "card-tokenize-error",
      mode: "card",
      role: "primary",
    });

    attachActionLogging(item.field, "tokenize-error-matrix");
    surface.append(
      item.wrapper,
      createStoryNote(
        "Switch errorCode control to verify handling across all known tokenize error codes.",
      ),
    );

    return surface;
  },
  play: async ({ canvasElement, args }) => {
    const field = getPrimaryField(canvasElement);
    ensureCardReady(field);

    let eventDetail:
      | {
          code: CardEmbedTokenizeErrorCode;
          message?: string;
          requestId?: string;
        }
      | undefined;

    field.addEventListener(
      "tokenizationerror",
      (event) => {
        eventDetail = (
          event as CustomEvent<{
            code: CardEmbedTokenizeErrorCode;
            message?: string;
            requestId?: string;
          }>
        ).detail;
      },
      { once: true },
    );

    const resultPromise = field.tokenize(args.requestId);
    dispatchTokenizationError(field, args.requestId);

    await expect(resultPromise).rejects.toThrow(
      "Unable to tokenize card details.",
    );

    await waitFor(() => {
      expect(eventDetail?.code).toBe("tokenization_failed");
      expect(eventDetail?.requestId).toBe(args.requestId);
    });
  },
};

export const FormIntegrationInteraction: Story = {
  parameters: {
    controls: {
      include: ["requestId", "token"],
    },
    docs: {
      description: {
        story:
          "Form-associated reportValidity + tokenize integration flow with deterministic play interaction.",
      },
    },
  },
  argTypes: {
    requestId: { control: "text" },
    token: { control: "text" },
  },
  render: () => {
    const surface = createCardSurface("560px");
    const form = document.createElement("form");
    form.style.display = "grid";
    form.style.gap = "0.75rem";

    const item = createLabeledField({
      id: "card-form-integration",
      mode: "card",
      role: "primary",
    });

    attachActionLogging(item.field, "form-integration");

    const submit = createButton("Submit card form");
    submit.type = "submit";

    const status = createStoryNote("Click submit to run reportValidity.");
    status.setAttribute("data-story-role", "form-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity()) {
        status.textContent = "Form is invalid.";
        return;
      }

      status.textContent = "Form is valid.";
    });

    form.append(item.wrapper, submit, status);
    surface.append(form);
    return surface;
  },
  play: async ({ canvasElement, args }) => {
    const field = getPrimaryField(canvasElement);
    const canvas = within(canvasElement);

    dispatchCardValidation(field, {
      field: "cc_number",
      valid: true,
      code: null,
    });
    dispatchCardValidation(field, {
      field: "cc_exp",
      valid: true,
      code: null,
    });
    dispatchCardValidation(field, {
      field: "cc_csc",
      valid: true,
      code: null,
    });

    const submit = canvas.getByRole("button", { name: "Submit card form" });
    await userEvent.click(submit);

    const status = canvasElement.querySelector(
      "[data-story-role='form-status']",
    );
    await waitFor(() => {
      expect(status?.textContent).toContain("Form is valid");
    });

    ensureCardReady(field);
    const tokenizePromise = field.tokenize(args.requestId);
    dispatchTokenizationSuccess(field, args.token, args.requestId);

    await expect(tokenizePromise).resolves.toEqual({
      token: args.token,
      requestId: args.requestId,
    });
  },
};

export const Disabled: Story = {
  parameters: {
    controls: {
      include: ["mode"],
    },
    docs: {
      description: {
        story:
          "Disabled-state visual and interaction diagnostics with the hosted field in readonly mode.",
      },
    },
  },
  args: {
    disabled: true,
  },
  render: ({ mode }) => {
    const surface = createCardSurface();
    const item = createLabeledField({
      id: "card-disabled-state",
      mode,
      disabled: true,
      role: "primary",
      note: "Disabled state uses ElementInternals custom state and host styles.",
    });

    attachActionLogging(item.field, "disabled");
    surface.append(item.wrapper);

    return surface;
  },
};
