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
import { Button } from "@foxy.io/design-system/ui/button";
import { Checkbox } from "@foxy.io/design-system/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@foxy.io/design-system/ui/field";
import { Input } from "@foxy.io/design-system/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@foxy.io/design-system/ui/select";

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
) {
  const value = values[field.id] ?? "";
  const fieldDisabled = disabled || Boolean(field.disabled);

  if (field.type === "select") {
    return (
      <Select
        value={value}
        disabled={fieldDisabled}
        onValueChange={(nextValue) => {
          setValues((prev) => ({ ...prev, [field.id]: nextValue ?? "" }));
        }}
      >
        <SelectTrigger id={field.id} className="w-full text-foreground">
          <SelectValue placeholder={intl.formatMessage(selectPlaceholder)} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      id={field.id}
      type={field.type === "tel" ? "tel" : "text"}
      value={value}
      placeholder={field.placeholder}
      disabled={fieldDisabled}
      className="text-foreground"
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
    <FieldSet className="mt-4">
      <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
        {billingAddress.fields.map((field) => {
          const labelDescriptor = fieldLabelById[field.id];
          const label = labelDescriptor
            ? intl.formatMessage(labelDescriptor)
            : field.label;
          const fieldClassName = FULL_WIDTH_BILLING_FIELD_IDS.has(field.id)
            ? "sm:col-span-2"
            : undefined;

          return (
            <Field key={field.id} className={fieldClassName}>
              <FieldLabel htmlFor={field.id}>{label}</FieldLabel>
              {renderBillingField(
                field,
                Boolean(disabled),
                values,
                setValues,
                intl,
                messages.selectPlaceholder,
              )}
            </Field>
          );
        })}
      </FieldGroup>
    </FieldSet>
  );

  const errorMarkup = billingError ? (
    <p className="m-0 text-sm text-destructive">
      {billingError.message ||
        intl.formatMessage(messages.billingAddressUpdateError)}
    </p>
  ) : null;

  if (option.type === "saved-card") {
    if (showSummaryEditor) {
      return (
        <div className="flex flex-col gap-2.5" onBlur={flushBillingAddressReport}>
          {fieldsMarkup}
          {errorMarkup}
        </div>
      );
    }

    const summaryLines = getBillingSummaryLines(values);
    return (
      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => setShowSummaryEditor(true)}
          className="h-auto w-full items-start justify-start px-3 py-3 text-left"
        >
          <span className="flex flex-col gap-1">
            <span className="font-semibold">
              {intl.formatMessage(messages.billingAddressTitle)}
            </span>
            {summaryLines.length ? (
              summaryLines.map((line) => (
                <span key={line} className="text-sm text-muted-foreground">
                  {line}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                {intl.formatMessage(messages.addBillingAddress)}
              </span>
            )}
          </span>
        </Button>
        {errorMarkup}
      </div>
    );
  }

  const hasShippingToggle =
    SHOW_USE_SHIPPING_ADDRESS_CHECKBOX &&
    Boolean(billingAddress.useDefaultShippingAddress);

  return (
    <div className="flex flex-col gap-2.5" onBlur={flushBillingAddressReport}>
      {hasShippingToggle ? (
        <Field orientation="horizontal">
          <Checkbox
            id={`use-shipping-address-${option.id}`}
            checked={useShippingAddress}
            disabled={disabled}
            onCheckedChange={(checked) =>
              setUseShippingAddress(Boolean(checked))
            }
            aria-label={intl.formatMessage(messages.useShippingForBilling)}
          />
          <FieldLabel htmlFor={`use-shipping-address-${option.id}`}>
            {intl.formatMessage(messages.useShippingForBilling)}
          </FieldLabel>
        </Field>
      ) : null}

      {(!hasShippingToggle || !useShippingAddress) && fieldsMarkup}
      {errorMarkup}
    </div>
  );
}
