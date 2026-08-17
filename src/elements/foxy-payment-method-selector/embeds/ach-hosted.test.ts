import { createElement } from "react";
import { describe, expect, it } from "vitest";

import type {
  AchFieldElement,
  AchHostedFieldName,
} from "../../foxy-ach-field/element";
import type { HostedFieldStyleAttributes } from "../stripe/style-hooks";
import type { PaymentController, PaymentMethodSelectorOption } from "../types";
import AchOptionEmbed from "./ach-hosted";
import {
  controllerSink,
  mountEmbed,
  optionWith,
  rejection,
  settled,
} from "./test-utils";

const OWNER_CONFIRMATION_LABEL = "I am the account owner.";
const OWNER_CONFIRMATION_ERROR = "Confirm that you own this account.";
const TOKENIZE_ERROR = "We could not verify those bank details.";

const DEFAULT_LABELS: Partial<Record<AchHostedFieldName, string>> = {
  "routing-number": "Routing number",
  "account-number": "Account number",
  "account-type": "Account type",
  "account-holder-name": "Account holder name",
};

const STYLE_ATTRIBUTES: HostedFieldStyleAttributes = {
  inputBackground: "#ffffff",
  inputPlaceholderColor: "#8a8a8a",
  inputFont: "400 1rem/1.5 Inter, sans-serif",
  inputTextColor: "#111111",
  inputTextColorError: "#cc0000",
};

type EmbedPropOverrides = {
  hostedFields?: PaymentMethodSelectorOption["hostedFields"] | false;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
};

function embed(overrides: EmbedPropOverrides = {}) {
  return createElement(AchOptionEmbed, {
    option: optionWith({
      id: "ach",
      hostedFields:
        overrides.hostedFields === false
          ? undefined
          : (overrides.hostedFields ?? { group: "test-group" }),
    }),
    disabled: overrides.disabled,
    styleAttributes: STYLE_ATTRIBUTES,
    onControllerReady: overrides.onControllerReady,
    defaultLabelsByField: DEFAULT_LABELS,
    ownerConfirmationLabel: OWNER_CONFIRMATION_LABEL,
    ownerConfirmationErrorMessage: OWNER_CONFIRMATION_ERROR,
    tokenizeErrorMessage: TOKENIZE_ERROR,
  });
}

function fieldsIn(container: HTMLElement): AchFieldElement[] {
  return [...container.querySelectorAll<AchFieldElement>("foxy-ach-field")];
}

/**
 * Selects by the element's `type` property rather than its attribute. The
 * attribute is only written when the value differs from the element's default
 * (`routing-number`), so the routing-number field carries no `type` attribute
 * at all — see the reflection test below.
 */
function fieldIn(
  container: HTMLElement,
  type: AchHostedFieldName,
): AchFieldElement {
  const field = fieldsIn(container).find(
    (candidate) => candidate.type === type,
  );

  if (!field) throw new Error(`The ${type} field did not render.`);
  return field;
}

function ownerConfirmationIn(container: HTMLElement): HTMLElement {
  const checkbox = container.querySelector<HTMLElement>(
    '[data-ach-owner-confirmation="true"]',
  );

  if (!checkbox) throw new Error("The owner confirmation did not render.");
  return checkbox;
}

/**
 * Replaces a hosted field's `tokenize` with a stub. The real one talks to the
 * embed iframe, which never answers here; what these tests check is the gate
 * the embed puts in front of it.
 */
function stubTokenize(field: AchFieldElement, result: unknown): void {
  Object.defineProperty(field, "tokenize", {
    configurable: true,
    value: async () => result,
  });
}

describe("AchOptionEmbed", () => {
  it("renders nothing when the option carries no hosted field config", async () => {
    const mounted = await mountEmbed(embed({ hostedFields: false }));

    expect(fieldsIn(mounted.container)).toHaveLength(0);

    await mounted.unmount();
  });

  it("renders the four hosted fields in one group", async () => {
    const mounted = await mountEmbed(
      embed({ hostedFields: { group: "group-1" } }),
    );

    const fields = fieldsIn(mounted.container);

    expect(fields.map((field) => field.type)).toEqual([
      "routing-number",
      "account-number",
      "account-type",
      "account-holder-name",
    ]);
    // One group is what makes the four iframes tokenize as a single set.
    expect(new Set(fields.map((field) => field.getAttribute("group")))).toEqual(
      new Set(["group-1"]),
    );

    await mounted.unmount();
  });

  // Without a configured group the fields would each get their own id and
  // tokenize separately, so the embed generates one and shares it.
  it("generates a shared group when the config carries none", async () => {
    const mounted = await mountEmbed(embed({ hostedFields: {} }));

    const groups = fieldsIn(mounted.container).map((field) =>
      field.getAttribute("group"),
    );

    expect(groups[0]).toBeTruthy();
    expect(new Set(groups).size).toBe(1);

    await mounted.unmount();
  });

  it("prefers the option's labels over the host defaults", async () => {
    const mounted = await mountEmbed(
      embed({
        hostedFields: {
          group: "group-1",
          labels: { "routing-number": "ABA number" },
        },
      }),
    );

    const labels = [...mounted.container.querySelectorAll("label")].map(
      (label) => label.textContent,
    );

    expect(labels).toContain("ABA number");
    expect(labels).toContain(DEFAULT_LABELS["account-number"]);
    expect(labels).not.toContain(DEFAULT_LABELS["routing-number"]);

    await mounted.unmount();
  });

  it("forwards placeholders and account type values from the config", async () => {
    const mounted = await mountEmbed(
      embed({
        hostedFields: {
          group: "group-1",
          placeholders: { "account-number": "000123456789" },
          accountTypeValues: ["checking", "savings"],
        },
      }),
    );

    expect(
      fieldIn(mounted.container, "account-number").getAttribute("placeholder"),
    ).toBe("000123456789");
    // Only the account-type field takes the list; the others must not carry it.
    expect(
      fieldIn(mounted.container, "account-type").getAttribute(
        "account-type-values",
      ),
    ).toBe("checking,savings");
    expect(
      fieldIn(mounted.container, "routing-number").hasAttribute(
        "account-type-values",
      ),
    ).toBe(false);

    await mounted.unmount();
  });

  it("forwards the disabled state to every field and to the confirmation", async () => {
    const mounted = await mountEmbed(embed({ disabled: true }));

    for (const field of fieldsIn(mounted.container)) {
      expect(field.disabled).toBe(true);
    }

    // The design system's checkbox is a span with the checkbox role, so being
    // disabled shows up as `aria-disabled`, not the `disabled` property.
    expect(
      ownerConfirmationIn(mounted.container).getAttribute("aria-disabled"),
    ).toBe("true");

    await mounted.unmount();
  });

  // Documents current behaviour rather than endorsing it: `foxy-ach-field`'s
  // `type` setter returns early when the value already matches, and the field
  // defaults to `routing-number`, so React assigning that same value never
  // reaches `setAttribute`. The result is one field out of four with no `type`
  // attribute, which an attribute selector cannot see. Update this test when
  // the reflection is made unconditional; do not delete it.
  it("reflects type to an attribute for every field except the default one", async () => {
    const mounted = await mountEmbed(embed());

    expect(
      fieldIn(mounted.container, "routing-number").hasAttribute("type"),
    ).toBe(false);
    expect(
      fieldIn(mounted.container, "account-number").getAttribute("type"),
    ).toBe("account-number");

    await mounted.unmount();
  });

  // ACH debits need the account owner's authorization, so the embed refuses to
  // tokenize before the shopper confirms — and says why, rather than failing
  // silently.
  it("refuses to tokenize until the owner confirmation is checked", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    stubTokenize(fieldIn(mounted.container, "routing-number"), {
      token: "tok_ach",
    });

    const error = await rejection(() => sink.get().tokenize());

    expect(error.message).toBe(OWNER_CONFIRMATION_ERROR);
    expect(mounted.container.textContent).toContain(OWNER_CONFIRMATION_ERROR);

    await mounted.unmount();
  });

  it("tokenizes through the first mounted field once the owner confirms", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    // The whole group tokenizes through whichever field answers first, so the
    // stub goes on the first one the embed finds.
    stubTokenize(fieldIn(mounted.container, "routing-number"), {
      token: "tok_ach",
      requestId: "req_ach",
    });

    await settled(() => {
      ownerConfirmationIn(mounted.container).click();
    });

    await expect(settled(() => sink.get().tokenize())).resolves.toEqual({
      token: "tok_ach",
      requestId: "req_ach",
    });
    expect(mounted.container.textContent).not.toContain(
      OWNER_CONFIRMATION_ERROR,
    );

    await mounted.unmount();
  });

  it("shows the tokenize error message on a tokenizationerror event and clears it on success", async () => {
    const mounted = await mountEmbed(embed());
    const field = fieldIn(mounted.container, "routing-number");

    await settled(() => {
      field.dispatchEvent(
        new CustomEvent("tokenizationerror", {
          detail: { code: "invalid_routing_number" },
        }),
      );
    });

    expect(mounted.container.textContent).toContain(TOKENIZE_ERROR);

    await settled(() => {
      field.dispatchEvent(new CustomEvent("tokenizationsuccess", {}));
    });

    expect(mounted.container.textContent).not.toContain(TOKENIZE_ERROR);

    await mounted.unmount();
  });

  it("hands the host a controller on mount and clears it on unmount", async () => {
    const sink = controllerSink();
    const mounted = await mountEmbed(
      embed({ onControllerReady: sink.onControllerReady }),
    );

    expect(sink.get().tokenize).toBeTypeOf("function");

    await mounted.unmount();

    expect(sink.latest()).toBeNull();
  });
});
