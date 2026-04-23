import type { Meta, StoryObj } from "@storybook/web-components-vite";
import type { AchHostedFieldsTokenizeErrorCode } from "@foxy.io/sdk/checkout";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { AchFieldElement, AchHostedFieldName } from "@/elements/ach-field-element";
import {
  ACH_ACCOUNT_TYPE_VALUES_OPTIONS,
  ACH_FIELD_TYPE_OPTIONS,
  ACH_TOKENIZE_ERROR_OPTIONS,
  attachActionLogging,
  createAchSurface,
  createButton,
  createLabeledField,
  createStoryNote,
  dispatchHostedChange,
  dispatchTokenizationError,
  dispatchTokenizationSuccess,
} from "./ach-field-story-shared";

type AchStoryArgs = {
  type: AchHostedFieldName;
  placeholder?: string;
  disabled: boolean;
  group: string;
  accountTypeValues: (typeof ACH_ACCOUNT_TYPE_VALUES_OPTIONS)[number];
  requestId: string;
  token: string;
  errorCode: AchHostedFieldsTokenizeErrorCode;
  themeTextColor: string;
  themePlaceholderColor: string;
  themeErrorTextColor: string;
  themeHeight: string;
  themePadding: string;
  themeFontSize: string;
  themeFontSans: string;
};

const meta = {
  title: "Elements/ACH Field",
  parameters: {
    layout: "centered",
    actions: {
      handles: [
        "load",
        "change",
        "focus",
        "blur",
        "tokenizationsuccess",
        "tokenizationerror",
      ],
    },
    docs: {
      description: {
        component:
          "Developer diagnostics stories for ACH field API, event semantics, validity, grouping, and tokenization.",
      },
    },
  },
  args: {
    type: "routing-number",
    placeholder: "123456789",
    disabled: false,
    group: "storybook-ach-session",
    accountTypeValues: "checking,savings",
    requestId: "ach-story-request-1",
    token: "tok_story_ach_12345",
    errorCode: "validation_failed",
    themeTextColor: "#111827",
    themePlaceholderColor: "#6b7280",
    themeErrorTextColor: "#dc2626",
    themeHeight: "",
    themePadding: "",
    themeFontSize: "14px",
    themeFontSans: "ui-sans-serif, system-ui, sans-serif",
  },
} satisfies Meta<AchStoryArgs>;

export default meta;

type Story = StoryObj<AchStoryArgs>;

function getPrimaryField(canvasElement: HTMLElement): AchFieldElement {
  return canvasElement.querySelector("[data-story-role='primary']") as AchFieldElement;
}

export const ApiPlayground: Story = {
  parameters: {
    controls: {
      include: ["type", "placeholder", "disabled", "group", "accountTypeValues"],
    },
    docs: {
      description: {
        story:
          "Single-field API control surface for type, placeholder, disabled, group, and account-type-values mapping.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ACH_FIELD_TYPE_OPTIONS,
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    group: { control: "text" },
    accountTypeValues: {
      control: "select",
      options: ACH_ACCOUNT_TYPE_VALUES_OPTIONS,
    },
  },
  render: ({ type, placeholder, disabled, group, accountTypeValues }) => {
    const surface = createAchSurface();
    const item = createLabeledField({
      id: "ach-api-playground",
      type,
      group,
      placeholder,
      disabled,
      accountTypeValues,
      role: "primary",
    });

    attachActionLogging(item.field, "api-playground");
    surface.append(
      item.wrapper,
      createStoryNote("Use Controls to verify runtime reflection and attribute-driven behavior."),
    );

    return surface;
  },
};

export const EventSemantics: Story = {
  parameters: {
    controls: {
      include: ["group"],
    },
    docs: {
      description: {
        story:
          "Deterministic focus/change/blur transitions with event semantics verification and Actions output.",
      },
    },
  },
  render: ({ group }) => {
    const surface = createAchSurface();
    const item = createLabeledField({
      id: "ach-event-semantics",
      type: "routing-number",
      group,
      placeholder: "123456789",
      role: "primary",
    });

    attachActionLogging(item.field, "event-semantics");
    surface.append(
      item.wrapper,
      createStoryNote("Play function emits ach:change states to verify transition ordering and event bubbling rules."),
    );

    return surface;
  },
  play: async ({ canvasElement }) => {
    const field = getPrimaryField(canvasElement);

    let focusEvent: FocusEvent | undefined;
    let blurEvent: FocusEvent | undefined;

    field.addEventListener("focus", (event) => {
      focusEvent = event as FocusEvent;
    }, { once: true });

    field.addEventListener("blur", (event) => {
      blurEvent = event as FocusEvent;
    }, { once: true });

    dispatchHostedChange(field, {
      "routing-number": {
        empty: true,
        complete: false,
        errorCode: null,
        focused: true,
        touched: true,
      },
    });

    dispatchHostedChange(field, {
      "routing-number": {
        empty: false,
        complete: true,
        errorCode: null,
        focused: false,
        touched: true,
      },
    });

    await waitFor(() => {
      expect(focusEvent).toBeDefined();
      expect(blurEvent).toBeDefined();
      expect(focusEvent?.bubbles).toBe(false);
      expect(blurEvent?.bubbles).toBe(false);
    });
  },
};

export const ValidityStates: Story = {
  parameters: {
    controls: {
      include: ["group"],
    },
    docs: {
      description: {
        story:
          "Play-driven validity transitions that assert incomplete, badInput, and valid outcomes via checkValidity/reportValidity.",
      },
    },
  },
  render: ({ group }) => {
    const surface = createAchSurface();
    const item = createLabeledField({
      id: "ach-validity-states",
      type: "routing-number",
      group,
      placeholder: "123456789",
      role: "primary",
    });

    attachActionLogging(item.field, "validity-states");
    surface.append(
      item.wrapper,
      createStoryNote("The play function drives synthetic hosted state updates and validates native validity transitions."),
    );

    return surface;
  },
  play: async ({ canvasElement }) => {
    const field = getPrimaryField(canvasElement);

    dispatchHostedChange(field, {
      "routing-number": {
        empty: true,
        complete: false,
        errorCode: null,
        touched: true,
      },
    });
    expect(field.checkValidity()).toBe(false);

    dispatchHostedChange(field, {
      "routing-number": {
        empty: false,
        complete: true,
        errorCode: "invalid_routing_number",
        touched: true,
      },
    });
    expect(field.reportValidity()).toBe(false);

    dispatchHostedChange(field, {
      "routing-number": {
        empty: false,
        complete: true,
        errorCode: null,
        touched: true,
      },
    });
    expect(field.checkValidity()).toBe(true);
  },
};

export const SessionGroupTopology: Story = {
  parameters: {
    controls: {
      include: [],
    },
    docs: {
      description: {
        story:
          "Two fields in one group plus an isolated field to verify session boundaries and per-instance validity independence.",
      },
    },
  },
  render: () => {
    const surface = createAchSurface("560px");
    const sameGroup = "storybook-ach-shared-group";

    const sharedRouting = createLabeledField({
      id: "ach-shared-routing",
      type: "routing-number",
      group: sameGroup,
      placeholder: "123456789",
      role: "primary",
      note: "Shared group A",
    });

    const sharedAccount = createLabeledField({
      id: "ach-shared-account",
      type: "account-number",
      group: sameGroup,
      placeholder: "000123456789",
      role: "shared-second",
      note: "Shared group A",
    });

    const isolatedRouting = createLabeledField({
      id: "ach-isolated-routing",
      type: "routing-number",
      group: "storybook-ach-isolated-group",
      placeholder: "123456789",
      role: "isolated",
      note: "Isolated group B",
    });

    attachActionLogging(sharedRouting.field, "session-shared-routing");
    attachActionLogging(sharedAccount.field, "session-shared-account");
    attachActionLogging(isolatedRouting.field, "session-isolated-routing");

    surface.append(
      sharedRouting.wrapper,
      sharedAccount.wrapper,
      isolatedRouting.wrapper,
    );

    return surface;
  },
  play: async ({ canvasElement }) => {
    const sharedRouting = canvasElement.querySelector(
      "[data-story-role='primary']",
    ) as AchFieldElement;
    const sharedAccount = canvasElement.querySelector(
      "[data-story-role='shared-second']",
    ) as AchFieldElement;
    const isolated = canvasElement.querySelector(
      "[data-story-role='isolated']",
    ) as AchFieldElement;

    dispatchHostedChange(sharedRouting, {
      "routing-number": {
        empty: false,
        complete: true,
        errorCode: null,
      },
      "account-number": {
        empty: true,
        complete: false,
        errorCode: null,
      },
    });

    await waitFor(() => {
      expect(sharedRouting.checkValidity()).toBe(true);
      expect(sharedAccount.checkValidity()).toBe(false);
      expect(isolated.checkValidity()).toBe(false);
    });
  },
};

export const TokenizeSuccess: Story = {
  parameters: {
    controls: {
      include: ["group", "requestId", "token"],
    },
    docs: {
      description: {
        story:
          "tokenize(requestId) success path with deterministic response dispatch and payload verification.",
      },
    },
  },
  argTypes: {
    requestId: { control: "text" },
    token: { control: "text" },
  },
  render: ({ group }) => {
    const surface = createAchSurface();
    const item = createLabeledField({
      id: "ach-tokenize-success",
      type: "routing-number",
      group,
      role: "primary",
    });

    attachActionLogging(item.field, "tokenize-success");
    surface.append(
      item.wrapper,
      createStoryNote("Play function calls tokenize(requestId) and resolves via ach:tokenize:success."),
    );

    return surface;
  },
  play: async ({ canvasElement, args }) => {
    const field = getPrimaryField(canvasElement);
    let eventDetail: { token: string; requestId?: string } | undefined;

    field.addEventListener(
      "tokenizationsuccess",
      (event) => {
        eventDetail = (event as CustomEvent<{ token: string; requestId?: string }>).detail;
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
      include: ["group", "requestId", "errorCode"],
    },
    docs: {
      description: {
        story:
          "Control-selected tokenization failure path with deterministic error event and promise rejection checks.",
      },
    },
  },
  argTypes: {
    requestId: { control: "text" },
    errorCode: {
      control: "select",
      options: ACH_TOKENIZE_ERROR_OPTIONS,
    },
  },
  render: ({ group }) => {
    const surface = createAchSurface();
    const item = createLabeledField({
      id: "ach-tokenize-error",
      type: "routing-number",
      group,
      role: "primary",
    });

    attachActionLogging(item.field, "tokenize-error-matrix");
    surface.append(
      item.wrapper,
      createStoryNote("Switch errorCode control to replay each supported tokenize failure code."),
    );

    return surface;
  },
  play: async ({ canvasElement, args }) => {
    const field = getPrimaryField(canvasElement);
    let eventDetail:
      | { code: AchHostedFieldsTokenizeErrorCode; requestId?: string }
      | undefined;

    field.addEventListener(
      "tokenizationerror",
      (event) => {
        eventDetail = (
          event as CustomEvent<{
            code: AchHostedFieldsTokenizeErrorCode;
            requestId?: string;
          }>
        ).detail;
      },
      { once: true },
    );

    const resultPromise = field.tokenize(args.requestId);

    dispatchTokenizationError(field, args.errorCode, args.requestId);

    await expect(resultPromise).rejects.toThrow(args.errorCode);

    await waitFor(() => {
      expect(eventDetail).toEqual({
        code: args.errorCode,
        requestId: args.requestId,
      });
    });
  },
};

export const AccountTypeRestrictions: Story = {
  parameters: {
    controls: {
      include: ["disabled", "group", "accountTypeValues"],
    },
    docs: {
      description: {
        story:
          "Account type field with account-type-values restrictions controlled directly in Storybook Controls.",
      },
    },
  },
  argTypes: {
    accountTypeValues: {
      control: "select",
      options: ACH_ACCOUNT_TYPE_VALUES_OPTIONS,
    },
    disabled: { control: "boolean" },
  },
  args: {
    type: "account-type",
    placeholder: undefined,
  },
  render: ({ group, accountTypeValues, disabled }) => {
    const surface = createAchSurface();
    const item = createLabeledField({
      id: "ach-account-type-restrictions",
      type: "account-type",
      group,
      disabled,
      accountTypeValues,
      role: "primary",
    });

    attachActionLogging(item.field, "account-type-restrictions");
    surface.append(
      item.wrapper,
      createStoryNote("Use accountTypeValues to validate checking-only, savings-only, mixed, and default field behavior."),
    );

    return surface;
  },
};

export const ThemeAttributeControls: Story = {
  parameters: {
    controls: {
      include: [
        "group",
        "themeTextColor",
        "themePlaceholderColor",
        "themeErrorTextColor",
        "themeHeight",
        "themePadding",
        "themeFontSize",
        "themeFontSans",
      ],
    },
    docs: {
      description: {
        story:
          "Theme attribute propagation harness for all supported ACH theme attributes.",
      },
    },
  },
  argTypes: {
    themeTextColor: { control: "color" },
    themePlaceholderColor: { control: "color" },
    themeErrorTextColor: { control: "color" },
    themeHeight: { control: "text" },
    themePadding: { control: "text" },
    themeFontSize: { control: "text" },
    themeFontSans: { control: "text" },
  },
  render: ({
    group,
    themeTextColor,
    themePlaceholderColor,
    themeErrorTextColor,
    themeHeight,
    themePadding,
    themeFontSize,
    themeFontSans,
  }) => {
    const surface = createAchSurface();
    const item = createLabeledField({
      id: "ach-theme-controls",
      type: "routing-number",
      group,
      placeholder: "123456789",
      role: "primary",
      theme: {
        textColor: themeTextColor,
        placeholderColor: themePlaceholderColor,
        errorTextColor: themeErrorTextColor,
        height: themeHeight,
        padding: themePadding,
        fontSize: themeFontSize,
        fontSans: themeFontSans,
      },
    });

    attachActionLogging(item.field, "theme-attribute-controls");
    surface.append(
      item.wrapper,
      createStoryNote("Theme controls set host attributes that are forwarded to the embed style payload."),
    );

    return surface;
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
          "Minimal form-associated integration flow using reportValidity and tokenize with play-driven interaction.",
      },
    },
  },
  argTypes: {
    requestId: { control: "text" },
    token: { control: "text" },
  },
  render: () => {
    const surface = createAchSurface("560px");
    const form = document.createElement("form");
    form.style.display = "grid";
    form.style.gap = "0.75rem";

    const fieldGroup = "storybook-ach-form-group";
    const routing = createLabeledField({
      id: "ach-form-routing",
      type: "routing-number",
      group: fieldGroup,
      placeholder: "123456789",
      role: "primary",
    });

    const account = createLabeledField({
      id: "ach-form-account",
      type: "account-number",
      group: fieldGroup,
      placeholder: "000123456789",
      role: "form-account",
    });

    const holder = createLabeledField({
      id: "ach-form-holder",
      type: "account-holder-name",
      group: fieldGroup,
      placeholder: "Jane Doe",
      role: "form-holder",
    });

    attachActionLogging(routing.field, "form-routing");
    attachActionLogging(account.field, "form-account");
    attachActionLogging(holder.field, "form-holder");

    const submitButton = createButton("Submit ACH form");
    submitButton.type = "submit";

    const status = createStoryNote("Click submit to run reportValidity and tokenization.");
    status.setAttribute("data-story-role", "form-status");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) {
        status.textContent = "Form is invalid.";
        return;
      }

      status.textContent = "Form is valid.";
    });

    form.append(routing.wrapper, account.wrapper, holder.wrapper, submitButton, status);
    surface.append(form);

    return surface;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const submit = canvas.getByRole("button", { name: "Submit ACH form" });
    const primaryField = getPrimaryField(canvasElement);

    dispatchHostedChange(primaryField, {
      "routing-number": {
        empty: false,
        complete: true,
        errorCode: null,
      },
      "account-number": {
        empty: false,
        complete: true,
        errorCode: null,
      },
      "account-holder-name": {
        empty: false,
        complete: true,
        errorCode: null,
      },
    });

    await userEvent.click(submit);

    const tokenizePromise = primaryField.tokenize(args.requestId);
    dispatchTokenizationSuccess(primaryField, args.token, args.requestId);

    await expect(tokenizePromise).resolves.toEqual({
      token: args.token,
      requestId: args.requestId,
    });

    const status = canvasElement.querySelector("[data-story-role='form-status']");
    await waitFor(() => {
      expect(status?.textContent).toContain("Form is valid");
    });
  },
};
