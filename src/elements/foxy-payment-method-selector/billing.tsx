import type { Dispatch, SetStateAction } from "react";
import type { MessageDescriptor, IntlShape } from "react-intl";
import type {
  PaymentMethodSelectorBillingAddress,
  PaymentMethodSelectorBillingError,
  PaymentMethodSelectorBillingField,
  PaymentMethodSelectorOption,
} from "./types";

import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@foxy.io/design-system/button";
import { Checkbox } from "@foxy.io/design-system/checkbox";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { Select } from "@foxy.io/design-system/select";
import { styled } from "styled-components";

const FullWidthSelectTrigger = styled(Select.Trigger)`
  width: 100%;
`;

const BillingFieldSet = styled(Field.Set)`
  margin-top: ${(props) => props.theme.tokens.space.md};
`;

const BillingFieldGrid = styled(Field.Group)`
  grid-template-columns: 1fr;
  column-gap: ${(props) => props.theme.tokens.space.md};

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const BillingFieldItem = styled(Field.Root)<{ $fullWidth?: boolean }>`
  ${(props) => props.$fullWidth && "grid-column: 1 / -1;"}
`;

const ErrorText = styled.p`
  all: unset;
  display: block;
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  font-size: 0.875rem;
  color: ${(props) => props.theme.tokens.color.error};
`;

const BillingRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space.sm};
`;

const SummaryButtonBody = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space.xs};
  text-align: left;
`;

const SummaryButtonTitle = styled.span`
  font-weight: 600;
`;

const SummaryButtonLine = styled.span`
  font: ${(props) => props.theme.tokens.font.body};
  font-size: 0.875rem;
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const SummaryButton = styled(Button)`
  height: auto;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  padding: ${(props) => props.theme.tokens.space.sm} ${(props) => props.theme.tokens.space.md};
  background: transparent;
  color: ${(props) => props.theme.tokens.color.body};
  border: ${(props) => props.theme.tokens.border.field};

  &:hover {
    background: ${(props) => props.theme.tokens.background.disabledField};
  }
`;

// Field.Root's own base styles are \`display: grid\` (label stacked above
// control). This section only ever needs the old shadcn Field's
// \`orientation="horizontal"\` layout (checkbox beside its label), which the
// new Field.Root has no equivalent prop for, so it's baked in here instead
// (same gap the design system already found for foxy-payment-method-selector's
// own view.tsx OptionField, see the comment there).
const ShippingToggleField = styled(Field.Root)`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.tokens.space.sm};
`;

const BILLING_ADDRESS_SUPPORTED_TYPES = new Set([
  "new-card",
  "saved-card",
  "stripe-card-element",
  "stripe-payment-element",
]);

const FULL_WIDTH_BILLING_FIELD_IDS = new Set([
  "billing-address1",
  "billing-address2",
]);

// How long to wait after the last edit before reporting billing-address
// changes upstream (and thus hitting the API) — avoids a network call per
// keystroke. Flushed early on blur so a field is never left unsent.
const BILLING_ADDRESS_REPORT_DEBOUNCE_MS = 500;

// TEMPORARY: the backend's use_different_addresses handling is broken (it
// gets forced back to false for carts with no shippable products, and the
// toggle's persisted value isn't reliable), so the "use shipping address
// for billing" checkbox doesn't actually do anything trustworthy server
// side right now. Hiding it and always collecting the full billing form
// until that's fixed. Revert by flipping this back to true.
const SHOW_USE_SHIPPING_ADDRESS_CHECKBOX = false;

function getBillingAddressSignature(
  billingAddress: PaymentMethodSelectorBillingAddress | undefined,
): string {
  return JSON.stringify(billingAddress ?? null);
}

type BillingSectionMessages = {
  billingAddressTitle: MessageDescriptor;
  addBillingAddress: MessageDescriptor;
  useShippingForBilling: MessageDescriptor;
  selectPlaceholder: MessageDescriptor;
  billingAddressUpdateError: MessageDescriptor;
};

function buildInitialBillingValues(
  billingAddress: PaymentMethodSelectorBillingAddress | undefined,
) {
  return Object.fromEntries(
    (billingAddress?.fields ?? []).map((field) => [
      field.id,
      field.value ?? "",
    ]),
  );
}

function getBillingSummaryLines(values: Record<string, string>) {
  const name = [values["billing-first-name"], values["billing-last-name"]]
    .filter(Boolean)
    .join(" ");
  const company = values["billing-company"];
  const address1 = values["billing-address1"];
  const address2 = values["billing-address2"];
  const cityLine = [
    values["billing-city"],
    values["billing-region"],
    values["billing-postal-code"],
    values["billing-country"],
  ]
    .filter(Boolean)
    .join(", ");
  const phone = values["billing-phone"];

  return [name, company, address1, address2, cityLine, phone].filter(Boolean);
}

function renderBillingField(
  field: PaymentMethodSelectorBillingField,
  disabled: boolean,
  values: Record<string, string>,
  setValues: Dispatch<SetStateAction<Record<string, string>>>,
  intl: IntlShape,
  selectPlaceholder: MessageDescriptor,
  portalContainer: ShadowRoot,
) {
  const value = values[field.id] ?? "";
  const fieldDisabled = disabled || Boolean(field.disabled);

  if (field.type === "select") {
    return (
      <Select.Root
        value={value}
        disabled={fieldDisabled}
        onValueChange={(nextValue) => {
          setValues((prev) => ({ ...prev, [field.id]: nextValue ?? "" }));
        }}
      >
        <FullWidthSelectTrigger id={field.id}>
          <Select.Value placeholder={intl.formatMessage(selectPlaceholder)} />
          <Select.Icon>
            <ChevronDown size="1rem" />
          </Select.Icon>
        </FullWidthSelectTrigger>
        <Select.Portal container={portalContainer}>
          <Select.Positioner>
            <Select.Popup>
              <Select.List>
                <Select.Group>
                  {(field.options ?? []).map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      <Select.ItemText>{option.label}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check size="1rem" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    );
  }

  return (
    <Input
      id={field.id}
      type={field.type === "tel" ? "tel" : "text"}
      value={value}
      placeholder={field.placeholder}
      disabled={fieldDisabled}
      required={field.required}
      onChange={(event) => {
        const nextValue = event.target.value;
        setValues((prev) => ({ ...prev, [field.id]: nextValue }));
      }}
    />
  );
}

export function BillingAddressSection({
  option,
  disabled,
  billingAddress,
  billingError,
  onBillingAddressChange,
  fieldLabelById,
  messages,
  portalContainer,
}: {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  billingAddress?: PaymentMethodSelectorBillingAddress;
  billingError?: PaymentMethodSelectorBillingError;
  onBillingAddressChange?: (params: {
    optionId: string;
    useShippingAddress: boolean;
    values: Record<string, string>;
  }) => void;
  fieldLabelById: Partial<Record<string, MessageDescriptor>>;
  messages: BillingSectionMessages;
  portalContainer: ShadowRoot;
}) {
  const intl = useIntl();
  const [useShippingAddress, setUseShippingAddress] = useState(
    billingAddress?.useDefaultShippingAddress === "yes-by-default",
  );
  const [showSummaryEditor, setShowSummaryEditor] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialBillingValues(billingAddress),
  );
  const onBillingAddressChangeRef = useRef(onBillingAddressChange);
  const lastReportedChangeRef = useRef<string | null>(null);
  const reportTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingReportRef = useRef<{
    optionId: string;
    useShippingAddress: boolean;
    values: Record<string, string>;
  } | null>(null);
  onBillingAddressChangeRef.current = onBillingAddressChange;
  const billingAddressSignature = getBillingAddressSignature(billingAddress);

  function flushBillingAddressReport() {
    if (reportTimeoutRef.current) {
      clearTimeout(reportTimeoutRef.current);
      reportTimeoutRef.current = null;
    }

    const pending = pendingReportRef.current;
    if (!pending) return;
    pendingReportRef.current = null;

    const nextChangeSignature = JSON.stringify(pending);
    if (lastReportedChangeRef.current === nextChangeSignature) {
      return;
    }

    lastReportedChangeRef.current = nextChangeSignature;
    onBillingAddressChangeRef.current?.(pending);
  }

  const supportsBillingAddress = option.type
    ? BILLING_ADDRESS_SUPPORTED_TYPES.has(option.type)
    : false;

  const prevOptionIdRef = useRef(option.id);
  const hasBillingAddressDataRef = useRef(Boolean(billingAddress?.fields.length));

  useEffect(() => {
    const optionChanged = prevOptionIdRef.current !== option.id;
    const hasBillingAddressDataNow = Boolean(billingAddress?.fields.length);
    const becameAvailable =
      hasBillingAddressDataNow && !hasBillingAddressDataRef.current;

    prevOptionIdRef.current = option.id;
    hasBillingAddressDataRef.current = hasBillingAddressDataNow;

    // Reset local form state only when switching payment options, or the
    // first time real billing-address data arrives for this option (e.g.
    // once hydration completes post-mount). Later billingAddress changes
    // are usually echoes of this component's own in-flight edits (see
    // #diffBillingAddressPatch in element.tsx) — resetting on those would
    // clobber whatever the shopper is mid-typing with a stale snapshot.
    if (!optionChanged && !becameAvailable) return;

    if (reportTimeoutRef.current) {
      clearTimeout(reportTimeoutRef.current);
      reportTimeoutRef.current = null;
    }
    pendingReportRef.current = null;

    setUseShippingAddress(
      billingAddress?.useDefaultShippingAddress === "yes-by-default",
    );
    setShowSummaryEditor(false);
    setValues(buildInitialBillingValues(billingAddress));
    lastReportedChangeRef.current = null;
  }, [billingAddress, option.id]);

  useEffect(() => {
    if (!supportsBillingAddress || !billingAddress) return;

    pendingReportRef.current = { optionId: option.id, useShippingAddress, values };

    if (reportTimeoutRef.current) {
      clearTimeout(reportTimeoutRef.current);
    }
    reportTimeoutRef.current = setTimeout(
      flushBillingAddressReport,
      BILLING_ADDRESS_REPORT_DEBOUNCE_MS,
    );

    return () => {
      if (reportTimeoutRef.current) {
        clearTimeout(reportTimeoutRef.current);
        reportTimeoutRef.current = null;
      }
    };
  }, [
    billingAddressSignature,
    option.id,
    supportsBillingAddress,
    useShippingAddress,
    values,
  ]);

  if (
    !billingAddress ||
    !supportsBillingAddress ||
    !billingAddress.fields.length
  ) {
    return null;
  }

  const fieldsMarkup = (
    <BillingFieldSet>
      <BillingFieldGrid>
        {billingAddress.fields.map((field) => {
          const labelDescriptor = fieldLabelById[field.id];
          const label = labelDescriptor
            ? intl.formatMessage(labelDescriptor)
            : field.label;
          const isFullWidth = FULL_WIDTH_BILLING_FIELD_IDS.has(field.id);

          return (
            <BillingFieldItem key={field.id} $fullWidth={isFullWidth}>
              <Field.Label htmlFor={field.id}>{label}</Field.Label>
              {renderBillingField(
                field,
                Boolean(disabled),
                values,
                setValues,
                intl,
                messages.selectPlaceholder,
                portalContainer,
              )}
            </BillingFieldItem>
          );
        })}
      </BillingFieldGrid>
    </BillingFieldSet>
  );

  const errorMarkup = billingError ? (
    <ErrorText>
      {billingError.message ||
        intl.formatMessage(messages.billingAddressUpdateError)}
    </ErrorText>
  ) : null;

  if (option.type === "saved-card") {
    if (showSummaryEditor) {
      return (
        <BillingRoot onBlur={flushBillingAddressReport}>
          {fieldsMarkup}
          {errorMarkup}
        </BillingRoot>
      );
    }

    const summaryLines = getBillingSummaryLines(values);
    return (
      <BillingRoot>
        <SummaryButton
          type="button"
          disabled={disabled}
          onClick={() => setShowSummaryEditor(true)}
        >
          <SummaryButtonBody>
            <SummaryButtonTitle>
              {intl.formatMessage(messages.billingAddressTitle)}
            </SummaryButtonTitle>
            {summaryLines.length ? (
              summaryLines.map((line) => (
                <SummaryButtonLine key={line}>{line}</SummaryButtonLine>
              ))
            ) : (
              <SummaryButtonLine>
                {intl.formatMessage(messages.addBillingAddress)}
              </SummaryButtonLine>
            )}
          </SummaryButtonBody>
        </SummaryButton>
        {errorMarkup}
      </BillingRoot>
    );
  }

  const hasShippingToggle =
    SHOW_USE_SHIPPING_ADDRESS_CHECKBOX &&
    Boolean(billingAddress.useDefaultShippingAddress);

  return (
    <BillingRoot onBlur={flushBillingAddressReport}>
      {hasShippingToggle ? (
        <ShippingToggleField>
          <Checkbox.Root
            id={`use-shipping-address-${option.id}`}
            checked={useShippingAddress}
            disabled={disabled}
            onCheckedChange={(checked) =>
              setUseShippingAddress(Boolean(checked))
            }
            aria-label={intl.formatMessage(messages.useShippingForBilling)}
          >
            <Checkbox.Indicator />
          </Checkbox.Root>
          <Field.Label htmlFor={`use-shipping-address-${option.id}`}>
            {intl.formatMessage(messages.useShippingForBilling)}
          </Field.Label>
        </ShippingToggleField>
      ) : null}

      {(!hasShippingToggle || !useShippingAddress) && fieldsMarkup}
      {errorMarkup}
    </BillingRoot>
  );
}
